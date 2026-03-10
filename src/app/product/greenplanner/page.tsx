import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GreenPlanner - 그린리모델링 플래너 - Ninewatt",
  description:
    "건물 에너지 시뮬레이션과 부동산 공공 데이터를 활용한 리모델링 예측 보고서 앱. 건물 리모델링, 모두가 할 수 있도록.",
};

const features = [
  {
    title: "내 건물 주변 시세는 어떨까?",
    subtitle: "부동산 실거래가 분석",
    description:
      "부동산 공적 정보를 바탕으로 유사 실거래가를 제공합니다. 공적장부, 공시지가부터 실거래가, 상권분석, 인구분석까지 한번에 알아보세요.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
  },
  {
    title: "이 건물은 얼마나 낡았을까?",
    subtitle: "건물 에너지 노후도 진단",
    description:
      "건물 에너지 분석 시뮬레이션으로 객관적인 건물 노후도를 확인하세요. 미국 Department of Energy에서 개발한 EnergyPlus 기반의 검증된 시뮬레이션 결과를 제공합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
  },
  {
    title: "이 건물의 리모델링 플랜은?",
    subtitle: "에너지 효율등급 시뮬레이션",
    description:
      "리모델링 후 예상 에너지 효율등급을 확인해보세요. 데이터 기반으로 입력된 건물의 예상 노후도(단열 수준 등)를 바탕으로 현재 사용량을 계산합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
  },
  {
    title: "여기 상권, 유동인구는 얼마나 될까?",
    subtitle: "주변 상권 & 유동인구 분석",
    description:
      "건물 주변 업종분석, 유동인구 등 주변 상권을 파악해 보세요. 주요 교통입지, 마트/백화점, 버스정류장 정보까지 한눈에 확인 가능합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "공사비? 행정절차? 기간은?",
    subtitle: "공사비 예측 시뮬레이션",
    description:
      "예상 공사비, 건축행정절차, 인허가, 예상 공사기간까지 안내합니다. 마감재 교체 옵션, 건축 행정절차 난이도까지 한눈에 확인하세요.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "리모델링... 투자 수익이 날까?",
    subtitle: "부동산 가치 예측",
    description:
      "리모델링 전/후 부동산 가치 예측. 임대료, 매매가를 추정하여 안내합니다. 10년 예상 임대수익까지 층별로 상세하게 확인 가능합니다.",
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
  },
];

const additionalFeatures = [
  {
    title: "모든 건축전문가들 정보를 한번에",
    description: "이 건물 누가 설계했지? 누가 시공했지? 내가 원하는 지역, 건축전문가들을 한번에!",
  },
  {
    title: "견적서가 아닌 실제 포트폴리오 사례로",
    description: "저가 견적서로만 판단은 그만! 실제 포트폴리오를 확인하세요. 그린리모델링, 서울시BRP 진행경력도 한번에 확인 가능합니다.",
  },
  {
    title: "리모델링 뭐부터 시작하지?",
    description: "임대차 계약체크, 건축사, 건설사 미팅 체크 리스트를 제공합니다. 건축사 심의 방법부터 핵심질문 TOP6까지.",
  },
  {
    title: "나만의 리모델링 예측보고서",
    description: "리모델링에 대한 공사비, 건축행정절차, 예측 임대료 및 리모델링 후 추정 매매가를 그 즉시 PDF로 다운로드 받아보세요.",
  },
];

const fundingInfo = [
  {
    region: "서울에 있다면?",
    maxAmount: "20억원",
    year: "2024년 기준",
    items: [
      "서울시 건물에너지 효율화 (BRP)",
      "무이자 융자지원사업",
      "3년거치 총 8년 분할상환 가능",
    ],
  },
  {
    region: "전국에 있다면?",
    maxAmount: "50억원",
    year: "2023년 기준",
    items: [
      "국토교통부 그린 리모델링",
      "연 4% 무이자 민간이자지원",
      "3년거치 총 10년 분할상환 가능",
    ],
  },
];

export default function GreenPlannerPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm font-semibold text-emerald-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Green Remodeling App
          </p>
          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            GreenPlanner
          </h1>
          <p className="mt-4 text-xl font-medium text-emerald-600 md:text-2xl">
            건물 리모델링, 모두가 할 수 있도록
            <br className="hidden sm:block" />
            시작부터 똑똑하게.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted">
            그린플래너 APP은 건물 에너지 시뮬레이션과 부동산 공공 데이터들로 알고리즘을 만들어
            건물 리모델링 후 추정시세를 예측하고, 정부지원자금컨설팅으로 건물의 새로운 가치를 부여합니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              서비스 문의하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
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

      {/* Target Users */}
      <section className="border-b border-border bg-surface px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6 text-center text-sm">
          {["상업용 건물 소유자", "건물 예비소유자", "부동산 중개법인"].map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-5 py-2.5">
              <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="font-medium">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-600">Features</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              진짜 리모델링만을 위한
              <br className="hidden sm:block" />
              단 하나의 리모델링 예측 보고서
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-surface-elevated p-7 transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-xs font-medium text-emerald-600">{f.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-emerald-600">More</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">그 이상의 기능</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {additionalFeatures.map((af) => (
              <div
                key={af.title}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface-elevated p-6 transition-all hover:border-emerald-500/30"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{af.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{af.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Funding */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 p-10 text-white shadow-xl md:p-14">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-200">Government Funding</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                리모델링 하고 정부에서 돈을 받는다고?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white/70">
                부담은 최소한으로, 수익은 최대한으로. 국토부 그린 리모델링, 서울시 BRP 지원 시스템 등
                정부 정책 지원 자금을 활용한 컨설팅을 통해 에너지 효율은 높이고, 이자는 낮춰드립니다.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {fundingInfo.map((f) => (
                <div key={f.region} className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-lg font-bold">내 건물이 {f.region}</p>
                  <p className="mt-1 text-xs text-emerald-200">건물 한 곳당 최대 지원금액 ({f.year})</p>
                  <p className="mt-3 text-4xl font-bold">{f.maxAmount}</p>
                  <div className="mt-4 space-y-2">
                    {f.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <svg className="h-4 w-4 shrink-0 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-emerald-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            똑똑한 건물리모델링의 시작, 그린플래너에서
          </h2>
          <p className="mt-4 text-white/70">
            건물의 노후화 및 에너지 효율에 대한 정보와 리모델링 플랜을 확인하세요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-white/90"
            >
              서비스 문의하기
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
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
