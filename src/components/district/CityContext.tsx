"use client";

/**
 * Product 지역을 둘러싼 도시 — 지역이 허공에 뜬 판이 아니라 큰 도시의 한 구역으로 보이게 한다.
 * 바둑판처럼 딱딱하지 않게: 길 간격 · 폭이 제각각이고, 대각선 대로가 가로지르고, 강이 굽이쳐 흐른다.
 * 건물은 색 · 창 크기 · 덩어리(ㄱ자 · 저층부 위 고층부)가 다르고, 공원(산책로 · 연못 · 벤치 · 가로등) · 강변 녹지 · 가로수가
 * 사이사이를 메운다. 고가도로가 강을 따라, 또 그 위로 엇갈려 지나간다(Highways).
 * 누를 수 없는 배경이라 가볍게: 종류마다 인스턴싱 한 번, 창은 셰이더로 그린다.
 * 카메라 쪽(앞)은 낮게, 뒤로 갈수록 높게 — 지역을 가리지 않고 멀리 도심이 솟아 보인다. 먼 곳은 안개에 묻힌다.
 * 밤에는 창 · 가로등 · 차의 전조등(흰색) · 미등(빨간색)이 점처럼 빛나고, 강에 불빛이 비친다.
 */

import { useFrame } from "@react-three/fiber";
import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { seeded, useSim } from "@/components/hero/heroSim";
import CarFleet, { type CarPose } from "./CarFleet";
import Highways, { highwayFootprint, highwayPlan, type Highway } from "./Highways";
import { m4, poolTexture } from "./common";
import { Props } from "./props";
import { ROAD } from "./districtLayout";

/** 도시가 펼쳐지는 범위 (카메라는 +x · +z 쪽 위에서 -x · -z 쪽을 본다 — 뒤쪽을 더 넓게) */
export const CITY = { x0: -84, x1: 58, z0: -78, z1: 46 };
/** 도시 바닥 높이 — 지역 판(윗면 0)과 거의 같아 턱 없이 이어진다 */
export const GROUND_Y = -0.012;
/** 지역 판(26 × 18) + 둘레 여유 — 이 안에는 도시를 짓지 않는다 */
const PLATE_GAP = { x: 13.2, z: 9.2 };

/** 지역 뒤를 굽이쳐 흐르는 강 (폭 34 m) */
const RIVER_W = 3.4;
const BANK = 0.4; // 산책로
const GREEN = 0.9; // 강변 녹지
const riverZ = (x: number) => -16.2 + 1.5 * Math.sin(0.075 * x + 0.6) + 0.6 * Math.sin(0.19 * x + 2.0);
/** 강 중심선에서 떨어진 거리 (z 방향) */
const riverGap = (x: number, z: number) => Math.abs(z - riverZ(x));

type V2 = [number, number];
type Road = { a: V2; b: V2; w: number; kind: "main" | "avenue" | "street" };

const insidePlate = (x: number, z: number, pad = 0) => Math.abs(x) < PLATE_GAP.x + pad && Math.abs(z) < PLATE_GAP.z + pad;

/** 카메라 쪽으로 얼마나 나와 있는지 (+ 앞 · - 뒤) */
const towardCamera = (x: number, z: number) => x * 0.468 + z * 0.884;

function roadDir(r: Road) {
  const dx = r.b[0] - r.a[0];
  const dz = r.b[1] - r.a[1];
  const len = Math.hypot(dx, dz);
  return { dx: dx / len, dz: dz / len, len };
}

/** 점에서 도로 중심선까지 거리 */
function roadGap(r: Road, x: number, z: number) {
  const { dx, dz, len } = roadDir(r);
  const t = Math.min(len, Math.max(0, (x - r.a[0]) * dx + (z - r.a[1]) * dz));
  return Math.hypot(x - (r.a[0] + dx * t), z - (r.a[1] + dz * t));
}

const isAxisX = (r: Road) => r.a[1] === r.b[1];
const isAxisZ = (r: Road) => r.a[0] === r.b[0];

/* ── 길: 간격 · 폭이 제각각인 격자 + 대각선 대로 ────────────────────── */

function cityRoads(): Road[] {
  const rand = seeded(31);
  const pick = (): { w: number; kind: Road["kind"] } => (rand() < 0.3 ? { w: 1.3, kind: "avenue" } : { w: rand() < 0.4 ? 0.7 : 0.9, kind: "street" });
  const ew = (z: number, w: number, kind: Road["kind"]): Road => ({ a: [CITY.x0, z], b: [CITY.x1, z], w, kind });
  const ns = (x: number, w: number, kind: Road["kind"]): Road => ({ a: [x, CITY.z0], b: [x, CITY.z1], w, kind });
  // 지역의 두 도로(동서 z = 0 · 남북 x = -1)가 도시로 이어지고, 판 둘레를 도로가 감싼다
  const roads: Road[] = [ew(ROAD.ewZ, ROAD.width, "main"), ns(ROAD.nsX, ROAD.width, "main"), ew(-10.4, 0.9, "street"), ew(10.4, 0.9, "street"), ns(-14.4, 0.9, "street"), ns(14.4, 0.9, "street")];
  const add = (make: (at: number, w: number, kind: Road["kind"]) => Road, at: number) => {
    const k = pick();
    roads.push(make(at, k.w, k.kind));
  };
  // 북쪽 첫 길은 강을 건너뛴다
  for (let z = -10.4 - (11.2 + rand() * 1.6); z > CITY.z0 + 4; z -= 8.5 + rand() * 5) add(ew, z);
  for (let z = 10.4 + 8.5 + rand() * 4; z < CITY.z1 - 4; z += 8.5 + rand() * 5) add(ew, z);
  for (let x = -14.4 - (8.5 + rand() * 5); x > CITY.x0 + 4; x -= 8.5 + rand() * 5.5) add(ns, x);
  for (let x = 14.4 + 8.5 + rand() * 5; x < CITY.x1 - 4; x += 8.5 + rand() * 5.5) add(ns, x);
  // 비스듬히 가로지르는 대로 둘 — 강 건너 도심 쪽 하나, 지역 남동쪽 모서리에서 하나 (강과는 만나지 않는다)
  const north = Math.max(...roads.filter((r) => r.a[1] === r.b[1] && r.a[1] < -12).map((r) => r.a[1]));
  roads.push({ a: [ROAD.nsX, north], b: [ROAD.nsX - 70 * 0.8, north - 70 * 0.6], w: 1.4, kind: "avenue" });
  roads.push({ a: [14.4, 10.4], b: [14.4 + 60 * 0.75, 10.4 + 60 * 0.66], w: 1.3, kind: "avenue" });
  return roads;
}

/* ── 땅 위 무늬 (캔버스 한 장): 보도 · 차도 · 노면 표시 · 공원 · 강변 ── */

type Ellipse = { x: number; z: number; rx: number; rz: number };
/** 공원: 둘레 산책로(타원) · 가운데 연못 · 산책로에서 네 방향 입구로 나가는 길 */
type Park = { x0: number; x1: number; z0: number; z1: number; loop?: Ellipse; pond?: Ellipse };

function groundTexture(roads: Road[], parks: Park[]) {
  const W = CITY.x1 - CITY.x0;
  const D = CITY.z1 - CITY.z0;
  const s = 2048 / W;
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = Math.round(D * s);
  const g = c.getContext("2d")!;
  const px = (x: number) => (x - CITY.x0) * s;
  const pz = (z: number) => (z - CITY.z0) * s;
  g.fillStyle = "#1a252b";
  g.fillRect(0, 0, c.width, c.height);
  // 공원: 잔디 → 안쪽 밝은 잔디 → 산책로 · 입구 길 → 연못
  const ellipse = (e: Ellipse, grow = 0) => {
    g.beginPath();
    g.ellipse(px(e.x), pz(e.z), (e.rx + grow) * s, (e.rz + grow) * s, 0, 0, Math.PI * 2);
  };
  for (const p of parks) {
    g.fillStyle = "#1c2d27";
    g.fillRect(px(p.x0), pz(p.z0), (p.x1 - p.x0) * s, (p.z1 - p.z0) * s);
    if (!p.loop) continue;
    g.fillStyle = "#21352d";
    ellipse(p.loop, -0.1);
    g.fill();
    g.strokeStyle = "#47524d";
    g.lineWidth = 0.2 * s;
    ellipse(p.loop);
    g.stroke();
    const { x, z, rx, rz } = p.loop;
    g.lineWidth = 0.16 * s;
    g.beginPath();
    for (const [a, b, c, d] of [
      [p.x0, z, x - rx, z],
      [x + rx, z, p.x1, z],
      [x, p.z0, x, z - rz],
      [x, z + rz, x, p.z1],
    ]) {
      g.moveTo(px(a), pz(b));
      g.lineTo(px(c), pz(d));
    }
    g.stroke();
    if (p.pond) {
      g.fillStyle = "#3b4744";
      ellipse(p.pond, 0.12);
      g.fill();
      g.fillStyle = "#0c1a20";
      ellipse(p.pond);
      g.fill();
    }
  }
  // 강: 녹지 → 산책로 → 물 자리 순으로 좁혀 가며 칠한다
  const band = (half: number, color: string) => {
    g.fillStyle = color;
    g.beginPath();
    for (let x = CITY.x0; x <= CITY.x1; x += 0.5) g.lineTo(px(x), pz(riverZ(x) - half));
    for (let x = CITY.x1; x >= CITY.x0; x -= 0.5) g.lineTo(px(x), pz(riverZ(x) + half));
    g.closePath();
    g.fill();
  };
  band(RIVER_W / 2 + BANK + GREEN, "#1c2d27");
  band(RIVER_W / 2 + BANK, "#2a363d");
  band(RIVER_W / 2, "#0c1a20");
  // 보도 → 차도 → 노면 표시
  const stroke = (r: Road, width: number, color: string, off = 0, dash: number[] = []) => {
    const { dx, dz } = roadDir(r);
    g.strokeStyle = color;
    g.lineWidth = width;
    g.setLineDash(dash);
    g.beginPath();
    g.moveTo(px(r.a[0] - dz * off), pz(r.a[1] + dx * off));
    g.lineTo(px(r.b[0] - dz * off), pz(r.b[1] + dx * off));
    g.stroke();
  };
  for (const r of roads) stroke(r, (r.w + 0.6) * s, "#24313a");
  for (const r of roads) stroke(r, r.w * s, "#11181b");
  for (const r of roads) {
    for (const e of [-1, 1]) stroke(r, 1, "rgba(220,230,235,0.22)", e * (r.w / 2 - 0.06));
    if (r.kind === "main") stroke(r, 2, "rgba(230,180,70,0.5)");
    else if (r.kind === "avenue") for (const e of [-1, 1]) stroke(r, 1, "rgba(230,180,70,0.4)", e * 0.04);
    else stroke(r, 1, "rgba(220,230,235,0.25)", 0, [0.45 * s, 0.45 * s]);
  }
  g.setLineDash([]);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ── 필지: 건물 · 옥상 설비 · 공원 · 나무 ───────────────────────────── */

type Box = { x: number; z: number; w: number; d: number; h: number; color: THREE.Color };
type Tree = { x: number; z: number; r: number; shade: number; pine: boolean };
type City = { boxes: Box[]; roofs: Box[]; parks: Park[]; trees: Tree[]; benches: THREE.Matrix4[]; parkLamps: V2[] };
/** 건물 · 공원 나무를 비켜 놓을 것: 대각선 대로 · 고가 발자국 */
type Avoid = { diag: Road[]; hw: { x: number; z: number; r: number }[] };

// 회색이 대부분이고 베이지 · 푸른 회색 · 짙은 유리 건물이 섞인다
const PALETTE = [
  { p: 0.55, rgb: [1, 1, 1.02] },
  { p: 0.2, rgb: [1.12, 1.03, 0.9] },
  { p: 0.15, rgb: [0.86, 0.95, 1.1] },
  { p: 0.1, rgb: [0.6, 0.7, 0.84] },
];

function tint(rand: () => number, tall: boolean) {
  let u = rand() * (tall ? 0.75 : 1);
  if (tall && rand() < 0.35) u = 0.95; // 고층은 유리가 더 많다
  const k = 0.82 + rand() * 0.28;
  let acc = 0;
  for (const e of PALETTE) {
    acc += e.p;
    if (u < acc) return new THREE.Color(e.rgb[0] * k, e.rgb[1] * k, e.rgb[2] * k);
  }
  const last = PALETTE[PALETTE.length - 1].rgb;
  return new THREE.Color(last[0] * k, last[1] * k, last[2] * k);
}

/** 필지가 강 · 대각선 대로 · 고가 · 지역에 걸리는지 */
function blocked(x: number, z: number, w: number, d: number, avoid: Avoid) {
  if (insidePlate(x, z)) return true;
  for (const sx of [x - w / 2, x, x + w / 2]) {
    const rz = riverZ(sx);
    const R = RIVER_W / 2 + BANK + GREEN;
    if (z - d / 2 < rz + R && z + d / 2 > rz - R) return true;
  }
  const reach = Math.max(w, d) * 0.55;
  if (avoid.hw.some((h) => (x - h.x) ** 2 + (z - h.z) ** 2 < (h.r + reach) ** 2)) return true;
  return avoid.diag.some((r) => roadGap(r, x, z) < r.w / 2 + 0.6 + reach);
}

function cityLots(roads: Road[], hws: Highway[]): City {
  const rand = seeded(77);
  const city: City = { boxes: [], roofs: [], parks: [], trees: [], benches: [], parkLamps: [] };
  const xRoads = roads.filter(isAxisX);
  const zRoads = roads.filter(isAxisZ);
  const diag: Avoid = { diag: roads.filter((r) => !isAxisX(r) && !isAxisZ(r)), hw: highwayFootprint(hws) };
  const xs = [CITY.x0, ...zRoads.map((r) => r.a[0]), CITY.x1].sort((a, b) => a - b);
  const zs = [CITY.z0, ...xRoads.map((r) => r.a[1]), CITY.z1].sort((a, b) => a - b);
  const edge = (v: number, list: Road[], axis: 0 | 1) => (list.find((r) => r.a[axis] === v)?.w ?? 0) / 2 + 0.45;
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < zs.length - 1; j++) {
      const bx0 = xs[i] + edge(xs[i], zRoads, 0);
      const bx1 = xs[i + 1] - edge(xs[i + 1], zRoads, 0);
      const bz0 = zs[j] + edge(zs[j], xRoads, 1);
      const bz1 = zs[j + 1] - edge(zs[j + 1], xRoads, 1);
      if (bx1 - bx0 < 1.5 || bz1 - bz0 < 1.5 || insidePlate((bx0 + bx1) / 2, (bz0 + bz1) / 2)) continue;
      // 블록 몇 개는 통째로 공원
      if (rand() < 0.07 && !blocked((bx0 + bx1) / 2, (bz0 + bz1) / 2, 0.1, 0.1, diag)) {
        addPark(city, { x0: bx0, x1: bx1, z0: bz0, z1: bz1 }, rand, diag);
        continue;
      }
      fillBlock(city, bx0, bx1, bz0, bz1, rand, diag);
    }
  }
  // 강변 녹지의 나무
  for (let x = CITY.x0 + 1; x < CITY.x1 - 1; x += 0.9 + rand() * 0.8) {
    for (const side of [-1, 1]) {
      if (rand() < 0.35) continue;
      const z = riverZ(x) + side * (RIVER_W / 2 + BANK + 0.2 + rand() * (GREEN - 0.3));
      if (!roads.some((r) => roadGap(r, x, z) < r.w / 2 + 0.5)) city.trees.push({ x, z, r: 0.22 + rand() * 0.16, shade: rand(), pine: rand() < 0.2 });
    }
  }
  // 대로 · 큰길 가로수
  for (const r of roads) {
    if (r.kind === "street") continue;
    const { dx, dz, len } = roadDir(r);
    for (let t = 1; t < len - 1; t += 1.5) {
      for (const side of [-1, 1]) {
        const off = side * (r.w / 2 + 0.42);
        const x = r.a[0] + dx * t - dz * off;
        const z = r.a[1] + dz * t + dx * off;
        if (insidePlate(x, z, 0.6) || riverGap(x, z) < RIVER_W / 2 + 0.3) continue;
        if (roads.some((o) => o !== r && roadGap(o, x, z) < o.w / 2 + 0.6)) continue;
        city.trees.push({ x, z, r: 0.18 + rand() * 0.08, shade: rand(), pine: false });
      }
    }
  }
  return city;
}

const BENCH_SCALE = 0.24;

function addPark(city: City, park: Park, rand: () => number, avoid: Avoid) {
  const p: Park = { ...park };
  const w = p.x1 - p.x0;
  const d = p.z1 - p.z0;
  const cx = (p.x0 + p.x1) / 2;
  const cz = (p.z0 + p.z1) / 2;
  if (w > 2.4 && d > 2.4) {
    p.loop = { x: cx, z: cz, rx: w / 2 - 0.55, rz: d / 2 - 0.55 };
    if (w * d > 22 && rand() < 0.6) p.pond = { x: cx + (rand() - 0.5) * w * 0.1, z: cz + (rand() - 0.5) * d * 0.1, rx: w * (0.14 + rand() * 0.06), rz: d * (0.12 + rand() * 0.05) };
  }
  city.parks.push(p);
  const loop = p.loop;
  if (loop) {
    // 산책로 바깥에 안쪽을 보는 벤치, 안쪽에 가로등 (입구 길 자리는 비운다)
    const per = Math.PI * (loop.rx + loop.rz);
    const n = Math.max(3, Math.round(per / 1.6));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.35;
      if (Math.abs(Math.sin(2 * a)) < 0.3) continue;
      const x = loop.x + Math.cos(a) * (loop.rx + 0.24);
      const z = loop.z + Math.sin(a) * (loop.rz + 0.24);
      if (k % 2 === 0 && rand() < 0.85) city.benches.push(m4(x, GROUND_Y, z, Math.atan2(loop.x - x, loop.z - z), BENCH_SCALE, BENCH_SCALE, BENCH_SCALE));
      else if (k % 4 === 1) city.parkLamps.push([loop.x + Math.cos(a) * (loop.rx - 0.2), loop.z + Math.sin(a) * (loop.rz - 0.2)]);
    }
  }
  // 나무: 산책로 · 입구 길 · 연못을 비켜 심고, 가장자리에 더 빽빽하게 (일부는 침엽수)
  const n = Math.round(w * d * 0.5);
  for (let k = 0; k < n; k++) {
    const x = p.x0 + 0.25 + rand() * (w - 0.5);
    const z = p.z0 + 0.25 + rand() * (d - 0.5);
    if (loop) {
      const e = Math.hypot((x - loop.x) / loop.rx, (z - loop.z) / loop.rz);
      if (Math.abs(e - 1) < 0.22 / Math.min(loop.rx, loop.rz) + 0.08) continue;
      if (Math.abs(x - loop.x) < 0.3 && (z < loop.z - loop.rz || z > loop.z + loop.rz)) continue;
      if (Math.abs(z - loop.z) < 0.3 && (x < loop.x - loop.rx || x > loop.x + loop.rx)) continue;
      if (e < 0.9 && rand() < 0.55) continue; // 안쪽은 잔디밭
    }
    if (p.pond && Math.hypot((x - p.pond.x) / (p.pond.rx + 0.35), (z - p.pond.z) / (p.pond.rz + 0.35)) < 1) continue;
    if (!blocked(x, z, 0.2, 0.2, avoid)) city.trees.push({ x, z, r: 0.18 + rand() * 0.24, shade: rand(), pine: rand() < 0.3 });
  }
}

/** 블록을 필지로 나눈다: 긴 쪽은 여러 칸, 짧은 쪽은 한두 줄 — 크기 · 들여쓰기 · 높이가 제각각 */
function fillBlock(city: City, bx0: number, bx1: number, bz0: number, bz1: number, rand: () => number, diag: Avoid) {
  const long = bx1 - bx0 >= bz1 - bz0;
  const [l0, l1, s0, s1] = long ? [bx0, bx1, bz0, bz1] : [bz0, bz1, bx0, bx1];
  const rows = s1 - s0 > 5 ? 2 : 1;
  for (let r = 0; r < rows; r++) {
    const r0 = s0 + ((s1 - s0) / rows) * r;
    const r1 = r0 + (s1 - s0) / rows;
    // 길 쪽에 붙여 짓는다 (블록 안쪽은 마당)
    const toRoad = rows === 1 ? 0 : r === 0 ? -1 : 1;
    let a = l0;
    while (l1 - a > 1.2) {
      const len = Math.min(l1 - a, 1.6 + rand() * 3.6);
      const b = l1 - (a + len) < 1.4 ? l1 : a + len;
      const gap = 0.08 + rand() * 0.25;
      const wl = b - a - gap * 2;
      const ws = (r1 - r0) * (0.5 + rand() * 0.42);
      const slack = r1 - r0 - ws;
      const cs = (r0 + r1) / 2 + (toRoad === 0 ? (rand() - 0.5) * slack * 0.6 : toRoad * slack * (0.3 + rand() * 0.2));
      const cl = (a + b) / 2;
      const [x, z, w, d] = long ? [cl, cs, wl, ws] : [cs, cl, ws, wl];
      a = b;
      if (blocked(x, z, w, d, diag)) continue;
      const u = rand();
      if (u < 0.06) continue; // 공터 · 주차장
      if (u < 0.12) {
        addPark(city, { x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 }, rand, diag); // 작은 공원
        continue;
      }
      building(city, x, z, w, d, rand);
    }
  }
}

function building(city: City, x: number, z: number, w: number, d: number, rand: () => number) {
  const front = towardCamera(x, z);
  // 도심: 지역 뒤 왼쪽(대각선 대로 끝)에 고층이 모인다
  const downtown = Math.exp(-((x + 34) ** 2 + (z + 36) ** 2) / (2 * 20 ** 2));
  let h: number;
  if (front > 7) h = 0.3 + rand() * 0.9; // 카메라 쪽 — 지역을 가리지 않게 낮게
  else {
    const back = Math.min(1, Math.max(0, (-front + 4) / 30));
    h = 0.5 + rand() * (1.3 + back * 2.0);
    if (rand() < 0.08 + downtown * 0.5) h += 2 + rand() * (3 + downtown * 6);
  }
  const color = tint(rand, h > 3);
  const sx = rand() < 0.5 ? -1 : 1;
  const sz = rand() < 0.5 ? -1 : 1;
  if (h > 3 && rand() < 0.6) {
    // 저층부 위 고층부 — 한쪽 모서리로 치우쳐 얹는다
    const tw = w * (0.45 + rand() * 0.3);
    const td = d * (0.45 + rand() * 0.3);
    city.boxes.push({ x, z, w, d, h: 0.4 + rand() * 0.6, color: color.clone().multiplyScalar(0.92) });
    city.boxes.push({ x: x + sx * (w - tw) * 0.3 * rand(), z: z + sz * (d - td) * 0.3 * rand(), w: tw, d: td, h, color });
  } else if (w > 1.6 && d > 1.2 && rand() < 0.3) {
    // ㄱ자: 긴 동 + 높이가 다른 날개
    const ww = w * (0.4 + rand() * 0.2);
    city.boxes.push({ x: x - sx * (w - ww) / 2, z, w: ww, d, h, color });
    city.boxes.push({ x: x + sx * ww / 2, z: z + sz * d * 0.25, w: w - ww, d: d * 0.5, h: h * (0.5 + rand() * 0.4), color: color.clone().multiplyScalar(1.04) });
  } else city.boxes.push({ x, z, w, d, h, color });
  // 옥상 설비 (계단실 · 실외기)
  const top = city.boxes[city.boxes.length - 1];
  if (rand() < 0.45) {
    const n = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const rw = Math.min(top.w * 0.4, 0.15 + rand() * 0.35);
      const rd = Math.min(top.d * 0.4, 0.15 + rand() * 0.3);
      city.roofs.push({ x: top.x + (rand() - 0.5) * (top.w - rw) * 0.8, z: top.z + (rand() - 0.5) * (top.d - rd) * 0.8, w: rw, d: rd, h: top.h + 0.05 + rand() * 0.12, color: top.color });
    }
  }
}

const WINDOW_GLOW = new THREE.Color("#ffcf94");

function createCityMaterial() {
  const uniforms = { uNight: { value: 0 }, uWin: { value: WINDOW_GLOW.clone() } };
  const material = new THREE.MeshStandardMaterial({ color: "#3d4b55", roughness: 0.85, metalness: 0.08 });
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
          // 건물마다 창 간격 · 층고가 다르고, 일부는 가로 띠만 있는 유리 건물
          vec2 id = vec2(fract(vSeed * 0.618) * 97.0, fract(vSeed * 0.414) * 89.0);
          float kind = cityHash(id + 5.0);
          vec2 cellSize = vec2(0.2 + 0.14 * cityHash(id + 1.0), 0.3 + 0.08 * cityHash(id + 2.0));
          float curtain = step(kind, 0.14);
          float wall = 1.0 - step(0.5, abs(vCityN.y));
          float along = abs(vCityN.x) > 0.5 ? vCity.z : vCity.x;
          vec2 g = vec2(along, vCity.y) / cellSize;
          vec2 cell = floor(g);
          vec2 f = fract(g);
          vec2 fw = fwidth(g);
          // 멀어서 격자가 픽셀보다 작아지면 평균 밝기로 녹인다
          float sharp = 1.0 - smoothstep(0.3, 0.7, max(fw.x, fw.y));
          float colW = mix(0.6, 0.96, curtain);
          float win = step(0.5 - colW / 2.0, f.x) * step(f.x, 0.5 + colW / 2.0) * step(0.24, f.y) * step(f.y, 0.8) * wall * step(1.0, cell.y);
          win = mix(colW * 0.56 * wall * step(1.0, cell.y), win, sharp);
          float h = cityHash(cell + id + (vCityN.x + vCityN.z) * 13.0);
          // 지역에서 멀수록 켜진 창이 드물다 — 먼 도심이 글자 뒤에서 어지럽지 않게, 깊이감도 생긴다
          float far = smoothstep(12.0, 32.0, length(vCity.xz));
          float lit = step(0.88 + 0.115 * far, h) * (1.0 - 0.5 * far);
          diffuseColor.rgb *= 1.0 - win * mix(0.38, 0.5, curtain);
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

function initBoxes(mesh: THREE.InstancedMesh | null, boxes: Box[]) {
  if (!mesh) return;
  const m = new THREE.Matrix4();
  boxes.forEach((b, i) => {
    mesh.setMatrixAt(i, m.makeScale(b.w, b.h, b.d).setPosition(b.x, GROUND_Y, b.z));
    mesh.setColorAt(i, b.color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

function Buildings({ boxes, roofs }: { boxes: Box[]; roofs: Box[] }) {
  const sim = useSim();
  const { material, uniforms } = useMemo(() => createCityMaterial(), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a5760", roughness: 0.8 }), []);
  useFrame(() => tickWindows(uniforms, sim.current.dark));
  return (
    <>
      <instancedMesh ref={(m) => initBoxes(m, boxes)} args={[geometry, material, boxes.length]} receiveShadow />
      <instancedMesh ref={(m) => initBoxes(m, roofs)} args={[geometry, roofMat, roofs.length]} />
    </>
  );
}

/* ── 나무 (공원 · 강변 · 가로수) ──────────────────────────────────── */

const TREE_DARK = new THREE.Color("#22362c");
const TREE_LIGHT = new THREE.Color("#3a5446");

function Trees({ trees }: { trees: Tree[] }) {
  const round = useMemo(() => trees.filter((t) => !t.pine), [trees]);
  const pines = useMemo(() => trees.filter((t) => t.pine), [trees]);
  const ico = useMemo(() => new THREE.IcosahedronGeometry(1, 0).translate(0, 1.2, 0), []);
  const cone = useMemo(() => new THREE.ConeGeometry(0.8, 2.6, 7).translate(0, 1.3, 0), []);
  return (
    <>
      <TreeKind trees={round} geometry={ico} />
      <TreeKind trees={pines} geometry={cone} />
    </>
  );
}

function TreeKind({ trees, geometry }: { trees: Tree[]; geometry: THREE.BufferGeometry }) {
  return (
    <instancedMesh
      ref={(mesh) => {
        if (!mesh) return;
        const m = new THREE.Matrix4();
        const c = new THREE.Color();
        trees.forEach((t, i) => {
          mesh.setMatrixAt(i, m.makeScale(t.r, t.r * 1.15, t.r).setPosition(t.x, GROUND_Y, t.z));
          mesh.setColorAt(i, c.copy(TREE_DARK).lerp(TREE_LIGHT, t.shade));
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[geometry, undefined, trees.length]}
    >
      <meshStandardMaterial flatShading roughness={0.95} />
    </instancedMesh>
  );
}

/* ── 가로등 (밤에 점과 빛 웅덩이) ─────────────────────────────────── */

const LAMP = new THREE.Color("#ffd29a");
const LAMP_STEP = 4.2;

function lampSpots(roads: Road[], parkLamps: V2[]) {
  const spots: V2[] = [...parkLamps];
  for (const r of roads) {
    const { dx, dz, len } = roadDir(r);
    for (let t = 2; t < len - 2; t += LAMP_STEP) {
      for (const side of [-1, 1]) {
        const tt = t + (side > 0 ? LAMP_STEP / 2 : 0);
        const off = side * (r.w / 2 + 0.25);
        const x = r.a[0] + dx * tt - dz * off;
        const z = r.a[1] + dz * tt + dx * off;
        // 지역 안 · 교차로 · 강 위에는 세우지 않는다 (지역 가로등은 따로 있다)
        if (insidePlate(x, z, 0.4) || riverGap(x, z) < RIVER_W / 2 + 0.2) continue;
        if (roads.some((o) => o !== r && roadGap(o, x, z) < o.w / 2 + 0.5)) continue;
        spots.push([x, z]);
      }
    }
  }
  // 강둑 산책로 가로등 — 북쪽 둑 불빛은 물에 비쳐 카메라 쪽으로 길게 번진다
  const reflections: V2[] = [];
  for (let x = CITY.x0 + 1.5; x < CITY.x1 - 1.5; x += 2.6) {
    const north: V2 = [x, riverZ(x) - RIVER_W / 2 - BANK / 2];
    const south: V2 = [x + 1.3, riverZ(x + 1.3) + RIVER_W / 2 + BANK / 2];
    for (const p of [north, south]) if (!roads.some((r) => roadGap(r, p[0], p[1]) < r.w / 2 + 0.8)) spots.push(p);
    if (!roads.some((r) => roadGap(r, north[0], north[1]) < r.w / 2 + 0.8)) reflections.push([x, riverZ(x) - RIVER_W / 2 + 0.8]);
  }
  return { spots, reflections };
}

function tickLamps(heads: THREE.MeshBasicMaterial, pools: THREE.MeshBasicMaterial, dark: number) {
  const on = THREE.MathUtils.smoothstep(dark, 0.3, 0.55);
  heads.color.copy(LAMP).multiplyScalar(0.12 + on * 1.6);
  pools.color.copy(LAMP).multiplyScalar(on * 0.3);
}

function StreetLamps({ spots, reflections }: { spots: V2[]; reflections: V2[] }) {
  const sim = useSim();
  const pool = useMemo(() => poolTexture(), []);
  const heads = useMemo(() => new THREE.MeshBasicMaterial({ color: LAMP.clone(), toneMapped: false }), []);
  const pools = useMemo(
    () => new THREE.MeshBasicMaterial({ map: pool, color: LAMP.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [pool],
  );
  useFrame(() => tickLamps(heads, pools, sim.current.dark));
  const init = (mesh: THREE.InstancedMesh | null, y: number, s: number, flat: boolean, list = spots, long = 1) => {
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const r = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    list.forEach(([x, z], i) => {
      m.makeScale(s / long, s * long, s);
      if (flat) m.premultiply(r);
      mesh.setMatrixAt(i, m.setPosition(x, y, z));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return (
    <>
      <instancedMesh ref={(m) => init(m, GROUND_Y + 0.66, 1, false)} args={[undefined, heads, spots.length]}>
        <boxGeometry args={[0.07, 0.03, 0.07]} />
      </instancedMesh>
      <instancedMesh ref={(m) => init(m, GROUND_Y + 0.02, 0.8, true)} args={[undefined, pools, spots.length]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
      {/* 물에 비친 불빛: 카메라 쪽으로 길쭉하게 */}
      <instancedMesh ref={(m) => init(m, WATER_Y + 0.006, 0.6, true, reflections, 2.6)} args={[undefined, pools, reflections.length]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </>
  );
}

/* ── 차 (지역과 같은 차 모델 · 색, 먼 차는 가벼운 차 — CarFleet) ──── */

type Car = { road: Road; dir: 1 | -1; offset: number; speed: number };

function cityCars(roads: Road[]): Car[] {
  const rand = seeded(5);
  const cars: Car[] = [];
  // 지역을 지나는 큰길 두 개는 지역의 차(Traffic)가 달린다
  for (const road of roads.filter((r) => r.kind !== "main")) {
    const busy = road.kind === "avenue" ? 1.6 : 1;
    for (const dir of [1, -1] as const) {
      const n = Math.round((roadDir(road).len / 10) * (0.6 + rand() * 0.8) * busy);
      for (let k = 0; k < n; k++) cars.push({ road, dir, offset: rand(), speed: 0.9 + rand() * 0.5 });
    }
  }
  return cars;
}

/** 길을 따라 달리는 차의 자리 · 방향 (진행 방향 오른쪽 차선) */
function carPose(car: Car, t: number, out: CarPose) {
  const { dx, dz, len } = roadDir(car.road);
  let u = ((t * car.speed) / len + car.offset) % 1;
  if (car.dir < 0) u = 1 - u;
  out.fx = dx * car.dir;
  out.fz = dz * car.dir;
  out.x = car.road.a[0] + dx * u * len - out.fz * 0.2;
  out.z = car.road.a[1] + dz * u * len + out.fx * 0.2;
  out.y = GROUND_Y;
}

function CityTraffic({ cars }: { cars: Car[] }) {
  const pose = useCallback((i: number, t: number, out: CarPose) => carPose(cars[i], t, out), [cars]);
  return <CarFleet count={cars.length} seed={1} pose={pose} />;
}

/* ── 강 (물결이 반짝이는 물 · 둑 · 다리) ──────────────────────────── */

// 바닥에서 살짝 띄운다 (다리 상판보다는 아래)
const WATER_Y = GROUND_Y + 0.008;

const WATER = {
  deep: new THREE.Color("#0d2630"),
  shallow: new THREE.Color("#2c5652"),
  skyDay: new THREE.Color("#5f8c9c"),
  skyNight: new THREE.Color("#0e1d28"),
};

/**
 * 물: 깊은 가운데는 짙고 둑 쪽은 옅은 청록 + 둑 가장자리 물거품, 여러 방향 물결로 법선을 흔들어 해 · 하늘 반사가 일렁이고,
 * 비스듬히 볼수록(프레넬) 하늘빛이 비친다. aAcross: 물 가운데 0 ~ 가장자리 1
 */
function createWaterMaterial() {
  const uniforms = { uTime: { value: 0 }, uNight: { value: 0 }, uSky: { value: WATER.skyDay.clone() } };
  const material = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.25, roughness: 0.07, envMapIntensity: 1.1 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, { uDeep: { value: WATER.deep }, uShallow: { value: WATER.shallow } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aAcross;\nvarying vec2 vWater;\nvarying float vAcross;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWater = (modelMatrix * vec4(transformed, 1.0)).xz;\nvAcross = aAcross;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec2 vWater;\nvarying float vAcross;\nuniform float uTime;\nuniform float uNight;\nuniform vec3 uSky;\nuniform vec3 uDeep;\nuniform vec3 uShallow;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        // 깊이: 가운데 짙고 둑 쪽 옅게, 가장자리엔 가는 물거품
        diffuseColor.rgb = mix(uDeep, uShallow, smoothstep(0.45, 1.0, vAcross));
        diffuseColor.rgb += vec3(0.16, 0.19, 0.19) * smoothstep(0.9, 1.0, vAcross) * (0.6 + 0.4 * sin(vWater.x * 9.0 + uTime * 1.5));`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        {
          // 여러 방향 · 크기의 물결 기울기로 법선을 흔든다 — 흐르는 방향(+x)으로 조금 더 빠르게
          vec2 p = vWater;
          float t = uTime;
          vec2 g = vec2(0.0);
          g += vec2(1.0, 0.25) * cos(dot(p, vec2(1.0, 0.25)) * 2.7 - t * 1.4) * 0.08;
          g += vec2(-0.35, 1.0) * cos(dot(p, vec2(-0.35, 1.0)) * 4.3 + t * 1.1) * 0.055;
          g += vec2(0.7, -0.75) * cos(dot(p, vec2(0.7, -0.75)) * 7.1 - t * 1.9) * 0.04;
          g += vec2(0.15, 1.0) * cos(dot(p, vec2(0.15, 1.0)) * 12.0 + t * 2.4) * 0.025;
          g *= 1.0 - 0.5 * smoothstep(0.85, 1.0, vAcross);
          normal = normalize(normal + (viewMatrix * vec4(-g.x, 0.0, -g.y, 0.0)).xyz);
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          // 비스듬히 볼수록 하늘빛 (밤에는 어두운 하늘) + 밤에 도시 불빛이 물결 위에 가늘게 반짝인다
          float fres = pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 3.0);
          totalEmissiveRadiance += uSky * (0.08 + fres * 0.55);
          float a = sin(vWater.x * 2.6 - uTime * 0.8 + sin(vWater.y * 3.1 + uTime * 0.5) * 1.6);
          float b = sin(vWater.x * 1.3 + uTime * 0.55 + vWater.y * 5.2);
          totalEmissiveRadiance += vec3(1.0, 0.86, 0.66) * pow(max(0.0, a * b), 9.0) * uNight * 0.18;
        }`,
      );
  };
  return { material, uniforms };
}

function tickWater(uniforms: { uTime: { value: number }; uNight: { value: number }; uSky: { value: THREE.Color } }, t: number, dark: number) {
  uniforms.uTime.value = t;
  uniforms.uNight.value = dark;
  uniforms.uSky.value.copy(WATER.skyDay).lerp(WATER.skyNight, dark);
}

/** 강 중심선을 따라가는 띠 (off: 중심에서 떨어진 거리, w: 띠 폭) — 물은 가운데 줄을 더해 깊이(aAcross)를 싣는다 */
function riverRibbon(off: number, w: number, y: number, water = false) {
  const cols = water ? [-1, 0, 1] : [-1, 1];
  const pos: number[] = [];
  const across: number[] = [];
  const idx: number[] = [];
  const k = cols.length;
  let n = 0;
  for (let x = CITY.x0; x <= CITY.x1 + 0.01; x += 0.5) {
    const z = riverZ(x) + off;
    for (const c of cols) {
      pos.push(x, y, z + (c * w) / 2);
      across.push(Math.abs(c));
    }
    if (n > 0)
      for (let j = 0; j < k - 1; j++) {
        const a0 = (n - 1) * k + j;
        const c0 = n * k + j;
        idx.push(a0, a0 + 1, c0, a0 + 1, c0 + 1, c0); // 윗면이 위를 보게
      }
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aAcross", new THREE.Float32BufferAttribute(across, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** 연못: 원판 (가운데 0 ~ 가장자리 1) */
function pondGeometry() {
  const g = new THREE.CircleGeometry(1, 32);
  const pos = g.attributes.position;
  g.setAttribute("aAcross", new THREE.Float32BufferAttribute(Array.from({ length: pos.count }, (_, i) => Math.hypot(pos.getX(i), pos.getY(i))), 1));
  return g;
}

/** 강을 건너는 곳마다 다리 (도로 방향으로 놓인 상판 + 난간) */
function bridgeSpots(roads: Road[]) {
  const out: { x: number; z: number; angle: number; w: number; len: number }[] = [];
  for (const r of roads) {
    const { dx, dz, len } = roadDir(r);
    for (let t = 0; t < len; t += 0.25) {
      const x = r.a[0] + dx * t;
      const z = r.a[1] + dz * t;
      if (riverGap(x, z) < 0.15) {
        out.push({ x, z, angle: Math.atan2(-dz, dx), w: r.w, len: (RIVER_W + BANK * 2) / Math.max(0.3, Math.abs(dz)) });
        break;
      }
    }
  }
  return out;
}

function River({ roads, ponds }: { roads: Road[]; ponds: Ellipse[] }) {
  const sim = useSim();
  const { material, uniforms } = useMemo(() => createWaterMaterial(), []);
  useFrame(({ clock }) => tickWater(uniforms, clock.elapsedTime, sim.current.dark));
  const geo = useMemo(
    () => ({
      water: riverRibbon(0, RIVER_W, WATER_Y, true),
      pond: pondGeometry(),
      banks: [riverRibbon(-RIVER_W / 2, 0.1, GROUND_Y + 0.03), riverRibbon(RIVER_W / 2, 0.1, GROUND_Y + 0.03)],
    }),
    [],
  );
  const bridges = useMemo(() => bridgeSpots(roads), [roads]);
  return (
    <group>
      <mesh geometry={geo.water} material={material} />
      {/* 공원 연못도 같은 물 */}
      {ponds.map((e, i) => (
        <mesh key={i} geometry={geo.pond} position={[e.x, WATER_Y, e.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[e.rx, e.rz, 1]} material={material} />
      ))}
      {/* 둑 가장자리 */}
      {geo.banks.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#6a767d" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {bridges.map((b, i) => (
        // 상판의 길이 방향 = 도로 방향 (로컬 x)
        <group key={i} position={[b.x, GROUND_Y, b.z]} rotation={[0, b.angle, 0]}>
          <mesh position={[0, 0.02, 0]} receiveShadow>
            <boxGeometry args={[b.len, 0.05, b.w + 0.5]} />
            <meshStandardMaterial color="#1f282c" roughness={0.85} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, 0.08, side * (b.w / 2 + 0.22)]}>
              <boxGeometry args={[b.len, 0.07, 0.04]} />
              <meshStandardMaterial color="#8a969c" metalness={0.4} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── 전체 ─────────────────────────────────────────────────────────── */

export default function CityContext() {
  const city = useMemo(() => {
    const roads = cityRoads();
    // 고가 램프는 지역 동쪽 남북 도로(x ≈ 40)에 내려앉는다
    const ramp = roads.filter((r) => isAxisZ(r) && r.a[0] > 25).reduce((best, r) => (Math.abs(r.a[0] - 40) < Math.abs(best - 40) ? r.a[0] : best), 40);
    const hws = highwayPlan(GROUND_Y, ramp);
    const lots = cityLots(roads, hws);
    const ponds = lots.parks.flatMap((p) => (p.pond ? [p.pond] : []));
    // 고가 기둥은 길 · 지역 위에는 세우지 않는다
    const avoid = (x: number, z: number) => insidePlate(x, z, 0.3) || roads.some((r) => roadGap(r, x, z) < r.w / 2 + 0.15);
    return { roads, hws, avoid, lots, ponds, ground: groundTexture(roads, lots.parks), lamps: lampSpots(roads, lots.parkLamps), cars: cityCars(roads) };
  }, []);
  const W = CITY.x1 - CITY.x0;
  const D = CITY.z1 - CITY.z0;
  return (
    <group>
      <mesh position={[(CITY.x0 + CITY.x1) / 2, GROUND_Y, (CITY.z0 + CITY.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={city.ground} roughness={0.95} />
      </mesh>
      <River roads={city.roads} ponds={city.ponds} />
      <Highways hws={city.hws} groundY={GROUND_Y} avoid={city.avoid} />
      <Props node="Bench" matrices={city.lots.benches} roughness={0.7} cast={false} />
      <Buildings boxes={city.lots.boxes} roofs={city.lots.roofs} />
      <Trees trees={city.lots.trees} />
      <StreetLamps spots={city.lamps.spots} reflections={city.lamps.reflections} />
      <CityTraffic cars={city.cars} />
    </group>
  );
}
