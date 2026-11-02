"use client";

/**
 * 외피 — 어린이집 3층. 열화상 진단 → 외단열 판 → 고성능 창호 → 외부 차양(해를 따라 기우는 루버).
 * 외단열 판은 칸마다 창 구멍이 뚫린 판(두께 11 cm)이 바깥에서 날아와 붙는다. 다 붙으면 창이 판 두께만큼 깊어진다.
 * 헌 창틀은 바깥으로 빠지며 작아지고, 새 흰 창틀이 판 구멍 안으로 들어온다. 열화상은 남 · 동 두 면(카메라 쪽)에 덮는다.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GR_SPECS, LAMP_WARM, easeOut, hash01, occupancyAt, phaseAt, piece, useGrSim } from "./grModel";
import { COLORS, GLASS_OUT, HEAD, SILL, Shell, faceQuat, facePlane, makeFaces, paintLights, setThermal, thermalMaterial, totalBays, useWindowLights, windowSize, windowSlots, type WindowSlot } from "./Shell";

const S = GR_SPECS.envelope;
/** 외단열 판 두께 (PF보드 100 mm + 마감) */
const T = 0.011;
const BLADES = 3;
const BLADE_L = 0.045;

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; r: THREE.Quaternion; s: THREE.Vector3; v: THREE.Vector3; e: THREE.Euler; c: THREE.Color };

/** 칸 하나를 덮는 판: 창 구멍이 뚫린 사각형을 두께 T 로 (뒷면이 벽면, +z 가 바깥) */
function panelGeometry(bw: number, ww: number, wh: number) {
  const fh = S.fh;
  const shape = new THREE.Shape();
  shape.moveTo(-bw / 2, 0);
  shape.lineTo(bw / 2, 0);
  shape.lineTo(bw / 2, fh);
  shape.lineTo(-bw / 2, fh);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-ww / 2, SILL * fh);
  hole.lineTo(-ww / 2, SILL * fh + wh);
  hole.lineTo(ww / 2, SILL * fh + wh);
  hole.lineTo(ww / 2, SILL * fh);
  hole.closePath();
  shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false });
}

function frameGeometry(ww: number, wh: number, depth: number, bar: number) {
  return mergeGeometries([
    new THREE.BoxGeometry(ww, bar, depth).translate(0, wh / 2 - bar / 2, 0),
    new THREE.BoxGeometry(ww, bar, depth).translate(0, -wh / 2 + bar / 2, 0),
    new THREE.BoxGeometry(bar, wh, depth).translate(-ww / 2 + bar / 2, 0, 0),
    new THREE.BoxGeometry(bar, wh, depth).translate(ww / 2 - bar / 2, 0, 0),
    // 가운데 세로살 (새 창은 2짝)
    new THREE.BoxGeometry(bar * 0.7, wh, depth).translate(0, 0, 0),
  ])!;
}

function stepPanels(mesh: THREE.InstancedMesh, slots: WindowSlot[], phase: number, tmp: Tmp) {
  for (const w of slots) {
    const e = easeOut(piece(phase, w.order));
    tmp.q.copy(faceQuat(w.face));
    // 칸 아래 · 벽면에서 바깥에서 날아와 붙는다
    tmp.p.copy(w.pos).setY(w.floor * S.fh + (1 - e) * 0.05).addScaledVector(w.face.normal, (1 - e) * 0.35);
    tmp.s.setScalar(e > 0 ? 1 : 1e-4);
    mesh.setMatrixAt(w.index, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function stepFrames(oldMesh: THREE.InstancedMesh, newMesh: THREE.InstancedMesh, slots: WindowSlot[], phase: number, tmp: Tmp) {
  for (const w of slots) {
    const p = piece(phase, w.order);
    const out = easeOut(Math.min(1, p / 0.45));
    const inn = easeOut(Math.max(0, (p - 0.4) / 0.6));
    tmp.q.copy(faceQuat(w.face));
    // 헌 창틀: 벽면 앞 → 판이 붙으면 판 구멍 안쪽에 남는다 → 바깥으로 빠지며 작아진다
    tmp.p.copy(w.pos).addScaledVector(w.face.normal, GLASS_OUT + 0.006 + out * 0.3);
    tmp.s.setScalar(Math.max(1e-4, 1 - out));
    oldMesh.setMatrixAt(w.index, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    // 새 창틀: 바깥에서 들어와 판 구멍 안에 선다
    tmp.p.copy(w.pos).addScaledVector(w.face.normal, GLASS_OUT + 0.007 + (1 - inn) * 0.3);
    tmp.s.setScalar(inn > 0 ? 0.9 + 0.1 * inn : 1e-4);
    newMesh.setMatrixAt(w.index, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  }
  oldMesh.instanceMatrix.needsUpdate = true;
  newMesh.instanceMatrix.needsUpdate = true;
}

/** 루버: 창 위 판 앞에 접혀 있다가 펼쳐지고, 해가 높을수록 더 기운다 (북쪽 창은 달지 않는다) */
function stepLouvers(mesh: THREE.InstancedMesh, slots: WindowSlot[], phase: number, sunAlt: number, tmp: Tmp) {
  const tilt = 0.15 + Math.max(0, sunAlt) * 0.7;
  let i = 0;
  for (const w of slots) {
    if (w.face.key === "N") continue;
    const p = piece(phase, w.order);
    const e = easeOut(p);
    const a = Math.PI / 2 + (tilt - Math.PI / 2) * e;
    // 면 좌표에서 날개는 바깥(+z)으로 펼쳐지며 아래로 기운다 (x 축 회전)
    const face = faceQuat(w.face);
    tmp.q.copy(face).multiply(tmp.r.setFromEuler(tmp.e.set(a, 0, 0)));
    // 날개 가운데 = 경첩 + 회전한 날개 방향 × 길이/2
    tmp.v.set(0, -Math.sin(a), Math.cos(a)).multiplyScalar(BLADE_L / 2).applyQuaternion(face);
    for (let j = 0; j < BLADES; j++) {
      const y = w.floor * S.fh + HEAD * S.fh + 0.03 - j * 0.028 - 0.012;
      tmp.p.copy(w.pos).setY(y).addScaledVector(w.face.normal, T + 0.002).add(tmp.v);
      tmp.s.setScalar(p > 0 ? Math.min(1, p * 4) : 1e-4);
      mesh.setMatrixAt(i * BLADES + j, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    }
    i++;
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export default function Envelope() {
  const sim = useGrSim();
  const faces = useMemo(() => makeFaces(S), []);
  const slots = useMemo(() => windowSlots(S, faces), [faces]);
  const lights = useWindowLights(S, slots);
  const panels = useRef<THREE.InstancedMesh>(null);
  const oldFrames = useRef<THREE.InstancedMesh>(null);
  const newFrames = useRef<THREE.InstancedMesh>(null);
  const louvers = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), r: new THREE.Quaternion(), s: new THREE.Vector3(), v: new THREE.Vector3(), e: new THREE.Euler(), c: new THREE.Color() }), []);
  const louverCount = slots.filter((w) => w.face.key !== "N").length * BLADES;

  const geo = useMemo(() => {
    // 면마다 칸 너비가 조금씩 달라 남 · 동 면 기준으로 만든다 (차이는 1 cm 안팎)
    const f = faces[0];
    const bw = f.length / f.bays;
    const [ww, wh] = windowSize(S, f);
    return {
      panel: panelGeometry(bw + 0.001, ww, wh),
      oldFrame: frameGeometry(ww, wh, 0.012, 0.012),
      newFrame: frameGeometry(ww, wh, 0.016, 0.009),
      blade: new THREE.BoxGeometry(bw * 0.92, 0.003, BLADE_L),
      glass: new THREE.BoxGeometry(ww, wh, 0.004),
    };
  }, [faces]);

  // 유리는 그대로 둔다 (창호 교체 때 색만 맑아진다)
  const glass = useMemo(() => {
    const m = new THREE.InstancedMesh(geo.glass, new THREE.MeshStandardMaterial({ color: COLORS.glass, metalness: 0.7, roughness: 0.08 }), slots.length);
    const q = new THREE.Matrix4();
    slots.forEach((w) => m.setMatrixAt(w.index, q.compose(w.pos.clone().addScaledVector(w.face.normal, GLASS_OUT), faceQuat(w.face), new THREE.Vector3(1, 1, 1))));
    return m;
  }, [geo, slots]);

  // 열화상: 남 · 동 면
  const thermal = useMemo(() => {
    const total = totalBays(faces);
    return faces
      .filter((f) => f.key === "S" || f.key === "E")
      .map((f) => ({ geometry: facePlane(S, f, T + 0.004), material: thermalMaterial({ floors: S.floors, bays: f.bays, bay0: f.bay0, total, mode: "wall" }) }));
  }, [faces]);

  useFrame(() => {
    const s = sim.current;
    const t = s.progress.envelope;
    const ph = phaseAt("envelope", t);
    if (panels.current && oldFrames.current && newFrames.current && t !== last.current) {
      last.current = t;
      stepPanels(panels.current, slots, ph.steps[0], tmp);
      stepFrames(oldFrames.current, newFrames.current, slots, ph.steps[1], tmp);
    }
    if (louvers.current) stepLouvers(louvers.current, slots, ph.steps[2], s.sunAlt, tmp);
    // 열화상: 진단 때 아래에서 위로 덮고, 다 끝나면 걷힌다
    const on = t <= 0 || t >= 1 ? 0 : Math.min(1, t / 0.02) * (1 - ph.cool);
    for (const th of thermal) setThermal(th.material, on, ph.scan * 1.05, ph.steps[0], ph.steps[1]);
    // 창 불빛: 어린이집(평일 7~19시) — 창마다 켜지는 기준이 다르다
    const occ = occupancyAt(s.hour);
    paintLights(lights, slots, (w, c) => c.copy(LAMP_WARM).multiplyScalar(s.dark * (0.05 + 0.75 * THREE.MathUtils.smoothstep(occ, hash01(w.index, 3) - 0.05, hash01(w.index, 3) + 0.05))), tmp.c);
  });

  return (
    <group position={[S.x, 0, S.z]}>
      <Shell s={S} faces={faces} slots={slots} hideWindows />
      <primitive object={glass} />
      <primitive object={lights} />
      <instancedMesh ref={oldFrames} args={[geo.oldFrame, undefined, slots.length]} frustumCulled={false} castShadow>
        <meshStandardMaterial color={COLORS.frameOld} metalness={0.35} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={newFrames} args={[geo.newFrame, undefined, slots.length]} frustumCulled={false} castShadow>
        <meshStandardMaterial color={COLORS.frame} metalness={0.4} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={panels} args={[geo.panel, undefined, slots.length]} frustumCulled={false} castShadow receiveShadow>
        <meshStandardMaterial color={COLORS.panel} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={louvers} args={[geo.blade, undefined, louverCount]} frustumCulled={false} castShadow>
        <meshStandardMaterial color="#d4dadc" metalness={0.6} roughness={0.35} />
      </instancedMesh>
      {thermal.map((th, i) => (
        <mesh key={i} geometry={th.geometry} material={th.material} renderOrder={3} />
      ))}
    </group>
  );
}
