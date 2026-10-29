"use client";

/**
 * 히어로 대지의 생활감 — 로비를 드나드는 사람들 (Product 지역과 같은 사람 모델).
 * 로비 문에서 나타나 광장을 지나 대지 끝으로 걸어가고(또는 그 반대), 양 끝에서는 문 안 · 무대 밖으로 사라진다.
 * 장식이라 누를 수 없다. 모델을 받기 전에는 아무것도 그리지 않는다.
 */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { PROPS_URL } from "@/components/district/props";
import { EQUIPMENT, SITE, SITE_TOP } from "./BuildingModel";
import { footprint, reveal, useSim } from "./heroSim";

const PERSON_SCALE = 0.12;
const LOBBY_Z = footprint(0)[1] / 2 + 0.06;
const EDGE_Z = SITE[1] / 2 - 0.08;
const EDGE_X = SITE[0] / 2 - 0.12;

type V2 = [number, number];
/** 걷는 길 (점 순서대로) · 출발 시점 · 속도(unit/s) · 방향(-1 이면 거꾸로 = 들어간다) */
type Walker = { path: V2[]; phase: number; speed: number; dir: 1 | -1 };

// 캐노피(x 0.4) 아래 로비 문에서 앞 광장 · 옆길로
const OUT_EAST: V2[] = [
  [0.45, LOBBY_Z],
  [0.45, 1.6],
  [EDGE_X - 0.2, 1.6],
  [EDGE_X - 0.2, -0.8],
];
const OUT_FRONT: V2[] = [
  [0.3, LOBBY_Z],
  [0.15, EDGE_Z],
];
const OUT_WEST: V2[] = [
  [0.35, LOBBY_Z],
  [0.2, 1.72],
  [-1.2, 1.72],
];
const FRONT_WALK: V2[] = [
  [-1.3, EDGE_Z - 0.05],
  [EDGE_X, EDGE_Z - 0.05],
];

const WALKERS: Walker[] = [
  { path: OUT_EAST, phase: 0, speed: 0.11, dir: 1 },
  { path: OUT_EAST, phase: 0.55, speed: 0.1, dir: -1 },
  { path: OUT_FRONT, phase: 0.2, speed: 0.09, dir: 1 },
  { path: OUT_FRONT, phase: 0.7, speed: 0.1, dir: -1 },
  { path: OUT_WEST, phase: 0.35, speed: 0.1, dir: 1 },
  { path: OUT_WEST, phase: 0.85, speed: 0.11, dir: -1 },
  { path: FRONT_WALK, phase: 0.1, speed: 0.12, dir: 1 },
  { path: FRONT_WALK, phase: 0.6, speed: 0.11, dir: -1 },
];

const NODES = ["PersonA", "PersonB", "PersonC"] as const;

type Prepared = { pts: V2[]; lens: number[]; total: number };
function prepare(path: V2[]): Prepared {
  const lens = [0];
  for (let i = 1; i < path.length; i++) lens.push(lens[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  return { pts: path, lens, total: lens[lens.length - 1] };
}

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; e: THREE.Euler };

function stepPeople(meshes: (THREE.InstancedMesh | null)[], walkers: (Walker & { prep: Prepared })[], t: number, show: number, tmp: Tmp) {
  const counts = [0, 0, 0];
  walkers.forEach((w, i) => {
    const { pts, lens, total } = w.prep;
    // 한 번 걷고 잠깐 쉰 뒤(사라진 채로) 다시 — 길이에 맞춰 주기를 잡는다
    const cycle = total / w.speed + 3;
    let u = ((t + w.phase * cycle) % cycle) / (total / w.speed);
    const visible = u <= 1;
    u = Math.min(u, 1);
    if (w.dir < 0) u = 1 - u;
    const d = u * total;
    let k = 1;
    while (k < lens.length - 1 && lens[k] < d) k++;
    const seg = lens[k] - lens[k - 1] || 1;
    const a = (d - lens[k - 1]) / seg;
    const [x0, z0] = pts[k - 1];
    const [x1, z1] = pts[k];
    tmp.p.set(x0 + (x1 - x0) * a, SITE_TOP + Math.abs(Math.sin(t * 7 + i * 1.3)) * 0.004, z0 + (z1 - z0) * a);
    tmp.q.setFromEuler(tmp.e.set(0, Math.atan2((x1 - x0) * w.dir, (z1 - z0) * w.dir), 0));
    // 길 양 끝(로비 문 · 무대 끝)에서는 작아지며 사라진다
    const fade = Math.min(1, Math.min(d, total - d) / 0.12);
    tmp.s.setScalar(PERSON_SCALE * (visible ? fade : 0) * show + 1e-5);
    const mesh = meshes[i % 3];
    if (mesh) mesh.setMatrixAt(counts[i % 3]++, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  });
  meshes.forEach((m) => m && (m.instanceMatrix.needsUpdate = true));
}

function PeopleModels() {
  const sim = useSim();
  const { nodes } = useGLTF(PROPS_URL);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }), []);
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([null, null, null]);
  const walkers = useMemo(() => WALKERS.map((w) => ({ ...w, prep: prepare(w.path) })), []);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler() }), []);
  useFrame(({ clock }) => stepPeople(meshes.current, walkers, clock.elapsedTime, reveal(sim.current.intro, EQUIPMENT[0], EQUIPMENT[1]), tmp));
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

export function HeroPeople() {
  return (
    <Suspense fallback={null}>
      <PeopleModels />
    </Suspense>
  );
}
