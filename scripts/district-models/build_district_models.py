"""
Product 페이지 3D 테마 지역 소품 모델 생성 (Blender 5.x, 배경 실행).

    /Applications/Blender.app/Contents/MacOS/blender -b --python scripts/district-models/build_district_models.py -- public/models/district-props-v1.glb

만드는 것 (노드 이름 = 코드에서 찾는 이름)
- Car            승용차 (차체 · 유리 캐빈 · 바퀴 · 전조등 · 후미등). 차체는 밝은 회색이라 three.js 인스턴스 색으로 칠한다
- LampPost       공원 · 보행로 가로등 (받침 · 기둥 · 갓). 빛나는 등은 코드에서 갓 아래에 그린다
- PowerPole      배전 전주 (콘크리트 기둥 · 완철 · 버팀대 · 애자 3개)
- PowerPoleTx    주상변압기가 달린 전주
- Transformer    공유형 ESS 단지 변압기 (방열판 · 부싱 · 콘서베이터)
- Bench          공원 벤치 (주철 다리 · 나무 살)
- Playground     놀이터 (탑 · 지붕 · 미끄럼틀 · 사다리 · 그네 · 고무 바닥)
- Restroom       공원 화장실 (벽 · 처마 지붕 · 문 · 환기창)

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
export_glb(objects, OUT)
