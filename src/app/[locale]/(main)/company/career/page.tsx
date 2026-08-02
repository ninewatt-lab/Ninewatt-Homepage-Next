import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return buildMetadata({
    locale,
    path: "/company/career",
    title: t("meta.career.title"),
    description: t("meta.career.description"),
  });
}

export default async function CareerPage() {
  const t = await getTranslations("company");

  const values = t.raw("career.values") as Array<{ title: string; desc: string }>;
  const benefitCategories = t.raw("career.benefitCategories") as Array<{
    category: string;
    items: Array<{ title: string; desc: string }>;
  }>;
  const steps = t.raw("career.steps") as Array<{ step: string; title: string; desc: string }>;

  const valueIcons = [
    <svg key="growth" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      <path d="M2 20l4-4m0 0l4-4m-4 4l4 4m-4-4l-4-4" />
      <path d="M12 20V4m0 0l4 4m-4-4l-4 4" />
      <path d="M18 20V10m0 0l3 3m-3-3l-3 3" />
    </svg>,
    <svg key="challenge" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>,
    <svg key="action" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
      <path d="M5 3l14 9-14 9V3z" />
    </svg>,
  ];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("career.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("career.subtitle")}
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="border-b border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Culture
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">
            {t("career.cultureTitle")}
          </h3>
          <p className="mt-4 max-w-2xl text-base text-muted leading-relaxed">
            {t("career.cultureDesc")}
          </p>
        </div>
      </section>

      {/* Talent */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Talent
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">
            {t("career.talentTitle")}
          </h3>
          <p className="mt-4 max-w-2xl text-base text-muted">
            {t("career.talentSubtitle")}
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {valueIcons[i]}
                </div>
                <h4 className="mt-4 text-xl font-semibold">{v.title}</h4>
                <p className="mt-2 text-base leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Benefits
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{t("career.benefitsTitle")}</h3>

          <div className="mt-8 space-y-6">
            {benefitCategories.map((group) => (
              <div key={group.category}>
                <h4 className="mb-3 text-base font-bold">
                  {group.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(group.items ?? []).map((item) => (
                    <span
                      key={item.title}
                      className="rounded-full border border-border bg-white px-4 py-1.5 text-base dark:bg-white/5"
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruit */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Recruit
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{t("career.recruitTitle")}</h3>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {s.step}
                </div>
                <div className="sm:mt-3">
                  <h4 className="text-base font-semibold">{s.title}</h4>
                  <p className="mt-1 text-base text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            {t("career.ctaTitle")}
          </h3>
          <p className="mt-3 text-base text-muted">
            {t("career.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://www.saramin.co.kr/zf_user/company-info/view?csn=K2w0aUxjR2J5VE9PeCtGaXdxWCtTUT09&popup_yn=y"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              {t("career.saraminButton")}
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              {t("career.ctaButton")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
