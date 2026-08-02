import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOrganization, getCompanyInfo } from "@/lib/cms";
import { patentCounts } from "@/data/patents";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return buildMetadata({
    locale,
    path: "/company",
    title: t("meta.index.title"),
    description: t("meta.index.description"),
  });
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");

  const [orgData, companyInfoData] = await Promise.all([
    getOrganization(locale),
    getCompanyInfo(locale),
  ]);

  const companyInfo = t.raw("about.companyInfo") as Array<{
    label: string;
    value: string;
  }>;

  const orgTranslations = t.raw("about.orgItems") as Array<{
    name: string;
    desc: string;
    tags?: string[];
  }>;

  // 특허 건수는 patents.ts 에서 집계한다. 하드코딩하면 /company/patents 목록과
  // 갈라진다(실제로 홈 33건 / homeStats 36건으로 어긋나 있었다).
  const patents = patentCounts();

  const stats: { value: string; label: string; note?: string }[] = [
    { value: "2019", label: t("about.statsFounded") },
    { value: "30+", label: t("about.statsEmployees") },
    { value: "60+", label: t("about.statsProjects") },
    { value: "96.81%", label: t("about.statsGrowth") },
    {
      value: String(patents.total),
      label: t("about.statsPatents"),
      note: t("about.statsPatentsNote", { registered: patents.registered }),
    },
    {
      value: t("about.statsCountriesValue"),
      label: t("about.statsCountries"),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("about.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("about.subtitle")}
          </p>
          {/* 회사 한 줄 정의. 문맥 없이도 성립해야 검색·AI 엔진이 인용할 수 있다 */}
          <p className="mt-6 max-w-3xl text-base leading-relaxed">
            {t("about.definition")}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
            {t("about.globalNote")}
          </p>
        </div>
      </section>

      {/* 한눈에 보기 — 수치는 전부 src/data 에서 산출한다 */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.statsTitle")}</h2>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-sm text-muted">{stat.label}</dt>
                {stat.note && (
                  <p className="mt-0.5 text-xs text-muted/80">{stat.note}</p>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.vision")}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            {t("about.visionDesc")}
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 text-base md:flex md:justify-between">
            {companyInfo.map((item) => (
              <div key={item.label}>
                <dt className="text-sm text-muted">{item.label}</dt>
                <dd className="mt-1 font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>

          <hr className="my-10 border-border" />

          <div className="space-y-3">
            {(t.raw("about.affiliations") as Array<{ label: string; items: string[] }>).map((group) => (
              <div key={group.label} className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="w-28 shrink-0 text-sm font-semibold">{group.label}</span>
                <p className="text-base text-muted">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.organization")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">
            {t("about.orgSubtitle")}
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {orgTranslations.map((org) => (
              <div key={org.name} className="bg-background p-6">
                <h3 className="text-base font-semibold">{org.name}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">
                  {org.desc}
                </p>
                {org.tags && org.tags.length > 0 && (
                  <p className="mt-3 text-sm text-muted/70">
                    {org.tags.join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.location")}</h2>
          <table className="mt-8 w-full text-base">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 font-semibold align-top whitespace-nowrap">{t("about.hqLabel")}</td>
                <td className="py-4 text-muted">{companyInfoData.hqAddress || t("about.hqAddress")}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 font-semibold align-top whitespace-nowrap">{t("about.rndLabel")}</td>
                <td className="py-4 text-muted">{companyInfoData.rndAddress || t("about.rndAddress")}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 pr-6 font-semibold align-top whitespace-nowrap">{t("about.ggLabel")}</td>
                <td className="py-4 text-muted">{t("about.ggAddress")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("about.ctaTitle")}</h2>
            <p className="mt-1 text-base text-muted">
              {t("about.ctaDesc")}
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg border border-primary bg-primary px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-primary/90 md:mt-0"
          >
            {t("about.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
