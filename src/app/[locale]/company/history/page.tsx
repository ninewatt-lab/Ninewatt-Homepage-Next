import { getTranslations } from "next-intl/server";
import { history } from "@/data/history";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("history.title")} - Ninewatt`,
    description: t("history.subtitle"),
  };
}

const historyByYear = history.reduce(
  (acc, item) => {
    if (!acc[item.year]) acc[item.year] = [];
    acc[item.year].push(item);
    return acc;
  },
  {} as Record<number, typeof history>,
);
const sortedYears = Object.keys(historyByYear)
  .map(Number)
  .sort((a, b) => b - a);

export default async function HistoryPage() {
  const t = await getTranslations("company");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("history.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("history.subtitle")}
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-10">
            {sortedYears.map((year) => (
              <div key={year} className="flex gap-6">
                <div className="w-16 shrink-0 text-2xl font-bold text-primary">
                  {year}
                </div>
                <div className="space-y-3">
                  {historyByYear[year].map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <span className="shrink-0 text-sm text-muted">
                        {item.date}
                      </span>
                      <span className="text-sm">{item.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
