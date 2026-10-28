"use client";

/**
 * Product 지역의 길 · 바닥 디테일 — 아스팔트, 노면 표시(중앙선 · 차선 가장자리 · 정지선 · 횡단보도),
 * 연석, 맨홀, 가로수, 접지 그늘(건물 · 차 밑이 바닥에 붙어 보이도록).
 * 누를 수 없는 배경이라 시설 선택과는 상관없다.
 */

import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { useModelGeometry, useModelMaterial } from "@/components/hero/models";
import { Instances, m4 } from "./common";
import { PLATE, ROAD } from "./districtLayout";

const HALF = ROAD.width / 2;
const MARK_Y = 0.032;
/** 교차로 중심에서 횡단보도까지 */
const CROSS_AT = 1.05;
const CROSS_W = 0.34;

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

/** 아스팔트: 골재 알갱이 + 바퀴 자국처럼 살짝 밝은 띠 */
function asphaltTexture(repeat: [number, number]) {
  return canvasTex(
    128,
    128,
    (g) => {
      g.fillStyle = "#20272a";
      g.fillRect(0, 0, 128, 128);
      let s = 9;
      const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 900; i++) {
        const v = 26 + Math.floor(r() * 22);
        g.fillStyle = `rgb(${v},${v + 5},${v + 8})`;
        g.fillRect(r() * 128, r() * 128, 1.4, 1.4);
      }
    },
    repeat,
  );
}

/** 잔디: 깎은 줄무늬 + 얼룩 */
export function grassTexture(repeat: [number, number]) {
  return canvasTex(
    128,
    128,
    (g) => {
      for (let k = 0; k < 8; k++) {
        g.fillStyle = k % 2 ? "#4a6d54" : "#52785c";
        g.fillRect(0, k * 16, 128, 16);
      }
      let s = 5;
      const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = r() > 0.5 ? "rgba(70,100,72,0.35)" : "rgba(98,130,96,0.3)";
        g.beginPath();
        g.arc(r() * 128, r() * 128, 3 + r() * 9, 0, Math.PI * 2);
        g.fill();
      }
    },
    repeat,
  );
}

export function Roads() {
  const ew = useMemo(() => asphaltTexture([PLATE.w / 2, 1]), []);
  const ns = useMemo(() => asphaltTexture([1, PLATE.d / 2]), []);

  const marks = useMemo(() => {
    const white: THREE.Matrix4[] = [];
    const yellow: THREE.Matrix4[] = [];
    // 직선 구간을 교차로 앞뒤 두 토막으로
    const spans = (min: number, max: number, center: number) => [
      [min, center - CROSS_AT - CROSS_W / 2 - 0.05],
      [center + CROSS_AT + CROSS_W / 2 + 0.05, max],
    ];
    for (const [a, b] of spans(-PLATE.w / 2, PLATE.w / 2, ROAD.nsX)) {
      const len = b - a;
      const cx = (a + b) / 2;
      // 중앙선(노란 겹선) · 가장자리 흰 실선
      for (const dz of [-0.035, 0.035]) yellow.push(m4(cx, MARK_Y, ROAD.ewZ + dz, 0, len, 1, 1));
      for (const dz of [-HALF + 0.06, HALF - 0.06]) white.push(m4(cx, MARK_Y, ROAD.ewZ + dz, 0, len, 1, 1));
    }
    for (const [a, b] of spans(-PLATE.d / 2, PLATE.d / 2, ROAD.ewZ)) {
      const len = b - a;
      const cz = (a + b) / 2;
      for (const dx of [-0.035, 0.035]) yellow.push(m4(ROAD.nsX + dx, MARK_Y, cz, Math.PI / 2, len, 1, 1));
      for (const dx of [-HALF + 0.06, HALF - 0.06]) white.push(m4(ROAD.nsX + dx, MARK_Y, cz, Math.PI / 2, len, 1, 1));
    }
    // 횡단보도: 차가 다니는 방향과 나란한 굵은 띠를 길 너비만큼 쌓는다
    const zebra: THREE.Matrix4[] = [];
    for (const s of [-1, 1]) {
      for (let k = 0; k < 8; k++) {
        const off = -HALF + 0.1 + k * 0.143;
        zebra.push(m4(ROAD.nsX + s * CROSS_AT, MARK_Y, ROAD.ewZ + off, 0, CROSS_W, 1, 0.07));
        zebra.push(m4(ROAD.nsX + off, MARK_Y, ROAD.ewZ + s * CROSS_AT, 0, 0.07, 1, CROSS_W));
      }
    }
    // 정지선: 교차로로 들어오는 차선에만
    const stop = CROSS_AT + CROSS_W / 2 + 0.12;
    const stops = [
      m4(ROAD.nsX - stop, MARK_Y, ROAD.ewZ - HALF / 2, 0, 0.05, 1, HALF),
      m4(ROAD.nsX + stop, MARK_Y, ROAD.ewZ + HALF / 2, 0, 0.05, 1, HALF),
      m4(ROAD.nsX + HALF / 2, MARK_Y, ROAD.ewZ - stop, 0, HALF, 1, 0.05),
      m4(ROAD.nsX - HALF / 2, MARK_Y, ROAD.ewZ + stop, 0, HALF, 1, 0.05),
    ];
    return { white: [...white, ...stops], yellow, zebra };
  }, []);

  // 연석: 길 양쪽, 교차로에서 끊긴다
  const curbs = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const gap = HALF + 0.03;
    for (const [a, b] of [
      [-PLATE.w / 2, ROAD.nsX - gap],
      [ROAD.nsX + gap, PLATE.w / 2],
    ])
      for (const s of [-1, 1]) list.push(m4((a + b) / 2, 0.018, ROAD.ewZ + s * (HALF + 0.02), 0, b - a, 1, 1));
    for (const [a, b] of [
      [-PLATE.d / 2, ROAD.ewZ - gap],
      [ROAD.ewZ + gap, PLATE.d / 2],
    ])
      for (const s of [-1, 1]) list.push(m4(ROAD.nsX + s * (HALF + 0.02), 0.018, (a + b) / 2, Math.PI / 2, b - a, 1, 1));
    return list;
  }, []);

  const manholes = useMemo(() => [m4(-6, MARK_Y - 0.001, 0.3), m4(4, MARK_Y - 0.001, -0.3), m4(9.2, MARK_Y - 0.001, 0.25), m4(-1.3, MARK_Y - 0.001, -5), m4(-0.7, MARK_Y - 0.001, 5.4)], []);

  return (
    <group>
      <mesh position={[0, 0.015, ROAD.ewZ]} receiveShadow>
        <boxGeometry args={[PLATE.w, 0.03, ROAD.width]} />
        <meshStandardMaterial map={ew} roughness={0.92} />
      </mesh>
      <mesh position={[ROAD.nsX, 0.016, 0]} receiveShadow>
        <boxGeometry args={[ROAD.width, 0.03, PLATE.d]} />
        <meshStandardMaterial map={ns} roughness={0.92} />
      </mesh>
      <Instances matrices={marks.white} cast={false}>
        <boxGeometry args={[1, 0.004, 0.028]} />
        <meshStandardMaterial color="#d9dcd6" roughness={0.6} />
      </Instances>
      <Instances matrices={marks.yellow} cast={false}>
        <boxGeometry args={[1, 0.004, 0.022]} />
        <meshStandardMaterial color="#d8a93a" roughness={0.6} />
      </Instances>
      <Instances matrices={marks.zebra} cast={false}>
        <boxGeometry args={[1, 0.004, 1]} />
        <meshStandardMaterial color="#e2e4df" roughness={0.6} />
      </Instances>
      <Instances matrices={curbs} cast={false}>
        <boxGeometry args={[1, 0.036, 0.04]} />
        <meshStandardMaterial color="#9ca6a8" roughness={0.85} />
      </Instances>
      <Instances matrices={manholes} cast={false}>
        <cylinderGeometry args={[0.06, 0.06, 0.004, 16]} />
        <meshStandardMaterial color="#3a4144" metalness={0.5} roughness={0.6} />
      </Instances>
    </group>
  );
}

/* ── 가로수 (홈 히어로의 조경수 모델) ──────────────────────────────── */

const STREET_TREES: [number, number, number][] = [
  // 동서 도로 남쪽 · 북쪽 보도
  [0.6, 0.98, 0.9],
  [4.4, 0.98, 1],
  [7.6, 0.98, 0.95],
  [11.4, 0.98, 1],
  [-9.7, -1.15, 1],
  [-5.3, -1.15, 0.95],
  [0.9, -1.15, 1],
  [4.9, -1.15, 0.9],
  [11.6, -1.15, 1],
  // 남북 도로 양쪽 보도
  [-1.86, -6, 1],
  [-1.86, -2.6, 0.9],
  [-0.14, -5.6, 0.95],
  [-0.14, -2.4, 1],
  [-0.14, 4.6, 0.9],
  [-0.14, 7.8, 1],
];

function StreetTreeModels() {
  const a = useModelGeometry("TreeA");
  const b = useModelGeometry("TreeB");
  const material = useModelMaterial(0.85, 0);
  const pick = (i: number) => i % 3 !== 1;
  const make = (want: boolean) =>
    STREET_TREES.filter((_, i) => pick(i) === want).map(([x, z, k], i) => m4(x, 0.01, z, i * 1.3, 0.13 * k, 0.13 * k, 0.13 * k));
  return (
    <>
      <Instances matrices={make(true)}>
        <primitive object={a} attach="geometry" />
        <primitive object={material} attach="material" />
      </Instances>
      <Instances matrices={make(false)}>
        <primitive object={b} attach="geometry" />
        <primitive object={material} attach="material" />
      </Instances>
    </>
  );
}

export function StreetTrees() {
  // 나무 구덩이 (보도에 낸 흙 칸)
  const pits = useMemo(() => STREET_TREES.map(([x, z]) => m4(x, 0.004, z)), []);
  return (
    <group>
      <Instances matrices={pits} cast={false}>
        <boxGeometry args={[0.22, 0.008, 0.22]} />
        <meshStandardMaterial color="#3d3a33" roughness={1} />
      </Instances>
      <Suspense fallback={null}>
        <StreetTreeModels />
      </Suspense>
    </group>
  );
}

/* ── 접지 그늘 ────────────────────────────────────────────────────── */

function contactTexture() {
  return canvasTex(64, 64, (g) => {
    // 가장자리로 갈수록 옅어지는 둥근 사각형
    for (let i = 0; i < 16; i++) {
      const inset = i * 1.6;
      g.fillStyle = `rgba(0,0,0,${0.06 + i * 0.012})`;
      const r = 14 - i * 0.6;
      g.beginPath();
      g.roundRect(inset, inset, 64 - inset * 2, 64 - inset * 2, Math.max(r, 2));
      g.fill();
    }
  });
}

/** 건물 · 소품 밑의 부드러운 그늘 — [x, z, w, d, y] */
export function ContactShadows({ spots, opacity = 0.55 }: { spots: [number, number, number, number, number][]; opacity?: number }) {
  const tex = useMemo(() => contactTexture(), []);
  const m = useMemo(() => spots.map(([x, z, w, d, y]) => m4(x, y, z, 0, w, d, 1, -Math.PI / 2)), [spots]);
  return (
    <Instances matrices={m} cast={false} receive={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} />
    </Instances>
  );
}
