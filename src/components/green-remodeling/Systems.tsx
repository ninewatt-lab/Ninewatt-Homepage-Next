"use client";

/**
 * 설비 — 주민센터 2층. 설비 진단 → 히트펌프 → 전열교환 환기 → LED 조명.
 * 옥상의 노후 보일러실 · 굴뚝 · 냉방 실외기가 진단 때 뜨겁게 빛나고, 히트펌프 단계에서 위로 들려 나간 자리에
 * 공기열원 히트펌프(홈 히어로와 같은 모델)가 내려와 팬이 돈다. 환기 단계에서는 전열교환기가 놓이고
 * 들어오는 바깥 공기(파랑) · 나가는 공기(주황)가 흐른다. LED 단계에서는 창 불빛이 층마다 푸른 형광등 → 따뜻한 LED 로 바뀐다.
 */

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useModelGeometry, useModelMaterial } from "@/components/hero/models";
import { GR_SPECS, LAMP_COOL, LAMP_WARM, easeOut, hash01, occupancyAt, phaseAt, piece, specHeight, useGrSim, type GrSim } from "./grModel";
import { Shell, flush, makeFaces, useWindowLights, windowSlots, type WindowSlot } from "./Shell";

const S = GR_SPECS.systems;
const TOP = specHeight(S);

// 옥상 배치 (건물 좌표)
const BOILER = { x: -0.62, z: -0.22, w: 0.42, h: 0.22, d: 0.34 };
const CHIMNEY = { x: -0.74, z: -0.32, r: 0.03, h: 0.4 };
const UNIT_X = [0.05, 0.3, 0.55, 0.8];
const UNIT_Z = 0.3;
const ERV = { x: -0.6, z: -0.2, w: 0.34, h: 0.14, d: 0.22 };
const HOT = new THREE.Color("#ff5a2a");

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; r: THREE.Matrix4; c: THREE.Color };

/** 히트펌프 (모델) — 바깥에서 내려와 앉고, 다 앉으면 팬이 돈다 */
function HeatPumpUnits({ phase }: { phase: React.RefObject<number> }) {
  const body = useModelGeometry("HeatPump");
  const fan = useModelGeometry("HeatPumpFan");
  const material = useModelMaterial(0.5, 0.25);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const fans = useRef<THREE.InstancedMesh>(null);
  const angle = useRef(0);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), u: new THREE.Matrix4(), r: new THREE.Matrix4(), k: new THREE.Matrix4(), s: new THREE.Matrix4().makeScale(0.1, 0.1, 0.1), fan: new THREE.Matrix4().makeTranslation(0, 0.172, 0.005) }), []);
  useFrame((_, delta) => {
    const b = bodies.current;
    const f = fans.current;
    if (!b || !f) return;
    const ph = phase.current;
    if (ph >= 1) angle.current += Math.min(delta, 0.1) * 9;
    UNIT_X.forEach((x, i) => {
      // 단계 뒤쪽 절반에 하나씩 내려온다 (앞쪽 절반은 헌 실외기를 치우는 시간)
      const e = easeOut(Math.min(1, Math.max(0, (ph - 0.5 - i * 0.08) / 0.25)));
      const y = TOP + (1 - e) * 0.9;
      tmp.u.makeTranslation(x, y, UNIT_Z);
      const sc = e > 0 ? 1 : 1e-4;
      tmp.k.makeScale(sc, sc, sc);
      b.setMatrixAt(i, tmp.m.copy(tmp.u).multiply(tmp.s).multiply(tmp.k));
      tmp.r.makeRotationY(angle.current + i * 0.7);
      f.setMatrixAt(i, tmp.m.copy(tmp.u).multiply(tmp.fan).multiply(tmp.r).multiply(tmp.s).multiply(tmp.k));
    });
    b.instanceMatrix.needsUpdate = true;
    f.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={bodies} args={[body, material, UNIT_X.length]} frustumCulled={false} castShadow receiveShadow />
      <instancedMesh ref={fans} args={[fan, material, UNIT_X.length]} frustumCulled={false} />
    </>
  );
}

/** 공기 흐름 점: 들어오는 바깥 공기(파랑)는 흡기구로, 나가는 공기(주황)는 배기구에서 */
const AIR = 10;
const AIR_IN = new THREE.Color("#7fd3ff");
const AIR_OUT = new THREE.Color("#ffb070");
function stepAir(mesh: THREE.InstancedMesh, on: number, t: number, tmp: Tmp) {
  for (let i = 0; i < AIR * 2; i++) {
    const out = i >= AIR;
    const u = ((t * 0.45 + (i % AIR) / AIR) % 1 + 1) % 1;
    const sx = ERV.x + (out ? ERV.w / 2 + 0.03 : -ERV.w / 2 - 0.03);
    // 흡기: 바깥(옆 위)에서 흡기구로 들어온다 · 배기: 배기구에서 나가 위로 흩어진다
    const x = out ? sx + u * 0.35 : sx - (1 - u) * 0.35;
    const y = TOP + ERV.h * 0.6 + (out ? u * 0.18 : (1 - u) * 0.1);
    tmp.p.set(x, y, ERV.z);
    const fade = Math.sin(u * Math.PI) * on;
    tmp.s.setScalar(fade > 0.01 ? 1 : 1e-4);
    tmp.q.identity();
    mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    mesh.setColorAt(i, tmp.c.copy(out ? AIR_OUT : AIR_IN).multiplyScalar(fade));
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

type SystemsState = {
  old: React.RefObject<THREE.Group | null>;
  units: React.RefObject<THREE.Group | null>;
  boiler: React.RefObject<THREE.Group | null>;
  smoke: React.RefObject<THREE.Group | null>;
  erv: React.RefObject<THREE.Group | null>;
  air: React.RefObject<THREE.InstancedMesh | null>;
  hpPhase: React.RefObject<number>;
  tmp: Tmp;
  oldMat: THREE.MeshStandardMaterial;
  boilerMat: THREE.MeshStandardMaterial;
  smokeMat: THREE.MeshStandardMaterial;
  lights: THREE.InstancedMesh;
  slots: WindowSlot[];
};

function tickSystems(st: SystemsState, s: GrSim, time: number) {
  const t = s.progress.systems;
  const ph = phaseAt("systems", t);
  st.hpPhase.current = ph.steps[0];
  

  // 진단: 헌 설비가 뜨겁게 깜빡인다 (치울 때까지)
  const hot = t > 0 && ph.steps[0] < 0.5 ? Math.min(1, ph.scan * 3) * (0.55 + 0.45 * Math.sin(time * 5)) : 0;
  st.oldMat.emissive.copy(HOT).multiplyScalar(hot * 0.6);
  st.boilerMat.emissive.copy(HOT).multiplyScalar(hot * 0.5);

  // 히트펌프 단계 앞쪽 절반: 헌 실외기가 하나씩 들려 나가고 보일러실 · 굴뚝이 내려앉는다
  const lift = ph.steps[0] / 0.5;
  if (st.old.current) {
    st.old.current.children.forEach((c, i) => {
      const e = easeOut(Math.min(1, Math.max(0, (lift - i * 0.12) / 0.5)));
      c.position.y = TOP + 0.065 + e * 0.9;
      c.visible = e < 1;
    });
  }
  if (st.boiler.current) {
    const e = easeOut(Math.min(1, Math.max(0, lift)));
    st.boiler.current.scale.y = Math.max(1e-4, 1 - e);
    st.boiler.current.visible = e < 1;
  }
  // 굴뚝 연기 (보일러가 있는 동안)
  if (st.smoke.current) {
    const alive = st.boiler.current?.visible ?? false;
    st.smoke.current.visible = alive;
    st.smoke.current.children.forEach((c, i) => {
      const u = (time * 0.25 + i / st.smoke.current!.children.length) % 1;
      c.position.set(CHIMNEY.x + u * 0.08, TOP + BOILER.h + CHIMNEY.h + u * 0.35, CHIMNEY.z - u * 0.05);
      c.scale.setScalar(0.02 + u * 0.05);
    });
    st.smokeMat.opacity = 0.32 * (st.boiler.current?.scale.y ?? 1);
  }
  // 전열교환기: 놓인 뒤 공기가 흐른다
  if (st.erv.current) {
    const e = easeOut(Math.min(1, ph.steps[1] / 0.5));
    st.erv.current.visible = e > 0;
    st.erv.current.position.y = TOP + (1 - e) * 0.6;
  }
  if (st.air.current) stepAir(st.air.current, Math.min(1, Math.max(0, (ph.steps[1] - 0.5) * 2)), time, st.tmp);

  // 창 불빛: 형광등(푸름 · 조금 어둡고 가끔 깜빡임) → LED(따뜻 · 밝음). 낮에도 실내가 조금 보이게 바닥값을 둔다
  const occ = occupancyAt(s.hour);
  const level = 0.12 + s.dark * 0.75;
  for (const w of st.slots) {
    const lit = THREE.MathUtils.smoothstep(occ, hash01(w.index, 5) - 0.05, hash01(w.index, 5) + 0.05);
    const led = easeOut(piece(ph.steps[2], w.order));
    const flicker = led < 1 && hash01(w.index, 9) > 0.85 ? 0.75 + 0.25 * Math.sin(time * 23 + w.index) : 1;
    st.tmp.c.copy(LAMP_COOL).multiplyScalar(0.6 * flicker).lerp(LAMP_WARM, led);
    st.lights.setColorAt(w.index, st.tmp.c.multiplyScalar(level * lit * (0.75 + 0.35 * led)));
  }
  flush(st.lights);
  if (st.units.current) st.units.current.visible = ph.steps[0] > 0.45;
}

export default function Systems() {
  const sim = useGrSim();
  const faces = useMemo(() => makeFaces(S), []);
  const slots = useMemo(() => windowSlots(S, faces), [faces]);
  const lights = useWindowLights(S, slots);
  const old = useRef<THREE.Group>(null);
  const units = useRef<THREE.Group>(null);
  const boiler = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);
  const erv = useRef<THREE.Group>(null);
  const air = useRef<THREE.InstancedMesh>(null);
  const hpPhase = useRef(0);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), r: new THREE.Matrix4(), c: new THREE.Color() }), []);
  const oldMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a857a", roughness: 0.8, metalness: 0.2 }), []);
  const boilerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#7c7a74", roughness: 0.85 }), []);
  const smokeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9cdd0", transparent: true, opacity: 0.35, depthWrite: false, roughness: 1 }), []);

  const state = useMemo<SystemsState>(() => ({ old, units, boiler, smoke, erv, air, hpPhase, tmp, oldMat, boilerMat, smokeMat, lights, slots }), [tmp, oldMat, boilerMat, smokeMat, lights, slots]);
  useFrame(({ clock }) => tickSystems(state, sim.current, clock.elapsedTime));

  return (
    <group position={[S.x, 0, S.z]}>
      <Shell s={S} faces={faces} slots={slots} />
      <primitive object={lights} />

      {/* 헌 실외기 */}
      <group ref={old}>
        {UNIT_X.map((x) => (
          <mesh key={x} position={[x, TOP + 0.065, UNIT_Z]} material={oldMat} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.12, 0.13]} />
          </mesh>
        ))}
      </group>
      {/* 보일러실 · 굴뚝 */}
      <group ref={boiler} position={[0, TOP, 0]}>
        <mesh position={[BOILER.x, BOILER.h / 2, BOILER.z]} material={boilerMat} castShadow receiveShadow>
          <boxGeometry args={[BOILER.w, BOILER.h, BOILER.d]} />
        </mesh>
        <mesh position={[CHIMNEY.x, BOILER.h + CHIMNEY.h / 2, CHIMNEY.z]} material={boilerMat} castShadow>
          <cylinderGeometry args={[CHIMNEY.r, CHIMNEY.r * 1.15, CHIMNEY.h, 12]} />
        </mesh>
      </group>
      <group ref={smoke}>
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={i} material={smokeMat}>
            <icosahedronGeometry args={[1, 1]} />
          </mesh>
        ))}
      </group>

      {/* 히트펌프 */}
      <group ref={units} visible={false}>
        <Suspense fallback={null}>
          <HeatPumpUnits phase={hpPhase} />
        </Suspense>
      </group>

      {/* 전열교환기 + 흡기 · 배기 후드 */}
      <group ref={erv} visible={false}>
        <mesh position={[ERV.x, ERV.h / 2, ERV.z]} castShadow receiveShadow>
          <boxGeometry args={[ERV.w, ERV.h, ERV.d]} />
          <meshStandardMaterial color="#d9dee0" metalness={0.45} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[ERV.x + side * (ERV.w / 2 + 0.02), ERV.h * 0.6, ERV.z]} rotation={[0, 0, (side * Math.PI) / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.05, 12]} />
            <meshStandardMaterial color="#b9c2c6" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
        {/* 건물 안으로 들어가는 덕트 */}
        <mesh position={[ERV.x, -0.01, ERV.z + ERV.d / 2 + 0.03]}>
          <boxGeometry args={[0.08, 0.04, 0.06]} />
          <meshStandardMaterial color="#b9c2c6" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>
      <instancedMesh ref={air} args={[undefined, undefined, AIR * 2]} frustumCulled={false}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
