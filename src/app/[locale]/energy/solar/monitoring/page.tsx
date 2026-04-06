import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

function FeaturesSection() {
  const t = useTranslations("solar.monitoring");

  const features = ["crossCompare", "aiDiagnosis", "revenueOptimize", "dashboard"];

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          {features.map((key, i) => (
            <div
              key={key}
              className="bg-white dark:bg-zinc-900 p-10 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xs text-zinc-400 font-mono">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                {t(`features.${key}.title`)}
              </h3>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsRow() {
  const stats = [
    { value: "10min", label: "이상 감지 → 알림" },
    { value: "94%", label: "AI 원인 분석 신뢰도" },
    { value: "138만원", label: "월간 손실 방지" },
    { value: "3.4일", label: "세척 투자 회수" },
  ];

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800">
          {stats.map((stat) => (
            <div key={stat.label} className="py-10 px-6 text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs text-zinc-500 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScenariosSection() {
  const t = useTranslations("solar.monitoring.scenarios");

  const scenarios = ["scenario1", "scenario2", "scenario3"] as const;

  return (
    <section className="py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Use Cases</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-lg">
          실제 운영 중 AI가 감지한 사례를 소개합니다
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {scenarios.map((sc) => (
            <div
              key={sc}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                {t(`${sc}.title`)}
              </h3>

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wider">상황</dt>
                  <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                    {t(`${sc}.situation`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-primary uppercase tracking-wider">AI 진단</dt>
                  <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                    {t(`${sc}.diagnosis`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400 uppercase tracking-wider">조치</dt>
                  <dd className="mt-1 text-zinc-600 dark:text-zinc-300">
                    {t(`${sc}.action`)}
                  </dd>
                </div>
              </dl>

              <p className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-sm font-medium text-zinc-900 dark:text-white">
                {t(`${sc}.loss`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechSpecSection() {
  const t = useTranslations("solar.monitoring.techSpec");

  const specs = [
    { label: "RTU", value: t("rtu") },
    { label: "프로토콜", value: t("protocol") },
    { label: "수집 주기", value: t("interval") },
    { label: "호환 인버터", value: t("inverters") },
    { label: "알림", value: t("alert") },
    { label: "대시보드", value: t("dashboard") },
  ];

  return (
    <section className="py-28 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Tech Spec</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
          {t("title")}
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {specs.map((spec) => (
            <div key={spec.label} className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <p className="text-xs text-zinc-400 uppercase tracking-wider">
                {spec.label}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                {spec.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function MonitoringPage() {
  const t = useTranslations("solar.monitoring");

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">PV Intelligence</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white max-w-2xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <FeaturesSection />
      <StatsRow />
      <ScenariosSection />
      <TechSpecSection />

      {/* CTA */}
      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              AI 모니터링을 직접 체험해보세요
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              발전소 정보를 알려주시면 무료 진단 리포트를 제공해드립니다.
            </p>
          </div>
          <Link
            href="/energy/contact"
            className="inline-flex items-center px-7 py-3.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors shrink-0"
          >
            무료 진단 신청
          </Link>
        </div>
      </section>
    </>
  );
}
