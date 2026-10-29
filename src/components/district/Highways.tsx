"use client";

/**
 * 도시를 가로지르는 고가도로 — 지역 뒤 강을 따라 낮은 고가가 흐르고, 높은 고가가 그 위를 엇갈려 지나 강을 건너
 * 지역 동쪽으로 내려온다. 낮은 고가에서는 램프 하나가 땅의 길로 내려온다.
 * 상판(방호벽 · 차선 포함)은 곡선을 따라 한 덩어리로 만들고, 기둥 · 차 · 등은 인스턴싱.
 * 밤에는 방호벽 위 등과 차의 전조등 · 미등이 줄지어 빛난다.
 */

import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { seeded, useSim } from "@/components/hero/heroSim";
import CarFleet, { type CarPose } from "./CarFleet";

const STEP = 0.25;
const GIRDER = 0.14;
const BARRIER = 0.08;

type Pt = [number, number, number];
export type Highway = {
  /** 곡선을 STEP 간격으로 나눈 점 · 옆 방향(왼쪽) */
  pts: THREE.Vector3[];
  side: THREE.Vector3[];
  w: number;
  /** 차선 [옆 거리, 방향] — 방향 +1 은 점 순서대로 */
  lanes: [number, number][];
};

function sample(ctrl: Pt[]) {
  const curve = new THREE.CatmullRomCurve3(
    ctrl.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
  );
  const pts = curve.getSpacedPoints(Math.max(2, Math.round(curve.getLength() / STEP)));
  const side = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    return new THREE.Vector3(b.z - a.z, 0, -(b.x - a.x)).normalize();
  });
  return { pts, side };
}

/**
 * 고가 배치. groundY: 도시 바닥 높이, rampX: 램프가 내려앉을 남북 도로의 x
 */
export function highwayPlan(groundY: number, rampX: number): Highway[] {
  const y = (h: number) => groundY + h;
  const low: Pt[] = [
    [-96, y(1.0), -29],
    [-62, y(1.0), -27],
    [-36, y(1.05), -23.5],
    [-15, y(1.0), -25.5],
    [6, y(1.0), -28],
    [26, y(1.0), -27.5],
    [46, y(1.0), -31],
    [72, y(1.0), -37],
  ];
  const high: Pt[] = [
    [-42, y(1.8), -92],
    [-28, y(1.8), -60],
    [-14, y(1.8), -40],
    [-2, y(1.8), -27],
    [12, y(1.75), -18],
    [21, y(1.7), -8],
    [25, y(1.65), 6],
    [27, y(1.6), 25],
    [31, y(1.6), 58],
  ];
  const lowCurve = sample(low);
  // 램프: 낮은 고가에서 갈라져 남북 도로 위로 내려앉는다
  const from = lowCurve.pts.reduce((best, p) => (Math.abs(p.x - (rampX - 9)) < Math.abs(best.x - (rampX - 9)) ? p : best));
  const ramp: Pt[] = [
    [from.x, from.y, from.z],
    [rampX - 4, y(0.95), from.z + 2.2],
    [rampX - 0.6, y(0.7), from.z + 7],
    [rampX, y(0.3), from.z + 12],
    [rampX, y(0.02), from.z + 16],
  ];
  return [
    { ...lowCurve, w: 1.5, lanes: [[-0.52, 1], [-0.2, 1], [0.2, -1], [0.52, -1]] },
    { ...sample(high), w: 1.5, lanes: [[-0.52, 1], [-0.2, 1], [0.2, -1], [0.52, -1]] },
    { ...sample(ramp), w: 0.8, lanes: [[0, -1]] },
  ];
}

/** 건물 · 나무를 비켜 놓을 고가 발자국 (1 unit 간격 점 · 반폭) */
export function highwayFootprint(hws: Highway[]) {
  const out: { x: number; z: number; r: number }[] = [];
  for (const h of hws) for (let i = 0; i < h.pts.length; i += 4) out.push({ x: h.pts[i].x, z: h.pts[i].z, r: h.w / 2 + 0.5 });
  return out;
}

/* ── 상판: 거더 · 방호벽 · 아스팔트 · 차선 ────────────────────────── */

const C = {
  side: new THREE.Color("#5f6c73"),
  barrier: new THREE.Color("#8c989e"),
  deck: new THREE.Color("#1d2529"),
  under: new THREE.Color("#3a454b"),
  white: new THREE.Color("#b9c3c7"),
  yellow: new THREE.Color("#c99a3c"),
};

function deckGeometry(h: Highway) {
  const half = h.w / 2;
  const inset = 0.05;
  // 단면 (옆 거리, 높이) — 왼쪽 바깥 아래부터 시계 방향
  const profile: [number, number][] = [
    [-half, -GIRDER],
    [-half, BARRIER],
    [-half + inset, BARRIER],
    [-half + inset, 0],
    [half - inset, 0],
    [half - inset, BARRIER],
    [half, BARRIER],
    [half, -GIRDER],
  ];
  const colors = [C.side, C.barrier, C.barrier, C.deck, C.barrier, C.barrier, C.side, C.under];
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const at = (i: number, lat: number, up: number) => {
    const p = h.pts[i];
    const s = h.side[i];
    return [p.x + s.x * lat, p.y + up, p.z + s.z * lat];
  };
  // 띠 하나: 단면의 두 점 a → b 를 곡선 따라 (from ~ to 구간만)
  const strip = (a: [number, number], b: [number, number], c: THREE.Color, from = 0, to = h.pts.length - 1) => {
    const base = pos.length / 3;
    for (let i = from; i <= to; i++) {
      pos.push(...at(i, a[0], a[1]), ...at(i, b[0], b[1]));
      col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      if (i > from) {
        const k = base + (i - from) * 2;
        idx.push(k - 2, k - 1, k, k - 1, k + 1, k);
      }
    }
  };
  for (let k = 0; k < profile.length; k++) strip(profile[k], profile[(k + 1) % profile.length], colors[k]);
  // 노면 표시: 가운데 노란 실선, 차선 사이 흰 점선 (램프는 가장자리 선만)
  const mark = 0.004;
  if (h.lanes.length > 1) {
    strip([-0.02, mark], [0.02, mark], C.yellow);
    for (const lat of [-0.36, 0.36])
      for (let i = 0; i < h.pts.length - 2; i += 4) strip([lat - 0.012, mark], [lat + 0.012, mark], C.white, i, i + 2);
  }
  for (const lat of [-half + inset + 0.05, half - inset - 0.05]) strip([lat - 0.01, mark], [lat + 0.01, mark], C.white);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ── 기둥 (교각 둘 + 머리 보) ─────────────────────────────────────── */

function pierMatrices(hws: Highway[], groundY: number, avoid: (x: number, z: number) => boolean) {
  const columns: THREE.Matrix4[] = [];
  const caps: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  for (const h of hws) {
    let last = -99;
    for (let i = 6; i < h.pts.length - 6; i++) {
      const p = h.pts[i];
      const s = h.side[i];
      const tall = p.y - GIRDER - groundY;
      if (tall < 0.35 || i - last < 14) continue; // 3.5 unit 간격, 땅에 닿은 곳은 없다
      if (avoid(p.x, p.z)) continue; // 길 한가운데에는 세우지 않는다
      last = i;
      const yaw = Math.atan2(-s.z, s.x);
      q.setFromAxisAngle(up, yaw);
      for (const lat of h.w > 1 ? [-h.w * 0.27, h.w * 0.27] : [0])
        columns.push(new THREE.Matrix4().compose(new THREE.Vector3(p.x + s.x * lat, groundY, p.z + s.z * lat), q, new THREE.Vector3(1, tall, 1)));
      caps.push(new THREE.Matrix4().compose(new THREE.Vector3(p.x, p.y - GIRDER - 0.06, p.z), q, new THREE.Vector3(h.w * 0.85, 1, 1)));
    }
  }
  return { columns, caps };
}

function Piers({ hws, groundY, avoid }: { hws: Highway[]; groundY: number; avoid: (x: number, z: number) => boolean }) {
  const { columns, caps } = useMemo(() => pierMatrices(hws, groundY, avoid), [hws, groundY, avoid]);
  const colGeo = useMemo(() => new THREE.CylinderGeometry(0.11, 0.13, 1, 10).translate(0, 0.5, 0), []);
  const init = (mesh: THREE.InstancedMesh | null, list: THREE.Matrix4[]) => {
    if (!mesh) return;
    list.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return (
    <>
      <instancedMesh ref={(m) => init(m, columns)} args={[colGeo, undefined, columns.length]} receiveShadow>
        <meshStandardMaterial color="#6d7a81" roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={(m) => init(m, caps)} args={[undefined, undefined, caps.length]}>
        <boxGeometry args={[1, 0.12, 0.26]} />
        <meshStandardMaterial color="#5c686f" roughness={0.85} />
      </instancedMesh>
    </>
  );
}

/* ── 방호벽 위 등 ─────────────────────────────────────────────────── */

const LAMP = new THREE.Color("#ffc98a");

function tickLights(mat: THREE.MeshBasicMaterial, dark: number) {
  mat.color.copy(LAMP).multiplyScalar(0.1 + THREE.MathUtils.smoothstep(dark, 0.3, 0.55) * 1.8);
}

function RailLights({ hws }: { hws: Highway[] }) {
  const sim = useSim();
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: LAMP.clone(), toneMapped: false }), []);
  useFrame(() => tickLights(mat, sim.current.dark));
  const spots = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (const h of hws)
      for (let i = 4; i < h.pts.length; i += 10)
        for (const sd of [-1, 1]) {
          const p = h.pts[i];
          const s = h.side[i];
          out.push(new THREE.Vector3(p.x + s.x * sd * (h.w / 2 - 0.02), p.y + 0.32, p.z + s.z * sd * (h.w / 2 - 0.02)));
        }
    return out;
  }, [hws]);
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        const m = new THREE.Matrix4();
        spots.forEach((p, i) => mesh.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z)));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[undefined, mat, spots.length]}
    >
      <boxGeometry args={[0.06, 0.025, 0.06]} />
    </instancedMesh>
  );
}

/* ── 고가 위 차 (지역과 같은 차 모델 — CarFleet) ────────────────── */

type HwCar = { h: Highway; lat: number; dir: number; offset: number; speed: number };

function highwayCars(hws: Highway[]): HwCar[] {
  const rand = seeded(17);
  const cars: HwCar[] = [];
  for (const h of hws) {
    const len = h.pts.length * STEP;
    for (const [lat, dir] of h.lanes) {
      const n = Math.round((len / 3.2) * (0.7 + rand() * 0.5));
      for (let k = 0; k < n; k++) cars.push({ h, lat, dir, offset: (k + rand() * 0.7) / n, speed: 1.3 + rand() * 0.6 });
    }
  }
  return cars;
}

/** 곡선 위 자리 · 방향 */
function hwPose(car: HwCar, t: number, out: CarPose) {
  const pts = car.h.pts;
  const n = pts.length - 1;
  let u = ((t * car.speed) / (n * STEP) + car.offset) % 1;
  if (car.dir < 0) u = 1 - u;
  const fi = u * n;
  const k = Math.min(n - 1, Math.floor(fi));
  const a = fi - k;
  const p0 = pts[k];
  const p1 = pts[k + 1];
  const side = car.h.side[k];
  let fx = (p1.x - p0.x) * car.dir;
  let fz = (p1.z - p0.z) * car.dir;
  const l = Math.hypot(fx, fz) || 1;
  fx /= l;
  fz /= l;
  out.x = p0.x + (p1.x - p0.x) * a + side.x * car.lat;
  out.z = p0.z + (p1.z - p0.z) * a + side.z * car.lat;
  out.y = p0.y + (p1.y - p0.y) * a;
  out.fx = fx;
  out.fz = fz;
}

function HighwayTraffic({ hws }: { hws: Highway[] }) {
  const cars = useMemo(() => highwayCars(hws), [hws]);
  const pose = useCallback((i: number, t: number, out: CarPose) => hwPose(cars[i], t, out), [cars]);
  return <CarFleet count={cars.length} seed={2} pose={pose} />;
}

/* ── 전체 ─────────────────────────────────────────────────────────── */

export default function Highways({ hws, groundY, avoid }: { hws: Highway[]; groundY: number; avoid: (x: number, z: number) => boolean }) {
  const decks = useMemo(() => hws.map(deckGeometry), [hws]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide }), []);
  return (
    <group>
      {decks.map((g, i) => (
        <mesh key={i} geometry={g} material={material} receiveShadow />
      ))}
      <Piers hws={hws} groundY={groundY} avoid={avoid} />
      <RailLights hws={hws} />
      <HighwayTraffic hws={hws} />
    </group>
  );
}
