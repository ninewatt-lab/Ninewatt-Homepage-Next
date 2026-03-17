import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PV Intelligence - 태양광 발전소 통합 관제 - Ninewatt",
  description:
    "자체 RTU로 현장 데이터를 수집하고, 실시간 모니터링부터 AI 운영 분석까지 하나의 플랫폼에서 제공합니다.",
};

export default function PVIntelligencePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Solar Plant Monitoring System
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            PV Intelligence
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            태양광 발전소 통합 관제 시스템
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            태양광 발전소 운영자를 위한 웹 기반 통합 관제 플랫폼입니다. 자사 RTU
            장비를 현장에 설치하여 인버터 데이터를 수집하고, 클라우드에서 실시간
            모니터링·분석·제어를 제공합니다.
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

      {/* System Architecture */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">시스템 구조</h2>
          <p className="mt-3 text-muted">
            현장 인버터에서 클라우드까지, 데이터가 흐르는 경로
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {[
              { label: "인버터", sub: "RS-485 Modbus" },
              { label: "자사 RTU", sub: "LTE Cat.M1" },
              { label: "PV Intelligence 클라우드", sub: "모니터링 · 분석 · AI" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="rounded-xl border border-border px-6 py-4 text-center">
                  <p className="text-sm font-bold">{step.label}</p>
                  <p className="mt-1 text-xs text-muted">{step.sub}</p>
                </div>
                {i < 2 && (
                  <svg
                    className="hidden h-5 w-5 shrink-0 text-primary sm:block"
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
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">주요 기능</h2>
          <div className="mt-10 space-y-10">
            {[
              {
                title: "실시간 대시보드",
                desc: "발전소별 발전량 조회, RTU 통신 상태 감시, 인버터별 출력·효율·가동 상태를 한눈에 확인합니다.",
              },
              {
                title: "인버터 상세 분석",
                desc: "DC/AC 전압·전류, MPPT·스트링 채널별 데이터, 성능 레이더 차트 및 Health Score를 제공합니다.",
              },
              {
                title: "통계 분석",
                desc: "월별 발전량 추이, 실효율 vs 설정 효율 비교, 효율 갭 경보, 탄소 저감량 환산을 지원합니다.",
              },
              {
                title: "장애/이력 관리",
                desc: "통신 에러·연결 오류 알람 이력, 인버터별 장애 시각 및 에러 타입을 기록하고 추적합니다.",
              },
              {
                title: "AI 운영 어드바이저",
                desc: "AI 기반 자연어 질의응답으로 실시간 데이터를 연동하고, SMP/REC 기반 수익 분석을 제공합니다.",
              },
            ].map((item) => (
              <div key={item.title} className="md:flex md:gap-8">
                <h3 className="shrink-0 text-lg font-bold md:w-52">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted md:mt-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Equipment */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">지원 장비</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">인버터</p>
              <p className="mt-2 text-sm text-muted">
                효성, 화웨이, 현대 등 주요 브랜드
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">RTU</p>
              <p className="mt-2 text-sm text-muted">
                자사 RTU (LTE Cat.M1, RS-485 Modbus RTU)
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">데이터 수집 주기</p>
              <p className="mt-2 text-sm text-muted">5분 (조정 가능)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">
            태양광 발전소, 스마트하게 관제하세요
          </h2>
          <p className="mt-3 text-muted">
            PV Intelligence 데모를 통해 통합 관제가 어떻게 달라지는지 확인해
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
