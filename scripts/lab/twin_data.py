"""Lab v2(도면 기반 3D 트윈) 데이터: 1·2층 평면 선을 모델 좌표(m) 선분으로 뽑아 twin.json 으로 쓴다.

    python3 scripts/lab/twin_data.py <dxf> public/lab/ai-building-workspace-v2/twin.json

plan_vectors.py 와 같은 시트 범위·레이어만 쓰고, 글자(TEXT·MTEXT·치수 글자)는 버린다.
도면 제목·기관명·설계사 정보는 이 레이어들에 없다(plan_common 참고). 바닥 줄눈(AA-XXXX-JUMT1)은 선이 너무 많아,
해치(HATCH)는 경계가 사선으로 풀려 뺐다(벽선과 겹친다).

출력: {"floors": {"1f": {"z": 0, "groups": {"wall": [x0, y0, x1, y1, …], …}}, …}, "bounds": [x0, y0, x1, y1]}
그룹 순서(wall → window → detail → dim)대로 그려지고, 그룹 안에서는 서쪽 위(도면 왼쪽 위)부터 쓸어 가듯 정렬한다.
"""
import json
import sys

import ezdxf
from ezdxf import bbox, disassemble

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from plan_common import DRAW_LAYERS, FLOOR_Z, PRESETS  # noqa: E402

dxf, out = sys.argv[1], sys.argv[2]
msp = ezdxf.readfile(dxf).modelspace()

GROUPS = {"WAL": "wall", "COL": "wall", "WIN": "window", "DIM": "dim"}
SKIP = {"AA-XXXX-JUMT1", "LIBR"}  # 바닥 줄눈 · 가구 블록 안쪽 선


def floor_lines(floor):
    p = PRESETS[floor]
    x0, y0, x1, y1 = p["box"]
    ox, oy = p["origin"]
    mx, my = p["model"]

    def within(e):
        try:
            b = bbox.extents([e], fast=True)
        except Exception:
            return False
        return b.has_data and b.extmin.x >= x0 and b.extmax.x <= x1 and b.extmin.y >= y0 and b.extmax.y <= y1

    ents = [e for e in msp if e.dxf.layer in DRAW_LAYERS | {"COL"} and within(e)]
    groups = {}
    for prim in disassemble.to_primitives(disassemble.recursive_decompose(ents)):
        ent = prim.entity
        if ent is None or ent.dxftype() in ("TEXT", "MTEXT", "ATTRIB", "ATTDEF", "HATCH") or ent.dxf.layer in SKIP:
            continue
        try:
            pts = list(prim.vertices()) if prim.path is None else list(prim.path.flattening(5))
        except Exception:
            continue
        if len(pts) < 2:
            continue
        group = GROUPS.get(ent.dxf.layer, "detail")
        q = [((v.x - ox) / 1000 + mx, (v.y - oy) / 1000 + my) for v in pts]
        for a, b in zip(q, q[1:]):
            if abs(a[0] - b[0]) + abs(a[1] - b[1]) < 0.005:
                continue
            groups.setdefault(group, []).append((a, b))
    result = {}
    for g, segs in groups.items():
        # 도면 왼쪽 위에서 오른쪽 아래로 (펜이 지나가듯)
        segs.sort(key=lambda s: (s[0][0] + s[1][0]) / 2 - (s[0][1] + s[1][1]) / 2)
        result[g] = [round(c, 2) for s in segs for pt in s for c in pt]
    return result, [round((x0 - ox) / 1000 + mx, 2), round((y0 - oy) / 1000 + my, 2),
                    round((x1 - ox) / 1000 + mx, 2), round((y1 - oy) / 1000 + my, 2)]


floors = {}
bounds = None
for floor in ("1f", "2f"):
    groups, b = floor_lines(floor)
    floors[floor] = {"z": FLOOR_Z[floor], "groups": groups}
    bounds = b if bounds is None else [min(bounds[0], b[0]), min(bounds[1], b[1]), max(bounds[2], b[2]), max(bounds[3], b[3])]
    print(floor, {g: len(v) // 4 for g, v in groups.items()})

with open(out, "w") as f:
    json.dump({"floors": floors, "bounds": bounds}, f, separators=(",", ":"))
print(out)
