import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Save-E - Smart Energy Insight - Ninewatt",
  description:
    "건물 에너지 그룹관리 및 에너지 비용관리 솔루션. 다수의 건물에서 사용하는 에너지를 손쉽게 모니터링, 관리할 수 있도록 지원합니다.",
};

const caseStudies = [
  {
    title: "한국전력 에너지동행사업",
    location: "전국 13개 중소기업",
    result: "연간 1,508.3MWh, 1.5억원 절감",
    description:
      "한국전력과 에너지동행사업 컨소시엄 진행(2020~2022). 13개 중소기업 대상 AI 효율화 절감을 수행했습니다.",
  },
  {
    title: "신한 스퀘어브릿지",
    location: "서울",
    result: "설비투자 없이 연간 8% 절감",
    description:
      "최소한의 데이터로 분석한 결과, 설비교체 없이 약 684만원(연간 8%) 절감이 가능하며, 설비교체 투자 시 24.2% 절감 가능으로 분석되었습니다.",
  },
  {
    title: "LS Electric R&D Campus",
    location: "인천",
    result: "계약전력 변경으로 12% 절감",
    description:
      "계약전력 변경(6,250kW → 3,750kW)만으로 설비투자 없이 전체 전기요금 대비 12%, 연 624만원 실절감을 달성했습니다.",
  },
  {
    title: "경기도 ESS 최적화",
    location: "경기도",
    result: "AI 충방전 알고리즘 적용",
    description:
      "ESS 설치 사이트 대상 충방전 데이터 모니터링과 요금 절감 효과 분석 자동 레포팅. AI 기반 최적 충방전 알고리즘을 적용 중입니다.",
  },
];

export default function SaveEPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">Smart Energy Insight</p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Save-E
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            건물 에너지 그룹관리 및 비용관리 솔루션
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            15분 단위 전력사용량을 분석해 최적 요금제를 찾고,
            설비투자 없이도 에너지 비용을 절감할 수 있습니다.
            한국전력 고객번호 10자리만 있으면 시작됩니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              데모 요청하기
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* What Save-E analyzes */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold">분석 항목</h2>
              <p className="mt-3 text-sm text-muted">
                7가지 에너지 절감 알고리즘으로 비용 절감 방안을 찾습니다.
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  "과거 전력사용패턴 분석",
                  "선택요금제 변경",
                  "계약전력 변경",
                  "피크 최적화",
                  "역률관리",
                  "설비효율화",
                  "신재생 에너지(PV)",
                ].map((item) => (
                  <p key={item} className="border-b border-border py-2 text-sm">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — simple flow */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">작동 방식</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-primary">분석</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                과거 전력사용패턴, 요금제, 계약전력, 피크, 역률, 설비효율, 신재생에너지까지 7가지 관점에서 분석합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">대시보드</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                데이터 가시화, 상관관계 그래프, 에너지 사용량 및 비용 모니터링을 실시간으로 제공합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">리포트</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                에너지 진단 결과와 비용 절감 솔루션을 자동 리포트로 생성합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages — not numbered cards */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">특장점</h2>
          <ul className="mt-8 space-y-5">
            {[
              {
                title: "요금 절감 가이드",
                desc: "과거 에너지 사용량, 외기온도, 시간대 분석을 통한 예측 절감대안을 제공합니다.",
              },
              {
                title: "잠재 절감 금액 수치화",
                desc: "알고리즘 분석으로 절감 가능한 에너지와 금액을 구체적으로 보여줍니다.",
              },
              {
                title: "연간 전기요금 비교",
                desc: "현재 납부 비용과 분석 결과가 반영된 비용을 나란히 비교합니다.",
              },
              {
                title: "하드웨어 불필요",
                desc: "한국전력 고객번호 10자리와 정보제공동의만으로 분석을 시작합니다.",
              },
            ].map((item) => (
              <li key={item.title} className="border-l-2 border-primary pl-4">
                <span className="font-medium">{item.title}</span>
                <p className="mt-1 text-sm text-muted">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Data sources — compact */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">활용 데이터</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "에너지요금 변동정보",
              "건축물대장정보",
              "기상청 외기정보",
              "국토부 위치·도시계획정보",
              "한국전력 사용요금정보",
              "15분 단위 전력사용량",
              "하드웨어 설치보조금 정보",
            ].map((item) => (
              <span key={item} className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies — list, not identical cards */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">도입 사례</h2>
          <div className="mt-10 space-y-8">
            {caseStudies.map((cs) => (
              <div key={cs.title} className="md:flex md:gap-8 border-b border-border pb-8 last:border-0">
                <div className="mb-3 md:mb-0 md:w-56 shrink-0">
                  <h3 className="text-lg font-bold">{cs.title}</h3>
                  <p className="text-sm text-muted">{cs.location}</p>
                  <p className="mt-1 text-sm font-medium text-primary">{cs.result}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {cs.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Save-E 도입 문의</h2>
            <p className="mt-2 text-muted">
              하드웨어 투자 없이 에너지 비용 절감을 시작하세요.
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              문의하기
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
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
