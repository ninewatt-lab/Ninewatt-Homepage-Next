import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: `${t("peakEss.heroTitle").replace("\n", " ")} - Ninewatt`,
    description: t("peakEss.heroDesc"),
  };
}

export default async function PeakEssPage() {
  const t = await getTranslations("product");
  const backgroundItems = t.raw("peakEss.backgroundItems") as { title: string; desc: string }[];
  const solutionFeatures = t.raw("peakEss.solutionFeatures") as { title: string; desc: string }[];
  const howSteps = t.raw("peakEss.howSteps") as { step: string; title: string; desc: string }[];
  const benefitItems = t.raw("peakEss.benefitItems") as { value: string; label: string }[];
  const targetItems = t.raw("peakEss.targetItems") as { title: string; desc: string }[];
  const policyDemandItems = t.raw("peakEss.policyDemandItems") as { year: string; capacity: string }[];
  const marketStats = t.raw("peakEss.marketStats") as { value: string; label: string }[];
  const marketIssues = t.raw("peakEss.marketIssues") as string[];
  const sharedEssLinkItems = t.raw("peakEss.sharedEssLinkItems") as { title: string; desc: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium text-primary">{t("peakEss.heroLabel")}</p>
              <h1 className="mt-6 whitespace-pre-line text-5xl font-bold tracking-tight md:text-6xl">
                {t("peakEss.heroTitle")}
              </h1>
              <p className="mt-3 text-xl text-muted md:text-2xl">
                {t("peakEss.heroSubtitle")}
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                {t("peakEss.heroDesc")}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/energy/contact"
                  className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  {t("peakEss.requestDemo")}
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/product/peak-ess-facility.jpg"
                alt="피크저감형 ESS 설비"
                width={1600}
                height={1200}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Background */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.background")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {t("peakEss.backgroundDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {backgroundItems.map((item, i) => (
              <div key={i} className="border-l-2 border-primary pl-4">
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy — Peak ESS Demand Forecast */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.policy")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {t("peakEss.policyDesc")}
          </p>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  {policyDemandItems.map((item, i) => (
                    <th key={i} className="pb-3 pr-4 text-center font-medium text-muted">{item.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {policyDemandItems.map((item, i) => (
                    <td key={i} className="py-4 pr-4 text-center text-lg font-bold text-primary">{item.capacity}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">{t("peakEss.policySource")}</p>
        </div>
      </section>

      {/* Market Status */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.market")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {t("peakEss.marketDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {marketStats.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-6 text-center">
                <p className="text-4xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <h3 className="text-lg font-bold">주요 이슈</h3>
            <ul className="mt-4 space-y-3">
              {marketIssues.map((issue, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.solution")}</h2>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
            {t("peakEss.solutionDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {solutionFeatures.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-elevated p-6">
                <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.how")}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {howSteps.map((item, i) => (
              <div key={i} className="relative">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.benefits")}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {benefitItems.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.targets")}</h2>
          <p className="mt-3 text-sm text-muted">{t("peakEss.targetDesc")}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {targetItems.map((item, i) => (
              <div key={i} className="rounded-lg border border-border p-6">
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shared ESS Link */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("peakEss.sharedEssLink")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {t("peakEss.sharedEssLinkDesc")}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {sharedEssLinkItems.map((item, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface-elevated p-6">
                <h3 className="text-lg font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/energy/products/shared-ess"
              className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {t("peakEss.sharedEssLinkCta")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("peakEss.ctaTitle")}</h2>
            <p className="mt-2 text-muted">
              {t("peakEss.ctaDesc")}
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/energy/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("peakEss.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
