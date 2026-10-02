"""작업 폴더의 도판을 사이트용 webp/jpg 로 내보낸다.

    python scripts/lab/export_web.py <work_dir> public/lab/<slug>

출력 크기(px)가 바뀌면 src/data/labProjects.ts 의 width/height 도 맞춘다.
파일 내용을 바꿀 때는 이름도 바꾼다 — 같은 URL 이면 /_next/image·CDN 캐시가 예전 이미지를 계속 준다.
"""
import os
import sys

from PIL import Image, ImageChops

WORK, DEST = sys.argv[1], sys.argv[2]
os.makedirs(DEST, exist_ok=True)


def load(name):
    """투명 배경은 흰색으로 합성."""
    im = Image.open(os.path.join(WORK, name)).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white")
    bg.alpha_composite(im)
    return bg.convert("RGB")


def trim(im, pad=0.04):
    bb = ImageChops.difference(im, Image.new("RGB", im.size, "white")).getbbox()
    p = int(im.width * pad)
    return im.crop((max(bb[0] - p, 0), max(bb[1] - p, 0), min(bb[2] + p, im.width), min(bb[3] + p, im.height)))


def fit(im, max_w):
    return im if im.width <= max_w else im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)


def webp(im, name):
    im.save(os.path.join(DEST, name), "WEBP", quality=88)
    print(name, im.size)


# 평면 두 장: 여백을 걷어낸 뒤 아래쪽 치수선 영역은 잘라낸다
for src, dst in (("fig-plan.png", "plan.webp"), ("fig-rooms.png", "rooms.webp")):
    im = trim(load(src), pad=0.03)
    webp(fit(im.crop((0, 0, im.width, int(im.height * 0.80))), 1400), dst)

axo = trim(load("model-axo-line.png"))
webp(fit(axo, 1800), "model-axo.webp")

# 층별 내부 단면 (label_cutaway.py 결과). 라벨 위치가 렌더와 맞물려 있어 자르지 않는다
for src, dst in (("fig-cut1.png", "interior-1f-r2.webp"), ("fig-cut2.png", "interior-2f-r2.webp")):
    webp(fit(load(src), 1800), dst)

# 마감재 적용 사실적 렌더링 (blender_photo.py)
for src, dst in (("photo-ext.png", "photo-exterior-r2.webp"), ("photo-cut1.png", "photo-1f-r2.webp"),
                 ("photo-walk.png", "photo-waiting-room-r2.webp")):
    webp(fit(load(src), 1800), dst)

# 물량 산출 마킹 도면 (quantity_takeoff.py). 위·아래 치수선 여백은 잘라낸다
for src, dst, crop in (("fig-takeoff-1f.png", "takeoff-1f.webp", (0.04, 0.12, 1.0, 0.80)),
                       ("fig-takeoff-2f.png", "takeoff-2f.webp", (0.0, 0.12, 1.0, 0.92))):
    if os.path.exists(os.path.join(WORK, src)):
        im = load(src)
        w, h = im.size
        webp(fit(im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))), 1400), dst)

# 정면 비교 3장은 같은 크기·정렬을 유지해야 하므로 자르지 않는다
for src, dst in (("elev-dxf.png", "elevation-drawing.webp"), ("elev-model-line.png", "elevation-model.webp"),
                 ("elev-overlay.png", "elevation-overlay.webp")):
    webp(load(src), dst)

# 목록 카드·영상 포스터(16:9)와 공유 미리보기(1200×630)
for size, fill, name in (((1920, 1080), (0.8, 0.86), "case-cover.webp"), ((1200, 630), (0.83, 0.89), "case-og.jpg")):
    canvas = Image.new("RGB", size, "white")
    s = min(size[0] * fill[0] / axo.width, size[1] * fill[1] / axo.height)
    a = axo.resize((round(axo.width * s), round(axo.height * s)), Image.LANCZOS)
    canvas.paste(a, ((size[0] - a.width) // 2, (size[1] - a.height) // 2))
    if name.endswith(".jpg"):
        canvas.save(os.path.join(DEST, name), quality=88)
        print(name, canvas.size)
    else:
        webp(canvas, name)
