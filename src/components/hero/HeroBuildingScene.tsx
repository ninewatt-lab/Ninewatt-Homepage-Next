"use client";

/**
 * 홈 히어로 3D — 에너지를 보여주는 건물의 디지털 트윈 (three.js).
 * HeroSection 이 동적으로 불러온다(초기 번들에 넣지 않음). 수치 · 근거는 heroSim.ts.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  Blueprint,
  Canopy,
  Core,
  ESS_ANCHOR,
  ESS_ENTRY,
  ESS_PORT,
  EssUnits,
  FLOW_NORM,
  Facade,
  Fins,
  Floor,
  HP_ANCHOR,
  HeatPumps,
  RISER_Z,
  SolarArray,
  TEAL,
} from "./BuildingModel";
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
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[3.4, 3.5, 0.08, 64]} />
        <meshStandardMaterial color="#0b1c25" roughness={0.9} />
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
    const on = reveal(s.intro, 0.92, 0.08);
    const wide = size.width / size.height >= 1.05;
    // 세로 화면은 오른쪽 위에 일시정지 버튼이 있어 왼쪽에 둔다
    if (wide) place("solar", tw / 2 + 0.4, BUILDING_H + 0.75, 0, on);
    else place("solar", -tw / 2 - 0.5, BUILDING_H - 0.9, 0, on);
    place("load", -2.3, BUILDING_H * 0.42, 1.3, on);
    place("hp", HP_ANCHOR[0] + 0.5, HP_ANCHOR[1], HP_ANCHOR[2] + 0.6, on);
    place("ess", ...ESS_ANCHOR, on);
    place("ai", 2.2, BUILDING_H * 0.62, 1.1, s.ai * on);
    if (hovered !== null) place("floor", footprint(hovered)[0] / 2 + 0.35, hovered * FLOOR_H + FLOOR_H / 2, 0.5);
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
const LABEL = "text-[10px] font-semibold tracking-[0.06em] text-primary-light";
const SUB = "text-[10px] font-medium tracking-[0.06em] text-white/45";
const UNIT = "-ml-0.5 text-[10px] font-medium text-white/50";
const sep = <span className="mx-1 h-3 w-px self-center bg-white/15" />;

/* ── 카메라 · 움직임 ──────────────────────────────────────────────── */

// 옥상 태양광이 보이도록 약 21° 위에서 내려다본다
const CAMERA_DIR = new THREE.Vector3(0.66, 0.36, 0.72).normalize();

function Rig({ frozen, children }: { frozen: boolean; children: React.ReactNode }) {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const lastSize = useRef("");
  const dist = useRef(19.5);

  // 마우스 위치는 창 전체에서 받는다 (텍스트 위에서도 건물이 따라 돈다)
  useEffect(() => {
    if (frozen) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [frozen]);

  useFrame(({ camera, size }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    // 가로 화면: 건물을 오른쪽으로 (왼쪽은 텍스트) · 세로 화면: 위쪽으로 (아래는 텍스트)
    const key = `${size.width}x${size.height}`;
    if (key !== lastSize.current) {
      lastSize.current = key;
      const aspect = size.width / size.height;
      const wide = aspect >= 1.05;
      dist.current = wide ? 19.5 : 19.5 * Math.min(1.62, 0.98 / Math.max(aspect, 0.4));
      if (wide) cam.setViewOffset(size.width, size.height, -size.width * 0.21, -size.height * 0.03, size.width, size.height);
      else cam.setViewOffset(size.width, size.height, 0, size.height * 0.2, size.width, size.height);
      cam.updateProjectionMatrix();
    }
    // 지어지는 동안 천천히 다가간다
    const intro = sim.current.intro;
    const push = 1 + (1 - reveal(intro, 0, 1)) * 0.14;
    cam.position.copy(CAMERA_DIR).multiplyScalar(dist.current * push);
    cam.lookAt(0, BUILDING_H * 0.5 - (1 - intro) * 0.6, 0);

    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 2.5);
    p.sx += (p.x - p.sx) * k;
    p.sy += (p.y - p.sy) * k;
    const t = frozen ? 0 : performance.now() / 1000;
    g.rotation.y = 0.08 + Math.sin(t * 0.11) * 0.22 + p.sx * 0.28 - (1 - intro) * 0.5;
    g.rotation.x = p.sy * 0.04;
  });

  return <group ref={group}>{children}</group>;
}

function Sun() {
  const sim = useSim();
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const light = ref.current;
    if (!light) return;
    const { hour, solarKw } = sim.current;
    const a = ((hour - 6) / 12) * Math.PI;
    light.position.set(Math.cos(a) * 12, 3 + Math.sin(a) * 12, 6);
    light.intensity = 0.25 + (solarKw / 18) * 0.85;
  });
  return <directionalLight ref={ref} color="#fff1dc" />;
}

/* ── 장면 ─────────────────────────────────────────────────────────── */

function Scene({
  frozen,
  hovered,
  onHover,
  chips,
}: {
  frozen: boolean;
  hovered: number | null;
  onHover: (i: number | null) => void;
  chips: RefObject<ChipNodes>;
}) {
  return (
    <>
      <SimDriver frozen={frozen} />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 20, 42]} />
      <hemisphereLight args={["#bfe6ee", "#0b1c25", 0.5]} />
      <Sun />
      <Rig frozen={frozen}>
        <Stage />
        <Blueprint />
        <Cables />
        {Array.from({ length: FLOORS }, (_, i) => (
          <Floor key={i} index={i} hovered={hovered === i} onHover={onHover} />
        ))}
        <Facade />
        <Fins />
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
  const sim = useRef<Sim>(createSim(reducedMotion));
  const chips = useRef<ChipNodes>({});
  const chip = (key: string) => (el: HTMLElement | null) => {
    chips.current[key] = el;
  };

  return (
    <SimContext.Provider value={sim}>
      <Canvas
        dpr={dpr}
        camera={{ fov: 30, near: 0.1, far: 100 }}
        frameloop={reducedMotion ? "demand" : active ? "always" : "never"}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          // 유리 · 금속에 은은한 반사를 주는 실내 조명 환경 (네트워크 없이 생성)
          const pmrem = new THREE.PMREMGenerator(gl);
          scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
          scene.environmentIntensity = 0.35;
          pmrem.dispose();
          onReady?.();
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Scene frozen={reducedMotion} hovered={hovered} onHover={setHovered} chips={chips} />
      </Canvas>
      <div ref={chip("solar")} className={chipClass}>
        <span ref={chip("clock")} className="text-white/70">
          06:00
        </span>
        {sep}
        <span className={LABEL}>SOLAR</span>
        <span ref={chip("solarValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </div>
      <div ref={chip("load")} className={`${chipClass} hidden sm:flex`}>
        <span className={LABEL}>LOAD</span>
        <span ref={chip("loadValue")}>0.0</span>
        <span className={UNIT}>kW</span>
        {sep}
        <span className={SUB}>GRID</span>
        <span ref={chip("gridValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </div>
      <div ref={chip("hp")} className={`${chipClass} hidden sm:flex`}>
        <span className={LABEL}>HEAT PUMP</span>
        <span ref={chip("hpValue")}>0.0</span>
        <span className={UNIT}>kW</span>
        {sep}
        <span className={SUB}>COP</span>
        <span>{HP_COP.toFixed(1)}</span>
      </div>
      <div ref={chip("ess")} className={chipClass}>
        <span className={LABEL}>ESS</span>
        <span ref={chip("essSoc")}>0.0</span>
        <span className={UNIT}>%</span>
        {sep}
        <span ref={chip("essMode")} className={SUB}>
          IDLE
        </span>
        <span ref={chip("essValue")}>0.0</span>
        <span className={UNIT}>kW</span>
      </div>
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
    </SimContext.Provider>
  );
}
