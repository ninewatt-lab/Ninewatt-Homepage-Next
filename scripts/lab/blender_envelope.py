"""glb 모델에서 외피(외벽·창) 면적을 층·방위별로 뽑는다. energy_idf.py 의 입력.

    blender -b --factory-startup --python scripts/lab/blender_envelope.py -- <model.glb> <env.json>

벽 면에서 바깥으로 쏜 광선이 아무것도 맞지 않으면 외벽으로 본다. 벽 메시는 개구부가 뚫려 있어 순면적이다.
방위는 도면 위쪽(Y+) = 북 가정(진북 미확정).
"""
import bpy, sys, re, json, bmesh
from mathutils import Vector
from collections import defaultdict
glb, out = sys.argv[sys.argv.index("--")+1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
scene = bpy.context.scene
dg = bpy.context.evaluated_depsgraph_get()
FLOOR_Z = {"F1": 0.0, "F2": 3.3}
WALL = re.compile(r"^(F[12])_([A-Za-z]+)$")
def orient(n):
    if abs(n.x) > abs(n.y): return "E" if n.x > 0 else "W"
    return "N" if n.y > 0 else "S"
def escapes(p, d, ignore=()):
    hit, loc, nrm, idx, ob, m = scene.ray_cast(dg, p + d*0.02, d, distance=40)
    while hit and (ob.name in ignore or ob.name.startswith(("VIS_DisplayGround","UNCONFIRMED","Roof","Cube"))):
        hit, loc, nrm, idx, ob, m = scene.ray_cast(dg, loc + d*0.02, d, distance=40)
    return not hit
walls = defaultdict(float); floors = {}
for o in scene.objects:
    if o.type != "MESH": continue
    m = WALL.match(o.name.split(".")[0])
    if not m: continue
    fl, nm = m.groups()
    me = o.data; mw = o.matrix_world; nmat = mw.to_3x3().inverted().transposed()
    if nm == "Floor":
        a = sum(p.area for p in me.polygons if (nmat @ p.normal).normalized().z > 0.9)
        # scale
        s = mw.to_scale(); floors[fl] = round(a * s.x * s.y, 2); continue
    for p in me.polygons:
        n = (nmat @ p.normal).normalized()
        if abs(n.z) > 0.2: continue
        c = mw @ p.center
        # 바깥으로 뻗은 광선이 아무것도 맞지 않으면 외벽 면 (창 유리·문짝은 개구부라 통과 대상에서 뺀다)
        hit, loc, nrm, idx, ob, mm = scene.ray_cast(dg, c + n*0.02, n, distance=40)
        ext = True
        while hit:
            if ob.name.startswith(("VIS_DisplayGround","UNCONFIRMED","Roof","Cube")) or re.search(r"_(Glass|DoorLeaf|Mullion|Jamb|HeadSill|Handle|PullHandle|SillStone)", ob.name):
                hit, loc, nrm, idx, ob, mm = scene.ray_cast(dg, loc + n*0.02, n, distance=40); continue
            ext = False; break
        if ext:
            # 실제 면적 (스케일 반영)
            vs = [mw @ me.vertices[i].co for i in p.vertices]
            area = 0.0
            for i in range(1, len(vs)-1): area += ((vs[i]-vs[0]).cross(vs[i+1]-vs[0])).length/2
            walls[(fl, orient(n))] += area
# 개구부: blender_openings.py 와 같은 묶음
PART = re.compile(r"^VIS_(F[12])_(.+)_(\d+)_(Jamb|HeadSill|Glass|Mullion|DoorLeaf|Handle|PullHandle|SillStone)")
groups = defaultdict(list)
for o in scene.objects:
    if o.type != "MESH": continue
    m = PART.match(o.name)
    if not m: continue
    fl, w, i, part = m.groups()
    groups[(fl, w, i)].append((part, [o.matrix_world @ Vector(c) for c in o.bound_box], o.name))
opens = []
for (fl, w, i), parts in sorted(groups.items()):
    jam = [ws for part, ws, _ in parts if part == "Jamb"] or [ws for part, ws, _ in parts if part != "SillStone"]
    pts = [p for ws in jam for p in ws]
    xs, ys, zs = [p.x for p in pts], [p.y for p in pts], [p.z for p in pts]
    alx = (max(xs)-min(xs)) >= (max(ys)-min(ys))
    wdt = max(max(xs)-min(xs), max(ys)-min(ys)); h = max(zs)-min(zs)
    c = Vector(((min(xs)+max(xs))/2, (min(ys)+max(ys))/2, (min(zs)+max(zs))/2))
    door = any(part == "DoorLeaf" for part, _, _ in parts)
    ign = {nm for _, _, nm in parts}
    dirs = [Vector((0,1,0)), Vector((0,-1,0))] if alx else [Vector((1,0,0)), Vector((-1,0,0))]
    side = None
    for d in dirs:
        hit, loc, nrm, idx, ob, mm = scene.ray_cast(dg, c, d, distance=40)
        free = True
        while hit:
            if ob.name in ign or ob.name.startswith(("VIS_DisplayGround","UNCONFIRMED","Roof","Cube")) or re.search(r"_(Glass|DoorLeaf|Mullion|Jamb|HeadSill|Handle|PullHandle|SillStone)", ob.name) or not ob.name.startswith(("F1_","F2_","VIS_F1_","VIS_F2_")):
                hit, loc, nrm, idx, ob, mm = scene.ray_cast(dg, loc + d*0.02, d, distance=40); continue
            # 같은 벽 마감 레이어(VIS_<층>_<벽>) 는 무시
            if ob.name.startswith("VIS_") and not PART.match(ob.name) and ob.name.split("_")[2].split(".")[0] == w:
                hit, loc, nrm, idx, ob, mm = scene.ray_cast(dg, loc + d*0.02, d, distance=40); continue
            free = False; break
        if free: side = orient(d); break
    opens.append({"id": f"{fl}_{w}_{i}", "floor": fl, "door": door, "w": round(wdt,3), "h": round(h,3), "area": round(wdt*h,3), "ext": side})
json.dump({"walls": {f"{k[0]}_{k[1]}": round(v,2) for k, v in sorted(walls.items())}, "floors": floors, "openings": opens}, open(out, "w"), indent=1)
print("DONE")
