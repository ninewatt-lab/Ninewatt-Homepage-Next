"use client";

/**
 * 홈 히어로 3D — 에너지를 보여주는 건물의 디지털 트윈 (three.js).
 * HeroSection 이 동적으로 불러온다(초기 번들에 넣지 않음). 수치 · 근거는 heroSim.ts.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Blueprint, Canopy, Core, FLOW_NORM, Floor, Mullions, RISER_Z, Roofs, Site, SolarArray, TEAL } from "./BuildingModel";
import DetailPanel, { type Focus } from "./DetailPanel";
import { ESS_ANCHOR, ESS_CENTER_VIEW, ESS_ENTRY, ESS_PORT, EssUnits, HP_ANCHOR, HP_CENTER, HeatPumps } from "./Equipment";
import { FocusContext, fromUi, useFocus } from "./focus";
import { Lighting, Sky, StreetLights } from "./Atmosphere";
import {
  AI_SAVING,
  BUILDING_H,
  FLOOR_H,
  FLOORS,
  HP_COP,
  PEAK_KW,
  SimContext,
  createSim,
  footprint,
  reveal,
  seeded,
  stepSim,
  useSim,
  type Sim,
} from "./heroSim";

const BG = "#050d13";

function SimDriver({ frozen }: { frozen: boolean }) {
  const sim = useSim();
  useFrame((_, delta) => {
    stepSim(sim.current, frozen ? 0 : Math.min(delta, 0.1), frozen);
  });
  return null;
}

/* ── 에너지 흐름 ──────────────────────────────────────────────────── */

type Source = "solar" | "grid" | "ess";
type Path = { points: THREE.Vector3[]; lengths: number[]; total: number; source: Source; offset: number; speed: number };

function makePath(points: THREE.Vector3[], source: Source, r: () => number): Path {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + points[i].distanceTo(points[i - 1]));
  return { points, lengths, total: lengths[lengths.length - 1], source, offset: r(), speed: 0.9 + r() * 0.6 };
}

function pointOn(path: Path, t: number, out: THREE.Vector3) {
  const d = t * path.total;
  let i = 1;
  while (i < path.lengths.length - 1 && path.lengths[i] < d) i++;
  const seg = path.lengths[i] - path.lengths[i - 1] || 1;
  return out.lerpVectors(path.points[i - 1], path.points[i], (d - path.lengths[i - 1]) / seg);
}

// 외부 전력망은 건물 뒤쪽에서 들어온다 (텍스트 쪽을 가로지르지 않게)
const GRID_FEEDS = [new THREE.Vector3(10, 0.02, -4), new THREE.Vector3(-3, 0.02, -12)];
const BASE = new THREE.Vector3(0, 0.06, RISER_Z);

function exitPoint(floor: number, r: () => number) {
  const [w, d] = footprint(floor);
  const y = floor * FLOOR_H + FLOOR_H * 0.5;
  const t = r() - 0.5;
  return r() < 0.5 ? new THREE.Vector3(t * w * 0.8, y, d / 2 - 0.12) : new THREE.Vector3(w / 2 - 0.12, y, t * d * 0.8);
}

function EnergyFlow() {
  const sim = useSim();
  const ref = useRef<THREE.InstancedMesh>(null);
  const paths = useMemo(() => {
    const r = seeded(5);
    const [tw, td] = footprint(FLOORS - 1);
    const list: Path[] = [];
    const riser = (y: number) => new THREE.Vector3(0, y, RISER_Z);
    for (let i = 0; i < 24; i++) {
      const exit = exitPoint(Math.floor(r() * FLOORS), r);
      const start = new THREE.Vector3((r() - 0.5) * tw * 0.8, BUILDING_H + 0.15, (r() - 0.5) * td * 0.8);
      list.push(makePath([start, riser(BUILDING_H), riser(exit.y), exit], "solar", r));
    }
    for (let i = 0; i < 22; i++) {
      const feed = GRID_FEEDS[i % GRID_FEEDS.length];
      const exit = exitPoint(Math.floor(r() * FLOORS), r);
      list.push(makePath([feed, feed.clone().setLength(2.2).setY(0.06), BASE, riser(exit.y), exit], "grid", r));
    }
    // ESS ↔ 건물: 방전이면 건물 쪽으로, 충전이면 ESS 쪽으로 흐른다
    for (let i = 0; i < 12; i++) list.push(makePath([ESS_PORT, ESS_ENTRY, BASE], "ess", r));
    return list;
  }, []);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = sim.current;
    const on = reveal(s.intro, 0.9, 0.1);
    paths.forEach((path, i) => {
      let t = (s.elapsed * 0.11 * path.speed + path.offset) % 1;
      let amount: number;
      if (path.source === "solar") amount = s.solarKw / FLOW_NORM.solar;
      else if (path.source === "grid") amount = 0.25 + Math.max(0, s.gridKw / FLOW_NORM.grid) * 0.75;
      else {
        amount = Math.min(1, Math.abs(s.essKw) / FLOW_NORM.ess + (s.essKw !== 0 ? 0.35 : 0));
        if (s.essKw < 0) t = 1 - t;
      }
      pointOn(path, t, tmp.p);
      const fade = Math.min(1, t * 8, (1 - t) * 6);
      tmp.s.setScalar(fade * amount * on);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, paths.length]} frustumCulled={false}>
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshBasicMaterial color="#a8eaf5" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function Cables() {
  const lines = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.35 });
    const make = (pts: THREE.Vector3[]) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
    return [
      ...GRID_FEEDS.map((feed) => make([feed, feed.clone().setLength(2.2).setY(0.02)])),
      make([ESS_PORT.clone().setY(0.01), ESS_ENTRY.clone().setY(0.01)]),
    ];
  }, []);
  return (
    <>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </>
  );
}

/* ── AI 스캔 ──────────────────────────────────────────────────────── */

function ScanRing() {
  const sim = useSim();
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  useFrame(() => {
    const line = ref.current;
    if (!line) return;
    const y = sim.current.scanY;
    line.visible = y >= 0;
    if (!line.visible) return;
    const [w, d] = footprint(Math.min(FLOORS - 1, Math.floor(y / FLOOR_H)));
    line.position.y = y;
    line.scale.set(w + 0.5, 1, d + 0.5);
    (line.material as THREE.LineBasicMaterial).opacity = 0.85 * Math.min(1, y * 3, (BUILDING_H + 0.3 - y) * 3);
  });
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#c9f3fa" transparent depthWrite={false} />
    </lineSegments>
  );
}

/* ── 무대 ─────────────────────────────────────────────────────────── */

function Stage() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(48, 96, TEAL, TEAL);
    const mat = g.material as THREE.LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0.07;
    return g;
  }, []);
  return (
    <group>
      <primitive object={grid} />
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 3.5, 0.08, 64]} />
        <meshStandardMaterial color="#142a33" roughness={0.9} />
      </mesh>
      {/* 무대 밖 바닥에 떨어지는 그림자만 받는다 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.079, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[3.36, 3.4, 96]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ── 수치 라벨 ────────────────────────────────────────────────────── */

// 라벨은 캔버스 밖 일반 DOM 이다. 매 프레임 3D 위치를 화면 좌표로 옮겨 transform 만 바꾼다
type ChipNodes = Record<string, HTMLElement | null>;

function moveChip(node: HTMLElement | null | undefined, x: number, y: number, opacity = 1, maxX = Infinity) {
  if (!node) return;
  // 화면 가장자리 밖으로 나가지 않게
  const half = node.offsetWidth / 2 + 8;
  const cx = Math.min(Math.max(x, half), maxX - half);
  if (opacity > 0) node.style.transform = `translate3d(${cx}px, ${y}px, 0) translate(-50%, -50%)`;
  node.style.opacity = opacity.toFixed(2);
}

function setChipText(node: HTMLElement | null | undefined, text: string) {
  if (node && node.textContent !== text) node.textContent = text;
}

const num = (v: number) => Math.abs(v).toFixed(1);

function ChipProjector({ chips, hovered }: { chips: RefObject<ChipNodes>; hovered: number | null }) {
  const sim = useSim();
  const { progress } = useFocus();
  const anchor = useRef<THREE.Group>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const last = useRef(-1);
  const [tw] = footprint(FLOORS - 1);

  useFrame(({ camera, size, clock }) => {
    const g = anchor.current;
    const nodes = chips.current;
    if (!g) return;
    const s = sim.current;
    g.updateWorldMatrix(true, false);
    const place = (key: string, x: number, y: number, z: number, opacity = 1) => {
      v.set(x, y, z).applyMatrix4(g.matrixWorld).project(camera);
      moveChip(nodes[key], ((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height, opacity, size.width);
    };
    const on = reveal(s.intro, 0.92, 0.08) * (1 - progress.current);
    const wide = size.width / size.height >= 1.05;
    // 세로 화면은 오른쪽 위에 일시정지 버튼이 있어 왼쪽에 둔다
    if (wide) place("solar", tw / 2 + 0.4, BUILDING_H + 0.75, 0, on);
    else place("solar", -tw / 2 - 0.5, BUILDING_H - 0.9, 0, on);
    place("load", -2.3, BUILDING_H * 0.42, 1.3, on);
    place("hp", HP_ANCHOR[0] + 0.5, HP_ANCHOR[1], HP_ANCHOR[2] + 0.6, on);
    place("ess", ...ESS_ANCHOR, on);
    place("ai", 2.2, BUILDING_H * 0.62, 1.1, s.ai * on);
    if (hovered !== null && progress.current < 0.5) place("floor", footprint(hovered)[0] / 2 + 0.35, hovered * FLOOR_H + FLOOR_H / 2, 0.5);
    else moveChip(nodes.floor, 0, 0, 0);

    // 계측기처럼 0.5초마다 갱신
    if (last.current >= 0 && clock.elapsedTime - last.current < 0.5) return;
    last.current = clock.elapsedTime;
    const hh = Math.floor(s.hour);
    const mm = Math.floor((s.hour - hh) * 60);
    setChipText(nodes.clock, `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    setChipText(nodes.solarValue, num(s.solarKw));
    setChipText(nodes.loadValue, num(s.loadKw));
    setChipText(nodes.gridValue, num(s.gridKw));
    setChipText(nodes.hpValue, num(s.hpKw));
    setChipText(nodes.essSoc, num(s.essSoc * 100));
    setChipText(nodes.essMode, s.essKw > 1 ? "DISCHARGE" : s.essKw < -1 ? "CHARGE" : "IDLE");
    setChipText(nodes.essValue, num(Math.abs(s.essKw) > 1 ? s.essKw : 0));
    setChipText(nodes.aiValue, `−${num(s.aiKw)}`);
    if (hovered !== null) setChipText(nodes.floorValue, num(s.floorLoads[hovered] * (PEAK_KW / FLOORS) * 1.3));
  });

  return <group ref={anchor} />;
}

// 사이트 기본 글꼴 + 폭이 같은 숫자(값이 바뀌어도 칩이 흔들리지 않게), 단위는 작고 흐리게
const chipClass =
  "pointer-events-none absolute left-0 top-0 flex items-baseline gap-1.5 whitespace-nowrap rounded-lg border border-white/12 bg-[#07141b]/80 px-3 py-2 text-[13px] font-semibold leading-none tabular-nums text-white opacity-0 shadow-lg shadow-black/30 backdrop-blur-sm";
// 수치 칩은 설비 확대 보기를 여는 버튼이기도 하다
const chipButton = chipClass.replace("pointer-events-none", "pointer-events-auto cursor-pointer") + " transition-colors hover:border-primary/60 hover:bg-[#0b1f28]/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const LABEL = "text-[10px] font-semibold tracking-[0.06em] text-primary-light";
const SUB = "text-[10px] font-medium tracking-[0.06em] text-white/45";
const UNIT = "-ml-0.5 text-[10px] font-medium text-white/50";
const sep = <span className="mx-1 h-3 w-px self-center bg-white/15" />;

/* ── 카메라 · 움직임 ──────────────────────────────────────────────── */

// 옥상 태양광이 보이도록 약 21° 위에서 내려다본다
const CAMERA_DIR = new THREE.Vector3(0.66, 0.36, 0.72).normalize();

// 확대 보기: 건물 좌표의 바라볼 점 · 카메라 방향 · 거리 (세로 화면은 화면이 좁아 더 멀리서)
const POSES: Record<Focus, { target: THREE.Vector3; dir: THREE.Vector3; dist: number }> = {
  ess: { target: ESS_CENTER_VIEW, dir: new THREE.Vector3(0.45, 0.55, 1).normalize(), dist: 3.8 },
  hp: { target: HP_CENTER, dir: new THREE.Vector3(1, 0.85, 0.75).normalize(), dist: 2.5 },
  solar: { target: new THREE.Vector3(0, BUILDING_H + 0.1, 0), dir: new THREE.Vector3(0.6, 1.3, 0.9).normalize(), dist: 5.6 },
  load: { target: new THREE.Vector3(0, BUILDING_H * 0.45, 0), dir: CAMERA_DIR, dist: 12.5 },
};

const ease = (t: number) => t * t * (3 - 2 * t);

/** 확대 정도를 한 걸음 진행 (움직임 줄이기에서는 바로) */
function stepProgress(progress: RefObject<number>, want: number, delta: number, instant: boolean) {
  const k = 1 - Math.exp(-Math.min(delta, 0.1) * 3);
  progress.current = instant || Math.abs(want - progress.current) < 0.002 ? want : progress.current + (want - progress.current) * k;
  return progress.current;
}

function Rig({ frozen, children }: { frozen: boolean; children: React.ReactNode }) {
  const sim = useSim();
  const { focus, progress } = useFocus();
  const invalidate = useThree((s) => s.invalidate);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const dist = useRef(19.5);
  const lastFocus = useRef<Focus | null>(null);
  const lastOffset = useRef("");
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), target: new THREE.Vector3(), camF: new THREE.Vector3() }), []);

  // 움직임 줄이기(그때만 그리는 모드)에서도 확대 전환이 바로 그려지게
  useEffect(() => {
    invalidate();
  }, [focus, invalidate]);

  // 마우스 위치는 창 전체에서 받는다 (텍스트 위에서도 건물이 따라 돈다)
  useEffect(() => {
    if (frozen) return;
    const onMove = (e: PointerEvent) => {
      // 칩 · 패널 위에서는 건물이 따라 돌지 않는다 (누르려는 칩이 움직이지 않게)
      if ((e.target as Element | null)?.closest?.("[data-hero-ui]")) return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [frozen]);

  useFrame(({ camera, size }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const g = group.current;
    if (!g) return;
    const aspect = size.width / size.height;
    const wide = aspect >= 1.05;
    dist.current = wide ? 19.5 : 19.5 * Math.min(1.62, 0.98 / Math.max(aspect, 0.4));

    if (focus) lastFocus.current = focus;
    const f = ease(stepProgress(progress, focus ? 1 : 0, delta, frozen));

    // 건물 회전: 평소엔 천천히 돌고 마우스를 따르지만, 확대 중에는 고정 각도로
    const p = pointer.current;
    const kp = 1 - Math.exp(-Math.min(delta, 0.1) * 2.5);
    p.sx += (p.x - p.sx) * kp;
    p.sy += (p.y - p.sy) * kp;
    const intro = sim.current.intro;
    const t = frozen ? 0 : performance.now() / 1000;
    const yaw = 0.08 + Math.sin(t * 0.11) * 0.22 + p.sx * 0.28 - (1 - intro) * 0.5;
    g.rotation.y = yaw * (1 - f) + 0.08 * f;
    g.rotation.x = p.sy * 0.04 * (1 - f);
    g.updateWorldMatrix(true, false);

    // 개요 시점 (지어지는 동안 천천히 다가간다)
    const push = 1 + (1 - reveal(intro, 0, 1)) * 0.14;
    tmp.pos.copy(CAMERA_DIR).multiplyScalar(dist.current * push);
    tmp.look.set(0, BUILDING_H * 0.5 - (1 - intro) * 0.6, 0);
    if (lastFocus.current && f > 0) {
      const pose = POSES[lastFocus.current];
      tmp.target.copy(pose.target).applyMatrix4(g.matrixWorld);
      tmp.camF.copy(pose.dir).multiplyScalar(pose.dist * (wide ? 1 : 1.7)).add(tmp.target);
      tmp.pos.lerp(tmp.camF, f);
      tmp.look.lerp(tmp.target, f);
    }
    cam.position.copy(tmp.pos);
    cam.lookAt(tmp.look);

    // 화면 배치: 넓은 화면은 왼쪽 텍스트 · 오른쪽 패널 사이로, 세로 화면은 아래 패널 위로
    const ox = (wide ? -0.21 + 0.14 * f : 0) * size.width;
    const oy = (wide ? -0.03 + 0.03 * f : 0.2 + 0.08 * f) * size.height;
    const key = `${size.width}x${size.height}:${ox.toFixed(1)}:${oy.toFixed(1)}`;
    if (key !== lastOffset.current) {
      lastOffset.current = key;
      cam.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
      cam.updateProjectionMatrix();
    }
  });

  return <group ref={group}>{children}</group>;
}

/* ── 장면 ─────────────────────────────────────────────────────────── */

function Scene({
  frozen,
  shadows,
  mapSize,
  hovered,
  onHover,
  chips,
}: {
  frozen: boolean;
  shadows: boolean;
  mapSize: number;
  hovered: number | null;
  onHover: (i: number | null) => void;
  chips: RefObject<ChipNodes>;
}) {
  return (
    <>
      <SimDriver frozen={frozen} />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 20, 42]} />
      <Sky />
      <Lighting shadows={shadows} mapSize={mapSize} />
      <Rig frozen={frozen}>
        <Stage />
        <Site />
        <StreetLights />
        <Blueprint />
        <Cables />
        {Array.from({ length: FLOORS }, (_, i) => (
          <Floor key={i} index={i} hovered={hovered === i} onHover={onHover} />
        ))}
        <Mullions />
        <Roofs />
        <Core />
        <Canopy />
        <SolarArray />
        <HeatPumps />
        <EssUnits />
        <EnergyFlow />
        <ScanRing />
        <ChipProjector chips={chips} hovered={hovered} />
      </Rig>
    </>
  );
}

export default function HeroBuildingScene({
  active,
  eventSource,
  onReady,
}: {
  /** false 면 그리기를 멈춘다 (일시정지 · 화면 밖) */
  active: boolean;
  eventSource: RefObject<HTMLElement | null>;
  onReady?: () => void;
}) {
  const [reducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState<number | null>(null);
  // 프레임이 떨어지는 기기에서는 해상도를 1배로 낮춘다
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  // 실시간 그림자도 같은 기준으로 끈다. 작은 화면은 그림자 해상도를 낮춘다
  const [shadows, setShadows] = useState(true);
  const [mapSize] = useState(() => (window.innerWidth < 768 ? 1024 : 2048));
  const sim = useRef<Sim>(createSim(reducedMotion));
  const t = useTranslations("home.hero.detail");
  const [focus, setFocusState] = useState<Focus | null>(null);
  const progress = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const setFocus = useCallback((f: Focus | null) => {
    if (f && document.activeElement instanceof HTMLButtonElement) opener.current = document.activeElement;
    setFocusState(f);
    if (!f) document.body.style.cursor = "";
  }, []);
  const close = useCallback(() => {
    setFocus(null);
    opener.current?.focus();
    opener.current = null;
  }, [setFocus]);
  const focusValue = useMemo(() => ({ focus, setFocus, progress }), [focus, setFocus]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, close]);

  const chips = useRef<ChipNodes>({});
  const chip = (key: string) => (el: HTMLElement | null) => {
    chips.current[key] = el;
  };

  return (
    <SimContext.Provider value={sim}>
      <FocusContext.Provider value={focusValue}>
      <Canvas
        dpr={dpr}
        camera={{ fov: 30, near: 0.1, far: 100 }}
        frameloop={reducedMotion ? "demand" : active || focus ? "always" : "never"}
        onPointerMissed={(e) => {
          if (focus && !fromUi(e)) close();
        }}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          // 유리 · 금속에 은은한 반사를 주는 실내 조명 환경 (네트워크 없이 생성)
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.28;
          pmrem.dispose();
          onReady?.();
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr(1);
            setShadows(false);
          }}
        />
        <Scene frozen={reducedMotion} shadows={shadows} mapSize={mapSize} hovered={hovered} onHover={setHovered} chips={chips} />
      </Canvas>
      <button type="button" ref={chip("solar")} data-hero-ui className={chipButton} onClick={() => setFocus("solar")} aria-label={t("open", { name: "SOLAR" })}>
        <span ref={chip("clock")} className="text-white/70">
          06:00
        </span>
        {sep}
        <span className={LABEL}>SOLAR</span>
        <span ref={chip("solarValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </button>
      <button type="button" ref={chip("load")} data-hero-ui className={`${chipButton} hidden sm:flex`} onClick={() => setFocus("load")} aria-label={t("open", { name: "LOAD" })}>
        <span className={LABEL}>LOAD</span>
        <span ref={chip("loadValue")}>0.0</span>
        <span className={UNIT}>kW</span>
        {sep}
        <span className={SUB}>GRID</span>
        <span ref={chip("gridValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </button>
      <button type="button" ref={chip("hp")} data-hero-ui className={`${chipButton} hidden sm:flex`} onClick={() => setFocus("hp")} aria-label={t("open", { name: "HEAT PUMP" })}>
        <span className={LABEL}>HEAT PUMP</span>
        <span ref={chip("hpValue")}>0.0</span>
        <span className={UNIT}>kW</span>
        {sep}
        <span className={SUB}>COP</span>
        <span>{HP_COP.toFixed(1)}</span>
      </button>
      <button type="button" ref={chip("ess")} data-hero-ui className={chipButton} onClick={() => setFocus("ess")} aria-label={t("open", { name: "ESS" })}>
        <span className={LABEL}>ESS</span>
        <span ref={chip("essSoc")}>0.0</span>
        <span className={UNIT}>%</span>
        {sep}
        <span ref={chip("essMode")} className={SUB}>
          IDLE
        </span>
        <span ref={chip("essValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </button>
      <div ref={chip("ai")} className={`${chipClass} border-primary/60`}>
        <span className={LABEL}>AI SAVING</span>
        <span>−{(AI_SAVING * 100).toFixed(1)}</span>
        <span className={UNIT}>%</span>
        {sep}
        <span ref={chip("aiValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </div>
      <div ref={chip("floor")} className={`${chipClass} border-primary/50`}>
        <span className={LABEL}>{hovered === null ? "" : `${hovered + 1}F`}</span>
        <span ref={chip("floorValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </div>
      {focus && <DetailPanel focus={focus} sim={sim} onClose={close} />}
      </FocusContext.Provider>
    </SimContext.Provider>
  );
}
