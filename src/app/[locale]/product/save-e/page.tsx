import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductTrackRecord, type TrackRecordItem } from "@/components/ProductTrackRecord";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "Save-E - Smart Energy Insight - Ninewatt",
    description: t("saveE.heroDesc"),
  };
}

const trackRecord: TrackRecordItem[] = [
  { year: 2019, type: "R&D", name: "TIPS 민간투자주도형 기술창업지원 — 빅데이터 분석기반 건물에너지 절감 AI 플랫폼", period: "2019.07~2021.06", department: "중소벤처기업부", org: "주식회사 블루포인트파트너스" },
  { year: 2019, type: "R&D", name: "한국전력공사 에너지 스타트업 프로그램 — 에너지 소비패턴 분석 및 절감 AI 플랫폼", org: "한국전기산업진흥회" },
  { year: 2019, type: "사업화", name: "한전 에너지분야 사회적경제조직 임팩트투자 — ECC 및 솔루션 개발", period: "2019.11~2020.09", org: "한국사회투자" },
  { year: 2020, type: "사업화", name: "기업협력군 에너지 동행 사업", period: "2020.04~2020.11", department: "한국에너지공단", org: "한국전력공사" },
  { year: 2020, type: "사업화", name: "에너지바우처 연계형 고독사 사전예방 SW개발 (SW융합클러스터 2.0)", period: "2020.05~2020.12", org: "인천테크노파크" },
  { year: 2020, type: "지원사업", name: "연구개발 기획 컨설팅 지원사업 — 에너지바우처 연계형 적정 에너지소비 권장서비스", period: "2020.04~2020.08", org: "인천테크노파크" },
  { year: 2021, type: "R&D", name: "경북지역 풍력에너지 클러스터 인재양성사업", period: "2021.04~2025.12", department: "산업통상자원부", org: "경북테크노파크" },
  { year: 2021, type: "사업화", name: "기업협력군 에너지 동행 사업", period: "2021.04~2021.11", department: "한국에너지공단", org: "한국전력공사" },
  { year: 2021, type: "사업화", name: "DATA-STARS 데이터 활용 사업화 — 에너지 투자연계 AI 플랫폼", period: "2021.06~2021.10", org: "한국데이터산업진흥원" },
  { year: 2021, type: "용역", name: "공공건축물 에너지소비량 공개 및 성능개선 사업 제도 기술 지원 용역", period: "2021.10~2021.12", org: "한국건설기술연구원" },
  { year: 2022, type: "사업화", name: "기업협력군 에너지동행 사업", period: "2022.04~2022.11", department: "한국에너지공단", org: "한국전력공사" },
  { year: 2023, type: "용역", name: "스마트진단 MVP 3.0 Energy Reporting Service 고도화", period: "2023.04~2023.08", org: "LS일렉트릭" },
  { year: 2023, type: "용역", name: "공공건축물 에너지 소비량 데이터 검증·분석", period: "2023.12~2024.01", org: "에스큐아이소프트" },
  { year: 2023, type: "사업화", name: "공공건축물 그린리모델링 종합사업지원", period: "2023.05~2025.12", org: "국토안전관리원" },
  { year: 2023, type: "지원사업", name: "창업도약 패키지 — 도시단위 에너지효율화 솔루션", period: "2023.05~2024.02", org: "인천테크노파크" },
];

export default async function SaveEPage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("save-e"),
  ]);
  const items = t.raw("saveE.items") as string[];
  const advantageItems = t.raw("saveE.advantageItems") as { title: string; desc: string }[];
  const dataSources = t.raw("saveE.dataSources") as string[];
  const cases = t.raw("saveE.cases") as { title: string; location: string; result: string; desc: string }[];

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
            {t("saveE.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("saveE.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("saveE.requestDemo")}
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("saveE.downloadPdf")}
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("saveE.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* What Save-E analyzes */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold">{t("saveE.analysisItems")}</h2>
              <p className="mt-3 text-sm text-muted">
                {t("saveE.analysisItemsDesc")}
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {items.map((item, i) => (
                  <p key={i} className="border-b border-border py-2 text-sm">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("saveE.howItWorks")}</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold text-primary">{t("saveE.analysisTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("saveE.analysisDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{t("saveE.dashboardTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("saveE.dashboardDesc")}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{t("saveE.reportTitle")}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("saveE.reportDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("saveE.advantages")}</h2>
          <ul className="mt-8 space-y-5">
            {advantageItems.map((item, i) => (
              <li key={i} className="border-l-2 border-primary pl-4">
                <span className="font-medium">{item.title}</span>
                <p className="mt-1 text-sm text-muted">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Data sources */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("saveE.dataSourcesTitle")}</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {dataSources.map((item, i) => (
              <span key={i} className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("saveE.caseStudies")}</h2>
          <div className="mt-10 space-y-8">
            {cases.map((cs, i) => (
              <div key={i} className="md:flex md:gap-8 border-b border-border pb-8 last:border-0">
                <div className="mb-3 md:mb-0 md:w-56 shrink-0">
                  <h3 className="text-lg font-bold">{cs.title}</h3>
                  <p className="text-sm text-muted">{cs.location}</p>
                  <p className="mt-1 text-sm font-medium text-primary">{cs.result}</p>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {cs.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record */}
      <ProductTrackRecord items={trackRecord} />

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("saveE.ctaTitle")}</h2>
            <p className="mt-2 text-muted">
              {t("saveE.ctaDesc")}
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("saveE.ctaContact")}
            </Link>
            <a
              href="/files/NINEWATT_SAVE-E.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("saveE.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
