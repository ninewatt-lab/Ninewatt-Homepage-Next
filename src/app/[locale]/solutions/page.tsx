import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: "Solutions - Ninewatt",
    description: t("overview.subtitle"),
  };
}

export default async function SolutionsPage() {
  const t = await getTranslations("solutions");
  const solutions = t.raw("overview.solutions") as Array<{
    id: string;
    title: string;
    items: string[];
  }>;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("overview.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("overview.subtitle")}
          </p>
        </div>
      </section>

      {/* Solutions — border-l list */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          {solutions.map((sol) => (
            <div key={sol.id} className="border-l-2 border-border pl-6">
              <h2 className="text-lg font-bold">{sol.title}</h2>
              <ul className="mt-3 space-y-1">
                {sol.items.map((item) => (
                  <li key={item} className="text-sm text-muted">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — left-aligned inline */}
      <section className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">{t("overview.ctaTitle")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("overview.ctaDesc")}
            </p>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 md:mt-0"
          >
            {t("overview.ctaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}
