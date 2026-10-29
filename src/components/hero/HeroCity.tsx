"use client";

/**
 * 홈 히어로 무대 밖 풍경 — 둥근 무대를 길 넷이 감싸고, 그 밖으로 낮은 도시가 안개 속으로 사라진다.
 * Product 지역의 도시 부품(건물 셰이더 창 · 나무 · 차 모델)을 그대로 쓴다.
 * 왼쪽 제목 · 카메라 쪽은 아주 낮게, 건물 뒤쪽만 높게 — 건물과 글자를 가리지 않는다.
 * 밤에는 창 · 가로등 · 차의 전조등 · 미등이 점처럼 빛난다. 등장 연출 때 땅에서 솟아오른다.
 */

import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import CarFleet, { type CarPose } from "@/components/district/CarFleet";
import { Buildings, GROUND_Y, Trees, tint, type Box, type Tree } from "@/components/district/CityContext";
import { poolTexture } from "@/components/district/common";
import { reveal, seeded, useSim } from "./heroSim";

/** 히어로 바닥(무대 아래)과 도시 부품 바닥(GROUND_Y)의 차이 — 그룹째 내린다 */
const FLOOR_Y = -0.082;
const EXTENT = 40;
/** 무대(반지름 3.4)를 감싸는 길 */
const RING = 4.6;

type Road = { axis: "x" | "z"; at: number; w: number };

function heroRoads(): Road[] {
  const rand = seeded(91);
  const roads: Road[] = [];
  for (const axis of ["x", "z"] as const) {
    roads.push({ axis, at: -RING, w: 1.0 }, { axis, at: RING, w: 1.0 });
    for (let v = RING + 8 + rand() * 4; v < EXTENT - 2; v += 7.5 + rand() * 5) roads.push({ axis, at: v, w: rand() < 0.3 ? 1.2 : 0.85 });
    for (let v = -RING - 8 - rand() * 4; v > -EXTENT + 2; v -= 7.5 + rand() * 5) roads.push({ axis, at: v, w: rand() < 0.3 ? 1.2 : 0.85 });
  }
  return roads;
}

/** 카메라 쪽(+) · 화면 왼쪽(제목 쪽, +) */
const toward = (x: number, z: number) => x * 0.676 + z * 0.737;
const leftward = (x: number, z: number) => -x * 0.737 + z * 0.676;

/* ── 블록 · 건물 · 나무 ───────────────────────────────────────────── */

function heroLots(roads: Road[]) {
  const rand = seeded(23);
  const boxes: Box[] = [];
  const roofs: Box[] = [];
  const trees: Tree[] = [];
  const xs = [-EXTENT, ...roads.filter((r) => r.axis === "z").map((r) => r.at), EXTENT].sort((a, b) => a - b);
  const zs = [-EXTENT, ...roads.filter((r) => r.axis === "x").map((r) => r.at), EXTENT].sort((a, b) => a - b);
  const half = (v: number, axis: Road["axis"]) => (roads.find((r) => r.axis === axis && r.at === v)?.w ?? 0) / 2 + 0.4;
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < zs.length - 1; j++) {
      const x0 = xs[i] + half(xs[i], "z");
      const x1 = xs[i + 1] - half(xs[i + 1], "z");
      const z0 = zs[j] + half(zs[j], "x");
      const z1 = zs[j + 1] - half(zs[j + 1], "x");
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      if (x1 - x0 < 1.2 || z1 - z0 < 1.2) continue;
      if (Math.abs(cx) < RING && Math.abs(cz) < RING) continue; // 무대 블록
      // 블록 몇 개는 공원 (나무만)
      if (rand() < 0.1) {
        for (let k = 0; k < (x1 - x0) * (z1 - z0) * 0.3; k++) trees.push({ x: x0 + 0.3 + rand() * (x1 - x0 - 0.6), z: z0 + 0.3 + rand() * (z1 - z0 - 0.6), r: 0.13 + rand() * 0.14, shade: rand(), pine: rand() < 0.3 });
        continue;
      }
      // 긴 쪽으로 필지를 나눈다 (한두 줄)
      const long = x1 - x0 >= z1 - z0;
      const [l0, l1, s0, s1] = long ? [x0, x1, z0, z1] : [z0, z1, x0, x1];
      const rows = s1 - s0 > 4.5 ? 2 : 1;
      for (let r = 0; r < rows; r++) {
        const r0 = s0 + ((s1 - s0) / rows) * r;
        const r1 = r0 + (s1 - s0) / rows;
        let a = l0;
        while (l1 - a > 1) {
          const len = Math.min(l1 - a, 1.4 + rand() * 3);
          const b = l1 - (a + len) < 1.2 ? l1 : a + len;
          const gap = 0.08 + rand() * 0.2;
          const ws = (r1 - r0) * (0.5 + rand() * 0.4);
          const cs = (r0 + r1) / 2 + (rand() - 0.5) * (r1 - r0 - ws) * 0.6;
          const [x, z, w, d] = long ? [(a + b) / 2, cs, b - a - gap * 2, ws] : [cs, (a + b) / 2, ws, b - a - gap * 2];
          a = b;
          if (rand() < 0.08) continue;
          const f = toward(x, z);
          const left = leftward(x, z);
          const dist = Math.hypot(x, z);
          let h: number;
          // 카메라 쪽 · 화면 왼쪽(제목 뒤)은 아주 낮게 — 높은 건물은 건물 오른쪽 뒤에만
          if (f > 2 || left > 1) h = 0.1 + rand() * (left > 6 ? 0.18 : 0.35);
          else {
            const back = Math.min(1, Math.max(0, (-f + 2) / 22));
            h = 0.4 + rand() * (0.9 + back * 2.2);
            if (dist > 14 && rand() < 0.12 + back * 0.2) h += 1.5 + rand() * (2 + back * 4);
          }
          const color = tint(rand, h > 3).multiplyScalar(0.92);
          boxes.push({ x, z, w, d, h, color });
          if (rand() < 0.4) {
            const rw = Math.min(w * 0.4, 0.15 + rand() * 0.3);
            const rd = Math.min(d * 0.4, 0.15 + rand() * 0.25);
            roofs.push({ x: x + (rand() - 0.5) * (w - rw) * 0.8, z: z + (rand() - 0.5) * (d - rd) * 0.8, w: rw, d: rd, h: h + 0.05 + rand() * 0.1, color });
          }
        }
      }
    }
  }
  // 무대를 감싸는 길의 가로수 (안쪽 · 무대 쪽 보도)
  for (const r of roads.filter((o) => Math.abs(o.at) === RING)) {
    for (let t = -RING + 0.8; t < RING - 0.6; t += 1.1) {
      const off = r.at + Math.sign(r.at) * (r.w / 2 + 0.4);
      const [x, z] = r.axis === "x" ? [t, off] : [off, t];
      if (Math.hypot(x, z) < 3.7) continue;
      trees.push({ x, z, r: 0.11 + rand() * 0.04, shade: rand(), pine: false });
    }
  }
  return { boxes, roofs, trees };
}

/* ── 바닥 · 길 (캔버스 한 장) ─────────────────────────────────────── */

function groundTexture(roads: Road[]) {
  const size = 2048;
  const s = size / (EXTENT * 2);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const p = (v: number) => (v + EXTENT) * s;
  g.fillStyle = "#121c21";
  g.fillRect(0, 0, size, size);
  const band = (r: Road, half: number, color: string) => {
    g.fillStyle = color;
    if (r.axis === "x") g.fillRect(0, p(r.at - half), size, half * 2 * s);
    else g.fillRect(p(r.at - half), 0, half * 2 * s, size);
  };
  for (const r of roads) band(r, r.w / 2 + 0.3, "#1a252b");
  for (const r of roads) band(r, r.w / 2, "#0d1418");
  for (const r of roads) {
    for (const e of [-1, 1]) band({ ...r, at: r.at + e * (r.w / 2 - 0.06) }, 0.012, "rgba(220,230,235,0.2)");
    // 가운데 흰 점선
    g.fillStyle = "rgba(220,230,235,0.22)";
    for (let t = 0; t < size; t += 0.9 * s) {
      if (r.axis === "x") g.fillRect(t, p(r.at) - 0.5, 0.45 * s, 1);
      else g.fillRect(p(r.at) - 0.5, t, 1, 0.45 * s);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ── 가로등 (밤에 점과 빛 웅덩이, 무대 가까이만) ───────────────────── */

const LAMP = new THREE.Color("#ffd29a");

function lampSpots(roads: Road[]) {
  const spots: [number, number][] = [];
  for (const r of roads) {
    if (Math.abs(r.at) > 26) continue;
    for (let t = -26; t < 26; t += 3.4) {
      for (const side of [-1, 1]) {
        const off = r.at + side * (r.w / 2 + 0.25);
        const tt = t + (side > 0 ? 1.7 : 0);
        const [x, z] = r.axis === "x" ? [tt, off] : [off, tt];
        if (Math.abs(x) < RING - 0.3 && Math.abs(z) < RING - 0.3) continue;
        if (roads.some((o) => o.axis !== r.axis && Math.abs(tt - o.at) < o.w / 2 + 0.4)) continue;
        spots.push([x, z]);
      }
    }
  }
  return spots;
}

function tickLamps(heads: THREE.MeshBasicMaterial, pools: THREE.MeshBasicMaterial, dark: number) {
  const on = THREE.MathUtils.smoothstep(dark, 0.3, 0.55);
  heads.color.copy(LAMP).multiplyScalar(0.1 + on * 1.4);
  pools.color.copy(LAMP).multiplyScalar(on * 0.28);
}

function Lamps({ spots }: { spots: [number, number][] }) {
  const sim = useSim();
  const pool = useMemo(() => poolTexture(), []);
  const heads = useMemo(() => new THREE.MeshBasicMaterial({ color: LAMP.clone(), toneMapped: false }), []);
  const pools = useMemo(
    () => new THREE.MeshBasicMaterial({ map: pool, color: LAMP.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [pool],
  );
  useFrame(() => tickLamps(heads, pools, sim.current.dark));
  const init = (mesh: THREE.InstancedMesh | null, y: number, sc: number, flat: boolean) => {
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const rot = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    spots.forEach(([x, z], i) => {
      m.makeScale(sc, sc, sc);
      if (flat) m.premultiply(rot);
      mesh.setMatrixAt(i, m.setPosition(x, y, z));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return (
    <>
      <instancedMesh ref={(m) => init(m, GROUND_Y + 0.6, 1, false)} args={[undefined, heads, spots.length]}>
        <boxGeometry args={[0.06, 0.025, 0.06]} />
      </instancedMesh>
      <instancedMesh ref={(m) => init(m, GROUND_Y + 0.015, 0.75, true)} args={[undefined, pools, spots.length]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
}

/* ── 차 ───────────────────────────────────────────────────────────── */

type Car = { road: Road; dir: 1 | -1; offset: number; speed: number };

function heroCars(roads: Road[]): Car[] {
  const rand = seeded(7);
  const cars: Car[] = [];
  for (const road of roads) {
    // 무대를 감싸는 길은 조금 더 붐빈다
    const busy = Math.abs(road.at) === RING ? 1.4 : 0.8;
    for (const dir of [1, -1] as const) {
      const n = Math.round(((EXTENT * 2) / 13) * busy * (0.7 + rand() * 0.6));
      for (let k = 0; k < n; k++) cars.push({ road, dir, offset: rand(), speed: 0.8 + rand() * 0.5 });
    }
  }
  return cars;
}

function carPose(car: Car, t: number, out: CarPose) {
  const span = EXTENT * 2;
  let u = ((t * car.speed) / span + car.offset) % 1;
  if (car.dir < 0) u = 1 - u;
  const v = -EXTENT + u * span;
  const lane = car.road.at + car.dir * 0.2;
  if (car.road.axis === "x") {
    out.x = v;
    out.z = lane;
    out.fx = car.dir;
    out.fz = 0;
  } else {
    out.x = lane;
    out.z = v;
    out.fx = 0;
    out.fz = car.dir;
  }
  out.y = GROUND_Y;
}

function Traffic({ cars }: { cars: Car[] }) {
  const pose = useCallback((i: number, t: number, out: CarPose) => carPose(cars[i], t, out), [cars]);
  return <CarFleet count={cars.length} seed={3} pose={pose} />;
}

/* ── 전체 ─────────────────────────────────────────────────────────── */

function tickRise(group: THREE.Group, intro: number) {
  // 도면이 그려지는 동안 땅에서 솟아오른다
  const r = reveal(intro, 0.05, 0.3);
  group.visible = r > 0.001;
  group.scale.set(1, Math.max(r, 0.001), 1);
}

export default function HeroCity() {
  const sim = useSim();
  const rise = useRef<THREE.Group>(null);
  const city = useMemo(() => {
    const roads = heroRoads();
    return { roads, lots: heroLots(roads), ground: groundTexture(roads), lamps: lampSpots(roads), cars: heroCars(roads) };
  }, []);
  useFrame(() => {
    if (rise.current) tickRise(rise.current, sim.current.intro);
  });
  return (
    <group position={[0, FLOOR_Y - GROUND_Y, 0]}>
      <mesh position={[0, GROUND_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[EXTENT * 2, EXTENT * 2]} />
        <meshStandardMaterial map={city.ground} roughness={0.95} />
      </mesh>
      <group ref={rise}>
        <Buildings boxes={city.lots.boxes} roofs={city.lots.roofs} glow={0.45} />
        <Trees trees={city.lots.trees} />
      </group>
      <Lamps spots={city.lamps} />
      <Traffic cars={city.cars} />
    </group>
  );
}
