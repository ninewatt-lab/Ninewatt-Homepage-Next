import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "PV Intelligence - Solar AI Monitoring Platform - Ninewatt",
    description: t("pvIntelligence.heroDesc"),
  };
}

export default async function PVIntelligencePage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("pv-intelligence"),
  ]);

  const problemItems = t.raw("pvIntelligence.problemItems") as string[];
  const diffItems = t.raw("pvIntelligence.diffItems") as { title: string; desc: string }[];
  const howItWorksSteps = t.raw("pvIntelligence.howItWorksSteps") as { step: string; title: string; desc: string }[];
  const aiDetectionScenarios = t.raw("pvIntelligence.aiDetectionScenarios") as { situation: string; what: string; action: string }[];
  const revenueItems = t.raw("pvIntelligence.revenueItems") as { title: string; desc: string }[];
  const dashboardFeatures = t.raw("pvIntelligence.dashboardFeatures") as { title: string; desc: string }[];
  const impactItems = t.raw("pvIntelligence.impactItems") as { value: string; label: string }[];
  const targetItems = t.raw("pvIntelligence.targetItems") as { title: string; desc: string }[];
  const proofPoints = t.raw("pvIntelligence.proofPoints") as string[];
  const techItems = t.raw("pvIntelligence.techItems") as { label: string; value: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Solar AI Monitoring Platform
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
            <a
              href="/files/NINEWATT_PV_INTELLIGENCE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("pvIntelligence.downloadPdf")}
            </a>
            <a
              href="https://energy.ninewatt.com/ko"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-primary/30 bg-primary/5 px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Ninewatt Energy O&M &rarr;
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("pvIntelligence.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.problemTitle")}</h2>
          <p className="mt-3 text-base text-muted">{t("pvIntelligence.problemDesc")}</p>
          <ul className="mt-8 space-y-4">
            {problemItems.map((item, i) => (
              <li key={i} className="border-l-2 border-border pl-4 text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.diffTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("pvIntelligence.diffSubtitle")}</p>
          <div className="mt-12 space-y-8">
            {diffItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-muted">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.howItWorksTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("pvIntelligence.howItWorksSubtitle")}</p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="relative rounded-xl border border-border p-6">
                <span className="text-4xl font-black text-primary/20">{step.step}</span>
                <h3 className="mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Detection Scenarios */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.aiDetectionTitle")}</h2>
          <p className="mt-3 text-base text-muted">{t("pvIntelligence.aiDetectionSubtitle")}</p>
          <div className="mt-12 space-y-10">
            {aiDetectionScenarios.map((scenario, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold">
                  &ldquo;{scenario.situation}&rdquo;
                </h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="border-l-2 border-border pl-4">
                    <p className="text-sm font-medium text-muted/70">무슨 일이 생겼나</p>
                    <p className="mt-1 text-base leading-relaxed text-muted">{scenario.what}</p>
                  </div>
                  <div className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-medium text-primary">PV Intelligence가 하는 일</p>
                    <p className="mt-1 text-base leading-relaxed text-muted">{scenario.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Optimization */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.revenueTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("pvIntelligence.revenueSubtitle")}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {revenueItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.dashboardTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("pvIntelligence.dashboardSubtitle")}</p>
          <div className="mt-10 space-y-4">
            {dashboardFeatures.map((feature, i) => (
              <div key={i} className="md:flex md:gap-8 md:border-b md:border-border md:py-5">
                <h3 className="shrink-0 text-base font-bold md:w-40">{feature.title}</h3>
                <p className="mt-1 text-base leading-relaxed text-muted md:mt-0">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.impactTitle")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {impactItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6 text-center">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-base text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.targetTitle")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {targetItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof — Self-operated Plants */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.proofTitle")}</h2>
          <p className="mt-2 text-base text-muted">{t("pvIntelligence.proofSubtitle")}</p>
          <p className="mt-6 text-base leading-relaxed text-muted">{t("pvIntelligence.proofDesc")}</p>
          <ul className="mt-8 space-y-3">
            {proofPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-muted">
                <span className="mt-0.5 text-primary">&#10003;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.techTitle")}</h2>
          <div className="mt-8 divide-y divide-border rounded-xl border border-border">
            {techItems.map((item, i) => (
              <div key={i} className="flex gap-4 px-6 py-4">
                <span className="w-32 shrink-0 text-base font-medium">{item.label}</span>
                <span className="text-base text-muted">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("pvIntelligence.ctaTitle")}</h2>
          <p className="mt-3 text-base text-muted">{t("pvIntelligence.ctaDesc")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("pvIntelligence.ctaDemo")}
            </Link>
            <a
              href="/files/NINEWATT_PV_INTELLIGENCE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("pvIntelligence.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
