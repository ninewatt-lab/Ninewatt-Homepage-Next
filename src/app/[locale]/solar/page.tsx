import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

function HeroSection() {
  const t = useTranslations("solar.hero");

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-16">
      <div className="absolute inset-0">
        <Image
          src="/images/solar/sites/site-drone-08.jpg"
          alt="나인와트 태양광 발전소 전경"
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
            href="/solar/contact"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
          >
            {t("cta")}
          </Link>
          <Link
            href="/solar/sites"
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
  const t = useTranslations("solar.stats");

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

function ServicesOverview() {
  const t = useTranslations("solar.services");

  const services = [
    "monitoring",
    "diagnosis",
    "maintenance",
    "optimization",
    "safety",
    "report",
  ];

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Services</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl">
          {t("subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {services.map((key, i) => (
            <div
              key={key}
              className="bg-white dark:bg-zinc-900 p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-white">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/solar/services"
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
  const t = useTranslations("solar.process");

  return (
    <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
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

function SiteGallery() {
  const images = [
    { src: "/images/solar/sites/site-drone-01.jpg", label: "영천 1MW" },
    { src: "/images/solar/sites/site-drone-08.jpg", label: "경주 산업단지" },
    { src: "/images/solar/sites/site-drone-04.jpg", label: "경주 옥상형" },
    { src: "/images/solar/sites/site-drone-09.jpg", label: "산업단지 전경" },
    { src: "/images/solar/sites/site-ground-01.jpg", label: "예천 노지형" },
    { src: "/images/solar/sites/site-drone-05.jpg", label: "공장 옥상형" },
  ];

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Portfolio</p>
            <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
              발전소 현황
            </h2>
          </div>
          <Link
            href="/solar/sites"
            className="hidden sm:inline-flex text-sm text-primary font-medium hover:underline underline-offset-4"
          >
            전체 보기 &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={img.src}
              className={`relative overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2 aspect-[16/10]" : "aspect-[4/3]"}`}
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                className="object-cover hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/50 to-transparent" />
              <span className="absolute bottom-3 left-3 text-xs text-white/80 font-medium">
                {img.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/solar/sites"
            className="text-sm text-primary font-medium hover:underline underline-offset-4"
          >
            전체 발전소 보기 &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const t = useTranslations("solar.cta");

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
              href="/solar/contact"
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

export default function SolarHomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesOverview />
      <ProcessSection />
      <SiteGallery />
      <CTASection />
    </>
  );
}
