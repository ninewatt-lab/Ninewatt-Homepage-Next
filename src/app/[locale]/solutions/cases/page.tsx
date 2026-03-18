import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "수행사례 - Ninewatt",
    description: t("cases.subtitle"),
  };
}

interface CaseItem {
  title: string;
  category: string;
  desc: string;
}

interface StatItem {
  value: string;
  label: string;
}

export default async function CasesPage() {
  const t = await getTranslations("solutions");
  const cases = t.raw("cases.items") as CaseItem[];
  const stats = t.raw("cases.stats") as StatItem[];
  const categories = t.raw("cases.categories") as Record<string, string>;
  const categoryValues = Object.values(categories);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("cases.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("cases.subtitle")}
          </p>
        </div>
      </section>

      {/* Cases grouped by category */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {categoryValues.map((cat) => {
            const items = cases.filter((c) => c.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="text-lg font-bold">{cat}</h2>
                <div className="mt-4 divide-y divide-border">
                  {items.map((c) => (
                    <div key={c.title} className="py-4">
                      <p className="font-medium">{c.title}</p>
                      <p className="mt-1 text-sm text-muted">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats — inline row */}
      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-12 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="ml-2 text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
