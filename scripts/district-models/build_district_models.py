"""
Product 페이지 3D 테마 지역 소품 모델 생성 (Blender 5.x, 배경 실행).

    /Applications/Blender.app/Contents/MacOS/blender -b --python scripts/district-models/build_district_models.py -- public/models/district-props-v3.glb

만드는 것 (노드 이름 = 코드에서 찾는 이름)
- Car            승용차 (차체 · 유리 캐빈 · 바퀴 · 전조등 · 후미등). 차체는 밝은 회색이라 three.js 인스턴스 색으로 칠한다
- LampPost       공원 · 보행로 가로등 (받침 · 기둥 · 갓). 빛나는 등은 코드에서 갓 아래에 그린다
- PowerPole      배전 전주 (콘크리트 기둥 · 완철 · 버팀대 · 애자 3개)
- PowerPoleTx    주상변압기가 달린 전주
- Transformer    공유형 ESS 단지 변압기 (방열판 · 부싱 · 콘서베이터)
- Bench          공원 벤치 (주철 다리 · 나무 살)
- Playground     놀이터 (탑 · 지붕 · 미끄럼틀 · 사다리 · 그네 · 고무 바닥)
- Restroom       공원 화장실 (벽 · 처마 지붕 · 문 · 환기창)
- PersonA/B/C    걷는 사람 (옷 색만 다름)
- Drone          측량 드론 (SolarScope)
- EssContainer   컨테이너형 ESS (골판 · 출입문 · 벽걸이 냉방기 · 환기구)
- Inverter       태양광 인버터 스키드 (인버터 함 · 승압 변압기)
- Tower · OldBuilding · MidOffice · ShopHouse · SmallBlock  건물 5동. 각각 몸체 / Glass(유리) / Lit(밤에 켜지는 창) 세 노드

색 · 좌표 규칙은 ../hero-models/blender_common.py 와 같다 (부품 색 × AO 를 꼭짓점 색으로, 단위 m, 정면 -Y → glTF +Z).
차는 +X 가 앞.
"""

import math
import os
import sys

import bmesh
import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hero-models"))
from blender_common import add, apply_bevel, bake_vertex_colors, box, cyl, export_glb, join, material, torus  # noqa: E402

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "district-props.glb"


def taper_top(obj, sx, sy, shift_x=0.0):
    """위쪽 꼭짓점만 좁힌다 (차 캐빈 · 지붕)"""
    me = obj.data
    zs = [v.co.z for v in me.vertices]
    mid = (max(zs) + min(zs)) / 2
    cx = sum(v.co.x for v in me.vertices) / len(me.vertices)
    for v in me.vertices:
        if v.co.z > mid:
            v.co.x = cx + (v.co.x - cx) * sx + shift_x
            v.co.y *= sy


def box_raw(parts, mat, size, loc, rot=(0, 0, 0)):
    """베벨 없이 (나중에 꼭짓점을 옮길 상자)"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return add(o, mat, parts)


def beam(parts, mat, a, b, t):
    """두 점을 잇는 각재 (단면 t × t)"""
    ax, ay, az = a
    bx, by, bz = b
    dx, dy, dz = bx - ax, by - ay, bz - az
    length = math.sqrt(dx * dx + dy * dy + dz * dz)
    bpy.ops.mesh.primitive_cube_add(size=1, location=((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2))
    o = bpy.context.active_object
    o.scale = (t, t, length)
    bpy.ops.object.transform_apply(scale=True)
    # z 축을 a→b 방향으로
    yaw = math.atan2(dy, dx)
    pitch = math.acos(max(-1, min(1, dz / length)))
    o.rotation_euler = (0, pitch, yaw)
    bpy.ops.object.transform_apply(rotation=True)
    return add(o, mat, parts)


# ── 승용차 (길이 4.5 × 폭 1.8 × 높이 1.45 m, +X 가 앞) ─────────────────

def build_car():
    body = material("car_body", "#e8ebec")
    glass = material("car_glass", "#26323a")
    tire = material("car_tire", "#1b2022")
    rim = material("car_rim", "#9aa3a6")
    trim = material("car_trim", "#3a4448")
    head = material("car_head", "#f4f1e4")
    tail = material("car_tail", "#b3322b")
    parts = []

    # 차체 하부: 앞뒤를 둥글게
    box(parts, body, (4.4, 1.78, 0.6), (0, 0, 0.5), bevel=0.14, cuts=3)
    # 캐빈: 유리 덩어리를 위로 좁혀 A · C 필러 경사를 만든다
    cab = box_raw(parts, glass, (2.35, 1.6, 0.56), (-0.2, 0, 1.06))
    taper_top(cab, 0.66, 0.86, shift_x=-0.12)
    apply_bevel(cab, 0.05)
    # 지붕판 · 필러 띠
    box(parts, body, (1.5, 1.4, 0.05), (-0.32, 0, 1.345), bevel=0.02)
    box(parts, body, (0.12, 1.62, 0.5), (-0.22, 0, 1.05), bevel=0.02)
    # 범퍼 · 그릴 · 사이드 몰딩
    for x in (2.18, -2.18):
        box(parts, trim, (0.14, 1.66, 0.16), (x, 0, 0.3), bevel=0.04)
    box(parts, trim, (0.04, 0.8, 0.14), (2.21, 0, 0.52), bevel=0.01)
    for y in (0.9, -0.9):
        box(parts, trim, (2.6, 0.03, 0.06), (0.05, y, 0.42))
    # 등
    for y in (0.6, -0.6):
        box(parts, head, (0.06, 0.38, 0.11), (2.19, y, 0.66), bevel=0.02)
        box(parts, tail, (0.06, 0.42, 0.1), (-2.19, y, 0.7), bevel=0.02)
    # 사이드미러
    for y in (0.93, -0.93):
        box(parts, body, (0.14, 0.12, 0.09), (0.72, y, 0.92), bevel=0.02)
    # 바퀴 (휠하우스 안으로 살짝 들어가게)
    for x in (1.38, -1.38):
        for y in (0.78, -0.78):
            cyl(parts, tire, 0.33, 0.24, (x, y, 0.33), verts=20, rot=(math.pi / 2, 0, 0))
            cyl(parts, rim, 0.19, 0.25, (x, y, 0.33), verts=12, rot=(math.pi / 2, 0, 0))

    car = join(parts, "Car")
    bake_vertex_colors(car, ao_floor=0.42, samples=32)
    return car


# ── 가로등 (높이 8 m, 갓 아래 끝 7.75 m) ───────────────────────────────

def build_lamp_post():
    metal = material("lamp_metal", "#2f3b3f")
    base = material("lamp_base", "#56646a")
    shade = material("lamp_shade", "#253034")
    parts = []
    cyl(parts, base, 0.2, 0.12, (0, 0, 0.06), verts=16)
    cyl(parts, metal, 0.15, 0.6, (0, 0, 0.42), verts=16, r2=0.11)
    cyl(parts, metal, 0.085, 7.0, (0, 0, 4.2), verts=12, r2=0.06)
    torus(parts, metal, 0.1, 0.03, (0, 0, 0.75), seg=16, mseg=4)
    torus(parts, metal, 0.075, 0.025, (0, 0, 7.0), seg=16, mseg=4)
    # 갓: 넓적한 원뿔 + 꼭지
    cyl(parts, metal, 0.07, 0.4, (0, 0, 7.55), verts=12, r2=0.09)
    cyl(parts, shade, 0.55, 0.22, (0, 0, 7.86), verts=24, r2=0.12)
    cyl(parts, shade, 0.56, 0.04, (0, 0, 7.76), verts=24)
    cyl(parts, shade, 0.05, 0.18, (0, 0, 8.05), verts=8, r2=0.01)
    lamp = join(parts, "LampPost")
    bake_vertex_colors(lamp, ao_floor=0.5, samples=24)
    return lamp


# ── 배전 전주 (완철 12.6 m, 애자 끝 13.0 m — 코드의 전선 높이) ─────────

def pole_parts(parts, tx):
    concrete = material("pole_concrete" + tx, "#a3a8a6")
    steel = material("pole_steel" + tx, "#56636a")
    porcelain = material("pole_porcelain" + tx, "#dfe3df")
    plate = material("pole_plate" + tx, "#e9c24a")
    top = 12.66
    cyl(parts, concrete, 0.2, top, (0, 0, top / 2), verts=14, r2=0.13)
    # 완철 (전선 방향 = x, 완철은 y) + 버팀대
    box(parts, steel, (0.12, 4.4, 0.12), (0, 0, 12.6), bevel=0.01)
    for s in (1, -1):
        beam(parts, steel, (0, s * 0.12, 11.7), (0, s * 1.3, 12.55), 0.06)
    # 애자: 원판 3장 쌓기
    for y in (-1.8, 0.0, 1.8):
        z0 = 12.66 if y else top
        for k in range(3):
            cyl(parts, porcelain, 0.1 - k * 0.012, 0.07, (0, y, z0 + 0.06 + k * 0.1), verts=12)
        cyl(parts, steel, 0.025, 0.34, (0, y, z0 + 0.17), verts=6)
    # 발판 볼트 · 번호판
    for k in range(10):
        z = 2.4 + k * 0.9
        box(parts, steel, (0.35, 0.03, 0.03), (0, 0.17 if k % 2 else -0.17, z), rot=(0, 0, math.pi / 2))
    box(parts, plate, (0.02, 0.28, 0.4), (0.19, 0, 2.0))
    if tx:
        tank = material("pole_tank", "#8b9699")
        cyl(parts, tank, 0.42, 1.1, (0.62, 0, 10.4), verts=20)
        cyl(parts, tank, 0.45, 0.06, (0.62, 0, 11.0), verts=20)
        box(parts, steel, (0.5, 0.5, 0.08), (0.36, 0, 9.9))
        box(parts, steel, (0.5, 0.08, 1.4), (0.36, 0, 10.4))
        for y in (-0.18, 0.18):
            cyl(parts, porcelain, 0.05, 0.3, (0.62, y, 11.18), verts=10)
        for k in range(5):
            box(parts, tank, (0.04, 0.5, 0.8), (0.62, 0, 10.4), rot=(0, 0, k * math.pi / 5))


def build_power_pole(tx):
    parts = []
    pole_parts(parts, "_tx" if tx else "")
    pole = join(parts, "PowerPoleTx" if tx else "PowerPole")
    bake_vertex_colors(pole, ao_floor=0.5, samples=24)
    return pole


# ── 변압기 (폭 4.4 × 깊이 3.6 × 높이 4.3 m) ─────────────────────────────

def build_transformer():
    pad = material("tr_pad", "#a6aba9")
    tank = material("tr_tank", "#8e9b9e")
    fin = material("tr_fin", "#7d8a8d")
    porcelain = material("tr_porcelain", "#6f4d3a")
    steel = material("tr_steel", "#55626a")
    label = material("tr_label", "#f0c22e")
    parts = []
    box(parts, pad, (4.6, 3.8, 0.25), (0, 0, 0.125), bevel=0.03, cuts=3)
    box(parts, tank, (2.8, 1.9, 2.6), (0, 0, 0.25 + 1.3), bevel=0.04, cuts=3)
    box(parts, tank, (2.95, 2.05, 0.12), (0, 0, 2.91), bevel=0.02)
    # 방열판: 양쪽 긴 면에 얇은 판 여러 장
    for s in (1, -1):
        for k in range(9):
            x = -1.2 + k * 0.3
            box(parts, fin, (0.05, 0.75, 2.0), (x, s * (0.95 + 0.4), 1.45))
        box(parts, steel, (2.7, 0.08, 0.08), (0, s * 1.0, 2.5))
        box(parts, steel, (2.7, 0.08, 0.08), (0, s * 1.0, 0.45))
    # 부싱: 고압 3(키 큰 갈색 애자) · 저압 3
    for k in range(3):
        x = -0.8 + k * 0.8
        cyl(parts, porcelain, 0.11, 0.25, (x, -0.45, 3.1), verts=12)
        for j in range(5):
            cyl(parts, porcelain, 0.14 - (j % 2) * 0.04, 0.09, (x, -0.45, 3.25 + j * 0.11), verts=12)
        cyl(parts, steel, 0.03, 0.25, (x, -0.45, 3.95), verts=6)
        cyl(parts, porcelain, 0.08, 0.35, (x, 0.5, 3.15), verts=10)
    # 콘서베이터 탱크 + 받침
    cyl(parts, tank, 0.32, 2.2, (0, 0.55, 3.75), verts=20, rot=(0, math.pi / 2, 0))
    for x in (-0.8, 0.8):
        box(parts, steel, (0.08, 0.08, 0.75), (x, 0.55, 3.25))
    box(parts, label, (0.5, 0.02, 0.35), (0.6, -0.96, 1.9))
    tr = join(parts, "Transformer")
    bake_vertex_colors(tr, ao_floor=0.38, samples=32)
    return tr


# ── 공원 벤치 (길이 1.8 m) ──────────────────────────────────────────────

def build_bench():
    iron = material("bench_iron", "#2b3437")
    wood = material("bench_wood", "#9a7350")
    parts = []
    for x in (-0.75, 0.75):
        box(parts, iron, (0.06, 0.55, 0.06), (x, 0, 0.42), bevel=0.01)
        box(parts, iron, (0.06, 0.06, 0.45), (x, -0.22, 0.22), bevel=0.01)
        box(parts, iron, (0.06, 0.06, 0.45), (x, 0.22, 0.22), bevel=0.01)
        beam(parts, iron, (x, 0.25, 0.42), (x, 0.32, 0.85), 0.05)
        box(parts, iron, (0.06, 0.45, 0.04), (x, 0.0, 0.66), bevel=0.01)
    for k in range(4):
        box(parts, wood, (1.8, 0.11, 0.04), (0, -0.2 + k * 0.13, 0.47), bevel=0.012)
    for k in range(3):
        z = 0.58 + k * 0.11
        box(parts, wood, (1.8, 0.04, 0.09), (0, 0.27 + k * 0.016, z), bevel=0.012, rot=(math.radians(-12), 0, 0))
    bench = join(parts, "Bench")
    bake_vertex_colors(bench, ao_floor=0.45, samples=24)
    return bench


# ── 놀이터 (약 6 × 4 m) ─────────────────────────────────────────────────

def build_playground():
    pad = material("pg_pad", "#b8614c")
    post = material("pg_post", "#e5762c")
    roof = material("pg_roof", "#49b6ca")
    deck = material("pg_deck", "#d9d4c6")
    slide = material("pg_slide", "#f0c22e")
    steel = material("pg_steel", "#6c787c")
    seat = material("pg_seat", "#2f3a3e")
    parts = []
    box(parts, pad, (6.4, 4.4, 0.06), (0, 0, 0.03), bevel=0.02, cuts=4)
    # 탑: 기둥 4 · 바닥판 · 난간 · 지붕
    tx, ty = -1.4, -0.4
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(parts, post, (0.12, 0.12, 2.9), (tx + sx * 0.75, ty + sy * 0.75, 1.45), bevel=0.015)
    box(parts, deck, (1.6, 1.6, 0.1), (tx, ty, 1.25), bevel=0.02)
    for sy in (-1, 1):
        box(parts, post, (1.5, 0.05, 0.05), (tx, ty + sy * 0.75, 1.95))
        for k in range(5):
            box(parts, steel, (0.03, 0.03, 0.65), (tx - 0.6 + k * 0.3, ty + sy * 0.75, 1.62))
    r = box_raw(parts, roof, (1.9, 1.9, 0.55), (tx, ty, 3.12))
    taper_top(r, 0.04, 0.04)
    # 미끄럼틀 (+X 로 내려간다): 기울어진 판 + 옆 날개
    slope = math.atan2(1.15, 2.4)
    box(parts, slide, (2.65, 0.6, 0.06), (tx + 0.75 + 1.2, ty, 0.72), rot=(0, slope, 0), bevel=0.02)
    for s in (1, -1):
        box(parts, slide, (2.65, 0.05, 0.16), (tx + 0.75 + 1.2, ty + s * 0.3, 0.8), rot=(0, slope, 0))
    # 사다리 (-Y)
    for s in (1, -1):
        beam(parts, steel, (tx + s * 0.25, ty - 1.6, 0.05), (tx + s * 0.25, ty - 0.8, 1.25), 0.05)
    for k in range(5):
        f = (k + 1) / 6
        box(parts, steel, (0.5, 0.04, 0.04), (tx, ty - 1.6 + 0.8 * f, 0.05 + 1.2 * f))
    # 그네: A 프레임 + 가로대 + 줄 · 의자 2
    sx0, sy0 = 1.4, 1.3
    for x in (sx0 - 1.3, sx0 + 1.3):
        for s in (1, -1):
            beam(parts, steel, (x, sy0 + s * 0.7, 0.05), (x, sy0, 2.3), 0.07)
    cyl(parts, steel, 0.05, 2.7, (sx0, sy0, 2.3), verts=10, rot=(0, math.pi / 2, 0))
    for x in (sx0 - 0.55, sx0 + 0.55):
        for d in (-0.2, 0.2):
            cyl(parts, steel, 0.012, 1.75, (x + d, sy0, 1.42), verts=4)
        box(parts, seat, (0.5, 0.2, 0.05), (x, sy0, 0.55), bevel=0.01)
    pg = join(parts, "Playground")
    bake_vertex_colors(pg, ao_floor=0.42, samples=32)
    return pg


# ── 공원 화장실 (8 × 5 × 3.4 m) ─────────────────────────────────────────

def build_restroom():
    wall = material("rr_wall", "#ddd6c7")
    base = material("rr_base", "#8d8577")
    roof = material("rr_roof", "#4f5d62")
    door = material("rr_door", "#3d5c66")
    vent = material("rr_vent", "#6b7478")
    sign = material("rr_sign", "#49b6ca")
    parts = []
    box(parts, base, (8.1, 5.1, 0.4), (0, 0, 0.2), bevel=0.02, cuts=2)
    box(parts, wall, (7.8, 4.8, 2.6), (0, 0, 1.7), bevel=0.03, cuts=4)
    # 처마가 깊은 낮은 박공 지붕
    r = box_raw(parts, roof, (9.2, 6.2, 0.6), (0, 0, 3.3))
    taper_top(r, 1.0, 0.15)
    box(parts, roof, (9.3, 6.3, 0.1), (0, 0, 3.02), bevel=0.02)
    # 정면(-Y) 문 2 · 표지판 · 위쪽 환기창 띠
    for x in (-1.9, 1.9):
        box(parts, door, (1.0, 0.06, 2.0), (x, -2.42, 1.4), bevel=0.01)
        box(parts, sign, (0.36, 0.03, 0.36), (x, -2.43, 2.65), bevel=0.01)
        box(parts, vent, (0.06, 0.08, 0.08), (x + 0.38, -2.47, 1.4))
    for x in (-1.3, -0.7, 0.7, 1.3):
        box(parts, vent, (0.5, 0.05, 0.05), (x, -2.43, 2.7))
    # 옆면 세면대 창
    for y in (-1.2, 1.2):
        box(parts, vent, (0.06, 1.0, 0.4), (3.92, y, 2.45))
    rr = join(parts, "Restroom")
    bake_vertex_colors(rr, ao_floor=0.42, samples=32)
    return rr



# ── 건물 공용: 유리 · 켜진 창을 따로 나눠 내보낸다 ──────────────────────
#  노드 <이름>      몸체 (부품 색 × AO)
#       <이름>Glass 유리 (three.js 에서 반사 재질)
#       <이름>Lit   밤에 켜지는 창 (three.js 에서 해가 지면 빛난다)


def group_material(name, hex_color, group):
    m = material(name, hex_color)
    m["group"] = group
    return m


class Facade:
    """창 재질 묶음 + 켜진 창 고르기 (같은 씨앗이면 항상 같은 창이 켜진다)"""

    def __init__(self, prefix, glass_hex, lit_hex, lit_ratio, seed):
        import random

        self.glass = group_material(prefix + "_glass", glass_hex, "glass")
        self.lit = group_material(prefix + "_lit", lit_hex, "lit")
        self.ratio = lit_ratio
        self.rnd = random.Random(seed)

    def pick(self, always=False):
        return self.lit if always or self.rnd.random() < self.ratio else self.glass


def face_frame(face, W, D):
    """면의 바깥 방향 · 가로축: front(-Y) back(+Y) left(-X) right(+X)"""
    if face == "front":
        return (0, -D / 2), (1, 0), (0, -1), W
    if face == "back":
        return (0, D / 2), (-1, 0), (0, 1), W
    if face == "left":
        return (-W / 2, 0), (0, 1), (-1, 0), D
    return (W / 2, 0), (0, -1), (1, 0), D


def on_face(face, W, D, u, out, z):
    (cx, cy), (ax, ay), (nx, ny), _ = face_frame(face, W, D)
    return (cx + ax * u + nx * out, cy + ay * u + ny * out, z)


def face_box(parts, mat, face, W, D, u, out, z, width, depth, height):
    x, y, zz = on_face(face, W, D, u, out, z)
    size = (width, depth, height) if face in ("front", "back") else (depth, width, height)
    return box(parts, mat, size, (x, y, zz))


def finish_building(parts, name, ground_size):
    obj = join(parts, name)
    bake_vertex_colors(obj, ao_floor=0.4, samples=32, keep_materials=True, ground_size=ground_size)
    # 재질별로 나눈 뒤 몸체 · 유리 · 켜진 창 세 덩어리로 다시 합친다
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="MATERIAL")
    bpy.ops.object.mode_set(mode="OBJECT")
    pieces = [o for o in bpy.context.scene.objects if o.name == name or o.name.startswith(name + ".")]
    groups = {"body": [], "glass": [], "lit": []}
    # 나눈 조각 이름을 먼저 비켜 둔다 (최종 이름과 겹치면 .001 이 붙는다)
    for i, o in enumerate(pieces):
        o.name = f"_{name}_piece{i}"
        o.data.name = o.name
    for o in pieces:
        used = {p.material_index for p in o.data.polygons}
        m = o.data.materials[next(iter(used))]
        groups[m.get("group", "body")].append(o)
    out = []
    for g, suffix in (("body", ""), ("glass", "Glass"), ("lit", "Lit")):
        objs = groups[g]
        if not objs:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        if len(objs) > 1:
            bpy.ops.object.join()
        o = bpy.context.active_object
        o.name = name + suffix
        o.data.name = name + suffix
        o.data.materials.clear()
        out.append(o)
    return out


# ── 업무 빌딩 (32 × 24 × 56 m, 12층) — BEMS ────────────────────────────

def build_tower():
    W, D, FLOORS, FH = 32.0, 24.0, 12, 56.0 / 12
    H = FLOORS * FH
    slab = group_material("tw_slab", "#2b3c43", "body")
    core = group_material("tw_core", "#1c2a30", "body")
    fin = group_material("tw_fin", "#41575f", "body")
    column = group_material("tw_column", "#24343a", "body")
    roof = group_material("tw_roof", "#36464c", "body")
    canopy = group_material("tw_canopy", "#a9bcc2", "body")
    mech = group_material("tw_mech", "#3c4f56", "body")
    fac = Facade("tw", "#4f7f8c", "#d9d3bf", 0.32, 7)
    parts = []

    # 속 (유리 뒤 어두운 실내) · 층 슬래브 띠 · 지붕
    box(parts, core, (W - 1.2, D - 1.2, H), (0, 0, H / 2), cuts=2)
    for f in range(1, FLOORS + 1):
        box(parts, slab, (W + 0.1, D + 0.1, 0.9), (0, 0, f * FH - 0.45 + (0.45 if f == FLOORS else 0)))
    box(parts, roof, (W + 0.1, D + 0.1, 0.8), (0, 0, H + 0.4), cuts=3)
    # 난간 · 모서리 기둥
    for face in ("front", "back", "left", "right"):
        _, _, _, span = face_frame(face, W, D)
        face_box(parts, slab, face, W, D, 0, 0.15, H + 1.4, span + 0.4, 0.3, 1.2)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(parts, column, (1.1, 1.1, H + 2.0), (sx * (W / 2 - 0.3), sy * (D / 2 - 0.3), (H + 2.0) / 2), bevel=0.05)

    # 커튼월: 칸마다 유리(켜짐 무작위) + 세로 핀
    for face in ("front", "back", "left", "right"):
        _, _, _, span = face_frame(face, W, D)
        bays = 10 if face in ("front", "back") else 8
        bw = span / bays
        for k in range(1, bays):
            face_box(parts, fin, face, W, D, -span / 2 + k * bw, 0.35, (FH + H) / 2, 0.22, 0.7, H - FH)
        for f in range(1, FLOORS):
            z0 = f * FH
            for k in range(bays):
                u = -span / 2 + (k + 0.5) * bw
                face_box(parts, fac.pick(), face, W, D, u, -0.25, z0 + (FH + 0.9) / 2 - 0.45 + 0.45, bw - 0.3, 0.12, FH - 1.0)
        # 1층 로비: 안으로 들어간 통유리 (밤에 늘 켜짐) + 기둥
        for k in range(bays):
            u = -span / 2 + (k + 0.5) * bw
            face_box(parts, fac.pick(always=True), face, W, D, u, -1.2, FH / 2, bw - 0.2, 0.12, FH - 0.9)
        for k in range(1, bays):
            face_box(parts, column, face, W, D, -span / 2 + k * bw, -0.2, FH / 2, 0.6, 0.6, FH)

    # 정문 캐노피 (정면 가운데)
    box(parts, canopy, (16, 5, 0.45), (0, -D / 2 - 2.5, 3.6), bevel=0.05)
    for sx in (-1, 1):
        box(parts, column, (0.3, 0.3, 3.4), (sx * 7.2, -D / 2 - 4.6, 1.7))
    # 옥상 기계실 (코드의 안테나 · 실외기 자리와 맞춤: 동쪽 x+9.5, 북쪽)
    px, py, ph = 9.5, 4.0, 4.2
    box(parts, mech, (10, 9, ph), (px, py, H + 0.8 + ph / 2), bevel=0.05, cuts=2)
    box(parts, roof, (10.6, 9.6, 0.4), (px, py, H + 0.8 + ph + 0.2))
    for k in range(4):
        box(parts, fin, (1.6, 0.1, 1.2), (px - 3 + k * 2, py - 4.55, H + 0.8 + 2.4))
    return finish_building(parts, "Tower", 60)


# ── 리모델링 대상 노후 건물 (30 × 22 × 24 m, 5층) — GreenPlanner ────────

def build_old_building():
    W, D, FLOORS, FH = 30.0, 22.0, 5, 4.8
    H = FLOORS * FH
    wall = group_material("ob_wall", "#c3b8a2", "body")
    band = group_material("ob_band", "#a99d87", "body")
    frame = group_material("ob_frame", "#5d5248", "body")
    sill = group_material("ob_sill", "#d9d1c0", "body")
    roof = group_material("ob_roof", "#6c6256", "body")
    tank = group_material("ob_tank", "#8e9497", "body")
    shop = group_material("ob_shop", "#3e4a4f", "body")
    fac = Facade("ob", "#47565b", "#dccfae", 0.38, 21)
    parts = []
    box(parts, wall, (W, D, H), (0, 0, H / 2), cuts=4)
    box(parts, roof, (W + 0.2, D + 0.2, 0.8), (0, 0, H + 0.4), cuts=3)
    for face in ("front", "back", "left", "right"):
        _, _, _, span = face_frame(face, W, D)
        face_box(parts, band, face, W, D, 0, 0.12, H + 1.3, span + 0.5, 0.25, 1.0)
        for f in range(1, FLOORS):
            face_box(parts, band, face, W, D, 0, 0.06, f * FH, span, 0.12, 0.35)
        n = 6 if face in ("front", "back") else 4
        step = span / n
        for f in range(FLOORS):
            z0 = f * FH
            for k in range(n):
                u = -span / 2 + (k + 0.5) * step
                if f == 0 and face == "front":
                    # 1층 가게: 넓은 유리 + 어두운 틀
                    face_box(parts, shop, face, W, D, u, 0.02, z0 + 2.0, step - 0.4, 0.1, 3.4)
                    face_box(parts, fac.pick(always=k % 2 == 0), face, W, D, u, 0.06, z0 + 2.0, step - 1.0, 0.1, 2.8)
                    continue
                ww, wh = 2.4, 2.0
                zc = z0 + 2.5
                # 움푹한 창: 틀(밖) → 유리(안) · 창턱
                face_box(parts, frame, face, W, D, u, 0.02, zc, ww + 0.3, 0.1, wh + 0.3)
                face_box(parts, fac.pick(), face, W, D, u, 0.06, zc, ww, 0.1, wh)
                face_box(parts, sill, face, W, D, u, 0.15, zc - wh / 2 - 0.18, ww + 0.6, 0.3, 0.15)
    # 옥상: 물탱크 · 계단실 · 낡은 실외기
    cyl(parts, tank, 1.6, 2.6, (-9, 5, H + 0.8 + 1.8), verts=20)
    box(parts, band, (1.8, 1.8, 0.6), (-9, 5, H + 0.8 + 0.3))
    box(parts, wall, (6, 5, 3.2), (6, 4, H + 0.8 + 1.6), bevel=0.05)
    for k in range(3):
        box(parts, tank, (1.4, 0.9, 1.0), (-2 + k * 2.2, -5, H + 0.8 + 0.5), bevel=0.05)
    return finish_building(parts, "OldBuilding", 50)


# ── 주변 건물 3동 ──────────────────────────────────────────────────────

def build_mid_office():
    """24 × 20 × 18 m, 4층 — 가로로 긴 띠창 사무동"""
    W, D, FLOORS, FH = 24.0, 20.0, 4, 4.5
    H = FLOORS * FH
    slab = group_material("mo_slab", "#3a4b52", "body")
    core = group_material("mo_core", "#1d2a30", "body")
    roof = group_material("mo_roof", "#2f3d43", "body")
    mull = group_material("mo_mull", "#55686f", "body")
    fac = Facade("mo", "#5c8a96", "#dcd5bf", 0.36, 3)
    parts = []
    box(parts, core, (W - 0.8, D - 0.8, H), (0, 0, H / 2), cuts=2)
    for f in range(FLOORS + 1):
        box(parts, slab, (W + 0.1, D + 0.1, 1.3), (0, 0, f * FH + 0.65 - (0.65 if f == 0 else 0)))
    box(parts, roof, (W + 0.1, D + 0.1, 0.8), (0, 0, H + 0.4), cuts=3)
    for face in ("front", "back", "left", "right"):
        _, _, _, span = face_frame(face, W, D)
        face_box(parts, slab, face, W, D, 0, 0.1, H + 1.2, span + 0.3, 0.2, 0.9)
        bays = 8 if face in ("front", "back") else 6
        bw = span / bays
        for f in range(FLOORS):
            for k in range(bays):
                u = -span / 2 + (k + 0.5) * bw
                face_box(parts, fac.pick(always=f == 0 and face == "front"), face, W, D, u, -0.15, f * FH + 1.3 + (FH - 1.3) / 2, bw - 0.18, 0.1, FH - 1.4)
            for k in range(1, bays):
                face_box(parts, mull, face, W, D, -span / 2 + k * bw, 0.05, f * FH + 1.3 + (FH - 1.3) / 2, 0.18, 0.25, FH - 1.3)
    return finish_building(parts, "MidOffice", 40)


def build_shop_house(name, W, D, FLOORS, FH, seed):
    """근린생활시설: 1층 가게 통유리 + 차양, 위층은 창"""
    H = FLOORS * FH
    wall = group_material(name + "_wall", "#cdbfa8", "body")
    trim = group_material(name + "_trim", "#9c8f7a", "body")
    roof = group_material(name + "_roof", "#6e6658", "body")
    frame = group_material(name + "_frame", "#4b4640", "body")
    awning = group_material(name + "_awning", "#2f6f7d", "body")
    fac = Facade(name, "#4f5f64", "#e2d4b1", 0.4, seed)
    parts = []
    box(parts, wall, (W, D, H), (0, 0, H / 2), cuts=3)
    box(parts, roof, (W + 0.2, D + 0.2, 0.8), (0, 0, H + 0.4), cuts=2)
    for face in ("front", "back", "left", "right"):
        _, _, _, span = face_frame(face, W, D)
        face_box(parts, trim, face, W, D, 0, 0.1, H + 1.2, span + 0.4, 0.2, 0.8)
        face_box(parts, trim, face, W, D, 0, 0.06, FH, span, 0.12, 0.4)
        n = max(2, round(span / 4.2))
        step = span / n
        for f in range(FLOORS):
            for k in range(n):
                u = -span / 2 + (k + 0.5) * step
                if f == 0 and face == "front":
                    face_box(parts, frame, face, W, D, u, 0.02, 1.9, step - 0.3, 0.1, 3.2)
                    face_box(parts, fac.pick(always=True), face, W, D, u, 0.06, 1.8, step - 0.8, 0.1, 2.7)
                    continue
                zc = f * FH + FH * 0.55
                face_box(parts, frame, face, W, D, u, 0.02, zc, 2.3, 0.1, 1.9)
                face_box(parts, fac.pick(), face, W, D, u, 0.06, zc, 2.0, 0.1, 1.6)
    # 정면 1층 차양
    x, y, z = on_face("front", W, D, 0, 0.8, 3.7)
    box(parts, awning, (W - 1.0, 1.6, 0.25), (x, y, z), rot=(math.radians(-12), 0, 0))
    return finish_building(parts, name, 40)



# ── 사람 (키 1.75 m, 정면 -Y) — 옷 색만 다른 3명 ───────────────────────

def build_person(name, top_hex, bottom_hex, hair_hex):
    top = material(name + "_top", top_hex)
    bottom = material(name + "_bottom", bottom_hex)
    skin = material(name + "_skin", "#d6b294")
    hair = material(name + "_hair", hair_hex)
    shoe = material(name + "_shoe", "#2a2c2e")
    parts = []
    for sx in (-1, 1):
        box(parts, bottom, (0.15, 0.17, 0.84), (sx * 0.1, 0, 0.5), bevel=0.03)
        box(parts, shoe, (0.15, 0.26, 0.09), (sx * 0.1, -0.04, 0.045), bevel=0.02)
        box(parts, top, (0.11, 0.12, 0.6), (sx * 0.29, 0, 1.17), bevel=0.03)
        box(parts, skin, (0.09, 0.1, 0.12), (sx * 0.29, 0, 0.83), bevel=0.02)
    box(parts, top, (0.46, 0.26, 0.62), (0, 0, 1.19), bevel=0.06, cuts=1)
    cyl(parts, skin, 0.06, 0.1, (0, 0, 1.54), verts=8)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12, location=(0, 0, 1.66))
    add(bpy.context.active_object, skin, parts)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.125, location=(0, 0.015, 1.69))
    cap = bpy.context.active_object
    cap.scale.z = 0.75
    bpy.ops.object.transform_apply(scale=True)
    add(cap, hair, parts)
    person = join(parts, name)
    bake_vertex_colors(person, ao_floor=0.55, samples=16)
    return person


# ── 측량 드론 (폭 약 1.1 m) — SolarScope ───────────────────────────────

def build_drone():
    body = material("dr_body", "#e9edee")
    dark = material("dr_dark", "#2b3236")
    rotor = material("dr_rotor", "#9aa6aa")
    accent = material("dr_accent", "#f5a54a")
    lens = material("dr_lens", "#1b4f5c")
    parts = []
    box(parts, body, (0.42, 0.3, 0.12), (0, 0, 0.32), bevel=0.04)
    box(parts, dark, (0.3, 0.2, 0.06), (0, 0, 0.42), bevel=0.02)
    box(parts, accent, (0.06, 0.31, 0.02), (0.15, 0, 0.385))
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        x, y = math.cos(a) * 0.42, math.sin(a) * 0.42
        beam(parts, dark, (math.cos(a) * 0.12, math.sin(a) * 0.12, 0.33), (x, y, 0.36), 0.035)
        cyl(parts, dark, 0.035, 0.07, (x, y, 0.38), verts=10)
        cyl(parts, rotor, 0.19, 0.008, (x, y, 0.425), verts=24)
    # 착륙 다리 · 짐벌 카메라
    for s in (-1, 1):
        beam(parts, dark, (0.06, s * 0.1, 0.27), (0.08, s * 0.18, 0.02), 0.02)
        beam(parts, dark, (-0.06, s * 0.1, 0.27), (-0.08, s * 0.18, 0.02), 0.02)
        box(parts, dark, (0.32, 0.02, 0.02), (0, s * 0.18, 0.02))
    box(parts, dark, (0.1, 0.1, 0.08), (0, -0.05, 0.22), bevel=0.02)
    cyl(parts, lens, 0.03, 0.03, (0, -0.105, 0.22), verts=12, rot=(math.pi / 2, 0, 0))
    drone = join(parts, "Drone")
    bake_vertex_colors(drone, ao_floor=0.5, samples=16)
    return drone


# ── 컨테이너형 ESS (40ft: 12.2 × 2.44 × 2.9 m) — 공유형 ESS ──────────

def build_ess_container():
    L, Wd, H, BASE = 12.2, 2.44, 2.6, 0.3
    shell = material("ct_shell", "#e6e9e7")
    rib = material("ct_rib", "#d3d8d6")
    frame = material("ct_frame", "#9da6a8")
    skid = material("ct_skid", "#4e585c")
    hvac = material("ct_hvac", "#b7bfc1")
    grille = material("ct_grille", "#5d686c")
    label = material("ct_label", "#f0c22e")
    orange = material("ct_orange", "#e5762c")
    parts = []
    # 받침 스키드 · 본체 · 모서리 기둥 · 위아래 테두리
    for y in (-0.9, 0.9):
        box(parts, skid, (L, 0.2, BASE), (0, y, BASE / 2))
    box(parts, shell, (L, Wd, H), (0, 0, BASE + H / 2), cuts=4)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(parts, frame, (0.18, 0.18, H + 0.05), (sx * (L / 2 - 0.06), sy * (Wd / 2 - 0.06), BASE + H / 2))
    for z in (BASE + 0.05, BASE + H - 0.05):
        for sy in (-1, 1):
            box(parts, frame, (L, 0.12, 0.12), (0, sy * (Wd / 2 - 0.02), z))
    # 긴 면 골판: 세로 골
    n = 34
    for k in range(n):
        x = -L / 2 + 0.35 + k * (L - 0.7) / (n - 1)
        for sy in (-1, 1):
            box(parts, rib, (0.12, 0.05, H - 0.3), (x, sy * (Wd / 2 + 0.02), BASE + H / 2))
    # 정면(-Y): 출입문 2 · 벽걸이 냉방기 2 · 경고 표지
    for x in (-4.2, 4.2):
        box(parts, shell, (1.0, 0.06, 2.1), (x, -Wd / 2 - 0.05, BASE + 1.1), bevel=0.01)
        box(parts, frame, (0.05, 0.08, 0.2), (x + 0.35, -Wd / 2 - 0.1, BASE + 1.1))
        box(parts, label, (0.3, 0.02, 0.3), (x, -Wd / 2 - 0.09, BASE + 1.9))
    for x in (-1.6, 1.6):
        box(parts, hvac, (1.3, 0.55, 1.6), (x, -Wd / 2 - 0.3, BASE + 1.2), bevel=0.04, cuts=1)
        for k in range(8):
            box(parts, grille, (1.05, 0.03, 0.04), (x, -Wd / 2 - 0.59, BASE + 0.7 + k * 0.13))
    # 끝면(-X): 양문 · 잠금 막대 · 주황 비상 표시
    for sy in (-1, 1):
        box(parts, shell, (0.06, 1.1, H - 0.2), (-L / 2 - 0.04, sy * 0.58, BASE + H / 2), bevel=0.01)
        for dy in (-0.3, 0.3):
            cyl(parts, frame, 0.025, H - 0.3, (-L / 2 - 0.1, sy * 0.58 + dy, BASE + H / 2), verts=8)
    box(parts, orange, (0.03, 0.6, 0.15), (-L / 2 - 0.08, 0, BASE + H - 0.3))
    # 지붕 환기구
    for x in (-3, 0, 3):
        box(parts, hvac, (0.8, 0.8, 0.25), (x, 0, BASE + H + 0.12), bevel=0.03)
    ct = join(parts, "EssContainer")
    bake_vertex_colors(ct, ao_floor=0.4, samples=32)
    return ct


# ── 인버터 스키드 (6 × 2.4 × 2.6 m) — 태양광 발전소 ─────────────────────

def build_inverter():
    skid = material("iv_skid", "#4b555a")
    cab = material("iv_cab", "#dfe3e2")
    door = material("iv_door", "#d4d9d8")
    vent = material("iv_vent", "#6a7579")
    tr = material("iv_tr", "#8b989b")
    label = material("iv_label", "#49b6ca")
    parts = []
    box(parts, skid, (6.0, 2.4, 0.25), (0, 0, 0.125), bevel=0.02)
    # 인버터 함 (왼쪽) — 문 4짝 · 위 환기 루버
    box(parts, cab, (3.4, 1.6, 2.2), (-1.2, 0, 0.25 + 1.1), bevel=0.03, cuts=2)
    for k in range(4):
        x = -2.6 + k * 0.85 + 0.42
        box(parts, door, (0.78, 0.04, 1.8), (x, -0.82, 1.2), bevel=0.01)
        box(parts, vent, (0.6, 0.03, 0.25), (x, -0.85, 2.15))
    box(parts, label, (0.6, 0.02, 0.2), (-1.2, -0.86, 1.75))
    # 승압 변압기 (오른쪽) — 방열판
    box(parts, tr, (1.6, 1.4, 1.7), (1.9, 0, 0.25 + 0.85), bevel=0.03, cuts=2)
    for k in range(6):
        box(parts, vent, (0.04, 0.35, 1.3), (1.25 + k * 0.26, -0.88, 1.05))
    for k in range(3):
        cyl(parts, vent, 0.06, 0.35, (1.5 + k * 0.4, 0.3, 2.15), verts=10)
    iv = join(parts, "Inverter")
    bake_vertex_colors(iv, ao_floor=0.42, samples=24)
    return iv


# ── 실행 ─────────────────────────────────────────────────────────────

bpy.ops.wm.read_factory_settings(use_empty=True)
objects = [
    build_car(),
    build_lamp_post(),
    build_power_pole(False),
    build_power_pole(True),
    build_transformer(),
    build_bench(),
    build_playground(),
    build_restroom(),
]
objects += [
    build_person("PersonA", "#2f5f7a", "#3a3f44", "#2a2522"),
    build_person("PersonB", "#e8e4dc", "#28323a", "#4a3828"),
    build_person("PersonC", "#c96b4b", "#59606a", "#1f1d1c"),
    build_drone(),
    build_ess_container(),
    build_inverter(),
]
objects += build_tower()
objects += build_old_building()
objects += build_mid_office()
objects += build_shop_house("ShopHouse", 20.0, 12.0, 3, 4.0, 11)
objects += build_shop_house("SmallBlock", 16.0, 10.0, 2, 4.5, 17)

# 합친 모델의 원점은 첫 부품 위치에 남아 있다 → 위치를 꼭짓점에 굽고 원점을 바닥 가운데(0, 0, 0)로
for o in objects:
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
export_glb(objects, OUT, meshopt=True)
