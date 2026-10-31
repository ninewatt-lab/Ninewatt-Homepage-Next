/**
 * Lab v2 — 도면으로 지은 3D 트윈의 계산 부분 (React 없음).
 *
 * 좌표: glb(viewer/model.glb)는 이미 three 좌표(m, y 위)다. 도면 · 실 데이터는 모델 좌표(x 동쪽 · y 북쪽)라
 * three 로는 (x, 높이, -y) 로 옮긴다. 도면 위쪽을 북으로 본다(EnergyPlus 계산과 같은 가정).
 *
 * 모델 분류는 glb 노드 이름 · extras(floor, kind)로 한다 (scripts/lab/blender_web_export.py 가 붙인다).
 * 외벽 18면 · 바깥 창 23개는 EnergyPlus 계산(ai-building-workspace-energy.json)의 외벽 · 창호와 같은 범위다.
 */

import * as THREE from "three";
import { createSim, type Sim } from "@/components/hero/heroSim";

/* ── 시간표 ───────────────────────────────────────────────────────── */

export const BUILD_SECONDS = 12;
export const REMODEL_SECONDS = 18;
/** 하루 24시간을 도는 시간(초) — 낮은 빠르게, 밤은 느리게 (홈 히어로와 같은 속도감) */
export const DAY_SECONDS = 44;
const DAY_PACE = 1.3;
const NIGHT_PACE = 0.75;
export const START_HOUR = 9.5;
export const STATIC_HOUR = 14;

/** 구축 순서 (build 0~1) */
export const BUILD = {
  plan1: [0, 0.26],
  plan2: [0.06, 0.32],
  rise: [0.3, 0.86],
} as const;

/** 리모델링 순서 (remodel 0~1) */
export const REMODEL = {
  scan: [0, 0.1],
  insulation: [0.1, 0.45],
  windows: [0.45, 0.76],
  pv: [0.76, 0.9],
  cool: [0.92, 1],
} as const;
export type RemodelStep = "scan" | "insulation" | "windows" | "pv";
export const REMODEL_STEP_KEYS: RemodelStep[] = ["scan", "insulation", "windows", "pv"];

/** 벽 꼭대기(지붕 용마루) 높이 + 여유 — 구축 때 자르는 면이 올라가는 끝 */
export const TOP_Y = 7.6;
export const FLOOR_Y = { "1f": 0, "2f": 3.3 } as const;
/** 건물 가운데 (카메라가 바라보는 점) */
export const CENTER = new THREE.Vector3(5.25, 3, -4.9);

export const span = (t: number, [a, b]: readonly [number, number]) => Math.min(1, Math.max(0, (t - a) / (b - a)));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
/** 단계 진행(0~1) 중 order(0~1) 번째 부품의 진행 — 부품마다 단계의 35% 동안 움직인다 */
export const piece = (phase: number, order: number) => Math.min(1, Math.max(0, (phase - order * 0.65) / 0.35));

/* ── 리모델링 조합 (시나리오 비교) ───────────────────────────────── */
// 수치는 scripts/lab/energy_scenarios.py 가 조합마다 EnergyPlus 로 계산한 ai-building-workspace-scenarios.json

export type WinKind = "old" | "lowe" | "triple";
export type Scenario = { wall: 0 | 50 | 100 | 150; win: WinKind; pv: 0 | 2 | 4 };
/** 도면에 적힌 공사 (+ 태양광 제안 4장) */
export const DRAWN: Scenario = { wall: 100, win: "lowe", pv: 4 };
export const WALL_OPTIONS = [0, 50, 100, 150] as const;
export const WIN_OPTIONS: WinKind[] = ["old", "lowe", "triple"];
export const PV_OPTIONS = [0, 2, 4] as const;
/** 창호 열관류율 (energy_idf.py 의 WINDOWS 와 같다) */
export const WIN_U: Record<WinKind, number> = { old: 4.0, lowe: 1.8, triple: 1.0 };
/** 외벽 열관류율 — energy_idf.py 와 같은 계산: 노후 외벽(U 1.0) + PF보드(λ 0.019) + 스타코 10 mm(λ 0.7) */
export const wallU = (mm: number) => (mm ? 1 / (1 / 1.0 + 0.01 / 0.7 + mm / 1000 / 0.019) : 1.0);
export const scenarioKey = (s: Pick<Scenario, "wall" | "win">) => `w${s.wall}-${s.win}`;

/* ── 상태 ─────────────────────────────────────────────────────────── */

export type TwinMode = "build" | "rooms" | "remodel";
export type TwinFloor = "1f" | "2f";

/** 홈 히어로 Sim 을 그대로 써서 하늘 · 후처리(Sky, Effects)를 재사용한다. hour · sunAlt · dark 만 여기서 채운다 */
export type TwinSim = Sim & {
  build: number;
  buildRun: boolean;
  remodel: number;
  remodelRun: boolean;
  /** 해 방향 (three 좌표, 단위 벡터) */
  sun: THREE.Vector3;
};

export function createTwinSim(frozen: boolean): TwinSim {
  const sim = Object.assign(createSim(true), {
    build: frozen ? 1 : 0,
    buildRun: false,
    remodel: 0,
    remodelRun: false,
    sun: new THREE.Vector3(0, 1, 0),
  });
  sim.intro = 1;
  sim.hour = frozen ? STATIC_HOUR : START_HOUR;
  sim.bems = null;
  sim.scanY = -10;
  sunAt(sim, new Date());
  return sim;
}

/* ── 해 ───────────────────────────────────────────────────────────── */

/** 중부 지방 위도. 정확한 위치는 쓰지 않는다 (익명화) */
const LATITUDE = (37.5 * Math.PI) / 180;

function dayOfYear(date: Date) {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
}

/** 오늘 날짜 · sim.hour(태양시)의 해 고도 · 방위 → sim.sun, sunAlt, dark */
export function sunAt(sim: TwinSim, date: Date) {
  const decl = ((23.44 * Math.PI) / 180) * Math.sin((2 * Math.PI * (284 + dayOfYear(date))) / 365);
  const h = ((sim.hour - 12) * 15 * Math.PI) / 180;
  const sinAlt = Math.sin(LATITUDE) * Math.sin(decl) + Math.cos(LATITUDE) * Math.cos(decl) * Math.cos(h);
  const alt = Math.asin(sinAlt);
  // 남쪽에서 서쪽으로 잰 방위
  const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(LATITUDE) - Math.tan(decl) * Math.cos(LATITUDE));
  // 남 = +z, 동 = +x
  sim.sun.set(-Math.sin(az) * Math.cos(alt), sinAlt, Math.cos(az) * Math.cos(alt)).normalize();
  sim.sunAlt = sinAlt;
  const t = Math.min(1, Math.max(0, (sinAlt + 0.12) / 0.4));
  sim.dark = 1 - t * t * (3 - 2 * t);
  // 하늘 노을 · 조명 세기가 쓰는 값 (태양광 출력 대신 해 고도)
  sim.solarKw = Math.max(0, sinAlt);
}

/** 하루 시간 · 구축 · 리모델링을 한 걸음 진행. paused 는 하루 시간만 멈춘다 */
export function stepTwin(sim: TwinSim, delta: number, frozen: boolean, paused: boolean, date: Date) {
  const d = Math.min(delta, 0.1);
  if (!frozen && !paused) {
    const pace = THREE.MathUtils.lerp(DAY_PACE, NIGHT_PACE, sim.dark);
    sim.hour = (sim.hour + ((d * pace) / DAY_SECONDS) * 24) % 24;
    sim.elapsed += d;
  }
  if (sim.buildRun) {
    sim.build = frozen ? 1 : Math.min(1, sim.build + d / BUILD_SECONDS);
    if (sim.build >= 1) sim.buildRun = false;
  }
  if (sim.remodelRun) {
    sim.remodel = frozen ? 1 : Math.min(1, sim.remodel + d / REMODEL_SECONDS);
    if (sim.remodel >= 1) sim.remodelRun = false;
  }
  sunAt(sim, date);
}

/* ── 모델 분류 ────────────────────────────────────────────────────── */

export type Part = { mesh: THREE.Mesh; floor: "1f" | "2f" | "roof"; kind: string; name: string };

// 실내 쪽 벽 (외단열 대상이 아니다)
const INTERNAL = /Internal|LobbyInner|MultipurposeWest|Stair|Toilet|BedroomNorth/;
const WINDOW = /^(VIS_F(\d)_([A-Za-z]+)_\d+)_/;

/** 벽 이름의 방위 → 바깥쪽 방향 */
export function outward(name: string) {
  if (/North/.test(name)) return new THREE.Vector3(0, 0, -1);
  if (/South|Front/.test(name)) return new THREE.Vector3(0, 0, 1);
  if (/East/.test(name)) return new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3(-1, 0, 0);
}

export function readParts(root: THREE.Object3D): Part[] {
  const parts: Part[] = [];
  root.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const mesh = o as THREE.Mesh;
    // 재질이 둘인 메시(바닥판)는 glTF 에서 그룹 + 하위 메시로 나뉘고 태그는 그룹에 붙는다
    const tagged = mesh.userData?.kind ? mesh : mesh.parent!;
    const ex = (tagged.userData ?? {}) as { floor?: string; kind?: string };
    parts.push({ mesh, floor: (ex.floor ?? "1f") as Part["floor"], kind: ex.kind ?? "wall", name: tagged.name || mesh.name });
  });
  return parts;
}

export const isExteriorWall = (p: Part) =>
  (p.kind === "wall" || p.kind === "wall2") && /^VIS_F\d_[A-Za-z]+$/.test(p.name) && !INTERNAL.test(p.name) && !/Luminaire|Skirting/.test(p.name);

/** 바깥 창 · 유리문: 유리가 있는 개구부 묶음 중 실내 칸막이(LobbyInner)를 뺀 것 */
export function windowGroups(parts: Part[]) {
  const groups = new Map<string, Part[]>();
  for (const p of parts) {
    const m = WINDOW.exec(p.name);
    if (!m || INTERNAL.test(m[3])) continue;
    groups.set(m[1], [...(groups.get(m[1]) ?? []), p]);
  }
  return [...groups.entries()].filter(([, ps]) => ps.some((p) => p.kind === "glass")).map(([key, ps]) => ({ key, wall: WINDOW.exec(ps[0].name)![3], parts: ps }));
}

/**
 * 외벽 바깥면에 붙는 외단열 판: 벽 형상(창 구멍 포함)을 바깥면에서 바깥으로 thickness 만큼 눌러 붙인다.
 * 양 끝은 모서리를 감싸도록 두께만큼 늘린다.
 */
export function shellGeometry(wall: THREE.BufferGeometry, out: THREE.Vector3, thickness: number) {
  const g = wall.clone();
  g.computeBoundingBox();
  const box = g.boundingBox!;
  const axis = out.x !== 0 ? 0 : 2; // 두께 방향
  const along = axis === 0 ? 2 : 0; // 길이 방향
  const sign = axis === 0 ? out.x : out.z;
  const min = axis === 0 ? box.min.x : box.min.z;
  const max = axis === 0 ? box.max.x : box.max.z;
  const outer = sign > 0 ? max : min;
  const inner = sign > 0 ? min : max;
  const a0 = along === 0 ? box.min.x : box.min.z;
  const a1 = along === 0 ? box.max.x : box.max.z;
  const mid = (a0 + a1) / 2;
  const grow = (a1 - a0 + thickness * 2) / (a1 - a0);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const p = pos.getComponent(i, axis);
    pos.setComponent(i, axis, outer + sign * thickness * ((p - inner) / (outer - inner)));
    pos.setComponent(i, along, mid + (pos.getComponent(i, along) - mid) * grow);
  }
  pos.needsUpdate = true;
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** 지붕 남쪽 면의 윗면 삼각형들 → 가운데 · 법선 (태양광 모듈을 놓을 면) */
export function roofPlane(mesh: THREE.Mesh) {
  const g = mesh.geometry;
  const pos = g.attributes.position as THREE.BufferAttribute;
  const index = g.index;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const sum = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let area = 0;
  const count = index ? index.count : pos.count;
  for (let i = 0; i < count; i += 3) {
    const ia = index ? index.getX(i) : i;
    const ib = index ? index.getX(i + 1) : i + 1;
    const ic = index ? index.getX(i + 2) : i + 2;
    a.fromBufferAttribute(pos, ia).applyMatrix4(mesh.matrixWorld);
    b.fromBufferAttribute(pos, ib).applyMatrix4(mesh.matrixWorld);
    c.fromBufferAttribute(pos, ic).applyMatrix4(mesh.matrixWorld);
    n.subVectors(c, b).cross(a.clone().sub(b));
    const s = n.length() / 2;
    n.normalize();
    // 남쪽(+z)을 향해 기운 윗면만
    if (n.y < 0.4 || n.z < 0.2 || s < 1e-4) continue;
    sum.addScaledVector(a.add(b).add(c).divideScalar(3), s);
    normal.addScaledVector(n, s);
    area += s;
  }
  if (area === 0) return null;
  return { center: sum.divideScalar(area), normal: normal.normalize(), area };
}

/* ── 열화상 ───────────────────────────────────────────────────────── */

// 홈 히어로 그린리모델링과 같은 철 무지개(ironbow) 색
export const THERMAL_STOPS = ["#0d1450", "#661a8c", "#db333d", "#f78c1f", "#fff2a6"];
const STOPS = THERMAL_STOPS.map((c) => new THREE.Color(c));
/** 이 열관류율(W/㎡K)을 가장 밝은 색으로 — 밝기는 열관류율에 비례한다 */
export const U_MAX = 4;

export function thermalColor(u: number, out = new THREE.Color()) {
  const x = Math.min(1, Math.max(0, u / U_MAX)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  return out.copy(STOPS[i]).lerp(STOPS[i + 1], x - i);
}
