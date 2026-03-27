import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("solutions");
  return {
    title: `${t("services.title")} - Ninewatt`,
    description: t("services.title"),
  };
}

interface ServiceProject {
  client: string;
  period: string;
  title: string;
}

export default async function ServicesPage() {
  const t = await getTranslations("solutions");
  const headers = t.raw("services.tableHeaders") as { client: string; period: string; content: string };
  const serviceProjects = t.raw("services.projects") as ServiceProject[];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("services.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("services.subtitleTemplate", {
              count: serviceProjects.length,
              partners: new Set(serviceProjects.map((p) => p.client)).size,
            })}
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-semibold text-muted">{headers.client}</th>
                  <th className="py-3 pr-4 font-semibold text-muted">{headers.period}</th>
                  <th className="py-3 font-semibold text-muted">{headers.content}</th>
                </tr>
              </thead>
              <tbody>
                {serviceProjects.map((p, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{p.client}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted">{p.period}</td>
                    <td className="py-3">{p.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight">{t("services.ctaTitle")}</h2>
          <p className="mt-3 text-muted">
            {t("services.ctaText")}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            {t("services.ctaButton")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
