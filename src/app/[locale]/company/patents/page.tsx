import { getTranslations } from "next-intl/server";
import { getPatents, getCertifications, getTrademarks } from "@/lib/cms";
import { InlineExpandImage, ExpandableRow, ExpandableTrigger, TrademarkGroupCard } from "@/components/ImageLightbox";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("patents.title")} - Ninewatt`,
    description: t("patents.subtitle"),
  };
}

export default async function PatentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");

  const [
    { docs: domesticPatentsAll },
    { docs: internationalPatents },
    { docs: certifications },
    { docs: allTrademarks },
  ] = await Promise.all([
    getPatents(locale, "domestic"),
    getPatents(locale, "international"),
    getCertifications(locale),
    getTrademarks(locale),
  ]);

  const domesticRegistered = domesticPatentsAll.filter((p) => p.status === "등록");
  const domesticPending = domesticPatentsAll.filter((p) => p.status === "출원");
  const totalPatents = domesticPatentsAll.length + internationalPatents.length;
  const domesticTrademarks = allTrademarks.filter((tm) => tm.country === "국내");
  const internationalTrademarks = allTrademarks.filter((tm) => tm.country !== "국내");

  // Group domestic trademarks by name
  const domesticTrademarkGroups = domesticTrademarks.reduce<Record<string, typeof domesticTrademarks>>((acc, tm) => {
    (acc[tm.name] ??= []).push(tm);
    return acc;
  }, {});

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("patents.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("patents.subtitle")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <dl className="flex flex-wrap gap-x-12 gap-y-4 text-sm">
            <div>
              <dt className="text-muted">{t("patents.totalPatents")}</dt>
              <dd className="text-4xl font-bold">{totalPatents}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.domestic")}</dt>
              <dd className="text-4xl font-bold">{domesticPatentsAll.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.international")}</dt>
              <dd className="text-4xl font-bold">{internationalPatents.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.trademarks")}</dt>
              <dd className="text-4xl font-bold">{allTrademarks.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("patents.certifications")}</dt>
              <dd className="text-4xl font-bold">{certifications.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Domestic Patents - Registered */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.domesticRegistered")} <span className="text-muted">({domesticRegistered.length}건)</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                  <th className="w-28 py-3 pr-3 font-semibold text-muted">{t("patents.regDate")}</th>
                  <th className="w-44 py-3 pr-3 font-semibold text-muted">{t("patents.regNo")}</th>
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentName")}</th>
                  <th className="w-48 py-3 font-semibold text-muted">{t("patents.applicant")}</th>
                </tr>
              </thead>
              <tbody>
                {domesticRegistered.map((p, i) => (
                  <ExpandableRow key={p.id} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={5}>
                    <td className="py-3 pr-3 text-muted">{i + 1}</td>
                    <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                    <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                    <td className="py-3 pr-3"><ExpandableTrigger>{p.title}</ExpandableTrigger></td>
                    <td className="py-3 text-muted line-clamp-2">{p.applicant}</td>
                  </ExpandableRow>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pending */}
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              {t("patents.domesticPending")} <span className="text-muted">({domesticPending.length}건)</span>
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-175 text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                    <th className="w-28 py-3 pr-3 font-semibold text-muted">{t("patents.appDate")}</th>
                    <th className="w-44 py-3 pr-3 font-semibold text-muted">{t("patents.appNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentName")}</th>
                    <th className="w-48 py-3 font-semibold text-muted">{t("patents.applicant")}</th>
                  </tr>
                </thead>
                <tbody>
                  {domesticPending.map((p, i) => (
                    <ExpandableRow key={p.id} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={5}>
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                      <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3"><ExpandableTrigger>{p.title}</ExpandableTrigger></td>
                      <td className="py-3 text-muted line-clamp-2">{p.applicant}</td>
                    </ExpandableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* International Patents */}
          <div className="mt-16">
            <h2 className="text-xl font-bold">
              {t("patents.internationalPatents")} <span className="text-muted">({internationalPatents.length}건)</span>
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-200 text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                    <th className="w-28 py-3 pr-3 font-semibold text-muted">{t("patents.appDate")}</th>
                    <th className="w-44 py-3 pr-3 font-semibold text-muted">{t("patents.appNo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentNameKo")}</th>
                    <th className="py-3 pr-3 font-semibold text-muted">{t("patents.patentNameEn")}</th>
                    <th className="py-3 font-semibold text-muted">{t("patents.country")}</th>
                  </tr>
                </thead>
                <tbody>
                  {internationalPatents.map((p, i) => (
                    <ExpandableRow key={p.id} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={6}>
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap text-muted">{p.date}</td>
                      <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3"><ExpandableTrigger>{p.title}</ExpandableTrigger></td>
                      <td className="py-3 pr-3 text-muted">{p.titleEn}</td>
                      <td className="py-3 whitespace-nowrap text-muted">{p.country}</td>
                    </ExpandableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Trademarks */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.domesticTrademarks")} <span className="text-muted">({domesticTrademarks.length}건)</span>
          </h2>
          <div className="mt-4">
            {Object.entries(domesticTrademarkGroups).map(([name, items]) => (
              <TrademarkGroupCard
                key={name}
                name={name}
                items={items.map((tm) => ({ date: tm.date, number: tm.number, thumbnailUrl: tm.thumbnailUrl }))}
              />
            ))}
          </div>

          {internationalTrademarks.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold">
                {t("patents.internationalTrademarks")} <span className="text-muted">({internationalTrademarks.length}건)</span>
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-150 text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                      <th className="w-28 py-3 pr-3 font-semibold text-muted">{t("patents.appDate")}</th>
                      <th className="w-44 py-3 pr-3 font-semibold text-muted">{t("patents.country")}</th>
                      <th className="py-3 font-semibold text-muted">{t("patents.trademarkName")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internationalTrademarks.map((tm, i) => (
                      <ExpandableRow key={tm.id} thumbnailUrl={tm.thumbnailUrl} alt={tm.name} colSpan={4}>
                        <td className="py-3 pr-3 text-muted">{i + 1}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-muted">{tm.date}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-muted">{tm.country}</td>
                        <td className="py-3 font-medium"><ExpandableTrigger>{tm.name}</ExpandableTrigger></td>
                      </ExpandableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Certifications */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.certList")} <span className="text-muted">({certifications.length}건)</span>
          </h2>
          <div className="mt-6 space-y-3">
            {certifications.map((c) => (
              <div
                key={c.id}
                className="border-l-2 border-border pl-4"
              >
                {c.thumbnailUrl ? (
                  <InlineExpandImage src={c.thumbnailUrl} alt={c.name} className="text-sm font-semibold">
                    {c.name}
                  </InlineExpandImage>
                ) : (
                  <p className="text-sm font-semibold">{c.name}</p>
                )}
                <p className="text-xs text-muted">{c.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
