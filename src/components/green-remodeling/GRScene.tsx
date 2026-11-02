"use client";

/**
 * 그린리모델링 솔루션 페이지 3D — 리모델링 종류별 예시 건물 4채가 있는 작은 지역.
 * 하늘 · 빛 · 빛 번짐 · 주변 도시는 홈 히어로와 같은 것을 쓴다 (GrSim 이 같은 이름의 값을 가진다).
 * 건물(또는 이름표)을 누르면 카메라가 다가가 시공을 시작한다. GRSection 이 동적으로 불러온다(초기 번들에 넣지 않음).
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Effects from "@/components/district/Effects";
import { createSwayMaterial, tickSway } from "@/components/district/Life";
import { Lighting, Sky } from "@/components/hero/Atmosphere";
import HeroCity from "@/components/hero/HeroCity";
import { SimContext, type Sim } from "@/components/hero/heroSim";
import { useModelGeometry } from "@/components/hero/models";
import { pavingTexture } from "@/components/hero/textures";
import Envelope from "./Envelope";
import Operations from "./Operations";
import RoofBuilding from "./RoofBuilding";
import Systems from "./Systems";
import { GR_ORDER, GR_SPECS, GrSimContext, PLATE, ease, specHeight, stepGrSim, useGrSim, type GrKey, type GrSim } from "./grModel";

const BG = "#050d13";
const SITE_TOP = 0.012;

/* ── 시간 ─────────────────────────────────────────────────────────── */

function Driver({ frozen }: { frozen: boolean }) {
  const sim = useGrSim();
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, delta) => stepGrSim(sim.current, delta, frozen), -1);
  // 움직임 줄이기(그때만 그리는 모드): 시공이 끝난 모습으로 바뀌면 다시 그린다
  useEffect(() => {
    if (!frozen) return;
    let last = "";
    const id = window.setInterval(() => {
      const key = JSON.stringify(sim.current.progress) + sim.current.running;
      if (key !== last) {
        last = key;
        invalidate();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [frozen, sim, invalidate]);
  return null;
}

/* ── 대지 ─────────────────────────────────────────────────────────── */

// 대지 가장자리 · 건물 사이 길가 나무 (x, z, 크기)
const TREES: [number, number, number][] = [
  [-3.9, 0.15, 1],
  [-3.2, 0.2, 0.85],
  [-0.4, 3.7, 0.9],
  [0.4, 3.9, 1.05],
  [0.35, -0.2, 0.8],
  [-0.4, 0.3, 0.95],
  [3.9, 0.1, 0.9],
  [3.95, -3.8, 0.85],
  [-3.9, -3.8, 1.1],
  [0.3, -3.9, 0.9],
  [-0.35, 1.6, 0.8],
  [0.4, -1.6, 0.85],
];

function Trees() {
  const a = useModelGeometry("TreeA");
  const b = useModelGeometry("TreeB");
  const material = useMemo(() => createSwayMaterial(), []);
  useFrame(({ clock }) => tickSway(material, clock.elapsedTime));
  return (
    <>
      {TREES.map(([x, z, k], i) => (
        <mesh key={i} geometry={i % 3 === 1 ? b : a} material={material} position={[x, SITE_TOP, z]} scale={0.17 * k} rotation={[0, i * 1.3, 0]} castShadow receiveShadow />
      ))}
    </>
  );
}

function Site() {
  const paving = useMemo(() => pavingTexture([PLATE.w / 0.3, PLATE.d / 0.3]), []);
  return (
    <>
      <mesh position={[0, SITE_TOP / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[PLATE.w, SITE_TOP + 0.08, PLATE.d]} />
        <meshStandardMaterial map={paving} color="#9aa6aa" roughness={0.92} />
      </mesh>
      {/* 건물 사이 십자 보행로 (조금 밝은 띠) */}
      {[
        [0, 0, 0.7, PLATE.d],
        [0, 0, PLATE.w, 0.7],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, SITE_TOP + 0.001, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial color="#6a7a80" roughness={0.9} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}
      <Suspense fallback={null}>
        <Trees />
      </Suspense>
    </>
  );
}

/* ── 건물 고르기 ──────────────────────────────────────────────────── */

function setCursor(v: string) {
  document.body.style.cursor = v;
}

/** 건물 몸체를 덮는 보이지 않는 상자 — 누르면 그 건물로 간다 */
function Picker({ k, onSelect }: { k: GrKey; onSelect: (k: GrKey) => void }) {
  const s = GR_SPECS[k];
  const h = specHeight(s);
  return (
    <mesh
      position={[s.x, h / 2, s.z]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 6) return;
        e.stopPropagation();
        onSelect(k);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setCursor("pointer");
      }}
      onPointerOut={() => setCursor("")}
    >
      <boxGeometry args={[s.w + 0.1, h + 0.25, s.d + 0.1]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

/* ── 카메라 ───────────────────────────────────────────────────────── */

const OVERVIEW = { target: new THREE.Vector3(0.2, 0.5, 0.2), dir: new THREE.Vector3(0.62, 0.66, 0.82).normalize(), dist: 19.5 };
// 남 · 동 면이 보이게 남동쪽에서. 지붕 건물은 지붕이 보이게 더 위에서
const FOCUS_DIR: Record<GrKey, THREE.Vector3> = {
  envelope: new THREE.Vector3(0.75, 0.38, 0.95).normalize(),
  systems: new THREE.Vector3(0.7, 0.7, 0.9).normalize(),
  roof: new THREE.Vector3(0.55, 1.1, 0.9).normalize(),
  operations: new THREE.Vector3(0.8, 0.42, 0.9).normalize(),
};
const FOCUS_DIST: Record<GrKey, number> = { envelope: 7, systems: 7.4, roof: 8.6, operations: 10.5 };

function focusTarget(k: GrKey) {
  const s = GR_SPECS[k];
  return new THREE.Vector3(s.x, specHeight(s) * (k === "roof" ? 0.6 : 0.45), s.z);
}

function Rig({ focus, frozen }: { focus: GrKey | null; frozen: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const progress = useRef(0);
  const last = useRef<GrKey | null>(null);
  const pointer = useRef({ x: 0, sx: 0 });
  const lastOffset = useRef("");
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useEffect(() => invalidate(), [focus, invalidate]);
  useEffect(() => {
    if (frozen) return;
    const onMove = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-gr-ui]")) return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [frozen]);

  useFrame(({ camera, size }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const d = Math.min(delta, 0.1);
    const wide = size.width / size.height >= 1.05;
    // 확대 대상이 바뀌면 지금 자리에서 새 자리로 (개요를 거치지 않고)
    if (focus && last.current && focus !== last.current && progress.current > 0.5) progress.current = 0.5;
    if (focus) last.current = focus;
    const want = focus ? 1 : 0;
    const k = 1 - Math.exp(-d * 2.6);
    progress.current = frozen || Math.abs(want - progress.current) < 0.002 ? want : progress.current + (want - progress.current) * k;
    const f = ease(progress.current);

    const p = pointer.current;
    p.sx += (p.x - p.sx) * (1 - Math.exp(-d * 2));
    const t = frozen ? 0 : performance.now() / 1000;
    // 개요: 천천히 좌우로 흔들리고 마우스를 조금 따른다
    const yaw = Math.sin(t * 0.09) * 0.12 + p.sx * 0.12;
    const distO = OVERVIEW.dist * (wide ? 1 : 1.55);
    tmp.dir.copy(OVERVIEW.dir).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw);
    tmp.a.copy(tmp.dir).multiplyScalar(distO).add(OVERVIEW.target);
    tmp.look.copy(OVERVIEW.target);
    if (last.current && f > 0) {
      const target = focusTarget(last.current);
      tmp.dir.copy(FOCUS_DIR[last.current]).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw * 0.4);
      tmp.b.copy(tmp.dir).multiplyScalar(FOCUS_DIST[last.current] * (wide ? 1 : 1.5)).add(target);
      tmp.a.lerp(tmp.b, f);
      tmp.look.lerp(target, f);
    }
    cam.position.copy(tmp.a);
    cam.lookAt(tmp.look);

    // 화면 배치: 넓은 화면은 개요에서 왼쪽 제목을 비키고, 확대 때는 오른쪽 패널을 비킨다. 세로 화면은 아래 패널 위로
    const ox = (wide ? -0.18 + 0.36 * f : 0) * size.width;
    const oy = (wide ? 0 : 0.22 - 0.02 * f) * size.height;
    const key = `${size.width}x${size.height}:${ox.toFixed(1)}:${oy.toFixed(1)}`;
    if (key !== lastOffset.current) {
      lastOffset.current = key;
      cam.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

/* ── 이름표 (화면 좌표로 옮긴다) ─────────────────────────────────── */

export type ChipNodes = Partial<Record<GrKey, HTMLElement | null>>;

function placeChips(chips: ChipNodes, camera: THREE.Camera, size: { width: number; height: number }, v: THREE.Vector3) {
  for (const k of GR_ORDER) {
    const el = chips[k];
    if (!el) continue;
    const s = GR_SPECS[k];
    v.set(s.x, specHeight(s) + 0.35, s.z).project(camera);
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    // 헤더 · 탭 아래로 들어가는 이름표는 감춘다
    el.style.visibility = v.z < 1 && y > 130 ? "visible" : "hidden";
  }
}

function ChipProjector({ chips }: { chips: RefObject<ChipNodes> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => placeChips(chips.current ?? {}, camera, size, v));
  return null;
}

/* ── 캔버스 ───────────────────────────────────────────────────────── */

export default function GRScene({
  simRef,
  focus,
  onSelect,
  chips,
  active,
  frozen,
  onReady,
  overlay,
}: {
  simRef: RefObject<GrSim>;
  focus: GrKey | null;
  onSelect: (k: GrKey | null) => void;
  chips: RefObject<ChipNodes>;
  active: boolean;
  frozen: boolean;
  onReady: () => void;
  overlay?: ReactNode;
}) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  const [fx, setFx] = useState(true);
  const [shadows, setShadows] = useState(true);
  const declines = useRef(0);

  return (
    <GrSimContext.Provider value={simRef}>
      <SimContext.Provider value={simRef as unknown as RefObject<Sim>}>
        <Canvas
          dpr={dpr}
          shadows
          camera={{ fov: 32, near: 0.3, far: 220, position: [9, 9, 12] }}
          frameloop={frozen ? "demand" : active ? "always" : "never"}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onPointerMissed={() => onSelect(null)}
          onCreated={({ gl, scene }) => {
            const pmrem = new THREE.PMREMGenerator(gl);
            scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
            pmrem.dispose();
            onReady();
          }}
        >
          <PerformanceMonitor
            onDecline={() => {
              declines.current += 1;
              if (declines.current === 1) setFx(false);
              else {
                setDpr(1);
                setShadows(false);
              }
            }}
          />
          <Driver frozen={frozen} />
          <color attach="background" args={[BG]} />
          <fog attach="fog" args={[BG, 22, 48]} />
          <Sky />
          <Lighting shadows={shadows} mapSize={2048} bounds={7} reach={14} />
          <HeroCity />
          <Site />
          <Envelope />
          <Systems />
          <RoofBuilding />
          <Operations />
          {GR_ORDER.map((k) => (
            <Picker key={k} k={k} onSelect={onSelect} />
          ))}
          <Rig focus={focus} frozen={frozen} />
          <ChipProjector chips={chips} />
          {fx && <Effects glow={0.6} />}
        </Canvas>
        {overlay}
      </SimContext.Provider>
    </GrSimContext.Provider>
  );
}
