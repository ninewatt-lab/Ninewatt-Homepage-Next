"""Lab v2 시나리오 비교: 외단열 두께 × 창호 종류 조합마다 EnergyPlus 를 돌려 월별 냉난방 부하와
겨울 · 여름 대표일의 면별 · 시간별 열 흐름을 모은다.

    python3 scripts/lab/energy_scenarios.py <env.json> <weather.epw> <work_dir> \\
        src/data/lab/ai-building-workspace-scenarios.json public/lab/ai-building-workspace-v2/hourly.json

조합: 외단열 0(없음) · 50 · 100(도면) · 150 mm  ×  창호 old(기존) · lowe(도면) · triple(삼중 로이, 가정값) = 12회.
태양광은 외피와 무관해 따로 2장 · 4장 두 번만 돌린다 (PVWatts, 430 W 모듈).
나머지 조건(지붕 · 바닥 · 침기 · 재실 · 설비)은 energy_idf.py 의 before/after 와 같다.
EnergyPlus 9.0 이 /Applications/EnergyPlus-9-0-1 에 있어야 한다.

대표일: 리모델링 전(w0-old) 결과에서 1층 진료 공간이 냉난방하는 평일 중 가장 추운 1월 날 · 가장 더운 7~8월 날.
시간별 열 흐름(W/㎡, + = 실내에서 밖으로 새는 열): 벽 · 지붕은 Surface Inside Face Conduction Heat Transfer Rate per Area 의
부호를 뒤집은 값, 창은 Surface Window Net Heat Transfer Rate(투과 일사 포함)를 창 면적으로 나눠 부호를 뒤집은 값.
"""
import csv
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ENV, EPW, WORK, OUT, HOURLY = sys.argv[1:6]
HERE = os.path.dirname(os.path.abspath(__file__))
EPLUS = "/Applications/EnergyPlus-9-0-1/energyplus"
WALLS = [0, 50, 100, 150]
WINS = ["old", "lowe", "triple"]
MODULE_W = 430
FLOORS = ["F1", "F2"]
DIRS = "NESW"
os.makedirs(WORK, exist_ok=True)

HOURLY_OUTPUTS = """
Output:Variable,*,Surface Inside Face Conduction Heat Transfer Rate per Area,Hourly;
Output:Variable,*,Surface Window Net Heat Transfer Rate,Hourly;
Output:Variable,*,Zone Mean Air Temperature,Hourly;
Output:Variable,*,Zone Ideal Loads Supply Air Total Heating Rate,Hourly;
Output:Variable,*,Zone Ideal Loads Supply Air Total Cooling Rate,Hourly;
Output:Variable,Environment,Site Outdoor Air Drybulb Temperature,Hourly;
"""

# 창 면적 (층 · 방위) — energy_idf.py 와 같은 계산
INTERNAL = {"F1_StairSouth_0", "F1_LobbyInner_0", "F2_StairSouth_0", "F2_MasterSouthInternal_0"}
WIN_AREA = {}
for o in json.load(open(ENV))["openings"]:
    if o["ext"] and o["id"] not in INTERNAL:
        WIN_AREA[(o["floor"], o["ext"])] = WIN_AREA.get((o["floor"], o["ext"]), 0) + o["area"]


def run(name, case, pv_w=0, hourly=False):
    idf = os.path.join(WORK, f"{name}.idf")
    out = os.path.join(WORK, f"out_{name}")
    subprocess.run([sys.executable, os.path.join(HERE, "energy_idf.py"), ENV, case, idf, EPW, str(pv_w)], check=True, capture_output=True)
    if hourly:
        with open(idf, "a") as f:
            f.write(HOURLY_OUTPUTS)
    # ExpandObjects 가 실행 폴더에 임시 파일을 쓰므로 실행마다 자기 폴더에서 돌린다 (동시 실행)
    os.makedirs(out, exist_ok=True)
    subprocess.run([EPLUS, "-x", "-r", "-w", EPW, "-d", out, idf], check=True, capture_output=True, cwd=out)
    rows = list(csv.reader(open(os.path.join(out, "eplusmtr.csv"))))
    head = rows[0]
    col = lambda key: next((i for i, h in enumerate(head) if key in h), None)  # noqa: E731
    # J → kWh. 연간 합은 반올림 전 값으로 더한다 (v1 energy.json 과 같은 방식)
    raw = lambda i: [float(r[i]) / 3.6e6 for r in rows[1:13]] if i is not None else [0.0] * 12  # noqa: E731
    result = {k: raw(col(key)) for k, key in (("heat", "DistrictHeating"), ("cool", "DistrictCooling"), ("pv", "ElectricityProduced"))}
    if hourly:
        result["hours"] = read_hourly(os.path.join(out, "eplusout.csv"))
    return name, result


def read_hourly(path):
    """날짜(MM/DD) → 그날 24시간 행, 그리고 값마다의 열 번호"""
    rows = list(csv.reader(open(path)))
    head = [h.strip() for h in rows[0]]
    find = lambda key: next(i for i, h in enumerate(head) if key in h)  # noqa: E731
    cols = {"out": find("Outdoor Air Drybulb"), "heat": [], "cool": []}
    for fl in FLOORS:
        cols[f"zone_{fl}"] = find(f"Z{fl}:Zone Mean Air")
        cols["heat"].append(find(f"Z{fl} IDEAL LOADS AIR SYSTEM:Zone Ideal Loads Supply Air Total Heating Rate"))
        cols["cool"].append(find(f"Z{fl} IDEAL LOADS AIR SYSTEM:Zone Ideal Loads Supply Air Total Cooling Rate"))
        cols[f"roof_{fl}"] = find(f"Z{fl}_ROOF:Surface Inside Face")
        for d in DIRS:
            cols[f"wall_{fl}_{d}"] = find(f"Z{fl}_W{d}:Surface Inside Face")
            if WIN_AREA.get((fl, d)):
                cols[f"win_{fl}_{d}"] = find(f"Z{fl}_G{d}:Surface Window Net")
    days = {}
    for r in rows[1:]:
        if len(r) > cols["out"] and r[cols["out"]].strip():
            days.setdefault(r[0].strip()[:5], []).append(r)
    return {"cols": cols, "days": days}


def day_values(hours, md):
    cols, rows = hours["cols"], hours["days"][md]
    f = lambda i: [float(r[i]) for r in rows]  # noqa: E731
    r1 = lambda vs: [round(v, 1) for v in vs]  # noqa: E731
    d = {
        "out": r1(f(cols["out"])),
        "zone": {fl: r1(f(cols[f"zone_{fl}"])) for fl in FLOORS},
        "heat": r1([sum(float(r[i]) for i in cols["heat"]) / 1000 for r in rows]),  # kW
        "cool": r1([sum(float(r[i]) for i in cols["cool"]) / 1000 for r in rows]),
        "roof": {fl: r1([-v for v in f(cols[f"roof_{fl}"])]) for fl in FLOORS},
        "wall": {},
        "win": {},
    }
    for fl in FLOORS:
        for dd in DIRS:
            d["wall"][f"{fl}_{dd}"] = r1([-v for v in f(cols[f"wall_{fl}_{dd}"])])
            if f"win_{fl}_{dd}" in cols:
                d["win"][f"{fl}_{dd}"] = r1([-v / WIN_AREA[(fl, dd)] for v in f(cols[f"win_{fl}_{dd}"])])
    return d


def pick_days(hours):
    """1층 진료 공간이 냉난방하는 평일(정오 실온이 설정 온도) 중 가장 추운 1월 날 · 가장 더운 7~8월 날"""
    cols, days = hours["cols"], hours["days"]
    z = cols["zone_F1"]
    t = lambda md, fn: fn(float(r[cols["out"]]) for r in days[md])  # noqa: E731
    winter = [md for md in days if md.startswith("01/") and abs(float(days[md][12][z]) - 20) < 0.6]
    summer = [md for md in days if md[:2] in ("07", "08") and float(days[md][12][z]) <= 26.6]
    return min(winter, key=lambda md: t(md, min)), max(summer, key=lambda md: t(md, max))


jobs = [(f"w{w}-{g}", f"wall={w},win={g}") for w in WALLS for g in WINS]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = dict(pool.map(lambda j: run(*j, hourly=True), jobs))
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

winter, summer = pick_days(results["w0-old"]["hours"])
hourly = {
    "days": {"winter": winter.replace("/", "-"), "summer": summer.replace("/", "-")},
    "runs": {name: {"winter": day_values(r["hours"], winter), "summer": day_values(r["hours"], summer)} for name, r in results.items()},
}
with open(HOURLY, "w") as f:
    json.dump(hourly, f, separators=(",", ":"))

for name in sorted(scenarios):
    s = scenarios[name]
    print(f"{name:12s} heat {s['heat']:6d} cool {s['cool']:6d} total {s['heat'] + s['cool']:6d}")
print({k: v["annual"] for k, v in data["pv"].items()}, "days", hourly["days"], "→", OUT, HOURLY, os.path.getsize(HOURLY) // 1024, "KB")
