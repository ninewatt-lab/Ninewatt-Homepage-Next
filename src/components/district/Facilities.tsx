"use client";

/**
 * Product 테마 지역의 시설들. 시설마다 그 제품이 하는 일을 짧은 장면으로 보여 준다(꾸민 수치 없이 동작으로).
 *  BEMS        빌딩을 훑는 데이터 스캔 · 층 센서
 *  피크저감 ESS 피크 시간에 빌딩으로 방전 (홈 히어로와 같은 시뮬레이션)
 *  공유형 ESS   전선을 따라 여러 건물로 가는 전력(가상상계)
 *  PV REMS     패널 한 줄 이상 → 경고 → AI 진단 후 정상
 *  RE:park     가로등 고장 → 신고 핑 → 수리 완료
 *  GreenPlanner 단열 패널이 외벽을 덮어 가며 새는 열이 줄어든다
 *  SolarScope  후보지 스캔 · 음영 분석
 */

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSim } from "@/components/hero/heroSim";
import { useModelGeometry, useModelMaterial } from "@/components/hero/models";
import { fenceTexture, pavingTexture } from "@/components/hero/textures";
import { AMBER, Building, Instances, PvPanels, TEAL, facadeTextures, iconTexture, m4, poolTexture, useDistrict, useFacility } from "./common";
import { FACILITY, PLATE, ROAD } from "./districtLayout";
import { CAR_COLORS, Props } from "./props";

/* ── 바닥 · 도로 ──────────────────────────────────────────────────── */

export function Ground() {
  const paving = useMemo(() => pavingTexture([PLATE.w / 0.5, PLATE.d / 0.5]), []);
  return (
    <group>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[PLATE.w, 0.2, PLATE.d]} />
        <meshStandardMaterial map={paving} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[PLATE.w + 0.4, 0.8, PLATE.d + 0.4]} />
        <meshStandardMaterial color="#0d1a20" roughness={1} />
      </mesh>
    </group>
  );
}

export function Roads() {
  const dashes = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let x = -PLATE.w / 2 + 0.5; x < PLATE.w / 2; x += 0.9) if (Math.abs(x - ROAD.nsX) > 0.8) list.push(m4(x, 0.035, ROAD.ewZ));
    for (let z = -PLATE.d / 2 + 0.5; z < PLATE.d / 2; z += 0.9) if (Math.abs(z - ROAD.ewZ) > 0.8) list.push(m4(ROAD.nsX, 0.035, z, Math.PI / 2));
    return list;
  }, []);
  return (
    <group>
      <mesh position={[0, 0.015, ROAD.ewZ]} receiveShadow>
        <boxGeometry args={[PLATE.w, 0.03, ROAD.width]} />
        <meshStandardMaterial color="#1f2629" roughness={0.9} />
      </mesh>
      <mesh position={[ROAD.nsX, 0.016, 0]} receiveShadow>
        <boxGeometry args={[ROAD.width, 0.03, PLATE.d]} />
        <meshStandardMaterial color="#1f2629" roughness={0.9} />
      </mesh>
      <Instances matrices={dashes} cast={false}>
        <boxGeometry args={[0.38, 0.005, 0.05]} />
        <meshStandardMaterial color="#d9dcd6" roughness={0.6} />
      </Instances>
    </group>
  );
}

/* ── 가로등 (밤에 켜지고 바닥에 빛 웅덩이) ────────────────────────── */

const LAMP_LIGHT = new THREE.Color("#ffd29a");
const LAMP_GIRTH = 0.16;

function setLamp(mesh: THREE.InstancedMesh, i: number, color: THREE.Color) {
  mesh.setColorAt(i, color);
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/** bare: 기둥 없이 등과 빛 웅덩이만 (카포트 아래 조명) */
function Lamps({ spots, height = 0.8, broken = -1, bare = false }: { spots: [number, number][]; height?: number; broken?: number; bare?: boolean }) {
  const sim = useSim();
  const heads = useRef<THREE.InstancedMesh>(null);
  const pools = useRef<THREE.InstancedMesh>(null);
  const pool = useMemo(() => poolTexture(), []);
  // 모델 높이 8 m → height, 굵기는 보이도록 1.6 배
  const poles = useMemo(() => spots.map(([x, z]) => m4(x, 0, z, 0, LAMP_GIRTH, height / 8, LAMP_GIRTH)), [spots, height]);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const h = heads.current;
    const p = pools.current;
    if (!h || !p) return;
    const dark = sim.current.dark;
    for (let i = 0; i < spots.length; i++) {
      // 해가 지면 하나씩 켜진다 · 고장 장면의 가로등은 깜빡이다 꺼진다
      let on = THREE.MathUtils.smoothstep(dark, 0.3 + (i % 5) * 0.04, 0.45 + (i % 5) * 0.04);
      if (i === broken) on *= brokenLevel(clock.elapsedTime);
      setLamp(h, i, tmp.copy(LAMP_LIGHT).multiplyScalar(0.18 + on * 0.82));
      setLamp(p, i, tmp.copy(LAMP_LIGHT).multiplyScalar(on * 0.55));
    }
  });
  const init = (mesh: THREE.InstancedMesh | null, matrices: THREE.Matrix4[]) => {
    if (!mesh) return;
    matrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, new THREE.Color(0, 0, 0));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  // 빛나는 등: 갓(모델 7.74 m) 바로 아래
  const headM = useMemo(() => spots.map(([x, z]) => m4(x, (height * 7.7) / 8, z)), [spots, height]);
  const poolM = useMemo(() => spots.map(([x, z]) => m4(x, 0.05, z, 0, 1.6, 1.6, 1.6, -Math.PI / 2)), [spots]);
  return (
    <group>
      {!bare && <Props node="LampPost" matrices={poles} metalness={0.45} roughness={0.45} />}
      <instancedMesh
        ref={(m) => {
          heads.current = m;
          init(m, headM);
        }}
        args={[undefined, undefined, spots.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.072, 0.06, 0.014, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={(m) => {
          pools.current = m;
          init(m, poolM);
        }}
        args={[undefined, undefined, spots.length]}
        frustumCulled={false}
        renderOrder={1}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={pool} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// 도로변 가로등: 교차로를 비켜 일정 간격으로
const ROAD_LAMPS: [number, number][] = [
  ...[-11.5, -8, -4.5, 2.5, 6, 9.5].map((x) => [x, 0.85] as [number, number]),
  ...[-6, 3.5, 8].map((x) => [x, -0.85] as [number, number]),
  ...[-7.5, -4, 3, 6.5].map((z) => [-0.15, z] as [number, number]),
];

export function RoadLamps() {
  return <Lamps spots={ROAD_LAMPS} height={0.75} />;
}

/* ── 북서: 업무 빌딩(BEMS) · 빌딩 ESS(피크저감형) ───────────────── */

export const TOWER = { x: -6.5, z: -4.6, w: 3.2, d: 2.4, h: 5.6 };
const TOWER_FLOORS = 12;

/** 옥상 난간 (지붕판 위로) */
function Parapet({ x, z, w, d, h, color = "#2a3a40" }: { x: number; z: number; w: number; d: number; h: number; color?: string }) {
  const y = h + 0.08 + 0.06;
  const t = 0.05;
  const m = useMemo(
    () => [m4(x, y, z - d / 2 - 0.01, 0, (w + 0.08) / t, 1, 1), m4(x, y, z + d / 2 + 0.01, 0, (w + 0.08) / t, 1, 1), m4(x - w / 2 - 0.01, y, z, 0, 1, 1, d / t), m4(x + w / 2 + 0.01, y, z, 0, 1, 1, d / t)],
    [x, z, w, d, y],
  );
  return (
    <Instances matrices={m}>
      <boxGeometry args={[t, 0.12, t]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </Instances>
  );
}

function RoofUnitModels({ spots, scale }: { spots: [number, number, number, number][]; scale: number }) {
  const geometry = useModelGeometry("HeatPump");
  const material = useModelMaterial(0.55, 0.2);
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        spots.forEach(([x, y, z, ry], i) => mesh.setMatrixAt(i, m4(x, y, z, ry, scale, scale, scale)));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[geometry, material, spots.length]}
      castShadow
      receiveShadow
    />
  );
}

/** 옥상 냉난방 실외기 (홈 히어로의 히트펌프 모델) — [x, y, z, 회전] */
function RoofUnits({ spots, scale = 0.14 }: { spots: [number, number, number, number][]; scale?: number }) {
  return (
    <Suspense fallback={null}>
      <RoofUnitModels spots={spots} scale={scale} />
    </Suspense>
  );
}

const ROOF_Y = TOWER.h + 0.08;
const PENTHOUSE = { x: TOWER.x + 0.95, z: TOWER.z - 0.4, w: 1.0, d: 0.9, h: 0.42 };

export function OfficeTower() {
  const target = useFacility("bems");
  const pvTarget = useFacility("pvRems");
  const sim = useSim();
  const facade = useMemo(() => facadeTextures({ cols: 14, rows: TOWER_FLOORS, frame: "#2e4148", glass: "#5d8f9c", litRatio: 0.3, seed: 7, band: "#22333a" }), []);
  const lobby = useRef<THREE.Mesh>(null);
  const beacon = useRef<THREE.Mesh>(null);
  // 옥상 서쪽에 태양광, 동쪽에 기계실 · 실외기
  const roofPv = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 4; r++) list.push(m4(TOWER.x - 1.2 + c * 0.6, ROOF_Y + 0.12, TOWER.z - 0.8 + r * 0.5, 0, 1, 1, 1, 0.38));
    return list;
  }, []);
  // 커튼월 세로 핀 (카메라 쪽 두 면) · 모서리 기둥
  const fins = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const fy = (TOWER.h + 0.47) / 2;
    const sy = (TOWER.h - 0.47) / TOWER.h;
    for (let k = 1; k < 7; k++) list.push(m4(TOWER.x - TOWER.w / 2 + (k * TOWER.w) / 7, fy, TOWER.z + TOWER.d / 2 + 0.03, 0, 1, sy, 1));
    for (let k = 1; k < 5; k++) list.push(m4(TOWER.x + TOWER.w / 2 + 0.03, fy, TOWER.z - TOWER.d / 2 + (k * TOWER.d) / 5, Math.PI / 2, 1, sy, 1));
    return list;
  }, []);
  const piers = useMemo(
    () =>
      [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => m4(TOWER.x + sx * (TOWER.w / 2 - 0.02), (TOWER.h + 0.24) / 2, TOWER.z + sz * (TOWER.d / 2 - 0.02))),
      ),
    [],
  );
  useFrame(({ clock }) => {
    const dark = sim.current.dark;
    if (lobby.current) (lobby.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.05 + dark * 0.9;
    // 항공장애등: 밤에 깜빡인다
    if (beacon.current) beacon.current.scale.setScalar(dark > 0.3 && clock.elapsedTime % 1.6 < 0.5 ? 1 : 0.001);
  });
  return (
    <>
      <group {...target}>
        <Building x={TOWER.x} z={TOWER.z} w={TOWER.w} d={TOWER.d} h={TOWER.h} facade={facade} />
        {/* 1층 로비: 투명한 유리 띠 (밤에 불이 켜진다) */}
        <mesh ref={lobby} position={[TOWER.x, 0.235, TOWER.z]} castShadow receiveShadow>
          <boxGeometry args={[TOWER.w + 0.03, 0.47, TOWER.d + 0.03]} />
          <meshStandardMaterial color="#6e97a2" emissive="#ffe2b8" metalness={0.6} roughness={0.12} />
        </mesh>
        <mesh position={[TOWER.x, 0.475, TOWER.z]} castShadow>
          <boxGeometry args={[TOWER.w + 0.08, 0.04, TOWER.d + 0.08]} />
          <meshStandardMaterial color="#22333a" roughness={0.6} />
        </mesh>
        <mesh position={[TOWER.x, 0.35, TOWER.z + TOWER.d / 2 + 0.25]} castShadow>
          <boxGeometry args={[1.6, 0.05, 0.5]} />
          <meshStandardMaterial color="#9fb3ba" metalness={0.5} roughness={0.3} />
        </mesh>
        <Instances matrices={fins}>
          <boxGeometry args={[0.025, TOWER.h, 0.07]} />
          <meshStandardMaterial color="#3e545c" metalness={0.5} roughness={0.35} />
        </Instances>
        <Instances matrices={piers}>
          <boxGeometry args={[0.1, TOWER.h + 0.24, 0.1]} />
          <meshStandardMaterial color="#22333a" roughness={0.55} />
        </Instances>
        <Parapet x={TOWER.x} z={TOWER.z} w={TOWER.w} d={TOWER.d} h={TOWER.h} />
        {/* 옥상 기계실 · 실외기 · 안테나 */}
        <mesh position={[PENTHOUSE.x, ROOF_Y + PENTHOUSE.h / 2, PENTHOUSE.z]} castShadow receiveShadow>
          <boxGeometry args={[PENTHOUSE.w, PENTHOUSE.h, PENTHOUSE.d]} />
          <meshStandardMaterial color="#3a4d54" roughness={0.7} />
        </mesh>
        <mesh position={[PENTHOUSE.x, ROOF_Y + PENTHOUSE.h + 0.02, PENTHOUSE.z]} castShadow>
          <boxGeometry args={[PENTHOUSE.w + 0.06, 0.04, PENTHOUSE.d + 0.06]} />
          <meshStandardMaterial color="#25343a" roughness={0.8} />
        </mesh>
        <RoofUnits
          spots={[
            [TOWER.x + 0.65, ROOF_Y, TOWER.z + 0.7, 0],
            [TOWER.x + 1.05, ROOF_Y, TOWER.z + 0.7, 0],
            [TOWER.x + 1.4, ROOF_Y, TOWER.z + 0.25, Math.PI / 2],
          ]}
        />
        <mesh position={[PENTHOUSE.x + 0.25, ROOF_Y + PENTHOUSE.h + 0.38, PENTHOUSE.z - 0.15]} castShadow>
          <cylinderGeometry args={[0.008, 0.016, 0.72, 6]} />
          <meshStandardMaterial color="#b9c2c5" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh ref={beacon} position={[PENTHOUSE.x + 0.25, ROOF_Y + PENTHOUSE.h + 0.76, PENTHOUSE.z - 0.15]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#ff4a3d" toneMapped={false} />
        </mesh>
        <BemsScan />
      </group>
      <group {...pvTarget}>
        <PvPanels matrices={roofPv} />
      </group>
    </>
  );
}

// BEMS: 데이터 스캔 링이 빌딩을 위로 훑고, 지나간 층의 센서가 깜빡인다
function BemsScan() {
  const { active } = useDistrict();
  const ring = useRef<THREE.LineSegments>(null);
  const sensors = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const sensorM = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let f = 0; f < TOWER_FLOORS; f++)
      for (const [sx, sz] of [
        [1, 1],
        [-1, 1],
        [1, -1],
      ])
        list.push(m4(TOWER.x + (sx * (TOWER.w / 2 + 0.03)), ((f + 0.5) * TOWER.h) / TOWER_FLOORS, TOWER.z + (sz * (TOWER.d / 2 + 0.03))));
    return list;
  }, []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ clock }) => {
    const r = ring.current;
    const s = sensors.current;
    if (!r || !s) return;
    const period = active === "bems" ? 3.2 : 7;
    const ph = (clock.elapsedTime % period) / 3;
    const y = ph <= 1 ? ph * (TOWER.h + 0.2) : -1;
    r.visible = y >= 0;
    r.position.y = y;
    (r.material as THREE.LineBasicMaterial).opacity = 0.85 * Math.min(1, y * 3, (TOWER.h + 0.2 - y) * 3);
    sensorM.forEach((m, i) => {
      const fy = (Math.floor(i / 3) + 0.5) * (TOWER.h / TOWER_FLOORS);
      const near = y >= 0 ? Math.max(0, 1 - Math.abs(y - fy) / 0.5) : 0;
      s.setColorAt(i, tmp.copy(TEAL).multiplyScalar(0.25 + near * 1.6));
    });
    if (s.instanceColor) s.instanceColor.needsUpdate = true;
  });
  return (
    <>
      <lineSegments ref={ring} geometry={geometry} position={[TOWER.x, 0, TOWER.z]} scale={[TOWER.w + 0.35, 1, TOWER.d + 0.35]}>
        <lineBasicMaterial color="#c9f3fa" transparent depthWrite={false} />
      </lineSegments>
      <instancedMesh
        ref={(mesh) => {
          sensors.current = mesh;
          if (!mesh) return;
          sensorM.forEach((m, i) => {
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, TEAL);
          });
          mesh.instanceMatrix.needsUpdate = true;
          mesh.computeBoundingSphere();
        }}
        args={[undefined, undefined, sensorM.length]}
      >
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function CabinetModels({ positions }: { positions: THREE.Vector3[] }) {
  const geometry = useModelGeometry("EssCabinet");
  const material = useModelMaterial(0.55, 0.15);
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} geometry={geometry} material={material} position={p} scale={0.1} castShadow receiveShadow />
      ))}
    </>
  );
}

function CabinetBoxes({ positions }: { positions: THREE.Vector3[] }) {
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.15, p.z]} castShadow>
          <boxGeometry args={[0.36, 0.3, 0.18]} />
          <meshStandardMaterial color="#e9ecea" roughness={0.55} />
        </mesh>
      ))}
    </>
  );
}

function Cabinets({ positions }: { positions: THREE.Vector3[] }) {
  return (
    <Suspense fallback={<CabinetBoxes positions={positions} />}>
      <CabinetModels positions={positions} />
    </Suspense>
  );
}

function FencedPad({ x, z, w, d, color = "#b4bbbc" }: { x: number; z: number; w: number; d: number; color?: string }) {
  const fence = useMemo(() => ({ long: fenceTexture(Math.round(w * 30)), short: fenceTexture(Math.round(d * 30)) }), [w, d]);
  const posts = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let k = 0; k <= 4; k++) {
      const px = x - w / 2 + (k * w) / 4;
      list.push(m4(px, 0.11, z - d / 2), m4(px, 0.11, z + d / 2));
    }
    for (let k = 1; k < 3; k++) {
      const pz = z - d / 2 + (k * d) / 3;
      list.push(m4(x - w / 2, 0.11, pz), m4(x + w / 2, 0.11, pz));
    }
    return list;
  }, [x, z, w, d]);
  return (
    <group>
      <mesh position={[x, 0.012, z]} receiveShadow>
        <boxGeometry args={[w, 0.025, d]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <Instances matrices={posts}>
        <boxGeometry args={[0.012, 0.22, 0.012]} />
        <meshStandardMaterial color="#56686c" metalness={0.5} roughness={0.5} />
      </Instances>
      {(
        [
          [0, -d / 2, w, 0, fence.long],
          [0, d / 2, w, 0, fence.long],
          [-w / 2, 0, d, Math.PI / 2, fence.short],
          [w / 2, 0, d, Math.PI / 2, fence.short],
        ] as const
      ).map(([dx, dz, len, ry, map], i) => (
        <mesh key={i} position={[x + dx, 0.11, z + dz]} rotation={[0, ry, 0]}>
          <planeGeometry args={[len, 0.2]} />
          <meshStandardMaterial map={map} transparent alphaTest={0.35} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export const PEAK_ESS = { x: -3.55, z: -2.15 };

export function PeakEss() {
  const target = useFacility("peakEss");
  const pos = useMemo(() => [new THREE.Vector3(PEAK_ESS.x - 0.2, 0.025, PEAK_ESS.z), new THREE.Vector3(PEAK_ESS.x + 0.2, 0.025, PEAK_ESS.z)], []);
  return (
    <group {...target}>
      <FencedPad x={PEAK_ESS.x} z={PEAK_ESS.z} w={1.1} d={0.7} />
      <Cabinets positions={pos} />
    </group>
  );
}

/* ── 북동: 공유형 ESS 단지 · 배전선 · 태양광 후보지 ─────────────────── */

export const SHARED = { x: 10, z: -5.2, w: 4.4, d: 3.2 };

export function SharedEss() {
  const target = useFacility("sharedEss");
  const pos = useMemo(() => {
    const list: THREE.Vector3[] = [];
    for (const dz of [-0.6, 0.55]) for (const dx of [-1.3, -0.45, 0.4, 1.25]) list.push(new THREE.Vector3(SHARED.x + dx, 0.025, SHARED.z + dz));
    return list;
  }, []);
  const posts = useMemo(() => [-1.9, 0, 1.9].flatMap((dx) => [-1.3, 1.3].map((dz) => m4(SHARED.x + dx, 0.55, SHARED.z + dz))), []);
  // 캐노피 골조: 긴 보 2 + 도리
  const beams = useMemo(() => [-1.3, 1.3].map((dz) => m4(SHARED.x, 1.05, SHARED.z + dz, 0, 4.0 / 0.05, 1, 1)), []);
  const purlins = useMemo(() => Array.from({ length: 9 }, (_, k) => m4(SHARED.x - 1.9 + k * 0.475, 1.07, SHARED.z, 0, 1, 1, 2.8 / 0.05)), []);
  const transformer = useMemo(() => [m4(SHARED.x - 2.9, 0, SHARED.z + 1.2, 0, 0.1, 0.1, 0.1)], []);
  return (
    <group {...target}>
      <FencedPad x={SHARED.x} z={SHARED.z} w={SHARED.w} d={SHARED.d} color="#9da5a6" />
      <Cabinets positions={pos} />
      <Instances matrices={posts}>
        <boxGeometry args={[0.06, 1.1, 0.06]} />
        <meshStandardMaterial color="#3a464a" metalness={0.6} roughness={0.4} />
      </Instances>
      <mesh position={[SHARED.x, 1.12, SHARED.z]} castShadow receiveShadow>
        <boxGeometry args={[4.1, 0.06, 2.9]} />
        <meshStandardMaterial color="#2f3a3e" metalness={0.5} roughness={0.5} />
      </mesh>
      <Instances matrices={beams}>
        <boxGeometry args={[0.05, 0.07, 0.07]} />
        <meshStandardMaterial color="#3a464a" metalness={0.6} roughness={0.4} />
      </Instances>
      <Instances matrices={purlins}>
        <boxGeometry args={[0.035, 0.04, 0.05]} />
        <meshStandardMaterial color="#4a575b" metalness={0.6} roughness={0.4} />
      </Instances>
      <Props node="Transformer" matrices={transformer} metalness={0.35} roughness={0.5} />
    </group>
  );
}

export const POLE_Z = -0.95;
const POLES = Array.from({ length: 9 }, (_, i) => -12 + i * 3);
export const POLE_H = 1.35;
// 전주 모델(m)을 가로로는 조금 굵게 — 애자 간격(1.8 m)도 같이 커지므로 전선 간격을 맞춘다
const POLE_GIRTH = 0.13;
const WIRE_SPREAD = 1.8 * POLE_GIRTH;
const TX_POLES = [2, 6];

export function PowerLines() {
  const lines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: "#1c2326", transparent: true, opacity: 0.85 });
    const group = new THREE.Group();
    for (const dx of [-WIRE_SPREAD, 0, WIRE_SPREAD]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < POLES.length - 1; i++) {
        const a = POLES[i];
        const b = POLES[i + 1];
        for (let t = 0; t <= 1.0001; t += 0.1) pts.push(new THREE.Vector3(a + (b - a) * t, POLE_H - 0.05 - Math.sin(t * Math.PI) * 0.12, POLE_Z + dx));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    return group;
  }, []);
  const pole = (x: number) => m4(x, 0, POLE_Z, 0, POLE_GIRTH, 0.1, POLE_GIRTH);
  const plain = useMemo(() => POLES.filter((_, i) => !TX_POLES.includes(i)).map(pole), []);
  const withTx = useMemo(() => POLES.filter((_, i) => TX_POLES.includes(i)).map(pole), []);
  return (
    <group>
      <Props node="PowerPole" matrices={plain} roughness={0.8} />
      <Props node="PowerPoleTx" matrices={withTx} roughness={0.75} />
      <primitive object={lines} />
    </group>
  );
}

const OLD = { x: 7.6, z: 3.2, w: 3, d: 2.2, h: 2.4 };

// 공유형 ESS → 전주 → 지역 건물들(가상상계) · 피크저감 ESS → 빌딩(피크 시간 방전)
export function EnergyFlow() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const paths = useMemo(() => {
    const y = POLE_H - 0.05;
    const v = (x: number, yy: number, z: number) => new THREE.Vector3(x, yy, z);
    const src = v(SHARED.x - 2.9, 0.5, SHARED.z + 1.2);
    const up = v(SHARED.x - 2.9, y, POLE_Z);
    const raw: { points: THREE.Vector3[]; peak?: boolean }[] = [
      { points: [src, up, v(TOWER.x + 1, y, POLE_Z), v(TOWER.x + 1, 2.5, TOWER.z + TOWER.d / 2)] },
      { points: [src, up, v(OLD.x, y, POLE_Z), v(OLD.x, 1.6, OLD.z - OLD.d / 2)] },
      { points: [src, up, v(-11, y, POLE_Z), v(-11, 1.2, -5.5 + 1)] },
      { points: [v(PEAK_ESS.x - 0.2, 0.3, PEAK_ESS.z - 0.2), v(PEAK_ESS.x - 0.9, 0.3, TOWER.z + TOWER.d / 2 + 0.3), v(TOWER.x + 1.2, 0.5, TOWER.z + TOWER.d / 2)], peak: true },
    ];
    return raw.map(({ points, peak }) => {
      const lengths = [0];
      for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
      return { points, lengths, total: lengths[lengths.length - 1], peak: !!peak };
    });
  }, []);
  const PER = 9;
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = sim.current;
    let i = 0;
    paths.forEach((path, pi) => {
      // 피크저감 ESS 는 시뮬레이션에서 방전 중일 때만 흐른다
      const amount = path.peak ? Math.min(1, Math.max(0, s.essKw) / 20) : 1;
      const speed = path.peak ? 0.22 : 0.06;
      for (let k = 0; k < PER; k++) {
        const t = (clock.elapsedTime * speed + k / PER + pi * 0.13) % 1;
        const d = t * path.total;
        let j = 1;
        while (j < path.lengths.length - 1 && path.lengths[j] < d) j++;
        const seg = path.lengths[j] - path.lengths[j - 1] || 1;
        tmp.p.lerpVectors(path.points[j - 1], path.points[j], (d - path.lengths[j - 1]) / seg);
        tmp.s.setScalar(Math.min(1, t * 10, (1 - t) * 10) * amount * s.intro);
        mesh.setMatrixAt(i++, tmp.m.compose(tmp.p, tmp.q, tmp.s));
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, paths.length * PER]} frustumCulled={false}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshBasicMaterial color="#a8eaf5" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

const LOT = { x: 3.5, z: -5, w: 5, d: 4.6 };

export function SolarScopeLot() {
  const target = useFacility("solarScope");
  const { active } = useDistrict();
  const scan = useRef<THREE.Mesh>(null);
  const heat = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const score = Math.min(1, 0.35 + x * 0.07 + y * 0.06);
        g.fillStyle = `hsla(${190 - score * 150}, 70%, 55%, 0.55)`;
        g.fillRect(x * 8 + 0.5, y * 8 + 0.5, 7, 7);
      }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    return t;
  }, []);
  const border = useMemo(() => {
    const pts = [
      [-LOT.w / 2, -LOT.d / 2],
      [LOT.w / 2, -LOT.d / 2],
      [LOT.w / 2, LOT.d / 2],
      [-LOT.w / 2, LOT.d / 2],
      [-LOT.w / 2, -LOT.d / 2],
    ].map(([px, pz]) => new THREE.Vector3(LOT.x + px, 0.04, LOT.z + pz));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: "#f5a54a", dashSize: 0.25, gapSize: 0.15 }));
    line.computeLineDistances();
    return line;
  }, []);
  const stakes = useMemo(
    () =>
      [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([sx, sz]) => m4(LOT.x + (sx * LOT.w) / 2, 0.12, LOT.z + (sz * LOT.d) / 2)),
    [],
  );
  useFrame(({ clock }) => {
    if (scan.current) scan.current.position.x = LOT.x - LOT.w / 2 + ((clock.elapsedTime * (active === "solarScope" ? 1 : 0.5)) % 1) * LOT.w;
  });
  return (
    <group {...target}>
      <mesh position={[LOT.x, 0.015, LOT.z]} receiveShadow>
        <boxGeometry args={[LOT.w, 0.03, LOT.d]} />
        <meshStandardMaterial color="#5f513f" roughness={1} />
      </mesh>
      <mesh position={[LOT.x, 0.035, LOT.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[LOT.w - 0.3, LOT.d - 0.3]} />
        <meshBasicMaterial map={heat} transparent depthWrite={false} />
      </mesh>
      <primitive object={border} />
      <Instances matrices={stakes}>
        <cylinderGeometry args={[0.03, 0.03, 0.24, 6]} />
        <meshStandardMaterial color="#f5a54a" roughness={0.6} />
      </Instances>
      <mesh ref={scan} position={[LOT.x, 0.2, LOT.z]}>
        <boxGeometry args={[0.02, 0.4, LOT.d - 0.2]} />
        <meshBasicMaterial color="#a8eaf5" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── 상태 장면 공용: 경고 → 해결 아이콘 · 신고 핑 ─────────────────── */

/** period 초마다 offset 부터: 0~alert 경고, alert~ok 해결, 나머지 쉼 */
function storyPhase(t: number, period: number, offset: number, alert: number, ok: number) {
  const u = (t + period - offset) % period;
  if (u < alert) return { stage: "alert" as const, u };
  if (u < ok) return { stage: "ok" as const, u: u - alert };
  return { stage: null, u: 0 };
}

function StatusIcon({ position, stageRef }: { position: [number, number, number]; stageRef: React.RefObject<"alert" | "ok" | null> }) {
  const alert = useMemo(() => iconTexture("alert"), []);
  const ok = useMemo(() => iconTexture("ok"), []);
  const ref = useRef<THREE.Sprite>(null);
  useFrame(({ clock }) => {
    const sp = ref.current;
    if (!sp) return;
    const stage = stageRef.current;
    sp.visible = !!stage;
    if (!stage) return;
    const mat = sp.material as THREE.SpriteMaterial;
    if (mat.map !== (stage === "alert" ? alert : ok)) {
      mat.map = stage === "alert" ? alert : ok;
      mat.needsUpdate = true;
    }
    sp.position.y = position[1] + Math.sin(clock.elapsedTime * 3) * 0.06;
  });
  return (
    <sprite ref={ref} position={position} scale={[0.55, 0.55, 0.55]} renderOrder={5}>
      <spriteMaterial map={alert} transparent depthTest={false} toneMapped={false} />
    </sprite>
  );
}

/* ── 남서: 공원(RE:park) — 가로등 고장 → 신고 → 수리 ─────────────── */

const PARK = { x: -7, z: 4.8, w: 10, d: 7 };
const PARK_LAMPS: [number, number][] = [
  [-10.6, 6.9],
  [-8, 2.6],
  [-5.2, 6.9],
  [-3.2, 2.6],
];
const BROKEN_LAMP = 1;
const TREE_SPOTS: [number, number, number][] = [
  [-11.2, 2.0, 1],
  [-9.6, 1.6, 0.9],
  [-11.4, 4.2, 1.1],
  [-8.8, 7.6, 0.95],
  [-6.2, 7.8, 1],
  [-3.4, 2.0, 0.9],
  [-2.8, 4.4, 1.05],
  [-5.6, 1.7, 0.85],
  [-11.6, 6.6, 0.9],
  [-7.4, 3.2, 1.2],
];

function brokenLevel(t: number) {
  const ph = storyPhase(t, 24, 12, 5, 7.5);
  if (ph.stage !== "alert") return 1;
  return ph.u < 0.8 ? (Math.sin(ph.u * 40) > 0 ? 1 : 0.1) : 0;
}

function TreeModels() {
  const a = useModelGeometry("TreeA");
  const b = useModelGeometry("TreeB");
  const material = useModelMaterial(0.85, 0);
  return (
    <>
      {TREE_SPOTS.map(([x, z, k], i) => (
        <mesh key={i} geometry={i % 3 === 1 ? b : a} material={material} position={[x, 0.03, z]} scale={0.16 * k} rotation={[0, i * 1.7, 0]} castShadow receiveShadow />
      ))}
    </>
  );
}

export function Park() {
  const target = useFacility("repark");
  const { active } = useDistrict();
  const qr = useRef<THREE.InstancedMesh>(null);
  const ping = useRef<THREE.Mesh>(null);
  const stage = useRef<"alert" | "ok" | null>(null);
  const benches = useMemo(() => [m4(-9.2, 0.04, 3.3, 0.4, 0.24, 0.24, 0.24), m4(-6.4, 0.04, 6.2, Math.PI - 0.3, 0.24, 0.24, 0.24), m4(-4.6, 0.04, 3.6, 1.1, 0.24, 0.24, 0.24)], []);
  const restroom = useMemo(() => [m4(-11, 0.04, 7.6, 0, 0.11, 0.11, 0.11)], []);
  const playground = useMemo(() => [m4(-4.4, 0.04, 6.6, -0.35, 0.2, 0.2, 0.2)], []);
  // QR 표지가 붙은 시설물: 가로등 · 벤치 · 화장실 · 놀이터
  const qrSpots = useMemo(() => [m4(-10.6, 1.0, 6.9), m4(-8, 1.0, 2.6), m4(-9.2, 0.35, 3.3), m4(-6.4, 0.35, 6.2), m4(-11, 0.62, 7.6), m4(-4.6, 0.86, 6.5)], []);
  const [bx, bz] = PARK_LAMPS[BROKEN_LAMP];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const ph = storyPhase(t, 24, 12, 5, 7.5);
    stage.current = ph.stage;
    if (qr.current) {
      const m = qr.current.material as THREE.MeshBasicMaterial;
      m.opacity = (active === "repark" ? 0.8 : 0.45) + Math.sin(t * (ph.stage === "alert" ? 10 : 3)) * 0.2;
    }
    // 시민 신고 핑: 고장 난 가로등 아래에서 퍼지는 고리
    const p = ping.current;
    if (p) {
      p.visible = ph.stage === "alert";
      const k = (t * 0.9) % 1;
      p.scale.setScalar(0.3 + k * 1.4);
      (p.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.9;
    }
  });
  return (
    <group {...target}>
      <mesh position={[PARK.x, 0.02, PARK.z]} receiveShadow>
        <boxGeometry args={[PARK.w, 0.04, PARK.d]} />
        <meshStandardMaterial color="#4b6e55" roughness={1} />
      </mesh>
      <mesh position={[PARK.x, 0.045, PARK.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]} receiveShadow>
        <ringGeometry args={[2.1, 2.45, 64]} />
        <meshStandardMaterial color="#c7bfae" roughness={0.95} />
      </mesh>
      <Props node="Restroom" matrices={restroom} roughness={0.75} />
      <Props node="Playground" matrices={playground} roughness={0.55} />
      <Props node="Bench" matrices={benches} roughness={0.7} />
      <Lamps spots={PARK_LAMPS} broken={BROKEN_LAMP} />
      <instancedMesh
        ref={(mesh) => {
          qr.current = mesh;
          if (!mesh) return;
          qrSpots.forEach((m, i) => mesh.setMatrixAt(i, m));
          mesh.instanceMatrix.needsUpdate = true;
          mesh.computeBoundingSphere();
        }}
        args={[undefined, undefined, qrSpots.length]}
      >
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshBasicMaterial color="#85D2E0" transparent toneMapped={false} />
      </instancedMesh>
      <mesh ref={ping} position={[bx, 0.07, bz]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
        <ringGeometry args={[0.85, 1, 48]} />
        <meshBasicMaterial color={AMBER} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <StatusIcon position={[bx, 1.35, bz]} stageRef={stage} />
      <Suspense fallback={null}>
        <TreeModels />
      </Suspense>
    </group>
  );
}

/* ── 남동: 주차장 지붕형 PV (PV REMS — 패널 이상 감지) ────────────── */

const LOTP = { x: 2.8, z: 4.8, w: 5.6, d: 6.6 };
/** 차 모델(길이 4.5 m)을 지역 축척에 맞게 조금 키운다 */
const CAR_SCALE = 0.13;
const CARPORT_LIGHTS: [number, number][] = [-1.6, 1.6].flatMap((row) => [-1.4, 0, 1.4].map((dx) => [LOTP.x + dx, LOTP.z + row - 0.15] as [number, number]));

export function Parking() {
  const target = useFacility("pvRems");
  const stage = useRef<"alert" | "ok" | null>(null);
  const outline = useRef<THREE.LineSegments>(null);
  const stalls = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const row of [-1.6, 1.6]) for (let k = 0; k <= 8; k++) list.push(m4(LOTP.x - 2.4 + k * 0.6, 0.035, LOTP.z + row));
    return list;
  }, []);
  // 카포트 골조: 기둥 · 기둥을 잇는 거더 · 패널을 받치는 외팔보
  const carportPosts = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const row of [-1.6, 1.6]) for (let k = 0; k < 4; k++) list.push(m4(LOTP.x - 2.1 + k * 1.4, 0.38, LOTP.z + row - 0.15));
    return list;
  }, []);
  const girders = useMemo(() => [-1.6, 1.6].map((row) => m4(LOTP.x, 0.77, LOTP.z + row - 0.15, 0, 5.5 / 0.05, 1, 1)), []);
  const arms = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const row of [-1.6, 1.6]) for (let k = 0; k < 4; k++) list.push(m4(LOTP.x - 2.1 + k * 1.4, 0.79, LOTP.z + row - 0.12, 0, 1, 1, 0.8 / 0.05, 0.18));
    return list;
  }, []);
  // 전기차 충전기: 북쪽 줄 통로 쪽
  const chargers = useMemo(() => [1, 3, 5].map((k) => m4(LOTP.x - 2.4 + k * 0.6, 0.14, LOTP.z - 1.6 + 0.47)), []);
  const chargerScreens = useMemo(() => [1, 3, 5].map((k) => m4(LOTP.x - 2.4 + k * 0.6, 0.2, LOTP.z - 1.6 + 0.47 + 0.028)), []);
  const panels = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const row of [-1.6, 1.6]) for (let k = 0; k < 9; k++) for (const dz of [-0.3, 0.05]) list.push(m4(LOTP.x - 2.4 + k * 0.6, 0.8 + (dz > 0 ? 0.05 : 0), LOTP.z + row + dz, 0, 1.15, 1, 1.1, 0.18));
    return list;
  }, []);
  // 주차면에 앞머리를 통로 쪽으로 세운 차
  const cars = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const colors: THREE.Color[] = [];
    for (const i of [0, 1, 3, 4, 6, 7, 9, 11, 12, 14, 16]) {
      const row = i < 9 ? -1.6 : 1.6;
      const k = i % 9;
      if (k > 7) continue;
      list.push(m4(LOTP.x - 2.1 + k * 0.6, 0.04, LOTP.z + row, row < 0 ? -Math.PI / 2 : Math.PI / 2, CAR_SCALE, CAR_SCALE, CAR_SCALE));
      colors.push(CAR_COLORS[(i * 3) % CAR_COLORS.length]);
    }
    return { list, colors };
  }, []);
  // 이상이 생기는 패널 줄 (북쪽 카포트의 가운데 세 칸)
  const flagged = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.9, 0.16, 0.8));
    return g;
  }, []);
  const flagPos: [number, number, number] = [LOTP.x - 2.4 + 4 * 0.6, 0.85, LOTP.z - 1.6 - 0.12];
  useFrame(({ clock }) => {
    const ph = storyPhase(clock.elapsedTime, 20, 5, 5, 7.5);
    stage.current = ph.stage;
    const o = outline.current;
    if (!o) return;
    o.visible = !!ph.stage;
    const m = o.material as THREE.LineBasicMaterial;
    m.color.copy(ph.stage === "alert" ? AMBER : TEAL);
    m.opacity = ph.stage === "alert" ? 0.55 + 0.45 * Math.sin(clock.elapsedTime * 8) : 0.9;
  });
  return (
    <group {...target}>
      <mesh position={[LOTP.x, 0.02, LOTP.z]} receiveShadow>
        <boxGeometry args={[LOTP.w, 0.04, LOTP.d]} />
        <meshStandardMaterial color="#2a3134" roughness={0.9} />
      </mesh>
      <Instances matrices={stalls} cast={false}>
        <boxGeometry args={[0.03, 0.005, 0.9]} />
        <meshStandardMaterial color="#d9dcd6" roughness={0.6} />
      </Instances>
      <Props node="Car" matrices={cars.list} colors={cars.colors} metalness={0.35} roughness={0.35} />
      <Instances matrices={carportPosts}>
        <boxGeometry args={[0.05, 0.76, 0.05]} />
        <meshStandardMaterial color="#c4ccd0" metalness={0.6} roughness={0.35} />
      </Instances>
      <Instances matrices={girders}>
        <boxGeometry args={[0.05, 0.06, 0.07]} />
        <meshStandardMaterial color="#aab4b8" metalness={0.6} roughness={0.35} />
      </Instances>
      <Instances matrices={arms}>
        <boxGeometry args={[0.035, 0.04, 0.05]} />
        <meshStandardMaterial color="#aab4b8" metalness={0.6} roughness={0.35} />
      </Instances>
      <Instances matrices={chargers}>
        <boxGeometry args={[0.08, 0.26, 0.05]} />
        <meshStandardMaterial color="#e9eef0" roughness={0.4} />
      </Instances>
      <Instances matrices={chargerScreens} cast={false}>
        <boxGeometry args={[0.05, 0.05, 0.005]} />
        <meshBasicMaterial color="#5fd3e6" toneMapped={false} />
      </Instances>
      <PvPanels matrices={panels} />
      <Lamps spots={CARPORT_LIGHTS} height={0.79} bare />
      <lineSegments ref={outline} geometry={flagged} position={flagPos} rotation={[0.18, 0, 0]} renderOrder={4}>
        <lineBasicMaterial transparent depthTest={false} toneMapped={false} />
      </lineSegments>
      <StatusIcon position={[flagPos[0], 1.6, flagPos[2]]} stageRef={stage} />
    </group>
  );
}

/* ── 남동: 리모델링 건물(GreenPlanner) — 단열 패널이 덮이며 열 손실이 준다 ── */

export function Remodeling() {
  const target = useFacility("greenplanner");
  const sim = useSim();
  const facade = useMemo(() => facadeTextures({ cols: 9, rows: 5, frame: "#b9ad97", glass: "#4e5d62", litRatio: 0.3, seed: 21 }), []);
  const cover = useRef<THREE.Mesh>(null);
  const leak = useRef<THREE.Mesh>(null);
  const scaffold = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const z = OLD.z + OLD.d / 2 + 0.18;
    for (let k = 0; k <= 6; k++) list.push(m4(OLD.x - OLD.w / 2 + (k * OLD.w) / 6, OLD.h / 2, z, 0, 1, OLD.h, 1));
    for (let r = 1; r <= 5; r++) list.push(m4(OLD.x, (r * OLD.h) / 5, z, Math.PI / 2, 1, OLD.w, 1, Math.PI / 2));
    return list;
  }, []);
  useFrame(({ clock }) => {
    // 18초 주기: 12초 동안 서쪽부터 패널이 덮이고 6초 머문다
    const u = clock.elapsedTime % 18;
    const p = Math.min(1, u / 12);
    const c = cover.current;
    const l = leak.current;
    if (c) {
      c.scale.x = Math.max(p, 0.001);
      c.position.x = OLD.x - OLD.w / 2 + (OLD.w * p) / 2;
    }
    if (l) {
      const rest = 1 - p;
      l.visible = rest > 0.01;
      l.scale.x = Math.max(rest, 0.001);
      l.position.x = OLD.x + OLD.w / 2 - (OLD.w * rest) / 2;
      (l.material as THREE.MeshBasicMaterial).opacity = (0.18 + sim.current.dark * 0.3) * (0.75 + 0.25 * Math.sin(clock.elapsedTime * 2));
    }
  });
  return (
    <group {...target}>
      <Building x={OLD.x} z={OLD.z} w={OLD.w} d={OLD.d} h={OLD.h} facade={facade} roof="#6c6256" />
      <Parapet x={OLD.x} z={OLD.z} w={OLD.w} d={OLD.d} h={OLD.h} color="#857a6c" />
      <mesh ref={cover} position={[OLD.x, OLD.h / 2, OLD.z + OLD.d / 2 + 0.03]} castShadow>
        <boxGeometry args={[OLD.w, OLD.h, 0.05]} />
        <meshStandardMaterial color="#9fc3cc" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 아직 덮이지 않은 외벽에서 새는 열 */}
      <mesh ref={leak} position={[OLD.x, OLD.h / 2, OLD.z + OLD.d / 2 + 0.06]} renderOrder={2}>
        <boxGeometry args={[OLD.w, OLD.h, 0.02]} />
        <meshBasicMaterial color="#ff7a3d" transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[OLD.x - OLD.w / 2 - 0.03, OLD.h / 2, OLD.z]} castShadow>
        <boxGeometry args={[0.05, OLD.h, OLD.d]} />
        <meshStandardMaterial color="#9fc3cc" metalness={0.3} roughness={0.4} />
      </mesh>
      <Instances matrices={scaffold}>
        <cylinderGeometry args={[0.012, 0.012, 1, 6]} />
        <meshStandardMaterial color="#d9a441" metalness={0.5} roughness={0.5} />
      </Instances>
    </group>
  );
}

const FARM = { x: 10.9, z: 6.4, w: 3.8, d: 4.6 };

export function PvFarm() {
  const target = useFacility("pvRems");
  const panels = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) list.push(m4(FARM.x - 1.55 + c * 0.62, 0.22, FARM.z - 1.8 + r * 0.9, 0, 1.2, 1, 1.25, 0.5));
    return list;
  }, []);
  // 가대: 남쪽(앞)은 낮고 북쪽(뒤)은 높은 기둥 + 줄마다 가로 레일
  const posts = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 6; c++) {
        const x = FARM.x - 1.55 + c * 0.62;
        const z = FARM.z - 1.8 + r * 0.9;
        list.push(m4(x, 0.07, z + 0.14, 0, 1, 0.14, 1), m4(x, 0.15, z - 0.14, 0, 1, 0.3, 1));
      }
    return list;
  }, []);
  const rails = useMemo(() => Array.from({ length: 5 }, (_, r) => m4(FARM.x, 0.2, FARM.z - 1.8 + r * 0.9, 0, 3.7 / 0.03, 1, 1)), []);
  return (
    <group {...target}>
      <FencedPad x={FARM.x} z={FARM.z} w={FARM.w} d={FARM.d} color="#4f6b55" />
      <Instances matrices={posts}>
        <boxGeometry args={[0.025, 1, 0.025]} />
        <meshStandardMaterial color="#9aa5a9" metalness={0.6} roughness={0.4} />
      </Instances>
      <Instances matrices={rails}>
        <boxGeometry args={[0.03, 0.025, 0.03]} />
        <meshStandardMaterial color="#9aa5a9" metalness={0.6} roughness={0.4} />
      </Instances>
      <PvPanels matrices={panels} />
    </group>
  );
}

export function Fillers() {
  const pvTarget = useFacility("pvRems");
  const a = useMemo(() => facadeTextures({ cols: 8, rows: 4, frame: "#3d4d53", glass: "#6a8f98", litRatio: 0.35, seed: 3 }), []);
  const b = useMemo(() => facadeTextures({ cols: 6, rows: 3, frame: "#c9c2b4", glass: "#55666b", litRatio: 0.35, seed: 11 }), []);
  const roofPv = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 2; r++) list.push(m4(-11 - 0.6 + c * 0.6, 1.95, -5.5 - 0.3 + r * 0.6, 0, 1, 1, 1, 0.38));
    return list;
  }, []);
  return (
    <>
      <Building x={-11} z={-5.5} w={2.4} d={2} h={1.8} facade={a} />
      <Building x={-10.8} z={-1.9} w={2} d={1.2} h={1.2} facade={b} />
      <Building x={6.4} z={-1.9} w={1.6} d={1} h={0.9} facade={b} />
      <Parapet x={-11} z={-5.5} w={2.4} d={2} h={1.8} />
      <Parapet x={-10.8} z={-1.9} w={2} d={1.2} h={1.2} color="#8f887b" />
      <Parapet x={6.4} z={-1.9} w={1.6} d={1} h={0.9} color="#8f887b" />
      <RoofUnits
        spots={[
          [-11.35, 1.28, -1.95, 0],
          [-10.95, 1.28, -1.95, 0],
          [-10.3, 1.28, -2.05, Math.PI / 2],
          [6.55, 0.98, -1.95, 0],
        ]}
        scale={0.12}
      />
      <group {...pvTarget}>
        <PvPanels matrices={roofPv} />
      </group>
    </>
  );
}

/* ── 차 (밤에는 전조등) ───────────────────────────────────────────── */

export function Traffic() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const lights = useRef<THREE.InstancedMesh>(null);
  const cars = useMemo(
    () => [
      { axis: "x", lane: -0.28, speed: 1.1, offset: 0 },
      { axis: "x", lane: -0.28, speed: 1.1, offset: 0.45 },
      { axis: "x", lane: 0.28, speed: -0.9, offset: 0.2 },
      { axis: "x", lane: 0.28, speed: -0.9, offset: 0.75 },
      { axis: "z", lane: -0.72, speed: 0.8, offset: 0.1 },
      { axis: "z", lane: -1.28, speed: -0.8, offset: 0.6 },
    ],
    [],
  );
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), e: new THREE.Euler(), f: new THREE.Vector3() }), []);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    const head = lights.current;
    if (!mesh || !head) return;
    const glow = sim.current.dark;
    cars.forEach((c, i) => {
      const span = c.axis === "x" ? PLATE.w : PLATE.d;
      let u = ((clock.elapsedTime * Math.abs(c.speed)) / span + c.offset) % 1;
      if (c.speed < 0) u = 1 - u;
      const pos = -span / 2 + 0.3 + u * (span - 0.6);
      if (c.axis === "x") tmp.p.set(pos, 0.03, c.lane);
      else tmp.p.set(c.lane, 0.03, pos);
      // 차 모델은 +x 가 앞 — 달리는 방향으로 돌린다
      const forward = c.speed > 0;
      tmp.q.setFromEuler(tmp.e.set(0, c.axis === "x" ? (forward ? 0 : Math.PI) : forward ? -Math.PI / 2 : Math.PI / 2, 0));
      tmp.s.setScalar(CAR_SCALE);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
      // 진행 방향 앞쪽에 전조등 빛
      const dir = Math.sign(c.speed);
      tmp.f.copy(tmp.p).add(c.axis === "x" ? new THREE.Vector3(dir * 0.6, 0.005, 0) : new THREE.Vector3(0, 0.005, dir * 0.6));
      tmp.s.setScalar(Math.max(glow, 0.001));
      head.setMatrixAt(i, tmp.m.compose(tmp.f, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
  });
  const pool = useMemo(() => poolTexture(), []);
  const initial = useMemo(() => cars.map(() => m4(0, -5, 0)), [cars]);
  const colors = useMemo(() => cars.map((_, i) => CAR_COLORS[(i * 2 + 1) % CAR_COLORS.length]), [cars]);
  return (
    <>
      <Props
        node="Car"
        matrices={initial}
        colors={colors}
        metalness={0.35}
        roughness={0.35}
        meshRef={(m) => {
          ref.current = m;
        }}
      />
      <instancedMesh ref={lights} args={[undefined, undefined, cars.length]} frustumCulled={false} renderOrder={1}>
        <boxGeometry args={[0.7, 0.002, 0.4]} />
        <meshBasicMaterial map={pool} color="#fff1cf" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

/* ── 선택한 시설 바닥이 빛난다 ────────────────────────────────────── */

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.0)");
  grad.addColorStop(0.7, "rgba(255,255,255,0.35)");
  grad.addColorStop(0.92, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Highlight() {
  const { active } = useDistrict();
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => glowTexture(), []);
  const zones = active ? FACILITY[active].zones : [];
  useFrame(({ clock }) => {
    ref.current?.children.forEach((c) => {
      ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.65 + Math.sin(clock.elapsedTime * 4) * 0.25;
    });
  });
  return (
    <group ref={ref}>
      {zones.map((z, i) => (
        <mesh key={`${active}-${i}`} position={[z.x, 0.06, z.z]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
          <planeGeometry args={[z.w + 0.6, z.d + 0.6]} />
          <meshBasicMaterial map={tex} color={TEAL} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
