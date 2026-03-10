import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RE:park - 스마트 시설물 관리 시스템 - Ninewatt",
  description:
    "시민·관리자·보수업체를 위한 QR 기반 시설물 관리시스템. 공원시설물에서 공공시설물 관리 시스템으로.",
};

const userRoles = [
  {
    role: "시민",
    color: "amber",
    title: "스마트 고장신고 서비스",
    description: "시민용 고장신고 시스템",
    steps: [
      { num: "01", text: "문제가 생긴 시설물 발견" },
      { num: "02", text: "시설물에 부착된 QR코드 스캔" },
      { num: "03", text: "발생된 문제 내용을 비대면 신고" },
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    role: "관리자",
    color: "blue",
    title: "신고 및 처리 관리시스템",
    description: "관리자용 시스템",
    steps: [
      { num: "01", text: "신고 내역 접수" },
      { num: "02", text: "보수업/담당자에 작업 의뢰" },
      { num: "03", text: "작업 처리 상태 관리" },
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
  },
  {
    role: "보수업체",
    color: "teal",
    title: "유지보수 관리시스템",
    description: "보수업체 시스템",
    steps: [
      { num: "01", text: "작업의뢰 수락" },
      { num: "02", text: "작업 완료 보고" },
      { num: "03", text: "작업 이력 관리" },
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
];

const serviceFeatures = [
  {
    title: "위치정보와 시설물정보가 반영된 QR TAG 스마트 고장신고 시스템",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
      </svg>
    ),
  },
  {
    title: "데이터 구축·전용 표찰 제작부터 관리시스템까지 제공",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
      </svg>
    ),
  },
  {
    title: "별도 설치 필요없는 SaaS형 클라우드 서비스",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
      </svg>
    ),
  },
  {
    title: "관리자의 업무 방식 디지털 전환",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
  {
    title: "비대면 신고로 민원접수 및 민원인 응대 간소화",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
];

const expansionBenefits = [
  "고장난 시설물 비대면 신고 및 처리알림전송",
  "고장신고 관련 행정인력 비용 절감",
  "불필요한 업무 프로세스 생략",
  "통합 관리 데이터베이스 구축으로 업무 및 이력 전산화",
];

const caseData = {
  title: "인천 센트럴파크, 해돋이공원",
  partner: "인천스타트업파크 X 인천시설공단 송도공원사업단 X 나인와트",
  stats: [
    { label: "조명시설 대상 실증 진행", value: "1,300개", note: "~23.11.30" },
    { label: "조경·운동시설 대상 실증 진행 중", value: "2,000개", note: "24.01.01~" },
  ],
  milestones: [
    {
      year: "2023",
      title: "인천스타트업파크 실증 상용화 프로그램",
      description: "센트럴파크, 해돋이공원 내 조명시설 대상 진행 완료",
    },
    {
      year: "2024~",
      title: "2차 기술개발제품 공공기관 실증지원사업",
      description: "인천시설공단 실증 선정, 센트럴파크·해돋이공원 내 조경 및 운동시설 대상",
    },
  ],
};

export default function REparkPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-6 pb-20 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-teal-500/5" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm font-semibold text-amber-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            Smart Facility Management
          </p>
          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            RE:park
          </h1>
          <p className="mt-4 text-xl font-medium text-amber-600 md:text-2xl">
            시민·관리자·보수업체를 위한 시설물 관리시스템
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted">
            위치정보 및 시설물 정보를 반영한 공원시설물 관리시스템에서, 공공시설물 관리 시스템으로.
            QR 코드 기반 스마트 고장신고부터 통합 관리 시스템까지, 시민·관리자·보수업체 모두의 만족도를 높이는 DX 시스템입니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-600/25 transition-all hover:bg-amber-700 hover:shadow-xl"
            >
              서비스 문의하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              PDF 다운로드
            </a>
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceFeatures.map((sf) => (
              <div key={sf.title} className="flex items-start gap-3 rounded-xl border border-border bg-surface-elevated p-5 transition-all hover:border-amber-500/30">
                <div className="mt-0.5 shrink-0 rounded-lg bg-amber-500/10 p-2 text-amber-600">{sf.icon}</div>
                <p className="text-sm font-medium leading-relaxed">{sf.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Flow - 3 User Roles */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-600">Service Flow</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">서비스 흐름</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              시민, 관리자, 보수업체 3자의 원활한 소통을 위한 통합 시스템
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {userRoles.map((ur) => (
              <div key={ur.role} className="rounded-2xl border border-border bg-surface-elevated transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
                <div className="rounded-t-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/20 p-2">{ur.icon}</div>
                    <div>
                      <p className="text-lg font-bold">{ur.role}</p>
                      <p className="text-xs text-amber-100">{ur.title}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="mb-4 text-xs text-muted">{ur.description}</p>
                  <div className="space-y-3">
                    {ur.steps.map((s) => (
                      <div key={s.num} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">
                          {s.num}
                        </div>
                        <p className="text-sm">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Expansion */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-amber-600">Expansion</p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                스마트 시설관리 시스템으로
                <br />사업 확장
              </h2>
              <p className="mt-4 text-muted">
                관리번호가 없는 시설물을 통합적으로 관리하는 SW로 확장.
                가로등 외 벤치, 맨홀, 버스정류장 등 다양한 공공시설물 관리로 확대합니다.
              </p>
              <div className="mt-8 space-y-3">
                {expansionBenefits.map((b) => (
                  <div key={b} className="flex items-start gap-3 text-sm">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">QR 코드 시설물 표찰</p>
                    <p className="text-xs text-muted">좌표·위치정보가 포함된 표찰을 시설물에 부착</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-elevated p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">통합 관리 시스템</p>
                    <p className="text-xs text-muted">시민·관리자·보수업체 모두의 만족도를 높이는 DX 시스템</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-600">Case Study</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">구축 사례</h2>
          </div>
          <div className="mt-12 rounded-2xl border border-border bg-surface-elevated overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-8 text-white">
              <h3 className="text-2xl font-bold">{caseData.title}</h3>
              <p className="mt-2 text-sm text-amber-100">{caseData.partner}</p>
            </div>
            <div className="p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {caseData.stats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-surface p-5">
                    <p className="text-sm text-muted">{s.label}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-amber-600">{s.value}</p>
                      <span className="text-xs text-muted">({s.note})</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-6">
                {caseData.milestones.map((m) => (
                  <div key={m.year} className="flex gap-4">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm font-bold text-amber-600">
                      {m.year}
                    </div>
                    <div>
                      <p className="font-bold">{m.title}</p>
                      <p className="mt-1 text-sm text-muted">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-amber-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            RE:park로 스마트한 시설물 관리를 시작하세요
          </h2>
          <p className="mt-4 text-white/70">
            QR 코드 기반 시설물 관리로 시민 편의성과 행정 효율성을 동시에 높입니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-amber-600 transition-colors hover:bg-white/90"
            >
              서비스 문의하기
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              PDF 브로셔 보기
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
