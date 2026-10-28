"use client";

/**
 * Product 테마 지역 공용 — 선택 상태 · 등장 연출 · 밤에 창이 켜지는 건물 · 태양광 패널 · 상태 아이콘.
 * 시간(해 · 밤 · 인트로)은 홈 히어로와 같은 시뮬레이션(heroSim)을 쓴다.
 */

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { PV_PEAK_KW, reveal, useSim } from "@/components/hero/heroSim";
import { pvTexture } from "@/components/hero/textures";
import type { ProductKey } from "./districtLayout";

export const TEAL = new THREE.Color("#49B6CA");
export const AMBER = new THREE.Color("#F5A54A");

/* ── 선택 상태 ────────────────────────────────────────────────────── */

export type DistrictState = {
  active: ProductKey | null;
  setHover: (k: ProductKey | null) => void;
  /** 시설로 카메라가 다가간 뒤 제품 페이지로 */
  go: (k: ProductKey) => void;
};
export const DistrictContext = createContext<DistrictState | null>(null);
export const useDistrict = () => useContext(DistrictContext)!;

function setCursor(v: string) {
  document.body.style.cursor = v;
}

/** 시설 그룹에 붙이는 포인터 핸들러: 올리면 강조, 누르면 제품 페이지로.
 *  터치에는 마우스 올리기가 없으므로 첫 탭은 고르기(카드 표시), 같은 시설을 한 번 더 누르면 이동 */
export function useFacility(key: ProductKey) {
  const { active, setHover, go } = useDistrict();
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHover(key);
      setCursor("pointer");
    },
    onPointerOut: () => {
      setHover(null);
      setCursor("");
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      setCursor("");
      if ((e.nativeEvent as PointerEvent).pointerType === "touch" && active !== key) {
        setHover(key);
        return;
      }
      go(key);
    },
  };
}

/* ── 도우미 ───────────────────────────────────────────────────────── */

export const m4 = (x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, 0)), new THREE.Vector3(sx, sy, sz));

export function Instances({ matrices, children, cast = true, receive = true }: { matrices: THREE.Matrix4[]; children: ReactNode; cast?: boolean; receive?: boolean }) {
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[undefined, undefined, matrices.length]}
      castShadow={cast}
      receiveShadow={receive}
    >
      {children}
    </instancedMesh>
  );
}

/** 땅에서 솟아오르는 등장 연출 (인트로 0~1 의 at 지점부터) */
export function Appear({ at, dur = 0.14, children }: { at: number; dur?: number; children: ReactNode }) {
  const sim = useSim();
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const r = reveal(sim.current.intro, at, dur);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);
  });
  return <group ref={ref}>{children}</group>;
}

/* ── 밤에 창이 켜지는 건물 ────────────────────────────────────────── */

export type Facade = { map: THREE.Texture; lights: THREE.Texture };

/** 창 무늬(낮) + 켜진 창만 남긴 조명 지도(밤) — 같은 무작위로 그려 위치가 맞는다 */
export function facadeTextures(o: { cols: number; rows: number; frame: string; glass: string; litRatio: number; seed: number; band?: string }): Facade {
  const make = (night: boolean) => {
    const c = document.createElement("canvas");
    c.width = o.cols * 16;
    c.height = o.rows * 24;
    const g = c.getContext("2d")!;
    g.fillStyle = night ? "#000" : o.frame;
    g.fillRect(0, 0, c.width, c.height);
    let s = o.seed;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let r = 0; r < o.rows; r++) {
      if (o.band && !night) {
        g.fillStyle = o.band;
        g.fillRect(0, r * 24 + 19, c.width, 5);
      }
      for (let k = 0; k < o.cols; k++) {
        const lit = rand() < o.litRatio;
        g.fillStyle = night ? (lit ? "#fff" : "#000") : lit ? "#e9dcc0" : o.glass;
        g.fillRect(k * 16 + 2, r * 24 + 3, 12, 15);
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  return { map: make(false), lights: make(true) };
}

const WINDOW_LIGHT = new THREE.Color("#ffd9a8");

export function Building({ x, z, w, d, h, facade, roof = "#2c3a40" }: { x: number; z: number; w: number; d: number; h: number; facade: Facade; roof?: string }) {
  const sim = useSim();
  const body = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (body.current) (body.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.04 + sim.current.dark * 1.5;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh ref={body} position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={facade.map} emissive={WINDOW_LIGHT} emissiveMap={facade.lights} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0, h + 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.06, 0.08, d + 0.06]} />
        <meshStandardMaterial color={roof} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** 기울어진 태양광 패널 묶음 (PV REMS) — 해가 높을수록 · 선택되면 빛난다 */
export function PvPanels({ matrices }: { matrices: THREE.Matrix4[] }) {
  const sim = useSim();
  const { active } = useDistrict();
  const ref = useRef<THREE.InstancedMesh>(null);
  const tex = useMemo(() => pvTexture(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const on = active === "pvRems" ? 0.5 + 0.5 * Math.sin(clock.elapsedTime * 5) : 0;
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.06 + (sim.current.solarKw / PV_PEAK_KW) * 0.55 + on * 0.9;
  });
  return (
    <instancedMesh
      ref={(mesh) => {
        ref.current = mesh;
        if (!mesh) return;
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[undefined, undefined, matrices.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.5, 0.025, 0.32]} />
      <meshStandardMaterial map={tex} emissive={TEAL} emissiveMap={tex} metalness={0.45} roughness={0.3} />
    </instancedMesh>
  );
}

/* ── 상태 아이콘 (경고 ! · 해결 ✓) — 글자 대신 그림이라 언어와 상관없다 ── */

export function iconTexture(kind: "alert" | "ok") {
  const c = document.createElement("canvas");
  c.width = c.height = 96;
  const g = c.getContext("2d")!;
  g.fillStyle = kind === "alert" ? "#F5A54A" : "#49B6CA";
  g.beginPath();
  g.arc(48, 48, 40, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.9)";
  g.lineWidth = 4;
  g.stroke();
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.lineJoin = "round";
  g.lineWidth = 9;
  g.beginPath();
  if (kind === "alert") {
    g.moveTo(48, 26);
    g.lineTo(48, 54);
    g.stroke();
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(48, 70, 5.5, 0, Math.PI * 2);
    g.fill();
  } else {
    g.moveTo(30, 50);
    g.lineTo(43, 63);
    g.lineTo(67, 36);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** 바닥에 떨어지는 빛 웅덩이 (가로등) */
export function poolTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
