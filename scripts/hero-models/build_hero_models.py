"""
홈 히어로 3D 설비 모델 생성 (Blender 5.x, 배경 실행).

    /Applications/Blender.app/Contents/MacOS/blender -b --python scripts/hero-models/build_hero_models.py -- public/models/hero-equipment-v1.glb

만드는 것 (노드 이름 = 코드에서 찾는 이름)
- HeatPump      공기열원 히트펌프 실외기 본체 (상부 1팬, 코일 측면, 점검 패널, 보호망)
- HeatPumpFan   팬 날개 (회전용으로 분리)
- EssCabinet    피크저감 ESS 옥외 캐비닛 (제어반 · 양문 · 냉방 루버 · 경첩 · 손잡이)
- TreeA, TreeB  조경수 2종

색과 음영
- 부품마다 색을 정하고, Cycles 로 앰비언트 오클루전(AO)을 꼭짓점 색에 굽는다.
  최종 꼭짓점 색 = 부품 색 × AO 라서 three.js 에서는 vertexColors 재질 하나로 그린다.

좌표
- 단위는 m 에 가깝게(장면 단위 × 10). three.js 에서 0.1 배로 쓴다.
- 정면(ESS 도어 · 히트펌프 코일 면)은 Blender -Y → glTF +Z (카메라 쪽).
"""

import math
import random
import sys

import bmesh
import bpy
from mathutils import Vector

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "hero-equipment.glb"


# ── 공통 ──────────────────────────────────────────────────────────────


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def material(name, hex_color):
    m = bpy.data.materials.new(name)
    rgb = [int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    m["base"] = [srgb_to_linear(v) for v in rgb]
    return m


def add(obj, mat, parts):
    obj.data.materials.append(mat)
    parts.append(obj)
    return obj


def apply_bevel(obj, width, segments=2):
    mod = obj.modifiers.new("bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)


def subdivide(obj, cuts):
    """큰 면에도 꼭짓점이 있어야 AO 그라데이션이 생긴다"""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    bm.to_mesh(obj.data)
    bm.free()


def box(parts, mat, size, loc, bevel=0.0, cuts=0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if cuts:
        subdivide(o, cuts)
    if bevel:
        apply_bevel(o, bevel)
    return add(o, mat, parts)


def cyl(parts, mat, r, depth, loc, verts=16, rot=(0, 0, 0), r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r2 is None else r2, depth=depth, location=loc, rotation=rot)
    return add(bpy.context.active_object, mat, parts)


def torus(parts, mat, major, minor, loc, seg=32, mseg=6):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=seg, minor_segments=mseg, location=loc)
    return add(bpy.context.active_object, mat, parts)


def join(parts, name):
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    o = bpy.context.active_object
    o.name = name
    o.data.name = name
    bpy.ops.object.shade_flat()
    return o


def bake_vertex_colors(obj, ao_floor=0.35, samples=48, ground=True, smooth=False):
    """부품 색 × AO 를 꼭짓점 색(Col)으로 굽고 재질은 비운다"""
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples

    # 다른 모델은 가리고, 바닥판만 두어 접지 AO 를 받는다
    for o in scene.objects:
        o.hide_render = o is not obj
    floor = None
    if ground:
        bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
        floor = bpy.context.active_object
    if smooth:
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.shade_smooth()

    # Cycles 굽기에는 노드 재질이 필요하다 (색은 아래에서 직접 곱한다)
    for m in obj.data.materials:
        m.use_nodes = True

    me = obj.data
    ao = me.color_attributes.new("AO", "FLOAT_COLOR", "CORNER")
    me.color_attributes.active_color = ao
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.bake(type="AO", target="VERTEX_COLORS")

    col = me.color_attributes.new("Col", "FLOAT_COLOR", "CORNER")
    for poly in me.polygons:
        base = me.materials[poly.material_index]["base"]
        for li in poly.loop_indices:
            a = ao_floor + (1 - ao_floor) * ao.data[li].color[0]
            col.data[li].color = (base[0] * a, base[1] * a, base[2] * a, 1.0)
    me.color_attributes.remove(me.color_attributes["AO"])
    me.color_attributes.active_color = me.color_attributes["Col"]
    me.materials.clear()

    if floor:
        bpy.data.objects.remove(floor, do_unlink=True)
    for o in scene.objects:
        o.hide_render = False


# ── 히트펌프 (폭 1.1 × 깊이 1.4 × 높이 1.62 m) ──────────────────────

def build_heat_pump():
    W, D, H, FOOT = 1.1, 1.4, 1.5, 0.12
    top = FOOT + H
    body = material("hp_body", "#d9dfe1")
    trim = material("hp_trim", "#c3cbce")
    dark = material("hp_dark", "#2f3a3e")
    coil = material("hp_coil", "#4b555a")
    fin = material("hp_fin", "#6c787d")
    guard = material("hp_guard", "#aeb8bb")
    pipe = material("hp_pipe", "#eef1f1")
    led = material("hp_led", "#5fd38a")
    parts = []

    # 받침 다리 · 레일
    for sx in (-1, 1):
        box(parts, dark, (W - 0.1, 0.1, 0.05), (0, 0, 0.025), bevel=0.005).location.y = sx * (D / 2 - 0.12)
        for sy in (-1, 1):
            box(parts, dark, (0.12, 0.12, FOOT), (sx * (W / 2 - 0.1), sy * (D / 2 - 0.12), FOOT / 2), bevel=0.01)

    # 본체 + 모서리 기둥
    box(parts, body, (W, D, H), (0, 0, FOOT + H / 2), bevel=0.015, cuts=4)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(parts, trim, (0.06, 0.06, H + 0.01), (sx * (W / 2 - 0.02), sy * (D / 2 - 0.02), FOOT + H / 2), bevel=0.008)
    # 지붕판 테두리
    box(parts, trim, (W + 0.02, D + 0.02, 0.04), (0, 0, top + 0.02), bevel=0.01, cuts=3)

    # 코일 면 (-Y = 정면 좌측의 좁은 면): 움푹 들어간 프레임 + 세로 핀
    face_y = -D / 2
    box(parts, coil, (W - 0.16, 0.03, H - 0.22), (0, face_y + 0.01, FOOT + H / 2 + 0.02), cuts=2)
    n_fins = 34
    for i in range(n_fins):
        x = -(W - 0.2) / 2 + (W - 0.2) * i / (n_fins - 1)
        box(parts, fin, (0.008, 0.02, H - 0.26), (x, face_y - 0.012, FOOT + H / 2 + 0.02))
    # 배관 연결구 (플랜지 포함)
    for z in (FOOT + 0.3, FOOT + 0.62):
        cyl(parts, pipe, 0.045, 0.16, (-W / 2 + 0.2, face_y - 0.08, z), rot=(math.pi / 2, 0, 0))
        cyl(parts, trim, 0.07, 0.025, (-W / 2 + 0.2, face_y - 0.015, z), rot=(math.pi / 2, 0, 0))

    # 점검 패널 (+X 넓은 면): 틈이 있는 큰 패널 2장 + 표시등
    for i, (zc, h) in enumerate(((FOOT + H * 0.62, H * 0.62), (FOOT + H * 0.16, H * 0.24))):
        box(parts, body, (0.02, D - 0.22, h - 0.04), (W / 2 + 0.01, 0.02, zc), bevel=0.006, cuts=2)
    for k in range(3):
        box(parts, led, (0.012, 0.03, 0.03), (W / 2 + 0.022, D / 2 - 0.18, top - 0.25 - k * 0.07))

    # 팬 슈라우드: 벨마우스 원통 + 말린 립
    fy = -0.05
    cyl(parts, guard, 0.43, 0.14, (0, fy, top + 0.09), verts=48)
    torus(parts, guard, 0.43, 0.025, (0, fy, top + 0.16), seg=48, mseg=8)
    # 보호망: 동심원 링 + 방사 살 + 가운데 허브 돔
    for r in (0.1, 0.17, 0.24, 0.31, 0.38):
        torus(parts, guard, r, 0.006, (0, fy, top + 0.175), seg=40, mseg=4)
    for k in range(12):
        a = k / 12 * math.pi * 2
        cyl(parts, guard, 0.006, 0.32, (math.cos(a) * 0.24, fy + math.sin(a) * 0.24, top + 0.175), verts=4, rot=(0, math.pi / 2, a))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.08, location=(0, fy, top + 0.17))
    hub = bpy.context.active_object
    hub.scale.z = 0.55
    bpy.ops.object.transform_apply(scale=True)
    add(hub, guard, parts)

    hp = join(parts, "HeatPump")
    bake_vertex_colors(hp)

    # 팬 날개 (슈라우드 안, 회전축 = 원점)
    blade = material("hp_blade", "#2a3438")
    fan_parts = []
    cyl(fan_parts, blade, 0.07, 0.06, (0, 0, 0), verts=16)
    for k in range(4):
        bpy.ops.mesh.primitive_cube_add(size=1)
        b = bpy.context.active_object
        b.scale = (0.33, 0.1, 0.008)
        b.location = (0.2, 0, 0)
        bpy.ops.object.transform_apply(location=True, scale=True)
        b.rotation_euler = (0.35, 0, k * math.pi / 2)  # 피치 각
        bpy.ops.object.transform_apply(rotation=True)
        add(b, blade, fan_parts)
    fan = join(fan_parts, "HeatPumpFan")
    bake_vertex_colors(fan, ao_floor=0.6, samples=16, ground=False)
    # 날개가 회전하는 중심은 원점. three.js 에서 슈라우드 위치(0, top+0.1, -fy)로 옮겨 돌린다
    return hp, fan


# ── ESS 캐비닛 (폭 3.6 × 깊이 1.8 × 높이 3.02 m) ─────────────────────

def build_ess():
    W, D, H, BASE = 3.6, 1.8, 2.7, 0.2
    top = BASE + H
    shell = material("ess_shell", "#e9ecea")
    door = material("ess_door", "#e3e7e5")
    base = material("ess_base", "#8f999c")
    cap = material("ess_cap", "#d2d8d9")
    orange = material("ess_orange", "#e5762c")
    screen = material("ess_screen", "#1c272b")
    metal = material("ess_metal", "#7d888b")
    label = material("ess_label", "#f0c22e")
    louver = material("ess_louver", "#b9c1c2")
    parts = []

    # 채널 받침 · 본체 · 지붕 캡(물끊기 있는 약간의 경사)
    box(parts, base, (W + 0.08, D + 0.08, BASE), (0, 0, BASE / 2), bevel=0.01, cuts=2)
    box(parts, shell, (W, D, H), (0, 0, BASE + H / 2), bevel=0.02, cuts=5)
    box(parts, cap, (W + 0.16, D + 0.26, 0.08), (0, 0, top + 0.04), bevel=0.015, cuts=3)
    box(parts, cap, (W + 0.06, D + 0.16, 0.05), (0, 0, top + 0.105), bevel=0.01, cuts=2)

    # 정면(-Y): 제어반 0.9 | 양문 0.85 + 0.85 | 냉방장치 1.0
    fy = -D / 2
    widths = (0.9, 0.85, 0.85, 1.0)
    gap = 0.018
    x = -W / 2
    doors = []
    for w in widths:
        cx = x + w / 2
        doors.append(cx)
        box(parts, door, (w - gap, 0.03, H - 0.16), (cx, fy - 0.015, BASE + H / 2), bevel=0.008, cuts=3)
        x += w
    ctrl, d1, d2, hvac = doors

    # 제어반: 주황 상단 띠 · 표시창 · 버튼
    box(parts, orange, (0.78, 0.012, 0.22), (ctrl, fy - 0.036, top - 0.28), bevel=0.004)
    box(parts, screen, (0.3, 0.012, 0.2), (ctrl, fy - 0.036, top - 0.62), bevel=0.004)
    for k in range(3):
        cyl(parts, orange if k == 0 else metal, 0.025, 0.02, (ctrl - 0.2 + k * 0.2, fy - 0.04, top - 0.9), verts=12, rot=(math.pi / 2, 0, 0))

    # 경첩 · 레버 손잡이 · 경고 라벨
    for cx, w, hinge_side in ((ctrl, widths[0], -1), (d1, widths[1], -1), (d2, widths[2], 1), (hvac, widths[3], 1)):
        hx = cx + hinge_side * (w / 2 - 0.05)
        for z in (BASE + 0.45, BASE + H - 0.45):
            cyl(parts, metal, 0.022, 0.14, (hx, fy - 0.035, z), verts=10)
    for cx, side in ((d1, 1), (d2, -1)):
        hx = cx + side * (widths[1] / 2 - 0.09)
        box(parts, metal, (0.04, 0.05, 0.12), (hx, fy - 0.05, BASE + H * 0.5), bevel=0.005)
        box(parts, metal, (0.04, 0.12, 0.03), (hx, fy - 0.1, BASE + H * 0.5 + 0.03), bevel=0.005)
    box(parts, label, (0.18, 0.01, 0.18), (d2 + 0.12, fy - 0.035, top - 0.5), bevel=0.003)

    # 냉방장치: 각진 루버 날개 + 상단 팬 그릴 원
    lz0 = BASE + 0.35
    for k in range(14):
        z = lz0 + k * 0.105
        box(parts, louver, (0.8, 0.05, 0.012), (hvac, fy - 0.045, z), rot=(math.radians(-35), 0, 0))
    box(parts, metal, (0.84, 0.03, 0.04), (hvac, fy - 0.04, lz0 - 0.07), bevel=0.004)
    box(parts, metal, (0.84, 0.03, 0.04), (hvac, fy - 0.04, lz0 + 14 * 0.105 - 0.03), bevel=0.004)

    # 측면(+X) 통풍구
    for k in range(6):
        box(parts, louver, (0.04, 0.7, 0.012), (W / 2 + 0.02, 0, top - 0.5 - k * 0.09), rot=(0, math.radians(35), 0))

    ess = join(parts, "EssCabinet")
    bake_vertex_colors(ess)
    return ess


# ── 조경수 ───────────────────────────────────────────────────────────

def build_tree(name, seed, columnar):
    rnd = random.Random(seed)
    bark = material(name + "_bark", "#4a3f36")
    leaf_dark = material(name + "_leaf1", "#3f6656")
    leaf_light = material(name + "_leaf2", "#56856f")
    parts = []

    # 줄기: 위로 갈수록 가늘고 살짝 휜다 + 가지 3개
    trunk_h = 1.5 if columnar else 1.25
    cyl(parts, bark, 0.11, trunk_h, (0, 0, trunk_h / 2), verts=7, r2=0.06)
    for k in range(3):
        a = k / 3 * math.pi * 2 + rnd.random()
        # 가지는 잎 덩어리 안으로 들어가 끝이 밖으로 드러나지 않게
        o = cyl(parts, bark, 0.04, 0.5, (0, 0, 0), verts=5, r2=0.018)
        o.rotation_euler = (0.6, 0, a)
        o.location = (math.cos(a + math.pi / 2) * -0.12, math.sin(a + math.pi / 2) * -0.12, trunk_h + 0.12)

    # 잎 덩어리: 찌그러뜨린 이코스피어 여러 개
    clusters = 7 if columnar else 6
    for k in range(clusters):
        if columnar:
            z = trunk_h + 0.2 + k * 0.32
            r = 0.55 - abs(k - 2.5) * 0.07
            off = 0.18
        else:
            z = trunk_h + 0.35 + rnd.uniform(0, 0.75)
            r = rnd.uniform(0.42, 0.62)
            off = 0.5
        a = rnd.random() * math.pi * 2
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r, location=(math.cos(a) * off * rnd.random(), math.sin(a) * off * rnd.random(), z))
        o = bpy.context.active_object
        for v in o.data.vertices:
            n = v.co.normalized()
            v.co += n * rnd.uniform(-0.09, 0.09) * r * 2
        o.scale = (1, 1, rnd.uniform(0.75, 0.95))
        bpy.ops.object.transform_apply(scale=True)
        add(o, leaf_dark if k % 2 else leaf_light, parts)

    tree = join(parts, name)
    bake_vertex_colors(tree, ao_floor=0.3, smooth=True)
    return tree


# ── 실행 ─────────────────────────────────────────────────────────────

bpy.ops.wm.read_factory_settings(use_empty=True)
objects = []
hp, fan = build_heat_pump()
objects += [hp, fan]
objects.append(build_ess())
objects.append(build_tree("TreeA", 7, columnar=False))
objects.append(build_tree("TreeB", 11, columnar=True))

bpy.ops.object.select_all(action="DESELECT")
for o in objects:
    o.select_set(True)
    o.location = (0, 0, 0)
    print(f"{o.name}: {len(o.data.vertices)} verts, {len(o.data.polygons)} faces")

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="NONE",
    export_vertex_color="ACTIVE",
    export_active_vertex_color_when_no_material=True,
    export_texcoords=False,
    export_normals=True,
    export_yup=True,
)
print("exported", OUT)
