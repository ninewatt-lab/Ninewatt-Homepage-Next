/**
 * Lab v2 트윈이 보여 주는 건물들 — 데이터 경로 · 크기 · 통계 · 리모델링 계산 결과.
 *
 * A: v1 의 소규모 공공 보건시설(2층). 3D 모델은 도면 좌표를 대조해 만든 것(v1).
 * B: 소규모 공공 어린이집(1층). scripts/lab/auto_twin.py 가 도면에서 자동으로 만든 것 — 설정은 scripts/lab/buildings/building-b.json.
 * C: 소규모 공공 어린이집(3층). 같은 스크립트로, 층마다 다른 자리에 있는 평면을 기준선으로 맞춰 쌓은 것 — building-c.json.
 * 크기(frame)는 모델 좌표 m(x 동쪽 · y 북쪽)로, 장면의 카메라 · 무대 · 그림자 범위가 여기에 맞춰진다.
 */

import energyA from "@/data/lab/ai-building-workspace-energy.json";
import scenariosA from "@/data/lab/ai-building-workspace-scenarios.json";
import scenariosB from "@/data/lab/ai-building-workspace-b-scenarios.json";
import metaB from "@/data/lab/ai-building-workspace-b-meta.json";
import scenariosC from "@/data/lab/ai-building-workspace-c-scenarios.json";
import metaC from "@/data/lab/ai-building-workspace-c-meta.json";
import { DRAWN, WALL_OPTIONS, type Scenario, type TwinFloor, type WallMm } from "./twinModel";

export type BuildingKey = "a" | "b" | "c";
export type ScenarioRun = { heat: number; cool: number; heat_m: number[]; cool_m: number[] };

export type TwinBuilding = {
  key: BuildingKey;
  /** 도면에서 자동으로 만든 모델인지 */
  auto: boolean;
  data: { plan: string; viewer: string; hourly: string };
  /** levels: 층마다 바닥 높이(m) */
  frame: { cx: number; cy: number; w: number; d: number; height: number; floors: TwinFloor[]; levels: number[] };
  stats: { layers: number; wallArea: number; windows: number; windowArea: number; floorArea: number };
  /** EnergyPlus 조합별 결과 (w0-old = 리모델링 전) */
  runs: Record<string, ScenarioRun>;
  /** 남쪽 지붕면 태양광 (모듈을 3D 지붕에 놓은 건물만) */
  pv: { moduleW: number; modules: number; runs: Record<string, { annual: number; monthly: number[] }> } | null;
  /** 조합 표의 재료가 도면 사양과 같으면 그 조합. 다르면 null (예시 조합으로 시작) */
  drawn: Scenario | null;
  start: Scenario;
  /** 고를 수 있는 외단열 두께 (계산한 조합) */
  walls: WallMm[];
};

const ABW = "/lab/ai-building-workspace";
const ABW2 = "/lab/ai-building-workspace-v2";
const [, , bx1, by1] = metaB.floors[0].footprint;
// 건물 C 의 크기: 층마다 외곽이 조금씩 달라 모든 층을 합친 범위
const cBox = metaC.floors.reduce((a, f) => [Math.min(a[0], f.footprint[0]), Math.min(a[1], f.footprint[1]), Math.max(a[2], f.footprint[2]), Math.max(a[3], f.footprint[3])], [Infinity, Infinity, -Infinity, -Infinity]);

export const BUILDINGS: Record<BuildingKey, TwinBuilding> = {
  a: {
    key: "a",
    auto: false,
    data: { plan: `${ABW2}/twin.json`, viewer: `${ABW}/viewer/viewer.json`, hourly: `${ABW2}/hourly.json` },
    // 1층 외곽 −0.17 ~ 10.68 × −0.17 ~ 9.98 m, 용마루 7.39 m
    frame: { cx: 5.255, cy: 4.905, w: 10.85, d: 10.15, height: 7.39, floors: ["1f", "2f"], levels: [0, 3.3] },
    stats: { layers: 38, wallArea: energyA.envelope.wallArea, windows: energyA.envelope.windows, windowArea: energyA.envelope.windowArea, floorArea: energyA.envelope.floorArea },
    runs: scenariosA.scenarios as Record<string, ScenarioRun>,
    pv: { moduleW: energyA.pv.moduleW, modules: energyA.pv.modules, runs: scenariosA.pv as Record<string, { annual: number; monthly: number[] }> },
    drawn: DRAWN,
    start: DRAWN,
    walls: WALL_OPTIONS,
  },
  b: {
    key: "b",
    auto: true,
    data: { plan: `${ABW2}/b/twin.json`, viewer: `${ABW2}/b/viewer.json`, hourly: `${ABW2}/b/hourly.json` },
    frame: { cx: bx1 / 2, cy: by1 / 2, w: bx1, d: by1, height: metaB.height, floors: ["1f"], levels: [0] },
    stats: { layers: metaB.layers, wallArea: metaB.wallArea, windows: metaB.windows, windowArea: metaB.windowArea, floorArea: metaB.floorArea },
    runs: scenariosB.scenarios as Record<string, ScenarioRun>,
    pv: null,
    // 도면 주석의 사양(우레탄폼보드 100 mm · 로이 복층유리)은 조합 표의 재료와 달라 예시 조합으로 시작한다
    drawn: null,
    start: { wall: 100, win: "lowe", pv: 0 },
    walls: WALL_OPTIONS,
  },
  c: {
    key: "c",
    auto: true,
    data: { plan: `${ABW2}/c/twin.json`, viewer: `${ABW2}/c/viewer.json`, hourly: `${ABW2}/c/hourly.json` },
    frame: {
      cx: (cBox[0] + cBox[2]) / 2,
      cy: (cBox[1] + cBox[3]) / 2,
      w: cBox[2] - cBox[0],
      d: cBox[3] - cBox[1],
      height: metaC.height,
      floors: ["1f", "2f", "3f"],
      levels: metaC.floors.map((f) => f.z),
    },
    stats: { layers: metaC.layers, wallArea: metaC.wallArea, windows: metaC.windows, windowArea: metaC.windowArea, floorArea: metaC.floorArea },
    runs: scenariosC.scenarios as Record<string, ScenarioRun>,
    pv: null,
    // 도면 사양: 외단열 PF보드 80 mm · 24 mm 로이 복층유리 → 조합 표에 80 mm 를 더해 계산했다
    drawn: { wall: 80, win: "lowe", pv: 0 },
    start: { wall: 80, win: "lowe", pv: 0 },
    walls: [0, 50, 80, 100, 150],
  },
};

/** 장면 크기 기준 — 건물 A(가장 긴 변 10.85 m)를 1 로 두고 카메라 · 무대를 늘린다 */
export const frameScale = (b: TwinBuilding) => Math.max(b.frame.w, b.frame.d) / 10.85;
