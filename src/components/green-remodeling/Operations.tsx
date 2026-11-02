"use client";

/**
 * 운영 — 업무 빌딩 6층. 원격검침 · 센서 → 운전 시간 · 설정 온도 → 대기전력 차단 → 조명 자동 소등 (BEMS).
 * 공사가 없어 겉모습은 그대로고, 데이터가 보인다: 층마다 계측기가 켜지고, 층을 두르는 띠가 낭비만큼 주황으로 빛나다가
 * 단계마다 청록으로 식는다. 계측 값은 모서리 선을 따라 옥상 게이트웨이로 올라간다. 밤에 켜 둔 조명은 마지막 단계에서 꺼진다.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GR_SPECS, hash01, occupancyAt, phaseAt, specHeight, useGrSim } from "./grModel";
import { Curtain, curtainLightMaterial, setCurtainLights } from "./Curtain";

const S = GR_SPECS.operations;
const TOP = specHeight(S);
const TEAL = new THREE.Color("#49B6CA");
const AMBER = new THREE.Color("#F5A54A");
/** 층마다 시공 전 낭비 정도 (0.45~1) */
const WASTE = Array.from({ length: S.floors }, (_, f) => 0.45 + hash01(f, 21) * 0.55);
const PULSES = 8;
// 계측 값이 올라가는 모서리 (남동)
const CORNER = new THREE.Vector3(S.w / 2 + 0.03, 0, S.d / 2 + 0.03);

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; c: THREE.Color };

export default function Operations() {
  const sim = useGrSim();
  const lights = useMemo(() => curtainLightMaterial(S), []);
  const bands = useRef<THREE.InstancedMesh>(null);
  const sensors = useRef<THREE.InstancedMesh>(null);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const gateway = useRef<THREE.Group>(null);
  const riser = useRef<THREE.Mesh>(null);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: new THREE.Color() }), []);

  // 층 띠: 층 높이 가운데, 벽에서 2.5 cm 떨어져 건물을 두르는 네 면 (위 · 아래는 없다)
  const bandGeo = useMemo(() => {
    const w = S.w + 0.05;
    const d = S.d + 0.05;
    const h = S.fh * 0.86;
    return mergeGeometries([
      new THREE.PlaneGeometry(w, h).translate(0, 0, d / 2),
      new THREE.PlaneGeometry(w, h).rotateY(Math.PI).translate(0, 0, -d / 2),
      new THREE.PlaneGeometry(d, h).rotateY(Math.PI / 2).translate(w / 2, 0, 0),
      new THREE.PlaneGeometry(d, h).rotateY(-Math.PI / 2).translate(-w / 2, 0, 0),
    ])!;
  }, []);

  useFrame(({ clock }) => {
    const s = sim.current;
    const t = s.progress.operations;
    const ph = phaseAt("operations", t);
    const time = clock.elapsedTime;
    const scanY = ph.scan * TOP * 1.05;
    // 단계마다 낭비가 1/3 씩 줄어든다 (아래층부터)
    const fix = (f: number) => ph.steps.reduce((sum, a) => sum + Math.min(1, Math.max(0, (a - (f / S.floors) * 0.6) / 0.4)), 0) / ph.steps.length;

    if (bands.current) {
      for (let f = 0; f < S.floors; f++) {
        const y = f * S.fh + S.fh / 2;
        const seen = t > 0 ? THREE.MathUtils.smoothstep(scanY, y - 0.1, y + 0.1) : 0;
        const left = WASTE[f] * (1 - fix(f));
        tmp.p.set(0, y, 0);
        tmp.q.identity();
        tmp.s.setScalar(seen > 0.01 ? 1 : 1e-4);
        bands.current.setMatrixAt(f, tmp.m.compose(tmp.p, tmp.q, tmp.s));
        // 낭비가 클수록 주황 · 밝게, 다 고치면 청록으로 은은하게. 다 끝나면 서서히 사라진다
        const blink = left > 0.3 && fix(f) === 0 ? 0.8 + 0.2 * Math.sin(time * 4 + f) : 1;
        tmp.c.copy(TEAL).lerp(AMBER, Math.min(1, left / 0.7)).multiplyScalar((0.18 + left * 0.5) * blink * seen * (1 - ph.cool * 0.7));
        bands.current.setColorAt(f, tmp.c);
      }
      bands.current.instanceMatrix.needsUpdate = true;
      if (bands.current.instanceColor) bands.current.instanceColor.needsUpdate = true;
    }

    // 계측기: 층마다 네 모서리, 스캔이 지나가면 켜진다
    if (sensors.current) {
      let i = 0;
      for (let f = 0; f < S.floors; f++) {
        const y = f * S.fh + S.fh * 0.88;
        const on = t > 0 ? THREE.MathUtils.smoothstep(scanY, y - 0.05, y + 0.05) : 0;
        for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          tmp.p.set((sx * S.w) / 2 + sx * 0.012, y, (sz * S.d) / 2 + sz * 0.012);
          tmp.s.setScalar(on > 0.01 ? 1 : 1e-4);
          sensors.current.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q.identity(), tmp.s));
          sensors.current.setColorAt(i, tmp.c.copy(TEAL).multiplyScalar(on * (0.8 + 0.4 * Math.sin(time * 3 + i))));
          i++;
        }
      }
      sensors.current.instanceMatrix.needsUpdate = true;
      if (sensors.current.instanceColor) sensors.current.instanceColor.needsUpdate = true;
    }

    // 모서리 선을 따라 옥상 게이트웨이로 올라가는 계측 값
    const link = t > 0 ? Math.min(1, ph.scan * 1.4) : 0;
    if (riser.current) {
      riser.current.visible = link > 0;
      riser.current.scale.y = Math.max(1e-4, link);
      riser.current.position.y = (TOP * link) / 2;
    }
    if (gateway.current) gateway.current.visible = ph.scan >= 1;
    if (pulses.current) {
      for (let i = 0; i < PULSES; i++) {
        const u = (time * 0.35 + i / PULSES) % 1;
        tmp.p.set(CORNER.x, u * TOP, CORNER.z);
        const on = ph.scan >= 1 ? Math.sin(u * Math.PI) : 0;
        tmp.s.setScalar(on > 0.01 ? 1 : 1e-4);
        pulses.current.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q.identity(), tmp.s));
        pulses.current.setColorAt(i, tmp.c.copy(TEAL).multiplyScalar(on * 1.4));
      }
      pulses.current.instanceMatrix.needsUpdate = true;
      if (pulses.current.instanceColor) pulses.current.instanceColor.needsUpdate = true;
    }

    // 창 불빛: 시공 전엔 사람이 없어도 켜 둔 칸이 많다(45%) → 조명 자동 소등 단계에서 5%로 줄어든다
    // 업무 빌딩은 저녁에 하나둘 퇴근한다 (재실 곡선을 낮춰 쓴다) — 켜 둔 칸이 눈에 띄게
    setCurtainLights(lights, occupancyAt(s.hour) * 0.6, 0.45 - 0.4 * ph.steps[2], s.dark);
  });

  return (
    <group position={[S.x, 0, S.z]}>
      <Curtain s={S} lights={lights} />
      <instancedMesh ref={bands} args={[bandGeo, undefined, S.floors]} frustumCulled={false} renderOrder={3}>
        <meshBasicMaterial transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={sensors} args={[undefined, undefined, S.floors * 4]} frustumCulled={false}>
        <sphereGeometry args={[0.014, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={riser} position={[CORNER.x, 0, CORNER.z]} visible={false}>
        <boxGeometry args={[0.006, TOP, 0.006]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <instancedMesh ref={pulses} args={[undefined, undefined, PULSES]} frustumCulled={false}>
        <sphereGeometry args={[0.018, 8, 6]} />
        <meshBasicMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      {/* 옥상 게이트웨이 + 안테나 */}
      <group ref={gateway} position={[S.w / 2 - 0.2, TOP, S.d / 2 - 0.2]} visible={false}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.12, 0.1, 0.08]} />
          <meshStandardMaterial color="#d9dee0" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0.03, 0.17, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.16, 6]} />
          <meshStandardMaterial color="#8d9aa0" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0.03, 0.26, 0]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color={TEAL} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
