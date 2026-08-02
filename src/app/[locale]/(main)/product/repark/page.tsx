import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ProductTrackRecord, type TrackRecordItem } from "@/components/ProductTrackRecord";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return buildMetadata({
    locale,
    path: "/product/repark",
    title: t("meta.repark.title"),
    description: t("meta.repark.description"),
  });
}

const trackRecord: TrackRecordItem[] = [
  { year: 2023, type: "지원사업", name: "실증 상용화 프로그램 — 인천 센트럴파크, 해돋이공원 조명시설 관리", period: "2023.03~2023.11", org: "인천테크노파크" },
  { year: 2023, type: "R&D", name: "스케일업 팁스 투자연계 — 에너지맵 기반 수요반응형 모듈러 버티포트 기술 개발", period: "2023.12~2026.12", department: "중소벤처기업부" },
  { year: 2023, type: "PoC", name: "미래 모빌리티 허브의 에너지 효율화 관리를 위한 알고리즘 및 시뮬레이션 개발", period: "2023.11~2024.07", org: "한전KDN" },
  { year: 2023, type: "지원사업", name: "2차 기술개발제품 공공기관 실증지원 사업", org: "현대엔지비" },
];

export default async function REparkPage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("repark"),
  ]);
  const tags = t.raw("repark.tags") as string[];
  const flows = t.raw("repark.flows") as { role: string; flow: string }[];
  const expansionItems = t.raw("repark.expansionItems") as string[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Smart Facility Management
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            RE:park
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("repark.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("repark.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("repark.serviceInquiry")}
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("repark.downloadPdf")}
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("repark.goToService")} &rarr;
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
              src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/repark-scene.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Service features — inline tags */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-3 text-base">
          {tags.map((item, i) => (
            <span key={i} className="rounded-full border border-border px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Service flow */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("repark.serviceFlow")}</h2>
          <p className="mt-3 text-base text-muted">{t("repark.serviceFlowDesc")}</p>
          <div className="mt-10 space-y-10">
            {flows.map((item, i) => (
              <div key={i} className="md:flex md:items-baseline md:gap-8">
                <h3 className="md:w-32 shrink-0 text-xl font-bold text-primary">
                  {item.role}
                </h3>
                <p className="mt-1 md:mt-0 text-base text-muted">{item.flow}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expansion */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("repark.expansion")}</h2>
          <p className="mt-3 text-base text-muted">
            {t("repark.expansionDesc")}
          </p>
          <ul className="mt-8 space-y-3">
            {expansionItems.map((item, i) => (
              <li key={i} className="border-l-2 border-primary pl-4 text-base">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Study */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("repark.caseStudy")}</h2>
          <div className="mt-8 rounded-xl border border-border p-6 md:p-8">
            <h3 className="text-xl font-bold">{t("repark.caseTitle")}</h3>
            <p className="mt-2 text-base text-muted">
              {t("repark.casePartners")}
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-base text-muted">{t("repark.phase1Label")}</p>
                <p className="mt-1 text-2xl font-bold text-primary">{t("repark.phase1Value")}</p>
              </div>
              <div>
                <p className="text-base text-muted">{t("repark.phase2Label")}</p>
                <p className="mt-1 text-2xl font-bold text-primary">{t("repark.phase2Value")}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="md:flex md:gap-4">
                <span className="text-base font-medium md:w-20 shrink-0">2023</span>
                <p className="text-base text-muted">{t("repark.timeline2023")}</p>
              </div>
              <div className="md:flex md:gap-4">
                <span className="text-base font-medium md:w-20 shrink-0">2024~</span>
                <p className="text-base text-muted">{t("repark.timeline2024")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Record */}
      <ProductTrackRecord items={trackRecord} />

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("repark.ctaTitle")}</h2>
            <p className="mt-2 text-base text-muted">
              {t("repark.ctaDesc")}
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("repark.ctaContact")}
            </Link>
            <a
              href="/files/NINEWATT_RE-PARK.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("repark.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
