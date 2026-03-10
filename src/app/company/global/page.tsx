import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글로벌 사업 - Ninewatt",
  description: "나인와트 글로벌 사업. 일본, 영국, 프랑스, 미국 4개국 에너지 솔루션 확장",
};

const countries = [
  {
    country: "일본",
    flag: "JP",
    items: [
      "2024.03 일본 시나넨 홀딩스 주식회사와 업무협약 체결",
      "2024.06 시나넨 홀딩스, 니이가타현 츠난마치(지자체)와 3주간 업무협약 체결",
      "2024.12 츠난마치 대상 스마트시티플랫폼 실증 프로젝트 진행",
      "2024 창업진흥원 해외실증(PoC) 진출사업 수행 완료",
      "2025.06 일본 PBADAO 주식회사와 업무협약 체결",
      "2025.07 일본 아즈빌 주식회사와 NDA 체결",
    ],
  },
  {
    country: "영국",
    flag: "GB",
    items: [
      "Thurrock council - Corringham 지역 대상 PoC 진행",
      "R&D 한영 국제공동연구과제 수행 중 (AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발)",
    ],
  },
  {
    country: "프랑스",
    flag: "FR",
    items: [
      "2023.03 Toltek (건축업자를 위한 솔루션 개발 스타트업)과 업무협약 체결",
    ],
  },
  {
    country: "미국",
    flag: "US",
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
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">글로벌 사업</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            일본, 영국, 프랑스, 미국 — 4개국에서 에너지 솔루션을 확장하고 있습니다
          </p>
        </div>
      </section>

      {/* Countries */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          {countries.map((c) => (
            <div key={c.country} className="border-l-2 border-primary pl-6">
              <h2 className="text-lg font-bold">
                {c.country}{" "}
                <span className="text-sm font-normal text-muted">{c.flag}</span>
              </h2>
              <ul className="mt-4 space-y-2">
                {c.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
