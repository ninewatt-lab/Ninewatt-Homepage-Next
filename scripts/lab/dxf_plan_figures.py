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

from plan_common import ACCENT, DRAW_LAYERS, FLAG, FONT, INK, PRESETS

DXF, OUT = sys.argv[1], sys.argv[2]
FLOOR = sys.argv[3] if len(sys.argv) > 3 else "1f"

font_manager.fontManager.addfont(FONT)
plt.rcParams["font.family"] = font_manager.FontProperties(fname=FONT).get_name()

PRESET = PRESETS[FLOOR]
BOX = PRESET["box"]
# 바깥으로 열린 공간(베란다·발코니). 벽·창호만으로는 닫히지 않아 난간(PAR)·외곽선(G1·ETC·0)을 더해 경계를 닫는다.
# 이 레이어들은 실내에 가구·설비 선도 있어 실내 실 경계에는 쓰지 않는다.
OUTDOOR_NAMES = {"베란다", "발코니"}
OUTDOOR_LAYERS = {"PAR", "G1", "ETC", "0"}
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
labels += PRESET.get("extra_labels", [])

# ── 실 경계: 벽·창호선을 두껍게 합쳐 닫힌 구멍을 찾는다 ──
BUF = 60  # mm. 벽선 사이 작은 틈을 메우는 폭


def closed_regions(layers):
    """layers 의 선으로 닫힌 영역(구멍)과 문 열림 부채꼴."""
    segs, arcs = [], []
    for e in msp:
        if e.dxf.layer not in layers or not within(e):
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
    return [h.buffer(BUF, join_style=2) for h in holes if h.area > 0.8e6], sectors  # 벽 내측 면으로 되돌림


rooms = []
for outdoor, layers in ((False, ROOM_LAYERS), (True, ROOM_LAYERS | OUTDOOR_LAYERS)):
    holes, sectors = closed_regions(layers)
    for h in holes:
        # 같은 이름이 여러 번 찍힌 영역(베란다 L자)은 하나로 친다
        names = list(dict.fromkeys(t for (pt, t) in labels if h.contains(Point(pt))))
        if not names or outdoor != bool(OUTDOOR_NAMES & set(names)):
            continue
        for s in sectors:
            if s.is_valid and h.buffer(BUF).intersection(s).area > 0.3 * s.area:
                h = h.union(s.buffer(BUF, join_style=2)).buffer(-BUF, join_style=2).buffer(BUF, join_style=2)
        rooms.append({"poly": h, "names": names, "area": h.area / 1e6, "outdoor": outdoor})

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


def to_model(x, y):
    return [round((x - ox) / 1000 + mx, 3), round((y - oy) / 1000 + my, 3)]


out = []
for r in sorted(rooms, key=lambda r: -r["area"]):
    lx, ly = polylabel(r["poly"], tolerance=10).coords[0]
    outline = r["poly"].simplify(15, preserve_topology=True).exterior.coords
    out.append({"names": r["names"], "area_m2": round(r["area"], 2), "review": len(r["names"]) > 1,
                "outdoor": r["outdoor"],
                "model_xy": to_model(lx, ly),
                "polygon": [to_model(x, y) for x, y in outline]})  # 웹 뷰어 클릭 영역
with open(f"{OUT}/rooms-{FLOOR}.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

# ── C: 웹 뷰어 바닥에 까는 평면 (투명 배경, 글자 없음). 화소 ↔ 모델 좌표가 정확히 맞도록
#      bbox_inches 없이 BOX 그대로 저장하고, 범위를 모델 좌표로 함께 기록한다 ──
fig, ax = base_axes()
# ezdxf 가 그리면서 figure 크기를 바꾸므로 BOX 비율로 되돌리고, 축을 그림 전체에 꽉 채운다
ax.set_aspect("auto")
ax.set_position([0, 0, 1, 1])
fig.set_size_inches(8, 8 * (y1 - y0) / (x1 - x0))
ax.set_xlim(x0, x1)
ax.set_ylim(y0, y1)
overlay = f"{OUT}/plan-overlay-{FLOOR}.png"
fig.savefig(overlay, facecolor="white", dpi=250)
plt.close(fig)
from PIL import Image  # noqa: E402
im = Image.open(overlay).convert("L")
alpha = im.point(lambda v: 255 - v)  # 흰 바탕 → 투명, 선 → 불투명
rgba = Image.new("RGBA", im.size, (31, 41, 51, 0))
rgba.putalpha(alpha)
rgba.save(overlay)
with open(f"{OUT}/plan-overlay-{FLOOR}.json", "w") as f:
    json.dump({"bounds": to_model(x0, y0) + to_model(x1, y1), "size": list(rgba.size)}, f)

print(json.dumps([{k: r[k] for k in ("names", "area_m2")} for r in out], ensure_ascii=False))
