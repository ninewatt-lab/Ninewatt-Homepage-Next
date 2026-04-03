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

const serviceIcons: Record<string, React.ReactNode> = {
  cases: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 011.15.58m-5.8-.08a2.251 2.251 0 00-1.15.58m0 0a48.394 48.394 0 00-1.123.08A2.25 2.25 0 005.25 6.108v11.142A2.25 2.25 0 007.5 19.5h.75" />
    </svg>
  ),
  rnd: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  services: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  global: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.558" />
    </svg>
  ),
};

export default async function SolutionsPage() {
  const t = await getTranslations("solutions");
  const tp = await getTranslations("product");
  const solutions = t.raw("overview.solutions") as Array<{
    id: string;
    title: string;
    desc: string;
    items: string[];
  }>;
  const serviceLinks = t.raw("overview.serviceLinks") as Array<{
    label: string;
    href: string;
    icon: string;
    desc: string;
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

      {/* Service Links */}
      <ScrollReveal>
        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold">{t("overview.serviceLinksTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("overview.serviceLinksDesc")}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as "/solutions/cases"}
                  className="group relative flex flex-col rounded-xl border border-border p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                      {serviceIcons[link.icon]}
                    </span>
                    <svg className="h-4 w-4 -translate-x-1 text-muted/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-semibold tracking-tight">{link.label}</p>
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                    {link.desc}
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
