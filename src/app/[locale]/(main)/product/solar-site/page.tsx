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

const S3_BASE =
  "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarAnalysis";

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
  const dataStats = t.raw("solarScope.dataCredibility.stats") as { value: string; label: string }[];
  const dataSources = t.raw("solarScope.dataCredibility.sources") as string[];

  const screenshots = [
    { key: "powerGrid", src: `${S3_BASE}/power-grid.png`, alt: "SolarScope power grid map" },
    { key: "mapAnalysis", src: `${S3_BASE}/map-analysis.png`, alt: "SolarScope parcel-level land analysis" },
    { key: "shadowAnalysis", src: `${S3_BASE}/shadow-analysis.png`, alt: "SolarScope 3D shadow and irradiance analysis" },
    { key: "businessAnalysis", src: `${S3_BASE}/business-analysis.png`, alt: "SolarScope financial viability review" },
  ] as const;

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
                {t("solarScope.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="px-6 pb-4 pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-neutral-900 shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="aspect-video">
              <Image
                src={`${S3_BASE}/hero.png`}
                alt="SolarScope overview"
                width={1920}
                height={1080}
                className="h-full w-full object-cover object-top"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Screenshots */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {screenshots.map((item) => (
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
                      unoptimized
                    />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-bold">{t(`solarScope.${item.key}`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {t(`solarScope.${item.key}Desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target users */}
      <section className="border-b border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 text-base text-muted">
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
              <p className="mt-4 text-base leading-relaxed text-muted">
                {t("solarScope.problemDesc")}
              </p>
              <ul className="mt-6 space-y-4 text-muted">
                {problemItems.map((item, i) => (
                  <li key={i} className="border-l-2 border-border pl-4">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-base leading-relaxed text-muted">
                {t("solarScope.problemConclusion")}
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t("solarScope.whatSolarScopeDoes")}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {t("solarScope.whatSolarScopeDoesDesc")}
              </p>
              <ul className="mt-6 space-y-4">
                {solutionItems.map((item, i) => (
                  <li key={i} className="border-l-2 border-primary pl-4 text-base">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-muted">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Credibility */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("solarScope.dataCredibility.title")}</h2>
          <p className="mt-3 text-base text-muted">{t("solarScope.dataCredibility.desc")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {dataStats.map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-6">
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-2 text-base text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-base font-semibold">{t("solarScope.dataCredibility.sourcesLabel")}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base text-muted">
              {dataSources.map((s, i) => (
                <span key={i}>
                  {i > 0 && <span className="mr-6 text-border">|</span>}
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("solarScope.keyFeatures")}</h2>
          <div className="mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {features.map((m) => (
              <div
                key={m.name}
                className="grid grid-cols-[10rem_1fr] items-baseline gap-3 border-b border-border py-3"
              >
                <span className="text-base font-medium">{m.name}</span>
                <span className="text-sm text-muted">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("solarScope.expectedImpact")}</h2>
          <p className="mt-3 text-base text-muted">
            {t("solarScope.expectedImpactDesc")}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {impactItems.map((v, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <p className="text-xl font-bold">{v.title}</p>
                <p className="mt-2 text-base text-muted">{v.desc}</p>
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
          <p className="mt-3 text-base text-muted">
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
