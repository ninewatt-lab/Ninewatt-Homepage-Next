"""정면도 선도(elev-dxf.png). 글자 레이어 없이 입면 선만 그린다.

    python scripts/lab/dxf_elevation.py <input.dxf> <out.png>

출력은 1461 px 폭 = 도면 14,500 mm (100.76 px/m). blender_render.py 의 front 카메라가
이 축척·중심에 맞춰져 있으므로 BOX 를 바꾸면 그쪽 값도 같이 바꿔야 한다.
"""
import sys

import ezdxf
import ezdxf.bbox
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import Frontend, RenderContext
from ezdxf.addons.drawing.config import (BackgroundPolicy, ColorPolicy, Configuration,
                                         LineweightPolicy)
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

DXF, OUT = sys.argv[1], sys.argv[2]

# 공사도면 > 정면도 시트의 건물 영역 (도면 좌표, mm). 외벽 해치(HA1)는 뺐다.
BOX = (366800, 216300, 381300, 226000)
LAYERS = {"WAL", "WIN", "PAR", "FIV", "ELE", "COL", "fin", "L1"}

doc = ezdxf.readfile(DXF)
msp = doc.modelspace()
x0, y0, x1, y1 = BOX


def keep(e):
    if e.dxf.layer not in LAYERS:
        return False
    try:
        bb = ezdxf.bbox.extents([e], fast=True)
    except Exception:
        return False
    return bb.has_data and bb.extmin.x >= x0 and bb.extmax.x <= x1 and bb.extmin.y >= y0 and bb.extmax.y <= y1


w = 12
fig = plt.figure(figsize=(w, w * (y1 - y0) / (x1 - x0)), dpi=200)
ax = fig.add_axes([0, 0, 1, 1])
cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.BLACK,
                    lineweight_policy=LineweightPolicy.RELATIVE, lineweight_scaling=0.6)
Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(msp, filter_func=keep)
ax.set_xlim(x0, x1)
ax.set_ylim(y0, y1)
ax.set_aspect("equal")
ax.axis("off")
fig.savefig(OUT, facecolor="white")
