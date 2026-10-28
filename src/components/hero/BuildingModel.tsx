"use client";

/**
 * 히어로 3D 건물 모델 — 모델 파일 없이 코드로 만든다.
 * 등장 순서: 도면(축선 · 외곽) → 층이 아래부터 올라감 → 외피 핀 · 코어 → 옥상 태양광 · 히트펌프 · ESS
 */

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BUILDING_H,
  ESS_KW,
  FLOOR_H,
  FLOORS,
  HVAC_SHARE,
  PEAK_KW,
  PV_PEAK_KW,
  SETBACK_FLOOR,
  footprint,
  reveal,
  seeded,
  useSim,
} from "./heroSim";

export const TEAL = new THREE.Color("#49B6CA");
export const WARM = new THREE.Color("#F5A54A");
const WHITE = new THREE.Color("#E6F7FA");
const LINE = "#9fd3de";

// 등장 연출 타임라인 (intro 0~1)
const BLUEPRINT = [0, 0.25] as const;
const FLOOR_START = 0.15;
const FLOOR_STEP = 0.045;
const FLOOR_DUR = 0.1;
const FINS = [0.7, 0.15] as const;
const EQUIPMENT = [0.8, 0.18] as const;

const LOW_TOP = SETBACK_FLOOR * FLOOR_H; // 저층부 지붕(테라스) 높이
const CORE: [number, number] = [0.8, 0.6]; // 엘리베이터 · 계단 코어 8 × 6 m
export const RISER_Z = CORE[1] / 2 + 0.05; // 전력 간선이 지나는 코어 앞면

type Seg = (a: [number, number, number], b: [number, number, number]) => void;

function lineGeometry(build: (seg: Seg) => void) {
  const pts: number[] = [];
  build((a, b) => pts.push(...a, ...b));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

function rect(seg: Seg, w: number, d: number, y: number, cx = 0, cz = 0) {
  const c: [number, number][] = [
    [cx - w / 2, cz - d / 2],
    [cx + w / 2, cz - d / 2],
    [cx + w / 2, cz + d / 2],
    [cx - w / 2, cz + d / 2],
  ];
  for (let k = 0; k < 4; k++) seg([c[k][0], y, c[k][1]], [c[(k + 1) % 4][0], y, c[(k + 1) % 4][1]]);
}

/* ── 도면: 구조 축선 · 외곽선 ─────────────────────────────────────── */

export function Blueprint() {
  const sim = useSim();
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(
    () =>
      lineGeometry((seg) => {
        const [w, d] = footprint(0);
        const y = 0.004;
        // 축선 X1~X5 · Y1~Y4 와 축 번호 동그라미
        for (let k = 0; k <= 4; k++) {
          const x = -w / 2 + (k * w) / 4;
          seg([x, y, -d / 2 - 0.45], [x, y, d / 2 + 0.55]);
          circle(seg, x, d / 2 + 0.64, 0.09, y);
        }
        for (let k = 0; k <= 3; k++) {
          const z = -d / 2 + (k * d) / 3;
          seg([-w / 2 - 0.55, y, z], [w / 2 + 0.45, y, z]);
          circle(seg, -w / 2 - 0.64, z, 0.09, y);
        }
        // 외벽 두 줄(벽 두께)
        rect(seg, w, d, y);
        rect(seg, w - 0.06, d - 0.06, y);
        rect(seg, CORE[0], CORE[1], y);
        // 치수선
        seg([-w / 2, y, d / 2 + 0.3], [w / 2, y, d / 2 + 0.3]);
        for (const x of [-w / 2, w / 2]) seg([x, y, d / 2 + 0.24], [x, y, d / 2 + 0.36]);
      }),
    [],
  );

  useFrame(() => {
    const line = ref.current;
    if (!line) return;
    const intro = sim.current.intro;
    const r = reveal(intro, BLUEPRINT[0], BLUEPRINT[1]);
    const total = geometry.attributes.position.count;
    geometry.setDrawRange(0, Math.floor((total * r) / 2) * 2);
    // 다 그려진 뒤에는 바닥 도면으로 흐리게 남는다
    (line.material as THREE.LineBasicMaterial).opacity = 0.75 - reveal(intro, 0.55, 0.4) * 0.53;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={LINE} transparent depthWrite={false} />
    </lineSegments>
  );
}

function circle(seg: Seg, cx: number, cz: number, r: number, y: number) {
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    seg([cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r], [cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r]);
  }
}

/* ── 층: 슬래브 · 에너지 볼륨 · 유리 · 실내 평면 ───────────────────── */

// 코어 · 복도 · 실 칸막이를 벽 위아래 선과 끝단 세로선으로 그린다
function floorPlan(index: number) {
  const [w, d] = footprint(index);
  const r = seeded(100 + index);
  return lineGeometry((seg) => {
    const lo = 0.04;
    const hi = FLOOR_H - 0.08;
    const wall = (x0: number, z0: number, x1: number, z1: number) => {
      seg([x0, lo, z0], [x1, lo, z1]);
      seg([x0, hi, z0], [x1, hi, z1]);
      seg([x0, lo, z0], [x0, hi, z0]);
      seg([x1, lo, z1], [x1, hi, z1]);
    };
    const [cw, cd] = CORE;
    // 코어
    wall(-cw / 2, -cd / 2, cw / 2, -cd / 2);
    wall(cw / 2, -cd / 2, cw / 2, cd / 2);
    wall(cw / 2, cd / 2, -cw / 2, cd / 2);
    wall(-cw / 2, cd / 2, -cw / 2, -cd / 2);
    wall(0, -cd / 2, 0, cd / 2); // 엘리베이터 | 계단
    if (index === 0) return; // 로비는 트인 공간

    // 복도 바깥 경계
    const c = 0.2;
    const ox = cw / 2 + c;
    const oz = cd / 2 + c;
    wall(-ox, -oz, ox, -oz);
    wall(ox, -oz, ox, oz);
    wall(ox, oz, -ox, oz);
    wall(-ox, oz, -ox, -oz);

    // 앞뒤 · 양옆 띠에 실 칸막이 (6~9 m 간격)
    const inset = 0.06;
    for (const sign of [-1, 1]) {
      for (let x = -ox + 0.5 + r() * 0.3; x < ox - 0.3; x += 0.6 + r() * 0.3) wall(x, sign * oz, x, sign * (d / 2 - inset));
      for (let z = -oz + 0.4 + r() * 0.2; z < oz - 0.25; z += 0.55 + r() * 0.25) wall(sign * ox, z, sign * (w / 2 - inset), z);
      // 모서리 실
      wall(sign * ox, oz, sign * (w / 2 - inset), oz);
      wall(sign * ox, -oz, sign * (w / 2 - inset), -oz);
    }
  });
}

export function Floor({ index, hovered, onHover }: { index: number; hovered: boolean; onHover: (i: number | null) => void }) {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const energy = useRef<THREE.Mesh>(null);
  const plan = useRef<THREE.LineSegments>(null);
  const [w, d] = footprint(index);
  const y = index * FLOOR_H;
  const color = useMemo(() => new THREE.Color(), []);
  const planGeometry = useMemo(() => floorPlan(index), [index]);

  useFrame(() => {
    const g = group.current;
    const mesh = energy.current;
    const lines = plan.current;
    if (!g || !mesh || !lines) return;
    const s = sim.current;
    const r = reveal(s.intro, FLOOR_START + index * FLOOR_STEP, FLOOR_DUR);
    g.visible = r > 0.001;
    g.scale.y = Math.max(r, 0.001);

    const load = s.floorLoads[index] ?? 0;
    const scan = Math.max(0, 1 - Math.abs(s.scanY - (y + FLOOR_H / 2)) / 0.55);
    const hover = hovered ? 1 : 0;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.copy(color.copy(TEAL).lerp(WARM, THREE.MathUtils.smoothstep(load, 0.7, 1)).lerp(WHITE, scan * 0.5 + hover * 0.3));
    mat.opacity = (0.08 + load * 0.45 + scan * 0.2 + hover * 0.2) * r;
    // 스캔이 지나가면 실내 평면이 X-ray 처럼 드러난다
    (lines.material as THREE.LineBasicMaterial).opacity = (0.09 + scan * 0.75 + hover * 0.45) * r;
  });

  return (
    <group ref={group} position={[0, y, 0]}>
      <mesh position={[0, 0.018, 0]}>
        <boxGeometry args={[w + 0.06, 0.036, d + 0.06]} />
        <meshStandardMaterial color="#5f7a84" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh
        ref={energy}
        position={[0, FLOOR_H / 2 + 0.02, 0]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(index);
        }}
        onPointerOut={() => onHover(null)}
      >
        <boxGeometry args={[w - 0.14, FLOOR_H - 0.12, d - 0.14]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <lineSegments ref={plan} geometry={planGeometry}>
        <lineBasicMaterial color="#d6f4fa" transparent depthWrite={false} />
      </lineSegments>
      <mesh position={[0, FLOOR_H / 2 + 0.025, 0]}>
        <boxGeometry args={[w, FLOOR_H - 0.05, d]} />
        <meshStandardMaterial color="#7fb6c3" transparent opacity={0.06} roughness={0.08} metalness={0.6} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── 외피: 멀리언 선 · 세로 핀 ────────────────────────────────────── */

export function Facade() {
  const sim = useSim();
  const { geometry, offsets } = useMemo(() => {
    const offsets: number[] = [0];
    const pts: number[] = [];
    const seg: Seg = (a, b) => pts.push(...a, ...b);
    for (let i = 0; i < FLOORS; i++) {
      const [w, d] = footprint(i);
      const y = i * FLOOR_H;
      rect(seg, w, d, y);
      if (i === SETBACK_FLOOR) rect(seg, ...footprint(i - 1), y);
      const c: [number, number][] = [
        [-w / 2, -d / 2],
        [w / 2, -d / 2],
        [w / 2, d / 2],
        [-w / 2, d / 2],
      ];
      for (let k = 0; k < 4; k++) {
        const [x0, z0] = c[k];
        const [x1, z1] = c[(k + 1) % 4];
        const n = Math.max(2, Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.34));
        for (let j = 0; j < n; j++) {
          const t = j / n;
          seg([x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t], [x0 + (x1 - x0) * t, y + FLOOR_H, z0 + (z1 - z0) * t]);
        }
      }
      offsets.push(pts.length / 3);
    }
    rect(seg, ...footprint(FLOORS - 1), BUILDING_H);
    offsets[FLOORS] = pts.length / 3;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return { geometry: g, offsets };
  }, []);

  useFrame(() => {
    const intro = sim.current.intro;
    let built = 0;
    while (built < FLOORS && reveal(intro, FLOOR_START + built * FLOOR_STEP, FLOOR_DUR) > 0.6) built++;
    geometry.setDrawRange(0, offsets[built]);
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={LINE} transparent opacity={0.3} />
    </lineSegments>
  );
}

// 블록(저층부 · 고층부)의 네 면에 세로 핀을 단다
const FIN_LAYOUT = (() => {
  const list: { x: number; z: number; rotY: number; base: number; h: number }[] = [];
  const blocks = [
    { floor: 0, h: LOW_TOP },
    { floor: SETBACK_FLOOR, h: BUILDING_H - LOW_TOP },
  ];
  for (const b of blocks) {
    const [w, d] = footprint(b.floor);
    const out = 0.035;
    for (let x = -w / 2 + 0.34; x < w / 2 - 0.1; x += 1.02) {
      list.push({ x, z: d / 2 + out, rotY: 0, base: b.floor * FLOOR_H, h: b.h });
      list.push({ x, z: -d / 2 - out, rotY: 0, base: b.floor * FLOOR_H, h: b.h });
    }
    for (let z = -d / 2 + 0.34; z < d / 2 - 0.1; z += 1.02) {
      list.push({ x: w / 2 + out, z, rotY: Math.PI / 2, base: b.floor * FLOOR_H, h: b.h });
      list.push({ x: -w / 2 - out, z, rotY: Math.PI / 2, base: b.floor * FLOOR_H, h: b.h });
    }
  }
  return list;
})();

export function Fins() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), e: new THREE.Euler() }), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = reveal(sim.current.intro, FINS[0], FINS[1]);
    if (r === last.current) return;
    last.current = r;
    FIN_LAYOUT.forEach((f, i) => {
      const h = Math.max(0.001, f.h * r);
      tmp.p.set(f.x, f.base + h / 2, f.z);
      tmp.q.setFromEuler(tmp.e.set(0, f.rotY, 0));
      tmp.s.set(1, h, 1);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = r > 0.001;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, FIN_LAYOUT.length]} frustumCulled={false}>
      <boxGeometry args={[0.012, 1, 0.055]} />
      <meshStandardMaterial color="#8aa6b0" metalness={0.7} roughness={0.3} />
    </instancedMesh>
  );
}

/* ── 코어 · 전력 간선 · 캐노피 ────────────────────────────────────── */

export function Core() {
  const sim = useSim();
  const core = useRef<THREE.Mesh>(null);
  const riser = useRef<THREE.Mesh>(null);
  const height = BUILDING_H + 0.18; // 엘리베이터 기계실까지

  useFrame(() => {
    const s = sim.current;
    const r = reveal(s.intro, FLOOR_START, FLOOR_STEP * FLOORS + FLOOR_DUR);
    for (const m of [core.current, riser.current]) {
      if (!m) continue;
      m.scale.y = Math.max(r, 0.001);
      m.position.y = (height * m.scale.y) / 2;
    }
    if (riser.current) (riser.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + (s.loadKw / PEAK_KW) * 0.5;
  });

  return (
    <>
      <mesh ref={core}>
        <boxGeometry args={[CORE[0] - 0.02, height, CORE[1] - 0.02]} />
        <meshStandardMaterial color="#22343b" roughness={0.85} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={riser} position={[0, 0, RISER_Z]}>
        <cylinderGeometry args={[0.035, 0.035, height, 10]} />
        <meshBasicMaterial color={TEAL} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  );
}

export function Canopy() {
  const sim = useSim();
  const ref = useRef<THREE.Group>(null);
  const [, d] = footprint(0);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const r = reveal(sim.current.intro, FINS[0], FINS[1]);
    g.visible = r > 0.001;
    g.scale.setScalar(Math.max(r, 0.001));
  });
  return (
    <group ref={ref} position={[0.4, FLOOR_H * 0.85, d / 2 + 0.2]}>
      <mesh>
        <boxGeometry args={[1.1, 0.025, 0.4]} />
        <meshStandardMaterial color="#9fb3ba" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.012, 0.18]}>
        <boxGeometry args={[1.1, 0.006, 0.01]} />
        <meshBasicMaterial color={TEAL} />
      </mesh>
    </group>
  );
}

/* ── 옥상 · 테라스 태양광 ─────────────────────────────────────────── */

const PANELS = (() => {
  const list: { x: number; y: number; z: number }[] = [];
  const [tw, td] = footprint(FLOORS - 1);
  // 옥상: 코어 기계실을 비켜서 배치
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 4; r++) {
      const x = -tw / 2 + 0.25 + (c + 0.5) * ((tw - 0.5) / 5);
      const z = -td / 2 + 0.2 + (r + 0.5) * ((td - 0.4) / 4);
      if (Math.abs(x) < CORE[0] / 2 + 0.2 && Math.abs(z) < CORE[1] / 2 + 0.15) continue;
      list.push({ x, y: BUILDING_H + 0.08, z });
    }
  }
  // 저층부 테라스 서쪽 띠
  const [lw] = footprint(0);
  const stripX = -(lw + tw) / 4;
  for (let r = 0; r < 5; r++) list.push({ x: stripX, y: LOW_TOP + 0.08, z: -0.9 + r * 0.45 });
  return list;
})();

// 모듈 셀 격자 — 멀리서도 태양광 패널로 읽히게
function panelTexture() {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#17405a";
  g.fillRect(0, 0, 96, 64);
  g.strokeStyle = "rgba(170,220,235,0.5)";
  g.lineWidth = 1;
  for (let x = 16; x < 96; x += 16) {
    g.beginPath();
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, 64);
    g.stroke();
  }
  for (let y = 16; y < 64; y += 16) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(96, y + 0.5);
    g.stroke();
  }
  g.strokeStyle = "rgba(225,238,242,0.9)";
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, 93, 61);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function SolarArray() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const placed = useRef(-1);
  const texture = useMemo(() => panelTexture(), []);
  // 남쪽(+z, 카메라 쪽)을 향해 기운다 — 패널 면이 보이게
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, 0, 0)), s: new THREE.Vector3() }), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0], EQUIPMENT[1]);
    if (r !== placed.current) {
      placed.current = r;
      PANELS.forEach((p, i) => {
        // 하나씩 순서대로 놓인다
        const k = Math.min(1, Math.max(0, r * 1.6 - (i / PANELS.length) * 0.6));
        tmp.p.set(p.x, p.y + (1 - k) * 0.4, p.z);
        tmp.s.setScalar(Math.max(k, 0.001));
        mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + (s.solarKw / PV_PEAK_KW) * 1.1;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PANELS.length]} frustumCulled={false}>
      <boxGeometry args={[0.34, 0.02, 0.24]} />
      <meshStandardMaterial map={texture} emissive={TEAL} emissiveMap={texture} metalness={0.45} roughness={0.3} />
    </instancedMesh>
  );
}

/* ── 히트펌프 실외기 (테라스 동쪽) ────────────────────────────────── */

const HP_UNITS = (() => {
  const [lw] = footprint(0);
  const [tw] = footprint(FLOORS - 1);
  const x = (lw + tw) / 4;
  return [-0.7, 0, 0.7].map((z) => ({ x, z }));
})();
export const HP_ANCHOR: [number, number, number] = [HP_UNITS[0].x, LOW_TOP + 0.55, 0];

export function HeatPumps() {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const fans = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0] + 0.05, EQUIPMENT[1]);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);
    // 팬 속도는 냉난방 전력에 비례
    const speed = 2 + (s.hpKw / (PEAK_KW * HVAC_SHARE)) * 14;
    fans.current.forEach((f) => {
      if (f) f.rotation.y += Math.min(delta, 0.1) * speed;
    });
  });

  return (
    <group ref={group} position={[0, LOW_TOP, 0]}>
      {HP_UNITS.map((u, i) => (
        <group key={i} position={[u.x, 0, u.z]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.34, 0.22, 0.46]} />
            <meshStandardMaterial color="#c3d0d4" metalness={0.3} roughness={0.5} />
          </mesh>
          {[-0.11, 0.11].map((dz) => (
            <group key={dz} position={[0, 0.235, dz]}>
              <mesh>
                <cylinderGeometry args={[0.095, 0.095, 0.012, 24, 1, true]} />
                <meshStandardMaterial color="#5b6f76" side={THREE.DoubleSide} />
              </mesh>
              <group
                ref={(el) => {
                  fans.current[i * 2 + (dz > 0 ? 1 : 0)] = el;
                }}
              >
                {[0, 1, 2].map((b) => (
                  <mesh key={b} rotation={[0, (b * Math.PI) / 3, 0]}>
                    <boxGeometry args={[0.17, 0.006, 0.03]} />
                    <meshStandardMaterial color="#2c3c42" />
                  </mesh>
                ))}
              </group>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── ESS 컨테이너 ─────────────────────────────────────────────────── */

const ESS_POS: [number, number, number][] = [
  [-2.1, 0, 1.6],
  [-2.1, 0, 1.98],
];
const ESS_SIZE: [number, number, number] = [0.75, 0.3, 0.27];
const LED_COUNT = 10;
export const ESS_ANCHOR: [number, number, number] = [-2.1, 0.72, 1.8];
export const ESS_PORT = new THREE.Vector3(-1.72, 0.06, 1.6);
export const ESS_ENTRY = new THREE.Vector3(-1.0, 0.06, 1.3);

export function EssUnits() {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const leds = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ c: new THREE.Color(), off: new THREE.Color("#1d2b30") }), []);


  useFrame(({ clock }) => {
    const g = group.current;
    const mesh = leds.current;
    if (!g || !mesh) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0] - 0.04, EQUIPMENT[1]);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);

    // 충전 중이면 틸, 방전 중이면 앰버로 잔량만큼 켜진다. 맨 위 칸이 숨 쉬듯 깜빡인다
    const lit = Math.round(s.essSoc * LED_COUNT);
    const mode = s.essKw < -1 ? TEAL : s.essKw > 1 ? WARM : WHITE;
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 4) * 0.45;
    for (let u = 0; u < ESS_POS.length; u++) {
      for (let k = 0; k < LED_COUNT; k++) {
        if (k < lit) tmp.c.copy(mode).multiplyScalar(k === lit - 1 && Math.abs(s.essKw) > 1 ? pulse : 1);
        else tmp.c.copy(tmp.off);
        mesh.setColorAt(u * LED_COUNT + k, tmp.c);
      }
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const ledMatrices = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    for (const [x, , z] of ESS_POS) {
      for (let k = 0; k < LED_COUNT; k++) {
        const xx = x - ESS_SIZE[0] / 2 + 0.08 + (k * (ESS_SIZE[0] - 0.16)) / (LED_COUNT - 1);
        list.push(new THREE.Matrix4().makeTranslation(xx, 0.22, z + ESS_SIZE[2] / 2 + 0.004));
      }
    }
    return list;
  }, []);

  return (
    <group ref={group}>
      {ESS_POS.map(([x, , z], i) => (
        <group key={i} position={[x, ESS_SIZE[1] / 2, z]}>
          <mesh>
            <boxGeometry args={ESS_SIZE} />
            <meshStandardMaterial color="#dfe7ea" metalness={0.2} roughness={0.55} />
          </mesh>
          {/* 문짝 홈 */}
          {[-0.2, 0, 0.2].map((dz) => (
            <mesh key={dz} position={[dz, -0.02, ESS_SIZE[2] / 2 + 0.002]}>
              <boxGeometry args={[0.004, ESS_SIZE[1] - 0.1, 0.002]} />
              <meshBasicMaterial color="#8fa2a8" />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh
        ref={(mesh) => {
          leds.current = mesh;
          if (!mesh) return;
          // 첫 렌더 전에 instanceColor 를 만들어 두어야 셰이더가 인스턴스 색을 쓴다
          const off = new THREE.Color("#1d2b30");
          ledMatrices.forEach((m, i) => {
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, off);
          });
          mesh.instanceMatrix.needsUpdate = true;
        }}
        args={[undefined, undefined, ledMatrices.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.035, 0.035, 0.006]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** 전력망 · ESS 에서 건물로 들어오는 경로의 최대 흐름 (EnergyFlow 정규화용) */
export const FLOW_NORM = { grid: PEAK_KW, ess: ESS_KW, solar: PV_PEAK_KW };
