"use client";

/**
 * 유리 커튼월 건물 몸체 (홈 히어로 건물과 같은 말투) — 층마다 짙은 금속 스팬드럴 띠, 비치는 유리, 1.7 m 간격 금속 멀리언,
 * 그 안쪽 어두운 실내와 칸(bay)마다 켜지는 천장 조명. 운영(BEMS) 건물이 쓴다.
 * 조명: 재실(uOcc)보다 기준이 낮은 칸이 켜지고, 사람이 없어도 켜 둔 칸(uLeft)이 더해진다. 밤일수록 밝다(uDark).
 */

import { useMemo } from "react";
import * as THREE from "three";
import { louverTexture } from "@/components/hero/textures";
import type { GrSpec } from "./grModel";
import { COLORS } from "./Shell";
import { glossGlass, glossMetal } from "./gloss";

const MODULE = 0.17;
const SPANDREL = 0.05;

const lightVertex = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormalObj;
  void main() {
    vPos = position;
    vNormalObj = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lightFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOcc;
  uniform float uLeft;
  uniform float uDark;
  uniform float uFh;
  uniform float uModule;
  uniform float uSpandrel;
  varying vec3 vPos;
  varying vec3 vNormalObj;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    if (abs(vNormalObj.y) > 0.5) discard;
    float along = abs(vNormalObj.z) > 0.5 ? vPos.x : vPos.z;
    float face = dot(vNormalObj, vec3(1.0, 3.0, 7.0));
    float fl = floor(vPos.y / uFh);
    float ly = fract(vPos.y / uFh) * uFh;
    float k = floor(along / uModule);
    float bx = fract(along / uModule);
    float th = hash(k * 12.9898 + fl * 78.233 + face * 3.7);
    float lit = smoothstep(th - 0.04, th + 0.04, uOcc);
    // 사람이 없는데 켜 둔 칸 (BEMS 조명 자동 소등 단계에서 줄어든다)
    float left = step(th, uLeft) * step(uOcc, th);
    float on = max(lit, left);
    float bay = smoothstep(0.0, 0.12, bx) * smoothstep(1.0, 0.88, bx);
    float band = step(uSpandrel, ly);
    float ceiling = mix(0.45, 1.0, (ly - uSpandrel) / (uFh - uSpandrel));
    // 칸마다 밝기 · 색온도가 조금씩 달라 한 장의 판이 아니라 불 켜진 방들로 읽힌다
    float level = mix(0.45, 1.0, hash(k * 7.13 + fl * 3.1 + face));
    vec3 tint = mix(uColor, vec3(1.0, 0.95, 0.88), step(0.7, hash(k * 1.7 + fl * 9.2 + face)));
    gl_FragColor = vec4(tint * on * bay * band * ceiling * level * (0.01 + uDark * 0.5), 1.0);
  }
`;

export function curtainLightMaterial(s: GrSpec) {
  return new THREE.ShaderMaterial({
    vertexShader: lightVertex,
    fragmentShader: lightFragment,
    uniforms: {
      uColor: { value: new THREE.Color("#ffdcae") },
      uOcc: { value: 0 },
      uLeft: { value: 0 },
      uDark: { value: 0 },
      uFh: { value: s.fh },
      uModule: { value: MODULE },
      uSpandrel: { value: SPANDREL },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
}

export function setCurtainLights(m: THREE.ShaderMaterial, occ: number, left: number, dark: number) {
  m.uniforms.uOcc.value = occ;
  m.uniforms.uLeft.value = left;
  m.uniforms.uDark.value = dark;
}

export function Curtain({ s, lights }: { s: GrSpec; lights: THREE.ShaderMaterial }) {
  const h = s.floors * s.fh;
  const mullions = useMemo(() => {
    const list: THREE.Matrix4[] = [];
    const out = 0.006;
    for (const [len, fixed, alongX] of [
      [s.w, s.d / 2 + out, true],
      [s.w, -s.d / 2 - out, true],
      [s.d, s.w / 2 + out, false],
      [s.d, -s.w / 2 - out, false],
    ] as const) {
      const n = Math.round(len / MODULE);
      for (let k = 0; k <= n; k++) {
        const t = -len / 2 + (k * len) / n;
        const corner = k === 0 || k === n;
        list.push(new THREE.Matrix4().compose(new THREE.Vector3(alongX ? t : fixed, h / 2, alongX ? fixed : t), new THREE.Quaternion(), new THREE.Vector3(corner ? 2 : 1, 1, corner ? 2 : 1)));
      }
    }
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.008, h, 0.008), glossMetal({ color: COLORS.metal }), list.length);
    list.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.castShadow = true;
    mesh.computeBoundingSphere();
    return mesh;
  }, [s, h]);
  const louver = useMemo(() => louverTexture("#53656b", "#2c3a3f"), []);
  const mats = useMemo(() => ({ spandrel: glossMetal({ color: "#26363c" }), glass: glossGlass({ color: "#3d6d7b", transparent: true, opacity: 0.6, depthWrite: false }) }), []);

  return (
    <group>
      {/* 실내 (어두운 방) · 천장 조명 */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[s.w - 0.03, h - 0.01, s.d - 0.03]} />
        <meshStandardMaterial color="#1a2a31" roughness={1} />
      </mesh>
      <mesh position={[0, h / 2, 0]} material={lights} renderOrder={1}>
        <boxGeometry args={[s.w - 0.025, h - 0.008, s.d - 0.025]} />
      </mesh>
      {/* 층 슬래브 + 스팬드럴 띠 */}
      {Array.from({ length: s.floors + 1 }, (_, f) => (
        <mesh key={f} position={[0, f * s.fh + SPANDREL / 2 - (f === s.floors ? SPANDREL : 0), 0]} castShadow receiveShadow>
          <boxGeometry args={[s.w + 0.014, SPANDREL, s.d + 0.014]} />
          <primitive object={mats.spandrel} attach="material" />
        </mesh>
      ))}
      {/* 유리 — 그림자는 건물 덩어리로 떨어지게 유리도 드리운다 */}
      <mesh position={[0, h / 2, 0]} castShadow renderOrder={2}>
        <boxGeometry args={[s.w, h, s.d]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      <primitive object={mullions} />
      {/* 옥상: 슬래브 · 파라펫 · 기계실 루버 차폐벽 */}
      <mesh position={[0, h + 0.004, 0]} receiveShadow>
        <boxGeometry args={[s.w + 0.014, 0.008, s.d + 0.014]} />
        <meshStandardMaterial color={COLORS.roof} roughness={0.85} />
      </mesh>
      {[
        [0, s.d / 2, s.w + 0.014, 0.012],
        [0, -s.d / 2, s.w + 0.014, 0.012],
        [s.w / 2, 0, 0.012, s.d + 0.014],
        [-s.w / 2, 0, 0.012, s.d + 0.014],
      ].map(([x, z, sx, sz], i) => (
        <mesh key={i} position={[x, h + 0.035, z]} castShadow>
          <boxGeometry args={[sx, 0.05, sz]} />
          <meshStandardMaterial color="#2f4047" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[-s.w * 0.12, h + 0.08, -s.d * 0.08]} castShadow receiveShadow>
        <boxGeometry args={[s.w * 0.36, 0.15, s.d * 0.4]} />
        <meshStandardMaterial map={louver} metalness={0.4} roughness={0.55} />
      </mesh>
    </group>
  );
}
