"""부스 영상용 그린리모델링·열화상 장면 (EEVEE + Freestyle, 1920×1080, 150프레임).

    blender -b --factory-startup --python scripts/lab/blender_energy.py -- <model.glb> <out_dir> <mode>

mode
  insulate  외벽이 아래에서 위로 외단열(노랑)로 감싸이고(1–75), 이어서 창호 유리가 새 창(청록)으로 바뀐다(80–125)
  thermal   열화상 색. 리모델링 전 열관류율(외벽 1.0, 창 4.0)에서 위→아래로 후(외벽 0.16, 창 1.8)로 바뀐다(45–105)
            색은 U 값을 0–4 W/㎡K 눈금에 놓은 것이다. 지붕은 전후 같은 0.5.

카메라는 blender_render.py 의 axo 와 같은 30° 평행 투영에서 15° 천천히 돈다.
U 값은 energy_idf.py 와 같다. 색 눈금 범례는 expo_cards.py 가 따로 그린다.
"""
import math
import re
import sys

import bpy
from mathutils import Vector

glb, out, mode = sys.argv[sys.argv.index("--") + 1:][:3]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene

for o in list(sc.objects):
    if o.type == "MESH" and (not o.name.startswith("VIS_") or "Ground" in o.name):
        bpy.data.objects.remove(o, do_unlink=True)

N = 150
WALL = re.compile(r"^VIS_F[12]_[A-Za-z]+(\.\d+)?$")
NOT_WALL = ("Floor", "Skirting", "Luminaire", "Ceiling")


def hexrgb(h):
    """#rrggbb(sRGB) → 선형 RGBA. 재질 색은 선형으로 넣어야 화면에서 같은 색이 나온다."""
    h = h.lstrip("#")
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


# 열화상 눈금: U 0 → 4 W/㎡K (파랑 → 노랑 → 빨강)
RAMP = [(0.0, "#313695"), (0.5, "#4575b4"), (1.0, "#fdae61"), (2.0, "#f46d43"), (4.0, "#a50026")]


def ucolor(u):
    for (u0, c0), (u1, c1) in zip(RAMP, RAMP[1:]):
        if u <= u1:
            t = (u - u0) / (u1 - u0)
            a, b = hexrgb(c0), hexrgb(c1)
            return tuple(a[i] + (b[i] - a[i]) * t for i in range(3)) + (1.0,)
    return hexrgb(RAMP[-1][1])


def kind(o):
    src = (o.name + " " + " ".join(m.name for m in o.data.materials if m)).lower()
    if "glazing" in src:
        return "glass"
    if "window_profile" in src:
        return "frame"
    if "unconfirmed" in src or "roof" in src or "eaves" in src:
        return "roof"
    if WALL.match(o.name) and not any(k in o.name for k in NOT_WALL):
        return "wall"
    return "other"


def sweep_mat(name, c_from, c_to, z_from, z_to, f0, f1):
    """월드 z 기준 경계가 f0→f1 프레임 동안 z_from→z_to 로 움직이며 색이 바뀌는 무광 재질."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    val = nt.nodes.new("ShaderNodeValue")
    cmp = nt.nodes.new("ShaderNodeMath")
    cmp.operation = "LESS_THAN" if z_to > z_from else "GREATER_THAN"
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = c_from
    mix.inputs[7].default_value = c_to
    em = nt.nodes.new("ShaderNodeEmission")
    outn = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(geo.outputs["Position"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], cmp.inputs[0])
    nt.links.new(val.outputs[0], cmp.inputs[1])
    nt.links.new(cmp.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], em.inputs["Color"])
    nt.links.new(em.outputs["Emission"], outn.inputs["Surface"])
    v = val.outputs[0]
    v.default_value = z_from
    v.keyframe_insert("default_value", frame=f0)
    v.default_value = z_to
    v.keyframe_insert("default_value", frame=f1)
    return m


def flat(name, col):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = col
    nt.links.new(em.outputs["Emission"], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"])
    return m


# 새 키프레임 보간: 색 경계는 부드럽게(BEZIER), 카메라 회전은 일정하게(LINEAR). 4.4+ 의 layered action 에서도 동작
prefs = bpy.context.preferences.edit
prefs.keyframe_new_interpolation_type = "BEZIER"
WHITE, FRAME, ROOF = hexrgb("#ffffff"), hexrgb("#9aa3ab"), hexrgb("#e4e7ea")
TOP = 6.5
if mode == "insulate":
    mats = {
        "wall": sweep_mat("wall", WHITE, hexrgb("#f4c95d"), -0.2, TOP, 1, 75),
        "glass": sweep_mat("glass", hexrgb("#dfe7ea"), hexrgb("#3896A8"), -0.2, TOP, 80, 125),
        "frame": flat("frame", FRAME),
        "roof": flat("roof", ROOF),
        "other": flat("other", WHITE),
    }
else:
    mats = {
        "wall": sweep_mat("wall", ucolor(1.0), ucolor(0.16), TOP, -0.2, 45, 105),
        "glass": sweep_mat("glass", ucolor(4.0), ucolor(1.8), TOP, -0.2, 45, 105),
        "frame": sweep_mat("frame", ucolor(4.0), ucolor(1.8), TOP, -0.2, 45, 105),
        "roof": flat("roof", ucolor(0.5)),
        "other": flat("other", hexrgb("#f4f5f6")),
    }
for o in sc.objects:
    if o.type != "MESH":
        continue
    k = kind(o)
    o.data.materials.clear()
    o.data.materials.append(mats[k])


sc.render.engine = "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"
sc.world = bpy.data.worlds.new("W")
sc.world.use_nodes = True
bg = sc.world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (1, 1, 1, 1)
bg.inputs["Strength"].default_value = 1.0
sc.render.film_transparent = False
sc.render.use_freestyle = True
sc.render.line_thickness_mode = "ABSOLUTE"
sc.render.line_thickness = 1.4
fs = sc.view_layers[0].freestyle_settings
ls = fs.linesets[0] if fs.linesets else fs.linesets.new("L")
ls.select_by_visibility = True
ls.select_silhouette = ls.select_border = ls.select_crease = True
if ls.linestyle is None:
    ls.linestyle = bpy.data.linestyles.new("Ink")
ls.linestyle.color = hexrgb("#1f2933")[:3]
ls.linestyle.thickness = 1.4

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam_data.ortho_scale = 22.0
cam = bpy.data.objects.new("Cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
pivot = bpy.data.objects.new("Pivot", None)
sc.collection.objects.link(pivot)
pivot.location = Vector((5.4, 4.9, 4.0))
cam.parent = pivot
cam.location = Vector((0, -60, 60 * math.tan(math.radians(30))))
cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
START = math.radians(-38)
pivot.rotation_euler = (0, 0, START)
prefs.keyframe_new_interpolation_type = "LINEAR"
pivot.keyframe_insert("rotation_euler", index=2, frame=1)
pivot.rotation_euler = (0, 0, START + math.radians(15))
pivot.keyframe_insert("rotation_euler", index=2, frame=N)

sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, N
sc.render.image_settings.file_format = "PNG"
if "test" in sys.argv:  # 확인용: 세 프레임만
    for f in (1, 70, 140):
        sc.frame_set(f)
        sc.render.filepath = f"{out.rstrip('/')}/test_{f:03d}.png"
        bpy.ops.render.render(write_still=True)
else:
    sc.render.filepath = out.rstrip("/") + "/f_"
    bpy.ops.render.render(animation=True)
print("DONE", mode)
