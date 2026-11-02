"use client";

/**
 * 예시 건물의 광택 — 벽은 유약 바른 타일처럼 코팅 반사가 살짝, 유리는 하늘 · 주변이 또렷이 비친다.
 * 장면의 기본 환경 반사(scene.environmentIntensity)는 지역 전체(도시 · 땅)에 맞춰 아주 약해서,
 * 건물 재질은 같은 환경 지도를 직접 물고(material.envMap) 재질마다 정한 세기로 비춘다. 밤에는 반사를 줄인다.
 */

import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useGrSim } from "./grModel";

type Glossy = THREE.MeshStandardMaterial & { userData: { gloss: number } };

const REGISTRY = new Set<Glossy>();

/** 재질을 광택 목록에 올린다 — gloss: 낮의 환경 반사 세기 */
export function glossy<T extends THREE.MeshStandardMaterial>(m: T, gloss: number): T {
  m.userData.gloss = gloss;
  REGISTRY.add(m as unknown as Glossy);
  return m;
}

/**
 * 밤 경관조명: 밤이 깊을수록 벽이 스스로 은은하게 밝아지고, 바닥에서 쏘아 올린 투광등처럼 아래쪽(높이 1.2 안)이 더 밝다.
 * 낮에는 0 — 낮 모습은 그대로. 세기는 GlossTicker 가 매 프레임 맞춘다 (모든 벽 재질이 같은 값을 나눠 쓴다)
 */
const NIGHT = { value: 0 };

export function addNightLift(sh: { uniforms: Record<string, { value: unknown }>; vertexShader: string; fragmentShader: string }) {
  sh.uniforms.uNightLift = NIGHT;
  sh.vertexShader = sh.vertexShader
    .replace("#include <common>", "#include <common>\nvarying float vLiftY;")
    .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvLiftY = (modelMatrix * vec4(transformed, 1.0)).y;");
  sh.fragmentShader = sh.fragmentShader
    .replace("#include <common>", "#include <common>\nuniform float uNightLift;\nvarying float vLiftY;")
    .replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uNightLift * (0.07 + 0.2 * (1.0 - smoothstep(0.0, 1.2, vLiftY)));",
    );
}

/** 코팅 벽 (유약 타일 · 세라믹 패널) — 밤에는 경관조명 */
export function glossWall(params: THREE.MeshPhysicalMaterialParameters = {}, gloss = 0.55) {
  const m = glossy(new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.85, clearcoatRoughness: 0.12, ...params }), gloss);
  m.onBeforeCompile = addNightLift;
  m.customProgramCacheKey = () => "gr-gloss-wall";
  return m;
}

/**
 * 반사 유리 — 금속처럼 다 비추지 않고 실제 유리처럼: 정면에서는 안이 보이고, 비스듬할수록(프레넬) 하늘 · 주변이 비친다
 */
export function glossGlass(params: THREE.MeshPhysicalMaterialParameters = {}, gloss = 0.85) {
  return glossy(new THREE.MeshPhysicalMaterial({ metalness: 0.05, roughness: 0.03, ior: 1.5, clearcoat: 0.5, clearcoatRoughness: 0.03, ...params }), gloss);
}

/** 금속 (창틀 · 두겁 · 핀) — 벽만큼은 아니어도 밤에 형태가 보이게 */
export function glossMetal(params: THREE.MeshPhysicalMaterialParameters = {}, gloss = 0.9) {
  const m = glossy(new THREE.MeshPhysicalMaterial({ metalness: 0.75, roughness: 0.22, clearcoat: 0.4, ...params }), gloss);
  m.onBeforeCompile = addNightLift;
  m.customProgramCacheKey = () => "gr-gloss-metal";
  return m;
}

function tickGloss(env: THREE.Texture | null, dark: number) {
  NIGHT.value = dark;
  const day = 0.15 + 0.85 * (1 - dark);
  for (const m of REGISTRY) {
    if (env && m.envMap !== env) {
      m.envMap = env;
      m.needsUpdate = true;
    }
    m.envMapIntensity = m.userData.gloss * day;
  }
}

/** 장면에 하나 — 환경 지도를 물리고 해에 맞춰 반사 세기를 바꾼다 */
export function GlossTicker() {
  const sim = useGrSim();
  useFrame(({ scene }) => tickGloss(scene.environment as THREE.Texture | null, sim.current.dark));
  useEffect(() => () => REGISTRY.clear(), []);
  return null;
}
