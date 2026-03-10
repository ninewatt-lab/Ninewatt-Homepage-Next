import Link from "next/link";

const stats = [
  { label: "설립", value: "2019" },
  { label: "직원 수", value: "30+" },
  { label: "프로젝트", value: "60+" },
  { label: "성장률", value: "96.81%" },
  { label: "누적 투자", value: "48억" },
  { label: "보유 특허", value: "33건" },
];

const partners = [
  "한국전력공사",
  "LS Electric",
  "강남구",
  "경기도",
  "한국건설기술연구원",
  "고양시",
  "SINANEN",
  "OpenAI",
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-background px-6 pt-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            CES 2026 Innovation Awards Honoree
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
            GX 실현을 이끄는
            <br />
            <span className="text-primary">에너지 기술 기업</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            AI/빅데이터 기반 건물 에너지 플랫폼으로
            스마트시티와 탄소중립 사회에 기여합니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              문의하기
              <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/product"
              className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              제품 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface px-6 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights — 3 cards linking to sub-pages */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                tag: "Product",
                title: "Opti — AI 에너지 어드바이저",
                description:
                  "CES 2026 수상작. 도메인 특화 LLM 기반 대화형 건물 에너지 분석 서비스로, 자연어 질의만으로 에너지 인사이트를 제공합니다.",
                link: "/product",
                linkText: "제품 알아보기",
              },
              {
                tag: "Solutions",
                title: "AI/빅데이터 에너지 솔루션",
                description:
                  "데이터 수집부터 AI 분석, BEMS-AI 에이전트, 도시 에너지 시뮬레이션까지 건물 에너지 관리의 전 과정을 아우릅니다.",
                link: "/solutions",
                linkText: "솔루션 보기",
              },
              {
                tag: "Global",
                title: "글로벌 4개국 진출",
                description:
                  "일본, 영국, 프랑스, 미국 등 글로벌 시장에서 에너지 솔루션을 확대하며, 33건의 특허와 30건의 인증으로 기술력을 입증합니다.",
                link: "/company",
                linkText: "회사 소개 보기",
              },
            ].map((item) => (
              <div
                key={item.tag}
                className="group rounded-2xl border border-border bg-surface-elevated p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {item.tag}
                </p>
                <h3 className="mt-3 text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <Link
                  href={item.link}
                  className="group/link mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {item.linkText}
                  <svg className="transition-transform group-hover/link:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners / Trust logos */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted">
            Trusted by
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {partners.map((name) => (
              <div
                key={name}
                className="flex h-14 items-center rounded-lg border border-border px-6 text-sm font-medium text-muted transition-colors hover:border-primary/20 hover:text-foreground"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            에너지 솔루션이 필요하신가요?
          </h2>
          <p className="mt-4 text-white/70">
            나인와트의 전문가가 귀사에 최적화된 에너지 솔루션을 제안합니다.
          </p>
          <Link
            href="/contact"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            문의하기
            <svg className="transition-transform group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
