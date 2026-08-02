import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { solarPlants, totalCapacity, operatingCapacity } from "@/data/solarPlants";
import PlantGrid from "./PlantGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solar" });
  return buildMetadata({
    locale,
    path: "/energy/solar/sites",
    title: t("meta.sites.title"),
    description: t("meta.sites.description"),
  });
}

export default async function SitesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "solar.sites" });

  const total = totalCapacity();
  const operating = operatingCapacity();

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Portfolio</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
            {t("subtitle")}
          </p>

          {/* Summary stats */}
          <div className="mt-10 flex items-center gap-10">
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(total / 1000).toFixed(2)}
                <span className="text-sm font-medium text-zinc-400 ml-1">MW</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">{t("totalCapacity")}</p>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(operating / 1000).toFixed(1)}
                <span className="text-sm font-medium text-zinc-400 ml-1">MW</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">{t("operatingLabel")}</p>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {solarPlants.length}
                <span className="text-sm font-medium text-zinc-400 ml-1">개소</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">총 발전소</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlantGrid plants={solarPlants} />
        </div>
      </section>
    </>
  );
}
