import Link from "next/link";

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
      <section className="flex min-h-[90vh] items-center px-6 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-sm font-medium text-primary">
            CES 2026 Innovation Awards Honoree
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
            GX 실현을 이끄는
            <br />
            <span className="text-primary">에너지 기술 기업</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            건물 에너지 데이터를 수집·분석하고,
            <br className="hidden sm:block" />
            탄소중립을 위한 실행 가능한 인사이트를 만듭니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              문의하기
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

      {/* Numbers */}
      <section className="border-y border-border px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-y-10 md:grid-cols-6">
          {[
            { value: "2019", label: "설립" },
            { value: "30+", label: "직원 수" },
            { value: "60+", label: "수행 프로젝트" },
            { value: "96.81%", label: "매출 성장률" },
            { value: "48억", label: "누적 투자" },
            { value: "33건", label: "보유 특허" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we do — asymmetric layout */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-5">
            {/* Large card */}
            <Link
              href="/product"
              className="group md:col-span-3 rounded-2xl border border-border p-8 transition-colors hover:border-primary/30"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Product
              </p>
              <h3 className="mt-4 text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                Opti — AI 에너지 어드바이저
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                CES 2026 수상작. 건물 에너지 데이터를 자연어로 질의하면,
                비용 절감 전략과 투자 시뮬레이션 결과를 바로 받아볼 수 있습니다.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                제품 알아보기 &rarr;
              </span>
            </Link>

            {/* Stacked small cards */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <Link
                href="/solutions"
                className="group flex-1 rounded-2xl border border-border p-8 transition-colors hover:border-primary/30"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Solutions
                </p>
                <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition-colors">
                  에너지 데이터·AI·시뮬레이션
                </h3>
                <p className="mt-2 text-sm text-muted">
                  데이터 수집부터 도시 에너지 시뮬레이션까지.
                </p>
              </Link>
              <Link
                href="/company"
                className="group flex-1 rounded-2xl border border-border p-8 transition-colors hover:border-primary/30"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted">
                  Global
                </p>
                <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition-colors">
                  4개국 진출, 33건 특허
                </h3>
                <p className="mt-2 text-sm text-muted">
                  일본·영국·프랑스·미국에서 사업을 전개하고 있습니다.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-muted">함께하는 기관과 기업</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {partners.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border px-5 py-2 text-sm text-muted"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold md:text-4xl">
            에너지 솔루션이 필요하신가요?
          </h2>
          <p className="mt-4 max-w-lg text-muted">
            나인와트 팀이 건물 유형과 규모에 맞는 방안을 함께 설계합니다.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  );
}
