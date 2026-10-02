"use client";

/**
 * Lab 3D 뷰어 본체 (three.js). LabModelViewer 가 "3D로 보기"를 누른 뒤에만 동적으로 불러온다.
 *
 * 좌표: 데이터(viewer.json)는 모델 좌표(m, x 동쪽 · y 북쪽 · 높이 z)이고, glb 는 glTF(y 위)로
 * 내보냈으므로 three 좌표는 (x, z, -y) 다. 실 폴리곤·도면 평면은 XY 평면에 만들고 X 축으로
 * -90° 돌려 같은 변환을 맞춘다.
 */

import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type Level = "all" | "noRoof" | "f1";
export type Look = "material" | "line";

export interface ViewerRoom {
  key: string;
  floor: "1f" | "2f";
  z: number;
  area: number;
  review: boolean;
  /** 물량 산출 값 (없을 수 있다). 베란다는 WA 대신 난간 길이 */
  L?: number | null;
  WA?: number | null;
  railing?: number | null;
  label: [number, number];
  polygon: [number, number][];
}

export interface ViewerData {
  model: string;
  rooms: ViewerRoom[];
  overlays: Record<"1f" | "2f", { src: string; bounds: [number, number, number, number]; z: number }>;
}

// 층마다 처음 시점. 층을 걷으면 바닥이 잘 보이도록 더 높은 곳에서 내려다본다
const VIEWS: Record<Level, { position: THREE.Vector3; target: THREE.Vector3 }> = {
  all: { position: new THREE.Vector3(-8.5, 13.5, 12.5), target: new THREE.Vector3(5.25, 2.6, -4.9) },
  noRoof: { position: new THREE.Vector3(-3.5, 20, 9), target: new THREE.Vector3(5.25, 3.3, -4.9) },
  f1: { position: new THREE.Vector3(-2.5, 16.5, 7.5), target: new THREE.Vector3(5.25, 0, -4.9) },
};

const ACCENT = "#2f8a9c";
const FLAG = "#d9822b";

/* ── 건물 ─────────────────────────────────────────────────────────── */

const lineMats = {
  surface: new THREE.MeshBasicMaterial({ color: "#ffffff", polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  glass: new THREE.MeshBasicMaterial({ color: "#dfe7ea", transparent: true, opacity: 0.55, polygonOffset: true, polygonOffsetFactor: 1 }),
  roof: new THREE.MeshBasicMaterial({ color: "#f3c99a", polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  edge: new THREE.LineBasicMaterial({ color: "#1f2933" }),
};

function visibleFor(floor: string, name: string, level: Level) {
  if (floor === "roof") return level === "all";
  if (floor === "2f") {
    if (level === "f1") return false;
    // 지붕을 걷으면 2층 천장도 걷어야 안이 보인다
    return !(level === "noRoof" && name.includes("ContinuousCeiling"));
  }
  return !(level === "f1" && name.includes("ContinuousCeiling"));
}

interface Entry {
  floor: string;
  name: string;
  kind: string;
  original: THREE.Material;
  edges?: THREE.LineSegments;
}

function Building({ url, level, look }: { url: string; level: Level; look: Look }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);

  // 메시마다 층·종류와 원래 재질을 기억해 둔다(키 = mesh.uuid). three 객체는 장면 밖 상태라
  // 렌더 중이 아니라 effect 안에서, model.traverse 로 바꾼다. 선화용 모서리는 처음 선화로 바꿀 때 만든다.
  const entries = useRef(new Map<string, Entry>());

  useLayoutEffect(() => {
    const map = new Map<string, Entry>();
    model.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      const mesh = o as THREE.Mesh;
      // 재질이 둘인 메시(바닥판)는 glTF 에서 그룹 + 하위 메시로 나뉘고 태그는 그룹에 붙는다
      const tagged = mesh.userData?.kind ? mesh : mesh.parent;
      const extras = (tagged?.userData ?? {}) as { floor?: string; kind?: string };
      const original = mesh.material as THREE.Material;
      const kind = extras.kind ?? "wall";
      if (kind === "glass") {
        original.transparent = true;
        original.depthWrite = false;
      } else {
        mesh.castShadow = true;
      }
      mesh.receiveShadow = true;
      map.set(mesh.uuid, { floor: extras.floor ?? "1f", kind, original, name: tagged?.name ?? mesh.name });
    });
    entries.current = map;
  }, [model]);

  useLayoutEffect(() => {
    const map = entries.current;
    model.traverse((o) => {
      const e = map.get(o.uuid);
      if (!e) return;
      const mesh = o as THREE.Mesh;
      mesh.visible = visibleFor(e.floor, e.name, level);
      if (look === "line") {
        // 바닥 줄눈 같은 얇은 판은 모서리가 지저분하므로 선을 생략한다
        if (!e.edges && e.kind !== "joint") {
          e.edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 25), lineMats.edge);
          mesh.add(e.edges);
        }
        mesh.material = e.kind === "glass" ? lineMats.glass : e.kind === "roof" ? lineMats.roof : lineMats.surface;
      } else {
        mesh.material = e.original;
      }
      if (e.edges) e.edges.visible = look === "line";
    });
  }, [model, level, look]);

  return <primitive object={model} />;
}

/* ── 실 (클릭 영역) ───────────────────────────────────────────────── */

function RoomZone({
  room,
  selected,
  onSelect,
}: {
  room: ViewerRoom;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const hover = useRef(false);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    room.polygon.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    return s;
  }, [room.polygon]);
  const color = room.review ? FLAG : ACCENT;
  const base = selected ? 0.42 : 0;

  const paint = () => {
    if (mat.current) mat.current.opacity = selected ? 0.42 : hover.current ? 0.22 : 0;
  };
  useEffect(paint);

  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position-y={room.z + 0.035}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        hover.current = true;
        document.body.style.cursor = "pointer";
        paint();
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = "";
        paint();
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(room.key);
      }}
    >
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={base} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── 도면 평면 겹쳐 보기 ───────────────────────────────────────────── */

function PlanOverlay({ base, overlay }: { base: string; overlay: ViewerData["overlays"]["1f"] }) {
  const texture = useTexture(base + overlay.src, (t) => {
    (Array.isArray(t) ? t : [t]).forEach((x) => (x.colorSpace = THREE.SRGBColorSpace));
  });
  const [x0, y0, x1, y1] = overlay.bounds;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[(x0 + x1) / 2, overlay.z + 0.03, -(y0 + y1) / 2]} renderOrder={2}>
      <planeGeometry args={[x1 - x0, y1 - y0]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ── 카메라 되돌리기 ───────────────────────────────────────────────── */

function CameraRig({ resetKey, level }: { resetKey: number; level: Level }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    const view = VIEWS[level];
    camera.position.copy(view.position);
    // three-stdlib 은 직접 의존성이 아니라서 필요한 부분만 타입으로 적는다
    const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (c) {
      c.target.copy(view.target);
      c.update();
    } else {
      camera.lookAt(view.target);
    }
  }, [resetKey, level, camera, controls]);
  return null;
}

/* ── 캔버스 ───────────────────────────────────────────────────────── */

export default function LabModelCanvas({
  base,
  data,
  level,
  look,
  plan,
  selected,
  onSelect,
  resetKey,
}: {
  /** viewer.json 이 있는 폴더 URL (끝에 /) */
  base: string;
  data: ViewerData;
  level: Level;
  look: Look;
  plan: boolean;
  selected: string | null;
  onSelect: (key: string | null) => void;
  resetKey: number;
}) {
  // 실은 내부가 보이는 층에서만 누를 수 있다
  const activeFloor = level === "f1" ? "1f" : level === "noRoof" ? "2f" : null;
  const rooms = data.rooms.filter((r) => r.floor === activeFloor);
  const overlayFloor = level === "f1" ? "1f" : "2f";

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: VIEWS.all.position.toArray(), fov: 35, near: 0.1, far: 300 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={[look === "line" ? "#ffffff" : "#eef1f2"]} />
      <hemisphereLight args={["#ffffff", "#bfb8ac", 1.25]} />
      <directionalLight
        position={[-14, 22, 12]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
      />
      <Suspense fallback={null}>
        <Building url={base + data.model} level={level} look={look} />
        {plan && <PlanOverlay base={base} overlay={data.overlays[overlayFloor]} />}
      </Suspense>
      {rooms.map((r) => (
        <RoomZone key={r.key} room={r} selected={selected === r.key} onSelect={onSelect} />
      ))}
      {look === "material" && (
        <ContactShadows position={[5, -0.2, -5]} scale={34} blur={2.4} opacity={0.35} far={10} />
      )}
      <OrbitControls
        makeDefault
        target={VIEWS.all.target.toArray()}
        enableDamping
        minDistance={6}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
      <CameraRig resetKey={resetKey} level={level} />
    </Canvas>
  );
}
