"use client";

/**
 * Product 지역 후처리 — 빛 번짐(밤의 창 · 가로등 · 전조등) + 색 보정(가장자리 비네트, 낮은 차갑게 · 해 질 녘은 따뜻하게).
 * three.js 기본 패스만 쓴다(추가 라이브러리 없음). 성능이 떨어지면 DistrictScene 이 이 컴포넌트를 빼서 일반 렌더로 돌아간다.
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useSim } from "@/components/hero/heroSim";

// 마지막 패스 하나로: 톤매핑(ACES) → sRGB → 색 보정 · 비네트 (OutputPass + 보정 패스를 합쳐 전체 화면 패스를 하나 줄인다)
const FinalShader = {
  uniforms: {
    tDiffuse: { value: null },
    toneMappingExposure: { value: 1 },
    uVignette: { value: 0.32 },
    uWarm: { value: 0 },
    uDark: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    #include <tonemapping_pars_fragment>
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uWarm;
    uniform float uDark;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      c.rgb = ACESFilmicToneMapping(c.rgb);
      c = sRGBTransferOETF(c);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      // 어두운 곳은 살짝 청록, 밝은 곳은 해 질 녘에 따뜻하게
      vec3 shadowTint = mix(vec3(1.0), vec3(0.94, 1.0, 1.04), (1.0 - l) * 0.6);
      vec3 lightTint = mix(vec3(1.0), vec3(1.06, 1.0, 0.92), l * uWarm);
      c.rgb *= shadowTint * lightTint;
      // 대비를 약간 (밤에는 조금 더)
      c.rgb = mix(vec3(l), c.rgb, 1.04 + uDark * 0.06);
      c.rgb = (c.rgb - 0.5) * (1.04 + uDark * 0.04) + 0.5;
      vec2 d = vUv - 0.5;
      c.rgb *= 1.0 - uVignette * smoothstep(0.35, 0.85, length(d * vec2(1.15, 1.0)));
      gl_FragColor = vec4(clamp(c.rgb, 0.0, 1.0), 1.0);
    }
  `,
};

type Fx = { composer: EffectComposer; bloom: UnrealBloomPass; grade: ShaderPass };

function stepFx(fx: Fx, dark: number, sunAlt: number, delta: number) {
  // 낮에는 아주 약하게, 밤에는 빛이 번진다
  fx.bloom.strength = 0.08 + dark * 0.42;
  fx.bloom.threshold = 0.9 - dark * 0.12;
  const u = fx.grade.uniforms;
  u.uDark.value = dark;
  u.uWarm.value = Math.exp(-Math.pow((sunAlt - 0.1) / 0.22, 2)) * 0.8;
  fx.composer.render(delta);
}

function resizeFx(fx: Fx, w: number, h: number, dpr: number) {
  fx.composer.setPixelRatio(dpr);
  fx.composer.setSize(w, h);
  // 번짐은 흐릿한 효과라 CSS 픽셀 해상도면 충분하다 (고해상도 화면에서도 비용을 줄인다)
  // (composer.setSize 가 기기 픽셀로 키운 번짐 버퍼를 다시 줄인다)
  fx.bloom.setSize(w, h);
}

export default function Effects() {
  const sim = useSim();
  const { gl, scene, camera, size, viewport } = useThree();
  const fx = useMemo<Fx>(() => {
    // 고해상도 화면은 픽셀이 작아 계단 현상이 덜하므로 다중 샘플링을 줄인다
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: gl.getPixelRatio() > 1.4 ? 2 : 4 });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.08, 0.4, 0.9);
    composer.addPass(bloom);
    const grade = new ShaderPass(FinalShader);
    // 톤매핑은 셰이더 안에서 직접 한다 (재질 자동 톤매핑과 겹치지 않게)
    grade.material.toneMapped = false;
    composer.addPass(grade);
    return { composer, bloom, grade };
  }, [gl, scene, camera]);

  useEffect(() => resizeFx(fx, size.width, size.height, viewport.dpr), [fx, size.width, size.height, viewport.dpr]);
  useEffect(() => () => fx.composer.dispose(), [fx]);

  // 우선순위 1: R3F 의 기본 렌더 대신 이 합성기가 그린다
  useFrame((_, delta) => stepFx(fx, sim.current.dark, sim.current.sunAlt, delta), 1);
  return null;
}
