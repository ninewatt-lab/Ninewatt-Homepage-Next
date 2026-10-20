"""v1 모델 외피 면적(env.json)으로 층별 2존 EnergyPlus(9.0) 간이 모델을 만든다.

case before: 리모델링 전 (노후 외피 가정값)
case after : 도면 공사 내용만 반영 — 외벽 외단열 PF보드 100 mm, 창호 로이 복층유리
지붕·바닥·침기·재실·설비 가정은 두 경우가 같다. 방위: 도면 위쪽 = 북 (진북 미확정).

    python3 scripts/lab/energy_idf.py <env.json> before|after <out.idf> <weather.epw> [태양광 W]
    energyplus -x -r -w <weather.epw> -d <out_dir> <out.idf>   # EnergyPlus 9.0
"""
import json
import sys

env = json.load(open(sys.argv[1]))
case = sys.argv[2]
out = sys.argv[3]
epw = sys.argv[4]
# 선택: 태양광(PVWatts) 직류 용량 W. 도면에 없는 추가 제안이라 기본은 없음.
# 모델의 남측 지붕면(14.5 ㎡, 경사 30.7°)에 430 W 모듈 4장(세로)이 들어간다 → 1720
pv_w = float(sys.argv[5]) if len(sys.argv) > 5 else 0

# 도면상 실내 문(외기에 면하지 않음)인데 광선이 계단실 창으로 빠져 외부로 잡힌 것
INTERNAL = {"F1_StairSouth_0", "F1_LobbyInner_0", "F2_StairSouth_0", "F2_MasterSouthInternal_0"}

AREA = {"F1": 64.7, "F2": 46.73 + 8.38}  # 실내 바닥 면적. 2층 계단실은 1층 계단실 면적으로 가정
CEIL = 2.74
H = 3.3
ROOF_F1 = round(AREA["F1"] - AREA["F2"], 2)  # 2층 베란다 아래 1층 천장 (외기 노출로 단순화)

win = {}
for o in env["openings"]:
    if not o["ext"] or o["id"] in INTERNAL:
        continue
    k = (o["floor"], o["ext"])
    win[k] = win.get(k, 0) + o["area"]

U = {
    "before": {"wall": 1.0, "win": 4.0, "shgc": 0.70},
    "after": {"wall": None, "win": 1.8, "shgc": 0.45},
}[case]

# 지면 온도: EPW 머리말의 0.5 m 깊이 월별 값
gt = None
for line in open(epw, encoding="latin-1"):
    if line.startswith("GROUND TEMPERATURES"):
        f = line.strip().split(",")
        gt = [float(x) for x in f[6:18]]
        break
    if line[0].isdigit():
        break
gt = gt or [8, 6, 6, 8, 12, 16, 19, 21, 21, 18, 14, 10]

L = []
a = L.append
a(f"""Version,9.0;
Timestep,6;
Building,Clinic,0,Suburbs,0.04,0.4,MinimalShadowing,25,6;
GlobalGeometryRules,UpperLeftCorner,Counterclockwise,Relative;
SimulationControl,No,No,No,No,Yes;
RunPeriod,Year,1,1,,12,31,,,Yes,No,No,Yes,Yes;
Site:GroundTemperature:BuildingSurface,{",".join(f"{t:.1f}" for t in gt)};
ScheduleTypeLimits,Any,,,Continuous;
ScheduleTypeLimits,Frac,0,1,Continuous;
Schedule:Constant,Always1,Frac,1;
Schedule:Constant,ActLvl,Any,120;
Schedule:Constant,HVACType,Any,4;
Schedule:Compact,ClinicOcc,Frac,Through: 12/31,For: Weekdays,Until: 09:00,0,Until: 18:00,1,Until: 24:00,0,For: AllOtherDays,Until: 24:00,0;
Schedule:Compact,HomeOcc,Frac,Through: 12/31,For: Weekdays,Until: 07:00,1,Until: 09:00,0.5,Until: 18:00,0.2,Until: 24:00,1,For: AllOtherDays,Until: 24:00,1;
Schedule:Compact,ClinicHeat,Any,Through: 12/31,For: Weekdays,Until: 08:00,12,Until: 18:00,20,Until: 24:00,12,For: AllOtherDays,Until: 24:00,12;
Schedule:Compact,ClinicCool,Any,Through: 12/31,For: Weekdays,Until: 08:00,32,Until: 18:00,26,Until: 24:00,32,For: AllOtherDays,Until: 24:00,32;
Schedule:Constant,HomeHeat,Any,20;
Schedule:Constant,HomeCool,Any,26;
Material,Concrete200,MediumRough,0.2,1.6,2300,880,0.9,0.7,0.7;
Material,PFBoard100,MediumSmooth,0.1,0.019,40,1400,0.9,0.6,0.6;
Material,Stucco10,Smooth,0.01,0.7,1800,840,0.9,0.5,0.5;
""")
# 노후 외벽: 콘크리트 200 + 저항층 → U(표면저항 포함) ≈ 1.0
r_old = 1 / 1.0 - 0.17 - 0.2 / 1.6
a(f"Material:NoMass,OldWallR,Rough,{r_old:.3f},0.9,0.7,0.7;")
a("Construction,OldWall,Concrete200,OldWallR;")
a("Construction,NewWall,Stucco10,PFBoard100,Concrete200,OldWallR;")
# 지붕 U≈0.5, 지면 바닥 U≈0.6 (두 경우 동일)
a(f"Material:NoMass,RoofR,Rough,{1/0.5-0.14-0.125:.3f},0.9,0.7,0.7;")
a("Construction,Roof,RoofR,Concrete200;")
a(f"Material:NoMass,FloorR,Rough,{1/0.6-0.17-0.125:.3f},0.9,0.7,0.7;")
a("Construction,Slab,FloorR,Concrete200;")
a("Construction,Interfloor,Concrete200;")
a(f"WindowMaterial:SimpleGlazingSystem,Glz,{U['win']},{U['shgc']},{0.7 if case=='before' else 0.6};")
a("Construction,Win,Glz;")
wall_c = "OldWall" if case == "before" else "NewWall"

for fl, z0 in (("F1", 0.0), ("F2", H)):
    zn = f"Z{fl}"
    A = AREA[fl]
    side = A ** 0.5
    a(f"Zone,{zn},0,0,0,{z0},1,1,{CEIL},{A*CEIL:.2f},{A:.2f};")
    # 바닥·천장
    if fl == "F1":
        a(f"BuildingSurface:Detailed,{zn}_Floor,Floor,Slab,{zn},Ground,,NoSun,NoWind,0,4,{side},0,0,0,0,0,0,{side},0,{side},{side},0;")
        a(f"BuildingSurface:Detailed,{zn}_Ceil,Ceiling,Interfloor,{zn},Adiabatic,,NoSun,NoWind,0,4,0,0,{CEIL},{side},0,{CEIL},{side},{side},{CEIL},0,{side},{CEIL};")
        s2 = ROOF_F1 ** 0.5
        a(f"BuildingSurface:Detailed,{zn}_Roof,Roof,Roof,{zn},Outdoors,,SunExposed,WindExposed,0,4,0,0,{CEIL},{s2},0,{CEIL},{s2},{s2},{CEIL},0,{s2},{CEIL};")
    else:
        a(f"BuildingSurface:Detailed,{zn}_Floor,Floor,Interfloor,{zn},Adiabatic,,NoSun,NoWind,0,4,{side},0,0,0,0,0,0,{side},0,{side},{side},0;")
        a(f"BuildingSurface:Detailed,{zn}_Roof,Roof,Roof,{zn},Outdoors,,SunExposed,WindExposed,0,4,0,0,{CEIL},{side},0,{CEIL},{side},{side},{CEIL},0,{side},{CEIL};")
    # 방위별 외벽 (면적이 맞도록 폭을 정한 직사각형)
    for o in "NESW":
        net = env["walls"][f"{fl}_{o}"]
        w = win.get((fl, o), 0)
        gross = net + w
        wd = gross / H
        # (x1,y1)->(x2,y2): 바깥에서 볼 때 반시계 = 위왼쪽부터
        if o == "S":
            p1, p2 = (0, 0), (wd, 0)
        elif o == "E":
            p1, p2 = (side, 0), (side, wd)
        elif o == "N":
            p1, p2 = (side, side), (side - wd, side)
        else:
            p1, p2 = (0, side), (0, side - wd)
        (x1, y1), (x2, y2) = p1, p2
        a(f"BuildingSurface:Detailed,{zn}_W{o},Wall,{wall_c},{zn},Outdoors,,SunExposed,WindExposed,0.5,4,"
          f"{x1:.3f},{y1:.3f},{H},{x1:.3f},{y1:.3f},0,{x2:.3f},{y2:.3f},0,{x2:.3f},{y2:.3f},{H};")
        if w > 0:
            wh = 1.6
            ww = w / wh
            f0 = (wd - ww) / 2 / wd
            f1 = f0 + ww / wd
            xa, ya = x1 + (x2 - x1) * f0, y1 + (y2 - y1) * f0
            xb, yb = x1 + (x2 - x1) * f1, y1 + (y2 - y1) * f1
            a(f"FenestrationSurface:Detailed,{zn}_G{o},Window,Win,{zn}_W{o},,0.5,,1,4,"
              f"{xa:.3f},{ya:.3f},2.4,{xa:.3f},{ya:.3f},0.8,{xb:.3f},{yb:.3f},0.8,{xb:.3f},{yb:.3f},2.4;")
    occ = "ClinicOcc" if fl == "F1" else "HomeOcc"
    ppl = 0.1 * A if fl == "F1" else 2
    lpd, epd = (10, 8) if fl == "F1" else (5, 4)
    a(f"People,{zn}_Ppl,{zn},{occ},People,{ppl:.1f},,,0.3,,ActLvl;")
    a(f"Lights,{zn}_Lt,{zn},{occ},Watts/Area,,{lpd},,0,0.4,0.2;")
    a(f"ElectricEquipment,{zn}_Eq,{zn},{occ},Watts/Area,,{epd},,0,0.3,0;")
    # 침기: 두 경우 같게 둔다 (창호 교체의 기밀 개선은 반영하지 않음 = 보수적)
    a(f"ZoneInfiltration:DesignFlowRate,{zn}_Inf,{zn},Always1,AirChanges/Hour,,,,0.7,1,0,0,0;")
    hs, cs = ("ClinicHeat", "ClinicCool") if fl == "F1" else ("HomeHeat", "HomeCool")
    a(f"ThermostatSetpoint:DualSetpoint,{zn}_SP,{hs},{cs};")
    a(f"ZoneControl:Thermostat,{zn}_TC,{zn},HVACType,ThermostatSetpoint:DualSetpoint,{zn}_SP;")
    a(f"HVACTemplate:Zone:IdealLoadsAirSystem,{zn},;")

if pv_w:
    a(f"""Generator:PVWatts,PV,5,{pv_w:.0f},Standard,FixedRoofMounted,0.14,TiltAzimuth,30.7,180,,0.4;
ElectricLoadCenter:Generators,PV Gens,PV,Generator:PVWatts,{pv_w:.0f},,;
ElectricLoadCenter:Inverter:PVWatts,PV Inverter,1.1,0.96;
ElectricLoadCenter:Distribution,PV Dist,PV Gens,Baseload,0,,,DirectCurrentWithInverter,PV Inverter;
Output:Meter,ElectricityProduced:Facility,Monthly;""")

a("""Output:Meter,DistrictHeating:Facility,Monthly;
Output:Meter,DistrictCooling:Facility,Monthly;
Output:Variable,*,Zone Ideal Loads Supply Air Total Heating Energy,Monthly;
Output:Variable,*,Zone Ideal Loads Supply Air Total Cooling Energy,Monthly;
OutputControl:Table:Style,Comma;
Output:Table:SummaryReports,AllSummary;
""")
open(out, "w").write("\n".join(L))
print("wrote", out, {k: round(v, 2) for k, v in win.items()})
