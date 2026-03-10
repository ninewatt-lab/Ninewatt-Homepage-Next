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
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">회사소개</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            GX 실현을 이끄는 에너지 기술로,
            스마트시티와 탄소중립 사회에 기여합니다.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">비전</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            도시 및 건물 에너지 진단 전문가인 CEO를 필두로,
            AI/빅데이터 기반 건물 에너지 플랫폼 연구개발을 주요 사업으로 추진하고 있습니다.
            스마트시티 구축 및 건물 에너지 절감 솔루션을 통해 지속 가능한 미래를 만들어갑니다.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-4">
            {[
              { label: "설립일", value: "2019.02.12" },
              { label: "사원수", value: "30명" },
              { label: "투자단계", value: "시리즈 A (누적 약 48억원)" },
              { label: "사업분야", value: "스마트시티 구축 및 건물 에너지 절감 솔루션" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-medium text-muted">{item.label}</dt>
                <dd className="mt-1 font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Executives */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">경영진</h2>
          <div className="mt-8 space-y-8">
            {executives.map((exec) => (
              <div key={exec.name} className="border-l-2 border-primary pl-6">
                <p className="text-xs font-medium text-muted">{exec.role} · {exec.team}</p>
                <p className="mt-1 text-lg font-bold">{exec.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {exec.description}
                </p>
                <ul className="mt-3 space-y-1">
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
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">조직 구성</h2>
          <div className="mt-8 space-y-4">
            {orgStructure.map((org) => (
              <div
                key={org.name}
                className="border-l-2 border-border pl-6"
              >
                <p className="font-semibold">{org.name}</p>
                <p className="mt-0.5 text-sm text-muted">{org.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">오시는 길</h2>
          <table className="mt-8 w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 font-semibold align-top whitespace-nowrap">본사</td>
                <td className="py-4 text-muted">인천광역시 연수구 컨벤시아대로 204, 104호 인스타2</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 font-semibold align-top whitespace-nowrap">기업부설연구소 (서울지사)</td>
                <td className="py-4 text-muted">서울특별시 강남구 강남대로 162길 22 2,4F</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">함께 성장할 파트너를 찾습니다</h2>
            <p className="mt-1 text-sm text-muted">
              에너지 솔루션 상담, 파트너십, 채용 등 어떤 문의든 환영합니다.
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg border border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 md:mt-0"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  );
}
