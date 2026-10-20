"""1층 평면 선을 모델 좌표(m) 폴리라인으로 뽑는다. 부스 영상에서 도면이 그려지는 장면에 쓴다.

    python3 scripts/lab/plan_vectors.py <dxf> <out.json>

dxf_plan_figures.py 와 같은 시트 범위·레이어(DRAW_LAYERS)만 쓰고, 글자(TEXT·MTEXT·치수 글자)는 버린다.
도면 제목·기관명·설계사 정보는 이 레이어들에 없다(plan_common 참고).
출력: {"bounds": [x0, y0, x1, y1], "layers": {레이어: [[[x, y], …], …]}}
"""
import json
import sys

import ezdxf
from ezdxf import bbox, disassemble

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from plan_common import DRAW_LAYERS, PRESETS  # noqa: E402

dxf, out = sys.argv[1], sys.argv[2]
P = PRESETS["1f"]
x0, y0, x1, y1 = P["box"]
ox, oy = P["origin"]
mx, my = P["model"]

msp = ezdxf.readfile(dxf).modelspace()


def within(e):
    try:
        b = bbox.extents([e], fast=True)
    except Exception:
        return False
    return b.has_data and b.extmin.x >= x0 and b.extmax.x <= x1 and b.extmin.y >= y0 and b.extmax.y <= y1


ents = [e for e in msp if e.dxf.layer in DRAW_LAYERS and within(e)]
layers = {}
for prim in disassemble.to_primitives(disassemble.recursive_decompose(ents)):
    ent = prim.entity
    if ent is None or ent.dxftype() in ("TEXT", "MTEXT", "ATTRIB", "ATTDEF"):
        continue
    layer = ent.dxf.layer if ent.dxf.layer in DRAW_LAYERS else "ETC"
    try:
        pts = list(prim.vertices()) if prim.path is None else list(prim.path.flattening(5))
    except Exception:
        continue
    if len(pts) < 2:
        continue
    line = [[round((p.x - ox) / 1000 + mx, 3), round((p.y - oy) / 1000 + my, 3)] for p in pts]
    layers.setdefault(layer, []).append(line)

json.dump({"bounds": [round((x0 - ox) / 1000 + mx, 3), round((y0 - oy) / 1000 + my, 3),
                      round((x1 - ox) / 1000 + mx, 3), round((y1 - oy) / 1000 + my, 3)],
           "layers": layers}, open(out, "w"))
print({k: len(v) for k, v in layers.items()})
