import Link from "next/link";
import {
  SmesAndStartups,
  SeoulMetropolitanGov,
  Gyeonggido,
  IcnMetropolitanCity,
  SeoulFacilities,
  Gangnamgu,
  LSelectric,
  Kepco,
} from "@/components/logos/contractors";

export default function Home() {
  return (
    <>
      {/* Hero Section — Split Layout */}
      <section className="flex min-h-[92vh] items-center px-6 pt-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          {/* Left — Text */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-50 px-4 py-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-primary"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm font-semibold text-primary">
                CES 2026 Innovation Awards
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              건물이 에너지를
              <br />
              <span className="text-primary">말하게 하다</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              건물 에너지를 측정하고, AI로 분석하고, 탄소중립을 실행합니다.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:-translate-y-0.5"
              >
                문의하기
              </Link>
              <Link
                href="/product"
                className="group flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30"
              >
                제품 보기
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right — Abstract visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-80 w-full max-w-md md:h-96">
              {/* Background glow */}
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/10 to-primary-light/10 blur-2xl" />

              {/* Grid pattern */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-surface/50 backdrop-blur-sm">
                {/* Decorative grid lines */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Floating data cards */}
                <div className="absolute left-6 top-8 rounded-xl border border-border bg-surface-elevated/90 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs text-muted">에너지 소비량</p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    324{" "}
                    <span className="text-sm font-normal text-muted">kWh</span>
                  </p>
                  <div className="mt-2 flex gap-1">
                    {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-3 rounded-sm bg-primary/60"
                        style={{ height: `${h * 0.4}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-10 right-6 rounded-xl border border-border bg-surface-elevated/90 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs text-muted">탄소 절감</p>
                  <p className="mt-1 text-lg font-bold text-emerald-500">
                    -18.2%{" "}
                    <span className="text-xs font-normal text-muted">
                      vs 작년
                    </span>
                  </p>
                </div>

                <div className="absolute right-8 top-12 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 backdrop-blur">
                  <p className="text-xs font-semibold text-primary">
                    AI 분석중
                  </p>
                </div>

                {/* Connecting lines */}
                <svg
                  className="absolute inset-0 h-full w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="45%"
                    y1="25%"
                    x2="70%"
                    y2="18%"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.3"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="35%"
                    y1="40%"
                    x2="60%"
                    y2="65%"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.3"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            </div>
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
              href="/product/opti"
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
                href="/company/global"
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
      <section className="border-t border-border bg-[#1a1a2e] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-white/50">함께하는 기관과 기업</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
            <Kepco />
            <LSelectric />
            <SmesAndStartups />
            <SeoulMetropolitanGov />
            <Gyeonggido />
            <IcnMetropolitanCity />
            <SeoulFacilities />
            <Gangnamgu />
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
