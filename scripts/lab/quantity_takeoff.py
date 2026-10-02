"""도면 기반 물량 산출: 실별 L·A·WA → 자재별 물량 → 예시 단가 적용 금액, 그리고 물량 마킹 도면.

    python scripts/lab/quantity_takeoff.py <input.dxf> <work_dir>

work_dir 에 필요한 것: rooms-1f.json · rooms-2f.json (dxf_plan_figures.py), openings.json (blender_openings.py)
쓰는 것: takeoff.json, fig-takeoff-1f.png, fig-takeoff-2f.png

정의 (모두 m, ㎡)
  L  실 둘레 = 실 경계(벽 내측 면) 폴리곤 길이
  A  바닥 면적 = 같은 폴리곤 면적
  WA 벽 면적 = L × 천장고 − 그 실 벽에 난 창·문 면적 (천장고 위로 걸친 부분은 빼지 않는다)
     실내 문은 양쪽 실 모두에서 뺀다(양면 마감). 베란다는 벽 마감 대상이 아니라 WA 를 내지 않는다.
  난간 베란다 경계 중 건물 벽에 닿지 않은 길이 (추정)

마감은 공사도면 주석을 따른다(FINISH). 단가(PRICE)는 예시값으로, 실제 견적이 아니다.
"""
import json
import os
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
from shapely.geometry import LineString, Polygon
from shapely.ops import unary_union

from plan_common import DRAW_LAYERS, FONT, INK, PRESETS, room_key, to_dxf

DXF, WORK = sys.argv[1], sys.argv[2]

font_manager.fontManager.addfont(FONT)
plt.rcParams["font.family"] = font_manager.FontProperties(fname=FONT).get_name()

CEILING = 2.74  # 천장고(m). 모델의 1·2층 천장 판 밑면 − 바닥 (2.74 / 6.04 − 3.30)
OPENING_TOL = 0.35  # 창·문 중심이 실 경계에서 이만큼 안에 있으면 그 실 벽의 개구부로 본다 (벽 두께 절반 + 여유)
RAILING_TOL = 0.6  # 베란다 경계가 실내 실에서 이만큼 떨어져 있으면 난간 쪽으로 본다

# 실별 마감 (바닥, 벽, 천장). 공사도면 주석:
#  1층 진료실·대기실·다목적실·현관  바닥 중보행용 데코타일 / 벽 수성페인트 / 천장 경량철골천장틀+석고보드+수성페인트
#  1층 계단실                        바닥 데코타일 / 벽 수성페인트 (천장 표기 없음)
#  화장실(1·2층)                     바닥 자기질타일 / 벽 도기질타일 / 천장 SMC
#  2층 안방·방·거실·주방             바닥 비닐계시트 / 벽 벽지 / 천장 경량철골천장틀+석고보드+천정지
#  베란다                            바닥 에폭시방수 / F.B 난간
FINISH = {
    "waiting": ("decoTile", "paintInt", "gypsumPaint"),
    "clinic": ("decoTile", "paintInt", "gypsumPaint"),
    "multipurpose": ("decoTile", "paintInt", "gypsumPaint"),
    "entrance": ("decoTile", "paintInt", "gypsumPaint"),
    "stair": ("decoTile", "paintInt", None),
    "toilet": ("porcelainFloor", "ceramicWall", "smcCeiling"),
    "toilet2": ("porcelainFloor", "ceramicWall", "smcCeiling"),
    "livingKitchen": ("vinylSheet", "wallpaper", "gypsumPaper"),
    "masterBedroom": ("vinylSheet", "wallpaper", "gypsumPaper"),
    "bedroom": ("vinylSheet", "wallpaper", "gypsumPaper"),
    "verandaWestSouth": ("epoxy", None, None),
    "verandaEast": ("epoxy", None, None),
}

# 예시 단가 (원, 자재+시공 포함). 일반 시세 수준을 가정한 값으로 실제 견적이 아니다
PRICE = {
    "decoTile": ("㎡", 32000),
    "porcelainFloor": ("㎡", 62000),
    "vinylSheet": ("㎡", 28000),
    "epoxy": ("㎡", 38000),
    "paintInt": ("㎡", 9000),
    "ceramicWall": ("㎡", 58000),
    "wallpaper": ("㎡", 14000),
    "gypsumPaint": ("㎡", 48000),
    "gypsumPaper": ("㎡", 44000),
    "smcCeiling": ("㎡", 45000),
    "fbRailing": ("m", 130000),
}

openings = json.load(open(os.path.join(WORK, "openings.json"), encoding="utf-8"))


def opening_line(o):
    cx, cy = o["center"]
    h = o["width"] / 2
    return LineString([(cx - h, cy), (cx + h, cy)] if o["along_x"] else [(cx, cy - h), (cx, cy + h)])


rooms = []
for floor in ("1f", "2f"):
    data = json.load(open(os.path.join(WORK, f"rooms-{floor}.json"), encoding="utf-8"))
    indoor = unary_union([Polygon(r["polygon"]) for r in data if not r.get("outdoor")])
    for r in data:
        key = room_key(floor, r)
        poly = Polygon(r["polygon"])
        boundary = poly.exterior
        room = {"key": key, "floor": floor, "names": r["names"], "review": r["review"],
                "outdoor": bool(r.get("outdoor")), "L": boundary.length, "A": poly.area,
                "finish": dict(zip(("floor", "wall", "ceiling"), FINISH[key])), "polygon": r["polygon"],
                "label": r["model_xy"]}
        if room["outdoor"]:
            # 실내 실에서 떨어진 경계 조각만 난간으로 센다
            far = boundary.difference(indoor.buffer(RAILING_TOL))
            room["railing"] = far.length
            room["WA"] = None
            room["openings"] = []
        else:
            hits = []
            for o in openings:
                if o["floor"] != floor:
                    continue
                line = opening_line(o)
                if boundary.distance(line.centroid) <= OPENING_TOL:
                    h = max(0.0, min(o["top"], CEILING) - max(o["bottom"], 0.0))
                    hits.append({"id": o["id"], "door": o["door"], "width": o["width"], "height": round(h, 3),
                                 "area": o["width"] * h, "line": [list(c) for c in line.coords]})
            room["openings"] = hits
            room["openingArea"] = sum(h["area"] for h in hits)
            room["WA"] = room["L"] * CEILING - room["openingArea"]
        rooms.append(room)

# ── 자재별 물량 ──
qty = {}
for r in rooms:
    f = r["finish"]
    if f["floor"]:
        qty[f["floor"]] = qty.get(f["floor"], 0) + r["A"]
    if f["wall"]:
        qty[f["wall"]] = qty.get(f["wall"], 0) + r["WA"]
    if f["ceiling"]:
        qty[f["ceiling"]] = qty.get(f["ceiling"], 0) + r["A"]
    if r.get("railing"):
        qty["fbRailing"] = qty.get("fbRailing", 0) + r["railing"]

materials = []
for key, (unit, price) in PRICE.items():
    if key not in qty:
        continue
    q = round(qty[key], 1)  # 물량은 소수 첫째 자리로 맞춘 뒤 단가를 곱한다(표의 숫자와 금액이 맞도록)
    materials.append({"key": key, "unit": unit, "qty": q, "price": price, "amount": round(q * price)})
total = sum(m["amount"] for m in materials)


def r2(v):
    return None if v is None else round(v, 2)


out = {
    "ceilingHeight": CEILING,
    "rooms": [{"key": r["key"], "floor": r["floor"], "names": r["names"], "review": r["review"],
               "outdoor": r["outdoor"], "L": r2(r["L"]), "A": r2(r["A"]), "WA": r2(r["WA"]),
               "openingArea": r2(r.get("openingArea")), "openings": len(r["openings"]),
               "railing": r2(r.get("railing")), "finish": r["finish"]} for r in rooms],
    "materials": materials,
    "total": total,
}
with open(os.path.join(WORK, "takeoff.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

# ── 물량 마킹 도면 ──
FILL = {"decoTile": "#f4cdbd", "porcelainFloor": "#c9cdf2", "vinylSheet": "#f1dcb0", "epoxy": "#cfe8d2"}
FILL_NAME = {"decoTile": "데코타일", "porcelainFloor": "자기질타일", "vinylSheet": "비닐계시트", "epoxy": "에폭시방수"}
RED = "#c8102e"
# 좁은 실끼리 라벨이 겹치는 곳만 옮긴다 (모델 좌표 m)
LABEL_OFFSET = {"stair": (0.35, 0.5), "toilet": (0.0, -0.45), "toilet2": (-0.2, 0.0), "verandaEast": (1.35, -2.4)}
doc = ezdxf.readfile(DXF)
msp = doc.modelspace()

for floor in ("1f", "2f"):
    x0, y0, x1, y1 = PRESETS[floor]["box"]

    def within(e):
        try:
            bb = ezdxf.bbox.extents([e], fast=True)
        except Exception:
            return False
        return bb.has_data and bb.extmin.x >= x0 and bb.extmax.x <= x1 and bb.extmin.y >= y0 and bb.extmax.y <= y1

    fig = plt.figure(figsize=(12, 12 * (y1 - y0) / (x1 - x0)), dpi=200)
    ax = fig.add_axes([0, 0, 1, 1])
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK,
                        lineweight_policy=LineweightPolicy.RELATIVE, lineweight_scaling=0.6)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(
        msp, filter_func=lambda e: e.dxf.layer in DRAW_LAYERS and within(e))
    used = set()
    for r in rooms:
        if r["floor"] != floor:
            continue
        pts = [to_dxf(floor, x, y) for x, y in r["polygon"]]
        fl = r["finish"]["floor"]
        used.add(fl)
        xs, ys = zip(*pts)
        ax.fill(xs, ys, color=FILL[fl], alpha=0.7, zorder=1e6, linewidth=0)
        ax.plot(xs, ys, color="#2f7d3a" if not r["review"] else "#d9822b", linewidth=1.0,
                linestyle=(0, (5, 2)), zorder=1e6 + 1)
        for o in r["openings"]:  # 벽 면적에서 뺀 창·문
            lx, ly = zip(*[to_dxf(floor, x, y) for x, y in o["line"]])
            ax.plot(lx, ly, color=RED, linewidth=2.2, solid_capstyle="butt", zorder=1e6 + 2)
        dx, dy = LABEL_OFFSET.get(r["key"], (0, 0))
        lx, ly = to_dxf(floor, r["label"][0] + dx, r["label"][1] + dy)
        name = " · ".join(r["names"])
        lines = [f"L = {r['L']:.1f} m", f"A = {r['A']:.1f} m²"]
        lines.append(f"난간 = {r['railing']:.1f} m" if r["outdoor"] else f"WA = {r['WA']:.1f} m²")
        ax.text(lx, ly + 260, name, ha="center", va="bottom", fontsize=7, color=INK, zorder=1e6 + 3,
                bbox=dict(boxstyle="square,pad=0.15", facecolor="white", edgecolor="none", alpha=0.85))
        ax.text(lx, ly + 180, "\n".join(lines), ha="center", va="top", fontsize=6.2, color=RED,
                weight="bold", linespacing=1.3, zorder=1e6 + 3)
    # 범례
    lx, ly = x0 + 400, y0 + 900
    for i, fl in enumerate(k for k in FILL if k in used):
        ax.add_patch(plt.Rectangle((lx, ly + i * 520), 700, 360, facecolor=FILL[fl], edgecolor=INK,
                                   linewidth=0.5, zorder=1e6))
        ax.text(lx + 900, ly + i * 520 + 180, FILL_NAME[fl], va="center", fontsize=6, color=INK, zorder=1e6)
    n = len(used)
    ax.plot([lx, lx + 700], [ly + n * 520 + 180] * 2, color=RED, linewidth=2.2, zorder=1e6)
    ax.text(lx + 900, ly + n * 520 + 180, "벽 면적에서 뺀 창·문", va="center", fontsize=6, color=INK, zorder=1e6)
    ax.set_xlim(x0, x1 + 1500)  # 동측 베란다 라벨이 도면 밖으로 나가므로 오른쪽을 조금 넓힌다
    ax.set_ylim(y0, y1)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.savefig(os.path.join(WORK, f"fig-takeoff-{floor}.png"), facecolor="white", bbox_inches="tight",
                pad_inches=0.15, dpi=400)
    plt.close(fig)

for r in out["rooms"]:
    print(f"{r['floor']} {' · '.join(r['names']):14s} L {r['L']:6.2f}  A {r['A']:6.2f}  "
          f"WA {r['WA'] if r['WA'] is not None else '-':>6}  open {r['openings']}  rail {r['railing'] or '-'}")
for m in materials:
    print(f"{m['key']:15s} {m['qty']:7.1f} {m['unit']}  × {m['price']:>7,}  = {m['amount']:>10,}")
print(f"TOTAL {total:,}")
