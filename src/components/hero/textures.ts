/**
 * 히어로 3D 재질용 텍스처 — 이미지 파일 없이 캔버스로 그린다.
 * 설비가 화면에서 작게 보이므로, 멀리서도 무엇인지 읽히는 무늬(셀 · 루버 · 핀 · 망)만 넣는다.
 */

import * as THREE from "three";

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
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

function lines(g: CanvasRenderingContext2D, from: number, to: number, step: number, draw: (v: number) => void) {
  g.beginPath();
  for (let v = from; v < to; v += step) draw(v + 0.5);
  g.stroke();
}

/** 태양광 모듈: 셀 격자 + 알루미늄 테두리 */
export function pvTexture() {
  return canvasTexture(96, 64, (g) => {
    g.fillStyle = "#17405a";
    g.fillRect(0, 0, 96, 64);
    g.strokeStyle = "rgba(170,220,235,0.5)";
    g.lineWidth = 1;
    lines(g, 16, 96, 16, (x) => (g.moveTo(x, 0), g.lineTo(x, 64)));
    lines(g, 16, 64, 16, (y) => (g.moveTo(0, y), g.lineTo(96, y)));
    g.strokeStyle = "rgba(225,238,242,0.9)";
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, 93, 61);
  });
}

/** ESS 냉방장치 · 설비 차폐벽: 가로 루버 */
export function louverTexture(base = "#cfd6d9", slat = "#7d8a8f") {
  return canvasTexture(64, 64, (g) => {
    g.fillStyle = base;
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = slat;
    g.lineWidth = 2;
    lines(g, 3, 64, 6, (y) => (g.moveTo(0, y), g.lineTo(64, y)));
  });
}

/** 히트펌프 측면 코일: 촘촘한 세로 핀 */
export function coilTexture() {
  return canvasTexture(64, 64, (g) => {
    g.fillStyle = "#4b555a";
    g.fillRect(0, 0, 64, 64);
    g.strokeStyle = "#6c787d";
    g.lineWidth = 1;
    lines(g, 0, 64, 3, (x) => (g.moveTo(x, 0), g.lineTo(x, 64)));
    g.strokeStyle = "#3a4347";
    g.lineWidth = 4;
    g.strokeRect(2, 2, 60, 60);
  });
}

/** 히트펌프 팬 보호망: 동심원 + 방사선 (투명 배경) */
export function grilleTexture() {
  return canvasTexture(128, 128, (g) => {
    g.strokeStyle = "rgba(205,214,217,0.95)";
    g.lineWidth = 2;
    for (let r = 12; r <= 62; r += 8) {
      g.beginPath();
      g.arc(64, 64, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      g.moveTo(64 + Math.cos(a) * 12, 64 + Math.sin(a) * 12);
      g.lineTo(64 + Math.cos(a) * 62, 64 + Math.sin(a) * 62);
    }
    g.stroke();
  });
}

/** 펜스 메시망 (투명 배경, 반복) */
export function fenceTexture(repeatX: number) {
  return canvasTexture(
    32,
    32,
    (g) => {
      g.strokeStyle = "rgba(170,190,196,1)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, 0.5);
      g.lineTo(32, 0.5);
      g.moveTo(0.5, 0);
      g.lineTo(0.5, 32);
      g.stroke();
    },
    [repeatX, 4],
  );
}

/** 대지 포장: 큰 판석 줄눈 (반복) */
export function pavingTexture(repeat: [number, number]) {
  return canvasTexture(
    64,
    64,
    (g) => {
      g.fillStyle = "#56676d";
      g.fillRect(0, 0, 64, 64);
      g.strokeStyle = "#46565c";
      g.lineWidth = 2;
      g.strokeRect(1, 1, 62, 62);
      g.beginPath();
      g.moveTo(32, 0);
      g.lineTo(32, 64);
      g.stroke();
    },
    repeat,
  );
}
