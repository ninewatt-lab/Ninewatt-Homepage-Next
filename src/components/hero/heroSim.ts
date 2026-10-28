/**
 * 홈 히어로 3D 의 모델 건물과 에너지 시뮬레이션.
 *
 * 화면에 나오는 수치(kW · % · COP)는 모두 여기 상수에서 계산된다. 실측이 아닌 시뮬레이션이며,
 * 근거는 home.json 의 hero.sim.items 에 사용자용 문장으로 같이 적어 둔다 — 상수를 바꾸면 그 문장도 맞춘다.
 */

import { createContext, useContext, type RefObject } from "react";

/* ── 모델 건물 (1 unit = 10 m) ───────────────────────────────────── */

export const FLOORS = 12;
export const SETBACK_FLOOR = 9; // 10층부터 고층부
export const FLOOR_H = 0.42; // 층고 4.2 m
export const BUILDING_H = FLOORS * FLOOR_H;
const PLATE_LOW: [number, number] = [3.4, 2.4]; // 기준층 34 × 24 m
const PLATE_HIGH: [number, number] = [2.3, 1.7]; // 고층부 23 × 17 m

export function footprint(floor: number): [number, number] {
  return floor >= SETBACK_FLOOR ? PLATE_HIGH : PLATE_LOW;
}

/** 연면적(㎡) ≈ 8,517 */
export const GFA_M2 = Array.from({ length: FLOORS }, (_, i) => footprint(i)[0] * footprint(i)[1] * 100).reduce((a, b) => a + b, 0);

/* ── 근거 수치 ────────────────────────────────────────────────────── */

/** 국토교통부 2024 건물에너지 통계 — 업무시설(사무소) 중부 지역 원단위 중앙값 */
export const EUI_KWH_M2 = 159;

/** 업무용 건물 평일 시간대별 부하 (하루 최대 대비, 0~23시) */
export const LOAD_PROFILE = [
  0.18, 0.16, 0.15, 0.15, 0.16, 0.2, 0.3, 0.48, 0.72, 0.88, 0.94, 0.96,
  0.82, 0.92, 0.98, 1, 0.96, 0.86, 0.66, 0.48, 0.36, 0.28, 0.22, 0.2,
];
const PROFILE_MEAN = LOAD_PROFILE.reduce((a, b) => a + b, 0) / 24;

/** 연간 사용량을 위 패턴으로 나눈 최대 부하 ≈ 285 kW */
export const PEAK_KW = (EUI_KWH_M2 * GFA_M2) / 8760 / PROFILE_MEAN;

/** 옥상 태양광 설비용량 · 국내 일평균 발전시간 */
export const PV_KWP = 40;
export const PV_HOURS = 3.5;
/** 하루 발전량이 kWp × 발전시간이 되는 06~18시 반사인 곡선의 꼭짓점 ≈ 18 kW */
export const PV_PEAK_KW = (PV_KWP * PV_HOURS) / ((12 * 2) / Math.PI);

/** ESS — 출력 · 용량 · 왕복효율(NREL ATB 대표값) */
export const ESS_KW = 100;
export const ESS_KWH = 250;
export const ESS_RTE = 0.85;
const ESS_CHARGE_KW = 30;
const ESS_EVENING_KW = 30;
/** 피크저감 ESS 수요요금 절감 15~30% 의 하한 — 최대수요를 15% 낮춘다 */
export const PEAK_CUT = 0.15;

/** 공기열원 히트펌프 COP (KS 시험 성능 사례) · 냉난방 전력 비중(가정) */
export const HP_COP = 3.2;
export const HVAC_SHARE = 0.3;

/** Opti 에너지 비용 절감 효과 (제품 소개 수치) */
export const AI_SAVING = 0.12;

/* ── BEMS 경보 장면 ───────────────────────────────────────────────── */
// 실제 BEMS 기능(기준값 이탈 시 경보, AI 가 원인과 확인할 일을 설명)을 보여 주는 예시 시나리오.
// 하루에 두 번: 낮 피크 갱신 임박 · 밤 특정 층 대기전력 증가. 각 단계는 경보 → AI 분석 → 조치 완료.

export type BemsKind = "peak" | "night";
export type BemsStage = "alert" | "ai" | "resolved";
export type BemsEvent = { kind: BemsKind; stage: BemsStage; p: number };

/** 야간 대기전력이 늘어나는 층 (0부터, 4 = 5층) */
export const BEMS_FLOOR = 4;
/** 야간 대기전력 증가 비율 (평소 대비) */
export const NIGHT_EXTRA = 0.45;
const NIGHT_ANOMALY_FROM = 21.3; // 이때부터 대기전력이 늘고, 경보를 거쳐 조치될 때까지 이어진다

const STAGES: BemsStage[] = ["alert", "ai", "resolved"];
const BEMS_EVENTS: { kind: BemsKind; start: number; hours: [number, number, number] }[] = [
  { kind: "peak", start: 13.6, hours: [0.5, 0.8, 0.4] },
  { kind: "night", start: 21.8, hours: [0.5, 0.8, 0.4] },
];
/** 경보 장면 동안 시간이 흐르는 속도 — 메시지를 읽을 수 있게 */
const BEMS_SLOW = 0.3;

export function bemsEventAt(hour: number): BemsEvent | null {
  for (const e of BEMS_EVENTS) {
    let t = hour - e.start;
    if (t < 0) continue;
    for (let i = 0; i < 3; i++) {
      if (t < e.hours[i]) return { kind: e.kind, stage: STAGES[i], p: t / e.hours[i] };
      t -= e.hours[i];
    }
  }
  return null;
}

const NIGHT_EVENT = BEMS_EVENTS[1];
/** 야간 대기전력이 실제로 늘어 있는 시간 (경보 · AI 분석이 끝나 조치될 때까지) */
function nightAnomaly(hour: number) {
  return hour >= NIGHT_ANOMALY_FROM && hour < NIGHT_EVENT.start + NIGHT_EVENT.hours[0] + NIGHT_EVENT.hours[1];
}

/** 층 하나의 사용량(0~1)을 kW 로 — 층별 칩 · 패널 표시용 */
export const floorKw = (load: number) => load * (PEAK_KW / FLOORS) * 1.3;

/* ── 시간 ─────────────────────────────────────────────────────────── */

export const DAY_SECONDS = 40; // 하루 24시간을 한 바퀴
export const START_HOUR = 6;
const STATIC_HOUR = 14; // 움직임 줄이기 설정에서 보여줄 시각
export const INTRO_SECONDS = 3.8; // 도면 → 층 → 설비 순으로 지어지는 연출
export const SCAN_PERIOD = 9; // AI 스캔 주기(초)
export const SCAN_DURATION = 3.2;
const AI_WINDOW = 4.5; // 스캔이 끝난 뒤 AI 최적화가 보이는 시간(초)

/* ── 계산 ─────────────────────────────────────────────────────────── */

export function loadAt(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const i = Math.floor(h);
  const s = (1 - Math.cos((h - i) * Math.PI)) / 2;
  return LOAD_PROFILE[i] + (LOAD_PROFILE[(i + 1) % 24] - LOAD_PROFILE[i]) * s;
}

/** 06시 해 뜸 ~ 18시 해 짐 */
export function daylight(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  return h < 6 || h > 18 ? 0 : Math.sin(((h - 6) / 12) * Math.PI);
}

export function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 실제 계측값처럼 미세하게 흔들린다 (평균은 0 이라 근거 수치는 그대로)
function jitter(t: number, seed: number) {
  return Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 4.3 + seed * 2.1) * 0.3 + Math.sin(t * 9.1 + seed * 3.7) * 0.2;
}

/** 0 → 1 로 부드럽게. intro 의 [start, start + duration] 구간 */
export function reveal(intro: number, start: number, duration: number) {
  const t = Math.min(1, Math.max(0, (intro - start) / duration));
  return t * t * (3 - 2 * t);
}

// 층마다 성격이 다르다: 로비 · 일반 사무 · 서버실(24시간)
const rand = seeded(21);
const FLOOR_PROFILES = Array.from({ length: FLOORS }, (_, i) => ({
  factor: i === 0 ? 0.5 : i === 6 ? 0.9 : 0.6 + rand() * 0.45,
  lag: (rand() - 0.5) * 1.4,
  base: i === 6 ? 0.55 : 0,
}));

export type Sim = {
  /** 등장 연출 0 → 1 */
  intro: number;
  elapsed: number;
  hour: number;
  solarKw: number;
  loadKw: number;
  /** AI 최적화로 줄인 부하 */
  aiKw: number;
  gridKw: number;
  /** 층별 사용량 0~1 (화면 표현용) */
  floorLoads: number[];
  /** 스캔 직후 AI 최적화 강도 0~1 */
  ai: number;
  scanY: number;
  essSoc: number;
  /** + 방전 · − 충전 */
  essKw: number;
  hpKw: number;
  /** 해 고도 -1~1 (밤은 음수) */
  sunAlt: number;
  /** 어두운 정도 0(낮) ~ 1(밤) — 하늘 · 창 조명 · 가로등 */
  dark: number;
  /** 진행 중인 BEMS 경보 장면 */
  bems: BemsEvent | null;
  /** 야간 대기전력 증가 중인지 · 그 층의 평소 사용량(0~1) */
  nightAnomaly: boolean;
  nightBaseLoad: number;
};

export function createSim(frozen: boolean): Sim {
  const sim: Sim = {
    intro: frozen ? 1 : 0,
    elapsed: frozen ? ((STATIC_HOUR - START_HOUR) / 24) * DAY_SECONDS : 0,
    hour: START_HOUR,
    solarKw: 0,
    loadKw: 0,
    aiKw: 0,
    gridKw: 0,
    floorLoads: new Array(FLOORS).fill(0),
    ai: 0,
    scanY: -10,
    essSoc: frozen ? 0.62 : 0.8,
    essKw: 0,
    hpKw: 0,
    sunAlt: 0,
    dark: 1,
    bems: null,
    nightAnomaly: false,
    nightBaseLoad: 0,
  };
  stepSim(sim, 0, frozen);
  return sim;
}

export function stepSim(sim: Sim, delta: number, frozen: boolean) {
  if (sim.intro < 1) {
    sim.intro = Math.min(1, sim.intro + delta / INTRO_SECONDS);
    delta = 0; // 건물이 다 지어진 뒤부터 시간이 흐른다
  }
  if (sim.bems) delta *= BEMS_SLOW;
  sim.elapsed += delta;
  sim.hour = (START_HOUR + (sim.elapsed / DAY_SECONDS) * 24) % 24;

  const phase = sim.elapsed % SCAN_PERIOD;
  const after = phase - SCAN_DURATION;
  sim.scanY = !frozen && sim.intro >= 1 && phase < SCAN_DURATION ? (phase / SCAN_DURATION) * (BUILDING_H + 0.3) : -10;
  sim.ai = frozen || sim.elapsed < SCAN_DURATION || after < 0 || after > AI_WINDOW ? 0 : Math.sin((after / AI_WINDOW) * Math.PI);
  // BEMS 경보 장면 동안에는 AI 스캔 · 절감 연출을 쉬어 화면이 겹치지 않게
  sim.bems = sim.intro >= 1 ? bemsEventAt(sim.hour) : null;
  if (sim.bems) {
    sim.scanY = -10;
    sim.ai = 0;
  }
  sim.nightAnomaly = nightAnomaly(sim.hour);

  for (let i = 0; i < FLOORS; i++) {
    const p = FLOOR_PROFILES[i];
    const wobble = Math.sin(sim.elapsed * 0.9 + i * 1.7) * 0.03;
    const raw = Math.min(1, Math.max(p.base, loadAt(sim.hour + p.lag) * p.factor + wobble));
    // AI 최적화: 부하가 높은 층일수록 더 많이 낮춘다
    sim.floorLoads[i] = raw * (1 - AI_SAVING * sim.ai * raw);
  }
  // 야간 대기전력 증가: 그 층만 평소보다 NIGHT_EXTRA 만큼 더 쓴다
  sim.nightBaseLoad = sim.floorLoads[BEMS_FLOOR];
  if (sim.nightAnomaly) sim.floorLoads[BEMS_FLOOR] *= 1 + NIGHT_EXTRA;

  // 태양광은 구름에 따라 ±4%, 부하는 ±1.2% 안팎으로 흔들린다
  sim.sunAlt = Math.sin(((sim.hour - 6) / 12) * Math.PI);
  // 해가 지평선 아래로 조금 내려간 뒤(박명)까지 서서히 어두워진다
  const t = Math.min(1, Math.max(0, (sim.sunAlt + 0.12) / 0.4));
  sim.dark = 1 - t * t * (3 - 2 * t);
  sim.solarKw = PV_PEAK_KW * daylight(sim.hour) * (1 + 0.04 * jitter(sim.elapsed, 1));
  const base = PEAK_KW * loadAt(sim.hour);
  sim.aiKw = base * AI_SAVING * sim.ai;
  sim.loadKw = (base - sim.aiKw) * (1 + 0.012 * jitter(sim.elapsed, 2)) + (sim.nightAnomaly ? floorKw(sim.nightBaseLoad) * NIGHT_EXTRA : 0);
  sim.hpKw = sim.loadKw * HVAC_SHARE * (1 + 0.02 * jitter(sim.elapsed, 3));

  // ESS: 경부하(22~08시) 충전 → 낮에는 최대수요를 PEAK_CUT 만큼 낮추도록 방전 → 최대부하(18~21시)에 남은 전력 방전
  const h = sim.hour;
  const target = PEAK_KW * (1 - PEAK_CUT);
  let ess = 0;
  if (h >= 22 || h < 8) {
    if (sim.essSoc < 0.95) ess = -ESS_CHARGE_KW;
  } else {
    const excess = sim.loadKw - sim.solarKw - target;
    if (excess > 0) ess = Math.min(ESS_KW, excess);
    else if (h >= 18 && h < 21 && sim.essSoc > 0.25) ess = ESS_EVENING_KW;
    if (sim.essSoc <= 0.1) ess = 0;
  }
  const dtHours = (delta / DAY_SECONDS) * 24;
  const eff = Math.sqrt(ESS_RTE);
  sim.essSoc += ess < 0 ? (-ess * dtHours * eff) / ESS_KWH : (-ess * dtHours) / eff / ESS_KWH;
  sim.essSoc = Math.min(0.95, Math.max(0.1, sim.essSoc));
  sim.essKw = ess;
  sim.gridKw = sim.loadKw - sim.solarKw - ess;
}

/* ── 하루 곡선 (상세 패널 그래프용) ──────────────────────────────── */

export type DayPoint = {
  hour: number;
  loadKw: number;
  solarKw: number;
  gridKw: number;
  /** ESS 없이 전력망에서 받았을 전력 */
  gridNoEssKw: number;
  essKw: number;
  essSoc: number;
  hpKw: number;
  heatKw: number;
};

/** 평일 하루를 15분 간격으로. 흔들림 · AI 연출 없이 기준값만 쓰고, 이틀을 돌려 ESS 잔량이 안정된 둘째 날을 쓴다 */
export function simulateDay(stepHours = 0.25): DayPoint[] {
  const points: DayPoint[] = [];
  let soc = 0.6;
  const eff = Math.sqrt(ESS_RTE);
  const target = PEAK_KW * (1 - PEAK_CUT);
  for (let day = 0; day < 2; day++) {
    for (let h = 0; h < 24 - 1e-9; h += stepHours) {
      const load = PEAK_KW * loadAt(h);
      const solar = PV_PEAK_KW * daylight(h);
      let ess = 0;
      if (h >= 22 || h < 8) {
        if (soc < 0.95) ess = -ESS_CHARGE_KW;
      } else {
        const excess = load - solar - target;
        if (excess > 0) ess = Math.min(ESS_KW, excess);
        else if (h >= 18 && h < 21 && soc > 0.25) ess = ESS_EVENING_KW;
        if (soc <= 0.1) ess = 0;
      }
      soc += ess < 0 ? (-ess * stepHours * eff) / ESS_KWH : (-ess * stepHours) / eff / ESS_KWH;
      soc = Math.min(0.95, Math.max(0.1, soc));
      if (day === 1) {
        const hp = load * HVAC_SHARE;
        points.push({ hour: h, loadKw: load, solarKw: solar, gridKw: load - solar - ess, gridNoEssKw: load - solar, essKw: ess, essSoc: soc, hpKw: hp, heatKw: hp * HP_COP });
      }
    }
  }
  return points;
}

/* ── React ────────────────────────────────────────────────────────── */

export const SimContext = createContext<RefObject<Sim> | null>(null);
export const useSim = () => useContext(SimContext)!;
