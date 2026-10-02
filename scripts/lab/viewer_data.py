"""웹 3D 뷰어 데이터를 public/lab/<slug>/viewer/ 에 쓴다.

    python scripts/lab/viewer_data.py <work_dir> public/lab/ai-building-workspace/viewer

work_dir 에 필요한 것: model-web.glb (blender_web_export.py), rooms-1f.json · rooms-2f.json ·
plan-overlay-1f.png/json · plan-overlay-2f.png/json (dxf_plan_figures.py), takeoff.json (quantity_takeoff.py, 선택).

rooms.json 의 key 는 lab.json 의 case.rooms.<key> 번역 키와 같다. 도면 실 이름이 바뀌면 plan_common.KEYS 를 고친다.
좌표는 모델(Blender) 좌표 m: x 동쪽, y 북쪽. 뷰어가 three.js(y 위) 좌표로 바꾼다.
"""
import json
import os
import shutil
import sys

from PIL import Image

from plan_common import FLOOR_Z, room_key

WORK, DEST = sys.argv[1], sys.argv[2]
os.makedirs(DEST, exist_ok=True)


# quantity_takeoff.py 결과가 있으면 실마다 L·WA·난간 길이를 함께 넣는다 (뷰어의 실 정보 창)
takeoff_path = os.path.join(WORK, "takeoff.json")
takeoff = {}
if os.path.exists(takeoff_path):
    takeoff = {(r["floor"], r["key"]): r for r in json.load(open(takeoff_path, encoding="utf-8"))["rooms"]}

rooms, overlays = [], {}
for floor in ("1f", "2f"):
    for r in json.load(open(os.path.join(WORK, f"rooms-{floor}.json"), encoding="utf-8")):
        key = room_key(floor, r)
        tk = takeoff.get((floor, key), {})
        rooms.append({"key": key, "floor": floor, "z": FLOOR_Z[floor], "area": r["area_m2"],
                      "review": r["review"], "label": r["model_xy"], "polygon": r["polygon"],
                      "L": tk.get("L"), "WA": tk.get("WA"), "railing": tk.get("railing")})
    meta = json.load(open(os.path.join(WORK, f"plan-overlay-{floor}.json")))
    im = Image.open(os.path.join(WORK, f"plan-overlay-{floor}.png"))
    im.save(os.path.join(DEST, f"plan-{floor}.webp"), "WEBP", lossless=True)
    overlays[floor] = {"src": f"plan-{floor}.webp", "bounds": meta["bounds"], "z": FLOOR_Z[floor]}

shutil.copy(os.path.join(WORK, "model-web.glb"), os.path.join(DEST, "model.glb"))
with open(os.path.join(DEST, "viewer.json"), "w", encoding="utf-8") as f:
    json.dump({"model": "model.glb", "rooms": rooms, "overlays": overlays}, f, ensure_ascii=False)

for n in sorted(os.listdir(DEST)):
    print(n, os.path.getsize(os.path.join(DEST, n)) // 1024, "KB")
