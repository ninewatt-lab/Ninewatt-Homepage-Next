import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product - Ninewatt",
  description: "나인와트의 에너지 솔루션 제품군. Watti, Opti, GreenPlanner, Save-E, RE:park",
};

const products = [
  {
    href: "/product/opti",
    name: "Opti",
    badge: "CES 2026",
    tagline: "AI Energy Advisor",
    description:
      "자연어로 건물 에너지 데이터를 분석하고, 투자 시뮬레이션과 비용 절감 전략을 받아보세요. 200개 이상의 건물에 적용되었습니다.",
  },
  {
    href: "/product/watti",
    name: "Watti",
    badge: null,
    tagline: "3D Building Energy Platform",
    description:
      "3D 맵 위에 건축물·에너지·환경·도시 데이터를 통합 분석합니다. 지자체와 기업을 위한 커스텀 SaaS 플랫폼.",
  },
  {
    href: "/product/greenplanner",
    name: "GreenPlanner",
    badge: null,
    tagline: "Green Remodeling Planner",
    description:
      "에너지 시뮬레이션으로 리모델링 후 추정시세를 예측하고, 정부지원자금 컨설팅까지 한 번에.",
  },
  {
    href: "/product/save-e",
    name: "Save-E",
    badge: null,
    tagline: "Smart Energy Insight",
    description:
      "15분 단위 전력사용량 분석으로 최적 요금제를 찾고, 건물 에너지 그룹관리와 비용관리를 지원합니다.",
  },
  {
    href: "/product/repark",
    name: "RE:park",
    badge: null,
    tagline: "Smart Facility Management",
    description:
      "QR 코드 기반 시설물 관리. 시민 고장신고부터 관리자 현황 파악, 보수업체 작업관리까지.",
  },
];

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">제품</h1>
          <p className="mt-4 max-w-lg text-lg text-muted">
            건물 에너지 관리의 전 과정을 아우르는 나인와트의 제품군
          </p>
        </div>
      </section>

      {/* Product list */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="divide-y divide-border">
            {products.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className="group flex flex-col gap-1 py-8 first:pt-0 last:pb-0 md:flex-row md:items-center md:gap-8"
              >
                <div className="flex items-center gap-3 md:w-56 shrink-0">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.badge && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">
                    {product.tagline}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {product.description}
                  </p>
                </div>
                <svg
                  className="hidden md:block shrink-0 h-5 w-5 text-muted group-hover:text-primary transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
