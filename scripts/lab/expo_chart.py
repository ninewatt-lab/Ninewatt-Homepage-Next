"""부스 영상용 '월별 냉난방 부하' 애니메이션 프레임 (1920×1080, 30fps, 7초).

    python3 scripts/lab/expo_chart.py <out_dir>

EnergyPlus 결과(ai-building-workspace-energy.json 의 월별 난방+냉방)를 1월부터 막대로 키우고,
연간 합계를 세어 올린 뒤 절감률을 보여 준다. 한 프레임마다 Chrome 으로 찍는다.
"""
import json
import subprocess
import sys
from pathlib import Path

out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
root = Path(__file__).resolve().parents[2]
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
e = json.loads((root / "src/data/lab/ai-building-workspace-energy.json").read_text())["energy"]
before = [h + c for h, c in zip(e["before"]["heat_m"], e["before"]["cool_m"])]
after = [h + c for h, c in zip(e["after"]["heat_m"], e["after"]["cool_m"])]
FPS, SEC = 30, 7

html = """<!doctype html><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}html,body{width:1920px;height:1080px;overflow:hidden;background:#fff}
body{font-family:"Apple SD Gothic Neo",sans-serif;color:#171717}
.num{font-variant-numeric:tabular-nums}.en{color:#6b7280;font-weight:500}
</style><div id="root"></div><script>
const B=%s, A=%s, T=%s, TB=%s, TA=%s;
const ease=x=>x<=0?0:x>=1?1:1-Math.pow(1-x,3);
const t=parseFloat(location.hash.slice(1))||0;
const max=Math.max(...B), H=520, BW=30, GAP=10, SLOT=2*BW+GAP+28;
const grow=i=>ease((t-0.04-i*0.04)/0.12);
// 월별 값은 반올림돼 있어 합이 연간 합계와 몇 kWh 다르다. 카운터는 진행률 × 연간 합계(페이지와 같은 숫자)
const sum=a=>a.reduce((x,y)=>x+y,0);
let gb=0, ga=0; B.forEach((v,i)=>{gb+=v*grow(i); ga+=A[i]*grow(i)});
const sb=TB*gb/sum(B), sa=TA*ga/sum(A);
const k=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
let bars="";
B.forEach((v,i)=>{const g=grow(i), x=i*SLOT;
 bars+=`<div style="position:absolute;left:${x}px;bottom:0;width:${BW}px;height:${v/max*H*g}px;background:#c7cbd1;border-radius:6px 6px 0 0"></div>`+
 `<div style="position:absolute;left:${x+BW+GAP/2}px;bottom:0;width:${BW}px;height:${A[i]/max*H*g}px;background:#3896A8;border-radius:6px 6px 0 0"></div>`+
 `<div style="position:absolute;left:${x-10}px;bottom:-44px;width:${2*BW+30}px;text-align:center;font-size:24px;color:#6b7280">${k[i]}</div>`;});
const W=12*SLOT-28;
const band=(i0,i1,lab,c)=>`<div style="position:absolute;left:${i0*SLOT-14}px;width:${(i1-i0+1)*SLOT}px;top:-70px;height:${H+70}px;background:${c};border-radius:12px"></div>`+
 `<div style="position:absolute;left:${i0*SLOT}px;top:-58px;font-size:22px;font-weight:700;color:#6b7280">${lab}</div>`;
const fin=ease((t-0.68)/0.12);
const fmt=v=>Math.round(v).toLocaleString("en-US");
document.getElementById("root").innerHTML=`
<div style="position:absolute;left:120px;top:84px">
 <div style="font-size:28px;font-weight:700;color:#3896A8">EnergyPlus 1년 시뮬레이션 <span class="en">Annual simulation</span></div>
 <div style="font-size:60px;font-weight:800;margin-top:10px">월별 냉난방 부하</div>
 <div style="display:flex;gap:28px;margin-top:22px;font-size:26px;color:#6b7280">
  <span><span style="display:inline-block;width:20px;height:20px;background:#c7cbd1;border-radius:4px;vertical-align:-2px"></span> 리모델링 전 Before</span>
  <span><span style="display:inline-block;width:20px;height:20px;background:#3896A8;border-radius:4px;vertical-align:-2px"></span> 리모델링 후 After</span></div>
</div>
<div style="position:absolute;left:120px;top:420px;width:470px">
 <div style="font-size:26px;color:#6b7280">연간 합계 · kWh</div>
 <div class="num" style="font-size:54px;font-weight:700;color:#9aa3ab;margin-top:12px">${fmt(sb)}</div>
 <div class="num" style="font-size:72px;font-weight:800;color:#3896A8;margin-top:4px">${fmt(sa)}</div>
 <div style="opacity:${fin};transform:translateY(${(1-fin)*20}px);margin-top:26px">
  <span class="num" style="font-size:150px;font-weight:800;color:#3896A8;line-height:1">−${T}%%</span>
  <div style="font-size:28px;font-weight:700;margin-top:8px">냉난방 에너지 절감 <span class="en">saved</span></div></div>
</div>
<div style="position:absolute;left:700px;top:380px;width:${W}px;height:${H}px">
 ${band(0,3,"난방 Heating","rgba(244,109,67,.07)")}${band(4,9,"냉방 Cooling","rgba(69,117,180,.07)")}${band(10,11,"난방","rgba(244,109,67,.07)")}
 ${bars}
 <div style="position:absolute;left:-14px;right:-14px;bottom:0;height:2px;background:#171717"></div>
</div>
<div style="position:absolute;left:120px;bottom:60px;font-size:22px;color:#6b7280">간이 시뮬레이션 · 벽·창 면적은 도면으로 만든 3D 모델에서 측정 · 국내 표준 기상 데이터(TMYx) · 에너지효율등급이 아닙니다</div>`;
</script>"""

page = out / "chart.html"
tb, ta = e["before"]["heat"] + e["before"]["cool"], e["after"]["heat"] + e["after"]["cool"]
saving = round((1 - ta / tb) * 100)
page.write_text(html % (json.dumps(before), json.dumps(after), saving, tb, ta))
n = FPS * SEC
for f in ([int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else range(n)):
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1920,1080",
                    f"--screenshot={out / f'f_{f + 1:04d}.png'}", f"{page.as_uri()}#{f / (n - 1):.4f}"],
                   check=True, capture_output=True)
print("frames", n)
