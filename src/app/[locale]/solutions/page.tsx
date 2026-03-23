import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import ScrollReveal from "@/components/ScrollReveal";
import SolutionCards from "@/components/SolutionCards";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "Solutions - Ninewatt",
    description: t("overview.subtitle"),
  };
}

export default async function SolutionsPage() {
  const t = await getTranslations("solutions");
  const solutions = t.raw("overview.solutions") as Array<{
    id: string;
    title: string;
    desc: string;
    items: string[];
  }>;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("overview.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("overview.subtitle")}
          </p>
        </div>
      </section>

      {/* Pipeline Flow Indicator */}
      <ScrollReveal>
        <section className="border-b border-border px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-0 overflow-x-auto">
              {solutions.map((sol, idx) => (
                <div key={sol.id} className="flex items-center">
                  {/* Step dot + label */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <span className="max-w-[100px] text-center text-[11px] font-medium leading-tight text-muted">
                      {sol.title}
                    </span>
                  </div>
                  {/* Arrow connector */}
                  {idx < solutions.length - 1 && (
                    <div className="mx-1 flex items-center md:mx-3">
                      <div className="h-px w-6 bg-border md:w-12" />
                      <svg viewBox="0 0 8 12" className="size-2.5 -ml-px text-border" fill="currentColor">
                        <path d="M0 0l8 6-8 6V0z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Solution Cards Grid */}
      <ScrollReveal>
        <section className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <SolutionCards solutions={solutions} />
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <ScrollReveal>
        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">{t("overview.ctaTitle")}</h2>
              <p className="mt-1 text-sm text-muted">
                {t("overview.ctaDesc")}
              </p>
            </div>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark md:mt-0"
            >
              {t("overview.ctaButton")}
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
