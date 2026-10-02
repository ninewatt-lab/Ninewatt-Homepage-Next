"""물량 산출 내역서 PDF (표지 · 산출 기준 · 실별 물량 · 자재별 물량과 예시 금액 · 마킹 도면 첨부).

    python scripts/lab/takeoff_report.py <work_dir> <out.pdf>

work_dir 의 takeoff.json · fig-takeoff-1f.png · fig-takeoff-2f.png (quantity_takeoff.py) 로 HTML 을 만들고
Chrome 헤드리스로 A4 PDF 를 인쇄한다. 프로젝트명은 익명(소규모 공공 보건시설)으로 쓴다.
"""
import base64
import datetime
import html
import io
import json
import os
import subprocess
import sys

from PIL import Image

WORK, OUT = sys.argv[1], sys.argv[2]
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

t = json.load(open(os.path.join(WORK, "takeoff.json"), encoding="utf-8"))
today = datetime.date.today().isoformat()

ROOM = {
    "waiting": "대기실", "clinic": "진료실 · 처치 및 조제실", "multipurpose": "다목적실", "stair": "계단실 · 보일러실",
    "entrance": "현관", "toilet": "화장실", "livingKitchen": "거실 · 주방/식당", "masterBedroom": "안방",
    "bedroom": "방", "toilet2": "화장실", "verandaWestSouth": "베란다 (서·남측)", "verandaEast": "베란다 (동측)",
}
MAT = {
    "decoTile": "중보행용 데코타일", "porcelainFloor": "자기질 바닥타일", "vinylSheet": "비닐계 시트",
    "epoxy": "에폭시 방수", "paintInt": "내부 수성페인트", "ceramicWall": "도기질 벽타일", "wallpaper": "벽지",
    "gypsumPaint": "경량철골 천장틀 + 석고보드 + 수성페인트", "gypsumPaper": "경량철골 천장틀 + 석고보드 + 천정지",
    "smcCeiling": "SMC 천장재", "fbRailing": "F.B 철재 난간",
}
# 실별 표에 쓰는 약칭 (전체 이름은 자재별 표에)
SHORT = {
    "decoTile": "데코타일", "porcelainFloor": "자기질타일", "vinylSheet": "비닐계 시트", "epoxy": "에폭시 방수",
    "paintInt": "수성페인트", "ceramicWall": "도기질타일", "wallpaper": "벽지", "gypsumPaint": "석고보드 · 도장",
    "gypsumPaper": "석고보드 · 천정지", "smcCeiling": "SMC", "fbRailing": "F.B 난간",
}
FLOOR = {"1f": "1층 · 보건진료소", "2f": "2층 · 관사"}


def num(v, d=1):
    return "-" if v is None else f"{v:,.{d}f}"


def img(name, crop=(0.04, 0.12, 1.0, 0.80)):
    """마킹 도면에서 건물과 치수선 부분만 잘라 넣는다 (위·아래 여백 제외)."""
    im = Image.open(os.path.join(WORK, name)).convert("RGB")
    w, h = im.size
    im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    buf = io.BytesIO()
    im.save(buf, "PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


rows = []
for floor in ("1f", "2f"):
    rows.append(f'<tr class="group"><td colspan="8">{FLOOR[floor]}</td></tr>')
    for r in (r for r in t["rooms"] if r["floor"] == floor):
        f = r["finish"]
        name = html.escape(ROOM[r["key"]]) + (' <span class="flag">경계 검토</span>' if r["review"] else "")
        wa = f'난간 {num(r["railing"])} m' if r["outdoor"] else num(r["WA"])
        rows.append(
            f"<tr><td>{name}</td><td class=n>{num(r['L'])}</td><td class=n>{num(r['A'])}</td><td class=n>{wa}</td>"
            f"<td class=n>{r['openings'] or '-'}</td><td>{SHORT[f['floor']]}</td>"
            f"<td>{SHORT[f['wall']] if f['wall'] else ('F.B 난간' if r['outdoor'] else '-')}</td>"
            f"<td>{SHORT[f['ceiling']] if f['ceiling'] else '-'}</td></tr>")

mats = "".join(
    f"<tr><td>{MAT[m['key']]}</td><td class=n>{m['qty']:,.1f}</td><td class=c>{m['unit']}</td>"
    f"<td class=n>{m['price']:,}</td><td class=n>{m['amount']:,}</td></tr>" for m in t["materials"])

doc = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>물량 산출 내역서</title>
<style>
@page {{ size: A4; margin: 16mm 14mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: "Apple SD Gothic Neo", "Pretendard", sans-serif; color: #1f2933; font-size: 9pt; margin: 0; }}
section {{ page-break-after: always; }} section:last-child {{ page-break-after: auto; }}
h1 {{ font-size: 24pt; text-align: center; margin: 70mm 0 10mm; letter-spacing: 0.08em; }}
h2 {{ font-size: 15pt; text-align: center; margin: 0 0 6mm; }}
h3 {{ font-size: 11pt; margin: 7mm 0 2.5mm; }}
.sub {{ text-align: center; font-size: 12pt; margin-bottom: 70mm; }}
.meta p {{ margin: 0.6mm 0; }}
table {{ width: 100%; border-collapse: collapse; }}
th, td {{ border: 0.6pt solid #1f2933; padding: 1.4mm 1.8mm; vertical-align: top; }}
th {{ background: #dbeed8; font-weight: 700; }}
td.n {{ text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }}
td.c {{ text-align: center; }}
tr.group td {{ background: #f1f3f4; font-weight: 700; }}
tr.total td {{ background: #dbe7f6; font-weight: 700; }}
.flag {{ color: #b85c00; font-size: 7.5pt; border: 0.6pt solid #d9822b; padding: 0 1mm; border-radius: 1mm; }}
.rev td, .rev th {{ text-align: center; font-size: 8.5pt; }}
ul {{ margin: 1mm 0; padding-left: 5mm; }} li {{ margin: 0.8mm 0; }}
.note {{ font-size: 8pt; color: #4b5563; }}
.sheet img {{ width: 100%; max-height: 235mm; object-fit: contain; border: 0.6pt solid #9ca3af; }}
</style></head><body>

<section>
  <h1>견적 물량 산출 내역서</h1>
  <div class="sub">소규모 공공 보건시설 그린리모델링 (예시)</div>
  <table class="rev">
    <tr><td>0</td><td>{today}</td><td>LAB SAMPLE — 예시 단가 적용</td><td>AI Building Workspace</td><td>-</td><td>-</td></tr>
    <tr><th>Rev.</th><th>Date</th><th>Reason for Issuance</th><th>Prepared By</th><th>Checked By</th><th>Approved By</th></tr>
  </table>
  <p class="note" style="text-align:center;margin-top:6mm">Ninewatt Lab · 실제 그린리모델링 설계 도면(DXF)에서 자동 산출. 기관·설계사 정보는 제외했습니다.</p>
</section>

<section>
  <h2>견적 물량 산출 내역서</h2>
  <div class="meta">
    <p>프로젝트 명 : 소규모 공공 보건시설 그린리모델링 (예시)</p>
    <p>작성일 : {today}</p>
    <p>문서 버전 : Rev.0 / 용도 : 산출 방식 예시 (견적서 아님)</p>
  </div>

  <h3>1. 산출 기준</h3>
  <ul>
    <li>L (둘레) · A (바닥 면적) : 도면 벽·창호 레이어로 닫은 실 경계(벽 내측 면) 기준</li>
    <li>WA (벽 면적) = L × 천장고 {t['ceilingHeight']} m − 창·문 면적 (실내 문은 양쪽 실 모두에서 차감)</li>
    <li>천장 면적 = 바닥 면적. 베란다는 바닥 방수와 난간(건물 벽에 닿지 않은 경계 길이, 추정)만 산출</li>
    <li>마감은 공사도면 주석의 마감 표기를 따름. 칸막이 선이 없어 여러 실이 한 영역으로 묶인 곳은 "경계 검토"</li>
  </ul>

  <h3>2. 실별 물량</h3>
  <table>
    <tr><th>실</th><th>L (m)</th><th>A (㎡)</th><th>WA (㎡)</th><th>창·문</th><th>바닥</th><th>벽</th><th>천장</th></tr>
    {''.join(rows)}
  </table>

</section>

<section>
  <h3>3. 자재별 물량 및 예시 금액</h3>
  <table>
    <tr><th>자재</th><th>물량</th><th>단위</th><th>예시 단가 (원)</th><th>금액 (원)</th></tr>
    {mats}
    <tr class="total"><td colspan="4" style="text-align:center">합계 (예시)</td><td class=n>{t['total']:,}</td></tr>
  </table>
  <p class="note">* 단가는 자재 + 시공비를 포함한 일반 시세 수준을 가정한 <b>예시</b>이며 실제 견적이 아닙니다. 자재 등급·시공 조건에 따라 달라집니다.<br>
  * 도면에 실 이름이 없는 2층 계단실, 철거·설비·전기 공사는 포함하지 않았습니다.</p>

  <h3>4. 첨부</h3>
  <p>1) 물량 산출 마킹 도면 — 1층 &nbsp; 2) 물량 산출 마킹 도면 — 2층</p>
</section>

<section class="sheet"><h3>첨부 1. 물량 산출 마킹 도면 — 1층</h3><img src="{img('fig-takeoff-1f.png')}"></section>
<section class="sheet"><h3>첨부 2. 물량 산출 마킹 도면 — 2층</h3><img src="{img('fig-takeoff-2f.png', (0.0, 0.12, 1.0, 0.92))}"></section>
</body></html>"""

html_path = os.path.join(WORK, "takeoff-report.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(doc)
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                f"--print-to-pdf={os.path.abspath(OUT)}", "file://" + os.path.abspath(html_path)],
               check=True, capture_output=True)
print(OUT, os.path.getsize(OUT) // 1024, "KB")
