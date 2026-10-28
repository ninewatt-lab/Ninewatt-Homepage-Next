"use client";

/**
 * Product 페이지 3D 테마 지역 (three.js). DistrictSection 이 동적으로 불러온다(초기 번들에 넣지 않음).
 * 시설을 누르면 카메라가 그 시설로 다가간 뒤 제품 상세 페이지로 간다.
 * 라벨은 캔버스 밖 DOM 링크라 키보드 · 검색엔진도 따라갈 수 있다.
 * 시간(인트로 · 낮과 밤)은 홈 히어로와 같은 시뮬레이션, 하늘 · 조명도 히어로 것을 쓴다.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Link } from "@/i18n/navigation";
import { Lighting, Sky } from "@/components/hero/Atmosphere";
import { SimContext, createSim, reveal, stepSim, useSim } from "@/components/hero/heroSim";
import { Appear, DistrictContext } from "./common";
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

function SimDriver({ frozen }: { frozen: boolean }) {
  const sim = useSim();
  useFrame((_, delta) => {
    stepSim(sim.current, frozen ? 0 : Math.min(delta, 0.1), frozen);
  });
  return null;
}

/* ── 카메라 · 라벨 ────────────────────────────────────────────────── */

const CAMERA_DIR = new THREE.Vector3(0.45, 0.72, 0.85).normalize();
const LOOK = new THREE.Vector3(0.6, 0, 0.6);
const DIVE_SECONDS = 0.8;
/** 캔버스 위에 투명하게 겹친 헤더(64) + 제품 탭(약 51) — 지역과 라벨은 그 아래에 놓는다 */
const TOP_INSET = 116;

type ChipNodes = Record<string, HTMLElement | null>;
type Placed = { node: HTMLElement; x: number; y: number; w: number; h: number };
type Dive = { key: ProductKey };
type Flight = { req: Dive; start: number; from: THREE.Vector3; to: THREE.Vector3; look: THREE.Vector3; done: boolean };

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

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function setOffset(cam: THREE.PerspectiveCamera, w: number, h: number, wide: boolean, k: number) {
  // 넓은 화면: 왼쪽 제목 · 카드를 비켜 오른쪽으로 · 세로 화면: 위 제목과 아래 카드 사이로
  // 위쪽은 헤더 · 탭이 덮으므로 그만큼 아래로 내린다
  if (wide) cam.setViewOffset(w, h, -w * 0.07 * k, -(TOP_INSET / 2 + (h - TOP_INSET) * 0.02) * k, w, h);
  else cam.setViewOffset(w, h, 0, -h * 0.03 * k, w, h);
  cam.updateProjectionMatrix();
}

// 지도처럼 누르는 화면이라 마우스를 따라 돌지 않는다 — 누르려는 시설이 움직이지 않게
function Rig({ chips, dive, onArrive, children }: { chips: RefObject<ChipNodes>; dive: Dive | null; onArrive: (k: ProductKey) => void; children: ReactNode }) {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const lastSize = useRef("");
  const flight = useRef<Flight | null>(null);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size, scene, clock }) => {
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
    } else if (key !== lastSize.current) {
      lastSize.current = key;
      // 넓은 화면은 헤더 아래 남는 높이에 지역이 들어가도록 조금 물러선다
      const dist = wide ? 42 * Math.min(1.25, (0.92 * size.height) / Math.max(size.height - TOP_INSET, 1)) : 42 * Math.min(2.0, 1.1 / Math.max(aspect, 0.4));
      cam.position.copy(CAMERA_DIR).multiplyScalar(dist).add(LOOK);
      cam.lookAt(LOOK);
      // 안개는 카메라 거리에 맞춘다 (세로 화면은 멀리서 보므로)
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = dist + 10;
        scene.fog.far = dist + 60;
      }
      setOffset(cam, size.width, size.height, wide, 1);
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
    placeLabels(items, size.width, reveal(sim.current.intro, 0.82, 0.18) * fade);
  });

  return <group ref={group}>{children}</group>;
}

/* ── 장면 ─────────────────────────────────────────────────────────── */

// 땅 → 큰 건물 → 설비 · 공원 → 전선 · 차 순으로 지어진다
function Scene({ shadows, chips, frozen, dive, onArrive }: { shadows: boolean; chips: RefObject<ChipNodes>; frozen: boolean; dive: Dive | null; onArrive: (k: ProductKey) => void }) {
  return (
    <>
      <SimDriver frozen={frozen} />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 52, 100]} />
      <Sky radius={220} />
      <Lighting shadows={shadows} mapSize={2048} bounds={16} reach={30} />
      <Rig chips={chips} dive={dive} onArrive={onArrive}>
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
      </Rig>
    </>
  );
}

export type DistrictProduct = { name: string; place: string };

export default function DistrictScene({
  products,
  active,
  onHover,
  onGo,
  onReady,
  running,
  overlay,
}: {
  products: Record<ProductKey, DistrictProduct>;
  active: ProductKey | null;
  onHover: (k: ProductKey | null) => void;
  onGo: (k: ProductKey) => void;
  onReady?: () => void;
  running: boolean;
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
          <Scene shadows={shadows} chips={chips} frozen={frozen} dive={dive} onArrive={onGo} />
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
    </DistrictContext.Provider>
  );
}
