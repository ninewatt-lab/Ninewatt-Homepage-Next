import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("career.title")} - Ninewatt`,
    description: t("career.subtitle"),
  };
}

export default async function CareerPage() {
  const t = await getTranslations("company");

  const values = t.raw("career.values") as Array<{
    title: string;
    desc: string;
  }>;
  const benefitCategories = t.raw("career.benefitCategories") as Array<{
    category: string;
    items: Array<{ title: string; desc: string }>;
  }>;
  const steps = t.raw("career.steps") as Array<{
    step: string;
    title: string;
    desc: string;
  }>;

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
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("career.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("career.subtitle")}
          </p>
        </div>
      </section>

      {/* Culture */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Culture
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{t("career.cultureTitle")}</h3>
          <p className="mt-4 max-w-2xl text-muted leading-relaxed">
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
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{t("career.talentTitle")}</h3>
          <p className="mt-4 max-w-2xl text-muted">
            {t("career.talentSubtitle")}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {valueIcons[i]}
                </div>
                <h4 className="mt-4 text-lg font-semibold">{v.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Benefits
          </h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight">{t("career.benefitsTitle")}</h3>

          <div className="mt-12 space-y-12">
            {benefitCategories.map((group) => (
              <div key={group.category}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted/70">
                  {group.category}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border p-5"
                    >
                      <h5 className="font-semibold">{item.title}</h5>
                      <p className="mt-1 text-sm text-muted">{item.desc}</p>
                    </div>
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

          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-start">
            {steps.map((s, i) => (
              <div key={s.step} className="flex flex-1 items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {s.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden h-0.5 flex-1 self-center bg-border sm:block" />
                )}
                <div className="sm:mt-4">
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="mt-1 text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            {t("career.ctaTitle")}
          </h3>
          <p className="mt-3 text-muted">
            {t("career.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:ninewatt@ninewatt.com"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M3 8l9 6 9-6" />
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>
              ninewatt@ninewatt.com
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
