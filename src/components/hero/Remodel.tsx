"use client";

/**
 * 그린리모델링 시공 장면 — 저층부 동쪽 외벽(2~8층)을 고친다.
 * 순서: 열화상 진단(열이 새는 곳) → 외단열 패널 → 고성능 창호 → 외부 차양(루버).
 * 곤돌라가 칸(bay)마다 옮겨 가며 아래층부터 하나씩 달고, 다 단 곳은 열화상 색이 식는다.
 * 시공이 끝나면 고친 외벽이 그대로 남는다. 진행 값은 sim.remodel (0 → 1), 시작 · 다시 보기는 상세 패널에서.
 */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { PROPS_URL } from "@/components/district/props";
import { DECK, LOW_TOP } from "./BuildingModel";
import { useFocusTarget } from "./focus";
import { FLOOR_H, footprint, useSim, type Sim } from "./heroSim";

/* ── 대상 외벽 · 시공 순서 ───────────────────────────────────────── */

const FIRST = 1; // 2층부터
export const ZONE_FLOORS = 7; // 2~8층
const BAYS = 14; // 커튼월 모듈(1.7 m)과 같은 칸
const [W, D] = footprint(FIRST);
const FACE = W / 2;
const BAY = D / BAYS;
const N = ZONE_FLOORS * BAYS;
const SILL = 0.165; // 층 바닥 ~ 창 아래 (슬래브 띠 + 창대 벽)
const BLADES = 3; // 칸마다 차양 날개
const BLADE_L = 0.06;
const PIVOT = FACE + 0.036;
const TERRACE = LOW_TOP + DECK;

export const REMODEL_SECONDS = 13;
export const REMODEL_STEPS = {
  scan: [0, 0.12],
  insulation: [0.12, 0.45],
  windows: [0.45, 0.72],
  shading: [0.72, 0.94],
} as const;
export type RemodelStep = keyof typeof REMODEL_STEPS;
export const REMODEL_STEP_KEYS = Object.keys(REMODEL_STEPS) as RemodelStep[];
/** 단계별 수량 — 패널 · 창호는 칸마다 하나, 차양은 칸마다 날개 3개 */
export const REMODEL_COUNTS = { insulation: N, windows: N, shading: N * BLADES };

export function stepAmount(t: number, step: RemodelStep) {
  const [a, b] = REMODEL_STEPS[step];
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}

/** 단계 진행(0~1) 중 order(0~1) 번째 칸의 진행 — 칸마다 단계의 30% 동안 달린다 */
const piece = (phase: number, order: number) => Math.min(1, Math.max(0, (phase - order * 0.7) / 0.3));
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const bayZ = (k: number) => D / 2 - (k + 0.5) * BAY; // 남쪽(카메라 쪽)부터
const floorY = (fi: number) => (FIRST + fi) * FLOOR_H;

/** 다 달린 칸 수 */
export function installedPieces(phase: number) {
  let n = 0;
  for (let i = 0; i < N; i++) if (piece(phase, i / N) >= 1) n++;
  return n;
}

/** 확대 보기 카메라가 바라보는 외벽 가운데 · 칩 위치 */
export const REMODEL_TARGET = new THREE.Vector3(FACE, floorY(ZONE_FLOORS / 2), 0);
export const REMODEL_ANCHOR: [number, number, number] = [FACE + 0.7, 0.62, 0.7];

/** 확대 보기가 열리고 카메라가 다가가면 시작한다. 움직임 줄이기에서는 바로 완료 */
export function stepRemodel(sim: Sim, start: boolean, delta: number, frozen: boolean) {
  if (start && !sim.remodelRun && sim.remodel === 0) sim.remodelRun = true;
  if (!sim.remodelRun) return;
  sim.remodel = frozen ? 1 : Math.min(1, sim.remodel + Math.min(delta, 0.1) / REMODEL_SECONDS);
  if (sim.remodel >= 1) sim.remodelRun = false;
}

/* ── 열화상 ───────────────────────────────────────────────────────── */

// 철 무지개(ironbow) 색 — 상세 패널 범례와 같은 색
export const THERMAL_STOPS = ["#0d1450", "#661a8c", "#db333d", "#f78c1f", "#fff2a6"];

const thermalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const thermalFragment = /* glsl */ `
  uniform float uOn;
  uniform float uScan;
  uniform float uIns;
  uniform float uWin;
  uniform vec3 uStops[5];
  varying vec2 vUv;
  const float FLOORS = ${ZONE_FLOORS.toFixed(1)};
  const float BAYS = ${BAYS.toFixed(1)};
  const float FH = ${FLOOR_H.toFixed(3)};
  float piece(float phase, float order) { return clamp((phase - order * 0.7) / 0.3, 0.0, 1.0); }
  float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  vec3 ironbow(float h) {
    float x = clamp(h, 0.0, 1.0) * 4.0;
    int i = int(min(floor(x), 3.0));
    float f = x - float(i);
    vec3 c = uStops[0];
    for (int k = 0; k < 4; k++) if (k == i) c = mix(uStops[k], uStops[k + 1], f);
    return c;
  }
  void main() {
    float fi = floor(vUv.y * FLOORS);
    float ly = fract(vUv.y * FLOORS) * FH;
    float k = floor(vUv.x * BAYS);
    float bx = fract(vUv.x * BAYS);
    float order = (fi * BAYS + k) / (FLOORS * BAYS);
    float ins = piece(uIns, order);
    float win = piece(uWin, order);
    float n = hash(vec2(k, fi));
    // 층 사이 슬래브 끝(열교)이 가장 뜨겁고, 창은 테두리 · 위쪽이 더 뜨겁다
    float slab = 1.0 - smoothstep(0.05, 0.085, ly);
    float band = 1.0 - smoothstep(${(SILL - 0.01).toFixed(3)}, ${(SILL + 0.01).toFixed(3)}, ly);
    float edge = max(1.0 - smoothstep(0.0, 0.14, bx), smoothstep(0.86, 1.0, bx));
    float wall = mix(0.7 + slab * 0.3 + n * 0.08, 0.08 + n * 0.05, ins);
    float glass = mix(0.45 + edge * 0.25 + ly / FH * 0.15 + n * 0.12, 0.2 + n * 0.06, win);
    float h = mix(glass, wall, band);
    float shown = 1.0 - smoothstep(uScan - 0.02, uScan, vUv.y);
    float line = exp(-abs(vUv.y - uScan) * 140.0) * step(uScan, 1.0);
    vec3 c = ironbow(h) * 0.6 * shown + vec3(0.75, 0.95, 1.0) * line;
    gl_FragColor = vec4(c * uOn, 1.0);
  }
`;

/* ── 장면 ─────────────────────────────────────────────────────────── */

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; e: THREE.Euler };

function stepPanels(mesh: THREE.InstancedMesh, phase: number, tmp: Tmp) {
  tmp.q.identity();
  for (let i = 0; i < N; i++) {
    const fi = Math.floor(i / BAYS);
    const e = easeOut(piece(phase, i / N));
    // 바깥에서 날아와 벽에 붙는다
    tmp.p.set(FACE + 0.0365 + (1 - e) * 0.35, floorY(fi) + 0.08 + (1 - e) * 0.06, bayZ(i % BAYS));
    tmp.s.setScalar(e > 0 ? 1 : 1e-4);
    mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function stepWindows(meshes: THREE.InstancedMesh[], phase: number, tmp: Tmp) {
  tmp.q.identity();
  for (let i = 0; i < N; i++) {
    const fi = Math.floor(i / BAYS);
    const e = easeOut(piece(phase, i / N));
    tmp.p.set(FACE + 0.026 + (1 - e) * 0.25, floorY(fi) + (SILL + FLOOR_H - 0.012) / 2, bayZ(i % BAYS));
    tmp.s.setScalar(e > 0 ? 0.85 + 0.15 * e : 1e-4);
    tmp.m.compose(tmp.p, tmp.q, tmp.s);
    for (const mesh of meshes) mesh.setMatrixAt(i, tmp.m);
  }
  for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
}

/** 날개는 벽에 접혀 매달려 있다가 펼쳐지고, 해가 높을수록 더 기울어 햇빛을 가린다 */
function stepLouvers(blades: THREE.InstancedMesh, brackets: THREE.InstancedMesh, phase: number, sunAlt: number, tmp: Tmp) {
  const tilt = 0.12 + Math.max(0, sunAlt) * 0.75;
  for (let i = 0; i < N; i++) {
    const fi = Math.floor(i / BAYS);
    const p = piece(phase, i / N);
    const e = easeOut(p);
    const a = Math.PI / 2 + (tilt - Math.PI / 2) * e;
    tmp.q.setFromEuler(tmp.e.set(0, 0, -a));
    tmp.s.setScalar(p > 0 ? Math.min(1, p * 4) : 1e-4);
    for (let j = 0; j < BLADES; j++) {
      const y = floorY(fi) + FLOOR_H - 0.035 - j * 0.05;
      tmp.p.set(PIVOT + (Math.cos(a) * BLADE_L) / 2, y - (Math.sin(a) * BLADE_L) / 2, bayZ(i % BAYS));
      blades.setMatrixAt(i * BLADES + j, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    }
  }
  blades.instanceMatrix.needsUpdate = true;
  // 받침 핀: 두 칸마다, 옆 칸이 달릴 때 같이 나온다
  tmp.q.identity();
  const per = BAYS / 2 + 1;
  for (let fi = 0; fi < ZONE_FLOORS; fi++) {
    for (let b = 0; b < per; b++) {
      const k = Math.min(b * 2, BAYS - 1);
      const e = easeOut(piece(phase, (fi * BAYS + k) / N));
      tmp.p.set(PIVOT + 0.0375 * e, floorY(fi) + FLOOR_H - 0.085, D / 2 - b * 2 * BAY);
      tmp.s.set(Math.max(e, 1e-4), e > 0 ? 1 : 1e-4, 1);
      brackets.setMatrixAt(fi * per + b, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    }
  }
  brackets.instanceMatrix.needsUpdate = true;
}

/** 지금 일하는 칸 (곤돌라 위치) */
function workSpot(t: number): [number, number] {
  if (t < REMODEL_STEPS.insulation[0]) return [0, 0];
  for (const step of ["insulation", "windows", "shading"] as const) {
    const a = stepAmount(t, step);
    if (a >= 1) continue;
    const i = Math.min(N - 1, Math.floor((a / 0.7) * N));
    return [Math.floor(i / BAYS), i % BAYS];
  }
  return [ZONE_FLOORS, BAYS / 2];
}

type GondolaNodes = { rig: THREE.Group; cage: THREE.Group; cables: THREE.Group };

function stepGondola(n: GondolaNodes, t: number, delta: number) {
  const [fi, k] = workSpot(t);
  const y = floorY(Math.min(fi, ZONE_FLOORS)) + 0.02;
  const z = THREE.MathUtils.clamp(bayZ(k), -D / 2 + 0.3, D / 2 - 0.3);
  const kk = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
  if (n.cage.position.y === 0) n.cage.position.y = y;
  n.cage.position.y += (y - n.cage.position.y) * kk;
  n.rig.position.z += (z - n.rig.position.z) * kk;
  const top = TERRACE + 0.09;
  const h = Math.max(0.01, top - n.cage.position.y - 0.1);
  n.cables.scale.y = h;
  n.cables.position.y = top - h / 2;
}

const PANEL = "#c3c7c1";
const FRAME = "#e9eef0";
const BLADE = "#d4dadc";
const GONDOLA = "#c9a24a";
const STEEL = "#8d9aa0";

export function RemodelFacade() {
  const sim = useSim();
  const target = useFocusTarget("gr");
  const group = useRef<THREE.Group>(null);
  const panels = useRef<THREE.InstancedMesh>(null);
  const frames = useRef<THREE.InstancedMesh>(null);
  const glass = useRef<THREE.InstancedMesh>(null);
  const blades = useRef<THREE.InstancedMesh>(null);
  const brackets = useRef<THREE.InstancedMesh>(null);
  const thermal = useRef<THREE.Mesh>(null);
  const rig = useRef<THREE.Group>(null);
  const cage = useRef<THREE.Group>(null);
  const cables = useRef<THREE.Group>(null);
  const last = useRef(-1);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler() }), []);

  const geo = useMemo(() => {
    const wh = FLOOR_H - 0.012 - SILL;
    const ww = BAY - 0.003;
    const bars = [
      new THREE.BoxGeometry(0.014, wh, 0.008).translate(0, 0, ww / 2 - 0.004),
      new THREE.BoxGeometry(0.014, wh, 0.008).translate(0, 0, -ww / 2 + 0.004),
      new THREE.BoxGeometry(0.014, 0.008, ww).translate(0, wh / 2 - 0.004, 0),
      new THREE.BoxGeometry(0.014, 0.008, ww).translate(0, -wh / 2 + 0.004, 0),
      // 위쪽 환기창 가로살
      new THREE.BoxGeometry(0.014, 0.006, ww).translate(0, wh / 2 - 0.06, 0),
    ];
    const plane = new THREE.PlaneGeometry(D, ZONE_FLOORS * FLOOR_H).rotateY(Math.PI / 2);
    return {
      panel: new THREE.BoxGeometry(0.035, 0.17, BAY - 0.003),
      frame: mergeGeometries(bars)!,
      glass: new THREE.BoxGeometry(0.003, wh - 0.012, ww - 0.012).translate(-0.002, 0, 0),
      blade: new THREE.BoxGeometry(BLADE_L, 0.005, BAY - 0.004),
      bracket: new THREE.BoxGeometry(0.075, 0.13, 0.004),
      plane,
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uOn: { value: 0 },
      uScan: { value: 0 },
      uIns: { value: 0 },
      uWin: { value: 0 },
      uStops: { value: THERMAL_STOPS.map((c) => new THREE.Color(c)) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = sim.current;
    const g = group.current;
    if (!g || !panels.current || !frames.current || !glass.current || !blades.current || !brackets.current) return;
    const t = s.remodel;
    g.visible = t > 0;
    if (!g.visible) {
      last.current = -1;
      return;
    }
    if (t !== last.current) {
      last.current = t;
      stepPanels(panels.current, stepAmount(t, "insulation"), tmp);
      stepWindows([frames.current, glass.current], stepAmount(t, "windows"), tmp);
    }
    // 차양 각도는 해를 따라 계속 바뀐다
    stepLouvers(blades.current, brackets.current, stepAmount(t, "shading"), s.sunAlt, tmp);

    if (thermal.current) {
      const u = (thermal.current.material as THREE.ShaderMaterial).uniforms;
      const on = t >= 1 ? 0 : Math.min(1, t / 0.03) * (1 - THREE.MathUtils.smoothstep(t, 0.93, 1));
      thermal.current.visible = on > 0.001;
      u.uOn.value = on;
      u.uScan.value = stepAmount(t, "scan") * 1.05;
      u.uIns.value = stepAmount(t, "insulation");
      u.uWin.value = stepAmount(t, "windows");
    }
    if (rig.current && cage.current && cables.current) {
      rig.current.visible = t < 1;
      if (t < 1) stepGondola({ rig: rig.current, cage: cage.current, cables: cables.current }, t, delta);
      else cage.current.position.y = 0;
    }
  });

  return (
    <group ref={group} visible={false}>
      <group {...target}>
        <instancedMesh ref={panels} args={[geo.panel, undefined, N]} frustumCulled={false} castShadow receiveShadow>
          <meshStandardMaterial color={PANEL} roughness={0.85} />
        </instancedMesh>
        <instancedMesh ref={frames} args={[geo.frame, undefined, N]} frustumCulled={false} castShadow>
          <meshStandardMaterial color={FRAME} metalness={0.4} roughness={0.35} />
        </instancedMesh>
        <instancedMesh ref={glass} args={[geo.glass, undefined, N]} frustumCulled={false}>
          <meshStandardMaterial color="#9fdcec" transparent opacity={0.22} metalness={0.9} roughness={0.05} depthWrite={false} />
        </instancedMesh>
        <instancedMesh ref={blades} args={[geo.blade, undefined, N * BLADES]} frustumCulled={false} castShadow>
          <meshStandardMaterial color={BLADE} metalness={0.6} roughness={0.35} />
        </instancedMesh>
        <instancedMesh ref={brackets} args={[geo.bracket, undefined, ZONE_FLOORS * (BAYS / 2 + 1)]} frustumCulled={false} castShadow>
          <meshStandardMaterial color={BLADE} metalness={0.6} roughness={0.35} />
        </instancedMesh>
      </group>

      {/* 열화상: 외벽 바로 앞 얇은 막 */}
      <mesh ref={thermal} geometry={geo.plane} position={[FACE + 0.105, floorY(0) + (ZONE_FLOORS * FLOOR_H) / 2, 0]} renderOrder={3} visible={false}>
        <shaderMaterial vertexShader={thermalVertex} fragmentShader={thermalFragment} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 곤돌라: 테라스 레일을 따라 옮겨 가는 지붕 크레인에 매달려 오르내린다 */}
      <mesh position={[FACE - 0.04, TERRACE + 0.006, 0]}>
        <boxGeometry args={[0.02, 0.012, D]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={rig}>
        <mesh position={[FACE - 0.04, TERRACE + 0.05, 0]} castShadow>
          <boxGeometry args={[0.02, 0.09, 0.02]} />
          <meshStandardMaterial color={GONDOLA} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[FACE + 0.06, TERRACE + 0.095, 0]} castShadow>
          <boxGeometry args={[0.22, 0.016, 0.02]} />
          <meshStandardMaterial color={GONDOLA} metalness={0.3} roughness={0.5} />
        </mesh>
        {/* 와이어 둘 — 곤돌라 높이에 맞춰 늘어난다 */}
        <group ref={cables}>
          {[-0.27, 0.27].map((z) => (
            <mesh key={z} position={[FACE + 0.16, 0, z]}>
              <boxGeometry args={[0.003, 1, 0.003]} />
              <meshBasicMaterial color="#1f2a2f" />
            </mesh>
          ))}
        </group>
        <group ref={cage}>
          <mesh position={[FACE + 0.16, 0, 0]} castShadow>
            <boxGeometry args={[0.09, 0.012, 0.6]} />
            <meshStandardMaterial color={GONDOLA} metalness={0.3} roughness={0.5} />
          </mesh>
          {/* 난간 */}
          {[
            [FACE + 0.2, 0.05, 0, 0.004, 0.1, 0.6],
            [FACE + 0.16, 0.05, 0.3, 0.09, 0.1, 0.004],
            [FACE + 0.16, 0.05, -0.3, 0.09, 0.1, 0.004],
            [FACE + 0.16, 0.1, 0, 0.09, 0.006, 0.6],
          ].map(([x, y, z, sx, sy, sz], i) => (
            <mesh key={i} position={[x, y, z]}>
              <boxGeometry args={[sx, sy, sz]} />
              <meshStandardMaterial color={GONDOLA} metalness={0.3} roughness={0.5} />
            </mesh>
          ))}
          <Suspense fallback={null}>
            <Workers />
          </Suspense>
        </group>
      </group>
    </group>
  );
}

/** 곤돌라 위 작업자 둘 (Product 지역과 같은 사람 모델, 벽을 본다) */
function Workers() {
  const { nodes } = useGLTF(PROPS_URL);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }), []);
  return (
    <>
      {(["PersonA", "PersonC"] as const).map((n, i) => (
        <mesh key={n} geometry={(nodes[n] as THREE.Mesh).geometry} material={material} position={[FACE + 0.16, 0.006, i ? -0.14 : 0.12]} rotation={[0, -Math.PI / 2, 0]} scale={0.1} castShadow />
      ))}
    </>
  );
}
