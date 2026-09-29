"""도면 정면도 ↔ 모델 정면 정합 확인 + 겹쳐 보기 이미지.

    python scripts/lab/elevation_overlay.py <elev-dxf.png> <elev-model.png> <out-overlay.png> [--register]

--register: 모델 윤곽선을 도면 선에 가장 잘 겹치는 이동량(px)을 찾아 출력한다.
0 이 아니면 blender_render.py 의 front 카메라 위치를 그만큼 보정한다
(100.76 px = 1 m. 예: dy -49 → 카메라 z 를 0.486 m 낮춤).
"""
import sys

import numpy as np
from PIL import Image, ImageFilter

drawing_path, model_path, out_path = sys.argv[1:4]
drawing = Image.open(drawing_path).convert("L")
model = Image.open(model_path).convert("RGBA")

# Blender 출력은 투명 배경 → 흰 바탕에 합성
flat = Image.new("RGBA", model.size, "white")
flat.alpha_composite(model)
model = flat.convert("RGB")
model.save(model_path)

if "--register" in sys.argv:
    d = np.asarray(drawing.filter(ImageFilter.MinFilter(5))) < 140  # 도면 선을 2px 정도 두껍게
    m = np.asarray(model.convert("L").filter(ImageFilter.FIND_EDGES)) > 40
    best = None
    for dy in range(-90, 91):
        for dx in range(-20, 21, 2):
            s = (np.roll(np.roll(m, dy, 0), dx, 1) & d)[300:900].sum()  # 지붕(미확정) 아래 띠만 비교
            if best is None or s > best[0]:
                best = (s, dy, dx)
    print(f"best shift: dy={best[1]} px, dx={best[2]} px")

# 모델 위에 도면 선을 빨강으로
a = np.asarray(model).copy()
a[np.asarray(drawing) < 140] = [214, 69, 65]
Image.fromarray(a).save(out_path)
