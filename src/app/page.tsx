import Link from "next/link";

const stats = [
  { label: "설립", value: "2019" },
  { label: "직원 수", value: "30명" },
  { label: "프로젝트 실적", value: "60건+" },
  { label: "연평균 성장률", value: "96.81%" },
  { label: "누적 투자", value: "48억원" },
  { label: "보유 특허", value: "33건" },
];

const solutions = [
  {
    title: "에너지 모니터링 플랫폼",
    description: "실시간 에너지 모니터링, 설비·전력·운영 상태 통합 가시화, 디지털트윈 3D 시각화",
  },
  {
    title: "AI 분석 및 알고리즘",
    description: "전력 사용 패턴 분석, 이상 징후 탐지 및 예측, 설비 운영 최적화 알고리즘",
  },
  {
    title: "BEMS-AI 에이전트",
    description: "도메인 특화 LLM(RAG) 기반 에너지 분석, 대화형 에너지 관리 인터페이스",
  },
  {
    title: "도시 에너지 시뮬레이션",
    description: "UBEM 기술 기반 도시 단위 건물 에너지 진단, 그린리모델링 효과 시뮬레이션",
  },
];

const partners = [
  "한국전력공사", "LS Electric", "강남구", "경기도",
  "한국건설기술연구원", "고양시", "SINANEN", "OpenAI",
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-blue-800 px-6 py-32 text-white md:py-40">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            CES 2026 Innovation Awards Honoree
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            GX 실현을 이끄는
            <br />
            에너지 기술 기업
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            AI/빅데이터 기반 건물 에너지 플랫폼으로
            <br className="hidden sm:block" />
            스마트시티와 탄소중립 사회에 기여합니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              문의하기
            </Link>
            <Link
              href="/solutions"
              className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              솔루션 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-foreground/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions Preview */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Solutions</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            보유기술 / 핵심 솔루션
          </h2>
          <p className="mt-4 max-w-2xl text-foreground/60">
            데이터 수집부터 AI 분석까지, 건물 에너지 관리의 전 과정을 아우르는 솔루션을 제공합니다.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((sol) => (
              <div
                key={sol.title}
                className="group rounded-2xl border border-gray-100 p-6 transition-all hover:border-primary/20 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {sol.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  {sol.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/solutions"
              className="text-sm font-semibold text-primary hover:underline"
            >
              전체 솔루션 보기 &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Opti CES Banner */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 md:flex-row">
          <div className="flex-1">
            <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              CES Innovation Awards 2026 Honoree
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Opti</h2>
            <p className="mt-2 text-lg text-foreground/70">AI 대화형 건물 에너지 분석 서비스</p>
            <p className="mt-4 leading-relaxed text-foreground/60">
              CES Innovation Awards 2026 스마트 커뮤니티 부문 수상(Honoree)을 통해
              글로벌 무대에서의 경쟁력을 입증했습니다.
              도메인 특화 LLM(RAG) 기반 에너지 분석과 대화형 인터페이스를 제공합니다.
            </p>
            <Link
              href="/product/opti"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              자세히 보기
            </Link>
          </div>
          <div className="flex h-64 w-full max-w-md items-center justify-center rounded-2xl bg-white shadow-lg md:h-72">
            <div className="text-center">
              <p className="text-5xl font-bold text-primary">Opti</p>
              <p className="mt-2 text-sm text-foreground/40">AI Energy Advisor for Buildings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            주요 파트너 & 고객사
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {partners.map((name) => (
              <div
                key={name}
                className="flex h-16 items-center rounded-lg border border-gray-100 px-6 text-sm font-medium text-foreground/50"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">
            에너지 솔루션이 필요하신가요?
          </h2>
          <p className="mt-4 text-white/70">
            나인와트의 전문가가 귀사에 최적화된 에너지 솔루션을 제안합니다.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  );
}
