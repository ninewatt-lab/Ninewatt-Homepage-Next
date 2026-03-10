import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Opti - AI Energy Advisor - Ninewatt",
  description:
    "CES 2026 Innovation Awards Honoree. Opti는 자연어 기반 건물 에너지 분석 및 비용 절감 솔루션입니다.",
};

const challenges = [
  {
    title: "복잡한 리포트",
    description:
      "직원들이 에너지 보고서를 해석하지 못해 잦은 문의 전화와 혼란이 발생합니다.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
  },
  {
    title: "PV 인버터 장애",
    description:
      "태양광 발전량의 수동 추적과 어려운 인수인계로 효율적인 운영이 어렵습니다.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    ),
  },
  {
    title: "강화되는 탄소 규제",
    description:
      "건물주와 임차인이 '과태료 납부 vs 투자'를 판단하기 어렵습니다.",
    icon: (
      <svg
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
    ),
  },
];

const coreFeatures = [
  {
    title: "시설 투자 시뮬레이션",
    subtitle: "PV, ESS ROI Analysis",
    description:
      "태양광·ESS 설치의 투자 대비 수익률을 정밀하게 분석하여 최적의 투자 의사결정을 지원합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      </svg>
    ),
  },
  {
    title: "영향 인자 분석",
    subtitle: "Weather, Occupancy & More",
    description:
      "기상, 재실, 기타 외부 요인이 에너지 사용에 미치는 영향을 다각도로 분석합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
        />
      </svg>
    ),
  },
  {
    title: "유사 건물 벤치마킹",
    subtitle: "Benchmarking",
    description:
      "동일 용도·규모의 건물과 에너지 소비를 비교하여 개선 가능성과 목표를 설정합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
        />
      </svg>
    ),
  },
  {
    title: "요금제 분석 및 절감 전략",
    subtitle: "Tariff & Cost-Saving",
    description:
      "7가지 요금 알고리즘 기반 전력 요금 분석으로 최적의 비용 절감 전략을 제안합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
];

const modules = [
  { name: "AI Conversation Engine", desc: "자연어 대화 기반 에너지 분석" },
  { name: "Consumption Forecasting", desc: "에너지 소비 예측 모델링" },
  { name: "Tariff Recommendation", desc: "최적 전력 요금제 추천" },
  { name: "Economic Analytics", desc: "경제성 분석 및 투자 수익률" },
  { name: "Meter Integration", desc: "스마트 미터 데이터 자동 연동" },
  { name: "Report Automation", desc: "자동 M&V 리포트 생성" },
];

const impacts = [
  {
    metric: "12%",
    prefix: "Up to",
    label: "Energy Cost Reduction",
    description: "에너지 비용 절감",
  },
  {
    metric: "80%",
    prefix: "",
    label: "Less Time",
    description: "M&V 리포트 작성 시간 단축",
  },
  {
    metric: "0",
    prefix: "",
    label: "Hardware Required",
    description: "기존 스마트 미터 데이터 활용",
  },
];

const pricingPlans = [
  {
    name: "Standard",
    description: "단일 사이트 핵심 인사이트",
    price: "$700",
    annual: "$7,000",
    featured: false,
  },
  {
    name: "Professional",
    description: "고급 분석 및 ROI 리포트",
    price: "$1,200",
    annual: "$12,000",
    featured: false,
  },
  {
    name: "Business",
    description: "API, 대시보드, 포트폴리오 관리",
    price: "$2,500",
    annual: "$30,000",
    note: "최대 5개 건물",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "화이트라벨 / 통합 / 멀티사이트",
    price: "Custom",
    annual: null,
    featured: false,
  },
];

const processSteps = [
  {
    step: "01",
    title: "데이터 연동",
    desc: "전력 사용량(15분 데이터), 지형·기상 데이터, GIS, 건물 형상, 전력 요금 등을 플랫폼에 연결합니다.",
    items: [
      "Electricity Usage",
      "Terrain & Weather Data",
      "GIS & Building Geometry",
      "Electricity Tariff",
    ],
  },
  {
    step: "02",
    title: "AI 분석 & 시뮬레이션",
    desc: "전력 비용 예측, 월별 소비 분석, 설비별 에너지 소비 분해, AI 대화형 인사이트를 제공합니다.",
    items: [
      "전력 비용 예측",
      "월별 소비 분석",
      "설비별 에너지 분해",
      "AI 대화형 분석",
    ],
  },
  {
    step: "03",
    title: "최적화 실행",
    desc: "PV/ESS 설치 시뮬레이션, ESS 자동 운영 스케줄링, 전력 비용 절감 분석, 자동 리포트를 생성합니다.",
    items: [
      "PV/ESS 시뮬레이션",
      "ESS 자동 스케줄링",
      "비용 절감 분석",
      "자동 리포트 생성",
    ],
  },
];

export default function OptiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            CES Innovation Awards 2026 Honoree
          </p>
          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Opti
          </h1>
          <p className="mt-4 text-xl font-medium text-primary md:text-2xl">
            AI Energy Advisor for Buildings
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted">
            자연어 기반 투자 인사이트와 진단.
            <br className="hidden md:block" />
            건물 에너지 데이터를 대화로 분석하고, 비용 절감 전략을 자동으로
            제안합니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
            >
              데모 요청하기
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* CES Award */}
      <section className="border-b border-border bg-surface px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-900 text-white shadow-lg">
            <div className="text-center">
              <p className="text-[10px] font-bold tracking-wider">CES</p>
              <p className="text-xl font-bold leading-tight">2026</p>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-lg font-bold">
              CES Innovation Awards&reg; 2026 Honoree
            </p>
            <p className="mt-1 text-sm text-muted">
              Opti: AI Energy Advisor for Buildings — Smart Communities Category
            </p>
          </div>
        </div>
      </section>

      {/* Challenge */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">The Challenge</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              건물 에너지 관리의 현실
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              데이터는 넘치지만, 해석과 실행 가능한 인사이트가 부족합니다.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {challenges.map((c) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-5 inline-flex rounded-xl bg-red-50 p-3 text-red-500">
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {c.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg font-semibold italic text-primary">
              &ldquo;Plenty of data, but a lack of interpretation and actionable
              execution.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Solution - Core Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">
              Solution
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Investment Insights &amp; Diagnostics,
              <br className="hidden sm:block" />
              Powered by Natural Language
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              자연어 대화만으로 건물 에너지 투자 인사이트와 진단 결과를 얻을 수
              있습니다.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {coreFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-surface-elevated p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-xs font-medium text-primary">
                  {f.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Process */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              데이터에서 최적화까지
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              200개 이상의 건물에 적용된 검증된 프로세스
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {processSteps.map((s) => (
              <div key={s.step} className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/25">
                    {s.step}
                  </div>
                  <h3 className="text-xl font-bold">{s.title}</h3>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-muted">
                  {s.desc}
                </p>
                <div className="space-y-2">
                  {s.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm"
                    >
                      <svg
                        className="h-4 w-4 shrink-0 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Modules */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">AI Modules</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              100개 이상의 건물에서 검증된 AI 모듈
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.name}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-primary/30"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <svg
                    className="h-4 w-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="mt-1 text-xs text-muted">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">
              Business Impact
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              실질적인 비즈니스 성과
            </h2>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {impacts.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-surface-elevated p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <p className="text-sm font-medium text-muted">{item.prefix}</p>
                <p className="mt-1 text-5xl font-bold tracking-tight text-primary md:text-6xl">
                  {item.metric}
                </p>
                <p className="mt-2 text-lg font-bold">{item.label}</p>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-center text-white shadow-xl">
            <p className="text-lg font-semibold md:text-xl">
              200개 이상의 건물에 적용 (오피스, 산업단지 등)
            </p>
            <p className="mt-2 text-sm text-white/70">
              Office, Industrial Complex, Public Buildings and more
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary">Pricing</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              SaaS + OEM: 파트너를 통한 확장
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              고객 니즈에 맞춘 유연한 모듈형 구독 요금제. BEMS &amp; ESCO
              플랫폼에 OEM/API로 통합 가능합니다.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 transition-all ${
                  plan.featured
                    ? "border-primary bg-surface-elevated shadow-lg shadow-primary/10"
                    : "border-border bg-surface-elevated hover:border-primary/30"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                    BESTSELLER
                  </div>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-sm text-muted"> /month</span>
                  )}
                </div>
                {plan.annual && (
                  <p className="mt-1 text-xs text-muted">
                    {plan.annual} billed annually
                    {plan.note ? ` (${plan.note})` : ""}
                  </p>
                )}
                <Link
                  href="/contact"
                  className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.featured
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-border hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {plan.price === "Custom" ? "문의하기" : "시작하기"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Opti를 직접 경험해보세요
          </h2>
          <p className="mt-4 text-white/70">
            데모를 통해 Opti가 어떻게 건물 에너지 관리를 혁신하는지 확인하세요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
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
