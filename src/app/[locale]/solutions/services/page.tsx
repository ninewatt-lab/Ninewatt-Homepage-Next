import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "용역과제 - Ninewatt",
    description: t("services.title"),
  };
}

const serviceProjects = [
  { client: "한국에너지기술연구원", period: "2025.07~2025.11", title: "산업단지 재생에너지 플랫폼 구축사업" },
  { client: "한국건설기술연구원", period: "2025.06~2025.10", title: "지역 단위 탄소배출량 가시화 시스템 고도화" },
  { client: "주식회사 네오스텍", period: "2025.06~2025.11", title: "스마트 조명 운영 데이터 최적화 서비스" },
  { client: "국토교통과학기술진흥원", period: "2025.05~2025.12", title: "경기도 스마트 ESS 통합자원관리시스템 고도화" },
  { client: "국토안전관리원", period: "2025.05~2025.12", title: "그린리모델링 최신기술 활용 기획 및 시범사업(GRAI)" },
  { client: "엘에스일렉트릭(주)", period: "2024.11~2024.12", title: "AI를 활용한 분석 보고서 생성" },
  { client: "경기연구원", period: "2024.09~2025.08", title: "경기도 광역 도시생태현황지도 및 RE100 플랫폼 서비스 구축" },
  { client: "엘에스일렉트릭(주)", period: "2024.07~2024.07", title: "피크저감형 ESS 최적제어 알고리즘 개발" },
  { client: "한국건설기술연구원", period: "2024.06~2024.11", title: "지역 단위 탄소배출량 가시화 시스템 개발" },
  { client: "엘에스일렉트릭(주)", period: "2024.01~2024.12", title: "고도화된 에너지 분석 레포팅 Service(ver2.0)" },
  { client: "현대엔지비주식회사", period: "2023.12~2024.06", title: "미래 모빌리티 허브 에너지 효율화 알고리즘 및 시뮬레이션 개발" },
  { client: "엘에스일렉트릭(주)", period: "2023.04~2023.08", title: "스마트진단 MVP3.0 내 Energy Reporting Service 고도화" },
];

export default async function ServicesPage() {
  const t = await getTranslations("solutions");
  const headers = t.raw("services.tableHeaders") as { client: string; period: string; content: string };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("services.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("services.subtitleTemplate", {
              count: serviceProjects.length,
              partners: new Set(serviceProjects.map((p) => p.client)).size,
            })}
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-semibold text-muted">{headers.client}</th>
                  <th className="py-3 pr-4 font-semibold text-muted">{headers.period}</th>
                  <th className="py-3 font-semibold text-muted">{headers.content}</th>
                </tr>
              </thead>
              <tbody>
                {serviceProjects.map((p, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{p.client}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{p.period}</td>
                    <td className="py-3">{p.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA — inline with content */}
      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <p className="text-sm text-muted">{t("services.ctaText")}</p>
          <Link
            href="/contact"
            className="mt-4 inline-block text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary/80 md:mt-0"
          >
            {t("services.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
