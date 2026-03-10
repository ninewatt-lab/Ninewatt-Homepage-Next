import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Save-E - Smart Energy Insight - Ninewatt",
  description:
    "건물 에너지 그룹관리 및 에너지 비용관리 솔루션. 다수의 건물에서 사용하는 에너지를 손쉽게 모니터링, 관리할 수 있도록 지원합니다.",
};

const highlights = [
  {
    title: "에너지 사용 패턴 분석",
    description: "과거 전력사용패턴을 분석하여 에너지 사용 현황을 파악합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
  },
  {
    title: "15분 단위 실시간 데이터",
    description: "한국전력 15분 단위 전력사용량 데이터를 실시간으로 분석합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "건물 . 기상 . 월단위 에너지",
    description: "건축물대장, 기상청 데이터, 에너지 공공데이터를 통합 분석합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
];

const analysisItems = [
  "과거 전력사용패턴 분석",
  "선택요금제 변경",
  "계약전력 변경",
  "피크 최적화",
  "역률관리",
  "설비효율화",
  "신재생 에너지(PV)",
];

const dashboardItems = [
  "데이터 가시화",
  "상관관계 그래프",
  "에너지 사용량/비용 모니터링",
];

const reportItems = [
  "에너지 진단",
  "비용 절감 솔루션",
  "자동 레포트",
];

const reportSolutions = [
  "선택요금제 변경",
  "계약전력 변경",
  "피크최적화",
  "역률관리",
  "설비효율화",
  "신재생에너지(PV)",
  "예상비용절감",
];

const advantages = [
  {
    num: "1",
    title: "에너지 요금 절감을 위한 최적의 가이드 제공",
    description: "과거 에너지 사용량, 외기온도, 미세먼지, 시간대 분석을 통한 예측 절감대안을 제공합니다.",
  },
  {
    num: "2",
    title: "잠재 절감 에너지 및 비용 제시",
    description: "알고리즘 분석을 통해 절감이 가능한 에너지와 금액을 수치화하여 보여줍니다.",
  },
  {
    num: "3",
    title: "연간 납부되는 전기요금 분석",
    description: "연간 납부되는 비용과 분석 결과가 반영된 비용 비교가 가능합니다.",
  },
  {
    num: "4",
    title: "별도 하드웨어 불필요",
    description: "별도의 하드웨어 없이 에너지 비용 절감이 가능합니다. 한국전력 고객번호 10자리만 있으면 됩니다.",
  },
];

const bigDataSources = [
  { name: "Charges", desc: "에너지요금 변동정보" },
  { name: "Building Info", desc: "건축물대장정보" },
  { name: "Weather", desc: "기상청 외기정보" },
  { name: "Location", desc: "국토부 위치·도시계획정보" },
  { name: "Power Plant", desc: "한국전력 사용요금정보" },
  { name: "Electricity", desc: "15분 단위 전력사용량" },
  { name: "Policy", desc: "하드웨어 설치보조금 정보" },
];

const caseStudies = [
  {
    tag: "CASE 1",
    title: "중소기업(공장) 에너지 절감",
    subtitle: "한국전력 에너지동행사업 컨소시엄",
    description: "한국전력과 에너지동행사업 컨소시엄을 진행(2020~2022). 13개 중소기업 대상 AI 효율화 절감을 수행하여 연간 1,508.3MWh, 151.6백만원 절감효과를 달성했습니다.",
    highlights: ["22년 6개 공장 에너지절감 수행 완료", "한국전력공사 자금지원 + 나인와트 실행", "연간 1,508.3MWh, 151.6백만원 절감효과"],
    location: "전국",
  },
  {
    tag: "CASE 2",
    title: "Shinhan Financial Group",
    subtitle: "신한은행 보유 건물 에너지비용 절감",
    description: "신한 스퀘어브릿지 건물의 최소한의 데이터로 분석한 결과, 설비교체 등의 투자없이 최대 약 684만원(연간 8%)의 전기요금 절감이 가능하며, 설비교체에 투자할 경우 전력요금 대비 24.2% 절감이 가능한 것으로 분석되었습니다.",
    highlights: ["설비투자 없이 연간 8% 전기요금 절감 가능", "설비교체 시 24.2% 절감 가능", "그룹사별 그룹관리 및 지점별 에너지 관리"],
    location: "서울",
  },
  {
    tag: "CASE 3",
    title: "인천광역시",
    subtitle: "Smart-X Energy Program PoC",
    description: "인천스타트업파크 Smart-X Energy Program PoC 및 인천시설남동공단 공장 전력관리 모니터링·에너지 진단 진행. LS Electric global R&D campus에서 계약전력 변경(6,250kW → 3,750kW)으로 설비투자 없이 전체 전기요금 대비 12% 절감을 달성했습니다.",
    highlights: ["설비투자 없이 전기요금 대비 12% 절감", "계약전력 변경으로 6,240,000원 실절감", "6가지 솔루션 기반 전력요금 절감안 제공"],
    location: "인천",
  },
  {
    tag: "CASE 4",
    title: "경기도 ESS",
    subtitle: "ESS 충방전 모니터링 & AI 최적화",
    description: "경기도 내 ESS 설치 사이트 대상, ESS 충방전 데이터를 모니터링하고 요금 절감 효과를 분석하는 자동 레포팅 시스템 구축. AI 모델을 활용해 요금 절감 효과를 극대화하는 최적 충방전 알고리즘을 적용 중입니다.",
    highlights: ["ESS 충방전 데이터 실시간 모니터링", "요금 절감 효과 분석 자동 레포팅", "AI 기반 최적 충방전 알고리즘 적용"],
    location: "경기도",
  },
];

export default function SaveEPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm font-semibold text-blue-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
            Smart Energy Insight
          </p>
          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Save-E
          </h1>
          <p className="mt-4 text-xl font-medium text-blue-600 md:text-2xl">
            건물 에너지 그룹관리 및 비용관리 솔루션
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted">
            SAVE-e는 관리자가 다수의 건물에서 사용하는 에너지를 손쉽게 모니터링, 관리할 수 있도록 지원하는 서비스입니다.
            15분 단위의 전력사용량을 분석해 최적의 전력요금 선택, 에너지 효율화에 따른 잠재적 에너지 절감량을 분석합니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              데모 요청하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Data Highlights */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4 rounded-2xl border border-border bg-surface-elevated p-6 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 text-blue-600">{h.icon}</div>
                <div>
                  <h3 className="font-bold">{h.title}</h3>
                  <p className="mt-1 text-sm text-muted">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - 3 pillars */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">How it works</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">한 눈에 보는 SAVE-E</h2>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {/* Analysis */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-7">
              <h3 className="mb-1 text-lg font-bold text-blue-600">분석</h3>
              <p className="mb-5 text-xs text-muted">7가지 에너지 절감 분석</p>
              <div className="space-y-2">
                {analysisItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Dashboard */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-7">
              <h3 className="mb-1 text-lg font-bold text-blue-600">대시보드</h3>
              <p className="mb-5 text-xs text-muted">시각적 데이터 모니터링</p>
              <div className="space-y-2">
                {dashboardItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Report */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-7">
              <h3 className="mb-1 text-lg font-bold text-blue-600">보고서 레포팅</h3>
              <p className="mb-5 text-xs text-muted">자동 에너지 진단 리포트</p>
              <div className="space-y-2">
                {reportItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                    <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {reportSolutions.map((s) => (
                  <span key={s} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">{s}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Target */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center text-white shadow-xl">
            <p className="text-lg font-semibold">공장 / 학교 / 프랜차이즈 등 건물주 대상</p>
            <p className="mt-2 text-sm text-white/70">
              하드웨어 설치 등 투자비용 없이 에너지 사용량 및 에너지 요금 절감 가능
            </p>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">Advantages</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">SAVE-E 특장점</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {advantages.map((a) => (
              <div key={a.num} className="flex gap-5 rounded-2xl border border-border bg-surface-elevated p-7 transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/25">
                  {a.num}
                </div>
                <div>
                  <h3 className="font-bold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Data Sources */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">Big Data</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">활용 데이터</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              한국전력 고객번호 10자리 + 정보제공동의만으로 분석을 시작합니다.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bigDataSources.map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-4 transition-all hover:border-blue-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <span className="text-sm font-bold text-blue-600">{d.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{d.name}</p>
                  <p className="text-xs text-muted">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-blue-600">Case Studies</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">구축 사례</h2>
          </div>
          <div className="mt-16 space-y-8">
            {caseStudies.map((cs) => (
              <div key={cs.tag} className="overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex flex-col md:flex-row">
                  <div className="flex shrink-0 flex-col justify-center bg-gradient-to-br from-blue-600 to-cyan-700 p-8 text-white md:w-64">
                    <p className="text-xs font-bold tracking-wider text-blue-200">{cs.tag}</p>
                    <h3 className="mt-2 text-xl font-bold">{cs.title}</h3>
                    <p className="mt-1 text-sm text-blue-200">{cs.subtitle}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-200">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {cs.location}
                    </div>
                  </div>
                  <div className="flex-1 p-8">
                    <p className="text-sm leading-relaxed text-muted">{cs.description}</p>
                    <div className="mt-5 space-y-2">
                      {cs.highlights.map((h) => (
                        <div key={h} className="flex items-start gap-2 text-sm">
                          <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-blue-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            에너지 비용 절감, Save-E로 시작하세요
          </h2>
          <p className="mt-4 text-white/70">
            하드웨어 투자 없이 에너지 사용량과 비용을 절감할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-white/90"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              PDF 브로셔 보기
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
