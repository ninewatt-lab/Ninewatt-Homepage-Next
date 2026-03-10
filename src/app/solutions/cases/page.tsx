import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수행사례 - Ninewatt",
  description: "나인와트 수행사례. 국내외 다수 에너지 솔루션 제공 실적",
};

interface CaseItem {
  title: string;
  category: string;
  description: string;
}

const cases: CaseItem[] = [
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

const categories = ["공공기관", "지자체", "기업", "해외"] as const;

export default function CasesPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">수행사례</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            국내 공공기관·지자체 및 해외 파트너 대상 다수 솔루션 제공 실적
          </p>
        </div>
      </section>

      {/* Cases grouped by category */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {categories.map((cat) => {
            const items = cases.filter((c) => c.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="text-lg font-bold">{cat}</h2>
                <div className="mt-4 divide-y divide-border">
                  {items.map((c) => (
                    <div key={c.title} className="py-4">
                      <p className="font-medium">{c.title}</p>
                      <p className="mt-1 text-sm text-muted">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats — inline row */}
      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-12 gap-y-4">
          {[
            { value: "60+", label: "국내 프로젝트" },
            { value: "4개국", label: "해외 진출" },
            { value: "30명", label: "전문 인력" },
            { value: "96.81%", label: "연평균 성장률" },
          ].map((s) => (
            <div key={s.label}>
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="ml-2 text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
