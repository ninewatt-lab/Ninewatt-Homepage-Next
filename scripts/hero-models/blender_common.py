"""
Blender 모델 스크립트 공용 도우미 — 부품 만들기 · 합치기 · AO 를 꼭짓점 색으로 굽기 · GLB 내보내기.
build_hero_models.py(홈 히어로)와 ../district-models/build_district_models.py(Product 지역)가 같이 쓴다.
"""

import bmesh
import bpy

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


def export_glb(objects, out):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
        o.location = (0, 0, 0)
        print(f"{o.name}: {len(o.data.vertices)} verts, {len(o.data.polygons)} faces")
    bpy.ops.export_scene.gltf(
        filepath=out,
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
    print("exported", out)
