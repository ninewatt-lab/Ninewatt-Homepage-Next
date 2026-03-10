import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수행사례 - Ninewatt",
  description: "나인와트의 국내외 프로젝트 수행 사례",
};

interface CaseItem {
  title: string;
  category: string;
  description: string;
}

const domesticCases: CaseItem[] = [
  { title: "건설기술연구원 - 탄소중립 플랫폼", category: "공공기관", description: "건물·도로 단위의 탄소·교통 배출량을 가시화하고, 지역의 에너지 분석 및 절감 리모델링 시뮬레이션에 대응" },
  { title: "강남구 - 도시 에너지 3D Map", category: "지자체", description: "공공시설의 탄소 발자국을 추적하여 온실가스 감축 목표를 명확히 설정" },
  { title: "경기도 - 경기기후 플랫폼 그린리모델링 시뮬레이션", category: "지자체", description: "부동산 정보를 기반으로 한 건물의 노후도·에너지·임지 분석 및 리모델링 의사결정 지원 서비스" },
  { title: "경기도 - ESS 통합관리 시스템", category: "지자체", description: "경기도 전역 ESS 현황 모니터링 및 통합 자원 관리 시스템" },
  { title: "경기도 - 중소기업 기후경영지원 서비스", category: "지자체", description: "GHG 배출량 산정, 에너지 진단, 태양광(PV), ESS 분석, 감축 제안까지 원스톱 대응" },
  { title: "LS Electric global R&D campus - SAVE-E", category: "기업", description: "에너지 솔루션 제공 및 자동진단 레포트 시스템 구축" },
  { title: "LS Electric - Smart Energy Insight system", category: "기업", description: "고객 기업 대상 에너지 솔루션 제공 및 영업 도구 활용" },
  { title: "일본 츠난마치 - 탈탄소 프로젝트", category: "해외", description: "시나넨홀딩스와 함께 니이가타현 츠난마치 지자체 대상 스마트시티 실증 프로젝트" },
  { title: "한영국제연구과제 - AI챗봇 건물 에너지 분석 플랫폼", category: "해외", description: "한국건설기술연구원, UCL과 함께 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발" },
  { title: "프랑스 - 그린리노베이션 플랫폼", category: "해외", description: "Toltek (건축업자를 위한 솔루션 개발 스타트업)과 업무협약 체결, 프랑스 건물 에너지 분석 서비스" },
];

const categoryColors: Record<string, string> = {
  "공공기관": "bg-blue-500/10 text-blue-400 dark:bg-blue-500/15 dark:text-blue-300",
  "지자체": "bg-green-500/10 text-green-600 dark:bg-green-500/15 dark:text-green-300",
  "기업": "bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  "해외": "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300",
};

export default function CasesPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Case Studies</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">수행사례</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            국내 공공기관·지자체 및 해외 파트너 대상 다수 솔루션 제공 실적
          </p>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {domesticCases.map((c) => (
              <div
                key={c.title}
                className="group rounded-2xl border border-border bg-surface-elevated p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[c.category] || "bg-surface text-muted"}`}
                >
                  {c.category}
                </span>
                <h3 className="mt-3 text-lg font-bold group-hover:text-primary">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "60+", label: "국내 프로젝트" },
              { value: "4개국", label: "해외 진출" },
              { value: "30명", label: "전문 인력" },
              { value: "96.81%", label: "연평균 성장률" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
