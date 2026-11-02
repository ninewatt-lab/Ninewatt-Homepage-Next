/**
 * 그린리모델링 예시 건물의 EnergyPlus 결과 (scripts/green-remodeling/energy.py → src/data/green-remodeling.json).
 * React · three.js 없이 — 서버 컴포넌트(페이지 아래 카드)에서도 쓴다.
 */

import energy from "@/data/green-remodeling.json";

export type GrKey = "envelope" | "systems" | "roof" | "operations";
export const GR_ORDER: GrKey[] = ["envelope", "systems", "roof", "operations"];

export type GrEnergy = (typeof energy.buildings)[GrKey];
export const GR_ENERGY = energy.buildings as Record<GrKey, GrEnergy>;
export const GR_FACTORS = energy.factors;
