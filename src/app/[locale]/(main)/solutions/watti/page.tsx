import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductTrackRecord, type TrackRecordItem } from "@/components/ProductTrackRecord";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "Watti - 3D Building Energy Platform - Ninewatt",
    description: t("watti.heroDesc"),
  };
}

const trackRecord: TrackRecordItem[] = [
  { year: 2019, type: "사업화", name: "SW융합 맞춤형 글로벌 지원사업", period: "2019.10~2019.12", org: "인천테크노파크" },
  { year: 2019, type: "사업화", name: "TIPS 해외마케팅 지원사업 — 민관공동 창업자 발굴육성", period: "2019.08~2020.07", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2021, type: "R&D", name: "AI기반 에너지 재난대응 플랫폼 개발 (인공지능중심산업융합집적단지조성)", period: "2021.01~2023.12", department: "과학기술정보통신부", org: "서울대학교 산학협력단" },
  { year: 2021, type: "R&D", name: "클라우드 기반 에너지 진단솔루션 SaaS 전환 (핵심산업 클라우드 플래그십)", period: "2021.05~2021.12", department: "과학기술정보통신부", org: "정보통신산업진흥원" },
  { year: 2022, type: "R&D", name: "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "R&D", name: "그린리모델링 효율향상을 위한 디지털진단 모듈화 기술", period: "2022.04~2024.12", department: "국토교통부", org: "국토교통과학기술진흥원" },
  { year: 2022, type: "사업화", name: "그린벤처 프로그램 사업화", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "지원사업", name: "인천서구강소특구 특화성장패키지", period: "2022.12~2023.05", org: "연구개발특구진흥재단" },
  { year: 2022, type: "지원사업", name: "서울창업허브 대기업 협력 프로그램 (LS일렉트릭)", period: "2022.09~2023.02", org: "서울산업진흥원" },
  { year: 2023, type: "R&D", name: "건물에너지 소비 데이터 통합관리 기반 구축", period: "2023.04~2026.12", department: "국토교통부", org: "한국건설기술연구원" },
  { year: 2023, type: "지원사업", name: "강남구청 실증 지원사업", period: "2023.07~2023.12", org: "창업진흥원" },
  { year: 2023, type: "PoC", name: "KSC 데이터 기반 건물에너지 성능진단 및 그린리모델링 솔루션", period: "2023.06~2023.11", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2023, type: "PoC", name: "서울 스마트도시 솔루션 해외(런던) 실증", period: "2023.12~2024.12", org: "서울디지털재단" },
  { year: 2023, type: "지원사업", name: "스케일업 챌린지랩 (글로벌 진출)", period: "2023.04~2023.11", org: "인천테크노파크" },
  { year: 2024, type: "R&D", name: "도시 건물 넷 제로 AI어시스턴트 건물 에너지 분석 기술 및 플랫폼 개발", period: "2024.07~2027.04", department: "국토교통부", org: "국토교통과학기술진흥원" },
  { year: 2024, type: "지원사업", name: "글로벌 기업 협업 프로그램 — ChatGPT 기반 건물 전력사용량 예측 및 ESS 최적 제어", period: "2024.05~2024.12", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2024, type: "PoC", name: "해외실증(PoC) 지원 프로그램", period: "2024.05~2024.11", department: "중소벤처기업부", org: "창업진흥원" },
  { year: 2025, type: "지원사업", name: "그린벤처 유망기업 글로벌 진출지원 프로그램", department: "중소벤처기업부" },
];

export default async function WattiPage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("watti"),
  ]);
  const analysisItems = t.raw("watti.analysisItems") as string[];
  const dataItems = t.raw("watti.dataItems") as string[];
  const govItems = t.raw("watti.govItems") as string[];
  const cases = t.raw("watti.cases") as { title: string; location: string; desc: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Open Data-Based Platform
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Watti
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("watti.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("watti.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("watti.requestDemo")}
            </Link>
            <a
              href="/files/NINEWATT_WATTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("watti.downloadPdf")}
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("watti.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Product Video */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl">
          <video
            className="h-auto w-full rounded-2xl"
            autoPlay
            loop
            muted
            playsInline
          >
            <source
              src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/watti-scene.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Big data stat */}
      <section className="border-b border-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3">
          <span className="text-4xl font-bold text-primary">134,000건+</span>
          <span className="text-muted">{t("watti.bigDataStat")}</span>
        </div>
      </section>

      {/* What Watti does */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-5">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold">{t("watti.coreCapabilities")}</h2>
              <p className="mt-3 text-base text-muted leading-relaxed">
                {t("watti.coreCapabilitiesDesc")}
              </p>
            </div>
            <div className="md:col-span-3 space-y-6">
              <div>
                <h3 className="text-base font-semibold">{t("watti.analysisModules")}</h3>
                <ul className="mt-3 space-y-2">
                  {analysisItems.map((item, i) => (
                    <li key={i} className="text-base text-muted leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold">{t("watti.dataTypes")}</h3>
                <ul className="mt-3 space-y-2">
                  {dataItems.map((item, i) => (
                    <li key={i} className="text-base text-muted leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Government use cases */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("watti.govUseCases")}</h2>
          <p className="mt-3 text-base text-muted">
            {t("watti.govUseCasesDesc")}
          </p>
          <ul className="mt-8 space-y-3">
            {govItems.map((item, i) => (
              <li key={i} className="border-l-2 border-primary pl-4 text-base">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Studies */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("watti.caseStudies")}</h2>
          <div className="mt-10 space-y-10">
            {cases.map((cs, i) => (
              <div key={i} className="md:flex md:gap-8">
                <div className="mb-2 md:mb-0 md:w-48 shrink-0">
                  <h3 className="text-xl font-bold">{cs.title}</h3>
                  <p className="text-base text-muted">{cs.location}</p>
                </div>
                <p className="text-base leading-relaxed text-muted">
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
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("watti.ctaTitle")}</h2>
            <p className="mt-2 text-base text-muted">
              {t("watti.ctaDesc")}
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("watti.ctaContact")}
            </Link>
            <a
              href="/files/NINEWATT_WATTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("watti.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
