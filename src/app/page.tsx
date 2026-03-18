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
import VideoHero from "@/components/VideoHero";
import ScrollReveal from "@/components/ScrollReveal";
import ProductShowcase from "@/components/ProductShowcase";
import CountUp from "@/components/CountUp";

export default function Home() {
  return (
    <>
      {/* Hero — Full-screen video background */}
      <VideoHero />

      {/* Products — Sticky text + scrolling media */}
      <ProductShowcase />

      {/* What we do — asymmetric layout */}
      <ScrollReveal>
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
      </ScrollReveal>

      {/* Partners — Mapbox style logo cloud */}
      <ScrollReveal>
        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Trusted by industry leaders
            </p>
            <div className="mt-12 grid grid-cols-2 items-center justify-items-center gap-x-12 gap-y-10 text-muted sm:grid-cols-4">
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
      </ScrollReveal>

      {/* Numbers */}
      <ScrollReveal>
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
                <CountUp value={stat.value} className="text-2xl font-bold md:text-3xl" />
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
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
      </ScrollReveal>
    </>
  );
}
