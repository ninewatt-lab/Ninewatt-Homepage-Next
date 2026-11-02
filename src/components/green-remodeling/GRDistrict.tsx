"use client";

/**
 * 그린리모델링 지역 — Product 페이지와 같은 땅(지역 판 26 × 18 · 교차로 · 강 · 고가 · 둘레 도시) 위에 예시 건물 4채.
 * 동서 · 남북 도로가 판을 네 블록으로 나누고, 블록마다 건물 하나와 그 쓰임에 맞는 마당을 둔다.
 *  북서: 업무 빌딩(운영) · 앞 광장        북동: 도서관(지붕 · 신재생) · 열람 정원
 *  남서: 어린이집(외피) · 놀이 마당       남동: 주민센터(설비) · 주차장
 * 블록 가장자리에는 Product 지역의 주변 건물 모델을 몇 채 두어 동네처럼 보이게 한다.
 */

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import CityContext from "@/components/district/CityContext";
import { Building, Instances, facadeTextures, m4 } from "@/components/district/common";
import { PLATE } from "@/components/district/districtLayout";
import { Ground, RoadLamps, Traffic } from "@/components/district/Facilities";
import { CloudShadows, createSwayMaterial, tickSway } from "@/components/district/Life";
import { BuildingModel, CAR_COLORS, Props } from "@/components/district/props";
import { ContactShadows, Roads, StreetTrees, grassTexture } from "@/components/district/Streetscape";
import { useModelGeometry } from "@/components/hero/models";
import { PV_PEAK_KW } from "@/components/hero/heroSim";
import { pavingTexture, pvTexture } from "@/components/hero/textures";
import { GR_SPECS, easeOut, phaseAt, piece, useGrSim } from "./grModel";

const Y = 0.04; // 블록 바닥(보도 · 마당) 높이 — 도로(0.03)보다 조금 높다
const CAR = 0.13;
const BENCH = 0.24;

type Rect = { x: number; z: number; w: number; d: number };

/** 마당 (잔디 · 밝은 포장) */
function Lawn({ r, tex, color, y = Y }: { r: Rect; tex: THREE.Texture; color?: string; y?: number }) {
  return (
    <mesh position={[r.x, y, r.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[r.w, r.d]} />
      <meshStandardMaterial map={tex} color={color} roughness={0.95} />
    </mesh>
  );
}

/** 낮은 울타리 · 생울타리 (사각형 둘레, gaps: 비울 변) */
function Edge({ r, h, t, color, skip = [] }: { r: Rect; h: number; t: number; color: string; skip?: ("n" | "s" | "e" | "w")[] }) {
  const sides = [
    ["n", r.x, r.z - r.d / 2, r.w, t],
    ["s", r.x, r.z + r.d / 2, r.w, t],
    ["e", r.x + r.w / 2, r.z, t, r.d],
    ["w", r.x - r.w / 2, r.z, t, r.d],
  ] as const;
  return (
    <>
      {sides
        .filter(([k]) => !skip.includes(k))
        .map(([k, x, z, w, d]) => (
          <mesh key={k} position={[x, Y + h / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={color} roughness={0.9} />
          </mesh>
        ))}
    </>
  );
}

/* ── 나무 (홈 히어로 조경수, 바람에 흔들린다) ──────────────────────── */

const TREES: [number, number, number][] = [
  // 북서 광장
  [-8.6, -2.2, 1],
  [-4.1, -2.2, 0.95],
  [-3.2, -6.9, 1.05],
  [-8.8, -7.6, 0.9],
  // 북동 정원
  [2.4, -2.0, 1],
  [3.9, -1.9, 0.9],
  [9.3, -2.2, 1.05],
  [1.4, -7.4, 0.95],
  [10.4, -7.8, 0.9],
  // 남서 놀이 마당
  [-11.9, 2.4, 1],
  [-12.1, 5.2, 0.9],
  [-9.8, 8.0, 1.05],
  [-2.8, 2.3, 0.95],
  [-3.0, 8.0, 0.9],
  // 남동
  [1.2, 2.4, 1],
  [1.0, 7.9, 0.95],
  [7.2, 2.2, 0.9],
  [12.3, 8.0, 1],
];

function TreeModels() {
  const a = useModelGeometry("TreeA");
  const b = useModelGeometry("TreeB");
  const material = useMemo(() => createSwayMaterial(), []);
  useFrame(({ clock }) => tickSway(material, clock.elapsedTime));
  const list = useMemo(() => [TREES.filter((_, i) => i % 3 !== 1), TREES.filter((_, i) => i % 3 === 1)], []);
  return (
    <>
      {[a, b].map((g, k) => (
        <instancedMesh
          key={k}
          ref={(mesh) => {
            if (!mesh) return;
            list[k].forEach(([x, z, s], i) => mesh.setMatrixAt(i, m4(x, Y, z, i * 1.3, 0.16 * s, 0.16 * s, 0.16 * s)));
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
          }}
          args={[g, material, list[k].length]}
          castShadow
          receiveShadow
        />
      ))}
    </>
  );
}

/* ── 주차장 (남동) ────────────────────────────────────────────────── */

const LOT: Rect = { x: 9.9, z: 4.7, w: 5.4, d: 4.4 };
const LOT_ROWS = [LOT.z - 1.35, LOT.z + 1.35];

/**
 * 주차장 카포트 태양광 (Product 지역 주차장과 같은 골조 · 패널 크기) — 줄마다 바깥쪽 기둥 4개 · 거더 · 외팔보 위에
 * 주차면마다 모듈 두 장(32장, energy.py 의 13.8 kW 와 같다). 주민센터 시공 마지막 단계에 위에서 하나씩 내려앉고,
 * 해가 높을수록 빛난다. 골조 · 전기차 충전기는 처음부터 있다.
 */
const STALLS = 8;
const stallX = (k: number) => LOT.x - 2.1 + k * 0.6;
const CARPORT = (() => {
  const posts: THREE.Matrix4[] = [];
  const girders: THREE.Matrix4[] = [];
  const arms: THREE.Matrix4[] = [];
  const panels: THREE.Matrix4[] = [];
  const chargers: THREE.Matrix4[] = [];
  const screens: THREE.Matrix4[] = [];
  const span = (STALLS - 1) * 0.6 + 0.6;
  for (const row of LOT_ROWS) {
    // 기둥은 통로 반대쪽(차 뒤)에 세운다
    const back = row < LOT.z ? -1 : 1;
    const pz = row + back * 0.3;
    for (let k = 0; k < 4; k++) {
      const x = stallX(0) + 0.3 + k * ((span - 1.2) / 3);
      posts.push(m4(x, Y + 0.38, pz, 0));
      arms.push(m4(x, Y + 0.79, pz - back * 0.33, 0, 1, 1, 0.8 / 0.05, 0.18));
    }
    girders.push(m4(LOT.x - 0.0, Y + 0.77, pz, 0, span / 0.05, 1, 1));
    for (let k = 0; k < STALLS; k++) for (const dz of [-0.3, 0.05]) panels.push(m4(stallX(k), Y + 0.8 + (dz > 0 ? 0.05 : 0), row + dz, 0, 1.15, 1, 1.1, 0.18));
    for (const k of [1, 5]) {
      chargers.push(m4(stallX(k) + 0.3, Y + 0.13, pz, 0));
      screens.push(m4(stallX(k) + 0.3, Y + 0.19, pz - back * 0.028, 0));
    }
  }
  return { posts, girders, arms, panels, chargers, screens };
})();

function glowPanels(m: THREE.MeshStandardMaterial, solarKw: number) {
  m.emissiveIntensity = 0.06 + (solarKw / PV_PEAK_KW) * 0.55;
}

const PANEL_TMP = { m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() };

/** 시공 단계 진행(0~1)만큼 패널이 순서대로 내려앉는다 */
function placePanels(mesh: THREE.InstancedMesh, phase: number) {
  const t = PANEL_TMP;
  CARPORT.panels.forEach((m, i) => {
    m.decompose(t.p, t.q, t.s);
    const e = easeOut(piece(phase, i / CARPORT.panels.length));
    t.p.y += (1 - e) * 0.6;
    if (e <= 0) t.s.setScalar(1e-4);
    mesh.setMatrixAt(i, t.m.compose(t.p, t.q, t.s));
  });
  mesh.instanceMatrix.needsUpdate = true;
}

function Carport() {
  const sim = useGrSim();
  const tex = useMemo(() => pvTexture(), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissive: "#49B6CA", emissiveMap: tex, metalness: 0.45, roughness: 0.3 }), [tex]);
  const panels = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  useFrame(() => {
    glowPanels(mat, sim.current.solarKw);
    const phase = phaseAt("systems", sim.current.progress.systems).steps[3] ?? 1;
    if (panels.current && phase !== last.current) {
      last.current = phase;
      placePanels(panels.current, phase);
    }
  });
  return (
    <group>
      <Instances matrices={CARPORT.posts}>
        <boxGeometry args={[0.05, 0.76, 0.05]} />
        <meshStandardMaterial color="#c4ccd0" metalness={0.6} roughness={0.35} />
      </Instances>
      <Instances matrices={CARPORT.girders}>
        <boxGeometry args={[0.05, 0.06, 0.07]} />
        <meshStandardMaterial color="#aab4b8" metalness={0.6} roughness={0.35} />
      </Instances>
      <Instances matrices={CARPORT.arms}>
        <boxGeometry args={[0.035, 0.04, 0.05]} />
        <meshStandardMaterial color="#aab4b8" metalness={0.6} roughness={0.35} />
      </Instances>
      <instancedMesh
        ref={panels}
        args={[undefined, mat, CARPORT.panels.length]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.5, 0.025, 0.32]} />
      </instancedMesh>
      <Instances matrices={CARPORT.chargers}>
        <boxGeometry args={[0.08, 0.26, 0.05]} />
        <meshStandardMaterial color="#e9eef0" roughness={0.4} />
      </Instances>
      <Instances matrices={CARPORT.screens} cast={false}>
        <boxGeometry args={[0.05, 0.05, 0.005]} />
        <meshBasicMaterial color="#5fd3e6" toneMapped={false} />
      </Instances>
    </group>
  );
}

function ParkingLot() {
  const asphalt = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#2a3236";
    g.fillRect(0, 0, 64, 64);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 300; i++) {
      const v = Math.round(38 + rnd() * 18);
      g.fillStyle = `rgb(${v},${v + 6},${v + 9})`;
      g.fillRect(rnd() * 64, rnd() * 64, 1, 1);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(LOT.w, LOT.d);
    return t;
  }, []);
  const lines = useMemo(() => LOT_ROWS.flatMap((z) => Array.from({ length: 9 }, (_, k) => m4(LOT.x - 2.4 + k * 0.6, Y + 0.004, z, 0, 1, 1, 1))), []);
  const cars = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    const shadows: [number, number, number, number, number][] = [];
    [0, 1, 3, 4, 6, 9, 10, 12, 13, 15].forEach((i) => {
      const row = i < 8 ? LOT_ROWS[0] : LOT_ROWS[1];
      const k = i % 8;
      list.push(m4(LOT.x - 2.1 + k * 0.6, Y + 0.002, row, row < LOT.z ? -Math.PI / 2 : Math.PI / 2, CAR, CAR, CAR));
      colors.push(CAR_COLORS[(i * 3) % CAR_COLORS.length]);
      shadows.push([LOT.x - 2.1 + k * 0.6, row, 0.3, 0.66, Y + 0.003]);
    });
    return { list, colors, shadows };
  }, []);
  return (
    <group>
      <mesh position={[LOT.x, Y + 0.001, LOT.z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LOT.w, LOT.d]} />
        <meshStandardMaterial map={asphalt} roughness={0.95} />
      </mesh>
      <Instances matrices={lines} cast={false}>
        <boxGeometry args={[0.025, 0.003, 1.0]} />
        <meshStandardMaterial color="#d9dcd6" roughness={0.6} />
      </Instances>
      <ContactShadows spots={cars.shadows} opacity={0.6} />
      <Props node="Car" matrices={cars.list} colors={cars.colors} metalness={0.35} roughness={0.35} />
      <Edge r={LOT} h={0.05} t={0.08} color="#3e5a46" skip={["w"]} />
      <Carport />
    </group>
  );
}

/* ── 전체 ─────────────────────────────────────────────────────────── */

const SHADOWS: [number, number, number, number, number][] = [
  ...Object.values(GR_SPECS).map((s): [number, number, number, number, number] => [s.x, s.z, s.w + 0.7, s.d + 0.7, Y + 0.003]),
  [-11, -5.5, 3.0, 2.6, Y + 0.003],
  [11.2, -6.3, 2.2, 1.6, Y + 0.003],
];

export default function GRDistrict() {
  const tex = useMemo(
    () => ({
      grass: grassTexture([3, 3]),
      plaza: pavingTexture([10, 8]),
      court: pavingTexture([6, 4]),
    }),
    [],
  );
  const fac = useMemo(
    () => ({
      a: facadeTextures({ cols: 8, rows: 4, frame: "#3d4d53", glass: "#6a8f98", litRatio: 0.35, seed: 3 }),
      b: facadeTextures({ cols: 6, rows: 3, frame: "#c9c2b4", glass: "#55666b", litRatio: 0.35, seed: 11 }),
    }),
    [],
  );
  const benches = useMemo(
    () => [
      m4(-7.6, Y, -2.1, 0, BENCH, BENCH, BENCH),
      m4(-5.2, Y, -2.1, 0, BENCH, BENCH, BENCH),
      m4(3.1, Y, -2.6, Math.PI, BENCH, BENCH, BENCH),
      m4(8.2, Y, -2.6, Math.PI, BENCH, BENCH, BENCH),
      m4(-10.6, Y, 6.9, Math.PI / 2, BENCH, BENCH, BENCH),
      m4(2.2, Y, 6.8, 0, BENCH, BENCH, BENCH),
    ],
    [],
  );
  const playground = useMemo(() => [m4(-4.2, Y, 5.6, -0.35, 0.2, 0.2, 0.2)], []);
  const flowers = useMemo(() => {
    const rand = (i: number) => {
      const x = Math.sin(i * 91.7) * 43758.5453;
      return x - Math.floor(x);
    };
    const cols = ["#e79bb0", "#f2d36b", "#b9a3e3", "#f0a868", "#ffffff"].map((c) => new THREE.Color(c));
    const list: [THREE.Matrix4, THREE.Color][] = [];
    // 정원 · 놀이 마당 화단
    const beds: Rect[] = [
      { x: 6.0, z: -2.3, w: 4.6, d: 0.4 },
      { x: -7.2, z: 2.0, w: 3.2, d: 0.35 },
      { x: -2.6, z: 4.6, w: 0.35, d: 3.0 },
    ];
    beds.forEach((b, bi) => {
      for (let i = 0; i < 40; i++) {
        const k = bi * 100 + i;
        list.push([m4(b.x + (rand(k) - 0.5) * b.w, Y + 0.03, b.z + (rand(k + 50) - 0.5) * b.d, 0, 1, 1, 1), cols[k % cols.length]]);
      }
    });
    return list;
  }, []);

  return (
    <group>
      <CityContext />
      <Ground />
      <Roads />
      <StreetTrees />
      <RoadLamps />
      <Traffic />
      <CloudShadows w={PLATE.w} d={PLATE.d} />

      {/* 북서: 업무 빌딩 앞 광장 + 주변 건물 */}
      <Lawn r={{ x: -6.4, z: -4.2, w: 7.0, d: 5.6 }} tex={tex.plaza} color="#c9d0d1" />
      <BuildingModel node="MidOffice" x={-11} z={-5.5} fallback={<Building x={-11} z={-5.5} w={2.4} d={2} h={1.8} facade={fac.a} />} />
      <BuildingModel node="ShopHouse" x={-11.2} z={-2.0} fallback={<Building x={-11.2} z={-2.0} w={2} d={1.2} h={1.2} facade={fac.b} />} />

      {/* 북동: 도서관 열람 정원 + 주변 건물 */}
      <Lawn r={{ x: 6.0, z: -4.6, w: 7.6, d: 5.4 }} tex={tex.grass} />
      <Lawn r={{ x: 6.0, z: -2.6, w: 4.8, d: 0.9 }} tex={tex.court} color="#d6d0c4" y={Y + 0.001} />
      <BuildingModel node="SmallBlock" x={11.2} z={-6.3} fallback={<Building x={11.2} z={-6.3} w={1.6} d={1} h={0.9} facade={fac.b} />} />

      {/* 남서: 어린이집 놀이 마당 (울타리) + 주변 건물 */}
      <Lawn r={{ x: -6.6, z: 4.8, w: 8.4, d: 6.0 }} tex={tex.grass} />
      <Lawn r={{ x: -4.2, z: 5.6, w: 2.4, d: 2.0 }} tex={tex.court} color="#c99a7a" y={Y + 0.001} />
      <Edge r={{ x: -6.6, z: 4.8, w: 8.4, d: 6.0 }} h={0.06} t={0.012} color="#e8ecee" skip={["n"]} />
      <Props node="Playground" matrices={playground} roughness={0.55} />

      {/* 남동: 주민센터 앞마당 + 주차장 */}
      <Lawn r={{ x: 3.7, z: 4.8, w: 5.4, d: 6.0 }} tex={tex.plaza} color="#c9d0d1" />
      <ParkingLot />

      <ContactShadows spots={SHADOWS} />
      <Props node="Bench" matrices={benches} roughness={0.7} />
      <instancedMesh
        ref={(mesh) => {
          if (!mesh) return;
          flowers.forEach(([m, c], i) => {
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, c);
          });
          mesh.instanceMatrix.needsUpdate = true;
          if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
          mesh.computeBoundingSphere();
        }}
        args={[undefined, undefined, flowers.length]}
      >
        <icosahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <Suspense fallback={null}>
        <TreeModels />
      </Suspense>
    </group>
  );
}

