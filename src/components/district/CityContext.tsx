"use client";

/**
 * Product 지역을 둘러싼 도시 — 지역이 허공에 뜬 판이 아니라 큰 도시의 한 구역으로 보이게 한다.
 * 누를 수 없는 배경이라 가볍게: 건물은 상자 하나를 인스턴싱(그리기 한 번), 창은 셰이더로 그린다.
 * 카메라 쪽(앞)은 낮게, 뒤로 갈수록 높게 — 지역을 가리지 않고 멀리 도심이 솟아 보인다. 먼 곳은 안개에 묻힌다.
 * 밤에는 창 · 가로등 · 차의 전조등(흰색) · 미등(빨간색)이 점처럼 빛난다.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { seeded, useSim } from "@/components/hero/heroSim";
import { poolTexture } from "./common";
import { ROAD } from "./districtLayout";

/** 도시가 펼쳐지는 범위 (카메라는 +x · +z 쪽 위에서 -x · -z 쪽을 본다 — 뒤쪽을 더 넓게) */
export const CITY = { x0: -84, x1: 58, z0: -78, z1: 46 };
/** 지역 판(26 × 18) + 둘레 여유 — 이 안에는 도시를 짓지 않는다 */
const PLATE_GAP = { x: 13.2, z: 9.2 };
const STREET_W = 0.9;
const GROUND_Y = -0.04;

type Road = { axis: "x" | "z"; at: number; w: number; main: boolean };

// 지역의 두 도로(동서 z = 0 · 남북 x = -1)가 도시로 이어지고, 판 둘레를 도로가 감싼다
function cityRoads(): Road[] {
  const roads: Road[] = [
    { axis: "x", at: ROAD.ewZ, w: ROAD.width, main: true },
    { axis: "z", at: ROAD.nsX, w: ROAD.width, main: true },
  ];
  for (let z = -10.4; z > CITY.z0 + 4; z -= 11) roads.push({ axis: "x", at: z, w: STREET_W, main: false });
  for (let z = 10.4; z < CITY.z1 - 4; z += 11) roads.push({ axis: "x", at: z, w: STREET_W, main: false });
  for (let x = -14.4; x > CITY.x0 + 4; x -= 11.5) roads.push({ axis: "z", at: x, w: STREET_W, main: false });
  for (let x = 14.4; x < CITY.x1 - 4; x += 11.5) roads.push({ axis: "z", at: x, w: STREET_W, main: false });
  return roads;
}

const insidePlate = (x: number, z: number, pad = 0) => Math.abs(x) < PLATE_GAP.x + pad && Math.abs(z) < PLATE_GAP.z + pad;

/** 카메라 쪽으로 얼마나 나와 있는지 (+ 앞 · - 뒤) */
const towardCamera = (x: number, z: number) => x * 0.468 + z * 0.884;

/* ── 바닥 · 도로 (캔버스 한 장) ──────────────────────────────────── */

function groundTexture(roads: Road[]) {
  const W = CITY.x1 - CITY.x0;
  const D = CITY.z1 - CITY.z0;
  const s = 2048 / W;
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round(D * s);
  const g = c.getContext("2d")!;
  const px = (x: number) => (x - CITY.x0) * s;
  const pz = (z: number) => (z - CITY.z0) * s;
  g.fillStyle = "#151f24";
  g.fillRect(0, 0, c.width, c.height);
  // 보도(살짝 밝게) → 차도 → 노면 표시
  for (const r of roads) {
    const half = r.w / 2 + 0.3;
    g.fillStyle = "#1b262b";
    if (r.axis === "x") g.fillRect(0, pz(r.at - half), c.width, half * 2 * s);
    else g.fillRect(px(r.at - half), 0, half * 2 * s, c.height);
  }
  for (const r of roads) {
    const half = r.w / 2;
    g.fillStyle = "#11181b";
    if (r.axis === "x") g.fillRect(0, pz(r.at - half), c.width, half * 2 * s);
    else g.fillRect(px(r.at - half), 0, half * 2 * s, c.height);
  }
  for (const r of roads) {
    const half = r.w / 2 - 0.06;
    g.fillStyle = "rgba(220,230,235,0.22)";
    for (const e of [-half, half]) {
      if (r.axis === "x") g.fillRect(0, pz(r.at + e) - 0.5, c.width, 1);
      else g.fillRect(px(r.at + e) - 0.5, 0, 1, c.height);
    }
    // 큰길은 노란 중앙선, 골목은 흰 점선
    if (r.main) {
      g.fillStyle = "rgba(230,180,70,0.5)";
      if (r.axis === "x") g.fillRect(0, pz(r.at) - 1, c.width, 2);
      else g.fillRect(px(r.at) - 1, 0, 2, c.height);
    } else {
      g.fillStyle = "rgba(220,230,235,0.25)";
      const len = r.axis === "x" ? c.width : c.height;
      for (let t = 0; t < len; t += 0.9 * s) {
        if (r.axis === "x") g.fillRect(t, pz(r.at) - 0.5, 0.45 * s, 1);
        else g.fillRect(px(r.at) - 0.5, t, 1, 0.45 * s);
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ── 건물 (상자 인스턴싱 + 셰이더 창) ────────────────────────────── */

type Box = { x: number; z: number; w: number; d: number; h: number; tint: number };

function cityBlocks(roads: Road[]): Box[] {
  const rand = seeded(77);
  const xs = [CITY.x0, ...roads.filter((r) => r.axis === "z").map((r) => r.at), CITY.x1].sort((a, b) => a - b);
  const zs = [CITY.z0, ...roads.filter((r) => r.axis === "x").map((r) => r.at), CITY.z1].sort((a, b) => a - b);
  const boxes: Box[] = [];
  const edge = (v: number, list: Road[]) => (list.find((r) => r.at === v)?.w ?? 0) / 2 + 0.45;
  const zRoads = roads.filter((r) => r.axis === "z");
  const xRoads = roads.filter((r) => r.axis === "x");
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < zs.length - 1; j++) {
      const bx0 = xs[i] + edge(xs[i], zRoads);
      const bx1 = xs[i + 1] - edge(xs[i + 1], zRoads);
      const bz0 = zs[j] + edge(zs[j], xRoads);
      const bz1 = zs[j + 1] - edge(zs[j + 1], xRoads);
      if (bx1 - bx0 < 1.5 || bz1 - bz0 < 1.5) continue;
      if (insidePlate((bx0 + bx1) / 2, (bz0 + bz1) / 2)) continue;
      // 블록을 필지로 나눈다: 긴 쪽은 여러 칸, 짧은 쪽은 한두 줄
      const long = bx1 - bx0 >= bz1 - bz0;
      const [l0, l1, s0, s1] = long ? [bx0, bx1, bz0, bz1] : [bz0, bz1, bx0, bx1];
      const rows = s1 - s0 > 5 ? 2 : 1;
      for (let r = 0; r < rows; r++) {
        const r0 = s0 + ((s1 - s0) / rows) * r;
        const r1 = r0 + (s1 - s0) / rows;
        let a = l0;
        while (l1 - a > 1.2) {
          const len = Math.min(l1 - a, 2.2 + rand() * 2.8);
          const b = l1 - (a + len) < 1.6 ? l1 : a + len;
          const gap = 0.12 + rand() * 0.2;
          const cl = (a + b) / 2;
          const cs = (r0 + r1) / 2;
          const wl = b - a - gap * 2;
          const ws = (r1 - r0) * (0.62 + rand() * 0.3);
          const [x, z, w, d] = long ? [cl, cs, wl, ws] : [cs, cl, ws, wl];
          a = b;
          if (rand() < 0.08) continue; // 빈 필지(주차장 · 공터)
          boxes.push(...building(x, z, w, d, rand));
        }
      }
    }
  }
  return boxes;
}

function building(x: number, z: number, w: number, d: number, rand: () => number): Box[] {
  const front = towardCamera(x, z);
  // 도심: 지역 뒤 왼쪽에 고층이 모인다
  const downtown = Math.exp(-((x + 30) ** 2 + (z + 34) ** 2) / (2 * 22 ** 2));
  let h: number;
  if (front > 7) h = 0.35 + rand() * 0.9; // 카메라 쪽 — 지역을 가리지 않게 낮게
  else {
    const back = Math.min(1, Math.max(0, (-front + 4) / 30));
    h = 0.6 + rand() * (1.4 + back * 2.2);
    if (rand() < 0.1 + downtown * 0.45) h += 2 + rand() * (3 + downtown * 5);
  }
  const tint = 0.82 + rand() * 0.3;
  const out: Box[] = [{ x, z, w, d, h, tint }];
  // 높은 건물 일부는 저층부 위에 좁은 고층부를 얹는다
  if (h > 3 && rand() < 0.5) {
    const podium = 0.5 + rand() * 0.5;
    out[0] = { x, z, w, d, h: podium, tint };
    out.push({ x, z, w: w * (0.55 + rand() * 0.2), d: d * (0.55 + rand() * 0.2), h, tint: tint * 1.04 });
  }
  return out;
}

const WINDOW_GLOW = new THREE.Color("#ffcf94");

function createCityMaterial() {
  const uniforms = { uNight: { value: 0 }, uWin: { value: WINDOW_GLOW.clone() } };
  const material = new THREE.MeshStandardMaterial({ color: "#3d4b55", roughness: 0.88, metalness: 0.05 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = uniforms.uNight;
    shader.uniforms.uWin = uniforms.uWin;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCity;\nvarying vec3 vCityN;\nvarying float vSeed;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvCity = (instanceMatrix * vec4(transformed, 1.0)).xyz;\nvCityN = normalize(mat3(instanceMatrix) * objectNormal);\nvSeed = float(gl_InstanceID);",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vCity;
        varying vec3 vCityN;
        varying float vSeed;
        uniform float uNight;
        uniform vec3 uWin;
        // 입력이 커도 정밀도가 깨지지 않는 해시 (건물 번호는 작은 값으로 접어 넣는다)
        float cityHash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // 층(3.4 m) × 칸(2.4 m) 격자에 창 — 멀어서 격자가 픽셀보다 작아지면 평균 밝기로 녹인다
          float wall = 1.0 - step(0.5, abs(vCityN.y));
          float along = abs(vCityN.x) > 0.5 ? vCity.z : vCity.x;
          vec2 g = vec2(along / 0.24, vCity.y / 0.34);
          vec2 cell = floor(g);
          vec2 f = fract(g);
          vec2 fw = fwidth(g);
          float sharp = 1.0 - smoothstep(0.3, 0.7, max(fw.x, fw.y));
          float win = step(0.2, f.x) * step(f.x, 0.8) * step(0.24, f.y) * step(f.y, 0.78) * wall * step(1.0, cell.y);
          win = mix(0.33 * wall * step(1.0, cell.y), win, sharp);
          float h = cityHash(cell + vec2(fract(vSeed * 0.618) * 97.0, fract(vSeed * 0.414) * 89.0) + (vCityN.x + vCityN.z) * 13.0);
          // 지역에서 멀수록 켜진 창이 드물다 — 먼 도심이 글자 뒤에서 어지럽지 않게, 깊이감도 생긴다
          float far = smoothstep(12.0, 32.0, length(vCity.xz));
          float lit = step(0.88 + 0.115 * far, h) * (1.0 - 0.5 * far);
          diffuseColor.rgb *= 1.0 - win * 0.38;
          diffuseColor.rgb *= 1.0 + 0.14 * step(0.5, vCityN.y);
          totalEmissiveRadiance += uWin * win * lit * uNight * (0.45 + 0.55 * fract(h * 7.0));
        }`,
      );
  };
  return { material, uniforms };
}

// 창은 해가 진 뒤에 켜진다 (빛 번짐이 있어 세게 하지 않는다)
function tickWindows(uniforms: { uNight: { value: number } }, dark: number) {
  uniforms.uNight.value = THREE.MathUtils.smoothstep(dark, 0.25, 0.7) * 0.75;
}

function Buildings({ boxes }: { boxes: Box[] }) {
  const sim = useSim();
  const { material, uniforms } = useMemo(() => createCityMaterial(), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  useFrame(() => tickWindows(uniforms, sim.current.dark));
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        const m = new THREE.Matrix4();
        const c = new THREE.Color();
        boxes.forEach((b, i) => {
          mesh.setMatrixAt(i, m.makeScale(b.w, b.h, b.d).setPosition(b.x, GROUND_Y, b.z));
          // 조금씩 다른 회색 — 약간 푸르거나 따뜻하게
          mesh.setColorAt(i, c.setRGB(b.tint, b.tint * (0.99 + (i % 3) * 0.01), b.tint * (1.0 + ((i % 5) - 2) * 0.015)));
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[geometry, material, boxes.length]}
      receiveShadow
    />
  );
}

/* ── 가로등 (밤에 점과 빛 웅덩이) ─────────────────────────────────── */

const LAMP = new THREE.Color("#ffd29a");
const LAMP_STEP = 4.2;

function lampSpots(roads: Road[]) {
  const spots: [number, number][] = [];
  for (const r of roads) {
    const [from, to] = r.axis === "x" ? [CITY.x0, CITY.x1] : [CITY.z0, CITY.z1];
    for (let t = from + 2; t < to - 2; t += LAMP_STEP) {
      for (const side of [-1, 1]) {
        const off = r.at + side * (r.w / 2 + 0.25);
        const [x, z] = r.axis === "x" ? [t + (side > 0 ? LAMP_STEP / 2 : 0), off] : [off, t + (side > 0 ? LAMP_STEP / 2 : 0)];
        // 지역 안 · 교차로 위에는 세우지 않는다 (지역 가로등은 따로 있다)
        if (insidePlate(x, z, 0.4)) continue;
        if (roads.some((o) => o.axis !== r.axis && Math.abs((r.axis === "x" ? x : z) - o.at) < o.w / 2 + 0.5)) continue;
        spots.push([x, z]);
      }
    }
  }
  return spots;
}

function tickLamps(heads: THREE.MeshBasicMaterial, pools: THREE.MeshBasicMaterial, dark: number) {
  const on = THREE.MathUtils.smoothstep(dark, 0.3, 0.55);
  heads.color.copy(LAMP).multiplyScalar(0.12 + on * 1.6);
  pools.color.copy(LAMP).multiplyScalar(on * 0.3);
}

function StreetLamps({ spots }: { spots: [number, number][] }) {
  const sim = useSim();
  const pool = useMemo(() => poolTexture(), []);
  const heads = useMemo(() => new THREE.MeshBasicMaterial({ color: LAMP.clone(), toneMapped: false }), []);
  const pools = useMemo(
    () => new THREE.MeshBasicMaterial({ map: pool, color: LAMP.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [pool],
  );
  useFrame(() => tickLamps(heads, pools, sim.current.dark));
  const init = (mesh: THREE.InstancedMesh | null, y: number, s: number, flat: boolean) => {
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const r = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    spots.forEach(([x, z], i) => {
      m.makeScale(s, s, s);
      if (flat) m.premultiply(r);
      mesh.setMatrixAt(i, m.setPosition(x, y, z));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return (
    <>
      <instancedMesh ref={(m) => init(m, 0.62, 1, false)} args={[undefined, heads, spots.length]}>
        <boxGeometry args={[0.07, 0.03, 0.07]} />
      </instancedMesh>
      <instancedMesh ref={(m) => init(m, 0.012, 0.8, true)} args={[undefined, pools, spots.length]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
}

/* ── 차 (멀리 보이는 차는 상자 + 전조등 · 미등 점) ─────────────────── */

type Car = { road: Road; lane: number; dir: 1 | -1; offset: number; speed: number; len: number };

const CAR_BODY = new THREE.Color("#9aa6ad");
const HEAD = new THREE.Color("#fff3da");
const TAIL = new THREE.Color("#ff3a2c");

function cityCars(roads: Road[]): Car[] {
  const rand = seeded(5);
  const cars: Car[] = [];
  // 지역을 지나는 큰길 두 개는 지역의 차(모델)가 달린다
  for (const road of roads.filter((r) => !r.main)) {
    const span = road.axis === "x" ? CITY.x1 - CITY.x0 : CITY.z1 - CITY.z0;
    for (const dir of [1, -1] as const) {
      const n = Math.round((span / 10) * (0.6 + rand() * 0.8));
      for (let k = 0; k < n; k++) {
        cars.push({ road, dir, lane: road.at + dir * 0.2, offset: rand(), speed: 0.9 + rand() * 0.5, len: 0.42 + rand() * 0.14 });
      }
    }
  }
  return cars;
}

/** 인스턴스 행렬을 직접 쓴다 (회전 없이 길이 방향만 바꾸므로) */
function put(arr: Float32Array, i: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
  const o = i * 16;
  arr.fill(0, o, o + 16);
  arr[o] = sx;
  arr[o + 5] = sy;
  arr[o + 10] = sz;
  arr[o + 12] = x;
  arr[o + 13] = y;
  arr[o + 14] = z;
  arr[o + 15] = 1;
}

function stepCars(cars: Car[], t: number, body: THREE.InstancedMesh, head: THREE.InstancedMesh, tail: THREE.InstancedMesh) {
  const b = body.instanceMatrix.array as Float32Array;
  const h = head.instanceMatrix.array as Float32Array;
  const l = tail.instanceMatrix.array as Float32Array;
  cars.forEach((c, i) => {
    const [from, to] = c.road.axis === "x" ? [CITY.x0, CITY.x1] : [CITY.z0, CITY.z1];
    const span = to - from;
    let u = ((t * c.speed) / span + c.offset) % 1;
    if (c.dir < 0) u = 1 - u;
    const p = from + u * span;
    const front = p + c.dir * (c.len / 2);
    const back = p - c.dir * (c.len / 2);
    if (c.road.axis === "x") {
      put(b, i, p, GROUND_Y + 0.07, c.lane, c.len, 0.13, 0.2);
      put(h, i, front, GROUND_Y + 0.08, c.lane, 0.03, 0.035, 0.17);
      put(l, i, back, GROUND_Y + 0.09, c.lane, 0.03, 0.03, 0.17);
    } else {
      put(b, i, c.lane, GROUND_Y + 0.07, p, 0.2, 0.13, c.len);
      put(h, i, c.lane, GROUND_Y + 0.08, front, 0.17, 0.035, 0.03);
      put(l, i, c.lane, GROUND_Y + 0.09, back, 0.17, 0.03, 0.03);
    }
  });
  body.instanceMatrix.needsUpdate = true;
  head.instanceMatrix.needsUpdate = true;
  tail.instanceMatrix.needsUpdate = true;
}

function tickCarLights(head: THREE.MeshBasicMaterial, tail: THREE.MeshBasicMaterial, dark: number) {
  head.color.copy(HEAD).multiplyScalar(0.2 + dark * 2.2);
  tail.color.copy(TAIL).multiplyScalar(0.15 + dark * 1.6);
}

function CityTraffic({ cars }: { cars: Car[] }) {
  const sim = useSim();
  const body = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const tail = useRef<THREE.InstancedMesh>(null);
  const mats = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: CAR_BODY, roughness: 0.45, metalness: 0.3 }),
      head: new THREE.MeshBasicMaterial({ color: HEAD.clone(), toneMapped: false }),
      tail: new THREE.MeshBasicMaterial({ color: TAIL.clone(), toneMapped: false }),
    }),
    [],
  );
  useFrame(({ clock }) => {
    if (!body.current || !head.current || !tail.current) return;
    tickCarLights(mats.head, mats.tail, sim.current.dark);
    stepCars(cars, clock.elapsedTime, body.current, head.current, tail.current);
  });
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  return (
    <>
      <instancedMesh ref={body} args={[geo, mats.body, cars.length]} frustumCulled={false} />
      <instancedMesh ref={head} args={[geo, mats.head, cars.length]} frustumCulled={false} />
      <instancedMesh ref={tail} args={[geo, mats.tail, cars.length]} frustumCulled={false} />
    </>
  );
}

/* ── 전체 ─────────────────────────────────────────────────────────── */

export default function CityContext() {
  const city = useMemo(() => {
    const roads = cityRoads();
    return { roads, ground: groundTexture(roads), boxes: cityBlocks(roads), lamps: lampSpots(roads), cars: cityCars(roads) };
  }, []);
  const W = CITY.x1 - CITY.x0;
  const D = CITY.z1 - CITY.z0;
  return (
    <group>
      <mesh position={[(CITY.x0 + CITY.x1) / 2, GROUND_Y, (CITY.z0 + CITY.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={city.ground} roughness={0.95} />
      </mesh>
      <Buildings boxes={city.boxes} />
      <StreetLamps spots={city.lamps} />
      <CityTraffic cars={city.cars} />
    </group>
  );
}
