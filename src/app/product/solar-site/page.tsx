import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SolarScope - Solar Site Analysis Platform - Ninewatt",
  description:
    "주소 입력만으로 태양광 설치 후보지의 규제, 이격거리, 배전망, 발전량, 수익성을 통합 분석하는 플랫폼입니다.",
};

export default function SolarSitePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Solar Site Analysis Platform
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            SolarScope
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            태양광 후보지, 주소 하나로 분석합니다
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            태양광 설치 후보지의 기술적·법적·경제적 타당성을 통합 분석하는
            플랫폼입니다. 주소 또는 지번 입력만으로 규제, 이격거리, 배전망,
            발전량, 수익성을 한 번에 평가할 수 있습니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청하기
            </Link>
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Dashboard */}
          <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr]">
            <div>
              <h2 className="text-2xl font-bold">통합 대시보드</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                주소 입력 한 번으로 토지 분석, 배전망 확인, 이격거리 검토,
                수익성 평가까지. 최근 프로젝트를 한눈에 관리합니다.
              </p>
            </div>
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_2.png"
                  alt="SolarScope 대시보드"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid items-center gap-10 md:grid-cols-[3fr_2fr]">
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10 md:order-1">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_3.png"
                  alt="SolarScope 상세 분석"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
            <div className="md:order-2">
              <h2 className="text-2xl font-bold">상세 분석</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                토지 기본정보, 배전망 여유용량, 이격거리 검사, 일사량·발전량 시뮬레이션을
                하나의 화면에서 확인합니다.
              </p>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr]">
            <div>
              <h2 className="text-2xl font-bold">사업성 검토</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                발전 수익 계산, 대출 상환 시뮬레이션, 조기상환 시나리오,
                현금흐름 분석까지 투자 의사결정에 필요한 모든 수치를 제공합니다.
              </p>
            </div>
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_1.png"
                  alt="SolarScope 사업성 검토"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-6 text-sm text-muted">
          <span>태양광 개발사 및 EPC 기업</span>
          <span className="text-border">|</span>
          <span>에너지 투자사 및 금융기관</span>
          <span className="text-border">|</span>
          <span>지자체 및 공공기관</span>
          <span className="text-border">|</span>
          <span>건물 및 토지 소유자</span>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">문제</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                태양광 사업은 초기 후보지 검토 단계에서 다양한 요소를 개별적으로
                확인해야 하는 복잡한 과정을 거칩니다.
              </p>
              <ul className="mt-6 space-y-4 text-muted">
                <li className="border-l-2 border-border pl-4">
                  용도지역 및 행위제한 확인
                </li>
                <li className="border-l-2 border-border pl-4">
                  이격거리 규정 검토
                </li>
                <li className="border-l-2 border-border pl-4">
                  배전망 연계 가능성 확인
                </li>
                <li className="border-l-2 border-border pl-4">
                  발전량 및 수익성 분석
                </li>
                <li className="border-l-2 border-border pl-4">
                  인허가 및 정책 조건 검토
                </li>
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                이러한 과정은 여러 시스템과 데이터를 오가며 수행되며, 검토 시간이
                길고 의사결정의 일관성이 떨어지는 문제가 존재합니다.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">SolarScope가 하는 일</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                SolarScope는 이 과정을 하나의 워크플로우로 통합합니다.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">자동 후보지 분석</span>
                  <span className="text-muted">
                    {" "}
                    — 주소/지번 입력만으로 즉시 분석을 시작합니다.
                  </span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">규제 및 입지 검토</span>
                  <span className="text-muted">
                    {" "}
                    — GIS 기반으로 규제·이격거리를 자동 확인합니다.
                  </span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">배전망 연계 확인</span>
                  <span className="text-muted">
                    {" "}
                    — 전력 계통 연계 가능성을 사전에 평가합니다.
                  </span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">용량 및 발전량 산정</span>
                  <span className="text-muted">
                    {" "}
                    — 설치 가능 용량과 연간 발전량을 자동 계산합니다.
                  </span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">경제성 분석</span>
                  <span className="text-muted">
                    {" "}
                    — 투자비, 매출, 회수기간 등 사업성을 분석합니다.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">주요 기능</h2>
          <div className="mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {[
              {
                name: "Integrated Feasibility Analysis",
                desc: "규제, 이격거리, 배전망, 발전량, 수익성을 통합 분석",
              },
              {
                name: "GIS-based Spatial Analysis",
                desc: "필지 및 건물 단위의 공간 분석과 지도 기반 시각화 (2D/3D)",
              },
              {
                name: "Capacity & Yield Estimation",
                desc: "설치 가능 용량 및 연간 발전량 자동 계산",
              },
              {
                name: "Financial Modeling",
                desc: "투자비, 대출, 수익, 회수기간 등 사업성 분석",
              },
              {
                name: "Multi-site Comparison",
                desc: "여러 후보지를 동시에 비교하여 의사결정 지원",
              },
              {
                name: "Report Generation",
                desc: "분석 결과를 PDF 및 데이터 형태로 저장 및 활용",
              },
            ].map((m) => (
              <div
                key={m.name}
                className="flex items-baseline gap-3 border-b border-border py-3"
              >
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-xs text-muted">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">기대 효과</h2>
          <p className="mt-3 text-muted">
            태양광 후보지 검토 과정에서 발생하는 시간 비용과 불확실성을 줄이고,
            데이터 기반의 일관된 의사결정을 가능하게 합니다.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              { title: "검토 시간 단축", desc: "여러 시스템을 오갈 필요 없이 단일 플랫폼에서 완결" },
              { title: "분석 기준 표준화", desc: "일관된 기준으로 후보지를 평가하고 비교" },
              { title: "비교 효율 향상", desc: "다수 후보지를 동시에 분석하여 최적 입지 선정" },
              { title: "사업 리스크 감소", desc: "데이터 기반 판단으로 투자 불확실성 최소화" },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-border p-6">
                <p className="text-lg font-bold">{v.title}</p>
                <p className="mt-2 text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">
            태양광 후보지, 데이터로 검증하세요
          </h2>
          <p className="mt-3 text-muted">
            SolarScope 데모를 통해 후보지 분석이 어떻게 달라지는지 확인해
            보세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
