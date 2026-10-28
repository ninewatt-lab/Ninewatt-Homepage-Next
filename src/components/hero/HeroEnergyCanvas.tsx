"use client";

import { useEffect, useRef } from "react";

// 업무용 건물의 시간대별 전력 부하 (하루 최대 대비, 0~23시)
// 새벽 대기전력 → 출근 램프업 → 점심 저점 → 오후 피크 → 퇴근 후 감소
const LOAD_PROFILE = [
  0.18, 0.16, 0.15, 0.15, 0.16, 0.2, 0.3, 0.48, 0.72, 0.88, 0.94, 0.96,
  0.82, 0.92, 0.98, 1, 0.96, 0.86, 0.66, 0.48, 0.36, 0.28, 0.22, 0.2,
];
const CYCLE_SECONDS = 42; // 하루 24시간을 한 바퀴
const START_HOUR = 5.5; // 첫 화면은 불이 켜지기 시작하는 새벽부터
const STATIC_HOUR = 14; // 움직임 줄이기 설정에서 보여줄 시각
const FRAME_INTERVAL = 1000 / 30;
const EASE_SECONDS = 0.6; // 창 하나가 켜지고 꺼지는 데 걸리는 시간
const LEVELS = 24; // 창 밝기 단계 (같은 단계끼리 한 번에 그린다)

const TEAL = "73,182,202"; // --primary (dark)
const WARM = "236,204,150"; // 일부 창은 실제 조명처럼 따뜻한 색

type Layer = {
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
  minGap: number;
  maxGap: number;
  cellW: number;
  cellH: number;
  winW: number;
  winH: number;
  fill: string;
  stroke: string;
  slab: string;
  offAlpha: number;
  onAlpha: number;
};

// 사진 같은 야경이 아니라 입면도처럼 — 얇은 외곽선 · 층 슬래브 선 · 가로로 긴 띠창
// 0: 뒤쪽(높고 흐림), 1: 앞쪽(낮고 선명)
const LAYERS: Layer[] = [
  { minH: 0.42, maxH: 0.8, minW: 70, maxW: 140, minGap: 10, maxGap: 34, cellW: 10, cellH: 9, winW: 7.5, winH: 2, fill: "#07131a", stroke: "rgba(133,210,224,0.09)", slab: "rgba(133,210,224,0.025)", offAlpha: 0.025, onAlpha: 0.24 },
  { minH: 0.2, maxH: 0.5, minW: 110, maxW: 210, minGap: 26, maxGap: 70, cellW: 15, cellH: 13, winW: 11.5, winH: 3, fill: "#08161e", stroke: "rgba(133,210,224,0.2)", slab: "rgba(133,210,224,0.045)", offAlpha: 0.035, onAlpha: 0.5 },
];

type Win = {
  x: number;
  y: number;
  w: number;
  h: number;
  layer: number;
  threshold: number;
  lag: number;
  warm: boolean;
  b: number;
};

type Scene = {
  width: number;
  height: number;
  back: HTMLCanvasElement;
  front: HTMLCanvasElement;
  windows: Win[];
};

function loadAt(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  const i = Math.floor(h);
  const s = (1 - Math.cos((h - i) * Math.PI)) / 2;
  return LOAD_PROFILE[i] + (LOAD_PROFILE[(i + 1) % 24] - LOAD_PROFILE[i]) * s;
}

// 화면 크기가 바뀌어도 같은 스카이라인이 나오도록 고정 시드
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(width: number, height: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.round(width * dpr);
  c.height = Math.round(height * dpr);
  const ctx = c.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, ctx };
}

function buildScene(width: number, height: number, dpr: number): Scene {
  const rand = seeded(9);
  const between = (a: number, b: number) => a + (b - a) * rand();
  const u = Math.min(Math.max(height / 900, 0.75), 1.25);
  const windows: Win[] = [];

  const back = makeCanvas(width, height, dpr);
  const sky = back.ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#050d13");
  sky.addColorStop(1, "#0a1a23");
  back.ctx.fillStyle = sky;
  back.ctx.fillRect(0, 0, width, height);
  const glow = back.ctx.createRadialGradient(width / 2, height, 0, width / 2, height, Math.max(width, height) * 0.7);
  glow.addColorStop(0, `rgba(${TEAL},0.10)`);
  glow.addColorStop(1, `rgba(${TEAL},0)`);
  back.ctx.fillStyle = glow;
  back.ctx.fillRect(0, 0, width, height);

  const front = makeCanvas(width, height, dpr);

  LAYERS.forEach((layer, li) => {
    const ctx = li === 0 ? back.ctx : front.ctx;
    let x = -between(0, 40) * u;
    while (x < width) {
      const w = between(layer.minW, layer.maxW) * u;
      const h = between(layer.minH, layer.maxH) * height;
      const top = height - h;

      // 일부 건물은 위층이 좁아지는 셋백 형태
      const sections: { x: number; y: number; w: number; h: number }[] = [];
      if (rand() < 0.35) {
        const towerH = h * between(0.15, 0.3);
        const inset = w * between(0.12, 0.22);
        sections.push({ x: x + inset, y: top, w: w - inset * 2, h: towerH });
        sections.push({ x, y: top + towerH, w, h: h - towerH });
      } else {
        sections.push({ x, y: top, w, h });
      }

      ctx.fillStyle = layer.fill;
      ctx.strokeStyle = layer.stroke;
      ctx.lineWidth = 1;
      for (const s of sections) {
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h);
      }
      if (h > height * 0.45 && rand() < 0.5) {
        const ax = sections[0].x + sections[0].w * between(0.3, 0.7);
        ctx.beginPath();
        ctx.moveTo(ax + 0.5, top);
        ctx.lineTo(ax + 0.5, top - between(18, 40) * u);
        ctx.stroke();
      }

      const cellW = layer.cellW * u;
      const cellH = layer.cellH * u;
      const pad = 6 * u;
      for (const s of sections) {
        const cols = Math.floor((s.w - pad * 2) / cellW);
        const rows = Math.floor((s.h - pad * 2 - 12 * u) / cellH);
        const offsetX = s.x + (s.w - cols * cellW) / 2 + (cellW - layer.winW * u) / 2;
        ctx.strokeStyle = layer.slab;
        ctx.beginPath();
        for (let r = 1; r <= rows; r++) {
          const y = Math.round(s.y + pad + r * cellH - (cellH - layer.winH * u) / 2) + 0.5;
          ctx.moveTo(s.x + 1, y);
          ctx.lineTo(s.x + s.w - 1, y);
        }
        ctx.stroke();
        for (let r = 0; r < rows; r++) {
          // 층 단위 성격: 24시간 켜진 층(서버실 · 관제실), 비어 있는 층
          const floorRoll = rand();
          const always = floorRoll < 0.035;
          const vacant = floorRoll > 0.95;
          for (let c = 0; c < cols; c++) {
            windows.push({
              x: offsetX + c * cellW,
              y: s.y + pad + r * cellH,
              w: layer.winW * u,
              h: layer.winH * u,
              layer: li,
              threshold: always ? -1 : vacant ? 9 : 0.12 + rand(),
              lag: (rand() - 0.5) * 1.6,
              warm: rand() < 0.14,
              b: 0,
            });
          }
        }
      }

      x += w + between(layer.minGap, layer.maxGap) * u;
    }
  });

  return { width, height, back: back.c, front: front.c, windows };
}

export default function HeroEnergyCanvas({ paused = false }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const controlsRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) controlsRef.current?.stop();
    else controlsRef.current?.start();
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const buckets: number[][] = Array.from({ length: LAYERS.length * 2 * LEVELS }, () => []);
    let scene: Scene | null = null;
    let dpr = 1;
    let hour = reducedMotion ? STATIC_HOUR : START_HOUR;
    let visible = true;
    let raf = 0;
    let last = 0;

    const draw = (dt: number) => {
      if (!scene) return;
      const { width, height, windows } = scene;
      const ease = dt <= 0 ? 1 : 1 - Math.exp(-dt / EASE_SECONDS);

      for (const bucket of buckets) bucket.length = 0;
      for (let i = 0; i < windows.length; i++) {
        const win = windows[i];
        const target = loadAt(hour + win.lag) > win.threshold ? 1 : 0;
        win.b += (target - win.b) * ease;
        const level = Math.round(win.b * (LEVELS - 1));
        buckets[(win.layer * 2 + (win.warm ? 1 : 0)) * LEVELS + level].push(i);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(scene.back, 0, 0, width, height);
      for (let li = 0; li < LAYERS.length; li++) {
        if (li === 1) ctx.drawImage(scene.front, 0, 0, width, height);
        const { offAlpha, onAlpha } = LAYERS[li];
        for (let warm = 0; warm < 2; warm++) {
          for (let level = 0; level < LEVELS; level++) {
            const bucket = buckets[(li * 2 + warm) * LEVELS + level];
            if (bucket.length === 0) continue;
            const alpha = offAlpha + (onAlpha - offAlpha) * (level / (LEVELS - 1));
            ctx.fillStyle = `rgba(${warm ? WARM : TEAL},${alpha.toFixed(3)})`;
            ctx.beginPath();
            for (const i of bucket) {
              const win = windows[i];
              ctx.rect(win.x, win.y, win.w, win.h);
            }
            ctx.fill();
          }
        }
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_INTERVAL) return;
      const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      hour += (dt / CYCLE_SECONDS) * 24;
      draw(dt);
    };

    const start = () => {
      if (raf || reducedMotion || pausedRef.current || !visible) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      scene = buildScene(width, height, dpr);
      // 새로 만든 창도 지금 시각의 상태로 바로 맞춘다
      draw(0);
      canvas.style.opacity = "1";
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // 화면 밖에서는 그리지 않는다
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    controlsRef.current = { start, stop };
    start();
    return () => {
      stop();
      controlsRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
    />
  );
}
