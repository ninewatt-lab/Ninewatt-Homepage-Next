"use client";

/**
 * Blender 로 만든 Product 지역 소품 모델 (scripts/district-models/build_district_models.py).
 * 모델을 고치면 스크립트를 다시 돌리고 파일 이름의 버전(-v1)을 올린다 — 브라우저 캐시를 피하려고.
 * 색은 부품 색 × AO 가 꼭짓점 색으로 구워져 있다. 인스턴스 색을 주면 그 위에 곱해진다(차 색 등).
 * 모델 단위는 m 이고 지역은 1 unit = 10 m 이라 0.1 배가 실제 크기 — 작은 소품은 보이도록 조금 키워 쓴다.
 */

import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { useModelMaterial } from "@/components/hero/models";

export const PROPS_URL = "/models/district-props-v1.glb";

useGLTF.preload(PROPS_URL);

export type PropNode = "Car" | "LampPost" | "PowerPole" | "PowerPoleTx" | "Transformer" | "Bench" | "Playground" | "Restroom";

function PropMesh({
  node,
  matrices,
  colors,
  roughness,
  metalness,
  meshRef,
  cast,
}: {
  node: PropNode;
  matrices: THREE.Matrix4[];
  colors?: THREE.Color[];
  roughness: number;
  metalness: number;
  meshRef?: (m: THREE.InstancedMesh | null) => void;
  cast: boolean;
}) {
  const { nodes } = useGLTF(PROPS_URL);
  const geometry = (nodes[node] as THREE.Mesh).geometry;
  const material = useModelMaterial(roughness, metalness);
  return (
    <instancedMesh
      ref={(mesh) => {
        meshRef?.(mesh);
        if (!mesh) return;
        matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
        colors?.forEach((c, i) => mesh.setColorAt(i, c));
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.computeBoundingSphere();
      }}
      args={[geometry, material, matrices.length]}
      castShadow={cast}
      receiveShadow
      frustumCulled={!meshRef}
    />
  );
}

/** 같은 소품 여러 개 (모델을 받기 전에는 비워 둔다 — 등장 연출 중에 대개 도착한다) */
export function Props({
  node,
  matrices,
  colors,
  roughness = 0.6,
  metalness = 0.1,
  meshRef,
  cast = true,
}: {
  node: PropNode;
  matrices: THREE.Matrix4[];
  colors?: THREE.Color[];
  roughness?: number;
  metalness?: number;
  /** 매 프레임 움직이는 소품(차)은 ref 로 행렬을 직접 바꾼다 */
  meshRef?: (m: THREE.InstancedMesh | null) => void;
  cast?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <PropMesh node={node} matrices={matrices} colors={colors} roughness={roughness} metalness={metalness} meshRef={meshRef} cast={cast} />
    </Suspense>
  );
}

/** 차 색 (밝은 차체에 곱한다) */
export const CAR_COLORS = ["#f4f6f6", "#a9b4b9", "#4a5459", "#7b93a1", "#b5574a", "#ddd5c5", "#2f383c"].map((c) => new THREE.Color(c));
