"""glb 모델에서 창·문(개구부) 목록을 뽑는다. 벽 면적에서 뺄 때 쓴다.

    blender -b --factory-startup --python scripts/lab/blender_openings.py -- <model.glb> <out.json>

창·문은 VIS_<층>_<벽 이름>_<번호>_<부재> 객체들의 묶음이다(Jamb·HeadSill·Glass·Mullion·DoorLeaf 등).
묶음마다 문틀(Jamb)의 범위로 폭·높이를 잰다. 좌표는 모델 좌표(m), z 는 그 층 바닥 기준.
"""
import json
import re
import sys
from collections import defaultdict

import bpy
from mathutils import Vector

glb, out = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)

FLOOR_Z = {"F1": 0.0, "F2": 3.3}
PART = re.compile(r"^VIS_(F[12])_(.+)_(\d+)_(Jamb|HeadSill|Glass|Mullion|DoorLeaf|Handle|PullHandle|SillStone)")

groups = defaultdict(list)
for o in bpy.context.scene.objects:
    if o.type != "MESH":
        continue
    m = PART.match(o.name)
    if not m:
        continue
    floor, wall, idx, part = m.groups()
    ws = [o.matrix_world @ Vector(c) for c in o.bound_box]
    groups[(floor, wall, idx)].append((part, ws))

openings = []
for (floor, wall, idx), parts in sorted(groups.items()):
    jambs = [ws for part, ws in parts if part == "Jamb"] or [ws for part, ws in parts if part != "SillStone"]
    pts = [p for ws in jambs for p in ws]
    xs, ys, zs = [p.x for p in pts], [p.y for p in pts], [p.z for p in pts]
    w = max(max(xs) - min(xs), max(ys) - min(ys))
    z0 = FLOOR_Z[floor]
    openings.append({
        "id": f"{floor}_{wall}_{idx}",
        "floor": floor[1] + "f",  # "F1" → "1f" (rooms-<층>.json 과 같은 표기)
        "door": any(part == "DoorLeaf" for part, _ in parts),
        "center": [round((min(xs) + max(xs)) / 2, 3), round((min(ys) + max(ys)) / 2, 3)],
        "along_x": (max(xs) - min(xs)) >= (max(ys) - min(ys)),
        "width": round(w, 3),
        "bottom": round(min(zs) - z0, 3),
        "top": round(max(zs) - z0, 3),
    })

with open(out, "w", encoding="utf-8") as f:
    json.dump(openings, f, ensure_ascii=False, indent=1)
print("OPENINGS", len(openings), sum(o["door"] for o in openings), "doors")
