import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product - Ninewatt",
  description: "나인와트의 에너지 솔루션 제품군. Watti, Opti, GreenPlanner, Save-E, RE:park",
};

const products = [
  {
    href: "/product/watti",
    name: "Watti",
    badge: null,
    tagline: "3D Building Energy Platform",
    description:
      "3D 맵 기반 건물 에너지 분석 플랫폼. 건축물·에너지·환경·도시 데이터 분석을 통해 건물 에너지 효율화 인사이트를 제공합니다.",
  },
  {
    href: "/product/opti",
    name: "Opti",
    badge: "CES 2026 Honoree",
    tagline: "AI Energy Advisor",
    description:
      "자연어 기반 건물 에너지 투자 인사이트와 진단. 200개 이상의 건물에 적용된 AI 대화형 에너지 분석 서비스.",
  },
  {
    href: "/product/greenplanner",
    name: "GreenPlanner",
    badge: null,
    tagline: "Green Remodeling Planner",
    description:
      "건물 에너지 시뮬레이션과 부동산 공공 데이터로 리모델링 후 추정시세를 예측하고, 정부지원자금 컨설팅까지 제공하는 앱.",
  },
  {
    href: "/product/save-e",
    name: "Save-E",
    badge: null,
    tagline: "Smart Energy Insight",
    description:
      "건물 에너지 그룹관리 및 비용관리 솔루션. 15분 단위 전력사용량 분석으로 최적의 요금제와 에너지 절감 방안을 제시합니다.",
  },
  {
    href: "/product/repark",
    name: "RE:park",
    badge: null,
    tagline: "Smart Facility Management",
    description:
      "시민·관리자·보수업체를 위한 QR 기반 시설물 관리시스템. 비대면 고장신고부터 통합 관리까지.",
  },
];

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Product</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">제품 소개</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            건물 에너지 관리의 전 과정을 아우르는 나인와트의 제품군
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {products.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className="group rounded-2xl border border-border bg-surface-elevated p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold group-hover:text-primary">
                    {product.name}
                  </h3>
                  {product.badge && (
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-semibold text-primary">
                      {product.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-primary">
                  {product.tagline}
                </p>
                <p className="mt-4 leading-relaxed text-muted">
                  {product.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  자세히 보기
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
