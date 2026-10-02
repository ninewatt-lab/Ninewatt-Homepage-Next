"""평면 스크립트들이 함께 쓰는 설정: 시트 범위·모델 원점, 그리는 레이어, 실 이름 → 번역 키.

dxf_plan_figures.py · quantity_takeoff.py · viewer_data.py 가 import 한다
(scripts/lab 안에서 실행하므로 같은 폴더 모듈로 불러온다).
"""
import sys

INK = "#1f2933"
ACCENT = "#2f8a9c"
FLAG = "#d9822b"
FONT = "/System/Library/Fonts/AppleSDGothicNeo.ttc"  # macOS 한글 폰트

# 공사도면 > 층별 평면도(신설) 시트의 도면 영역(도면 좌표, mm)과 모델 좌표 원점.
# origin: 이 도면 좌표가 glb 모델의 (x, y) = model 모서리. 벽선 외곽으로 맞췄다.
PRESETS = {
    "1f": {"box": (362300, 239800, 378300, 262300), "origin": (365954, 245733), "model": (-0.17, -0.17),
           "files": ("fig-plan.png", "fig-rooms.png")},
    "2f": {"box": (405500, 239500, 420600, 262000), "origin": (409148, 245421), "model": (0.73, -0.17),
           "files": ("fig-plan-2f.png", "fig-rooms-2f.png"),
           # 도면에 실 이름이 없는 실. 위생기구 기호(SYM)와 모델의 VIS_F2_화장실_Floor 위치로 확인했다
           "extra_labels": [((417616, 252171), "화장실")]},
}
DRAW_LAYERS = {"WAL", "WIN", "HA1", "fin", "ETC", "SYM", "DIM", "PAR", "FIV", "TOL", "BAR2", "ELE",
               "AA-XXXX-JUMT1"}
FLOOR_Z = {"1f": 0.0, "2f": 3.3}  # 실 바닥 높이 (모델 기준, m)

# (층, 도면 실 이름들) → 번역 키(lab.json 의 case.rooms.<key>). 같은 이름이 층마다 있을 수 있어 층을 함께 쓴다
KEYS = {
    ("1f", ("대기실",)): "waiting",
    ("1f", ("진료실", "처치 및 조제실")): "clinic",
    ("1f", ("다목적실",)): "multipurpose",
    ("1f", ("계단실", "보일러실")): "stair",
    ("1f", ("현관",)): "entrance",
    ("1f", ("화장실",)): "toilet",
    ("2f", ("주방/식당", "거실")): "livingKitchen",
    ("2f", ("안방",)): "masterBedroom",
    ("2f", ("방",)): "bedroom",
    ("2f", ("화장실",)): "toilet2",
}


def room_key(floor, room):
    """rooms-<층>.json 의 한 실 → 번역 키. 베란다는 이름이 같아 위치로 나눈다(건물 동쪽 끝 x=10.5 m 기준)."""
    if "베란다" in room["names"]:
        return "verandaEast" if room["model_xy"][0] > 10.5 else "verandaWestSouth"
    key = KEYS.get((floor, tuple(room["names"])))
    if key is None:
        sys.exit(f"알 수 없는 실 이름: {floor} {room['names']} — plan_common.KEYS 에 추가할 것")
    return key


def to_dxf(floor, x, y):
    """모델 좌표(m) → 도면 좌표(mm)."""
    p = PRESETS[floor]
    return ((x - p["model"][0]) * 1000 + p["origin"][0], (y - p["model"][1]) * 1000 + p["origin"][1])
