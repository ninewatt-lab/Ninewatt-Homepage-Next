"use client";

/**
 * Lab v2 3D 장면 — 도면 선이 그려지고, 벽이 솟고, 실을 보고, 그린리모델링을 시공한다.
 * LabTwin 이 화면에 들어올 때 동적으로 불러온다(초기 번들에 넣지 않음).
 * 하늘 · 빛 번짐 · 색 보정은 홈 히어로와 같은 것을 쓴다 (SimContext 에 TwinSim 을 넣는다).
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { useContext, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import Effects from "@/components/district/Effects";
import { Sky } from "@/components/hero/Atmosphere";
import { SimContext, type Sim } from "@/components/hero/heroSim";
import { buildTwin, type TwinModel } from "./twinBuild";
import { BUILD, CENTER, FLOOR_Y, REMODEL, TOP_Y, ease, easeOut, piece, span, stepTwin, type TwinFloor, type TwinMode, type TwinSim } from "./twinModel";

const BG = "#050d13";
const TEAL = new THREE.Color("#49B6CA");

export type TwinRoom = { key: string; floor: TwinFloor; z: number; area: number; review: boolean; label: [number, number]; polygon: [number, number][] };
export type TwinPlanData = { floors: Record<TwinFloor, { z: number; groups: Record<string, number[]> }> };

/* ── 시간 ─────────────────────────────────────────────────────────── */

function Driver({ simRef, frozen, paused }: { simRef: RefObject<TwinSim>; frozen: boolean; paused: boolean }) {
  const date = useMemo(() => new Date(), []);
  useFrame((_, delta) => stepTwin(simRef.current, delta, frozen, paused, date), -1);
  return null;
}

/* ── 빛 ───────────────────────────────────────────────────────────── */

const SUN_HIGH = new THREE.Color("#fff1dc");
const SUN_LOW = new THREE.Color("#ffb06a");
const MOON = new THREE.Color("#a9c2d6");
const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

function stepLights(sun: THREE.DirectionalLight, hemi: THREE.HemisphereLight, sim: TwinSim, scene: THREE.Scene, tmp: THREE.Color) {
  const day = smooth(-0.05, 0.2, sim.sunAlt);
  // 밤에는 달빛이 남서쪽 높은 곳에서
  const dir = day > 0.02 ? sim.sun : MOON_DIR;
  sun.position.copy(CENTER).addScaledVector(dir, 34);
  sun.target.position.copy(CENTER);
  sun.target.updateMatrixWorld();
  sun.intensity = 0.25 + 1.9 * day;
  sun.color.copy(MOON).lerp(tmp.copy(SUN_HIGH).lerp(SUN_LOW, 1 - smooth(0.15, 0.6, sim.sunAlt)), day);
  hemi.intensity = 0.18 + 0.32 * day;
  scene.environmentIntensity = 0.12 + 0.25 * day;
}
const MOON_DIR = new THREE.Vector3(-0.5, 0.8, 0.4).normalize();

function Lights({ shadows }: { shadows: boolean }) {
  const sim = useSimTwin();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame(({ scene }) => sun.current && hemi.current && stepLights(sun.current, hemi.current, sim.current, scene, tmp));
  return (
    <>
      <hemisphereLight ref={hemi} args={["#cfe9f0", "#0b1c25", 0.4]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={5}
        shadow-camera-far={70}
        shadow-bias={-0.0003}
        shadow-normalBias={0.03}
      />
    </>
  );
}

// SimContext 는 Sim 형이라 TwinSim 으로 좁혀 쓴다
const useSimTwin = () => useContext(SimContext) as RefObject<TwinSim>;

/* ── 무대 ─────────────────────────────────────────────────────────── */

function Stage() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(120, 120, TEAL, TEAL);
    const mat = g.material as THREE.LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0.06;
    g.position.set(CENTER.x, -0.06, CENTER.z);
    return g;
  }, []);
  return (
    <group>
      <primitive object={grid} />
      <mesh position={[CENTER.x, -0.2, CENTER.z]} receiveShadow>
        <cylinderGeometry args={[17, 17.4, 0.36, 96]} />
        <meshStandardMaterial color="#142a33" roughness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.015, CENTER.z]}>
        <ringGeometry args={[16.85, 17, 128]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ── 도면 선 ──────────────────────────────────────────────────────── */

const LINE_COLORS: Record<string, string> = { wall: "#8fe3f0", window: "#4fb8cc", detail: "#2f7383", dim: "#8a6f45" };
const GROUP_ORDER = ["wall", "window", "detail", "dim"];

type PlanLayer = { line: THREE.LineSegments; count: number; group: string };

function planLayers(plan: TwinPlanData, floor: TwinFloor): PlanLayer[] {
  const { z, groups } = plan.floors[floor];
  return GROUP_ORDER.filter((g) => groups[g]).map((g) => {
    const flat = groups[g];
    const pos = new Float32Array((flat.length / 2) * 3);
    for (let i = 0, j = 0; i < flat.length; i += 2, j += 3) {
      pos[j] = flat[i];
      pos[j + 1] = z + 0.02;
      pos[j + 2] = -flat[i + 1];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({ color: LINE_COLORS[g], transparent: true, depthWrite: false, toneMapped: false });
    return { line: new THREE.LineSegments(geo, mat), count: flat.length / 2, group: g };
  });
}

/** 그룹 순서대로 펜이 지나가듯 그린다. progress 0~1, opacity 는 층 전체 */
function stepPlan(layers: PlanLayer[], progress: number, opacity: number, wallsOnly: boolean) {
  const total = layers.reduce((a, l) => a + l.count, 0);
  let left = progress * total;
  for (const l of layers) {
    const n = Math.max(0, Math.min(l.count, Math.floor(left)));
    left -= l.count;
    l.line.geometry.setDrawRange(0, n - (n % 2));
    const show = wallsOnly ? (l.group === "wall" || l.group === "window" ? 1 : 0) : 1;
    (l.line.material as THREE.LineBasicMaterial).opacity = opacity * show * (l.group === "detail" || l.group === "dim" ? 0.7 : 1);
    l.line.visible = opacity * show > 0.01 && n > 0;
  }
}

function PlanLines({ plan, simRef, mode, floor }: { plan: TwinPlanData; simRef: RefObject<TwinSim>; mode: TwinMode; floor: TwinFloor }) {
  const f1 = useMemo(() => planLayers(plan, "1f"), [plan]);
  const f2 = useMemo(() => planLayers(plan, "2f"), [plan]);
  // 벽이 솟는 높이에 1층(→ 2층) 벽선을 띄워 자르는 면을 보여 준다
  const ring1 = useMemo(() => ringLine(f1), [f1]);
  const ring2 = useMemo(() => ringLine(f2), [f2]);
  useFrame(() => stepPlanLines(simRef.current, mode, floor, f1, f2, ring1, ring2));
  return (
    <>
      {[...f1, ...f2].map((l, i) => (
        <primitive key={i} object={l.line} />
      ))}
      <primitive object={ring1} />
      <primitive object={ring2} />
    </>
  );
}

function ringLine(layers: PlanLayer[]) {
  const wall = layers.find((l) => l.group === "wall")!;
  const line = new THREE.LineSegments(
    wall.line.geometry.clone(),
    new THREE.LineBasicMaterial({ color: "#c9f6ff", transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }),
  );
  line.visible = false;
  return line;
}

function stepPlanLines(s: TwinSim, mode: TwinMode, floor: TwinFloor, f1: PlanLayer[], f2: PlanLayer[], ring1: THREE.LineSegments, ring2: THREE.LineSegments) {
  const b = s.build;
  const rise = span(b, BUILD.rise);
  const clip = rise * TOP_Y;
  if (mode === "rooms") {
    // 실 보기: 고른 층의 벽 · 창 선만 바닥에
    stepPlan(f1, 1, floor === "1f" ? 0.55 : 0, true);
    stepPlan(f2, 1, floor === "2f" ? 0.55 : 0, true);
  } else {
    // 다 지은 뒤 1층 도면은 대지에 흐리게 남고, 2층 도면은 벽이 그 높이를 지나면 사라진다
    stepPlan(f1, span(b, BUILD.plan1), 1 - span(b, [0.84, 1]) * 0.7, false);
    stepPlan(f2, span(b, BUILD.plan2), 1 - smooth(FLOOR_Y["2f"] - 0.4, FLOOR_Y["2f"] + 0.3, clip), false);
  }
  const rising = mode !== "rooms" && rise > 0 && rise < 1;
  const upper = clip > FLOOR_Y["2f"];
  ring1.visible = rising && !upper;
  ring2.visible = rising && upper;
  ring1.position.y = clip - 0.02;
  ring2.position.y = clip - FLOOR_Y["2f"] - 0.02;
  const fade = Math.min(1, rise * 12, (1 - rise) * 12);
  (ring1.material as THREE.LineBasicMaterial).opacity = fade;
  (ring2.material as THREE.LineBasicMaterial).opacity = fade;
}

/* ── 건물 ─────────────────────────────────────────────────────────── */

const LAMP = new THREE.Color("#ffd9a8");
const GLOW = new THREE.Color("#ffc983");

function stepBuilding(m: TwinModel, s: TwinSim, mode: TwinMode, floor: TwinFloor, before: boolean, thermal: boolean, scanRef: { value: number }, delta: number, frozen: boolean) {
  // 구축: 자르는 면이 올라간다 (다 지으면 치운다)
  const rise = span(s.build, BUILD.rise);
  m.plane.constant = s.build >= 1 ? 100 : rise <= 0 ? -0.01 : ease(rise) * TOP_Y;

  // 층 보기: 실 보기에서는 위층 · 지붕 · 천장을 걷는다
  for (const it of m.items) {
    let show = true;
    if (mode === "rooms") show = floor === "1f" ? it.floor === "1f" && !it.ceiling : it.floor !== "roof" && !(it.floor === "2f" && it.ceiling);
    it.obj.userData.hidden = !show;
  }

  // 리모델링 (전후 비교에서 "전"이면 시공 전 모습)
  const r = before ? 0 : s.remodel;
  const ins = span(r, REMODEL.insulation);
  m.walls.forEach((w, k) => {
    const e = easeOut(piece(ins, k / m.walls.length));
    w.shell.visible = e > 0 && !w.shell.userData.hidden;
    w.shell.position.copy(w.out).multiplyScalar((1 - e) * 1.8);
  });
  const win = span(r, REMODEL.windows);
  m.windows.forEach((w, k) => {
    const p = piece(win, k / m.windows.length);
    // 헌 창이 바깥으로 빠지며 작아지고, 새 창이 바깥에서 들어온다
    const out = easeOut(Math.min(1, p / 0.45));
    const inn = easeOut(Math.max(0, (p - 0.4) / 0.6));
    w.old.visible = out < 1 && !w.old.userData.hidden;
    w.old.position.copy(w.at).addScaledVector(w.out, out * 1.4);
    w.old.scale.setScalar(Math.max(1e-3, 1 - out));
    w.fresh.visible = inn > 0 && !w.fresh.userData.hidden;
    w.fresh.position.copy(w.at).addScaledVector(w.out, (1 - inn) * 1.4);
  });
  if (m.pv) {
    const pv = m.pv;
    const ph = span(r, REMODEL.pv);
    pv.modules.forEach((mod, k) => {
      const e = easeOut(piece(ph, k / pv.modules.length));
      mod.visible = e > 0 && !pv.group.userData.hidden;
      mod.position.copy(pv.base[k]).addScaledVector(pv.normal, (1 - e) * 2.5);
    });
  }
  // 시공 부품(외단열 판 · 창 · 태양광)은 위에서 따로 켠다
  for (const it of m.items) if (!it.obj.userData.special) it.obj.visible = !it.obj.userData.hidden;

  // 열화상: 시공 중에는 시간표대로 아래에서 위로 덮었다가(진단) 끝에 위에서 아래로 걷힌다. 쉬는 동안은 토글을 따른다
  let target: number;
  if (!before && s.remodel > 0 && s.remodel < 1) {
    target = s.remodel < REMODEL.cool[0] ? span(s.remodel, REMODEL.scan) * TOP_Y : (1 - span(s.remodel, REMODEL.cool)) * TOP_Y;
    scanRef.value = target;
  } else {
    target = thermal && mode !== "rooms" ? TOP_Y : -0.5;
    scanRef.value = frozen ? target : scanRef.value + (target - scanRef.value) * (1 - Math.exp(-Math.min(delta, 0.1) * 3));
  }
  m.scan.value = scanRef.value;
  const on = m.scan.value > -0.4;
  for (const o of m.overlays) o.visible = on;

  // 밤: 창 안쪽 불빛 · 실내 조명
  for (const g of m.glass) g.emissive.copy(GLOW).multiplyScalar(s.dark * 0.55);
  m.lamps.color.copy(LAMP).multiplyScalar(0.2 + s.dark * 1.4);
}

function Building({ url, simRef, mode, floor, before, thermal, frozen }: { url: string; simRef: RefObject<TwinSim>; mode: TwinMode; floor: TwinFloor; before: boolean; thermal: boolean; frozen: boolean }) {
  const { scene } = useGLTF(url);
  const invalidate = useThree((s) => s.invalidate);
  const model = useMemo(() => buildTwin(scene), [scene]);
  const scanRef = useRef({ value: -0.5 });
  // 움직임 줄이기(그때만 그리는 모드)에서도 보기를 바꾸면 바로 그린다
  useEffect(() => invalidate(), [mode, floor, before, thermal, invalidate]);
  useFrame((_, delta) => stepBuilding(model, simRef.current, mode, floor, before, thermal, scanRef.current, delta, frozen));
  return <primitive object={model.root} />;
}

/* ── 실 ───────────────────────────────────────────────────────────── */

const ROOM = new THREE.Color("#2C9DB3");
const ROOM_FLAG = new THREE.Color("#d9822b");

function Rooms({ rooms, floor, selected, onSelect }: { rooms: TwinRoom[]; floor: TwinFloor; selected: string | null; onSelect: (key: string | null) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const shapes = useMemo(
    () =>
      rooms.map((r) => {
        const s = new THREE.Shape();
        r.polygon.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
        return { room: r, geometry: new THREE.ShapeGeometry(s) };
      }),
    [rooms],
  );
  return (
    <>
      {shapes
        .filter(({ room }) => room.floor === floor)
        .map(({ room, geometry }) => {
          const on = selected === room.key;
          return (
            <mesh
              key={room.key}
              geometry={geometry}
              rotation-x={-Math.PI / 2}
              position-y={room.z + 0.05}
              renderOrder={3}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHover(room.key);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHover(null);
                document.body.style.cursor = "";
              }}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect(room.key);
              }}
            >
              <meshBasicMaterial
                color={room.review ? ROOM_FLAG : ROOM}
                transparent
                opacity={on ? 0.62 : hover === room.key ? 0.42 : 0.24}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          );
        })}
    </>
  );
}

/* ── 실 이름표 (DOM) ───────────────────────────────────────────────── */

function moveChip(node: HTMLElement | null | undefined, x: number, y: number, show: boolean) {
  if (!node) return;
  node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
  node.style.visibility = show ? "visible" : "hidden";
}

function Labels({ rooms, floor, mode, chipsRef }: { rooms: TwinRoom[]; floor: TwinFloor; mode: TwinMode; chipsRef: RefObject<Record<string, HTMLElement | null>> }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const r of rooms) {
      v.set(r.label[0], r.z + 0.4, -r.label[1]).project(camera);
      moveChip(chipsRef.current[r.key], ((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height, mode === "rooms" && r.floor === floor && v.z < 1);
    }
  });
  return null;
}

/* ── 카메라 ───────────────────────────────────────────────────────── */

type Pose = { pos: THREE.Vector3; target: THREE.Vector3 };
const POSES: Record<string, Pose> = {
  plan: { pos: new THREE.Vector3(4, 29, 15), target: new THREE.Vector3(5.25, 0, -4.4) },
  overview: { pos: new THREE.Vector3(-9.5, 10.5, 16.5), target: new THREE.Vector3(5.25, 2.8, -4.9) },
  rooms1f: { pos: new THREE.Vector3(5.6, 25, 9.5), target: new THREE.Vector3(5.25, 0, -4.4) },
  rooms2f: { pos: new THREE.Vector3(5.6, 28, 9.5), target: new THREE.Vector3(5.25, 3.3, -4.4) },
  remodel: { pos: new THREE.Vector3(23, 10.5, 18), target: new THREE.Vector3(5.25, 3, -4.9) },
};

type Controls = { target: THREE.Vector3; update: () => void; autoRotate: boolean; autoRotateSpeed: number; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void };

function poseKey(mode: TwinMode, floor: TwinFloor, build: number) {
  if (mode === "rooms") return floor === "1f" ? "rooms1f" : "rooms2f";
  if (mode === "remodel") return "remodel";
  return build < BUILD.rise[0] + 0.04 ? "plan" : "overview";
}

function stepCamera(camera: THREE.Camera, controls: Controls, pose: Pose, k: number, narrow: number, tmp: THREE.Vector3) {
  tmp.copy(pose.pos).sub(pose.target).multiplyScalar(narrow).add(pose.target);
  camera.position.lerp(tmp, k);
  controls.target.lerp(pose.target, k);
  controls.update();
  return camera.position.distanceTo(tmp) < 0.05;
}

function CameraRig({ simRef, mode, floor, frozen, offset }: { simRef: RefObject<TwinSim>; mode: TwinMode; floor: TwinFloor; frozen: boolean; offset: number }) {
  const { camera, controls, size, invalidate } = useThree();
  const tween = useRef<string | null>("plan");
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const key = useRef("");

  // 사용자가 끌면 그 자리에 둔다
  useEffect(() => {
    const c = controls as unknown as Controls | null;
    if (!c) return;
    const stop = () => {
      tween.current = null;
    };
    c.addEventListener("start", stop);
    return () => c.removeEventListener("start", stop);
  }, [controls]);

  useEffect(() => invalidate(), [mode, floor, invalidate]);

  useFrame((_, delta) => {
    const c = controls as unknown as Controls | null;
    if (!c) return;
    const k2 = poseKey(mode, floor, simRef.current.build);
    if (k2 !== key.current) {
      key.current = k2;
      tween.current = k2;
    }
    const narrow = size.width / size.height < 1 ? 1.55 : 1;
    if (tween.current) {
      const done = stepCamera(camera, c, POSES[tween.current], frozen ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 1.8), narrow, tmp);
      if (done) tween.current = null;
    }
    finishRig(c, camera as THREE.PerspectiveCamera, !frozen && mode === "build" && simRef.current.build >= 1 && !tween.current, offset * size.width, size.width, size.height);
  });
  return null;
}

/** 다 지은 뒤 천천히 돈다. 넓은 화면은 오른쪽 패널을 비켜 건물을 왼쪽으로 (화면 중심을 옮긴다) */
function finishRig(c: Controls, cam: THREE.PerspectiveCamera, rotate: boolean, ox: number, w: number, h: number) {
  c.autoRotate = rotate;
  c.autoRotateSpeed = 0.35;
  if (cam.view?.offsetX !== ox || cam.view?.fullWidth !== w || cam.view?.fullHeight !== h) {
    cam.setViewOffset(w, h, ox, 0, w, h);
    cam.updateProjectionMatrix();
  }
}

/* ── 캔버스 ───────────────────────────────────────────────────────── */

export default function TwinScene({
  simRef,
  modelUrl,
  plan,
  rooms,
  mode,
  floor,
  selected,
  onSelect,
  before,
  thermal,
  chipsRef,
  active,
  frozen,
  paused,
  onReady,
}: {
  simRef: RefObject<TwinSim>;
  modelUrl: string;
  plan: TwinPlanData;
  rooms: TwinRoom[];
  mode: TwinMode;
  floor: TwinFloor;
  selected: string | null;
  onSelect: (key: string | null) => void;
  before: boolean;
  thermal: boolean;
  chipsRef: RefObject<Record<string, HTMLElement | null>>;
  active: boolean;
  frozen: boolean;
  paused: boolean;
  onReady: () => void;
}) {
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, 1.75));
  const [fx, setFx] = useState(true);
  const [shadows, setShadows] = useState(true);
  const declines = useRef(0);
  const [wide, setWide] = useState(() => window.innerWidth >= 1024);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <SimContext.Provider value={simRef as RefObject<Sim>}>
      <Canvas
        dpr={dpr}
        shadows
        camera={{ position: POSES.plan.pos.toArray(), fov: 34, near: 0.3, far: 400 }}
        frameloop={frozen ? "demand" : active ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance", localClippingEnabled: true } as THREE.WebGLRendererParameters}
        onPointerMissed={() => onSelect(null)}
        onCreated={({ gl, scene }) => {
          gl.localClippingEnabled = true;
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
        <Driver simRef={simRef} frozen={frozen} paused={paused} />
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 45, 110]} />
        <Sky radius={160} />
        <Lights shadows={shadows} />
        <Stage />
        <PlanLines plan={plan} simRef={simRef} mode={mode} floor={floor} />
        <Building url={modelUrl} simRef={simRef} mode={mode} floor={floor} before={before} thermal={thermal} frozen={frozen} />
        {mode === "rooms" && <Rooms rooms={rooms} floor={floor} selected={selected} onSelect={onSelect} />}
        <Labels rooms={rooms} floor={floor} mode={mode} chipsRef={chipsRef} />
        <OrbitControls makeDefault enableDamping enablePan={false} minDistance={9} maxDistance={60} maxPolarAngle={Math.PI / 2 - 0.08} target={POSES.plan.target.toArray()} />
        <CameraRig simRef={simRef} mode={mode} floor={floor} frozen={frozen} offset={wide ? 0.13 : 0} />
        {fx && <Effects glow={0.7} />}
      </Canvas>
    </SimContext.Provider>
  );
}
