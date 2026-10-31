"use client";

/**
 * Lab v2 3D 장면 — 도면 선이 그려지고, 벽이 솟고, 실을 보고, 그린리모델링을 시공한다.
 * LabTwin 이 화면에 들어올 때 동적으로 불러온다(초기 번들에 넣지 않음).
 * 하늘 · 빛 번짐 · 색 보정은 홈 히어로와 같은 것을 쓴다 (SimContext 에 TwinSim 을 넣는다).
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Effects from "@/components/district/Effects";
import { Sky } from "@/components/hero/Atmosphere";
import { SimContext, type Sim } from "@/components/hero/heroSim";
import { buildTwin, type TwinModel } from "./twinBuild";
import energy from "@/data/lab/ai-building-workspace-energy.json";
import {
  BUILD,
  CENTER,
  FLOOR_Y,
  REMODEL,
  TOP_Y,
  WIN_U,
  atHour,
  ease,
  easeOut,
  fluxColor,
  piece,
  scenarioKey,
  span,
  stepTwin,
  thermalColor,
  wallU,
  type HourlyData,
  type Scenario,
  type ThermalBasis,
  type TwinFloor,
  type TwinMode,
  type TwinSim,
} from "./twinModel";

const BG = "#050d13";
const TEAL = new THREE.Color("#49B6CA");

/** 다루는 도구: 단면(높이에서 자르기) · 치수(두 점 거리) · 전후 비교(화면을 좌우로 나눔) */
export type TwinTool = "section" | "measure" | "compare" | null;
export type MeasureState = { pts: THREE.Vector3[] };

export type TwinRoom = { key: string; floor: TwinFloor; z: number; area: number; review: boolean; label: [number, number]; polygon: [number, number][] };
export type TwinPlanData = { floors: Record<TwinFloor, { z: number; groups: Record<string, number[]> }> };

/* ── 시간 ─────────────────────────────────────────────────────────── */

function Driver({ simRef, frozen, paused, day }: { simRef: RefObject<TwinSim>; frozen: boolean; paused: boolean; day: string | null }) {
  // day "MM-DD" (겨울 · 여름 대표일) — 없으면 오늘
  const date = useMemo(() => {
    if (!day) return new Date();
    const [m, d] = day.split("-").map(Number);
    return new Date(new Date().getFullYear(), m - 1, d);
  }, [day]);
  useFrame((_, delta) => stepTwin(simRef.current, delta, frozen, paused, date), -1);
  return null;
}

/* ── 빛 ───────────────────────────────────────────────────────────── */

const SUN_HIGH = new THREE.Color("#fff1dc");
const SUN_LOW = new THREE.Color("#ffb06a");
const MOON = new THREE.Color("#a9c2d6");
const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

function stepLights(sun: THREE.DirectionalLight, hemi: THREE.HemisphereLight, sim: TwinSim, scene: THREE.Scene, tmp: THREE.Color) {
  const day = smooth(-0.05, 0.2, sim.sunAlt);
  // 밤에는 달빛이 남서쪽 높은 곳에서
  const dir = day > 0.02 ? sim.sun : MOON_DIR;
  sun.position.copy(CENTER).addScaledVector(dir, 34);
  sun.target.position.copy(CENTER);
  sun.target.updateMatrixWorld();
  sun.intensity = 0.25 + 1.9 * day;
  sun.color.copy(MOON).lerp(tmp.copy(SUN_HIGH).lerp(SUN_LOW, 1 - smooth(0.15, 0.6, sim.sunAlt)), day);
  hemi.intensity = 0.18 + 0.32 * day;
  scene.environmentIntensity = 0.12 + 0.25 * day;
}
const MOON_DIR = new THREE.Vector3(-0.5, 0.8, 0.4).normalize();

function Lights({ shadows }: { shadows: boolean }) {
  const sim = useSimTwin();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ scene }) => sun.current && hemi.current && stepLights(sun.current, hemi.current, sim.current, scene, tmp));
  return (
    <>
      <hemisphereLight ref={hemi} args={["#cfe9f0", "#0b1c25", 0.4]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={5}
        shadow-camera-far={70}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
      />
    </>
  );
}

// SimContext 는 Sim 형이라 TwinSim 으로 좁혀 쓴다
const useSimTwin = () => useContext(SimContext) as RefObject<TwinSim>;

/* ── 무대 ─────────────────────────────────────────────────────────── */

function Stage() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(120, 120, TEAL, TEAL);
    const mat = g.material as THREE.LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0.06;
    g.position.set(CENTER.x, -0.06, CENTER.z);
    return g;
  }, []);
  return (
    <group>
      <primitive object={grid} />
      <mesh position={[CENTER.x, -0.2, CENTER.z]} receiveShadow>
        <cylinderGeometry args={[17, 17.4, 0.36, 96]} />
        <meshStandardMaterial color="#142a33" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.015, CENTER.z]}>
        <ringGeometry args={[16.85, 17, 128]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ── 도면 선 ──────────────────────────────────────────────────────── */

const LINE_COLORS: Record<string, string> = { wall: "#8fe3f0", window: "#4fb8cc", detail: "#2f7383", dim: "#8a6f45" };
const GROUP_ORDER = ["wall", "window", "detail", "dim"];

type PlanLayer = { line: THREE.LineSegments; count: number; group: string };

function planLayers(plan: TwinPlanData, floor: TwinFloor): PlanLayer[] {
  const { z, groups } = plan.floors[floor];
  return GROUP_ORDER.filter((g) => groups[g]).map((g) => {
    const flat = groups[g];
    const pos = new Float32Array((flat.length / 2) * 3);
    for (let i = 0, j = 0; i < flat.length; i += 2, j += 3) {
      pos[j] = flat[i];
      pos[j + 1] = z + 0.02;
      pos[j + 2] = -flat[i + 1];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color: LINE_COLORS[g], transparent: true, depthWrite: false, toneMapped: false });
    return { line: new THREE.LineSegments(geo, mat), count: flat.length / 2, group: g };
  });
}

/** 그룹 순서대로 펜이 지나가듯 그린다. progress 0~1, opacity 는 층 전체 */
function stepPlan(layers: PlanLayer[], progress: number, opacity: number, wallsOnly: boolean) {
  const total = layers.reduce((a, l) => a + l.count, 0);
  let left = progress * total;
  for (const l of layers) {
    const n = Math.max(0, Math.min(l.count, Math.floor(left)));
    left -= l.count;
    l.line.geometry.setDrawRange(0, n - (n % 2));
    const show = wallsOnly ? (l.group === "wall" || l.group === "window" ? 1 : 0) : 1;
    (l.line.material as THREE.LineBasicMaterial).opacity = opacity * show * (l.group === "detail" || l.group === "dim" ? 0.7 : 1);
    l.line.visible = opacity * show > 0.01 && n > 0;
  }
}

function PlanLines({ plan, simRef, mode, floor }: { plan: TwinPlanData; simRef: RefObject<TwinSim>; mode: TwinMode; floor: TwinFloor }) {
  const f1 = useMemo(() => planLayers(plan, "1f"), [plan]);
  const f2 = useMemo(() => planLayers(plan, "2f"), [plan]);
  // 벽이 솟는 높이에 1층(→ 2층) 벽선을 띄워 자르는 면을 보여 준다
  const ring1 = useMemo(() => ringLine(f1), [f1]);
  const ring2 = useMemo(() => ringLine(f2), [f2]);
  useFrame(() => stepPlanLines(simRef.current, mode, floor, f1, f2, ring1, ring2));
  return (
    <>
      {[...f1, ...f2].map((l, i) => (
        <primitive key={i} object={l.line} />
      ))}
      <primitive object={ring1} />
      <primitive object={ring2} />
    </>
  );
}

function ringLine(layers: PlanLayer[]) {
  const wall = layers.find((l) => l.group === "wall")!;
  const line = new THREE.LineSegments(
    wall.line.geometry.clone(),
    new THREE.LineBasicMaterial({ color: "#c9f6ff", transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }),
  );
  line.visible = false;
  return line;
}

function stepPlanLines(s: TwinSim, mode: TwinMode, floor: TwinFloor, f1: PlanLayer[], f2: PlanLayer[], ring1: THREE.LineSegments, ring2: THREE.LineSegments) {
  const b = s.build;
  const rise = span(b, BUILD.rise);
  const clip = rise * TOP_Y;
  if (mode === "rooms") {
    // 실 보기: 고른 층의 벽 · 창 선만 바닥에
    stepPlan(f1, 1, floor === "1f" ? 0.55 : 0, true);
    stepPlan(f2, 1, floor === "2f" ? 0.55 : 0, true);
  } else {
    // 다 지은 뒤 1층 도면은 대지에 흐리게 남고, 2층 도면은 벽이 그 높이를 지나면 사라진다
    stepPlan(f1, span(b, BUILD.plan1), 1 - span(b, [0.84, 1]) * 0.7, false);
    stepPlan(f2, span(b, BUILD.plan2), 1 - smooth(FLOOR_Y["2f"] - 0.4, FLOOR_Y["2f"] + 0.3, clip), false);
  }
  const rising = mode !== "rooms" && rise > 0 && rise < 1;
  const upper = clip > FLOOR_Y["2f"];
  ring1.visible = rising && !upper;
  ring2.visible = rising && upper;
  ring1.position.y = clip - 0.02;
  ring2.position.y = clip - FLOOR_Y["2f"] - 0.02;
  const fade = Math.min(1, rise * 12, (1 - rise) * 12);
  (ring1.material as THREE.LineBasicMaterial).opacity = fade;
  (ring2.material as THREE.LineBasicMaterial).opacity = fade;
}

/* ── 건물 ─────────────────────────────────────────────────────────── */

const LAMP = new THREE.Color("#ffd9a8");
const GLOW = new THREE.Color("#ffc983");

const GLASS_LOWE = new THREE.Color("#86c3d1");
const GLASS_TRIPLE = new THREE.Color("#7db8ae");

type View = { mode: TwinMode; floor: TwinFloor; before: boolean; thermal: boolean; scenario: Scenario; tool: TwinTool; cut: number; basis: ThermalBasis };

/**
 * 열화상 막의 색. 기준이 열관류율이면 면마다 고정 색, 겨울 · 여름 하루면 지금 시각의 EnergyPlus 면별 열 흐름으로 칠한다.
 * 시공 전 부품(맨 벽 · 헌 창)이 보이는 경우(전 보기 · 비교 왼쪽)는 리모델링 전 결과, 나머지는 고른 조합의 결과를 쓴다.
 */
function paintHeat(m: TwinModel, v: View, hourly: HourlyData | null, hour: number, pre: boolean) {
  const H = m.heat;
  const s = v.scenario;
  if (v.basis === "u" || !hourly) {
    for (const mat of Object.values(H.wall)) thermalColor(wallU(0), mat.color);
    for (const mat of Object.values(H.shell)) thermalColor(wallU(s.wall), mat.color);
    for (const mat of Object.values(H.old)) thermalColor(WIN_U.old, mat.color);
    for (const mat of Object.values(H.fresh)) thermalColor(WIN_U[s.win], mat.color);
    thermalColor(energy.assumptions.roofU, H.roof.color);
    thermalColor(energy.assumptions.roofU, H.slab.color);
    thermalColor(energy.assumptions.floorU, H.floor.color);
    return;
  }
  const base = hourly.runs["w0-old"][v.basis];
  const run = hourly.runs[scenarioKey(s)][v.basis];
  const before = pre ? base : run;
  for (const [k, mat] of Object.entries(H.wall)) fluxColor(atHour(before.wall[k], hour), mat.color);
  for (const [k, mat] of Object.entries(H.shell)) fluxColor(atHour(run.wall[k], hour), mat.color);
  for (const [k, mat] of Object.entries(H.old)) fluxColor(atHour(before.win[k], hour), mat.color);
  for (const [k, mat] of Object.entries(H.fresh)) fluxColor(atHour(run.win[k], hour), mat.color);
  fluxColor(atHour(before.roof.F2, hour), H.roof.color);
  fluxColor(atHour(before.roof.F1, hour), H.slab.color);
  fluxColor(0, H.floor.color);
}
type SplitTmp = { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 };

/** 화면 x(0~1)에서 세로로 나누는 면 — 카메라를 지나므로 화면에서는 세로선이 된다. right 는 오른쪽이 보이는 면 */
function setSplit(m: TwinModel, camera: THREE.Camera, x: number, t: SplitTmp) {
  const ndc = x * 2 - 1;
  t.a.set(ndc, -1, 0.5).unproject(camera);
  t.b.set(ndc, 1, 0.5).unproject(camera);
  m.split.right.setFromCoplanarPoints(camera.position, t.a, t.b);
  const toRight = ndc < 0.6;
  t.c.set(toRight ? ndc + 0.2 : ndc - 0.2, 0, 0.5).unproject(camera);
  if (m.split.right.distanceToPoint(t.c) * (toRight ? 1 : -1) < 0) m.split.right.negate();
  m.split.left.copy(m.split.right).negate();
}

function stepBuilding(m: TwinModel, s: TwinSim, v: View, hourly: HourlyData | null, split: number | null, camera: THREE.Camera, t: SplitTmp, scanRef: { value: number }, delta: number, frozen: boolean) {
  const { mode, floor, thermal, scenario } = v;
  // 전후 비교: 시공이 끝난 뒤 화면을 나눠 왼쪽은 전, 오른쪽은 후 (둘 다 제자리에 둔다)
  const comparing = v.tool === "compare" && split !== null && s.remodel >= 1;
  const before = v.before && !comparing;
  if (comparing) setSplit(m, camera, split, t);
  else {
    m.split.right.set(new THREE.Vector3(1, 0, 0), 1e6);
    m.split.left.set(new THREE.Vector3(-1, 0, 0), 1e6);
  }
  // 구축: 자르는 면이 올라간다. 다 지은 뒤에는 단면 도구의 높이에서 자르고, 아니면 치운다
  const rise = span(s.build, BUILD.rise);
  m.plane.constant = s.build >= 1 ? (v.tool === "section" ? v.cut : 100) : rise <= 0 ? -0.01 : ease(rise) * TOP_Y;

  // 층 보기: 실 보기에서는 위층 · 지붕 · 천장을 걷는다
  for (const it of m.items) {
    let show = true;
    if (mode === "rooms") show = floor === "1f" ? it.floor === "1f" && !it.ceiling : it.floor !== "roof" && !(it.floor === "2f" && it.ceiling);
    it.obj.userData.hidden = !show;
  }

  // 리모델링 (전후 비교에서 "전"이면 시공 전 모습)
  const r = before ? 0 : s.remodel;
  const ins = span(r, REMODEL.insulation);
  // 고른 조합의 두께로 외단열 판을 바꿔 끼운다 (열화상 막도 같은 형상)
  m.walls.forEach((w, k) => {
    const g = w.geos[scenario.wall];
    if (g && w.shell.geometry !== g) {
      w.shell.geometry = g;
      for (const c of w.shell.children) (c as THREE.Mesh).geometry = g;
    }
    const e = scenario.wall ? easeOut(piece(ins, k / m.walls.length)) : 0;
    w.shell.visible = e > 0 && !w.shell.userData.hidden;
    w.shell.position.copy(w.out).multiplyScalar((1 - e) * 1.8);
  });
  paintHeat(m, v, hourly, s.hour, v.before || comparing);
  m.freshGlass.color.copy(scenario.win === "triple" ? GLASS_TRIPLE : GLASS_LOWE);
  const win = span(r, REMODEL.windows);
  m.windows.forEach((w, k) => {
    // 기존 창을 고르면 바꾸지 않는다
    const p = scenario.win === "old" ? 0 : piece(win, k / m.windows.length);
    // 헌 창이 바깥으로 빠지며 작아지고, 새 창이 바깥에서 들어온다
    const out = easeOut(Math.min(1, p / 0.45));
    const inn = easeOut(Math.max(0, (p - 0.4) / 0.6));
    // 비교 중에는 헌 창도 제자리에 (왼쪽 화면에만 보인다)
    const gone = comparing ? 0 : out;
    w.old.visible = gone < 1 && !w.old.userData.hidden;
    w.old.position.copy(w.at).addScaledVector(w.out, gone * 1.4);
    w.old.scale.setScalar(Math.max(1e-3, 1 - gone));
    w.fresh.visible = inn > 0 && !w.fresh.userData.hidden;
    w.fresh.position.copy(w.at).addScaledVector(w.out, (1 - inn) * 1.4);
  });
  if (m.pv) {
    const pv = m.pv;
    const ph = span(r, REMODEL.pv);
    // 2장이면 가운데 두 장
    const skip = (pv.modules.length - scenario.pv) / 2;
    pv.modules.forEach((mod, k) => {
      const i = k - skip;
      const e = i >= 0 && i < scenario.pv ? easeOut(piece(ph, i / scenario.pv)) : 0;
      mod.visible = e > 0 && !pv.group.userData.hidden;
      mod.position.copy(pv.base[k]).addScaledVector(pv.normal, (1 - e) * 2.5);
    });
  }
  // 시공 부품(외단열 판 · 창 · 태양광)은 위에서 따로 켠다
  for (const it of m.items) if (!it.obj.userData.special) it.obj.visible = !it.obj.userData.hidden;

  // 열화상: 시공 중에는 시간표대로 아래에서 위로 덮었다가(진단) 끝에 위에서 아래로 걷힌다. 쉬는 동안은 토글을 따른다
  let target: number;
  if (!before && s.remodel > 0 && s.remodel < 1) {
    target = s.remodel < REMODEL.cool[0] ? span(s.remodel, REMODEL.scan) * TOP_Y : (1 - span(s.remodel, REMODEL.cool)) * TOP_Y;
    scanRef.value = target;
  } else {
    target = thermal && mode !== "rooms" ? TOP_Y : -0.5;
    scanRef.value = frozen ? target : scanRef.value + (target - scanRef.value) * (1 - Math.exp(-Math.min(delta, 0.1) * 3));
  }
  m.scan.value = scanRef.value;
  const on = m.scan.value > -0.4;
  for (const o of m.overlays) o.visible = on;

  // 밤: 창 안쪽 불빛 · 실내 조명
  for (const g of m.glass) g.emissive.copy(GLOW).multiplyScalar(s.dark * 0.55);
  m.lamps.color.copy(LAMP).multiplyScalar(0.2 + s.dark * 1.4);
}

function Building({
  url,
  simRef,
  view,
  hourly,
  splitRef,
  measureRef,
  frozen,
}: {
  url: string;
  simRef: RefObject<TwinSim>;
  view: View;
  hourly: HourlyData | null;
  splitRef: RefObject<number>;
  measureRef: RefObject<MeasureState>;
  frozen: boolean;
}) {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);
  const model = useMemo(() => buildTwin(scene), [scene]);
  const scanRef = useRef({ value: -0.5 });
  // 움직임 줄이기(그때만 그리는 모드)에서도 보기를 바꾸면 바로 그린다
  const tmp = useMemo<SplitTmp>(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  useEffect(() => invalidate(), [view, hourly, invalidate]);
  useFrame(({ camera }, delta) => stepBuilding(model, simRef.current, view, hourly, splitRef.current, camera, tmp, scanRef.current, delta, frozen));
  // 치수: 건물에서 누른 점 (끌어서 돌린 것은 무시, 잘려 나간 부분 · 숨긴 부품은 건너뛴다)
  const pick = (e: ThreeEvent<MouseEvent>) => {
    if (view.tool !== "measure" || e.delta > 4) return;
    const hit = e.intersections.find((i) => i.point.y <= model.plane.constant + 1e-3 && shown(i.object));
    if (!hit) return;
    e.stopPropagation();
    const pts = measureRef.current.pts;
    if (pts.length >= 2) pts.length = 0;
    pts.push(hit.point.clone());
    invalidate();
  };
  return <primitive object={model.root} onClick={pick} />;
}

function shown(o: THREE.Object3D | null): boolean {
  for (let n = o; n; n = n.parent) if (!n.visible) return false;
  return true;
}

/* ── 단면 · 치수 표시 ─────────────────────────────────────────────── */

const CUT = new THREE.Color("#7fe3f3");

/** 단면 높이에 얇은 판과 테두리 — 어디서 잘랐는지 보이게 */
function SectionPlane({ cut, on }: { cut: number; on: boolean }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(15, 13)), []);
  if (!on) return null;
  return (
    <group position={[CENTER.x, cut, CENTER.z - 0.3]} rotation-x={-Math.PI / 2}>
      <mesh renderOrder={4}>
        <planeGeometry args={[15, 13]} />
        <meshBasicMaterial color={CUT} transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <lineSegments geometry={edges} renderOrder={4}>
        <lineBasicMaterial color={CUT} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

type MeasureNodes = { a: THREE.Mesh; b: THREE.Mesh; line: THREE.Line };

function stepMeasure(n: MeasureNodes, pts: THREE.Vector3[], on: boolean, label: HTMLElement | null | undefined, camera: THREE.Camera, w: number, h: number, mid: THREE.Vector3) {
  n.a.visible = on && pts.length > 0;
  n.b.visible = on && pts.length > 1;
  n.line.visible = on && pts.length > 1;
  if (pts[0]) n.a.position.copy(pts[0]);
  if (pts[1]) {
    n.b.position.copy(pts[1]);
    const pos = n.line.geometry.attributes.position as THREE.BufferAttribute;
    pos.setXYZ(0, pts[0].x, pts[0].y, pts[0].z);
    pos.setXYZ(1, pts[1].x, pts[1].y, pts[1].z);
    pos.needsUpdate = true;
  }
  if (!label) return;
  if (!(on && pts.length > 1)) {
    label.style.visibility = "hidden";
    return;
  }
  const text = `${pts[0].distanceTo(pts[1]).toFixed(2)} m`;
  if (label.textContent !== text) label.textContent = text;
  mid.addVectors(pts[0], pts[1]).multiplyScalar(0.5).project(camera);
  moveChip(label, ((mid.x + 1) / 2) * w, ((1 - mid.y) / 2) * h - 18, mid.z < 1);
}

function Measure({ on, measureRef, chipsRef }: { on: boolean; measureRef: RefObject<MeasureState>; chipsRef: RefObject<Record<string, HTMLElement | null>> }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: "#ffd27a", depthTest: false, transparent: true, toneMapped: false }));
    l.renderOrder = 10;
    l.frustumCulled = false;
    return l;
  }, []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  // 도구를 끄면 재던 점을 지운다
  useEffect(() => {
    if (!on) measureRef.current.pts.length = 0;
  }, [on, measureRef]);
  useFrame(({ camera, size }) => a.current && b.current && stepMeasure({ a: a.current, b: b.current, line }, measureRef.current.pts, on, chipsRef.current.measure, camera, size.width, size.height, mid));
  return (
    <>
      <mesh ref={a} visible={false} renderOrder={10}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color="#ffd27a" depthTest={false} transparent toneMapped={false} />
      </mesh>
      <mesh ref={b} visible={false} renderOrder={10}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color="#ffd27a" depthTest={false} transparent toneMapped={false} />
      </mesh>
      <primitive object={line} />
    </>
  );
}

/* ── 실 ───────────────────────────────────────────────────────────── */

const ROOM = new THREE.Color("#2C9DB3");
const ROOM_FLAG = new THREE.Color("#d9822b");

function Rooms({ rooms, floor, selected, onSelect }: { rooms: TwinRoom[]; floor: TwinFloor; selected: string | null; onSelect: (key: string | null) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const shapes = useMemo(
    () =>
      rooms.map((r) => {
        const s = new THREE.Shape();
        r.polygon.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
        return { room: r, geometry: new THREE.ShapeGeometry(s) };
      }),
    [rooms],
  );
  return (
    <>
      {shapes
        .filter(({ room }) => room.floor === floor)
        .map(({ room, geometry }) => {
          const on = selected === room.key;
          return (
            <mesh
              key={room.key}
              geometry={geometry}
              rotation-x={-Math.PI / 2}
              position-y={room.z + 0.05}
              renderOrder={3}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHover(room.key);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHover(null);
                document.body.style.cursor = "";
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect(room.key);
              }}
            >
              <meshBasicMaterial
                color={room.review ? ROOM_FLAG : ROOM}
                transparent
                opacity={on ? 0.62 : hover === room.key ? 0.42 : 0.24}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          );
        })}
    </>
  );
}

/* ── 실 이름표 (DOM) ───────────────────────────────────────────────── */

function moveChip(node: HTMLElement | null | undefined, x: number, y: number, show: boolean) {
  if (!node) return;
  node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
  node.style.visibility = show ? "visible" : "hidden";
}

function Labels({ rooms, floor, mode, chipsRef }: { rooms: TwinRoom[]; floor: TwinFloor; mode: TwinMode; chipsRef: RefObject<Record<string, HTMLElement | null>> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const r of rooms) {
      v.set(r.label[0], r.z + 0.4, -r.label[1]).project(camera);
      moveChip(chipsRef.current[r.key], ((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height, mode === "rooms" && r.floor === floor && v.z < 1);
    }
  });
  return null;
}

/* ── 카메라 ───────────────────────────────────────────────────────── */

type Pose = { pos: THREE.Vector3; target: THREE.Vector3 };
const POSES: Record<string, Pose> = {
  plan: { pos: new THREE.Vector3(4, 29, 15), target: new THREE.Vector3(5.25, 0, -4.4) },
  overview: { pos: new THREE.Vector3(-9.5, 10.5, 16.5), target: new THREE.Vector3(5.25, 2.8, -4.9) },
  rooms1f: { pos: new THREE.Vector3(5.6, 25, 9.5), target: new THREE.Vector3(5.25, 0, -4.4) },
  rooms2f: { pos: new THREE.Vector3(5.6, 28, 9.5), target: new THREE.Vector3(5.25, 3.3, -4.4) },
  remodel: { pos: new THREE.Vector3(23, 10.5, 18), target: new THREE.Vector3(5.25, 3, -4.9) },
};

type Controls = { target: THREE.Vector3; update: () => void; autoRotate: boolean; autoRotateSpeed: number; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void };

function poseKey(mode: TwinMode, floor: TwinFloor, build: number) {
  if (mode === "rooms") return floor === "1f" ? "rooms1f" : "rooms2f";
  if (mode === "remodel") return "remodel";
  return build < BUILD.rise[0] + 0.04 ? "plan" : "overview";
}

function stepCamera(camera: THREE.Camera, controls: Controls, pose: Pose, k: number, narrow: number, tmp: THREE.Vector3) {
  tmp.copy(pose.pos).sub(pose.target).multiplyScalar(narrow).add(pose.target);
  camera.position.lerp(tmp, k);
  controls.target.lerp(pose.target, k);
  controls.update();
  return camera.position.distanceTo(tmp) < 0.05;
}

function CameraRig({ simRef, mode, floor, frozen }: { simRef: RefObject<TwinSim>; mode: TwinMode; floor: TwinFloor; frozen: boolean }) {
  const { camera, controls, size, invalidate } = useThree();
  const tween = useRef<string | null>("plan");
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const key = useRef("");

  // 사용자가 끌면 그 자리에 둔다
  useEffect(() => {
    const c = controls as unknown as Controls | null;
    if (!c) return;
    const stop = () => {
      tween.current = null;
    };
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, [controls]);

  useEffect(() => invalidate(), [mode, floor, invalidate]);

  useFrame((_, delta) => {
    const c = controls as unknown as Controls | null;
    if (!c) return;
    const k2 = poseKey(mode, floor, simRef.current.build);
    if (k2 !== key.current) {
      key.current = k2;
      tween.current = k2;
    }
    const narrow = size.width / size.height < 1 ? 1.55 : 1;
    if (tween.current) {
      const done = stepCamera(camera, c, POSES[tween.current], frozen ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 1.8), narrow, tmp);
      if (done) tween.current = null;
    }
    finishRig(c, camera as THREE.PerspectiveCamera, !frozen && mode === "build" && simRef.current.build >= 1 && !tween.current, size.width, size.height);
  });
  return null;
}

/** 다 지은 뒤 천천히 돈다. 아래쪽 자막 · 챕터를 비켜 건물을 조금 위로 (화면 중심을 옮긴다) */
function finishRig(c: Controls, cam: THREE.PerspectiveCamera, rotate: boolean, w: number, h: number) {
  c.autoRotate = rotate;
  c.autoRotateSpeed = 0.35;
  const oy = Math.round(h * 0.06);
  if (cam.view?.offsetY !== oy || cam.view?.fullWidth !== w || cam.view?.fullHeight !== h) {
    cam.setViewOffset(w, h, 0, oy, w, h);
    cam.updateProjectionMatrix();
  }
}

/* ── 캔버스 ───────────────────────────────────────────────────────── */

export default function TwinScene({
  simRef,
  modelUrl,
  plan,
  rooms,
  mode,
  floor,
  selected,
  onSelect,
  before,
  thermal,
  scenario,
  tool,
  cut,
  basis,
  hourly,
  splitRef,
  measureRef,
  chipsRef,
  active,
  frozen,
  paused,
  onReady,
}: {
  simRef: RefObject<TwinSim>;
  modelUrl: string;
  plan: TwinPlanData;
  rooms: TwinRoom[];
  mode: TwinMode;
  floor: TwinFloor;
  selected: string | null;
  onSelect: (key: string | null) => void;
  before: boolean;
  thermal: boolean;
  scenario: Scenario;
  tool: TwinTool;
  cut: number;
  basis: ThermalBasis;
  hourly: HourlyData | null;
  splitRef: RefObject<number>;
  measureRef: RefObject<MeasureState>;
  chipsRef: RefObject<Record<string, HTMLElement | null>>;
  active: boolean;
  frozen: boolean;
  paused: boolean;
  onReady: () => void;
}) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  const view = useMemo<View>(() => ({ mode, floor, before, thermal, scenario, tool, cut, basis }), [mode, floor, before, thermal, scenario, tool, cut, basis]);
  // 해 경로 날짜: 겨울 · 여름 하루를 보면 그날, 아니면 오늘
  const day = basis !== "u" && hourly ? hourly.days[basis] : null;
  const [fx, setFx] = useState(true);
  const [shadows, setShadows] = useState(true);
  const declines = useRef(0);

  return (
    <SimContext.Provider value={simRef as RefObject<Sim>}>
      <Canvas
        dpr={dpr}
        shadows
        camera={{ position: POSES.plan.pos.toArray(), fov: 34, near: 0.3, far: 400 }}
        frameloop={frozen ? "demand" : active ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance", localClippingEnabled: true } as THREE.WebGLRendererParameters}
        onPointerMissed={() => onSelect(null)}
        onCreated={({ gl, scene }) => {
          gl.localClippingEnabled = true;
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          pmrem.dispose();
          onReady();
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            declines.current += 1;
            if (declines.current === 1) setFx(false);
            else {
              setDpr(1);
              setShadows(false);
            }
          }}
        />
        <Driver simRef={simRef} frozen={frozen} paused={paused} day={day} />
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 45, 110]} />
        <Sky radius={160} />
        <Lights shadows={shadows} />
        <Stage />
        <PlanLines plan={plan} simRef={simRef} mode={mode} floor={floor} />
        <Building url={modelUrl} simRef={simRef} view={view} hourly={hourly} splitRef={splitRef} measureRef={measureRef} frozen={frozen} />
        <SectionPlane cut={cut} on={tool === "section"} />
        <Measure on={tool === "measure"} measureRef={measureRef} chipsRef={chipsRef} />
        {mode === "rooms" && <Rooms rooms={rooms} floor={floor} selected={selected} onSelect={onSelect} />}
        <Labels rooms={rooms} floor={floor} mode={mode} chipsRef={chipsRef} />
        <OrbitControls makeDefault enableDamping enablePan={false} minDistance={9} maxDistance={60} maxPolarAngle={Math.PI / 2 - 0.08} target={POSES.plan.target.toArray()} />
        <CameraRig simRef={simRef} mode={mode} floor={floor} frozen={frozen} />
        {fx && <Effects glow={0.7} />}
      </Canvas>
    </SimContext.Provider>
  );
}
