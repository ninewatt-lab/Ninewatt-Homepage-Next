"""단면 렌더(cut1/cut2)에 실 이름·면적 라벨을 얹는다. 투명 배경은 흰색으로 합성.

    python scripts/lab/label_cutaway.py <cut.png> <out.png>

<cut.png>.labels.json(blender_render.py 가 rooms.json 을 받아 쓴 파일)의 px 위치에 라벨을 그린다.
여러 실이 한 영역으로 묶인 곳(review)은 주황 테두리 + "경계 검토 필요".
"""
import json
import sys

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
labels = json.load(open(src + ".labels.json", encoding="utf-8"))

im = Image.open(src).convert("RGBA")
bg = Image.new("RGBA", im.size, "white")
bg.alpha_composite(im)
im = bg.convert("RGB")
d = ImageDraw.Draw(im)

k = im.width / 2400  # 2400 px 폭 기준 크기
FONT = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
bold = ImageFont.truetype(FONT, round(34 * k), index=4)  # SemiBold
reg = ImageFont.truetype(FONT, round(30 * k), index=0)
INK, ACCENT, FLAG = (31, 41, 51), (47, 138, 156), (217, 130, 43)

for lab in labels:
    x, y = lab["px"]
    review = lab.get("review", False)
    lines = [(" · ".join(lab["names"]), bold, INK), (f"{lab['area_m2']:.2f} ㎡", reg, ACCENT if not review else FLAG)]
    if review:
        lines.append(("경계 검토 필요", reg, FLAG))
    gap = round(8 * k)
    sizes = [d.textbbox((0, 0), t, font=f) for t, f, _ in lines]
    w = max(b[2] - b[0] for b in sizes)
    h = sum(b[3] - b[1] for b in sizes) + gap * (len(lines) - 1)
    pad = round(16 * k)
    box = (x - w / 2 - pad, y - h / 2 - pad, x + w / 2 + pad, y + h / 2 + pad)
    d.rounded_rectangle(box, radius=round(12 * k), fill="white", outline=FLAG if review else ACCENT,
                        width=max(2, round(3 * k)))
    ty = y - h / 2
    for (t, f, c), b in zip(lines, sizes):
        d.text((x - (b[2] - b[0]) / 2 - b[0], ty - b[1]), t, font=f, fill=c)
        ty += (b[3] - b[1]) + gap

im.save(out)
print(out, im.size)
