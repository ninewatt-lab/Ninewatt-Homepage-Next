"""Lab v2 시나리오 비교: 외단열 두께 × 창호 종류 조합마다 EnergyPlus 를 돌려 월별 냉난방 부하를 모은다.

    python3 scripts/lab/energy_scenarios.py <env.json> <weather.epw> <work_dir> src/data/lab/ai-building-workspace-scenarios.json

조합: 외단열 0(없음) · 50 · 100(도면) · 150 mm  ×  창호 old(기존) · lowe(도면) · triple(삼중 로이, 가정값) = 12회.
태양광은 외피와 무관해 따로 2장 · 4장 두 번만 돌린다 (PVWatts, 430 W 모듈).
나머지 조건(지붕 · 바닥 · 침기 · 재실 · 설비)은 energy_idf.py 의 before/after 와 같다.
EnergyPlus 9.0 이 /Applications/EnergyPlus-9-0-1 에 있어야 한다.
"""
import csv
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ENV, EPW, WORK, OUT = sys.argv[1:5]
HERE = os.path.dirname(os.path.abspath(__file__))
EPLUS = "/Applications/EnergyPlus-9-0-1/energyplus"
WALLS = [0, 50, 100, 150]
WINS = ["old", "lowe", "triple"]
MODULE_W = 430
os.makedirs(WORK, exist_ok=True)


def run(name, case, pv_w=0):
    idf = os.path.join(WORK, f"{name}.idf")
    out = os.path.join(WORK, f"out_{name}")
    subprocess.run([sys.executable, os.path.join(HERE, "energy_idf.py"), ENV, case, idf, EPW, str(pv_w)], check=True, capture_output=True)
    # ExpandObjects 가 실행 폴더에 임시 파일을 쓰므로 실행마다 자기 폴더에서 돌린다 (동시 실행)
    os.makedirs(out, exist_ok=True)
    subprocess.run([EPLUS, "-x", "-r", "-w", EPW, "-d", out, idf], check=True, capture_output=True, cwd=out)
    rows = list(csv.reader(open(os.path.join(out, "eplusmtr.csv"))))
    head = rows[0]
    col = lambda key: next((i for i, h in enumerate(head) if key in h), None)  # noqa: E731
    # J → kWh. 연간 합은 반올림 전 값으로 더한다 (v1 energy.json 과 같은 방식)
    raw = lambda i: [float(r[i]) / 3.6e6 for r in rows[1:13]] if i is not None else [0.0] * 12  # noqa: E731
    return name, {k: raw(col(key)) for k, key in (("heat", "DistrictHeating"), ("cool", "DistrictCooling"), ("pv", "ElectricityProduced"))}


jobs = [(f"w{w}-{g}", f"wall={w},win={g}") for w in WALLS for g in WINS]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = dict(pool.map(lambda j: run(*j), jobs))
    pv = dict(pool.map(lambda n: run(f"pv{n}", "after", n * MODULE_W), [2, 4]))

scenarios = {}
for name, r in results.items():
    scenarios[name] = {"heat": round(sum(r["heat"])), "cool": round(sum(r["cool"])), "heat_m": [round(v) for v in r["heat"]], "cool_m": [round(v) for v in r["cool"]]}
data = {
    "walls": WALLS,
    "windows": WINS,
    "scenarios": scenarios,
    "pv": {str(n): {"annual": round(sum(pv[f"pv{n}"]["pv"])), "monthly": [round(v) for v in pv[f"pv{n}"]["pv"]]} for n in (2, 4)},
}
with open(OUT, "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
for name in sorted(scenarios):
    s = scenarios[name]
    print(f"{name:12s} heat {s['heat']:6d} cool {s['cool']:6d} total {s['heat'] + s['cool']:6d}")
print({k: v["annual"] for k, v in data["pv"].items()}, "→", OUT)
