"use client";

/**
 * 히어로 3D 의 하루 분위기 — 하늘, 해 · 달 조명, 가로등.
 * 위쪽 하늘은 늘 어둡게 둔다(흰 헤드라인 가독성). 해 질 녘에도 지평선 해 쪽만 앰버로 물든다.
 */

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { EQUIPMENT, SITE, SITE_TOP } from "./BuildingModel";
import { PV_PEAK_KW, footprint, reveal, useSim } from "./heroSim";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ── 하늘 ─────────────────────────────────────────────────────────── */

const SKY = {
  topNight: new THREE.Color("#03090e"),
  topDay: new THREE.Color("#071722"),
  horizonNight: new THREE.Color("#07131b"),
  horizonDay: new THREE.Color("#12303c"),
  glow: new THREE.Color("#a8642f"),
};

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uSunDir;
  uniform float uGlowStrength;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, -0.2, 1.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(-0.05, 0.45, h));
    // 해가 있는 쪽 지평선 띠만 물든다
    float toward = max(dot(normalize(vDir.xz + 1e-4), normalize(uSunDir.xz + 1e-4)), 0.0);
    float band = exp(-pow((h - 0.0) / 0.1, 2.0));
    col += uGlow * uGlowStrength * band * (0.25 + 0.75 * pow(toward, 3.0));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sky() {
  const sim = useSim();
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGlow: { value: SKY.glow.clone() },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
      uGlowStrength: { value: 0 },
    }),
    [],
  );

  useFrame(({ scene }) => {
    if (!mesh.current) return;
    const u = (mesh.current.material as THREE.ShaderMaterial).uniforms;
    const { hour, sunAlt } = sim.current;
    const day = smooth(-0.1, 0.35, sunAlt);
    u.uTop.value.copy(SKY.topNight).lerp(SKY.topDay, day);
    u.uHorizon.value.copy(SKY.horizonNight).lerp(SKY.horizonDay, day);
    // 해가 지평선 근처일 때(일출 · 일몰)만 노을
    u.uGlowStrength.value = Math.exp(-Math.pow((sunAlt - 0.02) / 0.16, 2)) * 0.62;
    // 아침은 동쪽(+x), 저녁은 서쪽(-x)
    u.uSunDir.value.set(hour < 12 ? 1 : -1, 0, 0.35);
    // 안개는 지평선 색에 맞춰 멀리 있는 바닥이 하늘로 녹아든다
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(u.uHorizon.value).multiplyScalar(0.75);
  });

  return (
    <mesh ref={mesh} scale={70} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial vertexShader={skyVertex} fragmentShader={skyFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

/* ── 해 · 달 · 주변광 ─────────────────────────────────────────────── */

const SUN_NOON = new THREE.Color("#fff1dc");
const SUN_LOW = new THREE.Color("#ffb06a");
const MOON = new THREE.Color("#a9c2d6");
const HEMI_DAY = new THREE.Color("#bfe6ee");
const HEMI_DUSK = new THREE.Color("#d9b48f");
const HEMI_NIGHT = new THREE.Color("#6f8aa0");

// 해는 동(+x)에서 서(-x)로 낮게 지나가 아침 · 오후 그림자가 건물 좌우로 길게 드리운다
export function Lighting({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const sim = useSim();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame(({ scene }) => {
    const light = sun.current;
    const sky = hemi.current;
    if (!light || !sky) return;
    const { hour, solarKw, sunAlt } = sim.current;
    const day = smooth(-0.05, 0.2, sunAlt);
    const low = 1 - smooth(0.15, 0.6, sunAlt); // 해가 낮을수록 따뜻한 빛

    const a = sunAlt > -0.05 ? ((hour - 6) / 12) * Math.PI : ((((hour - 18) % 24) + 24) % 24 / 12) * Math.PI;
    light.position.set(Math.cos(a) * 12, 1.5 + Math.abs(Math.sin(a)) * 8, 3);
    light.intensity = 0.2 + (0.5 + (solarKw / PV_PEAK_KW) * 1.3) * day;
    light.color.copy(MOON).lerp(tmp.copy(SUN_NOON).lerp(SUN_LOW, low), day);

    sky.intensity = 0.16 + 0.16 * day;
    sky.color.copy(HEMI_NIGHT).lerp(tmp.copy(HEMI_DAY).lerp(HEMI_DUSK, low * 0.6), day);
    scene.environmentIntensity = 0.1 + 0.18 * day;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#bfe6ee", "#0b1c25", 0.32]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
}

/* ── 가로등 · 외부 조명 ───────────────────────────────────────────── */

// 바닥에 떨어지는 빛 웅덩이 (가운데가 밝고 가장자리로 사라지는 원)
function poolTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const [SW, SD] = SITE;
// 광장 가장자리 가로등 (ESS · 출입구를 비켜서)
const LAMPS: [number, number][] = [
  [-0.9, SD / 2 - 0.08],
  [1.25, SD / 2 - 0.08],
  [SW / 2 - 0.08, 0.6],
  [SW / 2 - 0.08, -0.9],
  [1.0, -SD / 2 + 0.08],
  [-0.9, -SD / 2 + 0.08],
  [-SW / 2 + 0.08, 0.1],
];
// 기둥 없는 조명: 캐노피 아래 · ESS 펜스
const EXTRA_POOLS: [number, number, number][] = [
  [0.4, footprint(0)[1] / 2 + 0.22, 0.75],
  [-2.1, 1.75, 0.55],
];
const LAMP_H = 0.32;
const WARM_LIGHT = new THREE.Color("#ffc98a");

export function StreetLights() {
  const sim = useSim();
  const group = useRef<THREE.Group>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const pools = useRef<THREE.InstancedMesh>(null);
  const pool = useMemo(() => poolTexture(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  const poolMatrices = useMemo(() => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    const list = LAMPS.map(([x, z]) => new THREE.Matrix4().compose(new THREE.Vector3(x, SITE_TOP + 0.002, z), q, new THREE.Vector3(0.8, 0.8, 0.8)));
    for (const [x, z, s] of EXTRA_POOLS) list.push(new THREE.Matrix4().compose(new THREE.Vector3(x, SITE_TOP + 0.002, z), q, new THREE.Vector3(s, s, s)));
    return list;
  }, []);

  useFrame(() => {
    const g = group.current;
    const h = heads.current;
    const p = pools.current;
    if (!g || !h || !p) return;
    const s = sim.current;
    const r = reveal(s.intro, EQUIPMENT[0], EQUIPMENT[1]);
    g.visible = r > 0.001;
    // 해가 지면 하나씩 켜진다 (등마다 켜지는 시점이 조금씩 다르다)
    for (let i = 0; i < poolMatrices.length; i++) {
      const on = smooth(0.3 + (i % 5) * 0.05, 0.42 + (i % 5) * 0.05, s.dark) * r;
      if (i < LAMPS.length) h.setColorAt(i, tmp.copy(WARM_LIGHT).multiplyScalar(0.15 + on * 0.85));
      p.setColorAt(i, tmp.copy(WARM_LIGHT).multiplyScalar(on * 0.5));
    }
    if (h.instanceColor) h.instanceColor.needsUpdate = true;
    if (p.instanceColor) p.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={group}>
      {LAMPS.map(([x, z], i) => (
        <mesh key={i} position={[x, SITE_TOP + LAMP_H / 2, z]} castShadow>
          <cylinderGeometry args={[0.005, 0.007, LAMP_H, 6]} />
          <meshStandardMaterial color="#2c383c" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <instancedMesh
        ref={(mesh) => {
          heads.current = mesh;
          if (!mesh) return;
          LAMPS.forEach(([x, z], i) => {
            mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, SITE_TOP + LAMP_H + 0.006, z));
            mesh.setColorAt(i, WARM_LIGHT);
          });
          mesh.instanceMatrix.needsUpdate = true;
        }}
        args={[undefined, undefined, LAMPS.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.045, 0.012, 0.045]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={(mesh) => {
          pools.current = mesh;
          if (!mesh) return;
          poolMatrices.forEach((m, i) => {
            mesh.setMatrixAt(i, m);
            mesh.setColorAt(i, new THREE.Color(0, 0, 0));
          });
          mesh.instanceMatrix.needsUpdate = true;
        }}
        args={[undefined, undefined, poolMatrices.length]}
        frustumCulled={false}
        renderOrder={1}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={pool} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
