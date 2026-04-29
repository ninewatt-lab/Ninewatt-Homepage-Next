import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function HeroSection() {
  const t = useTranslations("ess.hero");

  return (
    <section className="pt-24 pb-16 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/20 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-5">
          {t("badge")}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-zinc-900 dark:text-white leading-[1.15] whitespace-pre-line max-w-xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg whitespace-pre-line">
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
            href="/energy/ess/services"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const t = useTranslations("ess.stats");

  const stats = [
    { label: t("totalCapacity"), value: t("totalCapacityValue"), unit: t("totalCapacityUnit") },
    { label: t("avgSoH"), value: t("avgSoHValue"), unit: t("avgSoHUnit") },
    { label: t("safetyRecord"), value: t("safetyRecordValue"), unit: t("safetyRecordUnit") },
    { label: t("uptime"), value: t("uptimeValue"), unit: t("uptimeUnit") },
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

function ServicesOverview() {
  const t = useTranslations("ess.services");

  const services = [
    "batteryHealth",
    "chargeOptimize",
    "fireSafety",
    "pcsManagement",
    "degradation",
    "report",
  ];

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Services</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {services.map((key, i) => (
            <div
              key={key}
              className="h-full bg-white dark:bg-zinc-900 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/energy/ess/services"
            className="text-sm text-primary font-medium hover:underline underline-offset-4"
          >
            서비스 플랜 상세 보기 &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const t = useTranslations("ess.process");

  return (
    <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
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
  const t = useTranslations("ess.cta");

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

export default function ESSHomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesOverview />
      <ProcessSection />
      <CTASection />
    </>
  );
}
