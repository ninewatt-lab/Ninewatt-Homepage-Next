/**
 * Blender 로 만든 히어로 설비 모델 (scripts/hero-models/build_hero_models.py).
 * 모델을 고치면 스크립트를 다시 돌리고 파일 이름의 버전(-v1)을 올린다 — 브라우저 캐시를 피하려고.
 *
 * 노드: HeatPump · HeatPumpFan · EssCabinet · TreeA · TreeB
 * 색은 부품 색 × AO 가 꼭짓점 색으로 구워져 있어 vertexColors 재질 하나로 그린다.
 * 모델 좌표는 장면 단위 × 10 이므로 MODEL_SCALE 을 곱해 쓴다.
 */

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export const MODEL_URL = "/models/hero-equipment-v2.glb";
export const MODEL_SCALE = 0.1;

// 장면 코드가 불러와지는 즉시 받기 시작한다 (그동안은 코드 모델이 대신 보인다)
useGLTF.preload(MODEL_URL);

export type ModelNode = "HeatPump" | "HeatPumpFan" | "EssCabinet" | "TreeA" | "TreeB";

export function useModelGeometry(name: ModelNode) {
  const { nodes } = useGLTF(MODEL_URL);
  return (nodes[name] as THREE.Mesh).geometry;
}

export function useModelMaterial(roughness = 0.55, metalness = 0.15) {
  return useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness, metalness }), [roughness, metalness]);
}

/** 설비 위치 행렬 × 모델 축척 */
export function scaled(unit: THREE.Matrix4, s = MODEL_SCALE) {
  return unit.clone().multiply(new THREE.Matrix4().makeScale(s, s, s));
}
