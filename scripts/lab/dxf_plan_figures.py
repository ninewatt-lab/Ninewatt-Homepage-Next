"""층 평면 도판 두 장: 익명화된 평면 선도 + 실 경계 계산.

도면 제목·기관명·설계사·연락처는 TEX/TXT/2/0 레이어에 있어 DRAW_LAYERS 에 넣지
않는 한 그려지지 않는다. 레이어를 추가할 때는 그 레이어에 글자가 없는지 먼저 확인할 것.

    python scripts/lab/dxf_plan_figures.py <input.dxf> <out_dir> [1f|2f]

1f → fig-plan.png, fig-rooms.png / 2f → fig-plan-2f.png, fig-rooms-2f.png
실 목록은 rooms-<floor>.json 으로도 저장된다(면적 ㎡ + 모델 좌표의 라벨 위치).
면적은 src/data/labProjects.ts 의 areas 로, 라벨 위치는 blender_render.py 의 단면 라벨로 쓴다.
"""
import json
import sys

import ezdxf
import ezdxf.bbox
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from ezdxf.addons.drawing import Frontend, RenderContext
from ezdxf.addons.drawing.config import (BackgroundPolicy, ColorPolicy, Configuration,
                                         LineweightPolicy)
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from shapely.geometry import LineString, Point, Polygon
from shapely.ops import polylabel, unary_union

DXF, OUT = sys.argv[1], sys.argv[2]
FLOOR = sys.argv[3] if len(sys.argv) > 3 else "1f"

FONT = "/System/Library/Fonts/AppleSDGothicNeo.ttc"  # macOS 한글 폰트
font_manager.fontManager.addfont(FONT)
plt.rcParams["font.family"] = font_manager.FontProperties(fname=FONT).get_name()

INK = "#1f2933"
ACCENT = "#2f8a9c"
FLAG = "#d9822b"

# 공사도면 > 층별 평면도(신설) 시트의 도면 영역(도면 좌표, mm)과 모델 좌표 원점.
# origin: 이 도면 좌표가 glb 모델의 (x, y) = (-0.17 m 또는 0.73 m, -0.17 m) 모서리. 벽선 외곽으로 맞췄다.
PRESETS = {
    "1f": {"box": (362300, 239800, 378300, 262300), "origin": (365954, 245733), "model": (-0.17, -0.17),
           "files": ("fig-plan.png", "fig-rooms.png")},
    "2f": {"box": (405500, 239500, 420600, 262000), "origin": (409148, 245421), "model": (0.73, -0.17),
           "files": ("fig-plan-2f.png", "fig-rooms-2f.png")},
}
PRESET = PRESETS[FLOOR]
BOX = PRESET["box"]
DRAW_LAYERS = {"WAL", "WIN", "HA1", "fin", "ETC", "SYM", "DIM", "PAR", "FIV", "TOL", "BAR2", "ELE",
               "AA-XXXX-JUMT1"}
ROOM_LAYERS = {"WAL", "WIN", "COL"}
LABEL_LAYER = "PS-TEXT a"  # 실 이름만 있는 레이어

doc = ezdxf.readfile(DXF)
msp = doc.modelspace()
x0, y0, x1, y1 = BOX


def within(e):
    try:
        bb = ezdxf.bbox.extents([e], fast=True)
    except Exception:
        return False
    return bb.has_data and bb.extmin.x >= x0 and bb.extmax.x <= x1 and bb.extmin.y >= y0 and bb.extmax.y <= y1


def base_axes():
    w = 12
    fig = plt.figure(figsize=(w, w * (y1 - y0) / (x1 - x0)), dpi=200)
    ax = fig.add_axes([0, 0, 1, 1])
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK,
                        lineweight_policy=LineweightPolicy.RELATIVE, lineweight_scaling=0.6)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(
        msp, filter_func=lambda e: e.dxf.layer in DRAW_LAYERS and within(e))
    ax.set_xlim(x0, x1)
    ax.set_ylim(y0, y1)
    ax.set_aspect("equal")
    ax.axis("off")
    return fig, ax


def scale_bar(ax):
    bx, by = x0 + 300, y1 - 2600
    for i in range(5):
        ax.add_patch(plt.Rectangle((bx + i * 1000, by), 1000, 120, facecolor=INK if i % 2 == 0 else "white",
                                   edgecolor=INK, linewidth=0.8, zorder=1e6))
    for m in range(6):
        ax.text(bx + m * 1000, by + 260, str(m), ha="center", va="bottom", fontsize=5.5, color=INK, zorder=1e6)
    ax.text(bx + 5250, by + 260, "m", ha="left", va="bottom", fontsize=5.5, color=INK, zorder=1e6)


def save(fig, name):
    # ezdxf 가 그린 선 위에 라벨이 오도록 라벨 zorder 는 1e6 이상을 쓴다
    fig.savefig(f"{OUT}/{name}", facecolor="white", bbox_inches="tight", pad_inches=0.15, dpi=400)
    plt.close(fig)


# ── 실 이름: 도면에 놓인 그대로(raw) / 두 줄짜리를 합친 것(labels) ──
raw_labels, labels = [], []
for e in msp.query(f'TEXT[layer=="{LABEL_LAYER}"]'):
    p = e.dxf.insert
    if not (x0 <= p[0] <= x1 and y0 <= p[1] <= y1):
        continue
    text = e.dxf.text.replace(" ", "")  # "안  방" → "안방"
    centred = e.dxf.halign == 1 and e.dxf.hasattr("align_point")
    a = e.dxf.align_point if centred else p
    raw_labels.append(((a[0], a[1]), text.replace("처치및", "처치 및"), "center" if centred else "left"))
    if text == "조제실":  # "처치 및" / "조제실" 은 한 실의 두 줄
        continue
    labels.append(((p[0], p[1]), "처치 및 조제실" if text == "처치및" else text))

# ── 실 경계: 벽·창호선을 두껍게 합쳐 닫힌 구멍을 찾는다 ──
BUF = 60  # mm. 벽선 사이 작은 틈을 메우는 폭
segs, arcs = [], []
for e in msp:
    if e.dxf.layer not in ROOM_LAYERS or not within(e):
        continue
    for v in (e.virtual_entities() if e.dxftype() == "INSERT" else [e]):
        t = v.dxftype()
        if t == "LINE":
            segs.append(LineString([(v.dxf.start.x, v.dxf.start.y), (v.dxf.end.x, v.dxf.end.y)]))
        elif t == "LWPOLYLINE":
            pts = [p[:2] for p in v.get_points()]
            if v.closed:
                pts.append(pts[0])
            if len(pts) > 1:
                segs.append(LineString(pts))
        elif t == "ARC":
            arcs.append(v)
# 문 열림 호가 개구부를 막아 주므로 벽 집합에 넣는다. 대신 문이 열리는 쪽 실에
# 부채꼴만큼 홈이 생기니, 그 부채꼴은 아래에서 해당 실에 다시 붙인다.
sectors = []
for a in arcs:
    pts = [(p.x, p.y) for p in a.flattening(50)]
    segs.append(LineString(pts))
    sectors.append(Polygon([(a.dxf.center.x, a.dxf.center.y)] + pts))
walls = unary_union([s.buffer(BUF, cap_style=2, join_style=2) for s in segs])
parts = [walls] if walls.geom_type == "Polygon" else list(walls.geoms)
holes = [Polygon(r) for p in parts for r in p.interiors]
holes = [h.buffer(BUF, join_style=2) for h in holes if h.area > 0.8e6]  # 벽 내측 면으로 되돌림

rooms = []
for h in holes:
    names = [t for (pt, t) in labels if h.contains(Point(pt))]
    if not names:
        continue
    for s in sectors:
        if s.is_valid and h.buffer(BUF).intersection(s).area > 0.3 * s.area:
            h = h.union(s.buffer(BUF, join_style=2)).buffer(-BUF, join_style=2).buffer(BUF, join_style=2)
    rooms.append({"poly": h, "names": names, "area": h.area / 1e6})

# ── A: 평면 선도 ──
fig, ax = base_axes()
for (pt, t, ha) in raw_labels:
    ax.text(pt[0], pt[1], t, ha=ha, va="baseline", fontsize=6.5, color=INK, zorder=1e6,
            bbox=dict(boxstyle="square,pad=0.15", facecolor="white", edgecolor="none"))
scale_bar(ax)
save(fig, PRESET["files"][0])

# ── B: 평면 + 실 경계. 이름이 둘 이상 들어간 영역 = 칸막이 선 없음 → 검토 필요 ──
fig, ax = base_axes()
for r in rooms:
    flag = len(r["names"]) > 1
    c = FLAG if flag else ACCENT
    xs, ys = r["poly"].exterior.xy
    ax.fill(xs, ys, color=c, alpha=0.16, zorder=1e6, linewidth=0)
    ax.plot(xs, ys, color=c, linewidth=1.3, zorder=1e6 + 1, linestyle=(0, (4, 2)) if flag else "-")
    cx, cy = polylabel(r["poly"], tolerance=10).coords[0]
    text = " · ".join(r["names"]) + f"\n{r['area']:.2f} ㎡" + ("\n경계 검토 필요" if flag else "")
    ax.text(cx, cy, text, ha="center", va="center", fontsize=6.5, color=INK, zorder=1e6 + 2, linespacing=1.35,
            bbox=dict(boxstyle="round,pad=0.35", facecolor="white", edgecolor=c, linewidth=0.8, alpha=0.92))
scale_bar(ax)
save(fig, PRESET["files"][1])

ox, oy = PRESET["origin"]
mx, my = PRESET["model"]
out = []
for r in sorted(rooms, key=lambda r: -r["area"]):
    lx, ly = polylabel(r["poly"], tolerance=10).coords[0]
    out.append({"names": r["names"], "area_m2": round(r["area"], 2), "review": len(r["names"]) > 1,
                "model_xy": [round((lx - ox) / 1000 + mx, 3), round((ly - oy) / 1000 + my, 3)]})
with open(f"{OUT}/rooms-{FLOOR}.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(json.dumps([{k: r[k] for k in ("names", "area_m2")} for r in out], ensure_ascii=False))
