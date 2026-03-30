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

const platformProducts = [
  {
    href: "/solutions/opti" as const,
    name: "Opti",
    badge: "CES 2026",
    tagline: "AI Energy Advisor",
    descKey: "optiDesc" as const,
  },
  {
    href: "/solutions/watti" as const,
    name: "Watti",
    badge: null,
    tagline: "3D Building Energy Platform",
    descKey: "wattiDesc" as const,
  },
  {
    href: "/solutions/save-e" as const,
    name: "Save-E",
    badge: null,
    tagline: "Smart Energy Insight",
    descKey: "saveEDesc" as const,
  },
];

export default async function SolutionsPage() {
  const t = await getTranslations("solutions");
  const tp = await getTranslations("product");
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

      {/* Platform Products */}
      <ScrollReveal>
        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold">{t("overview.platformTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("overview.platformDesc")}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {platformProducts.map((product) => (
                <Link
                  key={product.href}
                  href={product.href}
                  className="group relative rounded-xl border border-border p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  {product.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      {product.badge}
                    </span>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{product.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {tp(`list.${product.descKey}`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {t("overview.learnMore")}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

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
