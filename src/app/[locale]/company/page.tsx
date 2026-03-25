import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getExecutives, getOrganization, getCompanyInfo } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: "Company - Ninewatt",
    description: `${t("about.title")}. ${t("about.subtitle")}`,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");

  const [executivesData, orgData, companyInfoData] = await Promise.all([
    getExecutives(locale),
    getOrganization(locale),
    getCompanyInfo(locale),
  ]);

  const companyInfo = t.raw("about.companyInfo") as Array<{
    label: string;
    value: string;
  }>;

  const executives = (executivesData.members ?? []) as Array<{
    role?: string | null;
    name?: string | null;
    team?: string | null;
    description?: string | null;
    details?: Array<{ item?: string | null }> | null;
  }>;
  const orgItems = (orgData.departments ?? []) as Array<{
    name?: string | null;
    description?: string | null;
  }>;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("about.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.vision")}</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            {t("about.visionDesc")}
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 text-sm md:grid-cols-4">
            {companyInfo.map((item) => (
              <div key={item.label}>
                <dt className="font-medium text-muted">{item.label}</dt>
                <dd className="mt-1 font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 space-y-3">
            {(t.raw("about.affiliations") as Array<{ label: string; items: string[] }>).map((group) => (
              <div key={group.label} className="flex items-baseline gap-x-3">
                <span className="w-24 shrink-0 text-xs font-semibold text-foreground">{group.label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executives */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.executives")}</h2>
          <div className="mt-8 space-y-8">
            {executives.map((exec) => (
              <div key={exec.name} className="border-l-2 border-primary pl-6">
                <p className="text-xs font-medium text-muted">{exec.role} · {exec.team}</p>
                <p className="mt-1 text-lg font-bold">{exec.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {exec.description}
                </p>
                {exec.details && (
                  <ul className="mt-3 space-y-1">
                    {(exec.details as Array<{ item?: string }>).map((d, i) => (
                      <li key={i} className="text-sm text-muted">
                        · {typeof d === "string" ? d : d.item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("about.organization")}</h2>
          <div className="mt-8 space-y-4">
            {orgItems.map((org) => (
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
          <h2 className="text-2xl font-bold">{t("about.location")}</h2>
          <table className="mt-8 w-full text-sm">
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
            <h2 className="text-xl font-bold">{t("about.ctaTitle")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("about.ctaDesc")}
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-lg border border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 md:mt-0"
          >
            {t("about.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
