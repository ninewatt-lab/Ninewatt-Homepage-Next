import { getTranslations } from "next-intl/server";
import { getAwards } from "@/lib/cms";
import { ThumbnailButton } from "@/components/ImageLightbox";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("awards.title")} - Ninewatt`,
    description: t("awards.subtitle"),
  };
}

export default async function AwardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");
  const { docs: awards } = await getAwards(locale);

  const awardsByYear = awards.reduce(
    (acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push(item);
      return acc;
    },
    {} as Record<number, typeof awards>,
  );
  const awardYears = Object.keys(awardsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("awards.title")} <span className="text-muted">({awards.length}건)</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("awards.subtitle")}
          </p>
        </div>
      </section>

      {/* Awards List */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-10">
            {awardYears.map((year) => (
              <div key={year} className="flex gap-6">
                <div className="w-16 shrink-0 text-2xl font-bold text-primary">
                  {year}
                </div>
                <div className="space-y-3">
                  {awardsByYear[year].map((award) =>
                    <div key={award.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                      {award.linkUrl ? (
                        <a href={award.linkUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                          {award.name}
                        </a>
                      ) : award.thumbnailUrl ? (
                        <ThumbnailButton src={award.thumbnailUrl} alt={award.name} className="shrink-0 text-sm font-medium">
                          {award.name}
                        </ThumbnailButton>
                      ) : (
                        <span className="shrink-0 text-sm font-medium">
                          {award.name}
                        </span>
                      )}
                      <span className="text-sm text-muted">
                        {award.organization} · {award.grade}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
