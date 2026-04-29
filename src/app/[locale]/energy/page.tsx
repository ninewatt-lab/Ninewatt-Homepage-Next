import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

function HeroSection() {
  const t = useTranslations("energy.hub.hero");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-16">
      <div className="absolute inset-0">
        <Image
          src="/images/solar/sites/site-drone-08.jpg"
          alt="나인와트 에너지 시설 전경"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-5">
          {t("badge")}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.15] whitespace-pre-line max-w-xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-lg whitespace-pre-line">
          {t("subtitle")}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/energy/contact"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            {t("cta")}
          </Link>
          <Link
            href="#overview"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white rounded-lg transition-colors"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const t = useTranslations("energy.hub.stats");

  const stats = [
    { label: t("totalCapacity"), value: t("totalCapacityValue"), unit: t("totalCapacityUnit") },
    { label: t("operatingSites"), value: t("operatingSitesValue"), unit: t("operatingSitesUnit") },
    { label: t("monitoring"), value: t("monitoringValue"), unit: t("monitoringUnit") },
    { label: t("detectionAccuracy"), value: t("detectionAccuracyValue"), unit: t("detectionAccuracyUnit") },
  ];

  return (
    <section className="border-b border-zinc-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
          {stats.map((stat) => (
            <div key={stat.label} className="py-10 px-6 text-center">
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {stat.value}
                {stat.unit && <span className="text-base font-medium text-zinc-400 ml-0.5">{stat.unit}</span>}
              </p>
              <p className="mt-1.5 text-sm text-zinc-500 tracking-wide uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewSection() {
  const t = useTranslations("energy.hub.overview");

  return (
    <section id="overview" className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Services</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PV Card */}
          <div className="h-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 hover:border-primary/50 transition-colors group">
            <p className="text-xs text-primary font-medium tracking-wider uppercase">Solar O&M</p>
            <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
              {t("pvCard.title")}
            </h3>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("pvCard.description")}
            </p>
            <ul className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-base text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2.5" />
                  {t(`pvCard.features.${i}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/energy/solar"
              className="mt-6 inline-flex items-center text-sm text-primary font-medium hover:underline underline-offset-4"
            >
              {t("pvCard.cta")} &rarr;
            </Link>
          </div>

          {/* ESS Card */}
          <div className="h-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 hover:border-primary/50 transition-colors group">
            <p className="text-xs text-primary font-medium tracking-wider uppercase">ESS O&M</p>
            <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
              {t("essCard.title")}
            </h3>
            <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("essCard.description")}
            </p>
            <ul className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-base text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2.5" />
                  {t(`essCard.features.${i}`)}
                </li>
              ))}
            </ul>
            <Link
              href="/energy/ess"
              className="mt-6 inline-flex items-center text-sm text-primary font-medium hover:underline underline-offset-4"
            >
              {t("essCard.cta")} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SynergySection() {
  const t = useTranslations("energy.hub.synergy");

  return (
    <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Synergy</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-full bg-white dark:bg-zinc-900 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                {t(`items.${i}.title`)}
              </h3>
              <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t(`items.${i}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const t = useTranslations("energy.hub.process");

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Process</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative md:pr-8">
              {i < 3 && (
                <div className="hidden md:block absolute top-3 right-0 w-full h-px bg-zinc-200 dark:bg-zinc-800" />
              )}
              <div className="relative">
                <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-700">{t(`steps.${i}.step`)}</span>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
                  {t(`steps.${i}.title`)}
                </h3>
                <p className="mt-2 text-base text-zinc-500 dark:text-zinc-500 leading-relaxed">
                  {t(`steps.${i}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("energy.hub.cta");

  return (
    <section className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-md whitespace-pre-line">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/energy/contact"
              className="inline-flex items-center px-7 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              {t("button")}
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">|</span>
            <a
              href={`tel:${t("phone")}`}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              {t("phone")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  const t = useTranslations("energy.hub.products");

  const pvProducts = [
    { key: "pvIntelligence", href: "/energy/products/pv-intelligence" },
    { key: "solarSite", href: "/energy/products/solar-site" },
  ];

  const essProducts = [
    { key: "peakEss", href: "/energy/products/peak-ess" },
    { key: "sharedEss", href: "/energy/products/shared-ess" },
  ];

  const renderCard = (product: { key: string; href: string }) => (
    <Link
      key={product.key}
      href={product.href}
      className="block border-t border-zinc-200 dark:border-zinc-800 pt-5 pb-2 hover:border-primary transition-colors group"
    >
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
        {t(`${product.key}.title`)}
      </h3>
      <p className="mt-1.5 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {t(`${product.key}.description`)}
      </p>
    </Link>
  );

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Solutions</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* PV */}
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-5">PV (태양광)</h3>
            <div className="grid grid-cols-1 gap-4">
              {pvProducts.map(renderCard)}
            </div>
          </div>

          {/* ESS */}
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-5">ESS (에너지저장)</h3>
            <div className="grid grid-cols-1 gap-4">
              {essProducts.map(renderCard)}
            </div>
          </div>
        </div>

        {/* PPA & BEMS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/energy/ppa"
            className="block border-t border-zinc-200 dark:border-zinc-800 pt-5 pb-2 hover:border-primary transition-colors group"
          >
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
              {t("ppa.title")}
            </h3>
            <p className="mt-1.5 text-base text-zinc-500 dark:text-zinc-400">
              {t("ppa.description")}
            </p>
          </Link>
          <Link
            href="/energy/products/bems"
            className="block border-t border-zinc-200 dark:border-zinc-800 pt-5 pb-2 hover:border-primary transition-colors group"
          >
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
              {t("bems.title")}
            </h3>
            <p className="mt-1.5 text-base text-zinc-500 dark:text-zinc-400">
              {t("bems.description")}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function EnergyHubPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <OverviewSection />
      <ProductsSection />
      <SynergySection />
      <ProcessSection />
      <CTASection />
    </>
  );
}
