import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Company - Ninewatt",
  description: "나인와트 회사소개. GX 실현을 이끄는 에너지 기술 기업",
};

const executives = [
  {
    role: "CEO / 대표이사",
    name: "김영록",
    team: "사업 1부",
    description: "건축학 전공, 에너지절약건물 설계 컨설팅 200회 이상 전문가",
    details: ["성균관대학교 u-City공학 석사", "단국대학교 건축공학 학사", "국토교통부장관 표창 등 다수 수상"],
  },
  {
    role: "CTO / 최고기술책임자",
    name: "박상린",
    team: "사업 2부",
    description: "건축학 전공, 일본 건설업계 1위 AI 연구소 출신, AI 기술 개발 및 제안 업무 담당 시니어 엔지니어",
    details: ["성균관대학교 u-City공학 석사", "경희대학교 건축공학 학사", "Deep Learning 베이스 AI 시스템 설계"],
  },
];

const orgStructure = [
  { name: "사업부 1", description: "에너지 컨설팅, 그린리모델링" },
  { name: "사업부 2", description: "해외사업, 플랫폼 사업" },
  { name: "개발부", description: "풀스택 개발, AI 백엔드" },
  { name: "기술연구부", description: "에너지 분석, 빅데이터 연구" },
];

export default function CompanyPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Company</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">회사소개</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            GX 실현을 이끄는 에너지 기술로,
            스마트시티와 탄소중립 사회에 기여합니다.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-primary">Vision & Mission</p>
            <h2 className="mt-2 text-3xl font-bold">
              AI/빅데이터 기반 건물 에너지 플랫폼으로
              <br />
              탄소중립 사회를 실현합니다
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              도시 및 건물 에너지 진단 전문가인 CEO를 필두로,
              AI/빅데이터 기반 건물 에너지 플랫폼 연구개발을 주요 사업으로 추진하고 있습니다.
              스마트시티 구축 및 건물 에너지 절감 솔루션을 통해 지속 가능한 미래를 만들어갑니다.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "설립일", value: "2019.02.12" },
              { label: "사원수", value: "30명" },
              { label: "투자단계", value: "시리즈 A (누적 약 48억원)" },
              { label: "사업분야", value: "스마트시티 구축 및 건물 에너지 절감 솔루션" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-surface-elevated p-6"
              >
                <p className="text-sm font-medium text-primary">{item.label}</p>
                <p className="mt-2 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executives */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Leadership</p>
          <h2 className="mt-2 text-3xl font-bold">경영진</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {executives.map((exec) => (
              <div key={exec.name} className="rounded-2xl border border-border bg-surface-elevated p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {exec.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary">{exec.role}</p>
                    <p className="text-xl font-bold">{exec.name}</p>
                    <p className="text-sm text-muted">{exec.team}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {exec.description}
                </p>
                <ul className="mt-4 space-y-1">
                  {exec.details.map((d) => (
                    <li key={d} className="text-sm text-muted">
                      · {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Organization</p>
          <h2 className="mt-2 text-3xl font-bold">조직 구성</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {orgStructure.map((org) => (
              <div
                key={org.name}
                className="rounded-2xl border border-border bg-surface-elevated p-6 text-center"
              >
                <p className="text-lg font-bold">{org.name}</p>
                <p className="mt-2 text-sm text-muted">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Location</p>
          <h2 className="mt-2 text-3xl font-bold">오시는 길</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface-elevated p-8">
              <p className="text-lg font-bold">본사</p>
              <p className="mt-2 text-muted">
                인천광역시 연수구 컨벤시아대로 204, 104호 인스타2
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-elevated p-8">
              <p className="text-lg font-bold">기업부설연구소 (서울지사)</p>
              <p className="mt-2 text-muted">
                서울특별시 강남구 강남대로 162길 22 2,4F
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">함께 성장할 파트너를 찾습니다</h2>
          <p className="mt-4 text-white/70">
            에너지 솔루션 상담, 파트너십, 채용 등 어떤 문의든 환영합니다.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  );
}
