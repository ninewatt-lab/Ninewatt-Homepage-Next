"""부스 상영 영상 합성 (무음, 1920×1080, 30fps).

    python3 scripts/lab/expo_video.py <work_dir> <base.mp4> <out.mp4>

work_dir 아래에 있어야 하는 것
  cards/     expo_cards.py 출력 (intro·estimate·connect·end·cap-00…09·ov-*)
  insulate/  blender_energy.py insulate 프레임 f_0001.png…
  thermal/   blender_energy.py thermal 프레임
  chart/     expo_chart.py 프레임

순서: 인트로 4s → 기존 47초(v4, 챕터 자막) → 그린리모델링 5s → 열화상 5s → 월별 부하 7s
      → 견적 6s → 연계 제품 5s → QR 6s. 장면 사이 0.5초 페이드.
"""
import subprocess
import sys
from pathlib import Path

work, base, out = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
C = work / "cards"
X = 0.5

inputs, f = [], []


def add(*args):
    inputs.extend(args)
    return len([a for a in inputs if a == "-i"]) - 1


def still(name, sec):
    return add("-loop", "1", "-t", str(sec), "-i", str(C / f"{name}.png"))


def seq(folder):
    return add("-framerate", "30", "-i", str(work / folder / "f_%04d.png"))


def overlay(src, layers, label):
    """layers: (카드 이름, 시작 s, 끝 s)"""
    f.append(f"[{src}:v]fps=30,setsar=1[{label}0]")
    for i, (name, t0, t1) in enumerate(layers):
        k = add("-loop", "1", "-i", str(C / f"{name}.png"))
        f.append(f"[{label}{i}][{k}:v]overlay=0:0:enable='between(t,{t0},{t1})':shortest=1[{label}{i + 1}]")
    f.append(f"[{label}{len(layers)}]format=yuv420p[{label}]")
    return label


segs = []  # (label, 길이 s)

i = still("intro", 4)
f.append(f"[{i}:v]fps=30,format=yuv420p,setsar=1[s_intro]")
segs.append(("s_intro", 4))

b = add("-i", base)
starts = [0, 4, 8, 12, 16, 24, 29, 34, 38, 42]
ends = starts[1:] + [47]
segs.append((overlay(b, [(f"cap-{n:02d}", s + 0.4, e - 0.3) for n, (s, e) in enumerate(zip(starts, ends))], "s_base"), 47))

ins = seq("insulate")
segs.append((overlay(ins, [("ov-ins-a", 0, 2.6), ("ov-ins-b", 2.6, 5)], "s_ins"), 5))

th = seq("thermal")
segs.append((overlay(th, [("ov-th-before", 0, 2.5), ("ov-th-after", 2.5, 5)], "s_th"), 5))

ch = seq("chart")
f.append(f"[{ch}:v]fps=30,format=yuv420p,setsar=1[s_chart]")
segs.append(("s_chart", 7))

for name, sec in (("estimate", 6), ("connect", 5), ("end", 6)):
    k = still(name, sec)
    f.append(f"[{k}:v]fps=30,format=yuv420p,setsar=1[s_{name}]")
    segs.append((f"s_{name}", sec))

last, t = segs[0][0], segs[0][1]
for n, (lab, sec) in enumerate(segs[1:], 1):
    o = f"x{n}"
    f.append(f"[{last}][{lab}]xfade=transition=fade:duration={X}:offset={t - X:.2f}[{o}]")
    last, t = o, t + sec - X

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", ";".join(f), "-map", f"[{last}]",
                "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", out], check=True)
print(f"{out} {t:.1f}s")
