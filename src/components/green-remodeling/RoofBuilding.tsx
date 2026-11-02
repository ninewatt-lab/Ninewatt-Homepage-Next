"use client";

/**
 * 지붕 · 신재생 — 도서관 2층(넓은 평지붕). 지붕 열화상 → 옥상 단열 · 쿨루프 → 태양광.
 * 단열판이 칸마다 내려앉은 뒤 밝은 반사 마감으로 덮이고(열화상이 식는다), 남쪽으로 15° 기운 태양광 모듈이 줄마다 올라간다.
 * 모듈 수는 energy.py 의 설비 용량(옥상 면적의 45%, 430 W 모듈)과 같게 맞춘다.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { pvTexture } from "@/components/hero/textures";
import { GR_ENERGY, GR_SPECS, LAMP_WARM, easeOut, hash01, occupancyAt, phaseAt, piece, specHeight, useGrSim } from "./grModel";
import { Shell, makeFaces, paintLights, setThermal, thermalMaterial, useWindowLights, windowSlots } from "./Shell";

const S = GR_SPECS.roof;
const TOP = specHeight(S);
const ROWS = 5;
const COLS = 8;
const RW = S.w - 0.08;
const RD = S.d - 0.08;
const CW = RW / COLS;
const CD = RD / ROWS;
/** 430 W 모듈 (1.13 × 1.72 m, 세로로 놓는다) */
const MODULE = { w: 0.113, l: 0.172 };
const MODULES = Math.round(((GR_ENERGY.roof.pvKw ?? 0) * 1000) / 430);
const TILT_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler((15 * Math.PI) / 180, 0, 0));

const BOARD = new THREE.Color("#cdb877");
const MEMBRANE = new THREE.Color("#e8ecee");

type Tmp = { m: THREE.Matrix4; p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; c: THREE.Color };

/** 모듈 자리: 줄(남→북) 마다 같은 수, 줄 간격은 앞줄 그림자를 피할 만큼 */
const PV_SLOTS = (() => {
  const rows = 6;
  const per = Math.ceil(MODULES / rows);
  const pitch = (RD - 0.2) / rows;
  const span = per * (MODULE.w + 0.012);
  const list: { x: number; z: number; row: number; order: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < per && list.length < MODULES; k++) {
      list.push({ x: -span / 2 + (k + 0.5) * (MODULE.w + 0.012), z: RD / 2 - 0.15 - (r + 0.5) * pitch, row: r, order: (r * per + k) / MODULES });
    }
  }
  return list;
})();

function stepBoards(mesh: THREE.InstancedMesh, phase: number, tmp: Tmp) {
  // 앞 70% 동안 판이 깔리고, 뒤 30% 동안 반사 마감으로 덮인다
  const lay = Math.min(1, phase / 0.7);
  const coat = THREE.MathUtils.smoothstep(phase, 0.7, 1);
  tmp.q.identity();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const e = easeOut(piece(lay, i / (ROWS * COLS)));
      tmp.p.set(-RW / 2 + (c + 0.5) * CW, TOP + 0.012 + (1 - e) * 0.5, RD / 2 - (r + 0.5) * CD);
      tmp.s.setScalar(e > 0 ? 1 : 1e-4);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
      mesh.setColorAt(i, tmp.c.copy(BOARD).lerp(MEMBRANE, coat));
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function stepModules(mesh: THREE.InstancedMesh, phase: number, tmp: Tmp) {
  tmp.q.copy(TILT_Q);
  for (let i = 0; i < PV_SLOTS.length; i++) {
    const m = PV_SLOTS[i];
    const e = easeOut(piece(phase, m.order));
    tmp.p.set(m.x, TOP + 0.05 + (1 - e) * 0.4, m.z);
    tmp.s.setScalar(e > 0 ? 1 : 1e-4);
    mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function glowPv(m: THREE.MeshStandardMaterial, solarKw: number) {
  m.emissiveIntensity = 0.12 + (solarKw / 18) * 0.5;
}

export default function RoofBuilding() {
  const sim = useGrSim();
  const faces = useMemo(() => makeFaces(S), []);
  const slots = useMemo(() => windowSlots(S, faces), [faces]);
  const lights = useWindowLights(S, slots);
  const boards = useRef<THREE.InstancedMesh>(null);
  const modules = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  const tmp = useMemo<Tmp>(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), c: new THREE.Color() }), []);
  const pv = useMemo(() => pvTexture(), []);
  const pvMat = useMemo(() => new THREE.MeshStandardMaterial({ map: pv, emissive: "#49B6CA", emissiveMap: pv, emissiveIntensity: 0.15, metalness: 0.45, roughness: 0.3 }), [pv]);

  const thermal = useMemo(() => {
    const g = new THREE.PlaneGeometry(RW, RD).rotateX(-Math.PI / 2).translate(0, TOP + 0.03, 0);
    return { geometry: g, material: thermalMaterial({ floors: ROWS, bays: COLS, bay0: 0, total: COLS, mode: "roof" }) };
  }, []);

  useFrame(() => {
    const s = sim.current;
    const t = s.progress.roof;
    const ph = phaseAt("roof", t);
    if (boards.current && modules.current && t !== last.current) {
      last.current = t;
      stepBoards(boards.current, ph.steps[0], tmp);
      stepModules(modules.current, ph.steps[1], tmp);
    }
    setThermal(thermal.material, t <= 0 || t >= 1 ? 0 : Math.min(1, t / 0.02) * (1 - Math.max(ph.cool, ph.steps[1])), ph.scan * 1.05, Math.min(1, ph.steps[0] / 0.7));
    // 발전량만큼 패널이 빛난다
    glowPv(pvMat, s.solarKw);
    const occ = occupancyAt(s.hour);
    paintLights(lights, slots, (w, c) => c.copy(LAMP_WARM).multiplyScalar(s.dark * (0.05 + 0.75 * THREE.MathUtils.smoothstep(occ, hash01(w.index, 7) - 0.05, hash01(w.index, 7) + 0.05))), tmp.c);
  });

  return (
    <group position={[S.x, 0, S.z]}>
      <Shell s={S} faces={faces} slots={slots} />
      <primitive object={lights} />
      <instancedMesh ref={boards} args={[undefined, undefined, ROWS * COLS]} frustumCulled={false} castShadow receiveShadow>
        <boxGeometry args={[CW - 0.006, 0.014, CD - 0.006]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={modules} args={[undefined, pvMat, PV_SLOTS.length]} frustumCulled={false} castShadow receiveShadow>
        <boxGeometry args={[MODULE.w, 0.004, MODULE.l]} />
      </instancedMesh>
      <mesh geometry={thermal.geometry} material={thermal.material} renderOrder={3} />
    </group>
  );
}
