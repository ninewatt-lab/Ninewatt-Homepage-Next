import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "Product - Ninewatt",
    description: t("list.subtitle"),
  };
}

const products = [
  {
    href: "/product/opti" as const,
    name: "Opti",
    badge: "CES 2026",
    tagline: "AI Energy Advisor",
    descKey: "list.optiDesc" as const,
  },
  {
    href: "/product/watti" as const,
    name: "Watti",
    badge: null,
    tagline: "3D Building Energy Platform",
    descKey: "list.wattiDesc" as const,
  },
  {
    href: "/product/greenplanner" as const,
    name: "GreenPlanner",
    badge: null,
    tagline: "Green Remodeling Planner",
    descKey: "list.greenplannerDesc" as const,
  },
  {
    href: "/product/save-e" as const,
    name: "Save-E",
    badge: null,
    tagline: "Smart Energy Insight",
    descKey: "list.saveEDesc" as const,
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
  {
    href: "/product/pv-intelligence" as const,
    name: "PV Intelligence",
    badge: null,
    tagline: "Solar Plant Monitoring System",
    descKey: "list.pvIntelligenceDesc" as const,
  },
];

export default async function ProductPage() {
  const t = await getTranslations("product");

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

      {/* Product list */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="divide-y divide-border">
            {products.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className="group flex flex-col gap-1 py-8 first:pt-0 last:pb-0 md:flex-row md:items-center md:gap-8"
              >
                <div className="flex items-center gap-3 md:w-56 shrink-0">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {product.badge && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">
                    {product.tagline}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
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
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
