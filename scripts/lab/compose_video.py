"""도판 + 모델 렌더로 47초 영상 프레임을 만든다 (1920×1080, 30fps).

    python scripts/lab/compose_video.py <work_dir>
    ffmpeg -framerate 30 -i <work_dir>/vf/%05d.jpg -c:v libx264 -preset slow -crf 20 \
      -pix_fmt yuv420p -movflags +faststart <out.mp4>

work_dir 에 있어야 하는 것
  fig-plan.png, fig-rooms.png, elev-dxf.png, elev-overlay.png   (도판)
  tt/f_*.png      turntable      ex/f_*.png   explode
  vcut1.png, vcut2.png            label_cutaway.py 로 라벨을 얹은 cut1/cut2 video 렌더
  pext/f_*.png, vcut1-photo.png, pwalk/f_*.png   blender_photo.py 의 마감재 적용 렌더

타임라인(챕터 시작, 초)
  0 평면 · 4 실 경계 · 8 정면도 · 12 겹쳐 보기 · 16 회전+분해 · 24 1층 내부 · 29 2층 내부
  34 마감재 외관 · 38 마감재 1층 · 42 대기실 실내 · 47 끝
마감재 장면에는 근거 표기(PHOTO_NOTE)를 화면 아래에 얹는다.
이 시점을 바꾸면 src/data/labProjects.ts 의 video.chapters / duration 과 각 로케일 lab.json 의 chapters 도 바꾼다.
"""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

WORK = sys.argv[1]
W, H, FPS = 1920, 1080, 30
PLAN_CROP = (0.10, 0.18, 0.99, 0.76)  # 평면 도판에서 건물 부분만 (바깥 치수선 제외)
XFADE = int(0.6 * FPS)

vf = os.path.join(WORK, "vf")
os.makedirs(vf, exist_ok=True)
for f in glob.glob(os.path.join(vf, "*.jpg")):
    os.remove(f)


def on_white(im):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, "white")
    bg.alpha_composite(im)
    return bg.convert("RGB")


def slide(name, crop=None, max_w=0.86, max_h=0.9):
    im = on_white(Image.open(os.path.join(WORK, name)))
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    s = min(W * max_w / im.width, H * max_h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    canvas = Image.new("RGB", (W, H), "white")
    canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    return canvas


def full(path):
    return on_white(Image.open(path)).resize((W, H), Image.LANCZOS)


def seq(folder):
    return [full(p) for p in sorted(glob.glob(os.path.join(WORK, folder, "f_*.png")))]


def hold(frame, seconds):
    return [frame] * round(seconds * FPS)


PHOTO_NOTE = "도면 기재 마감재 적용 · 가구 없음 · 지붕 형태 미확정"
NOTE_FONT = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 26, index=2)


def noted(im):
    """마감재 렌더에 근거 표기. 반투명 바탕 위 작은 글씨."""
    im = im.copy()
    d = ImageDraw.Draw(im, "RGBA")
    x, y = 48, H - 72
    b = d.textbbox((x, y), PHOTO_NOTE, font=NOTE_FONT)
    d.rounded_rectangle((b[0] - 14, b[1] - 10, b[2] + 14, b[3] + 10), radius=8, fill=(255, 255, 255, 200))
    d.text((x, y), PHOTO_NOTE, font=NOTE_FONT, fill=(31, 41, 51, 255))
    return im


def push_in(im, seconds, zoom=1.06):
    """정지 이미지를 천천히 당겨 보는 장면."""
    n = round(seconds * FPS)
    out = []
    for i in range(n):
        z = 1 + (zoom - 1) * i / max(1, n - 1)
        w, h = W / z, H / z
        box = ((W - w) / 2, (H - h) / 2, (W + w) / 2, (H + h) / 2)
        out.append(im.resize((W, H), Image.LANCZOS, box=box))
    return out


# (프레임 목록, 앞 장면과 크로스페이드 여부)
spin, explode = seq("tt"), seq("ex")
pext = [noted(f) for f in seq("pext")]
pwalk = [noted(f) for f in seq("pwalk")]
pcut = [noted(f) for f in push_in(full(os.path.join(WORK, "vcut1-photo.png")), 4)]
segments = [
    (hold(slide("fig-plan.png", PLAN_CROP), 4), False),
    (hold(slide("fig-rooms.png", PLAN_CROP), 4), True),
    (hold(slide("elev-dxf.png"), 4), True),
    (hold(slide("elev-overlay.png"), 4), True),
    (spin, True),                      # 16 – 21 s
    (explode, False),                  # 21 – 24 s, turntable 마지막 화면에서 그대로 이어진다
    (hold(full(os.path.join(WORK, "vcut1.png")), 5), True),
    (hold(full(os.path.join(WORK, "vcut2.png")), 5), True),
    (pext, True),                      # 34 – 38 s
    (pcut, True),                      # 38 – 42 s
    (pwalk, True),                     # 42 – 46 s
    (hold(pwalk[-1], 1), False),
]

frames = []
for seg, fade in segments:
    start = len(frames)
    frames += seg
    if fade and start:
        a, b = frames[start - 1], frames[start]
        for i in range(XFADE):  # 경계를 가운데 두고 섞는다
            idx = start - XFADE // 2 + i
            frames[idx] = Image.blend(a, b, (i + 1) / (XFADE + 1))
white = Image.new("RGB", (W, H), "white")
for i in range(FPS // 2):  # 흰 화면에서 시작
    frames[i] = Image.blend(white, frames[i], i / (FPS / 2))

for n, fr in enumerate(frames):
    fr.save(os.path.join(vf, f"{n:05d}.jpg"), quality=93)
print(f"{len(frames)} frames, {len(frames) / FPS:.1f}s")
