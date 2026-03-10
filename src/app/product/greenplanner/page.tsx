import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GreenPlanner - 그린리모델링 플래너 - Ninewatt",
  description:
    "건물 에너지 시뮬레이션과 부동산 공공 데이터를 활용한 리모델링 예측 보고서 앱. 건물 리모델링, 모두가 할 수 있도록.",
};

const fundingInfo = [
  {
    region: "서울",
    program: "서울시 건물에너지 효율화 (BRP)",
    maxAmount: "20억원",
    terms: "무이자 융자, 3년거치 총 8년 분할상환",
    year: "2024년 기준",
  },
  {
    region: "전국",
    program: "국토교통부 그린 리모델링",
    maxAmount: "50억원",
    terms: "연 4% 무이자 민간이자지원, 3년거치 총 10년 분할상환",
    year: "2023년 기준",
  },
];

export default function GreenPlannerPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-emerald-600">
            Green Remodeling App
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            GreenPlanner
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            건물 리모델링, 모두가 할 수 있도록
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            에너지 시뮬레이션과 부동산 공공 데이터로 리모델링 후 추정시세를 예측하고,
            정부지원자금 컨설팅까지 한 번에 제공합니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              서비스 문의하기
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-6 text-sm text-muted">
          <span>상업용 건물 소유자</span>
          <span className="text-border">|</span>
          <span>건물 예비소유자</span>
          <span className="text-border">|</span>
          <span>부동산 중개법인</span>
        </div>
      </section>

      {/* Features — Q&A style, not card grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">GreenPlanner가 답하는 질문들</h2>
          <div className="mt-10 space-y-10">
            {[
              {
                q: "내 건물 주변 시세는?",
                a: "부동산 공적 정보 기반 유사 실거래가를 제공합니다. 공적장부, 공시지가, 실거래가, 상권분석, 인구분석까지.",
              },
              {
                q: "이 건물은 얼마나 낡았을까?",
                a: "미국 DOE의 EnergyPlus 기반 시뮬레이션으로 객관적인 건물 에너지 노후도를 진단합니다.",
              },
              {
                q: "리모델링하면 효율등급이 얼마나 올라갈까?",
                a: "데이터 기반으로 건물의 예상 단열 수준을 계산하고, 리모델링 후 에너지 효율등급을 시뮬레이션합니다.",
              },
              {
                q: "주변 상권과 유동인구는?",
                a: "업종분석, 유동인구, 주요 교통입지, 마트·백화점, 버스정류장 정보를 한눈에.",
              },
              {
                q: "공사비와 행정절차는?",
                a: "예상 공사비, 건축행정절차, 인허가, 예상 공사기간, 마감재 교체 옵션까지 안내합니다.",
              },
              {
                q: "리모델링 후 투자 수익이 날까?",
                a: "전/후 부동산 가치를 예측하고, 임대료·매매가 추정, 10년 예상 임대수익까지 층별로 상세하게.",
              },
            ].map((item) => (
              <div key={item.q} className="md:flex md:gap-8">
                <h3 className="md:w-64 shrink-0 text-lg font-bold">
                  {item.q}
                </h3>
                <p className="mt-2 md:mt-0 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More features — compact list */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">그 외 기능</h2>
          <ul className="mt-8 space-y-4">
            {[
              "건축전문가 검색 — 지역별 설계·시공 전문가 정보를 한번에",
              "포트폴리오 확인 — 견적서가 아닌 실제 시공 사례와 그린리모델링 경력 확인",
              "체크리스트 — 임대차 계약, 건축사·건설사 미팅, 심의 방법, 핵심질문 TOP6",
              "리모델링 예측보고서 — 공사비, 행정절차, 예측 임대료, 추정 매매가를 PDF로 즉시 다운로드",
            ].map((item) => (
              <li key={item} className="border-l-2 border-emerald-500 pl-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Government Funding — table style instead of gradient card */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">정부 지원자금</h2>
          <p className="mt-3 text-muted">
            리모델링 비용, 정부에서 지원받을 수 있습니다.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {fundingInfo.map((f) => (
              <div key={f.region} className="rounded-xl border border-border p-6">
                <p className="text-sm text-muted">{f.program}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  최대 {f.maxAmount}
                </p>
                <p className="mt-3 text-sm text-muted">{f.terms}</p>
                <p className="mt-1 text-xs text-muted">{f.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">건물 리모델링, 데이터로 시작하세요</h2>
          <p className="mt-3 text-muted">
            그린플래너로 건물의 현재 상태와 리모델링 가능성을 확인해 보세요.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              서비스 문의
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 브로셔
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
