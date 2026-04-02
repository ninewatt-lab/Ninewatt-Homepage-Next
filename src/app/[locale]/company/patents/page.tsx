import { getTranslations } from "next-intl/server";
import { getPatents, getCertifications, getTrademarks, getTechnologyTransfers } from "@/lib/cms";
import { InlineExpandImage, ExpandableRow, ExpandableTrigger, TrademarkGroupCard, DetailExpandableRow, DetailTriggerChevron, AccordionTableBody } from "@/components/ImageLightbox";
import type { TechnologyTransfer } from "@/data/technologyTransfers";

/** Google Patents 링크 생성 — 등록 특허는 직접 링크, 출원/공개 특허는 검색 링크 */
function patentUrl(number: string, status: string, title: string): string {
  if (status === "등록") {
    // 등록번호 1024763030000 → KR102476303B1 (뒤 4자리 제거 + B1)
    const regNo = number.replace(/0{4}$/, "");
    return `https://patents.google.com/patent/KR${regNo}B1/ko`;
  }
  return `https://patents.google.com/?q=${encodeURIComponent(title)}&assignee=${encodeURIComponent("나인와트")}&country=KR`;
}

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
    { docs: techTransfers },
  ] = await Promise.all([
    getPatents(locale, "domestic"),
    getPatents(locale, "international"),
    getCertifications(locale),
    getTrademarks(locale),
    getTechnologyTransfers(locale),
  ]);

  const domesticRegistered = domesticPatentsAll.filter((p) => p.status === "등록");
  const domesticPending = domesticPatentsAll.filter((p) => p.status === "출원" || p.status === "공개");
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
          <dl className="grid grid-cols-3 gap-x-8 gap-y-6 text-sm md:grid-cols-6">
            <div>
              <dt className="text-muted">{t("patents.technologyTransfers")}</dt>
              <dd className="text-4xl font-bold">{techTransfers.length}</dd>
            </div>
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

      {/* Technology Transfers */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-bold">
            {t("patents.technologyTransfers")} <span className="text-muted">({techTransfers.length}건)</span>
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("patents.tableNo")}</th>
                  <th className="w-28 py-3 pr-3 font-semibold text-muted">{t("patents.transferDate")}</th>
                  <th className="w-44 py-3 pr-3 font-semibold text-muted">{t("patents.regNo")}</th>
                  <th className="py-3 pr-3 font-semibold text-muted">{t("patents.techTransferName")}</th>
                  <th className="whitespace-nowrap py-3 pr-3 font-semibold text-muted">{t("patents.transferType")}</th>
                  <th className="w-48 whitespace-nowrap py-3 font-semibold text-muted">{t("patents.transferInstitution")}</th>
                </tr>
              </thead>
              <AccordionTableBody>
                {techTransfers.map((tt, i) => {
                  const row = (
                    <>
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{tt.transferDate || "—"}</td>
                      <td className="py-3 pr-3 tabular-nums text-xs text-muted">{tt.registrationNo || "—"}</td>
                      <td className="py-3 pr-3">
                        <span className="flex items-center justify-between gap-2">
                          <span>{tt.title}</span>
                          {tt.detail && <DetailTriggerChevron />}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3 pr-3 text-muted">{tt.transferType}</td>
                      <td className="whitespace-nowrap py-3 text-muted">{tt.institution || "—"}</td>
                    </>
                  );

                  if (tt.detail) {
                    return (
                      <DetailExpandableRow key={tt.id} accordionKey={`tt-${tt.id}`} colSpan={6} detail={<TechTransferDetailView transfer={tt} />}>
                        {row}
                      </DetailExpandableRow>
                    );
                  }

                  return (
                    <tr key={tt.id} className="border-b border-border/50">
                      {row}
                    </tr>
                  );
                })}
              </AccordionTableBody>
            </table>
          </div>
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
              <AccordionTableBody>
                {domesticRegistered.map((p, i) => (
                  <ExpandableRow key={p.id} accordionKey={`dr-${p.id}`} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={5} footer={<PatentLink number={p.number} status={p.status} title={p.title} />}>
                    <td className="py-3 pr-3 text-muted">{i + 1}</td>
                    <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{p.date}</td>
                    <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                    <td className="py-3 pr-3"><ExpandableTrigger>{p.title}</ExpandableTrigger></td>
                    <td className="py-3 text-muted line-clamp-2">{p.applicant}</td>
                  </ExpandableRow>
                ))}
              </AccordionTableBody>
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
                <AccordionTableBody>
                  {domesticPending.map((p, i) => (
                    <ExpandableRow key={p.id} accordionKey={`dp-${p.id}`} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={5} footer={<PatentLink number={p.number} status={p.status} title={p.title} />}>
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{p.date}</td>
                      <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3">
                        <ExpandableTrigger>{p.title}</ExpandableTrigger>
                        {p.status === "공개" && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">공개</span>}
                      </td>
                      <td className="py-3 text-muted line-clamp-2">{p.applicant}</td>
                    </ExpandableRow>
                  ))}
                </AccordionTableBody>
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
                <AccordionTableBody>
                  {internationalPatents.map((p, i) => (
                    <ExpandableRow key={p.id} accordionKey={`ip-${p.id}`} thumbnailUrl={p.thumbnailUrl} imageUrls={p.imageUrls} alt={p.title} colSpan={6}>
                      <td className="py-3 pr-3 text-muted">{i + 1}</td>
                      <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{p.date}</td>
                      <td className="py-3 pr-3 tabular-nums text-xs text-muted">{p.number}</td>
                      <td className="py-3 pr-3"><ExpandableTrigger>{p.title}</ExpandableTrigger></td>
                      <td className="py-3 pr-3 text-muted">{p.titleEn}</td>
                      <td className="py-3 whitespace-nowrap text-muted">{p.country}</td>
                    </ExpandableRow>
                  ))}
                </AccordionTableBody>
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
                  <AccordionTableBody>
                    {internationalTrademarks.map((tm, i) => (
                      <ExpandableRow key={tm.id} accordionKey={`itm-${tm.id}`} thumbnailUrl={tm.thumbnailUrl} alt={tm.name} colSpan={4}>
                        <td className="py-3 pr-3 text-muted">{i + 1}</td>
                        <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{tm.date}</td>
                        <td className="py-3 pr-3 whitespace-nowrap text-muted">{tm.country}</td>
                        <td className="py-3 font-medium"><ExpandableTrigger>{tm.name}</ExpandableTrigger></td>
                      </ExpandableRow>
                    ))}
                  </AccordionTableBody>
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

function PatentLink({ number, status, title }: { number: string; status: string; title: string }) {
  return (
    <a
      href={patentUrl(number, status, title)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
    >
      Google Patents에서 보기 &rarr;
    </a>
  );
}

function TechTransferDetailView({ transfer }: { transfer: TechnologyTransfer }) {
  const detail = transfer.detail!;

  return (
    <div className="grid gap-4 md:grid-cols-2 text-sm">
      {detail.abstract && (
        <div className="md:col-span-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-1.5">요약</h4>
          <p className="text-foreground/90 leading-relaxed">{detail.abstract}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-2 md:col-span-2 pt-2 border-t border-border/50">
        <div>
          <span className="text-xs text-muted">출원번호(일자)</span>
          <p className="text-foreground/90">{detail.applicationNo ? `${detail.applicationNo} (${detail.applicationDate})` : "—"}</p>
        </div>
        <div>
          <span className="text-xs text-muted">출원인</span>
          <p className="text-foreground/90">{detail.applicant || "—"}</p>
        </div>
        {detail.registrationNo && (
          <div>
            <span className="text-xs text-muted">등록번호(일자)</span>
            <p className="text-foreground/90">{detail.registrationNo} ({detail.registrationDate})</p>
          </div>
        )}
        <div>
          <span className="text-xs text-muted">법적상태</span>
          <p className="text-foreground/90">{detail.legalStatus || "—"}</p>
        </div>
        {transfer.period && (
          <div>
            <span className="text-xs text-muted">계약기간</span>
            <p className="text-foreground/90">{transfer.period}</p>
          </div>
        )}
      </div>
    </div>
  );
}
