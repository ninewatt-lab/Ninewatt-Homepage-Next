"""DXF 평면 → Lab v2 트윈 데이터 자동 생성 (사람 손 모델링 없이).

    python3 scripts/lab/auto_twin.py <building.json> <source.dxf> <out_dir>

사람이 정하는 것은 building.json 의 몇 줄뿐이다 — 층별 평면 시트 범위(box), 벽 · 개구부 · 기준선 레이어 이름,
단면도에서 읽은 높이(천장 · 층고 · 파라펫 · 창대 · 창 머리 · 문, 층마다 다르면 층에 따로). 나머지는 도면 선에서 계산한다.

  0. 층 맞추기: 층마다 평면 시트가 도면의 다른 자리에 있으므로, 기준선(grid 레이어의 긴 가로 · 세로선) 위치가
     1층과 가장 많이 겹치는 이동량을 찾아 위층을 1층 좌표에 놓는다

  1. 실: 벽 · 개구부 선을 얇게 두껍게 해 합친 뒤 닫힌 구멍(폭 0.6 m 이상) = 실.
     closeGaps(m)를 주면 그 폭보다 좁은 벽 틈(열림 호 없이 그린 문 자리)을 메우고 그 자리를 문으로 본다
  2. 벽체: 건물 외곽(합친 선의 바깥 테두리)에서 실을 뺀 나머지 = 벽 · 기둥
  3. 개구부: 개구부 레이어 선을 이어진 묶음별로 모아 벽체와 겹치는 부분. 열림 호(ARC)가 있으면 문
  4. 외벽: 외곽선 변마다 안쪽 0.7 m 띠와 벽체가 겹치는 부분, 변의 바깥 방향으로 북 · 동 · 남 · 서를 정한다(도면 위쪽 = 북)
  5. 3D: 벽은 개구부를 뺀 부분을 바닥~위까지, 개구부 자리는 창대 아래 · 창 머리 위만 세운다. 외벽 창에는 유리 · 틀 · 창대
  6. 지붕: 맨 위 층은 평지붕, 아래층에서 위층이 덮지 않는 부분은 그 층 지붕(kind slab, 위층 바닥 높이)

출력(out_dir): model.glb(노드 이름 · extras 는 v1 모델과 같은 규칙 — VIS_F1_SouthA, VIS_F1_SouthA_0_Glass …),
viewer.json(실 경계 · 면적), twin.json(도면 선), env.json(EnergyPlus 입력: 층 · 방위별 외벽 면적 · 창), meta.json(규모 · 통계).
좌표는 모델 좌표 m(x 동쪽 · y 북쪽, 원점 = 1층 외곽 왼쪽 아래). 글자(TEXT · MTEXT · 치수 글자)는 실 이름 찾기에만 쓰고 출력하지 않는다.
"""
import json
import math
import os
import struct
import sys

import ezdxf
import numpy as np
import trimesh
from ezdxf import bbox, disassemble
from shapely.affinity import scale, translate
from shapely.geometry import LineString, MultiPolygon, Point, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from shapely.validation import make_valid

CFG = json.load(open(sys.argv[1]))
DXF, OUT = sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
UNIT = CFG.get("unit", 0.001)
BUF = 0.06  # m. 벽선 사이 작은 틈을 메우는 폭 (dxf_plan_figures.py 와 같다)
H = CFG["heights"]

doc = ezdxf.readfile(DXF)
msp = doc.modelspace()
ENTS = list(msp)  # 같은 엔티티 객체를 계속 쓰도록 (범위 캐시 키)


# ── 도면 읽기 ──────────────────────────────────────────────────────

_extents = {}


def extents(e):
    """엔티티 범위 (x0, y0, x1, y1) — 큰 도면은 여러 번 훑으므로 한 번만 계산한다"""
    k = id(e)
    if k not in _extents:
        try:
            b = bbox.extents([e], fast=True)
            _extents[k] = (b.extmin.x, b.extmin.y, b.extmax.x, b.extmax.y) if b.has_data else None
        except Exception:
            _extents[k] = None
    return _extents[k]


def primitives(box, layers, off=(0.0, 0.0)):
    """box 안 · layers 의 선 → [(layer, 점 목록(m, box 왼쪽 아래 기준 + 층 맞춤 이동 off), 원 엔티티 종류)]"""
    x0, y0, x1, y1 = box

    def within(e):
        b = extents(e)
        return b is not None and b[0] >= x0 and b[2] <= x1 and b[1] >= y0 and b[3] <= y1

    ents = [e for e in ENTS if e.dxf.layer in layers and within(e)]
    out = []
    for prim in disassemble.to_primitives(disassemble.recursive_decompose(ents)):
        ent = prim.entity
        if ent is None or ent.dxftype() in ("TEXT", "MTEXT", "ATTRIB", "ATTDEF", "HATCH", "SOLID"):
            continue
        try:
            pts = list(prim.vertices()) if prim.path is None else list(prim.path.flattening(5))
        except Exception:
            continue
        if len(pts) < 2:
            continue
        q = [((p.x - x0) * UNIT + off[0], (p.y - y0) * UNIT + off[1]) for p in pts]
        # 호 · 원 · 볼록(bulge) 폴리라인처럼 휜 선은 "ARC" 로 본다 (문 열림 호)
        kind = "ARC" if ent.dxftype() in ("ARC", "CIRCLE", "ELLIPSE") or curved(q) else ent.dxftype()
        out.append((ent.dxf.layer, q, kind))
    return out


def circumcenter(a, b, c):
    ax, ay = a
    bx, by = b
    cx, cy = c
    d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if abs(d) < 1e-9:
        return None
    ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
    uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
    return (ux, uy)


def curved(q):
    """휜 선: 작은 각도(1~35°)로 3번 넘게 잇달아 꺾이면 호를 잘게 나눈 선이다. 기둥 같은 닫힌 사각형(90° 꺾임)은 아니다"""
    run = best = 0
    for (ax, ay), (bx, by), (cx, cy) in zip(q, q[1:], q[2:]):
        u, v = (bx - ax, by - ay), (cx - bx, cy - by)
        lu, lv = math.hypot(*u), math.hypot(*v)
        if lu < 1e-6 or lv < 1e-6:
            continue
        turn = math.degrees(math.acos(max(-1.0, min(1.0, (u[0] * v[0] + u[1] * v[1]) / (lu * lv)))))
        run = run + 1 if 1 <= turn <= 35 else 0
        best = max(best, run)
    return best >= 3


def texts(box, off=(0.0, 0.0)):
    x0, y0, x1, y1 = box
    for e in msp.query("TEXT MTEXT"):
        p = e.dxf.insert
        if x0 <= p[0] <= x1 and y0 <= p[1] <= y1:
            t = e.dxf.text if e.dxftype() == "TEXT" else e.plain_text()
            yield ((p[0] - x0) * UNIT + off[0], (p[1] - y0) * UNIT + off[1]), t.replace(" ", "").strip(), e.dxf.layer


def grid_lines(box):
    """기준선: grid 레이어의 긴(5 m 이상) 세로선 x · 가로선 y (m, box 기준)"""
    xs, ys = [], []
    for _, q, _ in primitives(box, set(CFG["layers"].get("grid", []))):
        (ax, ay), (bx, by) = q[0], q[-1]
        if abs(ax - bx) < 0.01 and abs(ay - by) > 5:
            xs.append(ax)
        elif abs(ay - by) < 0.01 and abs(ax - bx) > 5:
            ys.append(ay)
    return xs, ys


def best_shift(ref, mine):
    """mine 을 d 만큼 옮겼을 때 ref 와 2 cm 안에서 겹치는 선이 가장 많은 d (겹치는 수)"""
    best = (0, 0.0)
    for a in ref:
        for b in mine:
            d = a - b
            n = sum(any(abs(m + d - r) < 0.02 for r in ref) for m in set(round(v, 3) for v in mine))
            if n > best[0] or (n == best[0] and abs(d) < abs(best[1])):
                best = (n, d)
    return best[1], best[0]


def register(floors):
    """층마다 1층 기준선에 맞추는 이동량(m). 기준선이 2개 미만으로 겹치면 이동하지 않는다(경고)"""
    if not CFG["layers"].get("grid"):
        return [(0.0, 0.0)] * len(floors)
    ref = grid_lines(floors[0]["box"])
    out = [(0.0, 0.0)]
    for fl in floors[1:]:
        mine = grid_lines(fl["box"])
        dx, nx = best_shift(ref[0], mine[0])
        dy, ny = best_shift(ref[1], mine[1])
        if nx < 2 or ny < 2:
            print(f"warning: {fl['key']} 기준선이 충분히 겹치지 않음 (x {nx}, y {ny}) — 이동 없이 둔다")
            dx, dy = 0.0, 0.0
        print(f"register {fl['key']}: dx {dx:+.3f} m · dy {dy:+.3f} m (기준선 x {nx} · y {ny}개 일치)")
        out.append((dx, dy))
    return out


# ── 평면 → 실 · 벽체 · 개구부 ─────────────────────────────────────

def wall_gaps(merged, width):
    """같은 줄의 벽 끝 사이 width 보다 좁은 틈 (가로 · 세로로 따로 넓혔다 줄인다 — 한 방향만 넓히면
    모서리가 메워지지 않아 틈 조각이 벽 두께 직사각형으로 깔끔하게 나온다). 길이 0.5 m~ · 두께 0.08~0.45 m 만"""
    out = []
    for sx, sy in ((1, 1000), (1000, 1)):
        st = scale(merged, sx, sy, origin=(0, 0))
        back = scale(st.buffer(width / 2, join_style=2).buffer(-width / 2, join_style=2), 1 / sx, 1 / sy, origin=(0, 0))
        for g in polys(back.difference(merged).buffer(-0.01, join_style=2).buffer(0.01, join_style=2)):
            x0, y0, x1, y1 = g.bounds
            along, across = (x1 - x0, y1 - y0) if sy > 1 else (y1 - y0, x1 - x0)
            if 0.5 <= along <= width + 0.05 and 0.08 <= across <= 0.45 and g.area >= 0.7 * along * across:
                out.append(g)
    return out


def analyse(fl):
    L = CFG["layers"]
    prims = primitives(fl["box"], set(L["wall"]) | set(L["opening"]), fl["_off"])
    # 문 열림 호는 건물 밖 · 실 안으로 나가 있어 외곽 · 실 경계에는 쓰지 않는다
    lines = [LineString(p) for _, p, kind in prims if kind != "ARC"]
    # 문 자리는 문짝으로 막는다: 경첩(호 중심)에서 호 양 끝으로 — 닫힌 쪽이 문 자리를 막고,
    # 열린 쪽은 바깥이면 얇은 돌출이라 아래에서 깎이고, 안쪽이면 떠 있는 선이라 실을 나누지 않는다
    for _, p, kind in prims:
        if kind != "ARC" or len(p) < 3:
            continue
        c = circumcenter(p[0], p[len(p) // 2], p[-1])
        # 문짝 폭(반지름 0.4~2.2 m)인 호만 — 위생기구 곡선처럼 거의 곧은 선은 중심이 아주 멀리 잡힌다
        if c is not None and 0.4 <= math.dist(c, p[0]) <= 2.2:
            lines += [LineString([c, p[0]]), LineString([c, p[-1]])]
    merged = unary_union(lines).buffer(BUF, join_style=2)
    # 열림 호 없이 그린 문 자리: 두 번에 걸쳐 벽 틈을 메운다.
    #   1) 30 cm 미만 틈 — 벽 끝이 덜 닿게 그려진 곳, 문 없이 메운다 (뾰족 모서리로 넓혔다 줄여 실 모서리는 그대로)
    #   2) 같은 줄의 벽 끝 사이 closeGaps 미만 틈 — 메우고 그 자리를 문으로 본다
    gaps = []
    G = CFG.get("closeGaps", 0)
    if G:
        merged = merged.buffer(0.15, join_style=2).buffer(-0.15, join_style=2)
        gaps = wall_gaps(merged, G)
        if gaps:
            merged = unary_union([merged, *[g.buffer(0.02, join_style=2) for g in gaps]])
    body = max(merged.geoms, key=lambda g: g.area) if isinstance(merged, MultiPolygon) else merged
    # 바깥으로 삐져나온 문짝 선 같은 얇은 돌출(폭 0.3 m 미만)은 깎아 낸다
    # 바깥 테두리가 한 점에서 스스로 닿으면(문 자리를 메운 조각이 벽과 꼭짓점으로 만날 때) 고쳐서 채운다
    footprint = unary_union(polys(make_valid(Polygon(body.exterior))))
    footprint = footprint.buffer(-BUF, join_style=2).buffer(-0.15, join_style=2).buffer(0.15, join_style=2)
    # 깎다가 떨어져 나간 조각(얇은 다리로 붙어 있던 부분)이 있으면 가장 큰 덩어리만
    footprint = max(polys(footprint), key=lambda g: g.area)
    rooms = []
    for ring in body.interiors:
        hole = Polygon(ring)
        r = hole.buffer(BUF, join_style=2)
        mrr = r.minimum_rotated_rectangle
        xs, ys = mrr.exterior.coords.xy
        sides = sorted(math.dist((xs[i], ys[i]), (xs[i + 1], ys[i + 1])) for i in range(2))
        # 벽 두 줄 사이 틈(폭 0.6 m 미만)은 벽체
        if r.area >= 1.5 and sides[0] >= 0.6:
            rooms.append(r)
    # 외곽으로 자른 실이 여러 조각이면 가장 큰 조각만
    rooms = [max(polys(r.intersection(footprint)), key=lambda g: g.area) for r in rooms if polys(r.intersection(footprint))]
    walls = footprint.difference(unary_union(rooms)).buffer(0)

    # 개구부: 이어진 선 묶음
    op = [(LineString(p), kind) for layer, p, kind in prims if layer in L["opening"]]
    clusters = unary_union([g for g, _ in op]).buffer(0.05)
    clusters = list(clusters.geoms) if isinstance(clusters, MultiPolygon) else [clusters]
    openings = []
    edge = footprint.exterior.buffer(0.15, join_style=2).intersection(footprint)
    for g in gaps:
        region = g.buffer(0.02, join_style=2).intersection(walls).buffer(0)
        if region.area > 0.03:
            openings.append({"poly": region, "door": True, "ext": region.distance(footprint.exterior) < 0.06})
    for c in clusters:
        # 틈으로 이미 잡은 문은 다시 세지 않는다
        if any(c.intersects(g) for g in gaps):
            continue
        arcs = any(k == "ARC" and c.intersects(g) for g, k in op)
        region = c.minimum_rotated_rectangle.buffer(0.03, join_style=2).intersection(walls).buffer(0)
        # 벽 없이 외곽에 걸친 문(현관 · 양개문): 외곽선을 따라 0.15 m 띠를 벽으로 세우고 그 자리를 문으로
        if arcs and region.area < 0.03 and c.distance(footprint.exterior) < 0.3:
            strip = edge.intersection(c.minimum_rotated_rectangle.buffer(0.1, join_style=2)).buffer(0)
            if strip.area > 0.05:
                walls = walls.union(strip).buffer(0)
                region = strip
        if region.area < 0.03:
            continue
        mrr = region.minimum_rotated_rectangle
        xs, ys = mrr.exterior.coords.xy
        sides = [math.dist((xs[i], ys[i]), (xs[i + 1], ys[i + 1])) for i in range(2)]
        if max(sides) < 0.4:
            continue
        exterior = region.distance(footprint.exterior) < 0.06
        openings.append({"poly": region, "door": arcs, "ext": exterior})
    return footprint, rooms, walls, openings


# ── 외벽을 변(방위)별로 나누기 ────────────────────────────────────

def edges(footprint):
    """외곽 변 — 같은 방향으로 이어지는 짧은 변은 하나로 합친다"""
    ring = list(orient(footprint.simplify(0.1), 1.0).exterior.coords)  # 반시계 → 바깥 법선 = (dy, -dx)
    out = []
    for a, b in zip(ring, ring[1:]):
        if math.dist(a, b) < 0.05:
            continue
        if out:
            pa, pb = out[-1]
            d1 = math.atan2(pb[1] - pa[1], pb[0] - pa[0])
            d2 = math.atan2(b[1] - a[1], b[0] - a[0])
            if abs((d1 - d2 + math.pi) % (2 * math.pi) - math.pi) < math.radians(8):
                out[-1] = (pa, b)
                continue
        out.append((a, b))
    return out


def split_exterior(footprint, walls):
    pieces, taken = [], Polygon()
    count = {}
    for (ax, ay), (bx, by) in edges(footprint):
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy)
        if length < 0.2:
            continue
        nx, ny = dy / length, -dx / length
        band = Polygon([(ax, ay), (bx, by), (bx - nx * 0.7, by - ny * 0.7), (ax - nx * 0.7, ay - ny * 0.7)])
        part = walls.intersection(band).difference(taken).buffer(0)
        if part.area < 0.05:
            continue
        taken = taken.union(part)
        side = ("East" if nx > 0 else "West") if abs(nx) > abs(ny) else ("North" if ny > 0 else "South")
        i = count.get(side, 0)
        count[side] = i + 1
        pieces.append({"name": side + letters(i), "side": side[0], "poly": part, "length": length})
    interior = walls.difference(taken).buffer(0)
    return pieces, interior


def room_name(t):
    """실 이름처럼 보이는 글자: 한글이 들어간 짧은 글자, 치수 · 면적 · 재료 표기(THK · ㎡ · : …)는 뺀다"""
    import re

    return 1 < len(t) <= 8 and re.search(r"[가-힣]", t) and not re.search(r"THK|㎡|m2|[:=@x×]|^\d", t)


def letters(i):
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


# ── 3D ─────────────────────────────────────────────────────────────

def polys(g):
    if g.is_empty:
        return []
    return [p for p in (g.geoms if hasattr(g, "geoms") else [g]) if isinstance(p, Polygon) and p.area > 1e-4]


def extrude(g, z0, z1):
    """모델 좌표 다각형 → three 좌표(x, 높이, -y) 메시 (높이 0 이면 없음 — 창 머리가 천장과 같은 층)"""
    out = []
    if z1 - z0 < 1e-3:
        return out
    for p in polys(g):
        m = trimesh.creation.extrude_polygon(p, z1 - z0)
        v = m.vertices.copy()
        m.vertices = np.column_stack([v[:, 0], v[:, 2] + z0, -v[:, 1]])
        out.append(m)
    return out


def box_mesh(cx, cy, z0, z1, along, across, angle):
    """평면 중심(cx, cy) · 길이 방향 각도의 상자"""
    m = trimesh.creation.box(extents=[along, z1 - z0, across])
    m.apply_transform(trimesh.transformations.rotation_matrix(angle, [0, 1, 0]))
    m.apply_translation([cx, (z0 + z1) / 2, -cy])
    return m


def axis(poly):
    """다각형의 긴 방향: 중심, 길이, 폭, 각도(three 의 y 축 회전)"""
    mrr = poly.minimum_rotated_rectangle
    xs, ys = mrr.exterior.coords.xy
    e = [(xs[i + 1] - xs[i], ys[i + 1] - ys[i]) for i in range(2)]
    la, lb = (math.hypot(*e[0]), math.hypot(*e[1]))
    d = e[0] if la >= lb else e[1]
    c = mrr.centroid
    # three 좌표에서 모델 y 는 -z 라서 각도 부호가 바뀐다
    return c.x, c.y, max(la, lb), min(la, lb), math.atan2(d[1], d[0])


def qa_plot(path, footprint, rooms, pieces, interior, openings):
    """검수용 평면 그림: 실(초록) · 외벽 방위별 색 · 내벽(회색) · 창(파랑) · 문(빨강)"""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(14, 10))
    fill = lambda g, **kw: [ax.fill(*p.exterior.xy, **kw) for p in polys(g)]  # noqa: E731
    fill(footprint, color="#f2f2f2")
    for r in rooms:
        fill(r, color="#cfe8cf")
    colors = {"N": "#4c78a8", "E": "#f58518", "S": "#e45756", "W": "#72b7b2"}
    for p in pieces:
        fill(p["poly"], color=colors[p["side"]], alpha=0.85)
    fill(interior, color="#888888")
    for o in openings:
        fill(o["poly"], color="red" if o["door"] else "blue", alpha=0.9 if o["ext"] else 0.35)
    ax.set_aspect("equal")
    ax.set_title(f"rooms {len(rooms)} · ext pieces {len(pieces)} · openings {len(openings)} (ext {sum(o['ext'] for o in openings)})")
    fig.savefig(path, dpi=110)
    plt.close(fig)


nodes = []  # (name, kind, floor, trimesh)


def add(name, kind, floor, meshes):
    meshes = [m for m in meshes if m is not None and len(m.faces)]
    if meshes:
        nodes.append((name, kind, floor, trimesh.util.concatenate(meshes)))


meta = {"floors": [], "rooms": 0, "walls": 0, "windows": 0}
env = {"walls": {}, "openings": [], "zones": [], "window": {"sill": H["sill"], "head": H["head"]}}
viewer_rooms = []
FLOORS = CFG["floors"]
for fl, off in zip(FLOORS, register(FLOORS)):
    fl["_off"] = off
plans = [analyse(fl) for fl in FLOORS]
origin = plans[0][0].bounds[:2]
shift = lambda g: translate(g, -origin[0], -origin[1])  # noqa: E731
# clipToGround: 위층을 1층 외곽(+0.3 m) 안으로 자른다 — 위층 평면에 함께 그린 외부 계단 · 발코니를 건물로 보지 않는다
ground = plans[0][0].buffer(0.3, join_style=2) if CFG.get("clipToGround") else None
for fi, (fl, (footprint, rooms, walls, openings)) in enumerate(zip(FLOORS, plans)):
    if ground is not None and fi > 0:
        footprint = max(polys(footprint.intersection(ground)), key=lambda g: g.area)
        # 잘린 변(외부 계단으로 열려 있던 자리)에도 외벽이 서도록 외곽을 따라 0.2 m 띠를 벽으로 둔다
        band = footprint.difference(footprint.buffer(-0.2, join_style=2))
        rooms = [r2 for r in rooms for r2 in polys(r.intersection(footprint).difference(band)) if r2.area >= 1.5]
        walls = unary_union([walls.intersection(footprint), band]).buffer(0)
        openings = [o for o in openings if o["poly"].intersects(footprint)]
        for o in openings:
            o["poly"] = o["poly"].intersection(footprint)
            o["ext"] = o["ext"] or o["poly"].distance(footprint.exterior) < 0.06
    fl["_plan"] = (shift(footprint), [shift(r) for r in rooms], shift(walls), openings)
    for o in openings:
        o["poly"] = shift(o["poly"])

for fi, fl in enumerate(FLOORS):
    footprint, rooms, walls, openings = fl["_plan"]
    Hf = {**H, **fl.get("heights", {})}
    top = fi == len(FLOORS) - 1
    upper = None if top else FLOORS[fi + 1]
    z = fl["z"]
    F = fl["zone"]  # F1, F2 …
    key = fl["key"]
    top_ext = Hf["parapet"] if top else upper["z"] - z
    top_int = Hf["ceiling"]

    pieces, interior = split_exterior(footprint, walls)
    if os.environ.get("QA_PNG"):
        qa_plot(os.environ["QA_PNG"].replace(".png", f"-{key}.png"), footprint, rooms, pieces, interior, openings)
    for piece in pieces:
        mine = [o for o in openings if o["poly"].intersection(piece["poly"]).area > 0.02]
        piece["openings"] = mine
        solid = piece["poly"].difference(unary_union([o["poly"] for o in mine])) if mine else piece["poly"]
        parts = extrude(solid, z, z + top_ext)
        for o in mine:
            reg = o["poly"].intersection(piece["poly"])
            sill = 0 if o["door"] else Hf["sill"]
            head = Hf["door"] if o["door"] else Hf["head"]
            if sill > 0:
                parts += extrude(reg, z, z + sill)
            parts += extrude(reg, z + head, z + top_ext)
        add(f"VIS_{F}_{piece['name']}", "wall", key, parts)
        # 외벽 개구부: 유리 · 틀 · 창대 (문은 유리문으로 본다)
        for k, o in enumerate(mine):
            cx, cy, along, across, ang = axis(o["poly"].intersection(piece["poly"]))
            sill = 0 if o["door"] else Hf["sill"]
            head = Hf["door"] if o["door"] else Hf["head"]
            base = f"VIS_{F}_{piece['name']}_{k}"
            add(f"{base}_Glass", "glass", key, [box_mesh(cx, cy, z + sill + 0.05, z + head - 0.05, along - 0.1, 0.024, ang)])
            t = 0.05
            frame = [
                box_mesh(cx, cy, z + sill, z + sill + t, along, 0.07, ang),
                box_mesh(cx, cy, z + head - t, z + head, along, 0.07, ang),
            ]
            for s in (-1, 1):
                off = (along / 2 - t / 2) * s
                frame.append(box_mesh(cx + math.cos(ang) * off, cy + math.sin(ang) * off, z + sill, z + head, t, 0.07, ang))
            add(f"{base}_Frame", "frame", key, frame)
            if sill > 0:
                add(f"{base}_SillStone", "sill", key, [box_mesh(cx, cy, z + sill - 0.03, z + sill, along, across + 0.06, ang)])
            area = (along - 0.1) * (head - sill)
            env["openings"].append({"id": base.replace("VIS_", ""), "floor": F, "ext": piece["side"], "area": round(area, 3)})
            meta["windows"] += 1
        # 방위별 외벽 순면적 (외곽 변 길이 × 층고 − 창)
        wkey = f"{F}_{piece['side']}"
        gross = piece["length"] * (Hf["floor"] if top else top_ext)
        env["walls"][wkey] = round(env["walls"].get(wkey, 0) + gross - sum(o2["area"] for o2 in env["openings"] if o2["id"].startswith(f"{F}_{piece['name']}_")), 2)
        meta["walls"] += 1

    # 내벽 · 실내 문
    for i, p in enumerate(polys(interior)):
        mine = [o for o in openings if not o["ext"] and o["poly"].intersection(p).area > 0.02]
        solid = p.difference(unary_union([o["poly"] for o in mine])) if mine else p
        parts = extrude(solid, z, z + top_int)
        for o in mine:
            reg = o["poly"].intersection(p)
            # 실내 창(채광창)은 창대 아래도 막는다
            if not o["door"]:
                parts += extrude(reg, z, z + Hf["sill"])
            parts += extrude(reg, z + (Hf["door"] if o["door"] else Hf["head"]), z + top_int)
        name = f"VIS_{F}_Internal{letters(i)}"
        add(name, "wall", key, parts)
        for k, o in enumerate(mine):
            cx, cy, along, across, ang = axis(o["poly"].intersection(p))
            if o["door"]:
                add(f"{name}_{k}_DoorLeaf", "door", key, [box_mesh(cx, cy, z, z + Hf["door"], along - 0.04, 0.04, ang)])
            else:
                add(f"{name}_{k}_Glass", "glass", key, [box_mesh(cx, cy, z + Hf["sill"], z + Hf["head"], along - 0.04, 0.02, ang)])

    # 바닥 · 천장 · 지붕
    add(f"VIS_{F}_Floor_0", "floor1", key, extrude(footprint, z - 0.15, z))
    add(f"VIS_{F}_ContinuousCeiling", "ceiling", key, extrude(unary_union(rooms), z + top_int, z + top_int + 0.03))
    exposed = 0.0
    if top:
        add("VIS_Roof_Flat_0", "roof", "roof", extrude(footprint.difference(unary_union([p["poly"] for p in pieces])).buffer(0), z + top_int + 0.03, z + Hf["floor"]))
        exposed = footprint.area
    else:
        # 위층이 덮지 않는 부분 = 이 층의 지붕 (위층 바닥 높이, 층 보기에서는 위층과 함께 보인다)
        open_ = footprint.difference(upper["_plan"][0]).buffer(-0.2, join_style=2).buffer(0.2, join_style=2)
        slab = [g for g in polys(open_) if g.area > 1.0]
        if slab:
            add(f"VIS_{F}_RoofSlab_0", "slab", upper["key"], extrude(unary_union(slab).difference(unary_union([p["poly"] for p in pieces])).buffer(0), z + top_int + 0.03, upper["z"]))
            exposed = sum(g.area for g in slab)

    # 실 (이름은 실 안에 놓인 짧은 글자)
    named = []
    for (tx, ty), t, layer in texts(fl["box"], fl["_off"]):
        named.append((Point(tx - origin[0], ty - origin[1]), t, layer))
    for i, r in enumerate(rooms):
        inside = [t for pt, t, layer in named if r.contains(pt) and room_name(t) and layer in CFG.get("roomTextLayers", [layer])]
        c = r.representative_point()
        mrr = r.minimum_rotated_rectangle
        viewer_rooms.append({
            "key": f"{key}-{i}",
            "name": inside[0] if inside else None,
            "floor": key,
            "z": z,
            "area": round(r.area, 2),
            "review": len(set(inside)) > 1,
            "L": round(r.exterior.length, 2),
            "WA": round(r.exterior.length * Hf["ceiling"], 1),
            "label": [round(c.x, 3), round(c.y, 3)],
            "polygon": [[round(x, 3), round(y, 3)] for x, y in r.exterior.coords],
        })
    env["zones"].append({"name": F, "z": z, "area": round(sum(r.area for r in rooms), 2), "ceiling": Hf["ceiling"], "height": round(top_ext if not top else Hf["floor"], 3),
                         "roof": round(exposed, 2), "use": fl.get("use", "office"), "sill": Hf["sill"], "head": Hf["head"]})
    meta["floors"].append({"key": key, "z": z, "footprint": [round(v, 3) for v in footprint.bounds], "area": round(footprint.area, 2)})
    meta["rooms"] += len(rooms)


# ── glb (v1 모델과 같은 노드 이름 · extras · 재질 이름) ──────────

MATERIALS = {
    "wall": ([0.86, 0.84, 0.80, 1], "OPAQUE"), "glass": ([0.62, 0.78, 0.84, 0.35], "BLEND"), "frame": ([0.42, 0.45, 0.47, 1], "OPAQUE"),
    "sill": ([0.72, 0.70, 0.65, 1], "OPAQUE"), "floor1": ([0.74, 0.70, 0.63, 1], "OPAQUE"), "ceiling": ([0.94, 0.94, 0.93, 1], "OPAQUE"),
    "roof": ([0.48, 0.51, 0.53, 1], "OPAQUE"), "door": ([0.55, 0.44, 0.33, 1], "OPAQUE"), "slab": ([0.48, 0.51, 0.53, 1], "OPAQUE"),
}


def write_glb(path):
    kinds = list(MATERIALS)
    bin_ = bytearray()
    views, accessors, meshes, gnodes = [], [], [], []

    def push(arr, target):
        nonlocal bin_
        while len(bin_) % 4:
            bin_ += b"\0"
        off = len(bin_)
        bin_ += arr.tobytes()
        views.append({"buffer": 0, "byteOffset": off, "byteLength": arr.nbytes, "target": target})
        return len(views) - 1

    for name, kind, floor, mesh in nodes:
        m = mesh.copy()
        m.unmerge_vertices()  # 면마다 법선 (각진 모서리)
        pos = m.vertices.astype(np.float32)
        nor = np.repeat(m.face_normals.astype(np.float32), 3, axis=0)
        idx = m.faces.astype(np.uint32).reshape(-1)
        pv = push(pos, 34962)
        accessors.append({"bufferView": pv, "componentType": 5126, "count": len(pos), "type": "VEC3", "min": pos.min(0).tolist(), "max": pos.max(0).tolist()})
        nv = push(nor, 34962)
        accessors.append({"bufferView": nv, "componentType": 5126, "count": len(nor), "type": "VEC3"})
        iv = push(idx, 34963)
        accessors.append({"bufferView": iv, "componentType": 5125, "count": len(idx), "type": "SCALAR"})
        a = len(accessors)
        meshes.append({"name": name, "primitives": [{"attributes": {"POSITION": a - 3, "NORMAL": a - 2}, "indices": a - 1, "material": kinds.index(kind)}]})
        gnodes.append({"name": name, "mesh": len(meshes) - 1, "extras": {"floor": floor, "kind": kind}})
    while len(bin_) % 4:
        bin_ += b"\0"
    gltf = {
        "asset": {"version": "2.0", "generator": "ninewatt auto_twin.py"},
        "scene": 0,
        "scenes": [{"nodes": list(range(len(gnodes)))}],
        "nodes": gnodes,
        "meshes": meshes,
        "materials": [{"name": k, "pbrMetallicRoughness": {"baseColorFactor": c, "metallicFactor": 0.0, "roughnessFactor": 0.85}, "alphaMode": mode, "doubleSided": True} for k, (c, mode) in MATERIALS.items()],
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": len(bin_)}],
    }
    js = json.dumps(gltf, separators=(",", ":")).encode()
    while len(js) % 4:
        js += b" "
    with open(path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)))
        f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
        f.write(struct.pack("<II", len(bin_), 0x004E4942) + bytes(bin_))


write_glb(os.path.join(OUT, "model.glb"))

# ── 도면 선 (twin.json, twin_data.py 와 같은 형식) ─────────────────

GROUPS = {l: "wall" for l in CFG["layers"]["wall"]} | {l: "window" for l in CFG["layers"]["opening"]} | {l: "dim" for l in CFG["layers"].get("dim", ["DIM"])}
plan = {"floors": {}}
line_count = 0
for fl in FLOORS:
    ox, oy = origin
    groups = {}
    for layer, pts, _ in primitives(fl["box"], set(CFG["layers"]["draw"]), fl["_off"]):
        g = GROUPS.get(layer, "detail")
        q = [(x - ox, y - oy) for x, y in pts]
        for a, b in zip(q, q[1:]):
            if abs(a[0] - b[0]) + abs(a[1] - b[1]) < 0.005:
                continue
            groups.setdefault(g, []).append((a, b))
            line_count += 1
    plan["floors"][fl["key"]] = {"z": fl["z"], "groups": {g: [round(c, 2) for s in sorted(segs, key=lambda s: (s[0][0] + s[1][0]) / 2 - (s[0][1] + s[1][1]) / 2) for pt in s for c in pt] for g, segs in groups.items()}}

meta.update({
    "lines": line_count,
    "layers": len({e.dxf.layer for e in msp}),
    "height": {**H, **FLOORS[-1].get("heights", {})}["parapet"] + FLOORS[-1]["z"],
    "wallArea": round(sum(env["walls"].values()), 1),
    "windowArea": round(sum(o["area"] for o in env["openings"]), 1),
    "floorArea": round(sum(z["area"] for z in env["zones"]), 2),
})
for name, data in (("viewer.json", {"model": "model.glb", "rooms": viewer_rooms}), ("twin.json", plan), ("env.json", env), ("meta.json", meta)):
    with open(os.path.join(OUT, name), "w") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":") if name == "twin.json" else None, indent=None if name == "twin.json" else 1)
print(json.dumps(meta, ensure_ascii=False))
print("nodes", len(nodes), "glb", os.path.getsize(os.path.join(OUT, "model.glb")) // 1024, "KB")
