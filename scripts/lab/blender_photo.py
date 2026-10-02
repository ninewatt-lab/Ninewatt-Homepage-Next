"""도면 주석의 마감재를 입힌 사실적 렌더링 (Cycles).

    blender -b --factory-startup --python scripts/lab/blender_photo.py -- <model.glb> <out> <mode> [rooms-1f.json rooms-2f.json] [video]

mode
  ext        외관 정지 이미지. out = png
  ext-orbit  외관을 60° 돌아가는 120프레임. out = 폴더
  cut1       1층 단면(1.4 m) 정지 이미지. out = png
  walk       대기실 눈높이(투시) 정지 이미지. out = png
  walk-anim  대기실 둘러보기 120프레임 (blender_render.py walk 와 같은 경로). out = 폴더

재질은 도면 주석(공사도면 마감 표기)을 따른다. 도면에 없는 가구·소품은 넣지 않는다.
  외벽   T100 PF보드 / 스타코             지붕   T0.7 리얼징크 (형태는 미확정)
  창호   플라스틱 이중미서기 / T24 컬러로이 복층유리
  1층    바닥 중보행용 데코타일 · 벽 수성페인트 · 천장 석고보드 페인트
  1층 화장실  바닥 자기질타일 · 벽 도기질타일 · 천장 SMC
  2층    바닥 비닐계시트 · 벽 벽지 · 천장 석고보드 천정지
실내 조명은 rooms-<층>.json 의 실 중심 천장에 면광원을 둔다(도면에 조명 배치가 없어 위치만 근사).
Blender 4.0 + Metal GPU 에서 확인했다.
"""
import json
import math
import os
import sys

import bpy
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
glb, out, mode = args[:3]
extra = args[3:]
room_files = [a for a in extra if a.endswith(".json")]
video = "video" in extra
draft = "draft" in extra  # 조정용 저해상도·저샘플

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene

for o in list(sc.objects):
    if o.type == "MESH" and (not o.name.startswith("VIS_") or "Ground" in o.name):
        bpy.data.objects.remove(o, do_unlink=True)

CENTER = Vector((5.25, 4.9, 0.0))  # 건물 평면 중심 (외벽 안/밖 판정에 쓴다)
F2_FLOOR = 3.3
SUN_ROT = float(next((a.split("=")[1] for a in extra if a.startswith("sun=")), 140))  # 해 방위(°)


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


# ── 재질 ─────────────────────────────────────────────────────────────

def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return m, nt, bsdf


def plain(name, color, rough, metal=0.0, bump=0.0, bump_scale=60.0):
    m, nt, b = new_mat(name)
    b.inputs["Base Color"].default_value = srgb(color)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if bump:
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = bump_scale
        tex.inputs["Detail"].default_value = 8
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = 0.002
        nt.links.new(tex.outputs["Fac"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def wall(name, outside_color, inside_color):
    """외벽 객체 하나에 바깥면 스타코 / 안쪽면 실내 마감. 면 법선이 건물 중심 반대쪽이면 바깥."""
    m, nt, b = new_mat(name)
    n = nt.nodes
    geo = n.new("ShaderNodeNewGeometry")
    sub = n.new("ShaderNodeVectorMath"); sub.operation = "SUBTRACT"
    sub.inputs[1].default_value = CENTER
    nt.links.new(geo.outputs["Position"], sub.inputs[0])
    flat = n.new("ShaderNodeVectorMath"); flat.operation = "MULTIPLY"
    flat.inputs[1].default_value = (1, 1, 0)
    nt.links.new(sub.outputs[0], flat.inputs[0])
    dot = n.new("ShaderNodeVectorMath"); dot.operation = "DOT_PRODUCT"
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    nt.links.new(flat.outputs[0], dot.inputs[1])
    gt = n.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.0
    nt.links.new(dot.outputs["Value"], gt.inputs[0])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = srgb(inside_color)
    mix.inputs[7].default_value = srgb(outside_color)
    nt.links.new(gt.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.85
    # 스타코 질감은 바깥면에만
    tex = n.new("ShaderNodeTexNoise"); tex.inputs["Scale"].default_value = 90; tex.inputs["Detail"].default_value = 10
    amt = n.new("ShaderNodeMath"); amt.operation = "MULTIPLY"
    nt.links.new(tex.outputs["Fac"], amt.inputs[0]); nt.links.new(gt.outputs[0], amt.inputs[1])
    bp = n.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.35; bp.inputs["Distance"].default_value = 0.003
    nt.links.new(amt.outputs[0], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


def floor_1f():
    """데코타일(옅은 회베이지) + 화장실 영역만 자기질타일(밝은 회색). 줄눈은 모델의 FloorJoint 객체."""
    m, nt, b = new_mat("Deco tile / porcelain")
    n = nt.nodes
    geo = n.new("ShaderNodeNewGeometry")
    sep = n.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sep.inputs[0])

    def between(src, lo, hi):
        a = n.new("ShaderNodeMath"); a.operation = "GREATER_THAN"; a.inputs[1].default_value = lo
        c = n.new("ShaderNodeMath"); c.operation = "LESS_THAN"; c.inputs[1].default_value = hi
        nt.links.new(src, a.inputs[0]); nt.links.new(src, c.inputs[0])
        mul = n.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
        nt.links.new(a.outputs[0], mul.inputs[0]); nt.links.new(c.outputs[0], mul.inputs[1])
        return mul.outputs[0]

    # 1층 화장실: 모델 x 7.9–10.35, y 5.5–7.4 (바닥 줄눈 간격이 0.3 m 로 바뀌는 구역)
    inx, iny = between(sep.outputs["X"], 7.9, 10.35), between(sep.outputs["Y"], 5.5, 7.4)
    toilet = n.new("ShaderNodeMath"); toilet.operation = "MULTIPLY"
    nt.links.new(inx, toilet.inputs[0]); nt.links.new(iny, toilet.inputs[1])
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 6
    ramp = n.new("ShaderNodeMix"); ramp.data_type = "RGBA"
    ramp.inputs[6].default_value = srgb("#bfb5a5"); ramp.inputs[7].default_value = srgb("#cbc1b1")
    nt.links.new(noise.outputs["Fac"], ramp.inputs[0])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[7].default_value = srgb("#e6e6e3")
    nt.links.new(ramp.outputs[2], mix.inputs[6]); nt.links.new(toilet.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.42
    return m


def floor_2f():
    """비닐계시트 — 국내 주거에서 흔한 목무늬 장판."""
    m, nt, b = new_mat("Vinyl sheet")
    n = nt.nodes
    tc = n.new("ShaderNodeTexCoord")
    mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.6, 7.0, 1.0)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    wave = n.new("ShaderNodeTexWave"); wave.inputs["Scale"].default_value = 2.5
    wave.inputs["Distortion"].default_value = 6; wave.inputs["Detail"].default_value = 4
    nt.links.new(mp.outputs[0], wave.inputs["Vector"])
    ramp = n.new("ShaderNodeMix"); ramp.data_type = "RGBA"
    ramp.inputs[6].default_value = srgb("#a9845c"); ramp.inputs[7].default_value = srgb("#c39d72")
    nt.links.new(wave.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.38
    return m


def glass():
    """T24 컬러로이 복층유리. 그림자 광선은 통과시켜 실내에 햇빛이 들게 한다."""
    m, nt, b = new_mat("Low-E glass")
    n = nt.nodes
    b.inputs["Base Color"].default_value = srgb("#cfe0de")
    b.inputs["Roughness"].default_value = 0.0
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["IOR"].default_value = 1.5
    lp = n.new("ShaderNodeLightPath")
    tr = n.new("ShaderNodeBsdfTransparent"); tr.inputs["Color"].default_value = srgb("#e3efed")
    mix = n.new("ShaderNodeMixShader")
    outn = n["Material Output"]
    nt.links.new(lp.outputs["Is Shadow Ray"], mix.inputs[0])
    nt.links.new(b.outputs[0], mix.inputs[1]); nt.links.new(tr.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], outn.inputs["Surface"])
    return m


def top_only(m, side_color="#ece7df"):
    """바닥 객체의 옆면(외벽 쪽 슬래브 끝)은 바닥재 대신 외벽색으로."""
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    link = next(l for l in nt.links if l.to_socket == b.inputs["Base Color"])
    src = link.from_socket
    nt.links.remove(link)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Normal"], sep.inputs[0])
    up = nt.nodes.new("ShaderNodeMath"); up.operation = "GREATER_THAN"; up.inputs[1].default_value = 0.5
    nt.links.new(sep.outputs["Z"], up.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = srgb(side_color)
    nt.links.new(up.outputs[0], mix.inputs[0]); nt.links.new(src, mix.inputs[7])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def backface_fill(m, color, strength=0.7):
    """모델의 벽·창틀 이음매에 생기는 좁은 틈으로 벽 속 뒷면이 보이면 검게 나온다.
    뒷면은 같은 색으로 약하게 발광시켜 틈이 드러나지 않게 한다."""
    nt = m.node_tree
    outn = nt.nodes["Material Output"]
    link = next(l for l in nt.links if l.to_socket == outn.inputs["Surface"])
    src = link.from_socket
    nt.links.remove(link)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb(color)
    em.inputs["Strength"].default_value = strength
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(geo.outputs["Backfacing"], mix.inputs[0])
    nt.links.new(src, mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], outn.inputs["Surface"])
    return m


M = {
    "wall1": wall("1F wall: stucco / paint", "#e9e6df", "#f2f1ec"),
    "wall2": wall("2F wall: stucco / wallpaper", "#e9e6df", "#f1ede4"),
    "int1": plain("1F interior paint", "#f2f1ec", 0.75),
    "int2": plain("2F wallpaper", "#f1ede4", 0.8, bump=0.08, bump_scale=300),
    "ceiling": plain("Gypsum board ceiling", "#f6f6f4", 0.9),
    "floor1": top_only(floor_1f()),
    "floor2": top_only(floor_2f()),
    "joint": plain("Tile joint", "#7d776e", 0.7),
    "tile": plain("Porcelain tile", "#e4e4e1", 0.35),
    "slab": plain("Concrete slab", "#c9c6bf", 0.85, bump=0.15),
    "zinc": plain("Real zinc roof", "#4f5559", 0.38, metal=0.85, bump=0.05, bump_scale=20),
    "pvc": plain("PVC window frame", "#eeeeec", 0.3),
    "glass": glass(),
    "door": plain("Interior door", "#e9e5dd", 0.45),
    "metal": plain("Stainless", "#b9bcbf", 0.25, metal=1.0),
    "sill": plain("Stone sill", "#d6d2ca", 0.5),
    "ground": plain("Site ground", "#8f8c86", 0.95, bump=0.2, bump_scale=8),
}
for key, col in (("wall1", "#f2f1ec"), ("wall2", "#f1ede4"), ("int1", "#f2f1ec"), ("int2", "#f1ede4"),
                 ("ceiling", "#f6f6f4"), ("pvc", "#eeeeec"), ("door", "#e9e5dd"), ("sill", "#d6d2ca")):
    backface_fill(M[key], col)


def pick(o):
    n = o.name
    mats = " ".join(m.name for m in o.data.materials if m).lower()
    f2 = "_F2_" in n
    if "UNCONFIRMED" in n or "Roof" in n or "Eaves" in n:
        return M["zinc"]
    if "Glass" in n or "glazing" in mats:
        return M["glass"]
    if "FloorJoint" in n:
        return M["joint"]
    # 실별 바닥 마감 판 (예: VIS_F1_대기실_Floor). 재질 이름이 마감 종류를 알려 준다
    if n.endswith("_Floor") or "_Floor." in n:
        if "porcelain" in mats:
            return M["tile"]
        return M["floor2" if f2 else "floor1"]
    if "ContinuousCeiling" in n:
        return M["ceiling"]
    if "Floor_" in n:
        return M["floor2" if f2 else "floor1"]
    if "Balcony" in n:
        return M["slab"]
    if "Handle" in n:
        return M["metal"]
    if "DoorLeaf" in n:
        return M["door"]
    if "SillStone" in n:
        return M["sill"]
    if any(k in n for k in ("Jamb", "HeadSill", "Mullion")) or "window_profile" in mats:
        return M["pvc"]
    if "stucco" in mats or "exterior" in mats:
        return M["wall2" if f2 else "wall1"]
    if "interior" in mats or "paint" in mats:
        return M["int2" if f2 else "int1"]
    return M["int2" if f2 else "int1"]


for o in sc.objects:
    if o.type == "MESH":
        mat = pick(o)
        o.data.materials.clear()
        o.data.materials.append(mat)

# 대지
bpy.ops.mesh.primitive_plane_add(size=600, location=(5, 5, -0.21))
ground = bpy.context.active_object
ground.data.materials.append(M["ground"])

# ── 조명 ─────────────────────────────────────────────────────────────

world = bpy.data.worlds.new("Sky")
sc.world = world
world.use_nodes = True
wn = world.node_tree.nodes
sky = wn.new("ShaderNodeTexSky")
sky.sky_type = "NISHITA"
sky.sun_elevation = math.radians(28)
sky.sun_intensity = 1.6
sky.sun_rotation = math.radians(SUN_ROT)
sky.air_density = 1.2
sky.dust_density = 1.6
world.node_tree.links.new(sky.outputs["Color"], wn["Background"].inputs["Color"])
wn["Background"].inputs["Strength"].default_value = 0.1


def room_lights():
    """실 중심 천장(바닥 + 2.7 m)에 면광원."""
    for path in room_files:
        # 경로 전체가 아니라 파일 이름으로 판별 (폴더 이름에 "2f" 가 섞일 수 있다)
        floor_z = F2_FLOOR if os.path.basename(path).startswith("rooms-2f") else 0.0
        for r in json.load(open(path, encoding="utf-8")):
            x, y = r["model_xy"]
            ld = bpy.data.lights.new("Room", "AREA")
            ld.shape = "RECTANGLE"
            ld.size, ld.size_y = 1.2, 1.2
            ld.energy = 70 * max(1.0, r["area_m2"] / 12)
            ld.color = (1.0, 0.97, 0.93)
            lo = bpy.data.objects.new("Room", ld)
            lo.location = (x, y, floor_z + 2.68)
            sc.collection.objects.link(lo)


room_lights()

# ── 렌더 설정 ────────────────────────────────────────────────────────

sc.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL"
prefs.get_devices()
for d in prefs.devices:
    d.use = True
sc.cycles.device = "GPU"
sc.cycles.use_denoising = True
sc.cycles.use_adaptive_sampling = True
sc.cycles.samples = 64 if video else 384
sc.render.use_persistent_data = True  # 프레임마다 장면을 다시 올리지 않는다
sc.cycles.max_bounces = 8
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.film_transparent = False
sc.render.resolution_x, sc.render.resolution_y = (1280, 720) if video else (2400, 1500)
if draft:
    sc.render.resolution_percentage = 50
    sc.cycles.samples = 24

cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam


def aim(target):
    cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()


def orbit_location(angle_deg, dist=21.0, height=6.5, target=(5.25, 4.9, 3.2)):
    a = math.radians(angle_deg)
    return Vector((target[0] + dist * math.sin(a), target[1] - dist * math.cos(a), height))


def frames(n):
    sc.frame_start, sc.frame_end = 1, n
    sc.render.filepath = out.rstrip("/") + "/f_"
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


def still():
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)


EXT_TARGET = (5.25, 4.9, 3.2)

if mode in ("ext", "ext-orbit"):
    cam_data.lens = 35
    if mode == "ext":
        cam.location = orbit_location(-30)
        aim(EXT_TARGET)
        still()
    else:
        # -50° → +10° 로 천천히 돈다 (정면 현관에서 동측으로)
        n = 120
        for f, ang in ((1, -50.0), (n, 10.0)):
            sc.frame_set(f)
            cam.location = orbit_location(ang)
            aim(EXT_TARGET)
            cam.keyframe_insert("location", frame=f)
            cam.keyframe_insert("rotation_euler", frame=f)
        # 직선 보간하면 원 대신 현을 따라가므로 중간 키를 더 둔다
        for f in range(1, n + 1, 10):
            ang = -50.0 + 60.0 * (f - 1) / (n - 1)
            cam.location = orbit_location(ang)
            aim(EXT_TARGET)
            cam.keyframe_insert("location", frame=f)
            cam.keyframe_insert("rotation_euler", frame=f)
        frames(n)

elif mode == "cut1":
    # blender_render.py cut1 과 같은 구도
    for o in list(sc.objects):
        if o.type == "MESH" and ("_F2_" in o.name or "UNCONFIRMED" in o.name or "Roof" in o.name
                                 or "Eaves" in o.name or "F1_ContinuousCeiling" in o.name):
            bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, 5, 1.4 + 25))
    cutter = bpy.context.active_object
    cutter.scale = (60, 60, 50)
    cutter.hide_render = True
    mods = []
    for o in sc.objects:
        if o.type == "MESH" and o not in (cutter, ground):
            md = o.modifiers.new("cut", "BOOLEAN"); md.operation = "DIFFERENCE"; md.solver = "EXACT"; md.object = cutter
            mods.append((o, md))
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for o, md in mods:
        ev = o.evaluated_get(dg)
        if any((ev.matrix_world @ v.co).z > 1.45 for v in ev.data.vertices):
            md.solver = "FAST"
    # 천장을 걷어냈으니 천장 조명도 뺀다 (햇빛만)
    for lo in [o for o in sc.objects if o.type == "LIGHT"]:
        bpy.data.objects.remove(lo, do_unlink=True)
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 17.5
    pivot = bpy.data.objects.new("Pivot", None)
    sc.collection.objects.link(pivot)
    pivot.location = (5.25, 4.9, 2.2)
    cam.parent = pivot
    cam.location = Vector((0, -60, 60 * math.tan(math.radians(52))))
    cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
    pivot.rotation_euler = (0, 0, math.radians(-38))
    sc.view_settings.exposure = -0.4  # 위에서 직사광을 받는 흰 바닥이 날아가지 않게
    still()

elif mode in ("walk", "walk-anim"):
    # blender_render.py walk 와 같은 위치·경로. 실내 노출을 올린다
    cam_data.lens = 16
    cam_data.clip_start = 0.05
    cam.location = Vector((6.35, 4.2, 1.5))
    sc.view_settings.exposure = 0.1
    if mode == "walk":
        aim((3.6, 6.4, 1.3))
        still()
    else:
        aim((2.2, 5.3, 1.3))
        cam.keyframe_insert("rotation_euler", frame=1)
        aim((4.6, 8.0, 1.3))
        cam.keyframe_insert("rotation_euler", frame=120)
        for fc in cam.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "BEZIER"
                kp.easing = "EASE_IN_OUT"
        frames(120)
