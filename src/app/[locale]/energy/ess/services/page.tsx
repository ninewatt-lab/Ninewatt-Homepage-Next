import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function ServicesDetailSection() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
          {services.map((key, i) => (
            <div key={key} className="flex gap-5">
              <span className="text-sm text-zinc-300 dark:text-zinc-700 font-mono tabular-nums shrink-0 pt-0.5">
                0{i + 1}
              </span>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function ProcessSection() {
  const t = useTranslations("ess.process");

  return (
    <section className="py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Process</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        <div className="mt-14 space-y-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="relative flex gap-8 pb-10 last:pb-0">
              {i < 3 && (
                <div className="absolute left-[11px] top-8 w-px h-full bg-zinc-200 dark:bg-zinc-800" />
              )}
              <div className="relative w-6 h-6 rounded-full border-2 border-primary bg-white dark:bg-zinc-950 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                  {t(`steps.${i}.title`)}
                </h3>
                <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
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

export default function ESSServicesPage() {
  const t = useTranslations("ess.services");

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">ESS O&M Services</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white max-w-xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <ServicesDetailSection />
      <ProcessSection />

      {/* CTA */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-white">
              맞춤 ESS O&M 플랜이 필요하신가요?
            </h2>
            <p className="mt-2 text-base text-zinc-400">
              ESS 정보를 알려주시면, 최적의 플랜과 예상 비용을 안내해드립니다.
            </p>
          </div>
          <Link
            href="/energy/contact"
            className="inline-flex items-center px-7 py-3.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors shrink-0"
          >
            무료 상담 신청
          </Link>
        </div>
      </section>
    </>
  );
}
