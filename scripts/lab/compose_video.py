"""도판 + 모델 렌더로 39초 영상 프레임을 만든다 (1920×1080, 30fps).

    python scripts/lab/compose_video.py <work_dir>
    ffmpeg -framerate 30 -i <work_dir>/vf/%05d.jpg -c:v libx264 -preset slow -crf 20 \
      -pix_fmt yuv420p -movflags +faststart <out.mp4>

work_dir 에 있어야 하는 것
  fig-plan.png, fig-rooms.png, elev-dxf.png, elev-overlay.png   (도판)
  tt/f_*.png      turntable      ex/f_*.png   explode      walk/f_*.png   walk
  vcut1.png, vcut2.png            label_cutaway.py 로 라벨을 얹은 cut1/cut2 video 렌더

타임라인(챕터 시작, 초)
  0 평면 · 4 실 경계 · 8 정면도 · 12 겹쳐 보기 · 16 회전+분해 · 24 1층 내부 · 29 2층 내부 · 34 대기실 · 39 끝
이 시점을 바꾸면 src/data/labProjects.ts 의 video.chapters / duration 과 각 로케일 lab.json 의 chapters 도 바꾼다.
"""
import glob
import os
import sys

from PIL import Image

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


# (프레임 목록, 앞 장면과 크로스페이드 여부)
spin, explode, walk = seq("tt"), seq("ex"), seq("walk")
segments = [
    (hold(slide("fig-plan.png", PLAN_CROP), 4), False),
    (hold(slide("fig-rooms.png", PLAN_CROP), 4), True),
    (hold(slide("elev-dxf.png"), 4), True),
    (hold(slide("elev-overlay.png"), 4), True),
    (spin, True),                      # 16 – 21 s
    (explode, False),                  # 21 – 24 s, turntable 마지막 화면에서 그대로 이어진다
    (hold(full(os.path.join(WORK, "vcut1.png")), 5), True),
    (hold(full(os.path.join(WORK, "vcut2.png")), 5), True),
    (walk, True),                      # 34 – 38 s
    (hold(walk[-1], 1), False),
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
