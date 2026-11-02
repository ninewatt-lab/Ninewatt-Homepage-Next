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

export type WindowSlot = {
  face: Face;
  floor: number;
  bay: number;
  /** 창 가운데 (벽 바깥면 위) */
  pos: THREE.Vector3;
  /** 창 너비 · 높이 */
  size: readonly [number, number];
  order: number;
  index: number;
};

/** 창 비율: 층고 대비 창 아래 · 창 위, 칸 너비 대비 창 너비 */
export const SILL = 0.3;
export const HEAD = 0.8;
export const WIN_W = 0.62;
/** 벽 두께 · 유리가 벽 바깥면에서 들어간 깊이 · 실내(어두운 방) 깊이 */
export const WALL_T = 0.03;
const GLASS_IN = 0.016;
const ROOM_IN = 0.055;
/** 유리 판 가운데의 바깥 방향 위치 (벽 바깥면 = 0, 안쪽이 음수) */
export const GLASS_OUT = -GLASS_IN;

/** 1층 통유리 칸: 칸 너비 대비 · 층고 대비 */
const STORE_W = 0.9;
const STORE_LO = 0.06;
const STORE_HI = 0.86;

export type ShellOptions = {
  /** 1층을 통유리(점포형)로 하는 면 */
  groundGlass?: FaceKey[];
  /** 위층 창 사이 세로 핀 */
  fins?: boolean;
  /** 입구 캐노피: 면 · 칸 번호(가운데) · 칸 수 */
  canopy?: { face: FaceKey; bay: number; bays: number };
};

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

/** 보통 창 칸 너비 · 높이 */
export const windowSize = (s: GrSpec, face: Face) => [(face.length / face.bays) * WIN_W, (HEAD - SILL) * s.fh] as const;

/** 창 자리 — 벽 바깥면 위 창 가운데. 1층 통유리 면은 칸을 거의 다 채운다 */
export function windowSlots(s: GrSpec, faces: Face[], opts: ShellOptions = {}): WindowSlot[] {
  const total = totalBays(faces);
  const list: WindowSlot[] = [];
  for (let floor = 0; floor < s.floors; floor++) {
    for (const face of faces) {
      const bw = face.length / face.bays;
      const store = floor === 0 && !!opts.groundGlass?.includes(face.key);
      const size = store ? ([bw * STORE_W, (STORE_HI - STORE_LO) * s.fh] as const) : windowSize(s, face);
      const mid = store ? (STORE_LO + STORE_HI) / 2 : (SILL + HEAD) / 2;
      for (let b = 0; b < face.bays; b++) {
        const pos = face.center.clone().addScaledVector(face.along, -face.length / 2 + (b + 0.5) * bw);
        pos.y = floor * s.fh + mid * s.fh;
        list.push({ face, floor, bay: b, pos, size, order: (floor * total + face.bay0 + b) / (s.floors * total), index: list.length });
      }
    }
  }
  return list;
}

/** 면의 바깥을 향해 놓이도록 회전 (기본 형상은 +z 를 바깥으로 본다) */
export function faceQuat(face: Face) {
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), face.normal);
}

export const COLORS = {
  wallOld: "#b3ada2",
  wall: "#d6d2ca",
  band: "#8f8b83",
  plinth: "#4e5a5f",
  frameOld: "#8a8f90",
  frame: "#2b3438",
  frameNew: "#e9eef0",
  glass: "#6f9fae",
  room: "#1f2c32",
  roof: "#46545a",
  coping: "#2f4047",
  panel: "#e2ddd3",
  metal: "#9db0b6",
};

/* ── 몸체 ─────────────────────────────────────────────────────────── */

/** 면마다 창 구멍을 뚫은 벽 (두께 WALL_T, 바깥면이 면 자리). 동 · 서 면은 모서리가 겹치지 않게 두께만큼 짧게 */
function wallGeometry(s: GrSpec, faces: Face[], slots: WindowSlot[]) {
  const h = s.floors * s.fh;
  const parts = faces.map((face) => {
    const side = face.key === "E" || face.key === "W";
    const L = face.length - (side ? WALL_T * 2 : 0);
    const shape = new THREE.Shape();
    shape.moveTo(-L / 2, 0);
    shape.lineTo(L / 2, 0);
    shape.lineTo(L / 2, h);
    shape.lineTo(-L / 2, h);
    shape.closePath();
    for (const w of slots) {
      if (w.face !== face) continue;
      const cx = w.pos.clone().sub(face.center).dot(face.along);
      const [ww, wh] = w.size;
      const hole = new THREE.Path();
      hole.moveTo(cx - ww / 2, w.pos.y - wh / 2);
      hole.lineTo(cx - ww / 2, w.pos.y + wh / 2);
      hole.lineTo(cx + ww / 2, w.pos.y + wh / 2);
      hole.lineTo(cx + ww / 2, w.pos.y - wh / 2);
      hole.closePath();
      shape.holes.push(hole);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false }).translate(0, 0, -WALL_T);
    g.applyMatrix4(new THREE.Matrix4().compose(face.center, faceQuat(face), new THREE.Vector3(1, 1, 1)));
    return g;
  });
  return mergeGeometries(parts)!;
}

/** 옥상 자갈 질감 (캔버스 점무늬) */
function gravelTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#56646a";
  g.fillRect(0, 0, 128, 128);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) {
    const v = 70 + Math.floor(rnd() * 50);
    g.fillStyle = `rgb(${v},${v + 8},${v + 12})`;
    g.fillRect(rnd() * 128, rnd() * 128, 1 + rnd() * 1.5, 1 + rnd() * 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** 창마다 한 개씩: 위치 = 창 가운데 + 바깥 방향 out, 크기 = 창 크기 × (sx, sy) */
function placeAll(mesh: THREE.InstancedMesh, slots: WindowSlot[], out: number, sx = 1, sy = 1, dx = 0, dy = 0) {
  const m = new THREE.Matrix4();
  const sc = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (const w of slots) {
    sc.set(w.size[0] * sx + dx, w.size[1] * sy + dy, 1);
    p.copy(w.pos).addScaledVector(w.face.normal, out);
    mesh.setMatrixAt(w.index, m.compose(p, faceQuat(w.face), sc));
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

/** 창 안쪽: 어두운 방(깊이) + 비치는 유리. 외피 건물도 같이 쓴다 */
export function WindowGlass({ slots }: { slots: WindowSlot[] }) {
  const meshes = useMemo(() => {
    const room = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: COLORS.room, roughness: 1 }), slots.length);
    const glass = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ color: COLORS.glass, metalness: 0.85, roughness: 0.06, transparent: true, opacity: 0.62, depthWrite: false }),
      slots.length,
    );
    glass.renderOrder = 2;
    return { room: placeAll(room, slots, -ROOM_IN, 1, 1, 0.05, 0.04), glass: placeAll(glass, slots, -GLASS_IN) };
  }, [slots]);
  return (
    <>
      <primitive object={meshes.room} />
      <primitive object={meshes.glass} />
    </>
  );
}

/** 창틀: 네 변 + 가운데 세로살 (창 크기에 맞춰 늘인다 — 막대 굵기는 그대로 보이게 형상을 창마다 만든다) */
function frameGeometry(ww: number, wh: number, bar: number, depth: number, mullions: number) {
  const parts = [
    new THREE.BoxGeometry(ww, bar, depth).translate(0, wh / 2 - bar / 2, 0),
    new THREE.BoxGeometry(ww, bar, depth).translate(0, -wh / 2 + bar / 2, 0),
    new THREE.BoxGeometry(bar, wh, depth).translate(-ww / 2 + bar / 2, 0, 0),
    new THREE.BoxGeometry(bar, wh, depth).translate(ww / 2 - bar / 2, 0, 0),
  ];
  for (let k = 1; k < mullions; k++) parts.push(new THREE.BoxGeometry(bar * 0.8, wh, depth).translate(-ww / 2 + (k * ww) / mullions, 0, 0));
  return mergeGeometries(parts)!;
}

function Frames({ slots, color }: { slots: WindowSlot[]; color: string }) {
  // 창 크기마다(보통 창 · 통유리) 형상이 달라 묶음을 나눈다
  const groups = useMemo(() => {
    const by = new Map<string, WindowSlot[]>();
    for (const w of slots) {
      const k = w.size.join(":");
      by.set(k, [...(by.get(k) ?? []), w]);
    }
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.4 });
    return [...by.values()].map((list) => {
      const [ww, wh] = list[0].size;
      const big = ww > 0.3;
      const g = frameGeometry(ww, wh, 0.009, 0.012, big ? Math.round(ww / 0.12) : 2);
      const mesh = new THREE.InstancedMesh(g, mat, list.length);
      const m = new THREE.Matrix4();
      const p = new THREE.Vector3();
      list.forEach((w, i) => mesh.setMatrixAt(i, m.compose(p.copy(w.pos).addScaledVector(w.face.normal, -GLASS_IN + 0.004), faceQuat(w.face), new THREE.Vector3(1, 1, 1))));
      mesh.castShadow = true;
      mesh.computeBoundingSphere();
      return mesh;
    });
  }, [slots, color]);
  return (
    <>
      {groups.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
    </>
  );
}

/** 창대: 창 아래 바깥으로 조금 나온 얇은 돌 (통유리 칸은 없음) */
function Sills({ slots, s }: { slots: WindowSlot[]; s: GrSpec }) {
  const mesh = useMemo(() => {
    const list = slots.filter((w) => w.size[1] < (HEAD - SILL) * s.fh + 1e-6);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.006, 0.024), new THREE.MeshStandardMaterial({ color: "#c9c6bf", roughness: 0.6 }), list.length);
    const t = new THREE.Matrix4();
    const p = new THREE.Vector3();
    list.forEach((w, i) => {
      p.copy(w.pos).addScaledVector(w.face.normal, 0.0).setY(w.pos.y - w.size[1] / 2 - 0.003);
      m.setMatrixAt(i, t.compose(p, faceQuat(w.face), new THREE.Vector3(w.size[0] + 0.02, 1, 1)));
    });
    m.castShadow = true;
    m.receiveShadow = true;
    m.computeBoundingSphere();
    return m;
  }, [slots, s]);
  return <primitive object={mesh} />;
}

/** 위층 창 사이 세로 핀 (도서관) */
function Fins({ s, faces }: { s: GrSpec; faces: Face[] }) {
  const mesh = useMemo(() => {
    const items: THREE.Matrix4[] = [];
    const h = (s.floors - 1) * s.fh;
    for (const face of faces) {
      const bw = face.length / face.bays;
      for (let b = 1; b < face.bays; b++) {
        const p = face.center.clone().addScaledVector(face.along, -face.length / 2 + b * bw).addScaledVector(face.normal, 0.02);
        p.y = s.fh + h / 2;
        items.push(new THREE.Matrix4().compose(p, faceQuat(face), new THREE.Vector3(1, 1, 1)));
      }
    }
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.012, h - 0.02, 0.04), new THREE.MeshStandardMaterial({ color: COLORS.metal, metalness: 0.7, roughness: 0.3 }), items.length);
    items.forEach((t, i) => m.setMatrixAt(i, t));
    m.castShadow = true;
    m.computeBoundingSphere();
    return m;
  }, [s, faces]);
  return <primitive object={mesh} />;
}

/** 입구 캐노피: 얇은 판 + 앞 끝 청록 조명 띠 + 기둥 둘 (홈 히어로 캐노피와 같은 말투) */
function Canopy({ s, faces, at }: { s: GrSpec; faces: Face[]; at: NonNullable<ShellOptions["canopy"]> }) {
  const face = faces.find((f) => f.key === at.face)!;
  const bw = face.length / face.bays;
  const width = bw * at.bays;
  const depth = 0.16;
  const y = s.fh * 0.92;
  const center = face.center.clone().addScaledVector(face.along, -face.length / 2 + (at.bay + 0.5) * bw).addScaledVector(face.normal, depth / 2);
  const q = faceQuat(face);
  return (
    <group position={[center.x, 0, center.z]} quaternion={q}>
      <mesh position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.014, depth]} />
        <meshStandardMaterial color="#9fb3ba" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, y - 0.008, depth / 2 - 0.004]}>
        <boxGeometry args={[width, 0.004, 0.006]} />
        <meshBasicMaterial color="#49B6CA" toneMapped={false} />
      </mesh>
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[(sd * width) / 2 - sd * 0.02, y / 2, depth / 2 - 0.02]} castShadow>
          <boxGeometry args={[0.01, y, 0.01]} />
          <meshStandardMaterial color={COLORS.frame} metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * old: 시공 전 모습(바랜 벽 · 옛 알루미늄 창틀). 외피 건물은 창틀 · 유리를 따로 그리므로 hideWindows 로 뺀다.
 */
export function Shell({
  s,
  faces,
  slots,
  old = true,
  hideWindows = false,
  wallColor,
  opts = {},
}: {
  s: GrSpec;
  faces: Face[];
  slots: WindowSlot[];
  old?: boolean;
  hideWindows?: boolean;
  wallColor?: string;
  opts?: ShellOptions;
}) {
  const h = s.floors * s.fh;
  const walls = useMemo(() => wallGeometry(s, faces, slots), [s, faces, slots]);
  const gravel = useMemo(() => {
    const t = gravelTexture();
    t.repeat.set(s.w * 3, s.d * 3);
    return t;
  }, [s]);

  return (
    <group>
      {/* 창 구멍이 뚫린 벽 — 창 둘레(안쪽 면)에 그림자가 진다 */}
      <mesh geometry={walls} castShadow receiveShadow>
        <meshStandardMaterial color={wallColor ?? (old ? COLORS.wallOld : COLORS.wall)} roughness={0.93} />
      </mesh>
      {/* 기단 (짙은 돌) */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[s.w + 0.012, 0.04, s.d + 0.012]} />
        <meshStandardMaterial color={COLORS.plinth} roughness={0.8} />
      </mesh>
      {/* 층 띠 (슬래브 끝) */}
      {Array.from({ length: s.floors - 1 }, (_, f) => (
        <mesh key={f} position={[0, (f + 1) * s.fh, 0]} castShadow receiveShadow>
          <boxGeometry args={[s.w + 0.01, 0.014, s.d + 0.01]} />
          <meshStandardMaterial color={COLORS.band} roughness={0.7} />
        </mesh>
      ))}
      {/* 옥상: 슬래브 · 자갈 · 파라펫 · 금속 두겁 */}
      <mesh position={[0, h - 0.01, 0]} receiveShadow>
        <boxGeometry args={[s.w, 0.02, s.d]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.9} />
      </mesh>
      <mesh position={[0, h + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[s.w - 0.05, s.d - 0.05]} />
        <meshStandardMaterial map={gravel} roughness={0.95} />
      </mesh>
      {[
        [0, s.d / 2 - 0.012, s.w, 0.024],
        [0, -s.d / 2 + 0.012, s.w, 0.024],
        [s.w / 2 - 0.012, 0, 0.024, s.d],
        [-s.w / 2 + 0.012, 0, 0.024, s.d],
      ].map(([x, z, sx, sz], i) => (
        <group key={i}>
          <mesh position={[x, h + 0.035, z]} castShadow receiveShadow>
            <boxGeometry args={[sx, 0.07, sz]} />
            <meshStandardMaterial color={wallColor ?? (old ? COLORS.wallOld : COLORS.wall)} roughness={0.9} />
          </mesh>
          <mesh position={[x, h + 0.073, z]} castShadow>
            <boxGeometry args={[sx + 0.008, 0.008, sz + 0.008]} />
            <meshStandardMaterial color={COLORS.coping} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {!hideWindows && (
        <>
          <WindowGlass slots={slots} />
          <Frames slots={slots} color={old ? COLORS.frameOld : COLORS.frame} />
          <Sills slots={slots} s={s} />
        </>
      )}
      {opts.fins && <Fins s={s} faces={faces} />}
      {opts.canopy && <Canopy s={s} faces={faces} at={opts.canopy} />}
    </group>
  );
}

/* ── 실내 불빛 ────────────────────────────────────────────────────── */

/** 창 안쪽 불빛 판 (어두운 방 바로 앞) — 창마다 색(검정 = 꺼짐)을 매 프레임 바꾼다. 빛 번짐이 잡도록 톤매핑 없이 더한다 */
export function useWindowLights(s: GrSpec, slots: WindowSlot[]) {
  return useMemo(() => {
    const material = new THREE.MeshBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, slots.length);
    placeAll(mesh, slots, -ROOM_IN + 0.002, 1, 1, 0.02, 0.02);
    slots.forEach((w) => mesh.setColorAt(w.index, new THREE.Color(0, 0, 0)));
    mesh.renderOrder = 1;
    void s;
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
