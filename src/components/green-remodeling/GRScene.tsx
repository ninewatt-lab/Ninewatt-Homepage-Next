"use client";

/**
 * 그린리모델링 솔루션 페이지 3D — 리모델링 종류별 예시 건물 4채가 있는 작은 지역.
 * 하늘 · 빛 · 빛 번짐 · 주변 도시는 홈 히어로와 같은 것을 쓴다 (GrSim 이 같은 이름의 값을 가진다).
 * 건물(또는 이름표)을 누르면 카메라가 다가가 시공을 시작한다. GRSection 이 동적으로 불러온다(초기 번들에 넣지 않음).
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Effects from "@/components/district/Effects";
import { Lighting, Sky } from "@/components/hero/Atmosphere";
import { SimContext, type Sim } from "@/components/hero/heroSim";
import Envelope from "./Envelope";
import GRDistrict, { PEAK_ESS, SHARED_ESS } from "./GRDistrict";
import { GlossTicker } from "./gloss";
import Operations from "./Operations";
import RoofBuilding from "./RoofBuilding";
import Systems from "./Systems";
import { GR_ORDER, GR_SPECS, GrSimContext, ease, isBuilding, specHeight, stepGrSim, useGrSim, type FacilityKey, type Focus, type GrKey, type GrSim } from "./grModel";

const BG = "#050d13";

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

/* ── 건물 고르기 ──────────────────────────────────────────────────── */

function setCursor(v: string) {
  document.body.style.cursor = v;
}

/** 누를 수 있는 상자 (건물 몸체 · ESS 패드를 덮는다) */
function pickBox(k: Focus): [number, number, number, number, number, number] {
  if (isBuilding(k)) {
    const s = GR_SPECS[k];
    const h = specHeight(s);
    return [s.x, h / 2, s.z, s.w + 0.1, h + 0.25, s.d + 0.1];
  }
  const p = k === "sharedEss" ? SHARED_ESS : PEAK_ESS;
  return [p.x, 0.3, p.z, p.w, 0.6, p.d];
}

/** 보이지 않는 상자 — 누르면 그 건물 · 설비로 간다 */
function Picker({ k, onSelect }: { k: Focus; onSelect: (k: Focus) => void }) {
  const [x, y, z, w, h, d] = pickBox(k);
  return (
    <mesh
      position={[x, y, z]}
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
      <boxGeometry args={[w, h, d]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

/* ── 카메라 ───────────────────────────────────────────────────────── */

const OVERVIEW = { target: new THREE.Vector3(0.3, 0.6, 0.4), dir: new THREE.Vector3(0.45, 0.72, 0.85).normalize(), dist: 41 };
// 남 · 동 면이 보이게 남동쪽에서. 지붕 건물은 지붕이 보이게 더 위에서
const FOCUS_DIR: Record<Focus, THREE.Vector3> = {
  envelope: new THREE.Vector3(0.75, 0.38, 0.95).normalize(),
  systems: new THREE.Vector3(0.7, 0.7, 0.9).normalize(),
  roof: new THREE.Vector3(0.55, 1.1, 0.9).normalize(),
  operations: new THREE.Vector3(0.8, 0.42, 0.9).normalize(),
  // ESS: 설비 · 이어진 건물이 함께 보이게 조금 위에서
  peakEss: new THREE.Vector3(0.75, 0.62, 0.95).normalize(),
  sharedEss: new THREE.Vector3(0.45, 0.85, 0.95).normalize(),
};
const FOCUS_DIST: Record<Focus, number> = { envelope: 8, systems: 11, roof: 12, operations: 11.5, peakEss: 8.5, sharedEss: 9 };

// 주민센터는 옆 주차장 카포트 태양광까지 함께 보이게 바라볼 점을 동쪽으로 옮긴다
const FOCUS_SHIFT: Partial<Record<GrKey, number>> = { systems: 2.4 };

// ESS 를 볼 때 바라볼 점: 피크저감은 빌딩 쪽으로, 공유형은 주민센터 쪽으로 조금 (흐름이 이어지는 건물이 같이 보이게)
const FACILITY_TARGET: Record<FacilityKey, THREE.Vector3> = {
  peakEss: new THREE.Vector3(PEAK_ESS.x - 0.6, 0.6, PEAK_ESS.z),
  sharedEss: new THREE.Vector3(SHARED_ESS.x + 0.2, 0.3, SHARED_ESS.z - 1.4),
};

function focusTarget(k: Focus) {
  if (!isBuilding(k)) return FACILITY_TARGET[k];
  const s = GR_SPECS[k];
  return new THREE.Vector3(s.x + (FOCUS_SHIFT[k] ?? 0), specHeight(s) * (k === "roof" ? 0.6 : 0.45), s.z);
}

function Rig({ focus, frozen }: { focus: Focus | null; frozen: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const progress = useRef(0);
  const last = useRef<Focus | null>(null);
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
    // 세로 화면은 지역 너비(26)가 다 들어오도록 멀리서 (Product 지역과 같은 방식)
    const distO = OVERVIEW.dist * (wide ? 1 : Math.min(1.8, 0.82 / Math.max(size.width / size.height, 0.4)));
    tmp.dir.copy(OVERVIEW.dir).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw);
    tmp.a.copy(tmp.dir).multiplyScalar(distO).add(OVERVIEW.target);
    tmp.look.copy(OVERVIEW.target);
    if (last.current && f > 0) {
      const target = focusTarget(last.current);
      tmp.dir.copy(FOCUS_DIR[last.current]).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yaw * 0.4);
      tmp.b.copy(tmp.dir).multiplyScalar(FOCUS_DIST[last.current] * (wide ? 1 : 1.95)).add(target);
      tmp.a.lerp(tmp.b, f);
      tmp.look.lerp(target, f);
    }
    cam.position.copy(tmp.a);
    cam.lookAt(tmp.look);

    // 화면 배치: 넓은 화면은 개요에서 왼쪽 제목을 비키고, 확대 때는 오른쪽 패널을 비킨다. 세로 화면은 아래 패널 위로
    const ox = (wide ? -0.21 + 0.39 * f : 0) * size.width;
    const oy = (wide ? 0 : 0.13 + 0.07 * f) * size.height;
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

export type ChipNodes = Partial<Record<Focus, HTMLElement | null>>;

/** ESS 이름표 자리 (설비 위) */
const FACILITY_ANCHORS: Record<FacilityKey, [number, number, number]> = {
  sharedEss: [SHARED_ESS.x + 0.5, 0.75, SHARED_ESS.z],
  peakEss: [PEAK_ESS.x, 0.75, PEAK_ESS.z],
};

function placeChips(chips: ChipNodes, camera: THREE.Camera, size: { width: number; height: number }, v: THREE.Vector3) {
  const anchors: [Focus, number, number, number][] = [
    ...GR_ORDER.map((k): [GrKey, number, number, number] => [k, GR_SPECS[k].x, specHeight(GR_SPECS[k]) + 0.35, GR_SPECS[k].z]),
    ...(Object.entries(FACILITY_ANCHORS) as [FacilityKey, [number, number, number]][]).map(([k, p]): [FacilityKey, number, number, number] => [k, ...p]),
  ];
  for (const [k, ax, ay, az] of anchors) {
    const el = chips[k];
    if (!el) continue;
    v.set(ax, ay, az).project(camera);
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
  focus: Focus | null;
  onSelect: (k: Focus | null) => void;
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
          camera={{ fov: 30, near: 0.5, far: 320, position: [16, 26, 30] }}
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
          <fog attach="fog" args={[BG, 48, 92]} />
          <Sky radius={220} />
          <Lighting shadows={shadows} mapSize={2048} bounds={16} reach={30} />
          <GRDistrict />
          <GlossTicker />
          <Envelope />
          <Systems />
          <RoofBuilding />
          <Operations />
          {GR_ORDER.map((k) => (
            <Picker key={k} k={k} onSelect={onSelect} />
          ))}
          {(["sharedEss", "peakEss"] as const).map((k) => (
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
