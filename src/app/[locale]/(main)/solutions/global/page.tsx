import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "company" });
  return buildMetadata({
    locale,
    path: "/solutions/global",
    title: t("meta.global.title"),
    description: t("meta.global.description"),
  });
}

export default async function GlobalPage() {
  const t = await getTranslations("company");
  const countries = t.raw("global.countries") as Array<{
    country: string;
    flag: string;
    items: string[];
  }>;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("global.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("global.subtitle")}
          </p>
        </div>
      </section>

      {/* Countries */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-12">
          {countries.map((c) => (
            <div key={c.country} className="border-l-2 border-primary pl-6">
              <h2 className="text-xl font-bold">
                {c.country}{" "}
                <span className="text-base font-normal text-muted">{c.flag}</span>
              </h2>
              <ul className="mt-4 space-y-2">
                {c.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-base leading-relaxed text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
