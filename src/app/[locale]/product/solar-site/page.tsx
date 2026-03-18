import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "SolarScope - Solar Site Analysis Platform - Ninewatt",
    description: t("solarScope.heroDesc"),
  };
}

export default async function SolarSitePage() {
  const t = await getTranslations("product");
  const targetUsers = t.raw("solarScope.targetUsers") as string[];
  const problemItems = t.raw("solarScope.problemItems") as string[];
  const solutionItems = t.raw("solarScope.solutionItems") as { title: string; desc: string }[];
  const features = t.raw("solarScope.features") as { name: string; desc: string }[];
  const impactItems = t.raw("solarScope.impactItems") as { title: string; desc: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Solar Site Analysis Platform
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            SolarScope
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("solarScope.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("solarScope.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("solarScope.requestDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Dashboard */}
          <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr]">
            <div>
              <h2 className="text-2xl font-bold">{t("solarScope.dashboard")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("solarScope.dashboardDesc")}
              </p>
            </div>
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_2.png"
                  alt="SolarScope Dashboard"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid items-center gap-10 md:grid-cols-[3fr_2fr]">
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10 md:order-1">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_3.png"
                  alt="SolarScope Detail Analysis"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
            <div className="md:order-2">
              <h2 className="text-2xl font-bold">{t("solarScope.detailAnalysis")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("solarScope.detailAnalysisDesc")}
              </p>
            </div>
          </div>

          {/* Financial Analysis */}
          <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr]">
            <div>
              <h2 className="text-2xl font-bold">{t("solarScope.feasibility")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("solarScope.feasibilityDesc")}
              </p>
            </div>
            <div className="group/img overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl transition-shadow hover:shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
                <span className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <div className="overflow-hidden">
                <Image
                  src="/images/SolarScope/SolarScope_Image_1.png"
                  alt="SolarScope Feasibility"
                  width={1200}
                  height={675}
                  className="h-auto w-full transition-transform duration-500 ease-out group-hover/img:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-6 text-sm text-muted">
          {targetUsers.map((user, i) => (
            <span key={i}>
              {i > 0 && <span className="text-border mr-6">|</span>}
              {user}
            </span>
          ))}
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{t("solarScope.problem")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t("solarScope.problemDesc")}
              </p>
              <ul className="mt-6 space-y-4 text-muted">
                {problemItems.map((item, i) => (
                  <li key={i} className="border-l-2 border-border pl-4">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                {t("solarScope.problemConclusion")}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t("solarScope.whatSolarScopeDoes")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t("solarScope.whatSolarScopeDoesDesc")}
              </p>
              <ul className="mt-6 space-y-4">
                {solutionItems.map((item, i) => (
                  <li key={i} className="border-l-2 border-primary pl-4">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted">
                      {" "}
                      — {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("solarScope.keyFeatures")}</h2>
          <div className="mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {features.map((m) => (
              <div
                key={m.name}
                className="flex items-baseline gap-3 border-b border-border py-3"
              >
                <span className="text-sm font-medium">{m.name}</span>
                <span className="text-xs text-muted">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("solarScope.expectedImpact")}</h2>
          <p className="mt-3 text-muted">
            {t("solarScope.expectedImpactDesc")}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {impactItems.map((v, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <p className="text-lg font-bold">{v.title}</p>
                <p className="mt-2 text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">
            {t("solarScope.ctaTitle")}
          </h2>
          <p className="mt-3 text-muted">
            {t("solarScope.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("solarScope.ctaDemo")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
