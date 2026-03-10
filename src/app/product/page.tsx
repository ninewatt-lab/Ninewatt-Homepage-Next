import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product - Ninewatt",
  description: "나인와트의 에너지 솔루션 제품군. Opti, GreenPlanner, Save-E, RE:park",
};

const products = [
  {
    href: "/product/opti",
    name: "Opti",
    badge: "CES 2026 Honoree",
    tagline: "AI Energy Advisor",
    description:
      "도메인 특화 LLM 기반 대화형 건물 에너지 분석 서비스. 에너지 사용 패턴 분석, 이상 감지, 자동 리포트까지.",
  },
  {
    href: "/product/greenplanner",
    name: "GreenPlanner",
    badge: null,
    tagline: "Green Remodeling Planner",
    description:
      "도시 단위 건물 에너지 진단 및 그린리모델링 시뮬레이션 플랫폼.",
  },
  {
    href: "/product/save-e",
    name: "Save-E",
    badge: null,
    tagline: "Smart Energy Insight",
    description:
      "기업 대상 에너지 솔루션 제공 및 자동진단 레포팅 서비스.",
  },
  {
    href: "/product/repark",
    name: "RE:park",
    badge: null,
    tagline: "Renewable Energy Park",
    description:
      "신재생·분산에너지 시뮬레이션 및 설치 최적화 플랫폼.",
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
