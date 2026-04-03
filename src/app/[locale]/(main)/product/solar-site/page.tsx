import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "SolarScope - Solar Site Analysis Platform - Ninewatt",
    description: t("solarScope.heroDesc"),
  };
}

export default async function SolarSitePage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("solar-site"),
  ]);
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
            <a
              href="https://solar.ninewatt.com/ko"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-primary/30 bg-primary/5 px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Ninewatt Solar O&M &rarr;
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
              >
                {t("solarScope.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {/* Row 1: Wide screenshots — 4-column */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {([
              { key: "dashboard" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_1.png", alt: "SolarScope Map Analysis Dashboard" },
              { key: "nationwideGrid" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_7.png", alt: "SolarScope Nationwide Grid Capacity Heatmap" },
              { key: "roofAnalysis3d" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_8.png", alt: "SolarScope 3D Roof Analysis" },
              { key: "feasibility" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_6.png", alt: "SolarScope Detailed Feasibility Review" },
            ] as const).map((item) => (
              <div key={item.key}>
                <div className="group/img overflow-hidden rounded-xl border border-border bg-neutral-900 shadow-xl transition-shadow hover:shadow-primary/10">
                  <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </div>
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={640}
                      height={360}
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover/img:scale-105"
                    />
                  </div>
                </div>
                <h3 className="mt-3 text-base font-bold">{t(`solarScope.${item.key}`)}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {t(`solarScope.${item.key}Desc`)}
                </p>
              </div>
            ))}
          </div>

          {/* Row 2: Detail panels — 3-column */}
          <div className="grid gap-6 md:grid-cols-3">
            {([
              { key: "siteAnalysis" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_3.png", alt: "SolarScope Site Analysis & Grid Capacity" },
              { key: "irradiance" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_4.png", alt: "SolarScope Irradiance & Energy Yield" },
              { key: "profitability" as const, src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_5.png", alt: "SolarScope Profitability Analysis" },
            ] as const).map((item) => (
              <div key={item.key}>
                <div className="group/img overflow-hidden rounded-xl border border-border bg-neutral-900 shadow-xl transition-shadow hover:shadow-primary/10">
                  <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </div>
                  <div className="aspect-2/3 overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={720}
                      height={1080}
                      className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover/img:scale-105"
                    />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold">{t(`solarScope.${item.key}`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t(`solarScope.${item.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 text-sm text-muted">
          <span className="font-semibold text-foreground">{t("solarScope.targetUsersLabel")}</span>
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
