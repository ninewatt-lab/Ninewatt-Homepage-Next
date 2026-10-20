"""부스 영상(고급판)의 3D 장면. 어두운 무대 + 백색 클레이 모델, EEVEE(레이트레이싱), 1920×1080.

    blender -b --factory-startup --python scripts/lab/blender_film.py -- <model.glb> <out_dir> <scene> [test]

scene
  rise      바닥에 깔린 1층 평면 위로 벽이 아래에서부터 세워진다. 카메라는 위에서 내려온다 (240프레임)
  section   외벽 단면 확대. 기존 콘크리트 200 → PF보드 100 → 스타코 10 이 차례로 붙는다 (240프레임)
            <out_dir>/anchors.json 에 라벨 위치(화면 비율 좌표)를 프레임마다 쓴다
  wrap      건물 전체 외벽이 아래에서 위로 마감되고, 이어서 창호가 바뀐다 (180프레임)
  thermal   열이 새는 곳이 호박색으로 빛난다. 밝기 = 열관류율 U (전 외벽 1.0 · 창 4.0 → 후 0.16 · 1.8).
            위에서 아래로 리모델링 후 값으로 바뀐다 (270프레임)
  glow      thermal 과 같은 움직임의 발광만(나머지 검정). 합성에서 흐리게 겹쳐 번짐(bloom)으로 쓴다

U 값은 energy_idf.py 와 같다. 지붕은 전후 같은 0.5. test 를 붙이면 몇 프레임만 그린다.
Blender 5.2 에서 확인했다.
"""
import json
import math
import re
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:]
glb, out, scene = args[:3]
test = "test" in args
FRAMES = {"rise": 240, "section": 240, "wrap": 180, "thermal": 270, "glow": 270}[scene]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
prefs = bpy.context.preferences.edit
prefs.keyframe_new_interpolation_type = "BEZIER"


def srgb(h, a=1.0):
    h = h.lstrip("#")
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(lin(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (a,)


def key(prop, pairs):
    """scene 사용자 속성 애니메이션. pairs = [(frame, value), …]"""
    for f, v in pairs:
        sc[prop] = v
        sc.keyframe_insert(f'["{prop}"]', frame=f)


BG = "#0d0f10"
CLAY = "#e8e3db"
AMBER = "#ff8a3d"
TEAL = "#49b6ca"


# ── 재질 ─────────────────────────────────────────────────────────────
class M:
    """노드 몇 개를 짧게 잇는 도우미."""

    def __init__(self, name):
        self.m = bpy.data.materials.new(name)
        self.m.use_nodes = True
        self.nt = self.m.node_tree
        self.nt.nodes.clear()
        self.out = self.n("ShaderNodeOutputMaterial")

    def n(self, t, **kw):
        node = self.nt.nodes.new(t)
        for k, v in kw.items():
            setattr(node, k, v)
        return node

    def link(self, a, b):
        self.nt.links.new(a, b)

    def prop(self, name):
        a = self.n("ShaderNodeAttribute", attribute_type="VIEW_LAYER", attribute_name=name)
        return a.outputs["Fac"]

    def z(self):
        sep = self.n("ShaderNodeSeparateXYZ")
        self.link(self.n("ShaderNodeNewGeometry").outputs["Position"], sep.inputs[0])
        return sep.outputs["Z"]

    def math(self, op, a, b=None):
        m = self.n("ShaderNodeMath", operation=op)
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                m.inputs[i].default_value = v
            else:
                self.link(v, m.inputs[i])
        return m.outputs[0]

    def mix(self, fac, a, b):
        m = self.n("ShaderNodeMix", data_type="RGBA")
        for i, v in ((6, a), (7, b)):
            if isinstance(v, tuple):
                m.inputs[i].default_value = v
            else:
                self.link(v, m.inputs[i])
        if isinstance(fac, (int, float)):
            m.inputs[0].default_value = fac
        else:
            self.link(fac, m.inputs[0])
        return m.outputs[2]


def surface(name, color, rough=0.85, metal=0.0, kind="clay", u=None):
    """장면에 맞춘 재질. color 는 hex 또는 (전, 후) hex 쌍."""
    w = M(name)
    bsdf = w.n("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    base = srgb(color) if isinstance(color, str) else None

    if scene == "rise":
        # 벽이 아래에서부터 세워진다: z < reveal 만 보인다
        w.link(w.math("LESS_THAN", w.z(), w.prop("reveal")), bsdf.inputs["Alpha"])
        w.m.surface_render_method = "DITHERED"
    if scene == "wrap" and kind in ("wall", "glass"):
        # 경계(z = wrap 또는 win) 아래는 새 마감, 경계 위치에 얇은 청록 띠
        p = w.prop("wrap" if kind == "wall" else "win")
        below = w.math("LESS_THAN", w.z(), p)
        col = w.mix(below, srgb(color[0]), srgb(color[1]))
        w.link(col, bsdf.inputs["Base Color"])
        band = w.math("LESS_THAN", w.math("ABSOLUTE", w.math("SUBTRACT", w.z(), p)), 0.09)
        bsdf.inputs["Emission Color"].default_value = srgb(TEAL)
        w.link(w.math("MULTIPLY", band, 14.0), bsdf.inputs["Emission Strength"])
        base = None
    if scene in ("thermal", "glow") and u is not None:
        # 발광 세기 = U × 계수 × glow. sweep 위쪽은 리모델링 후 U
        after = w.math("GREATER_THAN", w.z(), w.prop("sweep"))
        ueff = w.math("ADD", w.math("MULTIPLY", after, u[1] - u[0]), u[0])
        strength = w.math("MULTIPLY", w.math("MULTIPLY", ueff, 0.3), w.prop("glow"))
        bsdf.inputs["Emission Color"].default_value = srgb(AMBER)
        w.link(strength, bsdf.inputs["Emission Strength"])
    if scene == "glow":
        # 발광만 남긴다
        em = w.n("ShaderNodeEmission")
        em.inputs["Color"].default_value = srgb(AMBER)
        if u is not None:
            w.link(bsdf.inputs["Emission Strength"].links[0].from_socket, em.inputs["Strength"])
        else:
            em.inputs["Strength"].default_value = 0.0
        w.link(em.outputs[0], w.out.inputs["Surface"])
        return w.m
    if base:
        bsdf.inputs["Base Color"].default_value = base
    w.link(bsdf.outputs[0], w.out.inputs["Surface"])
    return w.m


# ── 무대: 바닥·조명·월드 ───────────────────────────────────────────────
def stage(center=(5.25, 4.9)):
    sc.world = bpy.data.worlds.new("W")
    sc.world.use_nodes = True
    bg = sc.world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = srgb(BG)
    bg.inputs["Strength"].default_value = 1.0 if scene != "glow" else 0.0

    bpy.ops.mesh.primitive_plane_add(size=200, location=(center[0], center[1], -0.02))
    floor = bpy.context.active_object
    floor.name = "Stage"
    w = M("stage")
    bsdf = w.n("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.8 if scene == "section" else 0.55
    # 건물에서 멀어질수록 배경색으로 녹아드는 바닥
    tc = w.n("ShaderNodeTexCoord")
    vec = w.n("ShaderNodeVectorMath", operation="DISTANCE")
    w.link(tc.outputs["Object"], vec.inputs[0])
    fade = w.math("DIVIDE", vec.outputs["Value"], 18.0)
    w.link(w.mix(w.math("MINIMUM", fade, 1.0), srgb("#1b1e20"), srgb(BG)), bsdf.inputs["Base Color"])
    if scene == "glow":
        em = w.n("ShaderNodeEmission")
        em.inputs["Strength"].default_value = 0.0
        w.link(em.outputs[0], w.out.inputs["Surface"])
    else:
        w.link(bsdf.outputs[0], w.out.inputs["Surface"])
    floor.data.materials.append(w.m)

    if scene == "glow":
        return floor
    for loc, energy, size, col in (((-9, -12, 16), 5200, 10, "#fff4e8"),   # 키: 왼쪽 앞 위, 따뜻하게
                                   ((16, -2, 7), 900, 8, "#dbe8ff"),      # 채움: 오른쪽, 차게
                                   ((6, 18, 10), 1600, 6, "#ffffff")):    # 뒤 테두리
        light = bpy.data.lights.new("L", "AREA")
        # 열화상 장면은 조명을 낮춰 발광이 읽히게 한다
        light.energy, light.size = energy * (0.4 if scene == "thermal" else 1.0), size
        light.color = srgb(col)[:3]
        ob = bpy.data.objects.new("L", light)
        sc.collection.objects.link(ob)
        ob.location = loc
        ob.rotation_euler = (Vector(center + (1.5,)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return floor


def camera(lens=70):
    cd = bpy.data.cameras.new("Cam")
    cd.lens = lens
    cd.sensor_width = 36
    cam = bpy.data.objects.new("Cam", cd)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def orbit(cam, target, frames):
    """frames = [(frame, 방위각°, 고도각°, 거리 m)] — 대상 중심을 도는 카메라 키프레임."""
    for f, az, el, dist in frames:
        a, e = math.radians(az), math.radians(el)
        cam.location = Vector(target) + Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist
        cam.rotation_euler = (Vector(target) - cam.location).to_track_quat("-Z", "Y").to_euler()
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)


def load_building():
    bpy.ops.import_scene.gltf(filepath=glb)
    for o in list(sc.objects):
        if o.type == "MESH" and (not o.name.startswith("VIS_") or "Ground" in o.name):
            bpy.data.objects.remove(o, do_unlink=True)
    WALL = re.compile(r"^VIS_F[12]_[A-Za-z]+(\.\d+)?$")
    mats = {}

    def kind(o):
        src = (o.name + " " + " ".join(m.name for m in o.data.materials if m)).lower()
        if "glazing" in src:
            return "glass"
        if "window_profile" in src:
            return "frame"
        if "unconfirmed" in src or "roof" in src or "eaves" in src:
            return "roof"
        if WALL.match(o.name) and not any(k in o.name for k in ("Floor", "Skirting", "Luminaire", "Ceiling")):
            return "wall"
        if "luminaire" in src:
            return "hide"
        return "other"

    spec = {
        "wall": dict(color=("#7f7e7a", CLAY) if scene == "wrap" else CLAY, kind="wall", u=(1.0, 0.16)),
        "glass": dict(color=("#3a4441", "#1f3439") if scene == "wrap" else "#1d2326", rough=0.08, kind="glass", u=(4.0, 1.8)),
        "frame": dict(color="#cfcac2", rough=0.6, u=(4.0, 1.8)),
        "roof": dict(color="#d6d1c9", u=(0.5, 0.5)),
        "other": dict(color="#ddd8d0"),
    }
    for o in list(sc.objects):
        if o.type != "MESH":
            continue
        k = kind(o)
        if k == "hide":
            bpy.data.objects.remove(o, do_unlink=True)
            continue
        if k not in mats:
            mats[k] = surface(k, **spec[k])
        o.data.materials.clear()
        o.data.materials.append(mats[k])


# ── 렌더 설정 ─────────────────────────────────────────────────────────
sc.render.engine = "BLENDER_EEVEE"
ee = sc.eevee
ee.taa_render_samples = 24 if scene == "glow" else 64
for attr, val in (("use_raytracing", scene != "glow"), ("use_shadows", True), ("shadow_ray_count", 2),
                  ("shadow_step_count", 8), ("use_fast_gi", True)):
    if hasattr(ee, attr):
        setattr(ee, attr, val)
sc.view_settings.view_transform = "Standard" if scene == "glow" else "AgX"
if scene != "glow":
    for look in ("AgX - Medium High Contrast", "Medium High Contrast"):
        try:
            sc.view_settings.look = look
            break
        except TypeError:
            pass
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
sc.render.fps = 30
sc.frame_start, sc.frame_end = 1, FRAMES
sc.render.image_settings.file_format = "JPEG" if scene != "glow" else "PNG"
sc.render.image_settings.quality = 94

CENTER = (5.25, 4.9, 2.6)

if scene == "rise":
    key("reveal", [(1, -0.1), (40, -0.1), (200, 8.6)])
    load_building()
    stage()
    # 바닥에 1층 평면(웹 뷰어용 투명 선도)을 연한 선으로 깐다
    import os
    plan = os.path.join(os.path.dirname(glb), "..", "lab", "ai-building-workspace", "viewer", "plan-1f.webp")
    img = bpy.data.images.load(os.path.abspath(plan))
    x0, y0, x1, y1 = -3.824, -6.103, 12.176, 16.397
    bpy.ops.mesh.primitive_plane_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, 0.003))
    pl = bpy.context.active_object
    pl.scale = (x1 - x0, y1 - y0, 1)
    w = M("plan")
    tex = w.n("ShaderNodeTexImage", image=img)
    em = w.n("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb("#9fb4b9")
    em.inputs["Strength"].default_value = 1.2
    tr = w.n("ShaderNodeBsdfTransparent")
    mx = w.n("ShaderNodeMixShader")
    w.link(tex.outputs["Alpha"], mx.inputs[0])
    w.link(tr.outputs[0], mx.inputs[1])
    w.link(em.outputs[0], mx.inputs[2])
    w.link(mx.outputs[0], w.out.inputs["Surface"])
    w.m.surface_render_method = "BLENDED"
    pl.data.materials.append(w.m)
    cam = camera(50)
    orbit(cam, (5.25, 4.9, 3.0), [(1, -20, 82, 36), (60, -24, 74, 35), (240, -40, 27, 37)])

elif scene == "section":
    stage(center=(0.6, 0.0))
    # 외벽 한 토막(폭 1.4 m, 높이 1.8 m). x = 두께 방향(+x 가 바깥)
    layers = [
        ("concrete", 0.0, 0.20, 1.80, "#9b9a95", 0.9, None),
        ("pf", 0.20, 0.30, 1.62, "#cfa96b", 0.75, (60, 115)),
        ("stucco", 0.30, 0.31, 1.46, "#eeeae3", 0.95, (125, 170)),
    ]
    obs = {}
    for name, a, b, h, col, rough, slide in layers:
        bpy.ops.mesh.primitive_cube_add(size=1)
        ob = bpy.context.active_object
        ob.name = name
        ob.scale = (b - a, 1.4, h)
        home = Vector(((a + b) / 2, 0.0, h / 2))
        ob.location = home
        bev = ob.modifiers.new("b", "BEVEL")
        bev.width, bev.segments = 0.004, 2
        w = M(name)
        bsdf = w.n("ShaderNodeBsdfPrincipled")
        bsdf.inputs["Base Color"].default_value = srgb(col)
        bsdf.inputs["Roughness"].default_value = rough
        # 재료 질감: 아주 약한 요철
        noise = w.n("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 180 if name != "pf" else 60
        bump = w.n("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.12 if name != "pf" else 0.05
        w.link(noise.outputs["Fac"], bump.inputs["Height"])
        w.link(bump.outputs["Normal"], bsdf.inputs["Normal"])
        w.link(bsdf.outputs[0], w.out.inputs["Surface"])
        ob.data.materials.append(w.m)
        if slide:
            ob.location = home + Vector((2.2, 0, 0))
            ob.keyframe_insert("location", frame=1)
            ob.keyframe_insert("location", frame=slide[0])
            ob.location = home
            ob.keyframe_insert("location", frame=slide[1])
        obs[name] = (ob, home, h, a, b)
    cam = camera(60)
    tgt = (0.25, 0.0, 0.9)
    orbit(cam, tgt, [(1, 22, 30, 7.8), (240, 13, 26, 6.9)])

else:  # wrap · thermal · glow
    if scene == "wrap":
        key("wrap", [(1, -0.2), (20, -0.2), (105, 6.6)])
        key("win", [(1, -0.2), (100, -0.2), (160, 6.6)])
        az = [(1, -58, 26, 31), (FRAMES, -48, 25, 30)]
    else:
        key("glow", [(1, 0.0), (12, 0.0), (55, 1.0)])
        key("sweep", [(1, 9.0), (110, 9.0), (200, -0.3)])
        az = [(1, -48, 25, 30), (FRAMES, -30, 23, 29)]
    load_building()
    stage()
    cam = camera(50)
    orbit(cam, CENTER, az)
    if scene == "glow":
        for ob in sc.objects:
            if ob.type == "LIGHT":
                ob.hide_render = True

if "pair" in args and scene in ("thermal", "glow"):
    # 웹 페이지 전후 비교용: 카메라를 한 자리에 고정하고 리모델링 전(before)·후(after) 두 장만 그린다
    sc.frame_set(150)
    sc.camera.animation_data_clear()
    sc.animation_data_clear()
    for name, sweep in (("before", 9.0), ("after", -0.3)):
        sc["glow"], sc["sweep"] = 1.0, sweep
        sc.render.filepath = f"{out.rstrip('/')}/pair_{name}"
        bpy.ops.render.render(write_still=True)
    print("DONE pair", scene)
    sys.exit(0)

anchors = []
frames = [1, FRAMES // 3, FRAMES * 2 // 3, FRAMES] if test else range(1, FRAMES + 1)
for f in frames:
    sc.frame_set(f)
    sc.render.filepath = f"{out.rstrip('/')}/f_{f:04d}"
    bpy.ops.render.render(write_still=True)
    if scene == "section":
        # 라벨 위치: 각 재료 윗면 바깥쪽 모서리 중앙 (화면 비율 좌표, y 는 위가 0)
        row = {}
        for name, (ob, home, h, a, b) in obs.items():
            p = ob.matrix_world.translation
            pt = Vector((p.x + (b - a) / 2, 0.55, h))
            v = world_to_camera_view(sc, sc.camera, pt)
            row[name] = [round(v.x, 4), round(1 - v.y, 4)]
        anchors.append(row)
if scene == "section":
    json.dump(anchors, open(f"{out.rstrip('/')}/anchors.json", "w"))
print("DONE", scene)
