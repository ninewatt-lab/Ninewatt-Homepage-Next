import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solutions - Ninewatt",
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
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">솔루션</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            데이터 수집부터 AI 분석까지, 건물 에너지 관리의 전 과정을 아우르는 솔루션
          </p>
        </div>
      </section>

      {/* Solutions — border-l list */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          {solutions.map((sol) => (
            <div key={sol.id} className="border-l-2 border-border pl-6">
              <h2 className="text-lg font-bold">{sol.title}</h2>
              <ul className="mt-3 space-y-1">
                {sol.items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — left-aligned inline */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">맞춤형 에너지 솔루션이 필요하신가요?</h2>
            <p className="mt-1 text-sm text-muted">
              나인와트의 전문가가 귀사에 최적화된 솔루션을 제안합니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 md:mt-0"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  );
}
