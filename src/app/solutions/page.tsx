import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "솔루션 - Ninewatt",
  description: "나인와트의 에너지 기술 솔루션",
};

const solutions = [
  {
    id: "data-infra",
    title: "데이터 수집 및 인프라 구축, 전처리",
    items: [
      "현지 전력 사용량, 전력요금제, 및 기상 등 연관 데이터 수집",
      "데이터 수집·저장 체계 구축",
      "통합 DB 및 운영 플랫폼 기반 마련",
      "현장-클라우드 연계 구조 설계",
      "데이터 처리를 통한 플랫폼 연계",
    ],
  },
  {
    id: "monitoring",
    title: "에너지 모니터링 및 통합 플랫폼 개발",
    items: [
      "실시간 에너지 모니터링 시스템",
      "설비·전력·운영 상태 통합 가시화",
      "대시보드 기반 운영 지원",
      "디지털트윈 기반 3D 시각화",
    ],
  },
  {
    id: "ai-analysis",
    title: "AI 기반 분석 및 알고리즘 개발",
    items: [
      "수집된 데이터 및 현지화 된 로직 적용",
      "전력 사용 패턴 분석",
      "이상 징후 탐지 및 예측",
      "설비 운영 최적화 알고리즘",
      "실제 현장 적용을 통한 에너지 분석 수행",
    ],
  },
  {
    id: "bems-ai",
    title: "BEMS-AI 에이전트 개발",
    items: [
      "도메인 특화 LLM(RAG) 기반 에너지 분석",
      "운영 데이터 자동 리포트",
      "이상 상황 원인 분석 지원",
      "대화형 에너지 관리 인터페이스",
    ],
  },
  {
    id: "ubem",
    title: "도시 단위 에너지 분석 및 시뮬레이션 (UBEM)",
    items: [
      "도시 단위 건물 에너지 진단",
      "건물 에너지 성능 분석 및 비교",
      "그린리모델링 효과 시뮬레이션",
      "정책·사업 타당성 분석 지원",
    ],
  },
  {
    id: "renewable",
    title: "신재생·분산에너지 시뮬레이션",
    items: [
      "PV(태양광) 설치 적합도 분석",
      "ESS 설치 용량·운영 시뮬레이션",
      "유휴공간·옥상·일사량 분석",
      "설치 효과 3D 가시화",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 px-6 py-24 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-white/70">Solutions</p>
          <h1 className="mt-2 text-4xl font-bold md:text-5xl">기술 / 솔루션</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            데이터 수집부터 AI 분석까지, 건물 에너지 관리의 전 과정을 아우르는 6가지 핵심 솔루션
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((sol, idx) => (
              <div
                key={sol.id}
                className="group rounded-2xl border border-gray-100 p-8 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 text-lg font-bold group-hover:text-primary">
                  {sol.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {sol.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-foreground/60"
                    >
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">
            Opti - AI 대화형 건물 에너지 분석 서비스
          </h2>
          <p className="mt-4 text-foreground/60">
            CES 2026 Innovation Awards 수상, 나인와트의 주력 제품을 확인하세요.
          </p>
          <Link
            href="/product/opti"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Opti 자세히 보기
          </Link>
        </div>
      </section>
    </>
  );
}
