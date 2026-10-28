"use client";

/**
 * Blender 로 만든 Product 지역 소품 모델 (scripts/district-models/build_district_models.py).
 * 모델을 고치면 스크립트를 다시 돌리고 파일 이름의 버전(-v1)을 올린다 — 브라우저 캐시를 피하려고.
 * 색은 부품 색 × AO 가 꼭짓점 색으로 구워져 있다. 인스턴스 색을 주면 그 위에 곱해진다(차 색 등).
 * 모델 단위는 m 이고 지역은 1 unit = 10 m 이라 0.1 배가 실제 크기 — 작은 소품은 보이도록 조금 키워 쓴다.
 */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useModelMaterial } from "@/components/hero/models";
import { useSim } from "@/components/hero/heroSim";

export const PROPS_URL = "/models/district-props-v2.glb";

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

/* ── 건물 (몸체 · 유리 · 밤에 켜지는 창) ─────────────────────────── */

export type BuildingNode = "Tower" | "OldBuilding" | "MidOffice" | "ShopHouse" | "SmallBlock";

const WINDOW_LIGHT = new THREE.Color("#ffd9a8");

function BuildingMeshes({ node, x, z }: { node: BuildingNode; x: number; z: number }) {
  const sim = useSim();
  const { nodes } = useGLTF(PROPS_URL);
  const body = useModelMaterial(0.7, 0.05);
  const glass = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.55, roughness: 0.1, envMapIntensity: 1.4 }), []);
  const lit = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    // 해가 지면 켜진 창이 빛난다 (빛 번짐이 있으니 세지 않게)
    if (lit.current) lit.current.emissiveIntensity = 0.02 + sim.current.dark * 0.85;
  });
  const geo = (k: string) => (nodes[k] as THREE.Mesh).geometry;
  return (
    <group position={[x, 0, z]} scale={0.1}>
      <mesh geometry={geo(node)} material={body} castShadow receiveShadow />
      <mesh geometry={geo(node + "Glass")} material={glass} castShadow receiveShadow />
      <mesh geometry={geo(node + "Lit")} castShadow receiveShadow>
        <meshStandardMaterial ref={lit} vertexColors emissive={WINDOW_LIGHT} metalness={0.3} roughness={0.25} />
      </mesh>
    </group>
  );
}

/** Blender 건물 — 모델을 받기 전에는 fallback(창 무늬 상자)이 대신 보인다 */
export function BuildingModel({ node, x, z, fallback }: { node: BuildingNode; x: number; z: number; fallback: ReactNode }) {
  return (
    <Suspense fallback={fallback}>
      <BuildingMeshes node={node} x={x} z={z} />
    </Suspense>
  );
}
