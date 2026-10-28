/**
 * Product 페이지 3D 테마 지역 — 시설 배치와 제품 연결.
 *
 * 1 unit = 10 m. 동서 도로(z = 0)와 남북 도로(x = -1)가 지역을 네 블록으로 나눈다.
 *  북서: 업무 빌딩(BEMS) · 빌딩 ESS(피크저감형)
 *  북동: 태양광 후보지(SolarScope) · 공유형 ESS 단지
 *  남서: 공원(RE:park)
 *  남동: 주차장 지붕형 PV · 리모델링 건물(GreenPlanner) · 지상 태양광 발전소
 * 태양광(지상 · 주차장 · 옥상)은 모두 운영 중인 발전 설비라 PV REMS 로 묶는다.
 */

export type ProductKey = "bems" | "peakEss" | "sharedEss" | "pvRems" | "solarScope" | "greenplanner" | "repark";

export const PRODUCT_ORDER: ProductKey[] = ["bems", "peakEss", "sharedEss", "pvRems", "solarScope", "greenplanner", "repark"];

export const PRODUCT_HREF: Record<ProductKey, string> = {
  bems: "/product/bems",
  peakEss: "/product/peak-ess",
  sharedEss: "/product/shared-ess",
  pvRems: "/product/pv-intelligence",
  solarScope: "/product/solar-site",
  greenplanner: "/product/greenplanner",
  repark: "/product/repark",
};

export const PLATE = { w: 26, d: 18 };
export const ROAD = { ewZ: 0, nsX: -1, width: 1.2 };

/** 시설 위치 — 라벨 앵커(머리 위)와 바닥 강조 영역 */
export const FACILITY: Record<ProductKey, { label: [number, number, number]; zones: { x: number; z: number; w: number; d: number }[] }> = {
  bems: { label: [-6.5, 6.3, -4.6], zones: [{ x: -6.5, z: -4.6, w: 3.8, d: 3 }] },
  peakEss: { label: [-3.55, 1.15, -4.1], zones: [{ x: -3.55, z: -4.1, w: 2.4, d: 1.6 }] },
  sharedEss: { label: [10, 1.05, -5.2], zones: [{ x: 10, z: -5.2, w: 5.2, d: 3.8 }] },
  pvRems: {
    label: [10.9, 1.05, 6.4],
    zones: [
      { x: 10.9, z: 6.4, w: 4.2, d: 5 },
      { x: 2.8, z: 4.8, w: 6, d: 7 },
    ],
  },
  solarScope: { label: [3.5, 0.9, -5], zones: [{ x: 3.5, z: -5, w: 5.4, d: 5 }] },
  greenplanner: { label: [7.6, 3.2, 3.2], zones: [{ x: 7.6, z: 3.2, w: 3.6, d: 2.8 }] },
  repark: { label: [-7, 1.3, 4.8], zones: [{ x: -7, z: 4.8, w: 10.4, d: 7.4 }] },
};
