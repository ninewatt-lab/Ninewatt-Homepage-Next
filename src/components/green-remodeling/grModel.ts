/**
 * 그린리모델링 솔루션 페이지 3D — 리모델링 종류별 예시 건물 4채의 배치 · 시공 순서 · 시간.
 *
 * 절감 수치는 scripts/green-remodeling/energy.py 가 EnergyPlus 로 계산한 src/data/green-remodeling.json 에서 온다.
 * 건물 크기 · 층 수도 그 계산과 같다 (1 unit = 10 m, 홈 히어로와 같은 축척이라 나무 · 사람 · 설비 모델을 그대로 쓴다).
 */

import { createContext, useContext, type RefObject } from "react";
import * as THREE from "three";
import { PV_PEAK_KW, daylight } from "@/components/hero/heroSim";
import { GR_ENERGY, type GrKey } from "./grData";

export { GR_ENERGY, GR_FACTORS, GR_ORDER, type GrEnergy, type GrKey } from "./grData";

/** 건물 배치 — x 동쪽 · z 남쪽(카메라 쪽). 키 큰 업무 빌딩 · 넓은 도서관을 뒤에 둔다 */
export type GrSpec = { key: GrKey; x: number; z: number; w: number; d: number; floors: number; fh: number; bay: number };
const spec = (key: GrKey, x: number, z: number, bay: number): GrSpec => {
  const e = GR_ENERGY[key];
  // energy.py 의 건물 크기(m)와 같게: 연면적 = 가로 × 세로 × 층
  const size: Record<GrKey, [number, number, number]> = { envelope: [18, 12, 3.3], systems: [22, 14, 3.6], roof: [32, 20, 4.2], operations: [26, 18, 3.6] };
  const [w, d, fh] = size[key];
  return { key, x, z, w: w / 10, d: d / 10, floors: e.floors, fh: fh / 10, bay };
};
export const GR_SPECS: Record<GrKey, GrSpec> = {
  envelope: spec("envelope", -2.15, 2.1, 0.3),
  systems: spec("systems", 2.2, 2.15, 0.34),
  roof: spec("roof", 2.2, -1.9, 0.4),
  operations: spec("operations", -2.15, -1.95, 0.32),
};
/** 대지 — 홈 히어로 무대를 감싸는 길(±4.6) 안쪽 */
export const PLATE = { w: 8.4, d: 8.4 };

export const specHeight = (s: GrSpec) => s.floors * s.fh;

/* ── 시공 순서 ────────────────────────────────────────────────────── */

/** 시공 한 번의 길이(초) · 진단 · 마무리 구간 (단계는 그 사이에 고르게) */
export const REMODEL_SECONDS = 15;
const SCAN_END = 0.12;
const COOL_START = 0.92;

export type Phase = { scan: number; steps: number[]; cool: number };

export function phaseAt(key: GrKey, t: number): Phase {
  const n = GR_ENERGY[key].steps.length;
  const span = (COOL_START - SCAN_END) / n;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    scan: clamp(t / SCAN_END),
    steps: Array.from({ length: n }, (_, i) => clamp((t - SCAN_END - i * span) / span)),
    cool: clamp((t - COOL_START) / (1 - COOL_START)),
  };
}

/** 지금까지 진행된 만큼의 누적 절감률(%) · 1차 에너지(kWh) · 탄소(t) — 단계 안에서는 진행만큼 이어 준다 */
export function savingAt(key: GrKey, t: number) {
  const e = GR_ENERGY[key];
  const steps = phaseAt(key, t).steps;
  let i = 0;
  while (i < steps.length && steps[i] >= 1) i++;
  const frac = i < steps.length ? steps[i] : 0;
  const lerp = (a: number, b: number) => a + (b - a) * frac;
  const cur = e.runs[i];
  const next = e.runs[Math.min(i + 1, e.runs.length - 1)];
  return {
    pct: lerp(e.saving[i], e.saving[Math.min(i + 1, e.saving.length - 1)]),
    primary: lerp(cur.primary, next.primary),
    co2: lerp(cur.co2, next.co2),
  };
}

/** 단계 진행(0~1) 중 order(0~1) 번째 부품의 진행 — 부품마다 단계의 30% 동안 움직인다 (홈 히어로와 같은 리듬) */
export const piece = (phase: number, order: number) => Math.min(1, Math.max(0, (phase - order * 0.7) / 0.3));
export const easeOut = (p: number) => 1 - (1 - p) ** 3;
export const ease = (t: number) => t * t * (3 - 2 * t);

/* ── 시간 · 상태 ──────────────────────────────────────────────────── */

const DAY_SECONDS = 48;
const START_HOUR = 10;
const STATIC_HOUR = 14;
const DAY_PACE = 1.3;
const NIGHT_PACE = 0.75;

/** 홈 히어로의 하늘 · 빛 · 빛 번짐이 읽는 값(hour · sunAlt · dark · solarKw)을 같은 이름으로 둔다 */
export type GrSim = {
  /** 홈 히어로 주변 도시(HeroCity)가 읽는 등장 연출 값 — 이 페이지는 처음부터 다 지어져 있다 */
  intro: number;
  hour: number;
  elapsed: number;
  sunAlt: number;
  dark: number;
  solarKw: number;
  /** 건물마다 시공 진행 0 → 1 */
  progress: Record<GrKey, number>;
  /** 지금 시공 중인 건물 */
  running: GrKey | null;
};

export function createGrSim(frozen: boolean): GrSim {
  const sim: GrSim = {
    intro: 1,
    hour: START_HOUR,
    elapsed: frozen ? ((STATIC_HOUR - START_HOUR) / 24) * DAY_SECONDS : 0,
    sunAlt: 0,
    dark: 0,
    solarKw: 0,
    progress: { envelope: 0, systems: 0, roof: 0, operations: 0 },
    running: null,
  };
  stepGrSim(sim, 0, frozen);
  return sim;
}

export function stepGrSim(sim: GrSim, delta: number, frozen: boolean) {
  const d = Math.min(delta, 0.1);
  // 시공 중에는 하루가 아주 느리게 흐른다 (시공 장면이 밤으로 넘어가지 않게)
  if (!frozen) sim.elapsed += d * THREE.MathUtils.lerp(DAY_PACE, NIGHT_PACE, sim.dark) * (sim.running ? 0.12 : 1);
  sim.hour = (START_HOUR + (sim.elapsed / DAY_SECONDS) * 24) % 24;
  sim.sunAlt = Math.sin(((sim.hour - 6) / 12) * Math.PI);
  const t = Math.min(1, Math.max(0, (sim.sunAlt + 0.12) / 0.4));
  sim.dark = 1 - t * t * (3 - 2 * t);
  sim.solarKw = PV_PEAK_KW * daylight(sim.hour);
  const k = sim.running;
  if (k) {
    sim.progress[k] = frozen ? 1 : Math.min(1, sim.progress[k] + d / REMODEL_SECONDS);
    if (sim.progress[k] >= 1) sim.running = null;
  }
}

export const GrSimContext = createContext<RefObject<GrSim> | null>(null);
export const useGrSim = () => useContext(GrSimContext)!;

/* ── 창 불빛 ──────────────────────────────────────────────────────── */

// 시각별 재실(0~1) — 낮엔 대부분 켜져 있고 밤이 깊을수록 하나씩 꺼진다 (Lab 트윈과 같은 곡선)
const OCCUPANCY: [number, number][] = [[0, 0.06], [6, 0.06], [8, 0.6], [12, 0.9], [18, 0.85], [20, 0.4], [22, 0.15], [24, 0.06]];
export function occupancyAt(hour: number) {
  const i = OCCUPANCY.findIndex(([h]) => h > hour);
  const [h0, v0] = OCCUPANCY[i - 1];
  const [h1, v1] = OCCUPANCY[i];
  return v0 + ((hour - h0) / (h1 - h0)) * (v1 - v0);
}

/** 창마다 고정된 0~1 값 (켜지는 기준 · 색 섞기) */
export const hash01 = (i: number, seed = 0) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const LAMP_WARM = new THREE.Color("#ffd9a8");
/** 형광등 (설비 건물 시공 전) — 푸르고 조금 어둡다 */
export const LAMP_COOL = new THREE.Color("#b9d6f2");

/* ── 열화상 색 (홈 히어로와 같은 철 무지개) ───────────────────────── */

export const THERMAL_STOPS = ["#0d1450", "#661a8c", "#db333d", "#f78c1f", "#fff2a6"];
