"""웹 3D 뷰어용 glb 내보내기. 마감재 색을 단순 PBR 재질로 입히고 객체마다 층·종류 태그를 단다.

    blender -b --factory-startup --python scripts/lab/blender_web_export.py -- <model.glb> <out.glb>

- VIS_* 표현용 객체만 남긴다 (분석용 원본·전시용 바닥판 제외).
- 재질 이름 = 뷰어의 재질 키 (wall, roof, glass, frame, floor1, floor2, joint, ceiling, door, metal, slab, sill).
  blender_photo.py 와 같은 도면 마감 표기를 따르되, 웹에서 재현되지 않는 절차적 질감 대신 색·거칠기만 쓴다.
- 객체 custom property(glTF extras): floor = "1f" | "2f" | "roof", kind = 재질 키.
  뷰어는 이 태그로 층 숨김·선화 전환을 한다. 객체 이름은 모델 원본 그대로 둔다(기관 정보 없음).
"""
import sys

import bpy

glb, out = sys.argv[sys.argv.index("--") + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
sc = bpy.context.scene

for o in list(sc.objects):
    if o.type == "MESH" and (not o.name.startswith("VIS_") or "Ground" in o.name):
        bpy.data.objects.remove(o, do_unlink=True)
for o in list(sc.objects):
    if o.type == "EMPTY" and not o.children:
        bpy.data.objects.remove(o, do_unlink=True)


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92 for v in c) + (1.0,)


# 키: (색, 거칠기, 금속성, 불투명도)
SPEC = {
    "wall": ("#ece8e1", 0.85, 0.0, 1.0),     # 스타코 / 내부 수성페인트
    "wall2": ("#eee9df", 0.85, 0.0, 1.0),    # 2층 벽지
    "ceiling": ("#f4f4f2", 0.9, 0.0, 1.0),   # 석고보드
    "floor1": ("#c7b394", 0.55, 0.0, 1.0),   # 데코타일
    "floor2": ("#b48e64", 0.45, 0.0, 1.0),   # 비닐계 시트
    "joint": ("#7a7369", 0.7, 0.0, 1.0),
    "tile": ("#dcdcd8", 0.4, 0.0, 1.0),      # 화장실 자기질 타일
    "slab": ("#cfccc5", 0.85, 0.0, 1.0),
    # 리얼징크(미확정). 웹에는 반사 환경맵이 없어 금속성을 높이면 새까맣게 보이므로 낮게 둔다
    "roof": ("#7a8388", 0.55, 0.0, 1.0),
    "frame": ("#eeeeec", 0.35, 0.0, 1.0),    # PVC 창틀
    "glass": ("#bcd3d1", 0.05, 0.0, 0.32),   # 로이 복층유리
    "door": ("#e6e1d8", 0.5, 0.0, 1.0),
    "metal": ("#b9bcbf", 0.3, 1.0, 1.0),
    "sill": ("#d6d2ca", 0.5, 0.0, 1.0),
}
MATS = {}
for key, (col, rough, metal, alpha) in SPEC.items():
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(col)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    MATS[key] = m


def classify(o):
    n = o.name
    mats = " ".join(m.name for m in o.data.materials if m).lower()
    f2 = "_F2_" in n
    if "UNCONFIRMED" in n or "Roof" in n or "Eaves" in n:
        return "roof", "roof"
    floor = "2f" if f2 else "1f"
    # 실별 바닥 마감 판 (예: VIS_F1_대기실_Floor). 재질 이름이 마감 종류를 알려 준다
    if n.endswith("_Floor") or "_Floor." in n:
        if "porcelain" in mats:
            return floor, "tile"
        return floor, ("floor2" if f2 else "floor1")
    if "Glass" in n or "glazing" in mats:
        kind = "glass"
    elif "FloorJoint" in n:
        kind = "joint"
    elif "ContinuousCeiling" in n:
        kind = "ceiling"
    elif "Floor_" in n:
        kind = "floor2" if f2 else "floor1"
    elif "Balcony" in n:
        kind = "slab"
    elif "Handle" in n:
        kind = "metal"
    elif "DoorLeaf" in n:
        kind = "door"
    elif "SillStone" in n:
        kind = "sill"
    elif any(k in n for k in ("Jamb", "HeadSill", "Mullion")) or "window_profile" in mats:
        kind = "frame"
    else:
        kind = "wall2" if f2 else "wall"
    return floor, kind


for o in sc.objects:
    if o.type != "MESH":
        continue
    floor, kind = classify(o)
    o.data.materials.clear()
    o.data.materials.append(MATS[kind])
    # 바닥판 옆면(외벽 쪽 슬래브 끝)은 바닥재 대신 외벽색 — 위를 향하지 않는 면만 두 번째 재질로
    if kind in ("floor1", "floor2"):
        o.data.materials.append(MATS["wall"])
        for poly in o.data.polygons:
            poly.material_index = 0 if poly.normal.z > 0.5 else 1
    o["floor"] = floor
    o["kind"] = kind

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format="GLB",
    export_extras=True,
    export_apply=True,
    export_yup=True,
    export_texcoords=False,
    export_normals=True,
    export_materials="EXPORT",
)
print("EXPORTED", out, sum(1 for o in sc.objects if o.type == "MESH"))
