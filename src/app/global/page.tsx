import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "글로벌 - Ninewatt",
  description: "나인와트의 글로벌 사업 현황. 일본, 영국, 프랑스, 미국",
};

const countries = [
  {
    country: "일본",
    flag: "JP",
    tagColor: "bg-red-500/10 text-red-400",
    items: [
      "2024.03 일본 시나넨 홀딩스 주식회사와 업무협약 체결",
      "2024.06 시나넨 홀딩스, 니이가타현 츠난마치(지자체)와 3주간 업무협약 체결",
      "2024.12 츠난마치 대상 지자체 및 시민 공동참가형 스마트시티플랫폼 실증 프로젝트 진행",
      "2024 창업진흥원 해외실증(PoC) 진출사업 수행 완료",
      "2025.06 일본 PBADAO 주식회사와 업무협약 체결",
      "2025.07 일본 아즈빌 주식회사와 NDA 체결",
    ],
  },
  {
    country: "영국",
    flag: "GB",
    tagColor: "bg-blue-500/10 text-blue-400",
    items: [
      "Thurrock council - Corringham 지역 대상 PoC 진행",
      "R&D 한영 국제공동연구과제 수행 중 (도시 건물 넷 제로 혁신적 전환 위한 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발)",
    ],
  },
  {
    country: "프랑스",
    flag: "FR",
    tagColor: "bg-indigo-500/10 text-indigo-400",
    items: [
      "2023.03 Toltek (건축업자를 위한 솔루션 개발 스타트업)과 업무협약 체결",
    ],
  },
  {
    country: "미국",
    flag: "US",
    tagColor: "bg-emerald-500/10 text-emerald-400",
    items: [
      "2024 OpenAI 협업 파트너사 선정",
      "2025.11 JCI, NRGinsight와 3자간 구매계약서 체결, 500불 수출 발생",
    ],
  },
];

export default function GlobalPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold text-primary">Global Business</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">글로벌</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            일본, 영국, 프랑스, 미국 — 4개국에서 에너지 솔루션을 확장하고 있습니다
          </p>
        </div>
      </section>

      {/* Country Cards */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            {countries.map((c) => (
              <div
                key={c.country}
                className="rounded-2xl border border-border bg-surface-elevated p-8"
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c.tagColor}`}>
                    {c.flag}
                  </span>
                  <h3 className="text-xl font-bold">{c.country}</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-muted/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global TF */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Global Task Force</p>
          <h2 className="mt-2 text-3xl font-bold">해외사업 전담 TF</h2>
          <p className="mt-4 text-muted">
            PM, 연구원, 풀스택 엔지니어, AI 백엔드 엔지니어로 구성된 전담 조직이 해외사업을 추진합니다.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { role: "PM", name: "김다혜", desc: "일본어 통번역, 서비스 및 사업 기획" },
              { role: "PM / Researcher", name: "김랑", desc: "유럽 사업 PM, 건물에너지 자동진단 보고 시스템 구축" },
              { role: "Full-stack Engineer", name: "정홍", desc: "건물 에너지 및 GIS 데이터 가시화 솔루션 설계 및 개발" },
              { role: "AI Backend Engineer", name: "이동헌", desc: "건물 에너지 + GIS 데이터 분석, LLM/RAG 기반 솔루션 기획 및 백엔드" },
            ].map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-surface-elevated p-6">
                <p className="text-xs font-semibold text-primary">{m.role}</p>
                <p className="mt-1 text-lg font-bold">{m.name}</p>
                <p className="mt-2 text-sm text-muted">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">글로벌 파트너십 문의</h2>
          <p className="mt-4 text-white/70">
            해외 사업 협력 및 파트너십에 관심이 있으시면 연락해 주세요.
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
