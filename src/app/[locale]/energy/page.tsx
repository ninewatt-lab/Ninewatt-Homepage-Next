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
              <p className="mt-1.5 text-xs text-zinc-500 tracking-wide uppercase">{stat.label}</p>
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
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PV Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {t("pvCard.title")}
              </h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("pvCard.description")}
            </p>
            <ul className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
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
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5zM3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {t("essCard.title")}
              </h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t("essCard.description")}
            </p>
            <ul className="mt-5 space-y-2">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-2" />
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
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                {t(`items.${i}.title`)}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-lg">
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
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
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
            <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-md whitespace-pre-line">
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
    {
      key: "pvIntelligence",
      href: "/energy/products/pv-intelligence",
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
        </svg>
      ),
      iconBg: "bg-amber-50 dark:bg-amber-950/50",
    },
    {
      key: "solarSite",
      href: "/energy/products/solar-site",
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
      iconBg: "bg-green-50 dark:bg-green-950/50",
    },
  ];

  const essProducts = [
    {
      key: "peakEss",
      href: "/energy/products/peak-ess",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      iconBg: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      key: "sharedEss",
      href: "/energy/products/shared-ess",
      icon: (
        <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
      iconBg: "bg-violet-50 dark:bg-violet-950/50",
    },
  ];

  const renderCard = (product: { key: string; href: string; icon: React.ReactNode; iconBg: string }) => (
    <Link
      key={product.key}
      href={product.href}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-primary/50 transition-colors group"
    >
      <div className={`w-10 h-10 rounded-lg ${product.iconBg} flex items-center justify-center`}>
        {product.icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
        {t(`${product.key}.title`)}
      </h3>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
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
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* PV */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-5">PV (태양광)</h3>
            <div className="space-y-4">
              {pvProducts.map(renderCard)}
            </div>
          </div>

          {/* ESS */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-5">ESS (에너지저장)</h3>
            <div className="space-y-4">
              {essProducts.map(renderCard)}
            </div>
          </div>
        </div>

        {/* PPA & BEMS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/energy/ppa"
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-primary/50 transition-colors group flex items-center gap-5"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                {t("ppa.title")}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("ppa.description")}
              </p>
            </div>
          </Link>
          <Link
            href="/energy/products/bems"
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-primary/50 transition-colors group flex items-center gap-5"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                {t("bems.title")}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("bems.description")}
              </p>
            </div>
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
