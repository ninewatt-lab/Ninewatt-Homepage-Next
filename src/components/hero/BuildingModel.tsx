"use client";

/**
 * 히어로 3D 건물 모델 — 모델 파일 없이 코드로 만든다.
 * 등장 순서: 도면(축선 · 외곽) → 층이 아래부터 올라감 → 커튼월 멀리언 · 코어 → 옥상 · 테라스 · 설비
 * 설비(ESS · 히트펌프)는 Equipment.tsx.
 */

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { BUILDING_H, ESS_KW, FLOOR_H, FLOORS, PEAK_KW, PV_PEAK_KW, SETBACK_FLOOR, footprint, reveal, seeded, useSim } from "./heroSim";
import { fromUi, useFocusTarget } from "./focus";
import { useModelGeometry, useModelMaterial } from "./models";
import { louverTexture, pavingTexture, pvTexture } from "./textures";

export const TEAL = new THREE.Color("#49B6CA");
export const WARM = new THREE.Color("#F5A54A");
export const WHITE = new THREE.Color("#E6F7FA");
const LINE = "#9fd3de";

// 등장 연출 타임라인 (intro 0~1)
const BLUEPRINT = [0, 0.25] as const;
const FLOOR_START = 0.15;
const FLOOR_STEP = 0.045;
const FLOOR_DUR = 0.1;
const FACADE = [0.7, 0.15] as const;
export const EQUIPMENT = [0.8, 0.18] as const;

export const LOW_TOP = SETBACK_FLOOR * FLOOR_H; // 저층부 지붕(테라스) 높이
const DECK = 0.07; // 슬래브 · 스팬드럴 두께
const CORE: [number, number] = [0.8, 0.6]; // 엘리베이터 · 계단 코어 8 × 6 m
export const RISER_Z = CORE[1] / 2 + 0.05; // 전력 간선이 지나는 코어 앞면

/** floor 층이 다 올라왔는지 (0~1) */
const floorReveal = (intro: number, floor: number) => reveal(intro, FLOOR_START + floor * FLOOR_STEP, FLOOR_DUR);

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

/* ── 대지: 포장 광장 · 조경 ──────────────────────────────────────── */

export const SITE: [number, number] = [5.0, 3.9]; // 50 × 39 m
export const SITE_TOP = 0.012;
const TREES: [number, number, number][] = [
  // x, z, 크기
  [-2.3, -1.45, 1],
  [-2.3, -0.55, 0.85],
  [-1.2, -1.65, 0.95],
  [0.4, -1.65, 1.1],
  [2.2, -1.45, 0.9],
  [2.25, 1.55, 0.8],
];

export function Site() {
  const sim = useSim();
  const trees = useRef<THREE.Group>(null);
  const paving = useMemo(() => pavingTexture([SITE[0] / 0.3, SITE[1] / 0.3]), []);
  useFrame(() => {
    const g = trees.current;
    if (!g) return;
    const r = reveal(sim.current.intro, EQUIPMENT[0], EQUIPMENT[1]);
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(r, 0.001), 1);
  });
  return (
    <>
      <mesh position={[0, SITE_TOP / 2, 0]} receiveShadow>
        <boxGeometry args={[SITE[0], SITE_TOP, SITE[1]]} />
        <meshStandardMaterial map={paving} roughness={0.92} />
      </mesh>
      <group ref={trees}>
        <Suspense fallback={<TreesSimple />}>
          <TreesModel />
        </Suspense>
      </group>
    </>
  );
}

function TreesModel() {
  const a = useModelGeometry("TreeA");
  const b = useModelGeometry("TreeB");
  const material = useModelMaterial(0.85, 0);
  return (
    <>
      {TREES.map(([x, z, k], i) => (
        <mesh key={i} geometry={i % 3 === 1 ? b : a} material={material} position={[x, SITE_TOP, z]} scale={0.1 * k} rotation={[0, i * 1.3, 0]} castShadow receiveShadow />
      ))}
    </>
  );
}

// 모델을 받는 동안 보이는 코드 모델
function TreesSimple() {
  return (
    <>
      {TREES.map(([x, z, k], i) => (
        <group key={i} position={[x, SITE_TOP, z]} scale={k}>
          <mesh position={[0, 0.07, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.016, 0.14, 6]} />
            <meshStandardMaterial color="#4a3f36" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <icosahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial color="#47705f" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0.03, 0.29, -0.02]} castShadow>
            <icosahedronGeometry args={[0.075, 0]} />
            <meshStandardMaterial color="#538270" roughness={0.85} flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ── 도면: 구조 축선 · 외곽선 ─────────────────────────────────────── */

export function Blueprint() {
  const sim = useSim();
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(
    () =>
      lineGeometry((seg) => {
        const [w, d] = footprint(0);
        const y = SITE_TOP + 0.003;
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

/* ── 층: 스팬드럴 · 에너지 볼륨 · 유리 · 실내 평면 ─────────────────── */

// 코어 · 복도 · 실 칸막이를 벽 위아래 선과 끝단 세로선으로 그린다
function floorPlan(index: number) {
  const [w, d] = footprint(index);
  const r = seeded(100 + index);
  return lineGeometry((seg) => {
    const lo = DECK + 0.005;
    const hi = FLOOR_H - 0.02;
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

// 사무실 창 조명 — 커튼월 칸(bay)마다 켜지는 기준이 달라, 재실이 줄면 하나씩 꺼진다
const windowVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalObj;
  void main() {
    vUv = uv;
    vNormalObj = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const windowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOcc;
  uniform float uOpacity;
  uniform float uSeed;
  uniform float uBays;
  varying vec2 vUv;
  varying vec3 vNormalObj;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    if (abs(vNormalObj.y) > 0.5) discard; // 천장 · 바닥 면은 그리지 않는다
    float face = dot(vNormalObj, vec3(1.0, 3.0, 7.0));
    float x = vUv.x * uBays;
    float th = hash(floor(x) * 12.9898 + face * 78.233 + uSeed);
    float lit = smoothstep(th - 0.04, th + 0.04, uOcc);
    float bay = smoothstep(0.0, 0.1, fract(x)) * smoothstep(1.0, 0.9, fract(x)); // 멀리언 사이 틈
    float ceiling = mix(0.5, 1.0, vUv.y); // 천장 조명이라 위가 밝다
    gl_FragColor = vec4(uColor * lit * bay * ceiling * uOpacity, 1.0);
  }
`;
const OFFICE_LIGHT = new THREE.Color("#ffdcae");

export function Floor({ index, hovered, onHover }: { index: number; hovered: boolean; onHover: (i: number | null) => void }) {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const energy = useRef<THREE.Mesh>(null);
  const plan = useRef<THREE.LineSegments>(null);
  const windows = useRef<THREE.Mesh>(null);
  const [w, d] = footprint(index);
  const y = index * FLOOR_H;
  const lobby = index === 0;
  const color = useMemo(() => new THREE.Color(), []);
  const planGeometry = useMemo(() => floorPlan(index), [index]);
  const target = useFocusTarget("load");
  const windowUniforms = useMemo(
    () => ({
      uColor: { value: OFFICE_LIGHT.clone() },
      uOcc: { value: 0 },
      uOpacity: { value: 0 },
      uSeed: { value: index * 17.31 },
      uBays: { value: Math.round(w / 0.17) },
    }),
    [index, w],
  );

  useFrame(() => {
    const g = group.current;
    const mesh = energy.current;
    const lines = plan.current;
    if (!g || !mesh || !lines) return;
    const s = sim.current;
    const r = floorReveal(s.intro, index);
    g.visible = r > 0.001;
    g.scale.y = Math.max(r, 0.001);

    const load = s.floorLoads[index] ?? 0;
    const scan = Math.max(0, 1 - Math.abs(s.scanY - (y + FLOOR_H / 2)) / 0.55);
    const hover = hovered ? 1 : 0;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    mat.color.copy(color.copy(TEAL).lerp(WARM, THREE.MathUtils.smoothstep(load, 0.7, 1)).lerp(WHITE, scan * 0.5 + hover * 0.3));
    // 밤에는 데이터 빛을 조금 낮춰 창 조명이 읽히게
    mat.opacity = (0.08 + load * 0.45 + scan * 0.2 + hover * 0.2) * r * (1 - s.dark * 0.35);
    // 재실(부하)만큼 창 조명이 켜진다. 로비는 밤에도 켜 둔다. 낮에는 거의 보이지 않는다
    if (windows.current) {
      const u = (windows.current.material as THREE.ShaderMaterial).uniforms;
      u.uOcc.value = Math.max(lobby ? 0.55 : 0, Math.min(1, (load - 0.1) / 0.85));
      u.uOpacity.value = (0.08 + s.dark * 0.9) * r;
    }
    // 스캔이 지나가면 실내 평면이 X-ray 처럼 드러난다
    (lines.material as THREE.LineBasicMaterial).opacity = (0.09 + scan * 0.75 + hover * 0.45) * r;
  });

  const glassH = FLOOR_H - DECK;
  return (
    <group ref={group} position={[0, y, 0]}>
      {/* 슬래브 + 층 사이 불투명 스팬드럴 띠 */}
      <mesh position={[0, DECK / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.03, DECK, d + 0.03]} />
        <meshStandardMaterial color="#26363c" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh
        ref={energy}
        position={[0, DECK + glassH / 2, 0]}
        onClick={target.onClick}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          if (fromUi(e)) return;
          target.onPointerOver(e);
          onHover(index);
        }}
        onPointerOut={() => {
          target.onPointerOut();
          onHover(null);
        }}
      >
        <boxGeometry args={[w - 0.14, glassH - 0.04, d - 0.14]} />
        <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <lineSegments ref={plan} geometry={planGeometry}>
        <lineBasicMaterial color="#d6f4fa" transparent depthWrite={false} />
      </lineSegments>
      <mesh ref={windows} position={[0, DECK + glassH / 2, 0]} renderOrder={2}>
        <boxGeometry args={[w - 0.02, glassH - 0.01, d - 0.02]} />
        <shaderMaterial
          vertexShader={windowVertex}
          fragmentShader={windowFragment}
          uniforms={windowUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* 유리 — 로비는 더 투명하게. 그림자는 건물 덩어리로 떨어지도록 유리도 드리운다 */}
      <mesh position={[0, DECK + glassH / 2, 0]} castShadow>
        <boxGeometry args={[w, glassH, d]} />
        <meshStandardMaterial color="#86bccb" transparent opacity={lobby ? 0.04 : 0.08} roughness={0.05} metalness={0.85} depthWrite={false} />
      </mesh>
      {lobby && (
        // 로비 회전문 · 출입문 프레임 (캐노피 아래)
        <group position={[0.4, DECK, d / 2 + 0.004]}>
          {[-0.18, 0, 0.18].map((x) => (
            <mesh key={x} position={[x, 0.13, 0]} castShadow>
              <boxGeometry args={[0.01, 0.26, 0.012]} />
              <meshStandardMaterial color="#1f2b30" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 0.26, 0]}>
            <boxGeometry args={[0.37, 0.012, 0.012]} />
            <meshStandardMaterial color="#1f2b30" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/* ── 커튼월 멀리언 (블록마다 전체 높이, 층이 올라오는 만큼 자란다) ──── */

type Mullion = { x: number; z: number; corner: boolean; floor0: number; floors: number };

const MULLIONS = (() => {
  const list: Mullion[] = [];
  const blocks = [
    { floor0: 0, floors: SETBACK_FLOOR },
    { floor0: SETBACK_FLOOR, floors: FLOORS - SETBACK_FLOOR },
  ];
  const span = 0.17; // 1.7 m 커튼월 모듈
  for (const b of blocks) {
    const [w, d] = footprint(b.floor0);
    const out = 0.01;
    for (const [len, fixed, alongX] of [
      [w, d / 2 + out, true],
      [w, -d / 2 - out, true],
      [d, w / 2 + out, false],
      [d, -w / 2 - out, false],
    ] as const) {
      const n = Math.round(len / span);
      for (let k = 0; k <= n; k++) {
        const t = -len / 2 + (k * len) / n;
        list.push({ x: alongX ? t : fixed, z: alongX ? fixed : t, corner: k === 0 || k === n, floor0: b.floor0, floors: b.floors });
      }
    }
  }
  return list;
})();

export function Mullions() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const intro = sim.current.intro;
    if (intro === last.current) return;
    last.current = intro;
    MULLIONS.forEach((m, i) => {
      // 블록 안에서 올라온 층 수만큼 높이
      let built = 0;
      for (let f = 0; f < m.floors; f++) built += floorReveal(intro, m.floor0 + f);
      const h = Math.max(0.001, built * FLOOR_H);
      tmp.p.set(m.x, m.floor0 * FLOOR_H + h / 2, m.z);
      tmp.s.set(m.corner ? 2.2 : 1, h, m.corner ? 2.2 : 1);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, MULLIONS.length]} frustumCulled={false} castShadow>
      <boxGeometry args={[0.009, 1, 0.009]} />
      <meshStandardMaterial color="#9db0b6" metalness={0.75} roughness={0.3} />
    </instancedMesh>
  );
}

/* ── 지붕: 옥상 · 테라스 데크, 파라펫, 유리 난간, 설비 차폐벽 ──────── */

export function Roofs() {
  const sim = useSim();
  const low = useRef<THREE.Group>(null);
  const top = useRef<THREE.Group>(null);
  const louver = useMemo(() => louverTexture("#53656b", "#2c3a3f"), []);
  const [lw, ld] = footprint(0);
  const [tw, td] = footprint(FLOORS - 1);

  useFrame(() => {
    const intro = sim.current.intro;
    for (const [g, floor] of [
      [low.current, SETBACK_FLOOR - 1],
      [top.current, FLOORS - 1],
    ] as const) {
      if (!g) continue;
      const r = floorReveal(intro, floor);
      g.visible = r > 0.5;
    }
  });

  // 테두리를 따라 얇은 벽(파라펫) · 난간을 두른다
  const edge = (w: number, d: number, h: number, t: number) =>
    [
      [0, d / 2 - t / 2, w, t],
      [0, -d / 2 + t / 2, w, t],
      [w / 2 - t / 2, 0, t, d],
      [-w / 2 + t / 2, 0, t, d],
    ].map(([x, z, sx, sz], i) => (
      <mesh key={i} position={[x, h / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[sx, h, sz]} />
        <meshStandardMaterial color="#2f4047" metalness={0.5} roughness={0.45} />
      </mesh>
    ));

  return (
    <>
      {/* 저층부 지붕 = 테라스 */}
      <group ref={low} position={[0, LOW_TOP, 0]}>
        <mesh position={[0, DECK / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[lw + 0.03, DECK, ld + 0.03]} />
          <meshStandardMaterial color="#3a4b52" roughness={0.85} />
        </mesh>
        {/* 유리 난간 + 손스침 */}
        <group position={[0, DECK, 0]}>
          {[
            [0, ld / 2, lw, 0],
            [0, -ld / 2, lw, 0],
            [lw / 2, 0, ld, Math.PI / 2],
            [-lw / 2, 0, ld, Math.PI / 2],
          ].map(([x, z, len, ry], i) => (
            <group key={i} position={[x, 0, z]} rotation={[0, ry, 0]}>
              <mesh position={[0, 0.03, 0]}>
                <boxGeometry args={[len, 0.06, 0.004]} />
                <meshStandardMaterial color="#a9d6e0" transparent opacity={0.25} metalness={0.6} roughness={0.1} depthWrite={false} />
              </mesh>
              <mesh position={[0, 0.062, 0]} castShadow>
                <boxGeometry args={[len, 0.006, 0.008]} />
                <meshStandardMaterial color="#b6c5ca" metalness={0.8} roughness={0.25} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 옥상 */}
      <group ref={top} position={[0, BUILDING_H, 0]}>
        <mesh position={[0, DECK / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[tw + 0.03, DECK, td + 0.03]} />
          <meshStandardMaterial color="#3a4b52" roughness={0.85} />
        </mesh>
        <group position={[0, DECK, 0]}>{edge(tw + 0.03, td + 0.03, 0.05, 0.02)}</group>
        {/* 코어 기계실을 두르는 루버 차폐벽 */}
        <mesh position={[0, DECK + 0.07, 0]} castShadow receiveShadow>
          <boxGeometry args={[CORE[0] + 0.12, 0.14, CORE[1] + 0.12]} />
          <meshStandardMaterial map={louver} metalness={0.4} roughness={0.55} />
        </mesh>
      </group>
    </>
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
      <mesh ref={core} castShadow>
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
    const r = reveal(sim.current.intro, FACADE[0], FACADE[1]);
    g.visible = r > 0.001;
    g.scale.setScalar(Math.max(r, 0.001));
  });
  return (
    <group ref={ref} position={[0.4, FLOOR_H * 0.85, d / 2 + 0.2]}>
      <mesh castShadow receiveShadow>
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
  // 옥상: 코어 기계실 차폐벽을 비켜서 배치
  for (let c = 0; c < 5; c++) {
    for (let r = 0; r < 4; r++) {
      const x = -tw / 2 + 0.25 + (c + 0.5) * ((tw - 0.5) / 5);
      const z = -td / 2 + 0.2 + (r + 0.5) * ((td - 0.4) / 4);
      if (Math.abs(x) < CORE[0] / 2 + 0.25 && Math.abs(z) < CORE[1] / 2 + 0.2) continue;
      list.push({ x, y: BUILDING_H + DECK + 0.05, z });
    }
  }
  // 저층부 테라스 서쪽 띠
  const [lw] = footprint(0);
  const stripX = -(lw + tw) / 4;
  for (let r = 0; r < 5; r++) list.push({ x: stripX, y: LOW_TOP + DECK + 0.05, z: -0.9 + r * 0.45 });
  return list;
})();

export function SolarArray() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const placed = useRef(-1);
  const texture = useMemo(() => pvTexture(), []);
  const target = useFocusTarget("solar");
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
    <instancedMesh ref={ref} args={[undefined, undefined, PANELS.length]} frustumCulled={false} castShadow receiveShadow {...target}>
      <boxGeometry args={[0.34, 0.02, 0.24]} />
      <meshStandardMaterial map={texture} emissive={TEAL} emissiveMap={texture} metalness={0.45} roughness={0.3} />
    </instancedMesh>
  );
}

/** 전력망 · ESS · 태양광의 최대 흐름 (EnergyFlow 정규화용) */
export const FLOW_NORM = { grid: PEAK_KW, ess: ESS_KW, solar: PV_PEAK_KW };
