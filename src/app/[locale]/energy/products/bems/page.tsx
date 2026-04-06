import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("product");
  return {
    title: "BEMS - Building Energy Management System - Ninewatt",
    description: t("bems.heroDesc"),
  };
}

export default async function BemsPage() {
  const t = await getTranslations("product");

  const coreFeatures = t.raw("bems.coreFeatures") as { title: string; desc: string; items: string[] }[];
  const dataAcquisition = t.raw("bems.dataAcquisition") as { title: string; items: string[] }[];
  const energyCategories = t.raw("bems.energyCategories") as { category: string; items: { name: string; desc: string }[] }[];
  const benefitItems = t.raw("bems.benefitItems") as { value: string; label: string }[];
  const targetItems = t.raw("bems.targetItems") as { title: string; desc: string }[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">
            Building Energy Management System
          </p>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            BEMS
          </h1>
          <p className="mt-3 text-xl text-muted md:text-2xl">
            {t("bems.heroSubtitle")}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {t("bems.heroDesc")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/energy/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("bems.requestDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      {coreFeatures.map((section, si) => (
        <section
          key={si}
          className={`border-t border-border px-6 py-24 ${si % 2 === 0 ? "" : "bg-surface"}`}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="mt-2 text-muted">{section.desc}</p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <span className="mt-0.5 text-primary">&#10003;</span>
                  <span className="text-sm leading-relaxed text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Data Acquisition & Processing */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("bems.dataTitle")}</h2>
          <p className="mt-2 text-muted">{t("bems.dataSubtitle")}</p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {dataAcquisition.map((stage, i) => (
              <div key={i} className="relative rounded-xl border border-border p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-bold">{stage.title}</h3>
                <ul className="mt-4 space-y-2">
                  {stage.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Energy Classification */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("bems.classTitle")}</h2>
          <p className="mt-2 text-muted">{t("bems.classSubtitle")}</p>
          <div className="mt-12 space-y-10">
            {energyCategories.map((cat, ci) => (
              <div key={ci}>
                <h3 className="text-lg font-bold text-primary">{cat.category}</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((item, i) => (
                    <div key={i} className="border-l-2 border-border pl-4">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("bems.benefitTitle")}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefitItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6 text-center">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold">{t("bems.targetTitle")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {targetItems.map((item, i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("bems.ctaTitle")}</h2>
            <p className="mt-2 text-muted">{t("bems.ctaDesc")}</p>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              href="/energy/contact"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("bems.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
