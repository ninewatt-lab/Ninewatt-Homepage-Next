import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getProductServiceUrl } from "@/lib/cms";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "Opti - AI Energy Advisor - Ninewatt",
    description: t("opti.heroDesc"),
  };
}

export default async function OptiPage() {
  const [t, serviceUrl] = await Promise.all([
    getTranslations("product"),
    getProductServiceUrl("opti"),
  ]);
  const features = t.raw("opti.features") as { title: string; desc: string }[];
  const steps = t.raw("opti.steps") as { title: string; desc: string }[];
  const impactItems = t.raw("opti.impactItems") as { value: string; label: string }[];
  const modules = t.raw("opti.modules") as { name: string; desc: string }[];

  const problemItems = t.raw("opti.problemItems") as string[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            CES Innovation Awards 2026 Honoree — Smart Communities
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Opti
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("opti.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("opti.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("opti.requestDemo")}
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("opti.downloadPdf")}
            </a>
            {serviceUrl && (
              <a
                href={serviceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-primary/30 bg-primary/5 px-8 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                {t("opti.goToService")} &rarr;
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Product Video */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl">
          <video
            className="h-auto w-full rounded-2xl"
            autoPlay
            loop
            muted
            playsInline
          >
            <source
              src="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/opti-scene-short.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{t("opti.problem")}</h2>
              <ul className="mt-6 space-y-4 text-muted">
                {problemItems.map((item, i) => (
                  <li key={i} className="border-l-2 border-border pl-4">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t("opti.whatOptiDoes")}</h2>
              <ul className="mt-6 space-y-4">
                {features.map((f, i) => (
                  <li key={i} className="border-l-2 border-primary pl-4">
                    <span className="font-medium">{f.title}</span>
                    <span className="text-muted"> — {f.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("opti.howItWorks")}</h2>
          <p className="mt-2 text-base text-muted">{t("opti.howItWorksSubtitle")}</p>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("opti.impact")}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {impactItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Modules */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("opti.aiModules")}</h2>
          <div className="mt-8 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {modules.map((m) => (
              <div key={m.name} className="flex items-baseline gap-3 border-b border-border py-3">
                <span className="text-base font-medium">{m.name}</span>
                <span className="text-sm text-muted">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("opti.ctaTitle")}</h2>
          <p className="mt-3 text-muted">
            {t("opti.ctaDesc")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("opti.ctaDemo")}
            </Link>
            <a
              href="/files/NINEWATT_OPTI.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-surface"
            >
              {t("opti.ctaBrochure")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
