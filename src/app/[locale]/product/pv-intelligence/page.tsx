import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "PV Intelligence - Solar Plant Monitoring - Ninewatt",
    description: t("pvIntelligence.heroDesc"),
  };
}

export default async function PVIntelligencePage() {
  const t = await getTranslations("product");
  const archSteps = t.raw("pvIntelligence.archSteps") as { label: string; sub: string }[];
  const featureItems = t.raw("pvIntelligence.featureItems") as { title: string; desc: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Solar Plant Monitoring System
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            PV Intelligence
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("pvIntelligence.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("pvIntelligence.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("pvIntelligence.requestDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.systemArch")}</h2>
          <p className="mt-3 text-muted">
            {t("pvIntelligence.systemArchDesc")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {archSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="rounded-xl border border-border px-6 py-4 text-center">
                  <p className="text-sm font-bold">{step.label}</p>
                  <p className="mt-1 text-xs text-muted">{step.sub}</p>
                </div>
                {i < 2 && (
                  <svg
                    className="hidden h-5 w-5 shrink-0 text-primary sm:block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.keyFeatures")}</h2>
          <div className="mt-10 space-y-10">
            {featureItems.map((item, i) => (
              <div key={i} className="md:flex md:gap-8">
                <h3 className="shrink-0 text-lg font-bold md:w-52">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted md:mt-0">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Equipment */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.equipment")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">{t("pvIntelligence.inverter")}</p>
              <p className="mt-2 text-sm text-muted">
                {t("pvIntelligence.inverterDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">{t("pvIntelligence.rtu")}</p>
              <p className="mt-2 text-sm text-muted">
                {t("pvIntelligence.rtuDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <p className="text-sm font-bold">{t("pvIntelligence.collectionCycle")}</p>
              <p className="mt-2 text-sm text-muted">{t("pvIntelligence.collectionCycleDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">
            {t("pvIntelligence.ctaTitle")}
          </h2>
          <p className="mt-3 text-muted">
            {t("pvIntelligence.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("pvIntelligence.ctaDemo")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
