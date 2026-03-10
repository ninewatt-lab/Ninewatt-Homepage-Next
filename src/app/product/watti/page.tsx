import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Watti - 3D 건물 에너지 분석 플랫폼 - Ninewatt",
  description:
    "3D 맵 기반 건물 에너지 분석 플랫폼. 건축물·에너지·환경·도시 데이터 분석을 통해 건물 에너지 효율화 인사이트를 제공합니다.",
};

const highlights = [
  {
    title: "AI를 통한 인사이트 도출",
    description: "분석모듈, 시뮬레이션 등 데이터 기반 의사결정 지원",
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
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },
  {
    title: "커스텀 SaaS형 플랫폼",
    description: "고객의 니즈에 맞춘 고객 지향적 사용환경",
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
          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
        />
      </svg>
    ),
  },
  {
    title: "대규모 데이터 통합 및 가시화",
    description: "다양한 데이터의 통합·변환 및 가시화를 통한 가치 최대화",
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
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
        />
      </svg>
    ),
  },
  {
    title: "사용자 친화적 인터페이스",
    description: "직관적 UI/UX를 통한 복잡한 데이터 탐색 및 분석을 빠르게 수행",
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
          d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
        />
      </svg>
    ),
  },
];

const analysisModules = [
  {
    title: "에너지 분석",
    color: "primary",
    items: [
      "건물 에너지 효율 평가",
      "건물 에너지 시뮬레이션을 통한 효율화 솔루션 제공",
      "건물 (그린)리모델링 에너지/경제성 분석",
    ],
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
          d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
        />
      </svg>
    ),
  },
  {
    title: "탄소 분석",
    color: "emerald",
    items: [
      "도시/건물 탄소 배출 모니터링",
      "도시/건물 탄소 감축 목표 달성을 위한 시나리오 분석",
      "도시 수목 데이터 통합을 통한 탄소흡수량 반영",
    ],
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
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
  {
    title: "태양광 분석",
    color: "amber",
    items: [
      "건물 지붕/입면의 일사 분석",
      "태양광 발전설비 최적 설치 위치 선별",
      "태양광 발전설비 경제성 분석",
    ],
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
    title: "전기차 분석",
    color: "violet",
    items: [
      "전기차 충전소 현황 모니터링",
      "전기차 충전소 최적 설치 위치 선별",
    ],
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
          d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
        />
      </svg>
    ),
  },
];

const dataCategories = [
  {
    name: "Energy",
    desc: "건물 전기/가스 에너지 사용량, 1차 에너지 소요량, 지역별 온실가스배출량",
  },
  {
    name: "Sustainability",
    desc: "그린리모델링 우선대상 건축물, 건축물에너지효율등급, 녹색건축인증등급",
  },
  {
    name: "Social",
    desc: "생활편의/문화체육/복지시설 현황, 시내버스 이용현황, 전기차 충전소",
  },
  {
    name: "Weather",
    desc: "월평균/시간당 기온, 상대습도, 일사, 일조, 강수량, 침수 흔적",
  },
  {
    name: "Demographic",
    desc: "주민등록 인구 및 세대현황, 생활/유동/직장/관광인구 추이, 고용동향",
  },
  {
    name: "Real estate",
    desc: "부동산 실거래가 정보, 부동산 통계정보, 공동주택표준데이터",
  },
];

const caseStudies = [
  {
    tag: "CASE 1",
    title: "런던 PoC - QEOP",
    subtitle: "Queen Elizabeth Olympic Park",
    description:
      "QEOP 올림픽공원 내 건물 대상으로 3D 에너지맵을 구축하여 건물 에너지 소비량 모니터링, 데이터 기반 건물 에너지 효율 평가 및 개선 컨설팅 레포트를 제공했습니다.",
    highlights: [
      "3D 에너지맵 구축을 통한 건물 에너지 소비량 모니터링",
      "데이터 기반 건물 에너지 효율 평가",
      "에너지 효율 평가 및 개선 컨설팅 레포트 제공",
    ],
    location: "London, UK",
  },
  {
    tag: "CASE 2",
    title: "강남구 Zero Carbon Map",
    subtitle: "건물 탄소 관리 지도",
    description:
      "국내 최초 자치구 3D 에너지맵 구축을 통한 상징성 및 홍보효과를 달성하고, 건물단위 온실가스 파악을 통한 탄소중립 도시 계획의 정량적 자료를 획득했습니다.",
    highlights: [
      "법정동별 탄소배출량 가시화",
      "건물별 전기 및 가스 사용량 표시",
      "강남구 내 공공건축물 탄소배출량 분석",
      "서울시 평균 대비 동별 탄소배출량 비교",
    ],
    location: "서울 강남구",
  },
  {
    tag: "CASE 3",
    title: "경기도 공간정보 시스템",
    subtitle: "기후·에너지 데이터포털",
    description:
      "경기도 공간정보 기후·에너지 데이터포털을 구축하고, 경기연구원의 기후위기 대응 정책 기획에 참여했습니다.",
    highlights: [
      "그린리모델링 필요 건물 선별 및 예상 탄소 절감량 추정",
      "유휴부지 태양광 도입을 위한 적지분석",
      "공공/민간 건축물의 에너지 소비 현황분석",
      "친환경차 충전소 전략적 설치 지원",
    ],
    location: "경기도",
  },
];

const govUseCases = [
  "지자체 온실가스 감축 목표 관리",
  "지자체 내 모든 건축물의 에너지 사용 현황 및 효율화 방안 제공",
  "지자체 온실가스 감축 전략 시나리오 분석",
  "지자체 내 공공건축물 에너지/탄소 관리",
];

export default function WattiPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-sm font-semibold text-teal-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
            Open Data-Based Platform
          </p>
          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            Watti
          </h1>
          <p className="mt-4 text-xl font-medium text-teal-600 md:text-2xl">
            3D 맵 기반 건물 에너지 분석 플랫폼
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted">
            건축물·에너지·환경·도시 데이터 분석을 통해 건물 에너지 효율화를 위한
            Insight를 제공하여 탄소중립에 기여합니다. 데이터 종류와 분석모듈을
            커스텀하여 필요에 따른 다양한 버전의 WATTI를 구축합니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30"
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
              href="/files/NINEWATT_WATTI.pdf"
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

      {/* Highlights */}
      <section className="border-b border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-border bg-surface-elevated p-6 transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-600">
                  {h.icon}
                </div>
                <h3 className="text-base font-bold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {h.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Data Stats */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold text-teal-600">Big Data</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            나인와트가 다루는 공간 빅데이터
          </h2>
          <div className="mt-10 inline-flex flex-col items-center">
            <p className="text-6xl font-bold tracking-tight text-teal-600 md:text-7xl">
              134,000
            </p>
            <p className="mt-2 text-lg text-muted">건 이상의 데이터</p>
          </div>
        </div>
      </section>

      {/* Analysis Modules */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-teal-600">
              Analysis Modules
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              분석모듈 종류
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              가시화를 통한 인사이트 도출 및 커스텀이 가능하며, 지자체 도시개발
              계획 근거 자료로 활용할 수 있습니다.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {analysisModules.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-border bg-surface-elevated p-6 transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
              >
                <div className="mb-5 inline-flex rounded-xl bg-teal-500/10 p-3 text-teal-600">
                  {m.icon}
                </div>
                <h3 className="mb-4 text-lg font-bold">{m.title}</h3>
                <ul className="space-y-2.5">
                  {m.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
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
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Categories */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-teal-600">
              Data Categories
            </p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              데이터 종류
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataCategories.map((d) => (
              <div
                key={d.name}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-teal-500/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
                  <span className="text-sm font-bold text-teal-600">
                    {d.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold">{d.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Use Cases */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 p-10 text-white shadow-xl md:p-14">
            <div className="mx-auto max-w-3xl">
              <p className="text-sm font-semibold text-teal-200">
                Government & Public Sector
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                지자체 활용 사례
              </h2>
              <p className="mt-4 text-white/70">
                가시화를 통한 인사이트 도출 및 커스텀 가능. 지자체 도시개발 계획
                근거 자료로 활용됩니다.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {govUseCases.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-teal-200"
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
                    <span className="text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-teal-600">Case Studies</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">구축 사례</h2>
          </div>
          <div className="mt-16 space-y-8">
            {caseStudies.map((cs) => (
              <div
                key={cs.tag}
                className="overflow-hidden rounded-2xl border border-border bg-surface-elevated transition-all hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex shrink-0 flex-col justify-center bg-gradient-to-br from-teal-600 to-cyan-700 p-8 text-white md:w-64">
                    <p className="text-xs font-bold tracking-wider text-teal-200">
                      {cs.tag}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">{cs.title}</h3>
                    <p className="mt-1 text-sm text-teal-200">{cs.subtitle}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-teal-200">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                      </svg>
                      {cs.location}
                    </div>
                  </div>
                  <div className="flex-1 p-8">
                    <p className="text-sm leading-relaxed text-muted">
                      {cs.description}
                    </p>
                    <div className="mt-6 space-y-2">
                      {cs.highlights.map((h) => (
                        <div
                          key={h}
                          className="flex items-start gap-2 text-sm"
                        >
                          <svg
                            className="mt-0.5 h-4 w-4 shrink-0 text-teal-500"
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
      <section className="border-t border-border bg-teal-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Watti를 직접 경험해보세요
          </h2>
          <p className="mt-4 text-white/70">
            3D 맵 기반 건물 에너지 분석의 새로운 가능성을 확인하세요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-white/90"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_WATTI.pdf"
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
