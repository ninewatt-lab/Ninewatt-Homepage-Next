"use client";

/**
 * Product 페이지 3D 테마 지역 (three.js). DistrictSection 이 동적으로 불러온다(초기 번들에 넣지 않음).
 * 시설을 누르면 카메라가 그 시설로 다가간 뒤 제품 상세 페이지로 간다.
 * 라벨은 캔버스 밖 DOM 링크라 키보드 · 검색엔진도 따라갈 수 있다.
 * 시간(인트로 · 낮과 밤)은 홈 히어로와 같은 시뮬레이션, 하늘 · 조명도 히어로 것을 쓴다.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Link } from "@/i18n/navigation";
import { Lighting, Sky } from "@/components/hero/Atmosphere";
import { BEMS_FLOOR, SimContext, createSim, reveal, stepSim, useSim, type BemsKind, type BemsStage, type Sim } from "@/components/hero/heroSim";
import { Appear, DistrictContext, TEAL } from "./common";
import CityContext from "./CityContext";
import Effects from "./Effects";
import { CloudShadows, Pedestrians } from "./Life";
import { ContactShadows, Roads, StreetTrees } from "./Streetscape";
import { FACILITY, PLATE, PRODUCT_HREF, PRODUCT_ORDER, type ProductKey } from "./districtLayout";
import {
  EnergyFlow,
  Fillers,
  Ground,
  Highlight,
  OfficeTower,
  Park,
  Parking,
  PeakEss,
  PowerLines,
  PvFarm,
  Remodeling,
  RoadLamps,
  SharedEss,
  SolarScopeLot,
  TOWER,
  Traffic,
} from "./Facilities";

const BG = "#050d13";

// 건물 밑 접지 그늘 [x, z, 너비, 깊이, 높이] — 발치가 바닥에 붙어 보이게
const GROUND_SHADOWS: [number, number, number, number, number][] = [
  [-6.5, -4.6, 3.9, 3.1, 0.004],
  [-11, -5.5, 3.0, 2.6, 0.004],
  [-10.8, -1.9, 2.6, 1.8, 0.004],
  [6.4, -1.9, 2.2, 1.6, 0.004],
  [7.6, 3.2, 3.7, 2.9, 0.004],
  [-11, 7.6, 1.2, 0.85, 0.045],
];

/** 낮은 빠르게 · 밤은 느리게 — 도시 야경이 하루의 절반 넘게 머문다 (시뮬레이션 수치는 그대로) */
const DAY_PACE = 1.35;
const NIGHT_PACE = 0.7;

function driveSim(sim: Sim, delta: number, frozen: boolean) {
  const pace = THREE.MathUtils.lerp(DAY_PACE, NIGHT_PACE, sim.dark);
  stepSim(sim, frozen ? 0 : Math.min(delta, 0.1) * pace, frozen);
  // 움직임 줄이기(시각 고정)에서는 경보 장면이 멈춘 채 남지 않게 뺀다
  if (frozen) sim.bems = null;
}

function SimDriver({ frozen }: { frozen: boolean }) {
  const sim = useSim();
  useFrame((_, delta) => driveSim(sim.current, delta, frozen));
  return null;
}

/* ── 카메라 · 라벨 ────────────────────────────────────────────────── */

const CAMERA_DIR = new THREE.Vector3(0.45, 0.72, 0.85).normalize();
const LOOK = new THREE.Vector3(0.6, 0, 0.6);
const DIVE_SECONDS = 0.8;
/** 도시 보기: 더 높이 · 멀리서 지역 뒤 도시까지 */
const CITY_DIR = new THREE.Vector3(0.36, 1.05, 0.72).normalize();
const CITY_LOOK = new THREE.Vector3(-6, 0, -9);
const CITY_ZOOM = 2.3;
const VIEW_SECONDS = 1.3;
/** 캔버스 위에 투명하게 겹친 헤더(64) + 제품 탭(약 51) — 지역과 라벨은 그 아래에 놓는다 */
const TOP_INSET = 116;

type ChipNodes = Record<string, HTMLElement | null>;
type Placed = { node: HTMLElement; x: number; y: number; w: number; h: number };
type Dive = { key: ProductKey };
type Flight = { req: Dive; start: number; from: THREE.Vector3; to: THREE.Vector3; look: THREE.Vector3; done: boolean };
export type DistrictView = "city" | "district";
export type AlertState = { kind: BemsKind; stage: BemsStage } | null;
export type AlertTexts = Record<BemsKind, Record<BemsStage, string>>;

/** 경보 칩이 가리키는 곳: 빌딩 서쪽 벽 (피크는 빌딩 중간, 대기전력은 그 층) */
const ALERT_ANCHOR: Record<BemsKind, [number, number, number]> = {
  peak: [TOWER.x - TOWER.w / 2, TOWER.h * 0.55, TOWER.z + TOWER.d / 2],
  night: [TOWER.x - TOWER.w / 2, ((BEMS_FLOOR + 0.5) * TOWER.h) / 12, TOWER.z + TOWER.d / 2],
};

/** 라벨끼리 겹치면 아래쪽 라벨을 밀어 내린다 (y 는 라벨 아래 끝) */
function placeLabels(items: Placed[], maxX: number, opacity: number) {
  for (const it of items) {
    it.x = Math.min(Math.max(it.x, it.w / 2 + 8), maxX - it.w / 2 - 8);
    it.y = Math.max(it.y, TOP_INSET + it.h + 6);
  }
  items.sort((a, b) => a.y - b.y);
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = items[j];
        const b = items[i];
        const overlapX = Math.abs(a.x - b.x) < (a.w + b.w) / 2 + 4;
        const overlapY = b.y - b.h < a.y + 4 && b.y > a.y - a.h;
        if (overlapX && overlapY) b.y = a.y + b.h + 4;
      }
    }
  }
  for (const it of items) {
    it.node.style.transform = `translate3d(${it.x}px, ${it.y}px, 0) translate(-50%, -100%)`;
    it.node.style.opacity = String(opacity);
    it.node.style.visibility = opacity < 0.02 ? "hidden" : "";
  }
}

/** 경보 칩은 가리키는 곳의 왼쪽 위 — 화면 밖으로 나가면 안쪽으로 밀고, 지시선은 칩 아래 끝에서 그곳까지 */
function placeAlert(root: HTMLElement, sx: number, sy: number, maxX: number, opacity: number) {
  const chip = root.firstElementChild as HTMLElement | null;
  const line = root.querySelector("polyline");
  const dot = root.querySelector("circle");
  if (!chip || !line || !dot) return;
  const w = chip.offsetWidth;
  const h = chip.offsetHeight;
  const right = Math.min(Math.max(sx - 22, w + 8), maxX - 8);
  const bottom = Math.max(sy - 20, TOP_INSET + h + 6);
  chip.style.transform = `translate3d(${right - w}px, ${bottom - h}px, 0)`;
  const fromX = Math.min(Math.max(sx, right - w + 14), right - 14);
  line.setAttribute("points", `${fromX},${bottom} ${sx},${sy}`);
  dot.setAttribute("cx", String(sx));
  dot.setAttribute("cy", String(sy));
  root.style.opacity = String(opacity);
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function setOffset(cam: THREE.PerspectiveCamera, w: number, h: number, wide: boolean, k: number) {
  // 넓은 화면: 왼쪽 제목 · 카드를 비켜 오른쪽으로 · 세로 화면: 위 제목과 아래 카드 사이로
  // 위쪽은 헤더 · 탭이 덮으므로 그만큼 아래로 내린다
  if (wide) cam.setViewOffset(w, h, -w * 0.07 * k, -(TOP_INSET / 2 + (h - TOP_INSET) * 0.02) * k, w, h);
  else cam.setViewOffset(w, h, 0, -h * 0.03 * k, w, h);
  cam.updateProjectionMatrix();
}

// 지도처럼 누르는 화면이라 마우스를 따라 돌지 않는다 — 누르려는 시설이 움직이지 않게
function Rig({
  chips,
  alertRef,
  onAlert,
  dive,
  view,
  viewRef,
  frozen,
  onArrive,
  children,
}: {
  chips: RefObject<ChipNodes>;
  alertRef: RefObject<HTMLElement | null>;
  onAlert: (a: AlertState) => void;
  dive: Dive | null;
  view: DistrictView;
  viewRef: RefObject<number>;
  frozen: boolean;
  onArrive: (k: ProductKey) => void;
  children: ReactNode;
}) {
  const sim = useSim();
  // 움직임 줄이기에서는 매 프레임 그리지 않으므로 보기를 바꾸면 한 번 다시 그린다
  const invalidate = useThree((st) => st.invalidate);
  useEffect(() => invalidate(), [view, invalidate]);
  const group = useRef<THREE.Group>(null);
  const lastSize = useRef("");
  const lastAlert = useRef("");
  const flight = useRef<Flight | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size, scene, clock }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const wide = aspect >= 1.05;
    const key = `${size.width}x${size.height}`;

    // 시설로 다가가기: 시설을 화면 가운데에 두고 가까이 → 도착하면 제품 페이지로
    if (dive && flight.current?.req !== dive) {
      const z = FACILITY[dive.key].zones[0];
      const focus = new THREE.Vector3(z.x, Math.min(FACILITY[dive.key].label[1] * 0.45, 2.6), z.z);
      const reach = Math.max(z.w, z.d, FACILITY[dive.key].label[1]) * 2.1 + 5;
      flight.current = { req: dive, start: clock.elapsedTime, from: cam.position.clone(), to: focus.clone().addScaledVector(CAMERA_DIR, reach), look: focus, done: false };
    }
    const f = flight.current;
    let fade = 1;
    if (f) {
      const p = Math.min(1, (clock.elapsedTime - f.start) / DIVE_SECONDS);
      const e = ease(p);
      cam.position.lerpVectors(f.from, f.to, e);
      cam.lookAt(v.copy(LOOK).lerp(f.look, e));
      setOffset(cam, size.width, size.height, wide, 1 - e);
      fade = Math.max(0, 1 - p * 3);
      if (p >= 1 && !f.done) {
        f.done = true;
        onArrive(f.req.key);
      }
    } else {
      // 도시 ↔ 지역 보기: 같은 방향에서 높이 · 거리만 바꿔 날아간다
      const goal = view === "city" ? 1 : 0;
      const moving = viewRef.current !== goal;
      if (moving) {
        const step = frozen ? 1 : Math.min(delta, 0.1) / VIEW_SECONDS;
        viewRef.current = goal > viewRef.current ? Math.min(goal, viewRef.current + step) : Math.max(goal, viewRef.current - step);
        // 움직임 줄이기: 한 번에 옮기고, 지역 테두리도 바뀐 값으로 한 번 더 그린다
        if (frozen) invalidate();
      }
      if (moving || key !== lastSize.current) {
        lastSize.current = key;
        // 넓은 화면은 헤더 아래 남는 높이에 지역이 들어가도록 조금 물러선다
        const base = wide ? 42 * Math.min(1.25, (0.92 * size.height) / Math.max(size.height - TOP_INSET, 1)) : 42 * Math.min(2.0, 1.1 / Math.max(aspect, 0.4));
        const e = ease(viewRef.current);
        const dist = THREE.MathUtils.lerp(base, base * CITY_ZOOM, e);
        dir.copy(CAMERA_DIR).lerp(CITY_DIR, e).normalize();
        look.copy(LOOK).lerp(CITY_LOOK, e);
        cam.position.copy(dir).multiplyScalar(dist).add(look);
        cam.lookAt(look);
        // 안개는 카메라 거리에 맞춘다 (세로 화면은 멀리서 보므로) — 지역 너머 도시는 어둠에 묻힌다
        if (scene.fog instanceof THREE.Fog) {
          scene.fog.near = THREE.MathUtils.lerp(base + 12, dist + 10, e);
          scene.fog.far = THREE.MathUtils.lerp(base + 42, dist + 95, e);
        }
        setOffset(cam, size.width, size.height, wide, 1);
      }
    }
    const g = group.current;
    if (!g) return;
    g.updateWorldMatrix(true, false);

    // 시설 라벨을 화면 좌표로 (겹치면 비켜 놓는다). 지역이 다 지어진 뒤에 나타난다
    const items: Placed[] = [];
    for (const k of PRODUCT_ORDER) {
      const node = chips.current[k];
      if (!node) continue;
      const [x, y, z] = FACILITY[k].label;
      v.set(x, y, z).applyMatrix4(g.matrixWorld).project(cam);
      items.push({ node, x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height, w: node.offsetWidth, h: node.offsetHeight });
    }
    // 도시 보기에서는 시설 라벨 · 경보 칩을 감춘다
    const shown = reveal(sim.current.intro, 0.82, 0.18) * fade * Math.max(0, 1 - viewRef.current * 2.5);
    placeLabels(items, size.width, shown);

    // 빌딩 경보 칩: 단계가 바뀔 때만 React 로 알리고, 위치는 매 프레임 직접 옮긴다
    const b = sim.current.bems;
    const akey = b ? `${b.kind}:${b.stage}` : "";
    if (akey !== lastAlert.current) {
      lastAlert.current = akey;
      onAlert(b ? { kind: b.kind, stage: b.stage } : null);
    }
    const an = alertRef.current;
    if (an && b) {
      const [x, y, z] = ALERT_ANCHOR[b.kind];
      v.set(x, y, z).applyMatrix4(g.matrixWorld).project(cam);
      placeAlert(an, ((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height, size.width, shown);
    }
  });

  return <group ref={group}>{children}</group>;
}

/* ── 도시 보기에서 지역 테두리 (누르면 지역 보기로) ───────────────── */

function tickOutline(group: THREE.Group, t: number, time: number) {
  group.visible = t > 0.01;
  group.children.forEach((c, i) => {
    const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
    m.opacity = t * (i === 0 ? 0.1 : 0.75 + 0.25 * Math.sin(time * 3));
  });
}

function PlateOutline({ viewRef, onPick }: { viewRef: RefObject<number>; onPick: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) tickOutline(ref.current, viewRef.current, clock.elapsedTime);
  });
  const W = PLATE.w + 0.8;
  const D = PLATE.d + 0.8;
  const bars: [number, number, number, number][] = [
    [0, -D / 2, W, 0.28],
    [0, D / 2, W, 0.28],
    [-W / 2, 0, 0.28, D],
    [W / 2, 0, 0.28, D],
  ];
  const mat = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, color: TEAL } as const;
  return (
    <group ref={ref} visible={false}>
      <mesh
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (viewRef.current < 0.5) return;
          e.stopPropagation();
          onPick();
        }}
        onPointerOver={() => viewRef.current > 0.5 && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <planeGeometry args={[W, D]} />
        <meshBasicMaterial {...mat} />
      </mesh>
      {bars.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.09, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshBasicMaterial {...mat} />
        </mesh>
      ))}
    </group>
  );
}

/* ── 장면 ─────────────────────────────────────────────────────────── */

// 땅 → 큰 건물 → 설비 · 공원 → 전선 · 차 순으로 지어진다
function Scene({
  shadows,
  chips,
  alertRef,
  onAlert,
  frozen,
  dive,
  view,
  viewRef,
  onView,
  onArrive,
}: {
  shadows: boolean;
  chips: RefObject<ChipNodes>;
  alertRef: RefObject<HTMLElement | null>;
  onAlert: (a: AlertState) => void;
  frozen: boolean;
  dive: Dive | null;
  view: DistrictView;
  viewRef: RefObject<number>;
  onView: (v: DistrictView) => void;
  onArrive: (k: ProductKey) => void;
}) {
  return (
    <>
      <SimDriver frozen={frozen} />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 52, 100]} />
      <Sky radius={220} />
      <Lighting shadows={shadows} mapSize={2048} bounds={16} reach={30} />
      <Rig chips={chips} alertRef={alertRef} onAlert={onAlert} dive={dive} view={view} viewRef={viewRef} frozen={frozen} onArrive={onArrive}>
        <Appear at={0} dur={0.2}>
          <CityContext />
        </Appear>
        <Ground />
        <Appear at={0} dur={0.12}>
          <Roads />
          <ContactShadows spots={GROUND_SHADOWS} />
        </Appear>
        <Appear at={0.08} dur={0.22}>
          <OfficeTower />
        </Appear>
        <Appear at={0.16}>
          <Fillers />
        </Appear>
        <Appear at={0.24}>
          <Remodeling />
        </Appear>
        <Appear at={0.3}>
          <PeakEss />
        </Appear>
        <Appear at={0.36}>
          <SharedEss />
        </Appear>
        <Appear at={0.42}>
          <SolarScopeLot />
        </Appear>
        <Appear at={0.48}>
          <Park />
        </Appear>
        <Appear at={0.54}>
          <Parking />
        </Appear>
        <Appear at={0.6}>
          <PvFarm />
        </Appear>
        <Appear at={0.66}>
          <PowerLines />
          <RoadLamps />
        </Appear>
        <Appear at={0.7}>
          <StreetTrees />
        </Appear>
        <Appear at={0.74}>
          <Traffic />
          <Pedestrians />
        </Appear>
        <EnergyFlow />
        <CloudShadows w={PLATE.w} d={PLATE.d} />
        <Highlight />
        <PlateOutline viewRef={viewRef} onPick={() => onView("district")} />
      </Rig>
    </>
  );
}

export type DistrictProduct = { name: string; place: string };

function AlertIcon({ stage }: { stage: BemsStage }) {
  if (stage === "resolved")
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="6" fill="#49B6CA" />
        <path d="M3.4 6.2l1.8 1.8 3.4-3.6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  const color = stage === "alert" ? "#ff4b4b" : "#F5A54A";
  return (
    <span className="relative flex h-3 w-3 items-center justify-center" aria-hidden="true">
      <span className="hero-beacon absolute inset-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="relative flex h-3 w-3 items-center justify-center rounded-full text-[9px] font-bold leading-none" style={{ backgroundColor: color }}>
        !
      </span>
    </span>
  );
}

export default function DistrictScene({
  products,
  active,
  onHover,
  onGo,
  onReady,
  running,
  view,
  onView,
  alertTexts,
  overlay,
}: {
  products: Record<ProductKey, DistrictProduct>;
  active: ProductKey | null;
  onHover: (k: ProductKey | null) => void;
  onGo: (k: ProductKey) => void;
  onReady?: () => void;
  running: boolean;
  view: DistrictView;
  onView: (v: DistrictView) => void;
  alertTexts: AlertTexts;
  /** 캔버스 위 · 라벨 아래에 깔 장식(그라데이션) */
  overlay?: ReactNode;
}) {
  const [frozen] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  const [shadows, setShadows] = useState(true);
  const [fx, setFx] = useState(true);
  const declines = useRef(0);
  const [dive, setDive] = useState<Dive | null>(null);
  const sim = useRef(createSim(frozen));
  const chips = useRef<ChipNodes>({});
  const alertRef = useRef<HTMLDivElement>(null);
  const [alert, setAlert] = useState<AlertState>(null);
  const viewRef = useRef(view === "city" ? 1 : 0);

  // 움직임 줄이기에서는 다가가지 않고 바로 이동
  const startDive = useCallback(
    (k: ProductKey) => {
      onHover(k);
      if (frozen) onGo(k);
      else setDive((d) => d ?? { key: k });
    },
    [frozen, onGo, onHover],
  );
  // 다가가는 동안에는 고른 시설을 바꾸지 않는다 (라벨이 사라지며 생기는 pointerleave 등)
  const hover = useCallback((k: ProductKey | null) => !dive && onHover(k), [dive, onHover]);
  const value = useMemo(() => ({ active, setHover: hover, go: startDive }), [active, hover, startDive]);

  return (
    <DistrictContext.Provider value={value}>
      <SimContext.Provider value={sim}>
        <Canvas
          dpr={dpr}
          shadows
          camera={{ fov: 30, near: 0.5, far: 320 }}
          frameloop={frozen ? "demand" : running ? "always" : "never"}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={({ gl, scene }) => {
            const pmrem = new THREE.PMREMGenerator(gl);
            scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
            scene.environmentIntensity = 0.3;
            pmrem.dispose();
            onReady?.();
          }}
          onPointerMissed={() => hover(null)}
        >
          <PerformanceMonitor
            onDecline={() => {
              // 느려지면 후처리부터 끄고, 그래도 느리면 해상도 · 그림자를 낮춘다
              declines.current += 1;
              if (declines.current === 1) setFx(false);
              else {
                setDpr(1);
                setShadows(false);
              }
            }}
          />
          <Scene shadows={shadows} chips={chips} alertRef={alertRef} onAlert={setAlert} frozen={frozen} dive={dive} view={view} viewRef={viewRef} onView={onView} onArrive={onGo} />
          {fx && <Effects />}
        </Canvas>
      </SimContext.Provider>
      {overlay}
      {/* 시설 라벨 = 제품 상세 페이지 링크 (그냥 누르면 시설로 다가간 뒤 이동, 새 탭 열기 등은 그대로) */}
      {PRODUCT_ORDER.map((key) => (
        <Link
          key={key}
          href={PRODUCT_HREF[key] as "/product/bems"}
          ref={(el: HTMLAnchorElement | null) => {
            chips.current[key] = el;
          }}
          data-district-ui
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            startDive(key);
          }}
          onPointerEnter={() => hover(key)}
          onPointerLeave={() => hover(null)}
          onFocus={() => hover(key)}
          onBlur={() => hover(null)}
          className={`group absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-left opacity-0 shadow-lg shadow-black/30 backdrop-blur-sm transition-colors ${
            active === key ? "border-primary bg-[#0b2530]/90" : "border-white/12 bg-[#07141b]/80 hover:border-primary/60"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="hero-beacon absolute inset-0 rounded-full bg-primary-light" style={{ animationDelay: `${PRODUCT_ORDER.indexOf(key) * 0.45}s` }} />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary-light" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[12px] font-semibold text-white">{products[key].name}</span>
            <span className="hidden text-[10px] text-white/55 sm:block">{products[key].place}</span>
          </span>
          <svg className="ml-0.5 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white/90" width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
            <path d="M2.5 1.5L5.5 4l-3 2.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      ))}
      {/* 빌딩 경보 칩 — 빌딩 서쪽 벽을 지시선으로 가리킨다 */}
      {alert && (
        <div ref={alertRef} aria-live="polite" className="pointer-events-none absolute inset-0 opacity-0">
          <span
            className={`absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg shadow-black/40 backdrop-blur-sm sm:text-[12px] ${
              alert.stage === "alert" ? "border-[#ff4b4b]/70 bg-[#2b0e12]/85" : alert.stage === "ai" ? "border-[#F5A54A]/70 bg-[#2b1c0b]/85" : "border-primary/70 bg-[#0b2530]/85"
            }`}
          >
            <AlertIcon stage={alert.stage} />
            {alertTexts[alert.kind][alert.stage]}
          </span>
          <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <polyline fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <circle r="2" fill="white" />
          </svg>
        </div>
      )}
    </DistrictContext.Provider>
  );
}
