import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductTrackRecord, type TrackRecordItem } from "@/components/ProductTrackRecord";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "GreenPlanner - Green Remodeling Planner - Ninewatt",
    description: t("greenplanner.heroDesc"),
  };
}

const trackRecord: TrackRecordItem[] = [
  { year: 2021, type: "용역", name: "공공건축물 에너지소비량 공개 및 성능개선 사업 제도 기술 지원 용역", period: "2021.10~2021.12", org: "한국건설기술연구원" },
  { year: 2022, type: "R&D", name: "도시의 탄소감축량과 녹색금융을 융합한 그린리모델링 매칭 서비스", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "R&D", name: "그린리모델링 효율향상을 위한 디지털진단 모듈화 기술", period: "2022.04~2024.12", department: "국토교통부", org: "국토교통과학기술진흥원" },
  { year: 2022, type: "사업화", name: "그린벤처 프로그램 사업화", period: "2022.04~2025.03", department: "중소벤처기업부" },
  { year: 2022, type: "PoC", name: "SBA-KITA 영국 스마트시티 PoC", period: "2022.10~2023.02", org: "서울산업진흥원" },
  { year: 2023, type: "지원사업", name: "Smart-X City 인천도시공사 프로그램 (인천스타트업파크)", period: "2023.04~2023.11", org: "인천지식재산센터" },
  { year: 2023, type: "지원사업", name: "Smart-X energy LS일렉트릭 프로그램 (인천스타트업파크)", period: "2023.08~2023.11", org: "인천테크노파크" },
  { year: 2023, type: "사업화", name: "공공건축물 그린리모델링 종합사업지원", period: "2023.05~2025.12", org: "국토안전관리원" },
];

export default async function GreenPlannerPage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("greenplanner"),
  ]);
  const targetUsers = t.raw("greenplanner.targetUsers") as string[];
  const questions = t.raw("greenplanner.questions") as { q: string; a: string }[];
  const moreFeaturesItems = t.raw("greenplanner.moreFeaturesItems") as string[];
  const fundingItems = t.raw("greenplanner.fundingItems") as { program: string; maxAmount: string; terms: string; year: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Green Remodeling App
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            GreenPlanner
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("greenplanner.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("greenplanner.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("greenplanner.serviceInquiry")}
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("greenplanner.downloadPdf")}
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("greenplanner.goToService")} &rarr;
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
              src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/greenplanner-scene.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-6 text-sm text-muted">
          {targetUsers.map((user, i) => (
            <span key={i}>
              {i > 0 && <span className="text-border mr-6">|</span>}
              {user}
            </span>
          ))}
        </div>
      </section>

      {/* Features — Q&A style */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("greenplanner.questionsTitle")}</h2>
          <div className="mt-10 space-y-10">
            {questions.map((item, i) => (
              <div key={i} className="md:flex md:gap-8">
                <h3 className="md:w-64 shrink-0 text-lg font-bold">
                  {item.q}
                </h3>
                <p className="mt-2 md:mt-0 text-sm leading-relaxed text-muted">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("greenplanner.moreFeatures")}</h2>
          <ul className="mt-8 space-y-4">
            {moreFeaturesItems.map((item, i) => (
              <li key={i} className="border-l-2 border-primary pl-4 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Government Funding */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("greenplanner.funding")}</h2>
          <p className="mt-3 text-muted">
            {t("greenplanner.fundingDesc")}
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {fundingItems.map((f, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <p className="text-sm text-muted">{f.program}</p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {t("greenplanner.fundingMax")} {f.maxAmount}
                </p>
                <p className="mt-3 text-sm text-muted">{f.terms}</p>
                <p className="mt-1 text-xs text-muted">{f.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track Record */}
      <ProductTrackRecord items={trackRecord} />

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("greenplanner.ctaTitle")}</h2>
          <p className="mt-3 text-muted">
            {t("greenplanner.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("greenplanner.ctaButton")}
            </Link>
            <a
              href="/files/NINEWATT_GREENPLANNER.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("greenplanner.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
