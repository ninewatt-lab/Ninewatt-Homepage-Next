"use client";

/**
 * 예시 건물의 공통 몸체 — 벽 · 층 띠 · 창(유리 · 틀 · 실내 불빛) · 옥상(슬래브 · 파라펫 · 두겁).
 * 모델 파일 없이 코드로 만든다. 건물 좌표는 바닥 가운데가 원점이고, 장면에서는 GR_SPECS 의 자리로 옮긴다.
 *
 * 창은 면(남 · 동 · 북 · 서)마다 칸(bay) 너비로 나눠 층마다 하나씩 둔다. 시공 순서는 남 → 동 → 북 → 서, 아래층부터다
 * (FacadeThermal 셰이더도 같은 순서로 식는다).
 */

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { THERMAL_STOPS, type GrSpec } from "./grModel";

export type FaceKey = "S" | "E" | "N" | "W";
export const FACE_ORDER: FaceKey[] = ["S", "E", "N", "W"];

export type Face = {
  key: FaceKey;
  /** 바깥 방향 · 면을 따라가는 방향(바깥에서 볼 때 왼쪽 → 오른쪽) */
  normal: THREE.Vector3;
  along: THREE.Vector3;
  length: number;
  /** 면 가운데(바닥 높이) */
  center: THREE.Vector3;
  bays: number;
  /** 모든 면을 이어 센 칸 번호의 시작 */
  bay0: number;
};

export type WindowSlot = { face: Face; floor: number; bay: number; pos: THREE.Vector3; order: number; index: number };

/** 창 비율: 층고 대비 창 아래 · 창 위, 칸 너비 대비 창 너비 */
export const SILL = 0.3;
export const HEAD = 0.8;
export const WIN_W = 0.62;
/** 유리 판 가운데가 벽면에서 나온 거리 */
export const GLASS_OUT = 0.004;

export function makeFaces(s: GrSpec): Face[] {
  const defs: Record<FaceKey, [THREE.Vector3, THREE.Vector3, number]> = {
    S: [new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), s.w],
    E: [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1), s.d],
    N: [new THREE.Vector3(0, 0, -1), new THREE.Vector3(-1, 0, 0), s.w],
    W: [new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), s.d],
  };
  let bay0 = 0;
  return FACE_ORDER.map((key) => {
    const [normal, along, length] = defs[key];
    const bays = Math.max(1, Math.round(length / s.bay));
    const half = key === "S" || key === "N" ? s.d / 2 : s.w / 2;
    const face = { key, normal, along, length, center: normal.clone().multiplyScalar(half), bays, bay0 };
    bay0 += bays;
    return face;
  });
}

export const totalBays = (faces: Face[]) => faces.reduce((n, f) => n + f.bays, 0);

/** 창 자리 — 면 바깥면에서 out 만큼 앞, 창 가운데 높이 */
export function windowSlots(s: GrSpec, faces: Face[], out = 0): WindowSlot[] {
  const total = totalBays(faces);
  const list: WindowSlot[] = [];
  for (let floor = 0; floor < s.floors; floor++) {
    for (const face of faces) {
      const bw = face.length / face.bays;
      for (let b = 0; b < face.bays; b++) {
        const pos = face.center
          .clone()
          .addScaledVector(face.along, -face.length / 2 + (b + 0.5) * bw)
          .addScaledVector(face.normal, out);
        pos.y = floor * s.fh + ((SILL + HEAD) / 2) * s.fh;
        list.push({ face, floor, bay: b, pos, order: (floor * total + face.bay0 + b) / (s.floors * total), index: list.length });
      }
    }
  }
  return list;
}

/** 창 칸 너비 · 높이 */
export const windowSize = (s: GrSpec, face: Face) => [(face.length / face.bays) * WIN_W, (HEAD - SILL) * s.fh] as const;

/** 면의 바깥을 향해 놓이도록 회전 (기본 형상은 +z 를 바깥으로 본다) */
export function faceQuat(face: Face) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), face.normal);
}

export const COLORS = {
  wallOld: "#a9a59b",
  wall: "#c9c4bb",
  band: "#9f9b92",
  frameOld: "#5c6366",
  frame: "#e9eef0",
  glass: "#5d8e9c",
  roof: "#3a4b52",
  coping: "#2f4047",
  panel: "#ddd6c9",
};

/* ── 몸체 ─────────────────────────────────────────────────────────── */

function InstancedAt({ geometry, slots, s, children, castShadow }: { geometry: THREE.BufferGeometry; slots: WindowSlot[]; s: GrSpec; children: React.ReactNode; castShadow?: boolean }) {
  const mesh = useMemo(() => {
    const m = new THREE.InstancedMesh(geometry, undefined, slots.length);
    const tmp = new THREE.Matrix4();
    const sc = new THREE.Vector3();
    slots.forEach((w, i) => {
      const [ww] = windowSize(s, w.face);
      sc.set(ww, 1, 1);
      m.setMatrixAt(i, tmp.compose(w.pos, faceQuat(w.face), sc));
    });
    return m;
  }, [geometry, slots, s]);
  return (
    <primitive object={mesh} castShadow={castShadow}>
      {children}
    </primitive>
  );
}

/**
 * old: 시공 전 모습(바랜 벽 · 짙은 옛 창틀). 외피 건물은 창틀 · 유리를 따로 그리므로 hideWindows 로 뺀다.
 */
export function Shell({ s, faces, slots, old = true, hideWindows = false, wallColor }: { s: GrSpec; faces: Face[]; slots: WindowSlot[]; old?: boolean; hideWindows?: boolean; wallColor?: string }) {
  const h = s.floors * s.fh;
  const geo = useMemo(() => {
    const [, wh] = windowSize(s, faces[0]);
    const bars = [
      new THREE.BoxGeometry(1, 0.012, 0.02).translate(0, wh / 2, 0),
      new THREE.BoxGeometry(1, 0.012, 0.02).translate(0, -wh / 2, 0),
      new THREE.BoxGeometry(0.012, wh, 0.02).translate(-0.5, 0, 0),
      new THREE.BoxGeometry(0.012, wh, 0.02).translate(0.5, 0, 0),
    ];
    return {
      frame: mergeGeometries(bars)!,
      glass: new THREE.BoxGeometry(1, wh - 0.01, 0.006),
    };
  }, [s, faces]);
  const glassSlots = useMemo(() => slots.map((w) => ({ ...w, pos: w.pos.clone().addScaledVector(w.face.normal, GLASS_OUT) })), [slots]);
  const frameSlots = useMemo(() => slots.map((w) => ({ ...w, pos: w.pos.clone().addScaledVector(w.face.normal, 0.01) })), [slots]);

  return (
    <group>
      {/* 벽 몸체는 꽉 찬 상자 — 유리 · 창틀 · 불빛은 벽면 바로 앞에 붙인다 */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[s.w, h, s.d]} />
        <meshStandardMaterial color={wallColor ?? (old ? COLORS.wallOld : COLORS.wall)} roughness={0.92} />
      </mesh>
      {/* 층 띠 (슬래브 끝) */}
      {Array.from({ length: s.floors - 1 }, (_, f) => (
        <mesh key={f} position={[0, (f + 1) * s.fh, 0]} castShadow receiveShadow>
          <boxGeometry args={[s.w + 0.012, 0.018, s.d + 0.012]} />
          <meshStandardMaterial color={COLORS.band} roughness={0.75} />
        </mesh>
      ))}
      {/* 옥상: 짙은 방수층 · 파라펫 · 두겁 */}
      <mesh position={[0, h + 0.003, 0]} receiveShadow>
        <boxGeometry args={[s.w - 0.04, 0.006, s.d - 0.04]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.9} />
      </mesh>
      {[
        [0, s.d / 2 - 0.01, s.w, 0.02],
        [0, -s.d / 2 + 0.01, s.w, 0.02],
        [s.w / 2 - 0.01, 0, 0.02, s.d],
        [-s.w / 2 + 0.01, 0, 0.02, s.d],
      ].map(([x, z, sx, sz], i) => (
        <mesh key={i} position={[x, h + 0.04, z]} castShadow receiveShadow>
          <boxGeometry args={[sx + 0.006, 0.08, sz + 0.006]} />
          <meshStandardMaterial color={COLORS.coping} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      {!hideWindows && (
        <>
          <InstancedAt geometry={geo.glass} slots={glassSlots} s={s}>
            <meshStandardMaterial color={COLORS.glass} metalness={0.7} roughness={0.08} />
          </InstancedAt>
          <InstancedAt geometry={geo.frame} slots={frameSlots} s={s} castShadow>
            <meshStandardMaterial color={old ? COLORS.frameOld : COLORS.frame} metalness={0.35} roughness={0.45} />
          </InstancedAt>
        </>
      )}
    </group>
  );
}

/* ── 실내 불빛 ────────────────────────────────────────────────────── */

/** 창 안쪽 불빛 판 — 창마다 색(검정 = 꺼짐)을 매 프레임 바꾼다. 빛 번짐이 잡도록 톤매핑 없이 더한다 */
export function useWindowLights(s: GrSpec, slots: WindowSlot[]) {
  return useMemo(() => {
    const [, wh] = windowSize(s, slots[0].face);
    const geometry = new THREE.PlaneGeometry(1, wh - 0.02);
    const material = new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const mesh = new THREE.InstancedMesh(geometry, material, slots.length);
    const tmp = new THREE.Matrix4();
    const sc = new THREE.Vector3();
    slots.forEach((w, i) => {
      const [ww] = windowSize(s, w.face);
      sc.set(ww - 0.02, 1, 1);
      mesh.setMatrixAt(i, tmp.compose(w.pos.clone().addScaledVector(w.face.normal, GLASS_OUT + 0.0035), faceQuat(w.face), sc));
      mesh.setColorAt(i, new THREE.Color(0, 0, 0));
    });
    mesh.renderOrder = 2;
    return mesh;
  }, [s, slots]);
}

/* ── 열화상 막 (외벽) ─────────────────────────────────────────────── */

const thermalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
/**
 * 면 하나를 층 × 칸으로 나눠 칠한다. uFix(0~1)만큼 시공 순서대로 식고, uFix2 는 창만 식힌다(창호 교체).
 * 층 사이 슬래브 끝(열교)과 창 테두리가 가장 뜨겁다.
 */
const thermalFragment = /* glsl */ `
  uniform float uOn;
  uniform float uScan;
  uniform float uFix;
  uniform float uFix2;
  uniform float uFloors;
  uniform float uBays;
  uniform float uBay0;
  uniform float uTotal;
  uniform float uSill;
  uniform float uHead;
  uniform float uWinW;
  uniform float uMode;
  uniform vec3 uStops[5];
  varying vec2 vUv;
  float piece(float phase, float order) { return clamp((phase - order * 0.7) / 0.3, 0.0, 1.0); }
  float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  vec3 ironbow(float h) {
    float x = clamp(h, 0.0, 1.0) * 4.0;
    int i = int(min(floor(x), 3.0));
    float f = x - float(i);
    vec3 c = uStops[0];
    for (int k = 0; k < 4; k++) if (k == i) c = mix(uStops[k], uStops[k + 1], f);
    return c;
  }
  void main() {
    float fi = floor(vUv.y * uFloors);
    float ly = fract(vUv.y * uFloors);
    float k = floor(vUv.x * uBays);
    float bx = fract(vUv.x * uBays);
    float order = (fi * uTotal + uBay0 + k) / (uFloors * uTotal);
    float n = hash(vec2(k + uBay0, fi));
    float h;
    if (uMode < 0.5) {
      // 외벽: 벽 · 창을 따로
      float a = piece(uFix, order);
      float b = piece(uFix2, order);
      float inWin = step(uSill, ly) * step(ly, uHead) * step(0.5 - uWinW * 0.5, bx) * step(bx, 0.5 + uWinW * 0.5);
      float slab = 1.0 - smoothstep(0.0, 0.07, ly);
      float edge = max(1.0 - smoothstep(0.5 - uWinW * 0.5, 0.5 - uWinW * 0.5 + 0.08, bx), smoothstep(0.5 + uWinW * 0.5 - 0.08, 0.5 + uWinW * 0.5, bx));
      float wall = mix(0.68 + slab * 0.3 + n * 0.08, 0.08 + n * 0.05, a);
      float glass = mix(0.45 + edge * 0.25 + ly * 0.15 + n * 0.12, 0.2 + n * 0.06, b);
      h = mix(wall, glass, inWin);
    } else {
      // 지붕: 한 장 (가로세로 칸은 단열판 순서)
      float a = piece(uFix, order);
      float sun = 0.78 + n * 0.12 + 0.08 * sin(vUv.x * 9.0) * sin(vUv.y * 7.0);
      h = mix(sun, 0.12 + n * 0.05, a);
    }
    float shown = 1.0 - smoothstep(uScan - 0.02, uScan, uMode < 0.5 ? vUv.y : vUv.x);
    float line = exp(-abs((uMode < 0.5 ? vUv.y : vUv.x) - uScan) * 140.0) * step(uScan, 1.0);
    vec3 c = ironbow(h) * 0.6 * shown + vec3(0.75, 0.95, 1.0) * line;
    gl_FragColor = vec4(c * uOn, 1.0);
  }
`;

export type ThermalUniforms = Record<string, { value: number | THREE.Color[] }>;

export function thermalMaterial(opts: { floors: number; bays: number; bay0: number; total: number; mode: "wall" | "roof" }) {
  const uniforms = {
    uOn: { value: 0 },
    uScan: { value: 0 },
    uFix: { value: 0 },
    uFix2: { value: 0 },
    uFloors: { value: opts.floors },
    uBays: { value: opts.bays },
    uBay0: { value: opts.bay0 },
    uTotal: { value: opts.total },
    uSill: { value: SILL },
    uHead: { value: HEAD },
    uWinW: { value: WIN_W },
    uMode: { value: opts.mode === "wall" ? 0 : 1 },
    uStops: { value: THERMAL_STOPS.map((c) => new THREE.Color(c)) },
  };
  return new THREE.ShaderMaterial({
    vertexShader: thermalVertex,
    fragmentShader: thermalFragment,
    uniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

/** 면 하나를 덮는 열화상 막 (벽 바깥 out 만큼 앞) */
export function facePlane(s: GrSpec, face: Face, out: number) {
  const h = s.floors * s.fh;
  const g = new THREE.PlaneGeometry(face.length, h);
  const m = new THREE.Matrix4().compose(face.center.clone().addScaledVector(face.normal, out).setY(h / 2), faceQuat(face), new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(m);
  return g;
}

/* ── 매 프레임 갱신 (컴포넌트 밖에서 바꾼다 — React Compiler 가 훅 값을 직접 바꾸는 것을 막는다) ── */

/** 인스턴스 위치 · 색을 다시 올린다 */
export function flush(mesh: THREE.InstancedMesh) {
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

export function setThermal(material: THREE.ShaderMaterial, on: number, scan: number, fix: number, fix2 = 0) {
  const u = material.uniforms;
  u.uOn.value = on;
  u.uScan.value = scan;
  u.uFix.value = fix;
  u.uFix2.value = fix2;
}

/** 창 불빛: lit(창) 이 0~1, 색은 color 에 level 을 곱해 */
export function paintLights(mesh: THREE.InstancedMesh, slots: WindowSlot[], light: (w: WindowSlot, out: THREE.Color) => THREE.Color, tmp: THREE.Color) {
  for (const w of slots) mesh.setColorAt(w.index, light(w, tmp));
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}
