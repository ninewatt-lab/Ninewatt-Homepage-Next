import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product" });
  return buildMetadata({
    locale,
    path: "/product",
    title: t("meta.index.title"),
    description: t("meta.index.description"),
  });
}

const categories = [
  {
    titleKey: "productMenu.ess" as const,
    products: [
      {
        href: "/product/shared-ess" as const,
        nameKey: "productMenu.sharedEssLabel" as const,
        badge: null,
        tagline: "Shared ESS for Grid Flexibility",
        descKey: "list.sharedEssDesc" as const,
      },
      {
        href: "/product/peak-ess" as const,
        nameKey: "productMenu.peakEssLabel" as const,
        badge: null,
        tagline: "AI-based Peak Shaving ESS Control",
        descKey: "list.peakEssDesc" as const,
      },
    ],
  },
  {
    titleKey: "productMenu.ems" as const,
    products: [
      {
        href: "/product/bems" as const,
        name: "BEMS",
        badge: null,
        tagline: "Building Energy Management System",
        descKey: "list.bemsDesc" as const,
      },
      {
        href: "/product/pv-intelligence" as const,
        nameKey: "productMenu.pvRemsLabel" as const,
        badge: null,
        tagline: "Solar Plant Monitoring System",
        descKey: "list.pvIntelligenceDesc" as const,
      },
    ],
  },
  {
    titleKey: "productMenu.platform" as const,
    products: [
      {
        href: "/product/greenplanner" as const,
        name: "GreenPlanner",
        badge: null,
        tagline: "Green Remodeling Planner",
        descKey: "list.greenplannerDesc" as const,
      },
      {
        href: "/product/repark" as const,
        name: "RE:park",
        badge: null,
        tagline: "Smart Facility Management",
        descKey: "list.reparkDesc" as const,
      },
      {
        href: "/product/solar-site" as const,
        name: "SolarScope",
        badge: null,
        tagline: "Solar Site Analysis Platform",
        descKey: "list.solarScopeDesc" as const,
      },
    ],
  },
];

export default async function ProductPage() {
  const [t, tc] = await Promise.all([
    getTranslations("product"),
    getTranslations("common"),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("list.title")}</h1>
          <p className="mt-4 max-w-lg text-lg text-muted">
            {t("list.subtitle")}
          </p>
        </div>
      </section>

      {/* Product list by category */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          {categories.map((category, ci) => (
            <div key={category.titleKey} className={ci > 0 ? "mt-16 pt-16 border-t border-border" : ""}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                {tc(category.titleKey)}
              </h2>
              <div className="mt-4 space-y-1">
                {category.products.map((product) => {
                  const displayName = "nameKey" in product ? tc((product as { nameKey: string }).nameKey) : (product as { name: string }).name;
                  return (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="group -mx-4 flex flex-col gap-1.5 rounded-lg px-4 py-5 transition-colors hover:bg-surface md:flex-row md:items-center md:gap-8"
                  >
                    <div className="flex items-center gap-3 md:w-56 shrink-0">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {displayName}
                      </h3>
                      {product.badge && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-primary">
                        {product.tagline}
                      </p>
                      <p className="mt-1 text-base leading-relaxed text-muted">
                        {t(product.descKey)}
                      </p>
                    </div>
                    <svg
                      className="hidden md:block shrink-0 h-5 w-5 text-muted group-hover:text-primary transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
