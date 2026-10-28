"use client";

/**
 * 히어로 3D 설비 — ESS(피크저감 ESS 옥외 캐비닛) · 공기열원 히트펌프.
 * 실제 설치 사진 · 제품 형상을 기준으로 실루엣과 읽히는 디테일만 코드로 만든다. 브랜드 표기는 넣지 않는다.
 * 크기는 실물 비율을 따르되 화면에서 읽히도록 약 1.3배 키웠다 (1 unit = 10 m).
 */

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { EQUIPMENT, LOW_TOP, TEAL, WARM, WHITE } from "./BuildingModel";
import { FLOORS, HVAC_SHARE, PEAK_KW, footprint, reveal, useSim } from "./heroSim";
import { useFocusTarget } from "./focus";
import { scaled, useModelGeometry, useModelMaterial } from "./models";
import { coilTexture, fenceTexture, grilleTexture, louverTexture } from "./textures";

function mat4(x: number, y: number, z: number, ry = 0, rx = 0) {
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0)), new THREE.Vector3(1, 1, 1));
}

/** 같은 부품을 여러 설비에 한 번에 그린다 (설비 위치 × 부품 위치) */
function Parts({ units, locals, children, cast = true }: { units: THREE.Matrix4[]; locals: THREE.Matrix4[]; children: ReactNode; cast?: boolean }) {
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        const m = new THREE.Matrix4();
        let i = 0;
        for (const u of units) for (const l of locals) mesh.setMatrixAt(i++, m.multiplyMatrices(u, l));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[undefined, undefined, units.length * locals.length]}
      castShadow={cast}
      receiveShadow
    >
      {children}
    </instancedMesh>
  );
}

/* ── 공기열원 히트펌프 (상부 토출형 1팬, 테라스 동쪽에 2열 × 4대) ───── */

const HP = { w: 0.11, d: 0.14, h: 0.15, foot: 0.012, fanR: 0.04 };
const HP_TOP = HP.foot + HP.h;
const HP_X = (() => {
  const [lw] = footprint(0);
  const [tw] = footprint(FLOORS - 1);
  return (lw + tw) / 4; // 테라스 동쪽 띠 가운데
})();
const HP_UNITS = [-0.095, 0.095].flatMap((dx) => [-0.55, -0.33, -0.11, 0.11].map((z) => mat4(HP_X + dx, 0, z)));
export const HP_ANCHOR: [number, number, number] = [HP_X + 0.75, LOW_TOP + 0.75, -0.3];
/** 확대 보기 카메라가 바라보는 히트펌프 무리의 가운데 */
export const HP_CENTER = new THREE.Vector3(HP_X, LOW_TOP + 0.15, -0.22);

export function HeatPumps() {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const target = useFocusTarget("hp");

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0] + 0.05, EQUIPMENT[1]);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);
    // 팬 속도는 냉난방 전력에 비례
    angle.current += Math.min(delta, 0.1) * (2 + (s.hpKw / (PEAK_KW * HVAC_SHARE)) * 16);
  });

  return (
    <group ref={group} position={[0, LOW_TOP + 0.07, 0]} {...target}>
      {/* 설비 기초 */}
      <mesh position={[HP_X, 0.006, -0.22]} receiveShadow>
        <boxGeometry args={[0.42, 0.012, 0.98]} />
        <meshStandardMaterial color="#8e999c" roughness={0.9} />
      </mesh>
      <Suspense fallback={<HeatPumpUnitsSimple angle={angle} />}>
        <HeatPumpUnitsModel angle={angle} />
      </Suspense>
      {/* 냉온수 배관: 유닛 서쪽을 따라 고층부 벽으로 들어간다 */}
      {[0.03, 0.055].map((y) => (
        <group key={y}>
          <mesh position={[HP_X - 0.2, y, -0.22]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.9, 10]} />
            <meshStandardMaterial color="#c4cdd0" roughness={0.6} />
          </mesh>
          <mesh position={[HP_X - 0.24, y, 0.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.08, 10]} />
            <meshStandardMaterial color="#c4cdd0" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Blender 모델: 팬 날개는 슈라우드 안(모델 좌표 높이 1.72, 앞쪽 0.05)에서 돈다
const HP_FAN_AT = new THREE.Matrix4().makeTranslation(0, 0.172, 0.005);

function HeatPumpUnitsModel({ angle }: { angle: RefObject<number> }) {
  const body = useModelGeometry("HeatPump");
  const fan = useModelGeometry("HeatPumpFan");
  const material = useModelMaterial(0.5, 0.25);
  const fans = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), r: new THREE.Matrix4(), s: new THREE.Matrix4().makeScale(0.1, 0.1, 0.1) }), []);

  useFrame(() => {
    const mesh = fans.current;
    if (!mesh) return;
    HP_UNITS.forEach((u, i) => {
      // 유닛마다 날개 각도가 조금씩 달라 한꺼번에 도는 것처럼 보이지 않게
      tmp.r.makeRotationY(angle.current + i * 0.7);
      mesh.setMatrixAt(i, tmp.m.multiplyMatrices(u, HP_FAN_AT).multiply(tmp.r).multiply(tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh
        ref={(mesh) => {
          if (!mesh) return;
          HP_UNITS.forEach((u, i) => mesh.setMatrixAt(i, scaled(u)));
          mesh.instanceMatrix.needsUpdate = true;
          mesh.computeBoundingSphere();
        }}
        args={[body, material, HP_UNITS.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh ref={fans} args={[fan, material, HP_UNITS.length]} frustumCulled={false} />
    </>
  );
}

// 모델을 받는 동안 보이는 코드 모델
function HeatPumpUnitsSimple({ angle }: { angle: RefObject<number> }) {
  const blades = useRef<THREE.InstancedMesh>(null);
  const tex = useMemo(() => ({ coil: coilTexture(), grille: grilleTexture() }), []);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), r: new THREE.Matrix4(), b: new THREE.Matrix4().makeTranslation(0, HP_TOP + 0.005, 0) }), []);

  const L = useMemo(() => {
    const { w, d, h, foot } = HP;
    const fx = w / 2 - 0.012;
    const fz = d / 2 - 0.012;
    return {
      feet: [mat4(fx, foot / 2, fz), mat4(-fx, foot / 2, fz), mat4(fx, foot / 2, -fz), mat4(-fx, foot / 2, -fz)],
      body: [mat4(0, foot + h / 2, 0)],
      coil: [mat4(0, foot + h / 2, d / 2 + 0.0015)], // 어두운 코일 면 (+z, 좁은 면)
      panel: [mat4(w / 2 + 0.0015, foot + h / 2 - 0.005, 0)], // 점검 패널 (+x, 넓은 면)
      shroud: [mat4(0, HP_TOP + 0.007, -0.01)],
      grille: [mat4(0, HP_TOP + 0.0145, -0.01, 0, -Math.PI / 2)],
    };
  }, []);

  useFrame(() => {
    const mesh = blades.current;
    if (!mesh) return;
    let i = 0;
    for (const u of HP_UNITS) {
      for (let k = 0; k < 3; k++) {
        tmp.r.makeRotationY(angle.current + (k * Math.PI) / 3);
        tmp.m.multiplyMatrices(u, mat4(0, 0, -0.01)).multiply(tmp.b).multiply(tmp.r);
        mesh.setMatrixAt(i++, tmp.m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Parts units={HP_UNITS} locals={L.feet}>
        <boxGeometry args={[0.014, HP.foot, 0.014]} />
        <meshStandardMaterial color="#2f3a3e" />
      </Parts>
      <Parts units={HP_UNITS} locals={L.body}>
        <boxGeometry args={[HP.w, HP.h, HP.d]} />
        <meshStandardMaterial color="#d9dfe1" metalness={0.25} roughness={0.5} />
      </Parts>
      <Parts units={HP_UNITS} locals={L.coil} cast={false}>
        <boxGeometry args={[HP.w - 0.01, HP.h - 0.012, 0.003]} />
        <meshStandardMaterial map={tex.coil} metalness={0.4} roughness={0.6} />
      </Parts>
      <Parts units={HP_UNITS} locals={L.panel} cast={false}>
        <boxGeometry args={[0.003, HP.h - 0.035, HP.d - 0.04]} />
        <meshStandardMaterial color="#c6ced1" metalness={0.25} roughness={0.5} />
      </Parts>
      <Parts units={HP_UNITS} locals={L.shroud}>
        <cylinderGeometry args={[HP.fanR, HP.fanR + 0.004, 0.014, 32, 1, true]} />
        <meshStandardMaterial color="#aab5b9" metalness={0.5} roughness={0.35} side={THREE.DoubleSide} />
      </Parts>
      <Parts units={HP_UNITS} locals={L.grille} cast={false}>
        <circleGeometry args={[HP.fanR, 32]} />
        <meshStandardMaterial map={tex.grille} transparent alphaTest={0.3} side={THREE.DoubleSide} />
      </Parts>
      <instancedMesh ref={blades} args={[undefined, undefined, HP_UNITS.length * 3]} frustumCulled={false}>
        <boxGeometry args={[HP.fanR * 1.8, 0.002, 0.012]} />
        <meshStandardMaterial color="#2a3438" />
      </instancedMesh>
    </>
  );
}

/* ── 피크저감 ESS (옥외 캐비닛 2기 + 콘크리트 패드 + 메시 펜스) ─────── */

const ESS_CENTER = new THREE.Vector3(-2.1, 0, 1.75);
const CAB = { w: 0.36, h: 0.27, d: 0.18, base: 0.02 };
const CABINETS = [-0.2, 0.2].map((dx) => new THREE.Vector3(ESS_CENTER.x + dx, 0.025, ESS_CENTER.z - 0.05));
const PAD: [number, number] = [1.0, 0.62];
const LED_COUNT = 10;
export const ESS_ANCHOR: [number, number, number] = [ESS_CENTER.x, 0.62, ESS_CENTER.z];
/** 확대 보기 카메라가 바라보는 ESS 캐비닛 가운데 */
export const ESS_CENTER_VIEW = new THREE.Vector3(ESS_CENTER.x, 0.17, ESS_CENTER.z - 0.05);
export const ESS_PORT = new THREE.Vector3(ESS_CENTER.x + 0.42, 0.06, ESS_CENTER.z - 0.1);
export const ESS_ENTRY = new THREE.Vector3(-1.0, 0.06, 1.3);

// 정면(+z) 구성: 제어반 · 양문 · 냉방장치 그릴
const FRONT = { control: 0.09, door: 0.17, hvac: 0.1 };

export function EssUnits() {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const target = useFocusTarget("ess");
  const tex = useMemo(() => ({ louver: louverTexture("#d9dedd", "#8c9799"), fenceLong: fenceTexture(30), fenceShort: fenceTexture(18) }), []);
  const tmp = useMemo(() => ({ c: new THREE.Color(), off: new THREE.Color("#2a3a40") }), []);

  const ledMatrices = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const c of CABINETS) {
      const doorLeft = c.x - CAB.w / 2 + FRONT.control;
      for (let k = 0; k < LED_COUNT; k++) {
        list.push(new THREE.Matrix4().makeTranslation(doorLeft + 0.02 + k * 0.0145, c.y + CAB.base + CAB.h - 0.022, c.z + CAB.d / 2 + 0.006));
      }
    }
    return list;
  }, []);

  // 펜스 기둥: 패드 둘레 25 cm 간격
  const posts = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const [pw, pd] = PAD;
    const hw = pw / 2 - 0.02;
    const hd = pd / 2 - 0.02;
    for (let x = -hw; x <= hw + 0.001; x += (hw * 2) / 4) {
      list.push(mat4(ESS_CENTER.x + x, 0.11, ESS_CENTER.z - hd), mat4(ESS_CENTER.x + x, 0.11, ESS_CENTER.z + hd));
    }
    for (let z = -hd + (hd * 2) / 3; z < hd - 0.01; z += (hd * 2) / 3) {
      list.push(mat4(ESS_CENTER.x - hw, 0.11, ESS_CENTER.z + z), mat4(ESS_CENTER.x + hw, 0.11, ESS_CENTER.z + z));
    }
    return list;
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    const mesh = leds.current;
    if (!g || !mesh) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0] - 0.04, EQUIPMENT[1]);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);

    // 충전 중이면 틸, 방전 중이면 앰버로 잔량만큼 켜진다. 맨 끝 칸이 숨 쉬듯 깜빡인다
    const lit = Math.round(s.essSoc * LED_COUNT);
    const mode = s.essKw < -1 ? TEAL : s.essKw > 1 ? WARM : WHITE;
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 4) * 0.45;
    for (let u = 0; u < CABINETS.length; u++) {
      for (let k = 0; k < LED_COUNT; k++) {
        if (k < lit) tmp.c.copy(mode).multiplyScalar(k === lit - 1 && Math.abs(s.essKw) > 1 ? pulse : 1);
        else tmp.c.copy(tmp.off);
        mesh.setColorAt(u * LED_COUNT + k, tmp.c);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const [pw, pd] = PAD;
  const fenceH = 0.17;

  return (
    <group ref={group} {...target}>
      {/* 콘크리트 패드 */}
      <mesh position={[ESS_CENTER.x, 0.0125, ESS_CENTER.z]} receiveShadow castShadow>
        <boxGeometry args={[pw, 0.025, pd]} />
        <meshStandardMaterial color="#b4bbbc" roughness={0.95} />
      </mesh>

      <Suspense fallback={<EssCabinetsSimple louver={tex.louver} />}>
        <EssCabinetsModel />
      </Suspense>

      <instancedMesh
        ref={(mesh) => {
          leds.current = mesh;
          if (!mesh) return;
          // 첫 렌더 전에 instanceColor 를 만들어 두어야 셰이더가 인스턴스 색을 쓴다
          ledMatrices.forEach((m, i) => {
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, tmp.off);
          });
          mesh.instanceMatrix.needsUpdate = true;
        }}
        args={[undefined, undefined, ledMatrices.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.01, 0.01, 0.003]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* 메시 펜스 */}
      <Parts units={posts} locals={[new THREE.Matrix4()]}>
        <boxGeometry args={[0.008, 0.2, 0.008]} />
        <meshStandardMaterial color="#56686c" metalness={0.5} roughness={0.5} />
      </Parts>
      {/* 펜스 위 난간대 */}
      {(
        [
          [0, -pd / 2 + 0.02, pw - 0.04, 0],
          [0, pd / 2 - 0.02, pw - 0.04, 0],
          [-pw / 2 + 0.02, 0, pd - 0.04, Math.PI / 2],
          [pw / 2 - 0.02, 0, pd - 0.04, Math.PI / 2],
        ] as const
      ).map(([x, z, len, ry], i) => (
        <mesh key={i} position={[ESS_CENTER.x + x, 0.205, ESS_CENTER.z + z]} rotation={[0, ry, 0]} castShadow>
          <boxGeometry args={[len, 0.005, 0.005]} />
          <meshStandardMaterial color="#56686c" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {(
        [
          [0, -pd / 2 + 0.02, pw - 0.04, 0, tex.fenceLong],
          [0, pd / 2 - 0.02, pw - 0.04, 0, tex.fenceLong],
          [-pw / 2 + 0.02, 0, pd - 0.04, Math.PI / 2, tex.fenceShort],
          [pw / 2 - 0.02, 0, pd - 0.04, Math.PI / 2, tex.fenceShort],
        ] as const
      ).map(([x, z, len, ry, map], i) => (
        <mesh key={i} position={[ESS_CENTER.x + x, 0.025 + fenceH / 2, ESS_CENTER.z + z]} rotation={[0, ry, 0]}>
          <planeGeometry args={[len, fenceH]} />
          <meshStandardMaterial map={map} transparent alphaTest={0.35} side={THREE.DoubleSide} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function EssCabinetsModel() {
  const geometry = useModelGeometry("EssCabinet");
  const material = useModelMaterial(0.55, 0.15);
  return (
    <>
      {CABINETS.map((c, i) => (
        <mesh key={i} geometry={geometry} material={material} position={c} scale={0.1} castShadow receiveShadow />
      ))}
    </>
  );
}

// 모델을 받는 동안 보이는 코드 모델
function EssCabinetsSimple({ louver }: { louver: THREE.Texture }) {
  const front = CAB.d / 2;
  return (
    <>
      {CABINETS.map((c, i) => (
        <group key={i} position={c}>
          <mesh position={[0, CAB.base / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[CAB.w + 0.01, CAB.base, CAB.d + 0.01]} />
            <meshStandardMaterial color="#8f999c" roughness={0.7} />
          </mesh>
          <mesh position={[0, CAB.base + CAB.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[CAB.w, CAB.h, CAB.d]} />
            <meshStandardMaterial color="#e9ecea" roughness={0.55} metalness={0.15} />
          </mesh>
          {/* 지붕 캡 */}
          <mesh position={[0, CAB.base + CAB.h + 0.006, 0]} castShadow>
            <boxGeometry args={[CAB.w + 0.02, 0.012, CAB.d + 0.03]} />
            <meshStandardMaterial color="#d2d8d9" roughness={0.5} />
          </mesh>
          {/* 도어 경계 */}
          {[-CAB.w / 2 + FRONT.control, -CAB.w / 2 + FRONT.control + FRONT.door / 2, -CAB.w / 2 + FRONT.control + FRONT.door].map((x) => (
            <mesh key={x} position={[x, CAB.base + CAB.h / 2, front + 0.001]}>
              <boxGeometry args={[0.002, CAB.h - 0.03, 0.002]} />
              <meshBasicMaterial color="#9aa5a8" />
            </mesh>
          ))}
          {/* 제어반: 주황 상단 띠 · 표시창 */}
          <mesh position={[-CAB.w / 2 + FRONT.control / 2, CAB.base + CAB.h - 0.03, front + 0.0015]}>
            <boxGeometry args={[FRONT.control - 0.014, 0.024, 0.002]} />
            <meshStandardMaterial color="#e5762c" roughness={0.5} />
          </mesh>
          <mesh position={[-CAB.w / 2 + FRONT.control / 2, CAB.base + CAB.h - 0.075, front + 0.0015]}>
            <boxGeometry args={[0.03, 0.022, 0.002]} />
            <meshStandardMaterial color="#1c272b" roughness={0.3} />
          </mesh>
          {/* 손잡이 · 경고 라벨 */}
          {[-0.012, 0.012].map((dx) => (
            <mesh key={dx} position={[-CAB.w / 2 + FRONT.control + FRONT.door / 2 + dx, CAB.base + CAB.h * 0.5, front + 0.004]}>
              <boxGeometry args={[0.004, 0.032, 0.006]} />
              <meshStandardMaterial color="#7d888b" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
          <mesh position={[-CAB.w / 2 + FRONT.control + FRONT.door * 0.78, CAB.base + CAB.h - 0.06, front + 0.0015]}>
            <boxGeometry args={[0.018, 0.018, 0.002]} />
            <meshStandardMaterial color="#f0c22e" roughness={0.5} />
          </mesh>
          {/* 냉방장치 루버 그릴 */}
          <mesh position={[CAB.w / 2 - FRONT.hvac / 2, CAB.base + CAB.h * 0.48, front + 0.002]}>
            <boxGeometry args={[FRONT.hvac - 0.016, CAB.h * 0.62, 0.004]} />
            <meshStandardMaterial map={louver} roughness={0.6} />
          </mesh>
        </group>
      ))}

    </>
  );
}
