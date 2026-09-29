"""glb 모델의 선화 렌더링 (EEVEE + Freestyle). 흰 면, 회색 창호, 미확정 요소는 주황.

    blender -b --factory-startup --python scripts/lab/blender_render.py -- <model.glb> <out> <mode> [rooms.json]

mode
  front      정면 입면. out = png. dxf_elevation.py 출력과 같은 축척·중심(1461×960)
  axo        외관 투시도(평행 투영). out = png (투명 배경)
  turntable  한 바퀴 회전 150프레임. out = 프레임 폴더
  explode    지붕·2층을 들어 올리는 90프레임 (turntable 마지막 화면에서 이어진다). out = 프레임 폴더
  cut1       1층 단면(1.4 m 에서 잘라 내려다봄). out = png. rooms.json 을 주면 <out>.labels.json 도 쓴다
  cut2       2층 단면. cut1 과 같음
  walk       대기실 눈높이에서 둘러보는 120프레임(투시 투영). out = 프레임 폴더

  cut1/cut2 뒤에 "video" 를 붙이면 영상용 1280×720 으로 렌더링한다.

glb 에는 분석용 원본 객체와 표현용 VIS_* 객체가 겹쳐 있어 VIS_* 만 남긴다.
이름에 UNCONFIRMED 가 들어간 객체(파이프라인이 도면으로 확정하지 못한 요소)를 주황으로 칠한다.
rooms.json 은 dxf_plan_figures.py 가 만든 rooms-<floor>.json (모델 좌표의 실 라벨 위치).
Blender 4.0 에서 확인했다.
"""
import json
import math
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
glb, out, mode = args[:3]
extra = args[3:]
rooms_path = next((a for a in extra if a.endswith(".json")), None)
video = "video" in extra

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene

for o in list(sc.objects):
    if o.type == "MESH" and (not o.name.startswith("VIS_") or "Ground" in o.name):
        bpy.data.objects.remove(o, do_unlink=True)

F1_TOP, F2_FLOOR = 3.1, 3.3  # 1층 벽 상단 / 2층 바닥 윗면 (m)


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def flat(col):
    """조명 영향 없는 단색 재질 (선화용)."""
    name = "flat_" + col
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = hexrgb(col)
    nt.links.new(em.outputs["Emission"], nt.nodes.new("ShaderNodeOutputMaterial").inputs["Surface"])
    return m


# 객체 이름 + 재질 이름으로 판단한다 (VIS_ 지붕은 재질 이름에 UNCONFIRMED 가 없다)
FILL = [("UNCONFIRMED", "#f3c99a"), ("Glazing", "#dfe7ea"), ("Window_profile", "#9aa3ab"),
        ("FloorJoint", "#c9ced2"), ("Floor_", "#f4f5f6"), ("Balcony", "#f4f5f6")]
for o in sc.objects:
    if o.type != "MESH":
        continue
    src = (o.name + " " + " ".join(m.name for m in o.data.materials if m)).lower()
    col = next((c for k, c in FILL if k.lower() in src), "#ffffff")
    o.data.materials.clear()
    o.data.materials.append(flat(col))


def is_roof(o):
    return "UNCONFIRMED" in o.name or "Roof" in o.name or "Eaves" in o.name


def is_f2(o):
    return "_F2_" in o.name


def remove(pred):
    for o in list(sc.objects):
        if o.type == "MESH" and pred(o):
            bpy.data.objects.remove(o, do_unlink=True)


def cut_above(z, pred):
    """z 위를 잘라낸다(단면). 잘린 면의 윤곽이 Freestyle 선으로 남는다."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(5, 5, z + 25))
    cutter = bpy.context.active_object
    cutter.scale = (60, 60, 50)
    cutter.hide_render = True
    mods = []
    for o in sc.objects:
        if o.type == "MESH" and o is not cutter and pred(o):
            mod = o.modifiers.new("cut", "BOOLEAN")
            mod.operation = "DIFFERENCE"
            mod.solver = "EXACT"
            mod.object = cutter
            mods.append((o, mod))
    # EXACT 가 조용히 실패하는 메시가 있다(이 모델에선 동쪽 외벽). 잘린 뒤에도 z 위로
    # 정점이 남으면 FAST 로 바꾼다.
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for o, mod in mods:
        ev = o.evaluated_get(dg)
        if any((ev.matrix_world @ v.co).z > z + 0.05 for v in ev.data.vertices):
            mod.solver = "FAST"


sc.render.engine = "BLENDER_EEVEE"
sc.view_settings.view_transform = "Standard"
sc.world = bpy.data.worlds.new("W")
sc.world.color = (1, 1, 1)
sc.render.film_transparent = True
sc.render.use_freestyle = True
sc.render.line_thickness_mode = "ABSOLUTE"
sc.render.line_thickness = 1.1
fs = sc.view_layers[0].freestyle_settings
ls = fs.linesets[0] if fs.linesets else fs.linesets.new("L")
ls.select_by_visibility = True
ls.select_silhouette = ls.select_border = ls.select_crease = True
if ls.linestyle is None:
    ls.linestyle = bpy.data.linestyles.new("Ink")
ls.linestyle.color = hexrgb("#1f2933")[:3]
ls.linestyle.thickness = 1.1

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam = bpy.data.objects.new("Cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam

START = math.radians(-38)  # 정면(현관)과 서측이 함께 보이는 각도


def orbit_camera(elevation_deg, target=(5.25, 4.9, 3.5)):
    """건물 중심을 도는 피벗에 카메라를 단다."""
    pivot = bpy.data.objects.new("Pivot", None)
    sc.collection.objects.link(pivot)
    pivot.location = Vector(target)
    cam.parent = pivot
    cam.location = Vector((0, -60, 60 * math.tan(math.radians(elevation_deg))))
    cam.rotation_euler = (-cam.location).to_track_quat("-Z", "Y").to_euler()
    pivot.rotation_euler = (0, 0, START)
    return pivot


def linear(obj):
    for fc in obj.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"


def render_frames(n):
    sc.frame_start, sc.frame_end = 1, n
    sc.render.filepath = out.rstrip("/") + "/f_"
    sc.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)


if mode == "front":
    # dxf_elevation.py 는 도면 x 366,800–381,300 mm 를 1461 px 에, y 는 221,150 mm 중심으로 그린다.
    # 모델 x -1.0 m ↔ 도면 x 367,649. z 는 elevation_overlay.py --register 로 찾은 값:
    # 모델 z 0(1층 바닥)이 도면 지반선보다 약 0.49 m 위.
    cam_data.ortho_scale = 14.5
    cam.location = Vector((5.381, -60.0, 3.364))
    cam.rotation_euler = Vector((0, 1, 0)).to_track_quat("-Z", "Z").to_euler()
    sc.render.resolution_x, sc.render.resolution_y = 1461, 960
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)

elif mode == "axo":
    orbit_camera(30)
    cam_data.ortho_scale = 20.5
    sc.render.resolution_x, sc.render.resolution_y = 2400, 1600
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)

elif mode == "turntable":
    pivot = orbit_camera(30)
    # 회전하면 평면 대각선이 더 넓게 돌아 나가므로 화면을 넉넉히 잡는다
    cam_data.ortho_scale = 25.0
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    sc.render.line_thickness = 1.0
    n = 150
    pivot.keyframe_insert("rotation_euler", index=2, frame=1)
    pivot.rotation_euler = (0, 0, START - 2 * math.pi)
    pivot.keyframe_insert("rotation_euler", index=2, frame=n + 1)
    linear(pivot)
    render_frames(n)

elif mode == "explode":
    # turntable 과 같은 카메라에서 지붕 → 2층 순서로 들어 올린다
    pivot = orbit_camera(30)
    cam_data.ortho_scale = 25.0
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    sc.render.line_thickness = 1.0
    # 들어 올리는 동안 화면도 같이 올리고 넓힌다 (첫 프레임은 turntable 마지막과 같다)
    pivot.keyframe_insert("location", index=2, frame=1)
    cam_data.keyframe_insert("ortho_scale", frame=1)
    pivot.location.z += 2.2
    cam_data.ortho_scale = 29.0
    pivot.keyframe_insert("location", index=2, frame=75)
    cam_data.keyframe_insert("ortho_scale", frame=75)
    for o in sc.objects:
        if o.type != "MESH":
            continue
        lift = 3.6 if is_roof(o) else 2.0 if is_f2(o) else 0.0
        if not lift:
            continue
        o.keyframe_insert("location", index=2, frame=1)
        o.location.z += lift
        o.keyframe_insert("location", index=2, frame=75)
        for fc in o.animation_data.action.fcurves:  # 부드럽게 멈추도록
            for kp in fc.keyframe_points:
                kp.interpolation = "BEZIER"
                kp.easing = "EASE_IN_OUT"
    render_frames(90)

elif mode in ("cut1", "cut2"):
    remove(is_roof)
    if mode == "cut1":
        remove(is_f2)
        remove(lambda o: "F1_ContinuousCeiling" in o.name)
        cut_above(1.4, lambda o: True)
        target, floor_z, scale = (5.25, 4.9, 2.2), 0.0, 17.5
    else:
        remove(lambda o: "F2_ContinuousCeiling" in o.name)
        cut_above(F2_FLOOR + 1.4, is_f2)
        # 1층 외벽이 아래로 드러나므로 조금 더 넓게
        target, floor_z, scale = (5.25, 4.9, F2_FLOOR + 1.2), F2_FLOOR, 19.0
    # 내려다보는 각이 크면 건물 뒤쪽이 화면 위로 올라가므로 중심을 바닥보다 높게 잡는다
    orbit_camera(52, target)
    cam_data.ortho_scale = scale
    sc.render.resolution_x, sc.render.resolution_y = (1280, 720) if video else (2400, 1500)
    if video:
        sc.render.line_thickness = 1.0
    sc.render.filepath = out
    bpy.context.view_layer.update()
    if rooms_path:
        with open(rooms_path, encoding="utf-8") as f:
            rooms = json.load(f)
        labels = []
        for r in rooms:
            p = world_to_camera_view(sc, cam, Vector((r["model_xy"][0], r["model_xy"][1], floor_z + 0.05)))
            labels.append({**r, "px": [p.x * sc.render.resolution_x, (1 - p.y) * sc.render.resolution_y]})
        with open(out + ".labels.json", "w", encoding="utf-8") as f:
            json.dump(labels, f, ensure_ascii=False, indent=1)
    bpy.ops.render.render(write_still=True)

elif mode == "walk":
    # 대기실 동쪽에서 서쪽 창 → 진료실 문 쪽으로 천천히 고개를 돌린다
    remove(is_roof)
    cam_data.type = "PERSP"
    cam_data.lens = 14
    cam_data.clip_start = 0.05
    cam.location = Vector((6.35, 4.2, 1.5))
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    sc.render.line_thickness = 1.0

    def look(target):
        return (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()

    cam.rotation_euler = look((2.2, 5.3, 1.3))
    cam.keyframe_insert("rotation_euler", frame=1)
    cam.rotation_euler = look((4.6, 8.0, 1.3))
    cam.keyframe_insert("rotation_euler", frame=120)
    for fc in cam.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"
            kp.easing = "EASE_IN_OUT"
    render_frames(120)
