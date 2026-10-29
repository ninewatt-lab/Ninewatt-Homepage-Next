"use client";

/**
 * 도시 · 고가를 달리는 많은 차 — 지역의 차와 같은 Blender 모델(Car)과 색을 쓴다.
 * 차가 수백 대라 지역 가까이(화면에 크게 보이는 곳)만 모델로 그리고, 안개 속 먼 차는 차체 + 지붕만 있는
 * 가벼운 차로 그린다(매 프레임 거리에 따라 나눠 담는다). 전조등 · 미등은 모두에게 붙는다.
 */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useSim } from "@/components/hero/heroSim";
import { useModelMaterial } from "@/components/hero/models";
import { CAR_COLORS, PROPS_URL } from "./props";

/** 지역과 같은 크기 (모델 m × 0.13) */
const CAR_SCALE = 0.13;
const HALF = 2.2 * CAR_SCALE;
/** 지역 중심에서 이 거리 안의 차만 모델로 */
const NEAR = 30;

/** 차의 위치 · 진행 방향(xz 단위 벡터) — pose 가 매 프레임 채운다 */
export type CarPose = { x: number; y: number; z: number; fx: number; fz: number };

const HEAD = new THREE.Color("#fff3da");
const TAIL = new THREE.Color("#ff3a2c");

/** 먼 차: 차체 + 지붕(어두운 유리) — 모델과 같은 m 단위, +x 가 앞 */
function lowCarGeometry() {
  const paint = (g: THREE.BufferGeometry, c: THREE.Color) => {
    const n = g.attributes.position.count;
    g.setAttribute("color", new THREE.Float32BufferAttribute(Array.from({ length: n }, () => [c.r, c.g, c.b]).flat(), 3));
    return g;
  };
  const body = paint(new THREE.BoxGeometry(4.4, 0.75, 1.78).translate(0, 0.62, 0), new THREE.Color("#e9edef"));
  const cabin = paint(new THREE.BoxGeometry(2.3, 0.55, 1.58).translate(-0.25, 1.27, 0), new THREE.Color("#3a4448"));
  return mergeGeometries([body, cabin])!;
}

/** y 축으로만 돌린 행렬 (c, s = 진행 방향) */
function put(arr: Float32Array, i: number, x: number, y: number, z: number, c: number, s: number, sx: number, sy: number, sz: number) {
  const o = i * 16;
  arr.fill(0, o, o + 16);
  arr[o] = c * sx;
  arr[o + 2] = -s * sx;
  arr[o + 5] = sy;
  arr[o + 8] = s * sz;
  arr[o + 10] = c * sz;
  arr[o + 12] = x;
  arr[o + 13] = y;
  arr[o + 14] = z;
  arr[o + 15] = 1;
}

type Meshes = { near: THREE.InstancedMesh | null; far: THREE.InstancedMesh; head: THREE.InstancedMesh; tail: THREE.InstancedMesh };

function stepFleet(m: Meshes, count: number, colors: THREE.Color[], t: number, pose: (i: number, t: number, out: CarPose) => void, p: CarPose) {
  const far = m.far.instanceMatrix.array as Float32Array;
  const farC = m.far.instanceColor!.array as Float32Array;
  const near = m.near ? (m.near.instanceMatrix.array as Float32Array) : null;
  const nearC = m.near?.instanceColor ? (m.near.instanceColor.array as Float32Array) : null;
  const hd = m.head.instanceMatrix.array as Float32Array;
  const tl = m.tail.instanceMatrix.array as Float32Array;
  let n = 0;
  let f = 0;
  for (let i = 0; i < count; i++) {
    pose(i, t, p);
    const c = p.fx;
    const s = -p.fz;
    const col = colors[i];
    // 모델을 받기 전에는 모두 가벼운 차로
    if (near && nearC && p.x * p.x + p.z * p.z < NEAR * NEAR) {
      put(near, n, p.x, p.y, p.z, c, s, CAR_SCALE, CAR_SCALE, CAR_SCALE);
      nearC.set([col.r, col.g, col.b], n * 3);
      n++;
    } else {
      put(far, f, p.x, p.y, p.z, c, s, CAR_SCALE, CAR_SCALE, CAR_SCALE);
      farC.set([col.r, col.g, col.b], f * 3);
      f++;
    }
    put(hd, i, p.x + p.fx * HALF, p.y + 0.085, p.z + p.fz * HALF, c, s, 0.02, 0.025, 0.17);
    put(tl, i, p.x - p.fx * HALF, p.y + 0.1, p.z - p.fz * HALF, c, s, 0.02, 0.025, 0.17);
  }
  m.far.count = f;
  m.far.instanceMatrix.needsUpdate = true;
  m.far.instanceColor!.needsUpdate = true;
  if (m.near) {
    m.near.count = n;
    m.near.instanceMatrix.needsUpdate = true;
    if (m.near.instanceColor) m.near.instanceColor.needsUpdate = true;
  }
  m.head.instanceMatrix.needsUpdate = true;
  m.tail.instanceMatrix.needsUpdate = true;
}

function tickLights(head: THREE.MeshBasicMaterial, tail: THREE.MeshBasicMaterial, dark: number) {
  head.color.copy(HEAD).multiplyScalar(0.2 + dark * 2.2);
  tail.color.copy(TAIL).multiplyScalar(0.15 + dark * 1.6);
}

/** 색 버퍼를 미리 만든다 (setColorAt 이 처음 불릴 때 생긴다) */
function prepare(mesh: THREE.InstancedMesh, count: number) {
  for (let i = 0; i < count; i++) mesh.setColorAt(i, CAR_COLORS[0]);
  mesh.count = 0;
}

function NearCars({ count, onMesh }: { count: number; onMesh: (m: THREE.InstancedMesh | null) => void }) {
  const { nodes } = useGLTF(PROPS_URL);
  const geometry = (nodes.Car as THREE.Mesh).geometry;
  const material = useModelMaterial(0.35, 0.35);
  return (
    <instancedMesh
      ref={(mesh) => {
        if (mesh) prepare(mesh, count);
        onMesh(mesh);
      }}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}

export default function CarFleet({ count, seed = 0, pose }: { count: number; seed?: number; pose: (i: number, t: number, out: CarPose) => void }) {
  const sim = useSim();
  const meshes = useRef<Meshes | null>(null);
  const nearMesh = useRef<THREE.InstancedMesh | null>(null);
  const farRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const tailRef = useRef<THREE.InstancedMesh>(null);
  const colors = useMemo(() => Array.from({ length: count }, (_, i) => CAR_COLORS[(i * 3 + seed) % CAR_COLORS.length]), [count, seed]);
  const lowGeo = useMemo(() => lowCarGeometry(), []);
  const lowMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.3 }), []);
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const lights = useMemo(
    () => ({ head: new THREE.MeshBasicMaterial({ color: HEAD.clone(), toneMapped: false }), tail: new THREE.MeshBasicMaterial({ color: TAIL.clone(), toneMapped: false }) }),
    [],
  );
  const pt = useMemo<CarPose>(() => ({ x: 0, y: 0, z: 0, fx: 1, fz: 0 }), []);
  useFrame(({ clock }) => {
    if (!farRef.current || !headRef.current || !tailRef.current) return;
    if (!meshes.current) meshes.current = { near: null, far: farRef.current, head: headRef.current, tail: tailRef.current };
    meshes.current.near = nearMesh.current;
    tickLights(lights.head, lights.tail, sim.current.dark);
    stepFleet(meshes.current, count, colors, clock.elapsedTime, pose, pt);
  });
  return (
    <>
      <Suspense fallback={null}>
        <NearCars count={count} onMesh={(m) => (nearMesh.current = m)} />
      </Suspense>
      <instancedMesh
        ref={(mesh) => {
          farRef.current = mesh;
          if (mesh) prepare(mesh, count);
        }}
        args={[lowGeo, lowMat, count]}
        frustumCulled={false}
      />
      <instancedMesh ref={headRef} args={[box, lights.head, count]} frustumCulled={false} />
      <instancedMesh ref={tailRef} args={[box, lights.tail, count]} frustumCulled={false} />
    </>
  );
}
