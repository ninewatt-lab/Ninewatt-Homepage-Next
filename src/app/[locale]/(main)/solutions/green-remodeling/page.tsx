import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import GRSection from "@/components/green-remodeling/GRSection";
import ViewIn3D from "@/components/green-remodeling/ViewIn3D";
import { GR_ENERGY, GR_ORDER } from "@/components/green-remodeling/grData";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "greenRemodeling" });
  return buildMetadata({ locale, path: "/solutions/green-remodeling", title: t("meta.title"), description: t("meta.description") });
}

type Item = { title: string; desc: string };
type Case = { title: string; client: string; period: string; desc: string };

export default async function GreenRemodelingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "greenRemodeling" });
  const process = t.raw("process.items") as Item[];
  const cases = t.raw("cases.items") as Case[];
  const method = t.raw("method.items") as string[];
  const fmt = (n: number, d = 1) => n.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <>
      <GRSection />

      {/* 네 가지 리모델링 */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("types.kicker")}</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("types.title")}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{t("types.desc")}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {GR_ORDER.map((k) => {
              const e = GR_ENERGY[k];
              const last = e.runs[e.runs.length - 1];
              return (
                <article key={k} className="flex flex-col rounded-2xl border border-border p-6">
                  <p className="text-sm text-muted">
                    {t(`buildings.${k}.name`)} · {t(`buildings.${k}.place`)}
                  </p>
                  <h3 className="mt-1 text-xl font-bold">{t(`buildings.${k}.title`)}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">{t(`buildings.${k}.desc`)}</p>
                  <ol className="mt-5 space-y-2">
                    {e.steps.map((st, i) => (
                      <li key={st} className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm last:border-0">
                        <span>
                          <span className="mr-2 tabular-nums text-muted">{i + 1}</span>
                          {t(`steps.${st}.title`)}
                        </span>
                        <span className="tabular-nums text-muted">−{fmt(e.saving[i + 1])}%</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <div>
                      <p className="text-xs text-muted">{t("types.saving")}</p>
                      <p className="text-3xl font-bold tabular-nums text-primary">−{fmt(e.saving[e.saving.length - 1])}%</p>
                      <p className="mt-1 text-xs text-muted">{t("types.co2", { t: fmt(e.runs[0].co2 - last.co2) })}</p>
                    </div>
                    <ViewIn3D k={k} label={t("types.view")} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 진행 과정 */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("process.kicker")}</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("process.title")}</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-4 md:gap-6">
            {process.map((p, i) => (
              <li key={i}>
                <span className="text-sm font-semibold tabular-nums text-primary">0{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted">{p.desc}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/product/greenplanner" className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
              {t("cta.planner")} →
            </Link>
          </div>
        </div>
      </section>

      {/* 관련 실적 */}
      <section className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("cases.kicker")}</p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">{t("cases.title")}</h2>
          <ul className="mt-10 grid gap-x-10 md:grid-cols-2">
            {cases.map((c, i) => (
              <li key={i} className="border-b border-border py-5">
                <p className="text-sm text-muted">
                  {c.client}
                  {c.period && ` · ${c.period}`}
                </p>
                <h3 className="mt-1 text-base font-bold">{c.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.desc}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/solutions/services" className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
              {t("cases.more")} →
            </Link>
          </div>
        </div>
      </section>

      {/* 계산 기준 */}
      <section className="border-t border-border bg-surface px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-primary">{t("method.kicker")}</p>
              <h2 className="mt-3 text-2xl font-bold">{t("method.title")}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted">{t("method.desc")}</p>
            </div>
            <ul className="space-y-4 md:col-span-3">
              {method.map((m, i) => (
                <li key={i} className="border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 문의 */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl md:flex md:items-center md:justify-between md:gap-10">
          <div>
            <h2 className="text-2xl font-bold">{t("cta.title")}</h2>
            <p className="mt-2 max-w-xl text-base text-muted">{t("cta.desc")}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
            <Link href="/contact" className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
              {t("cta.contact")}
            </Link>
            <Link href="/product/greenplanner" className="rounded-full border border-border px-7 py-3 text-sm font-semibold transition-colors hover:bg-surface">
              {t("cta.planner")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
