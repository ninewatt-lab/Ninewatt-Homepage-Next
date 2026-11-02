"""그린리모델링 솔루션 페이지 — 리모델링 종류별 예시 건물 4채의 시공 전후를 EnergyPlus 9.0 으로 계산한다.

건물마다 시공 단계를 하나씩 더해 가며(누적) 돌린다. 페이지의 시공 연출도 같은 단계 순서로 진행된다.

  envelope   어린이집 3층   외단열(PF보드 100 mm) → 고성능 창호(로이 복층) → 외부 차양(남 · 동 · 서, 냉방철 햇빛이 셀 때 내림)
  systems    주민센터 2층   히트펌프(노후 보일러 · 냉방기 교체) → 전열교환 환기 → LED 조명
  roof       도서관 2층     옥상 단열 · 쿨루프(밝은 마감) → 태양광
  operations 업무 빌딩 6층  운전 시간 · 설정 온도 최적화 → 야간 대기전력 차단 → 조명 자동 소등 (BEMS)

모든 건물은 실제 건물이 아닌 예시(정사각에 가까운 상자 모양, 층마다 존 하나)다. 냉난방은 이상 부하(IdealLoads)로 구하고,
설비 효율로 연료 · 전기로 바꾼다. 결과는 1차 에너지(건축물 에너지효율등급과 같은 환산 계수)와 탄소 배출량으로 낸다.
팬 · 펌프 동력은 넣지 않는다. 침기는 시공 전후 같게 둔다(창호 교체의 기밀 개선 = 반영 안 함, 보수적).

    python3 scripts/green-remodeling/energy.py <weather.epw> <work_dir> src/data/green-remodeling.json
"""
import csv
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

EPW, WORK, OUT = sys.argv[1:4]
EPLUS = "/Applications/EnergyPlus-9-0-1/energyplus"
os.makedirs(WORK, exist_ok=True)

# 1차 에너지 환산 계수 (건축물 에너지효율등급 인증 기준) · 탄소 배출 계수 (kgCO2/kWh)
PRIMARY = {"elec": 2.75, "gas": 1.1}
CO2 = {"elec": 0.4781, "gas": 0.2022}

# 건물: 가로 × 세로(m) · 층 수 · 층고 · 용도 · 방위별 창 면적비
BUILDINGS = {
    "envelope": {"w": 18, "d": 12, "floors": 3, "h": 3.3, "use": "daycare", "wwr": {"S": 0.35, "N": 0.15, "E": 0.15, "W": 0.15}},
    "systems": {"w": 22, "d": 14, "floors": 2, "h": 3.6, "use": "civic", "wwr": {"S": 0.3, "N": 0.2, "E": 0.15, "W": 0.15}},
    "roof": {"w": 32, "d": 20, "floors": 2, "h": 4.2, "use": "library", "wwr": {"S": 0.25, "N": 0.2, "E": 0.1, "W": 0.1}},
    "operations": {"w": 26, "d": 18, "floors": 6, "h": 3.6, "use": "office", "wwr": {"S": 0.4, "N": 0.3, "E": 0.3, "W": 0.3}},
}

# 단계: 시공 전 상태에서 바뀌는 값만 적는다 (누적)
STEPS = {
    "envelope": ["insulation", "windows", "shading"],
    "systems": ["heatpump", "erv", "led"],
    "roof": ["roofIns", "pv"],
    "operations": ["schedule", "standby", "lighting"],
}

BASE = {
    "wallU": 1.4,  # 노후 외벽 (1980~90년대, 단열 거의 없음)
    "wallMm": 0,
    "win": (4.0, 0.70, 0.7),  # 노후 창 (Lab v2 의 기존 창과 같은 값) U · SHGC · VT
    "roofU": 0.8,
    "roofAbs": 0.75,  # 짙은 방수층
    "shade": False,
    "heatEff": 0.80,  # 가스 보일러 (노후)
    "heatElec": False,
    "coolCop": 2.6,  # 노후 냉방기
    "erv": 0,
    "lpd": 12,  # 형광등 W/㎡
    "pvKw": 0,
    "hours": "long",  # long = 관리 안 됨(일찍 켜고 늦게 끔), opt = BEMS 운전 스케줄
    "standby": 0.3,  # 사용 시간 밖 기기 대기전력(사용 중 대비)
    "lightOff": 0.2,  # 사용 시간 밖 켜 둔 조명
    "heatSp": 22,
    "coolSp": 24,
}
# 설비는 건물마다 기본을 조금 다르게 둔다 — 외피 · 지붕 · 운영 건물은 설비가 이미 보통 수준(보일러 0.85 · 냉방 COP 3.0)
COMMON_SYS = {"heatEff": 0.85, "coolCop": 3.0}
BASE_OVERRIDE = {
    "envelope": {**COMMON_SYS, "hours": "opt", "standby": 0.2, "lightOff": 0.05, "heatSp": 20, "coolSp": 26},
    "systems": {"hours": "opt", "standby": 0.2, "lightOff": 0.05, "heatSp": 20, "coolSp": 26},
    "roof": {**COMMON_SYS, "hours": "opt", "standby": 0.2, "lightOff": 0.05, "heatSp": 20, "coolSp": 26},
    "operations": {**COMMON_SYS, "wallU": 0.6, "roofU": 0.5, "win": (2.8, 0.6, 0.65)},
}
CHANGE = {
    "insulation": {"wallMm": 100},
    "windows": {"win": (1.5, 0.42, 0.6)},
    "shading": {"shade": True},
    "heatpump": {"heatEff": 3.2, "heatElec": True, "coolCop": 4.0},  # 공기열원 히트펌프 계절 효율
    "erv": {"erv": 0.7},  # 전열교환 환기 현열 효율
    "led": {"lpd": 6},
    "roofIns": {"roofU": 0.15, "roofAbs": 0.3},
    "pv": {"pvKw": "roof"},  # 옥상 면적의 45 %에 모듈
    "schedule": {"hours": "opt", "heatSp": 20, "coolSp": 26},
    "standby": {"standby": 0.15},
    "lighting": {"lightOff": 0.05},
}

# 용도: 재실(인/㎡) · 조명 외 기기(W/㎡) · 사용 시간(평일, 토요일) — 관리 안 된 경우는 앞뒤로 2시간씩 길게 켠다
USE = {
    "daycare": {"ppl": 0.25, "epd": 5, "open": (7, 19), "sat": None},
    "civic": {"ppl": 0.08, "epd": 10, "open": (9, 18), "sat": None},
    "library": {"ppl": 0.1, "epd": 6, "open": (9, 21), "sat": (9, 18)},
    "office": {"ppl": 0.1, "epd": 15, "open": (8, 19), "sat": None},
}
OA_PER_PERSON = 0.007  # m³/s · 인 (25 m³/h)
MODULE = {"w": 430, "area": 1.72 * 1.13}

# 지면 온도: EPW 머리말의 0.5 m 깊이 월별 값 (Lab 의 energy_idf.py 와 같은 방식)
GROUND = [8, 6, 6, 8, 12, 16, 19, 21, 21, 18, 14, 10]
for line in open(EPW, encoding="latin-1"):
    if line.startswith("GROUND TEMPERATURES"):
        GROUND = [float(x) for x in line.strip().split(",")[6:18]]
        break


def schedules(use, s):
    u = USE[use]
    # 관리 안 됨: 냉난방을 1시간 일찍 켜고 2시간 늦게 끈다
    early, late = (1, 2) if s["hours"] == "long" else (0, 0)

    def day(rng, vin, vout, pad=(0, 0)):
        on, off = rng[0] - pad[0], rng[1] + pad[1]
        return f"Until: {on:02d}:00,{vout},Until: {off:02d}:00,{vin},Until: 24:00,{vout}"

    def comp(name, vin, vout, typ="Frac", pad=(0, 0)):
        sat = f"For: Saturday,{day(u['sat'], vin, vout, pad)}," if u["sat"] else ""
        return f"Schedule:Compact,{name},{typ},Through: 12/31,For: Weekdays,{day(u['open'], vin, vout, pad)},{sat}For: AllOtherDays,Until: 24:00,{vout};"

    return [
        comp("Occ", 1, 0),
        comp("Light", 1, s["lightOff"]),
        comp("Equip", 1, s["standby"]),
        comp("HeatSP", s["heatSp"], 15, "Any", (early, late)),
        comp("CoolSP", s["coolSp"], 30, "Any", (early, late)),
    ]


def idf(key, s):
    b = BUILDINGS[key]
    w, d, n, h = b["w"], b["d"], b["floors"], b["h"]
    u = USE[b["use"]]
    L = [
        "Version,9.0;",
        "Timestep,6;",
        f"Building,{key},0,City,0.04,0.4,FullExterior,25,6;",
        "GlobalGeometryRules,UpperLeftCorner,Counterclockwise,Relative;",
        "SimulationControl,No,No,No,No,Yes;",
        "RunPeriod,Year,1,1,,12,31,,,Yes,No,No,Yes,Yes;",
        "ScheduleTypeLimits,Any,,,Continuous;",
        "ScheduleTypeLimits,Frac,0,1,Continuous;",
        "Schedule:Constant,Always1,Frac,1;",
        "Schedule:Constant,ActLvl,Any,120;",
        "Schedule:Constant,HVACType,Any,4;",
        f"Site:GroundTemperature:BuildingSurface,{','.join(f'{t:.1f}' for t in GROUND)};",
        *schedules(b["use"], s),
        "Material,Concrete200,MediumRough,0.2,1.6,2300,880,0.9,0.7,0.7;",
        "Material,Stucco10,Smooth,0.01,0.7,1800,840,0.9,0.5,0.5;",
        f"Material:NoMass,OldWallR,Rough,{1 / s['wallU'] - 0.17 - 0.2 / 1.6:.3f},0.9,0.7,0.7;",
        f"Material:NoMass,RoofR,Rough,{1 / s['roofU'] - 0.14 - 0.125:.3f},0.9,{s['roofAbs']},{s['roofAbs']};",
        f"Material:NoMass,FloorR,Rough,{1 / 0.6 - 0.17 - 0.125:.3f},0.9,0.7,0.7;",
        "Construction,Roof,RoofR,Concrete200;",
        "Construction,Slab,FloorR,Concrete200;",
        "Construction,Interfloor,Concrete200;",
        f"WindowMaterial:SimpleGlazingSystem,Glz,{s['win'][0]},{s['win'][1]},{s['win'][2]};",
        "Construction,Win,Glz;",
        # 외부 차양 천: 일사 투과 10 % · 반사 60 %
        "WindowMaterial:Shade,ShadeMat,0.1,0.6,0.1,0.6,0.9,0,0.003,0.1,0.05,1,1,0,0,0;",
        "Construction,WinShade,ShadeMat,Glz;",
        "Schedule:Compact,CoolSeason,Frac,Through: 4/30,For: AllDays,Until: 24:00,0,Through: 9/30,For: AllDays,Until: 24:00,1,Through: 12/31,For: AllDays,Until: 24:00,0;",
    ]
    if s["wallMm"]:
        L += [f"Material,PFBoard,MediumSmooth,{s['wallMm'] / 1000},0.019,40,1400,0.9,0.6,0.6;", "Construction,Wall,Stucco10,PFBoard,Concrete200,OldWallR;"]
    else:
        L += ["Construction,Wall,Concrete200,OldWallR;"]
    sill, head = 0.9, h - 0.6
    for f in range(n):
        z = f * h
        zn = f"Z{f + 1}"
        A = w * d
        L.append(f"Zone,{zn},0,0,0,{z},1,1,{h},{A * h:.1f},{A:.1f};")
        floor_bc = ("Slab", "Ground") if f == 0 else ("Interfloor", "Adiabatic")
        L.append(f"BuildingSurface:Detailed,{zn}_Floor,Floor,{floor_bc[0]},{zn},{floor_bc[1]},,NoSun,NoWind,0,4,0,0,0,0,{d},0,{w},{d},0,{w},0,0;")
        if f == n - 1:
            L.append(f"BuildingSurface:Detailed,{zn}_Roof,Roof,Roof,{zn},Outdoors,,SunExposed,WindExposed,0,4,0,0,{h},{w},0,{h},{w},{d},{h},0,{d},{h};")
        else:
            L.append(f"BuildingSurface:Detailed,{zn}_Ceil,Ceiling,Interfloor,{zn},Adiabatic,,NoSun,NoWind,0,4,0,0,{h},{w},0,{h},{w},{d},{h},0,{d},{h};")
        # 외벽: 바깥에서 볼 때 위왼쪽부터 반시계
        walls = {"S": ((0, 0), (w, 0)), "E": ((w, 0), (w, d)), "N": ((w, d), (0, d)), "W": ((0, d), (0, 0))}
        for o, ((x1, y1), (x2, y2)) in walls.items():
            L.append(f"BuildingSurface:Detailed,{zn}_W{o},Wall,Wall,{zn},Outdoors,,SunExposed,WindExposed,0.5,4,{x1},{y1},{h},{x1},{y1},0,{x2},{y2},0,{x2},{y2},{h};")
            length = abs(x2 - x1) + abs(y2 - y1)
            wh = head - sill
            ww = length * h * b["wwr"][o] / wh
            f0 = (length - ww) / 2 / length
            f1 = f0 + ww / length
            xa, ya = x1 + (x2 - x1) * f0, y1 + (y2 - y1) * f0
            xb, yb = x1 + (x2 - x1) * f1, y1 + (y2 - y1) * f1
            L.append(f"FenestrationSurface:Detailed,{zn}_G{o},Window,Win,{zn}_W{o},,0.5,,1,4,{xa:.3f},{ya:.3f},{head},{xa:.3f},{ya:.3f},{sill},{xb:.3f},{yb:.3f},{sill},{xb:.3f},{yb:.3f},{head};")
        if s["shade"]:
            # 외부 차양: 5~9월, 창에 닿는 햇빛이 250 W/㎡ 를 넘으면 내린다 (해를 따라 움직이는 루버와 같은 역할)
            L.append(f"WindowShadingControl,{zn}_Shd,{zn},1,ExteriorShade,WinShade,OnIfHighSolarOnWindow,CoolSeason,250,Yes,No,,,,,,Group,{zn}_GS,{zn}_GE,{zn}_GW;")
        ppl = u["ppl"] * A
        L += [
            f"People,{zn}_Ppl,{zn},Occ,People,{ppl:.1f},,,0.3,,ActLvl;",
            f"Lights,{zn}_Lt,{zn},Light,Watts/Area,,{s['lpd']},,0,0.4,0.2;",
            f"ElectricEquipment,{zn}_Eq,{zn},Equip,Watts/Area,,{u['epd']},,0,0.3,0;",
            f"ZoneInfiltration:DesignFlowRate,{zn}_Inf,{zn},Always1,AirChanges/Hour,,,,0.5,1,0,0,0;",
            f"ThermostatSetpoint:DualSetpoint,{zn}_SP,HeatSP,CoolSP;",
            f"ZoneControl:Thermostat,{zn}_TC,{zn},HVACType,ThermostatSetpoint:DualSetpoint,{zn}_SP;",
            # 외기 도입은 재실에 비례 (재실 스케줄), 전열교환기는 현열 회수
            f"HVACTemplate:Zone:IdealLoadsAirSystem,{zn},,,50,13,0.0156,0.0077,NoLimit,,,NoLimit,,,,,None,0.7,60,None,30,"
            f"Flow/Person,{OA_PER_PERSON},,,,OccupancySchedule,NoEconomizer,{'Sensible' if s['erv'] else 'None'},{s['erv'] or 0.7},0.65;",
        ]
    if s["pvKw"]:
        kw = pv_kw(b)
        L += [
            f"Generator:PVWatts,PV,5,{kw * 1000:.0f},Standard,FixedRoofMounted,0.14,TiltAzimuth,15,180,,0.4;",
            f"ElectricLoadCenter:Generators,PV Gens,PV,Generator:PVWatts,{kw * 1000:.0f},,;",
            "ElectricLoadCenter:Inverter:PVWatts,PV Inverter,1.1,0.96;",
            "ElectricLoadCenter:Distribution,PV Dist,PV Gens,Baseload,0,,,DirectCurrentWithInverter,PV Inverter;",
            "Output:Meter,ElectricityProduced:Facility,Monthly;",
        ]
    L += [
        "Output:Meter,DistrictHeating:Facility,Monthly;",
        "Output:Meter,DistrictCooling:Facility,Monthly;",
        "Output:Meter,InteriorLights:Electricity,Monthly;",
        "Output:Meter,InteriorEquipment:Electricity,Monthly;",
        "OutputControl:Table:Style,Comma;",
    ]
    return "\n".join(L)


def pv_kw(b):
    modules = int(b["w"] * b["d"] * 0.45 / MODULE["area"])
    return modules * MODULE["w"] / 1000


def state(key, k):
    s = {**BASE, **BASE_OVERRIDE[key]}
    for step in STEPS[key][:k]:
        s.update(CHANGE[step])
    return s


def run(key, k):
    name = f"{key}-{k}"
    path = os.path.join(WORK, f"{name}.idf")
    open(path, "w").write(idf(key, state(key, k)))
    out = os.path.join(WORK, f"out_{name}")
    os.makedirs(out, exist_ok=True)
    subprocess.run([EPLUS, "-x", "-r", "-w", EPW, "-d", out, path], check=True, capture_output=True, cwd=out)
    rows = list(csv.reader(open(os.path.join(out, "eplusmtr.csv"))))
    head = rows[0]

    def monthly(key_):
        i = next((j for j, h in enumerate(head) if key_ in h), None)
        return [float(r[i]) / 3.6e6 if i is not None else 0.0 for r in rows[1:13]]

    return (key, k), {m: monthly(col) for m, col in (("heat", "DistrictHeating"), ("cool", "DistrictCooling"), ("light", "InteriorLights"), ("equip", "InteriorEquipment"), ("pv", "ElectricityProduced"))}


def summarize(key, k, r):
    """부하 → 연료 · 전기 → 1차 에너지 · 탄소"""
    s = state(key, k)
    y = {m: sum(v) for m, v in r.items()}
    heat_in = y["heat"] / s["heatEff"]
    cool_e = y["cool"] / s["coolCop"]
    gas = 0 if s["heatElec"] else heat_in
    elec = (heat_in if s["heatElec"] else 0) + cool_e + y["light"] + y["equip"]
    net = elec - y["pv"]
    area = BUILDINGS[key]["w"] * BUILDINGS[key]["d"] * BUILDINGS[key]["floors"]
    primary = gas * PRIMARY["gas"] + net * PRIMARY["elec"]
    co2 = gas * CO2["gas"] + net * CO2["elec"]
    return {
        "use": {"heating": round(heat_in), "cooling": round(cool_e), "lighting": round(y["light"]), "equipment": round(y["equip"]), "pv": round(y["pv"])},
        "gas": round(gas),
        "elec": round(net),
        "primary": round(primary),
        "primaryPerM2": round(primary / area, 1),
        "co2": round(co2 / 1000, 2),
    }


jobs = [(key, k) for key in BUILDINGS for k in range(len(STEPS[key]) + 1)]
with ThreadPoolExecutor(max_workers=6) as ex:
    results = dict(ex.map(lambda j: run(*j), jobs))

out = {
    "weather": os.path.basename(EPW).replace(".epw", ""),
    "factors": {"primary": PRIMARY, "co2": CO2},
    "buildings": {},
}
for key, b in BUILDINGS.items():
    runs = [summarize(key, k, results[(key, k)]) for k in range(len(STEPS[key]) + 1)]
    base = runs[0]["primary"]
    out["buildings"][key] = {
        "floors": b["floors"],
        "area": b["w"] * b["d"] * b["floors"],
        "steps": STEPS[key],
        "pvKw": round(pv_kw(b), 1) if "pv" in STEPS[key] else None,
        "runs": runs,
        # 단계까지 누적 절감률 (1차 에너지)
        "saving": [round((base - r["primary"]) / base * 100, 1) for r in runs],
    }
    print(key, [r["primary"] for r in runs], out["buildings"][key]["saving"], "CO2", [r["co2"] for r in runs])

json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print("→", OUT)
