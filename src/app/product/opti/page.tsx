import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Opti - AI Energy Advisor - Ninewatt",
  description:
    "CES 2026 Innovation Awards Honoree. Opti는 자연어 기반 건물 에너지 분석 및 비용 절감 솔루션입니다.",
};

export default function OptiPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            CES Innovation Awards 2026 Honoree — Smart Communities
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Opti
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            AI Energy Advisor for Buildings
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            건물 에너지 데이터를 대화로 분석하고, 비용 절감 전략을 자동으로
            제안합니다. 200개 이상의 건물에서 검증되었습니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Problem → Solution (single section, no separate "Challenge" block) */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">문제</h2>
              <ul className="mt-6 space-y-4 text-muted">
                <li className="border-l-2 border-border pl-4">
                  에너지 리포트가 너무 복잡해서 실무자가 직접 해석하기 어렵습니다.
                </li>
                <li className="border-l-2 border-border pl-4">
                  태양광 발전량 추적이 수동이고, 담당자 교체 시 인수인계가 되지 않습니다.
                </li>
                <li className="border-l-2 border-border pl-4">
                  탄소 규제가 강화되는데, 과태료를 낼지 설비 투자를 할지 판단할 근거가 부족합니다.
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Opti가 하는 일</h2>
              <ul className="mt-6 space-y-4">
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">자연어 대화</span>
                  <span className="text-muted"> — 질문만 하면 에너지 인사이트가 바로 나옵니다.</span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">투자 시뮬레이션</span>
                  <span className="text-muted"> — 태양광·ESS 설치의 ROI를 정밀 분석합니다.</span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">요금 최적화</span>
                  <span className="text-muted"> — 7가지 알고리즘으로 최적 요금제를 찾아냅니다.</span>
                </li>
                <li className="border-l-2 border-primary pl-4">
                  <span className="font-medium">유사 건물 비교</span>
                  <span className="text-muted"> — 같은 용도·규모 건물 대비 에너지 소비를 벤치마킹합니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — horizontal flow without numbered badges */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">작동 방식</h2>
          <p className="mt-2 text-muted">데이터 연동에서 리포트 자동 생성까지</p>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold">데이터 연동</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                전력 사용량(15분 데이터), 기상·지형 데이터, 건물 형상, 전력 요금 등을 연결합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold">분석 & 시뮬레이션</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                전력 비용 예측, 월별 소비 패턴, 설비별 에너지 분해, AI 대화형 인사이트를 제공합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold">실행 & 리포트</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                PV/ESS 설치 시뮬레이션, ESS 자동 운영, 비용 절감 분석 결과를 리포트로 자동 생성합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact — compact, no giant numbers */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">기대 효과</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <p className="text-3xl font-bold text-primary">~12%</p>
              <p className="mt-2 text-sm text-muted">에너지 비용 절감</p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-3xl font-bold text-primary">80%</p>
              <p className="mt-2 text-sm text-muted">M&V 리포트 작성 시간 단축</p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-3xl font-bold text-primary">No HW</p>
              <p className="mt-2 text-sm text-muted">기존 스마트 미터 데이터만으로 시작</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Modules — simple list, not card grid */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">AI 모듈</h2>
          <div className="mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {[
              { name: "AI Conversation Engine", desc: "자연어 대화 기반 에너지 분석" },
              { name: "Consumption Forecasting", desc: "에너지 소비 예측 모델링" },
              { name: "Tariff Recommendation", desc: "최적 전력 요금제 추천" },
              { name: "Economic Analytics", desc: "경제성 분석 및 투자 수익률" },
              { name: "Meter Integration", desc: "스마트 미터 데이터 자동 연동" },
              { name: "Report Automation", desc: "M&V 리포트 자동 생성" },
            ].map((m) => (
              <div key={m.name} className="flex items-baseline gap-3 border-b border-border py-3">
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-xs text-muted">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">가격</h2>
          <p className="mt-2 text-muted">
            모듈형 구독 요금제. BEMS &amp; ESCO 플랫폼에 OEM/API로 통합할 수 있습니다.
          </p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-8 font-semibold">플랜</th>
                  <th className="pb-3 pr-8 font-semibold">월 요금</th>
                  <th className="pb-3 pr-8 font-semibold">연 요금</th>
                  <th className="pb-3 font-semibold">설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 pr-8 font-medium">Standard</td>
                  <td className="py-3 pr-8">$700</td>
                  <td className="py-3 pr-8">$7,000</td>
                  <td className="py-3 text-muted">단일 사이트 핵심 인사이트</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8 font-medium">Professional</td>
                  <td className="py-3 pr-8">$1,200</td>
                  <td className="py-3 pr-8">$12,000</td>
                  <td className="py-3 text-muted">고급 분석 및 ROI 리포트</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8 font-medium">Business</td>
                  <td className="py-3 pr-8">$2,500</td>
                  <td className="py-3 pr-8">$30,000</td>
                  <td className="py-3 text-muted">API, 대시보드, 최대 5개 건물</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8 font-medium">Enterprise</td>
                  <td className="py-3 pr-8 text-muted" colSpan={2}>별도 문의</td>
                  <td className="py-3 text-muted">화이트라벨 / 통합 / 멀티사이트</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA — left-aligned, not centered banner */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">직접 확인해보세요</h2>
          <p className="mt-3 text-muted">
            데모를 통해 Opti가 건물 에너지 관리에 어떤 변화를 만드는지 보여드립니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
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
