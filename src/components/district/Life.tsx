"use client";

/**
 * Product 지역의 생활감 — 걷는 사람, 측량 드론(SolarScope), 전기차 충전 케이블, 바람에 흔들리는 나무, 지나가는 구름 그림자.
 * 모두 장식이라 누를 수 없다. 움직임 줄이기에서는 장면 전체가 멈춰 있으므로 따로 처리하지 않는다.
 */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSim } from "@/components/hero/heroSim";
import { ROAD } from "./districtLayout";
import { PROPS_URL } from "./props";

/* ── 바람에 흔들리는 나무 재질 ────────────────────────────────────── */

type SwayMaterial = THREE.MeshStandardMaterial & { userData: { time: { value: number } } };

/** 나무 모델용: 줄기 위쪽만 바람에 살짝 흔들린다 (나무마다 위상이 다르다) */
export function createSwayMaterial(): SwayMaterial {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0 }) as SwayMaterial;
  const time = { value: 0 };
  mat.userData.time = time;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uTime;").replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec2 swayBase = (modelMatrix * instanceMatrix[3]).xz;
      #else
        vec2 swayBase = modelMatrix[3].xz;
      #endif
      float swayH = max(position.y - 1.1, 0.0);
      float swayPh = swayBase.x * 0.9 + swayBase.y * 1.7;
      transformed.x += sin(uTime * 1.3 + swayPh) * 0.05 * swayH;
      transformed.z += cos(uTime * 1.05 + swayPh) * 0.035 * swayH;`,
    );
  };
  mat.customProgramCacheKey = () => "district-sway";
  return mat;
}

export function tickSway(mat: SwayMaterial, t: number) {
  mat.userData.time.value = t;
}

/* ── 걷는 사람 ────────────────────────────────────────────────────── */

const PERSON_SCALE = 0.14;
const PARK_RING = { x: -7, z: 4.8, rx: 3.07, rz: 2.275 };

type Walker = { kind: "ring"; phase: number; dir: 1 | -1; speed: number } | { kind: "line"; axis: "x" | "z"; at: number; from: number; to: number; phase: number; dir: 1 | -1; speed: number };

const WALKERS: Walker[] = [
  // 공원 산책로
  { kind: "ring", phase: 0, dir: 1, speed: 0.11 },
  { kind: "ring", phase: 0.35, dir: 1, speed: 0.12 },
  { kind: "ring", phase: 1.9, dir: -1, speed: 0.1 },
  { kind: "ring", phase: 2.6, dir: 1, speed: 0.13 },
  { kind: "ring", phase: 4.1, dir: -1, speed: 0.11 },
  { kind: "ring", phase: 5.2, dir: 1, speed: 0.1 },
  // 보도 (횡단보도를 건넌다)
  { kind: "line", axis: "x", at: 1.12, from: -12.6, to: 12.6, phase: 0.1, dir: 1, speed: 0.13 },
  { kind: "line", axis: "x", at: 1.18, from: -12.6, to: 12.6, phase: 0.55, dir: -1, speed: 0.12 },
  { kind: "line", axis: "x", at: -1.34, from: -12.6, to: 12.6, phase: 0.3, dir: -1, speed: 0.13 },
  { kind: "line", axis: "z", at: -1.9, from: -8.6, to: 8.6, phase: 0.7, dir: 1, speed: 0.12 },
  { kind: "line", axis: "z", at: -0.08, from: -8.6, to: 8.6, phase: 0.2, dir: -1, speed: 0.11 },
];

const NODES = ["PersonA", "PersonB", "PersonC"] as const;

function stepWalkers(meshes: (THREE.InstancedMesh | null)[], t: number, tmp: { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; e: THREE.Euler }) {
  const counts = [0, 0, 0];
  WALKERS.forEach((w, i) => {
    let dx: number;
    let dz: number;
    if (w.kind === "ring") {
      const a = w.phase + (w.dir * w.speed * t) / 2.6;
      tmp.p.set(PARK_RING.x + PARK_RING.rx * Math.cos(a), 0.045, PARK_RING.z + PARK_RING.rz * Math.sin(a));
      dx = -PARK_RING.rx * Math.sin(a) * w.dir;
      dz = PARK_RING.rz * Math.cos(a) * w.dir;
    } else {
      const span = w.to - w.from;
      let u = (w.phase + (w.speed * t) / span) % 1;
      if (w.dir < 0) u = 1 - u;
      const v = w.from + u * span;
      // 차도를 건널 때는 노면 높이로
      const onRoad = w.axis === "x" ? Math.abs(v - ROAD.nsX) < ROAD.width / 2 : Math.abs(v - ROAD.ewZ) < ROAD.width / 2;
      const y = onRoad ? 0.03 : 0;
      if (w.axis === "x") tmp.p.set(v, y, w.at);
      else tmp.p.set(w.at, y, v);
      dx = w.axis === "x" ? w.dir : 0;
      dz = w.axis === "z" ? w.dir : 0;
    }
    tmp.p.y += Math.abs(Math.sin(t * 7 + i * 1.3)) * 0.006;
    tmp.q.setFromEuler(tmp.e.set(0, Math.atan2(dx, dz), 0));
    tmp.s.setScalar(PERSON_SCALE);
    const mesh = meshes[i % 3];
    if (mesh) mesh.setMatrixAt(counts[i % 3]++, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  });
  meshes.forEach((m) => m && (m.instanceMatrix.needsUpdate = true));
}

function PedestrianModels() {
  const { nodes } = useGLTF(PROPS_URL);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }), []);
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([null, null, null]);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler() }), []);
  useFrame(({ clock }) => stepWalkers(meshes.current, clock.elapsedTime, tmp));
  return (
    <>
      {NODES.map((n, k) => (
        <instancedMesh
          key={n}
          ref={(m) => {
            meshes.current[k] = m;
          }}
          args={[(nodes[n] as THREE.Mesh).geometry, material, WALKERS.filter((_, i) => i % 3 === k).length]}
          castShadow
          frustumCulled={false}
        />
      ))}
    </>
  );
}

export function Pedestrians() {
  return (
    <Suspense fallback={null}>
      <PedestrianModels />
    </Suspense>
  );
}

/* ── 측량 드론 (SolarScope 후보지 위를 지그재그로) ────────────────── */

function DroneModel({ lot }: { lot: { x: number; z: number; w: number; d: number } }) {
  const { nodes } = useGLTF(PROPS_URL);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.2 }), []);
  const group = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const g = group.current;
    const b = beam.current;
    if (!g || !b) return;
    const t = clock.elapsedTime;
    // x 는 천천히 왕복, z 는 빠르게 왕복 → 잔디 깎듯 훑는다
    const tri = (v: number) => 1 - Math.abs(((v % 2) + 2) % 2 - 1) * 2;
    const x = lot.x + tri(t / 14) * (lot.w / 2 - 0.5);
    const z = lot.z + Math.sin(t * 0.8) * (lot.d / 2 - 0.5);
    const y = 1.0 + Math.sin(t * 2.1) * 0.03;
    g.position.set(x, y, z);
    g.rotation.set(Math.cos(t * 0.8) * 0.12, Math.sin(t * 0.3) * 0.3, 0);
    b.position.set(x, y / 2, z);
    b.scale.set(1, y - 0.05, 1);
  });
  return (
    <>
      <group ref={group}>
        <mesh geometry={(nodes.Drone as THREE.Mesh).geometry} material={material} scale={0.4} castShadow />
      </group>
      {/* 아래로 비추는 측량 빔 */}
      <mesh ref={beam} renderOrder={3}>
        <cylinderGeometry args={[0.02, 0.38, 1, 24, 1, true]} />
        <meshBasicMaterial color="#a8eaf5" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
}

export function SurveyDrone({ lot }: { lot: { x: number; z: number; w: number; d: number } }) {
  return (
    <Suspense fallback={null}>
      <DroneModel lot={lot} />
    </Suspense>
  );
}

/* ── 전기차 충전 케이블 (충전 중이라 빛이 오간다) ──────────────────── */

export function ChargingCables({ cables }: { cables: [number, number, number][][] }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const geometries = useMemo(() => cables.map((pts) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, 0.008, 6)), [cables]);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.6 + 0.6 * Math.sin(clock.elapsedTime * 3);
  });
  return (
    <>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial ref={i === 0 ? mat : undefined} color="#1d2427" emissive="#49B6CA" emissiveIntensity={0.8} roughness={0.5} />
        </mesh>
      ))}
    </>
  );
}

/* ── 구름 그림자 (낮에만, 천천히 지나간다) ────────────────────────── */

function cloudTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  let s = 13;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9; i++) {
    const x = r() * 256;
    const y = r() * 256;
    const rad = 30 + r() * 50;
    // 가장자리가 이어지도록 네 방향으로 같이 그린다
    for (const [ox, oy] of [
      [0, 0],
      [256, 0],
      [-256, 0],
      [0, 256],
      [0, -256],
    ]) {
      const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      grad.addColorStop(0, "rgba(0,0,0,0.9)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function driftClouds(mat: THREE.MeshBasicMaterial, t: number, day: number) {
  if (mat.map) mat.map.offset.set(t * 0.006, t * 0.0025);
  mat.opacity = 0.16 * day;
}

export function CloudShadows({ w, d }: { w: number; d: number }) {
  const sim = useSim();
  const tex = useMemo(() => cloudTexture(), []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) driftClouds(mat.current, clock.elapsedTime, (1 - sim.current.dark) * sim.current.intro);
  });
  return (
    <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[w, d]} />
      <meshBasicMaterial ref={mat} map={tex} color="#000000" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
