"""부스 상영 영상(/expo)용 카드·자막 HTML 을 만들고 Chrome 으로 1920×1080 PNG 를 찍는다.

    python3 scripts/lab/expo_cards.py <out_dir> <qr.svg>

카드: intro · energy · estimate · connect · end (흰 배경)
자막: cap-00 … cap-09 (투명 배경, 기존 47초 영상 챕터마다 한·영 한 줄씩)
숫자는 src/data/lab/ai-building-workspace-energy.json, 챕터 이름은 lab.json 에서 읽는다.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

out = Path(sys.argv[1])
qr_svg = Path(sys.argv[2]).read_text()
out.mkdir(parents=True, exist_ok=True)
root = Path(__file__).resolve().parents[2]
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

energy = json.loads((root / "src/data/lab/ai-building-workspace-energy.json").read_text())
ko = json.loads((root / "src/messages/ko/lab.json").read_text())["projects"]["ai-building-workspace"]["chapters"]
en = json.loads((root / "src/messages/en/lab.json").read_text())["projects"]["ai-building-workspace"]["chapters"]

logo_tsx = (root / "src/components/icons/NinewattLogo.tsx").read_text()
paths = re.findall(r'd="([^"]+)"', logo_tsx)
logo = (
    '<svg viewBox="0 0 157 60" width="236" height="90" xmlns="http://www.w3.org/2000/svg">'
    + "".join(f'<path fill-rule="evenodd" d="{d}" fill="#3896A8"/>' for d in paths)
    + "</svg>"
)

TEAL, INK, MUTED = "#3896A8", "#171717", "#6b7280"
BASE = f"""<!doctype html><meta charset="utf-8"><style>
*{{margin:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden}}
body{{font-family:"Apple SD Gothic Neo","Pretendard",sans-serif;color:{INK};background:#fff}}
.card{{position:relative;width:1920px;height:1080px;padding:120px 160px}}
.badge{{display:inline-block;border:2px solid {TEAL}66;background:{TEAL}14;color:{TEAL};font-weight:700;font-size:30px;padding:10px 26px;border-radius:999px}}
.en{{color:{MUTED};font-weight:500}}
.logo{{position:absolute;right:120px;bottom:80px}}
.foot{{position:absolute;left:160px;bottom:96px;font-size:24px;color:{MUTED}}}
h1{{font-size:112px;line-height:1.15;font-weight:800;letter-spacing:-2px}}
h2{{font-size:72px;font-weight:800;letter-spacing:-1px}}
.num{{font-variant-numeric:tabular-nums}}
</style>"""

won = lambda v: f"{v:,}"
b, a = energy["energy"]["before"], energy["energy"]["after"]
tb, ta = b["heat"] + b["cool"], a["heat"] + a["cool"]
saving = round((1 - ta / tb) * 100)
mx = max(b["heat"], b["cool"])


def bar(label_ko, label_en, vb, va):
    pct = round((1 - va / vb) * 100)
    row = lambda v, c, lab: (
        f'<div style="display:flex;align-items:center;gap:24px;margin-top:14px">'
        f'<div style="width:150px;font-size:26px;color:{MUTED}">{lab}</div>'
        f'<div style="flex:1;height:46px"><div style="height:100%;width:{v / mx * 100:.1f}%;background:{c};border-radius:0 6px 6px 0"></div></div>'
        f'<div class="num" style="width:230px;text-align:right;font-size:30px">{won(v)} kWh</div></div>'
    )
    return (
        f'<div style="margin-top:44px"><div style="display:flex;justify-content:space-between;font-size:40px;font-weight:700">'
        f'<span>{label_ko} <span class="en" style="font-size:28px">{label_en}</span></span><span class="num" style="color:{TEAL}">−{pct}%</span></div>'
        + row(vb, "#c7cbd1", "전 Before")
        + row(va, TEAL, "후 After")
        + "</div>"
    )


cards = {
    "intro": f"""<div class="card" style="display:flex;flex-direction:column;justify-content:center">
<div><span class="badge">2026 대한민국 ESG 친환경 대전 · 10.21–10.23</span></div>
<h1 style="margin-top:56px">도면 한 장으로,<br>그린리모델링까지.</h1>
<p class="en" style="margin-top:40px;font-size:44px">From one drawing to green remodeling.</p>
<p style="margin-top:56px;font-size:34px;color:{MUTED};line-height:1.5">3D 모델 · 물량 산출 · 리모델링 견적 · 에너지 시뮬레이션<br>실제 그린리모델링 설계 도면 한 세트로 시험했습니다.</p>
<div class="logo">{logo}</div></div>""",
    "energy": f"""<div class="card">
<div style="font-size:30px;font-weight:700;color:{TEAL}">STEP 5 · 에너지 시뮬레이션 <span class="en">Energy simulation</span></div>
<div style="display:flex;gap:120px;margin-top:40px;align-items:flex-start">
<div style="width:520px"><h2 style="font-size:64px;line-height:1.25">리모델링 후<br>냉난방 에너지</h2>
<div class="num" style="font-size:200px;font-weight:800;color:{TEAL};line-height:1.1;margin-top:20px">−{saving}%</div>
<p class="en" style="font-size:34px;margin-top:12px">Heating &amp; cooling energy</p>
<p style="font-size:26px;color:{MUTED};margin-top:36px;line-height:1.6">외단열 PF보드 100 mm + 로이 복층유리 창호<br>(도면에 적힌 공사만 반영)</p></div>
<div style="flex:1;padding-top:30px">{bar("난방", "Heating", b["heat"], a["heat"])}{bar("냉방", "Cooling", b["cool"], a["cool"])}</div></div>
<div class="foot">EnergyPlus 9.0 간이 시뮬레이션 · 벽·창 면적은 도면으로 만든 3D 모델에서 측정 · 에너지효율등급이 아닙니다 · Simplified simulation, not an official rating</div></div>""",
    "estimate": f"""<div class="card">
<div style="font-size:30px;font-weight:700;color:{TEAL}">STEP 4 · 물량 산출 · 견적 <span class="en">Quantities &amp; estimate</span></div>
<h2 style="margin-top:28px">그린리모델링 견적 <span style="color:{MUTED};font-weight:600;font-size:48px">(예시 단가)</span></h2>
<table style="margin-top:56px;width:100%;border-collapse:collapse;font-size:36px">
<tr style="color:{MUTED};font-size:26px;text-align:left"><th style="padding:14px 0;font-weight:500">공사 Work</th><th style="text-align:right;font-weight:500">물량</th><th style="text-align:right;font-weight:500">금액 (원)</th></tr>
<tr style="border-top:2px solid #eee"><td style="padding:26px 0">외벽 외단열 <span class="en" style="font-size:26px">External insulation</span></td><td class="num" style="text-align:right">272.1 ㎡</td><td class="num" style="text-align:right">{won(energy["estimate"]["items"][0]["amount"])}</td></tr>
<tr style="border-top:2px solid #eee"><td style="padding:26px 0">창호 교체 <span class="en" style="font-size:26px">Windows</span></td><td class="num" style="text-align:right">57.0 ㎡</td><td class="num" style="text-align:right">{won(energy["estimate"]["items"][1]["amount"])}</td></tr>
<tr style="border-top:2px solid #eee"><td style="padding:26px 0">내부 마감 <span class="en" style="font-size:26px">Interior finishes</span></td><td class="num" style="text-align:right">11종</td><td class="num" style="text-align:right">{won(energy["estimate"]["items"][2]["amount"])}</td></tr>
<tr style="border-top:3px solid {INK};font-weight:800;font-size:44px"><td style="padding:28px 0">합계 <span class="en" style="font-size:28px">Total</span></td><td></td><td class="num" style="text-align:right;color:{TEAL}">{won(energy["estimate"]["total"])}</td></tr>
</table>
<div class="foot">물량은 도면 · 3D 모델에서 산출 · 단가는 일반 시세를 가정한 예시이며 실제 견적이 아닙니다 · Example unit prices, not a quote</div></div>""",
    "connect": f"""<div class="card">
<h2 style="margin-top:40px">나인와트 제품과 이어집니다</h2>
<p class="en" style="font-size:36px;margin-top:16px">Connected to Ninewatt products</p>
<div style="display:flex;gap:40px;margin-top:90px">
""" + "".join(
        f'<div style="flex:1;border:2px solid #e5e7eb;border-radius:24px;padding:48px">'
        f'<div style="font-size:52px;font-weight:800;color:{TEAL}">{n}</div>'
        f'<div style="font-size:30px;line-height:1.55;margin-top:24px">{d}</div>'
        f'<div class="en" style="font-size:24px;line-height:1.5;margin-top:20px">{e}</div></div>'
        for n, d, e in [
            ("Energy Studio", "국토안전원 기존 건축물<br>에너지 · 온실가스 시뮬레이터", "Existing-building energy &amp; GHG simulator"),
            ("GreenPlanner", "건물주를 위한<br>리모델링 의사결정 서비스", "Remodeling decisions for building owners"),
            ("GRAI", "공공건축물 그린리모델링<br>시뮬레이션 플랫폼", "Green-remodeling platform for public buildings"),
        ]
    ) + f"""</div><div class="logo">{logo}</div></div>""",
    "end": f"""<div class="card" style="display:flex;align-items:center;gap:140px">
<div style="width:520px;height:520px;padding:24px;border:2px solid #e5e7eb;border-radius:24px">{qr_svg.replace("<svg", '<svg width="470" height="470"', 1)}</div>
<div><h2 style="font-size:84px;line-height:1.2">QR로 자세히 보기</h2>
<p class="en" style="font-size:40px;margin-top:20px">Scan for details · 詳しくはQRで</p>
<p class="num" style="font-size:52px;font-weight:700;color:{TEAL};margin-top:60px">ninewatt.com/ko/expo</p>
<p style="font-size:32px;color:{MUTED};margin-top:28px">한국어 · English · 日本語</p>
<div style="margin-top:80px">{logo}</div></div></div>""",
}

starts = [0, 4, 8, 12, 16, 24, 29, 34, 38, 42]
for i, (k, e) in enumerate(zip(ko, en)):
    cards[f"cap-{i:02d}"] = (
        f'<div style="position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:22px;'
        f'background:rgba(255,255,255,.94);border-radius:18px;padding:22px 34px;box-shadow:0 6px 24px rgba(0,0,0,.12)">'
        f'<span class="num" style="font-size:26px;font-weight:800;color:{TEAL}">{i + 1:02d}</span>'
        f'<span style="font-size:42px;font-weight:800">{k}</span>'
        f'<span class="en" style="font-size:30px">{e}</span></div>'
    )

for name, html in cards.items():
    cap = name.startswith("cap-")
    page = out / f"{name}.html"
    page.write_text(BASE.replace("background:#fff", "background:transparent" if cap else "background:#fff") + html)
    args = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1920,1080",
            f"--screenshot={out / (name + '.png')}", page.as_uri()]
    if cap:
        args.insert(4, "--default-background-color=00000000")
    subprocess.run(args, check=True, capture_output=True)
    print("card", name)
print("starts", starts)
