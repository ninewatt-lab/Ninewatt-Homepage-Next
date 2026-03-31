import { getTranslations } from "next-intl/server";
import { getPapers } from "@/lib/cms";
import { DetailExpandableRow, DetailTrigger, AccordionTableBody } from "@/components/ImageLightbox";
import type { PaperCategory, Paper } from "@/data/papers";

export async function generateMetadata() {
  const t = await getTranslations("company");
  return {
    title: `${t("papers.title")} - Ninewatt`,
    description: t("papers.subtitle"),
  };
}

const categoryOrder: PaperCategory[] = ["SCI", "international", "domestic"];

export default async function PapersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("company");
  const { docs: papers } = await getPapers(locale);

  const papersByCategory = papers.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof papers>,
  );

  const categoryLabels: Record<PaperCategory, string> = {
    SCI: t("papers.sci"),
    international: t("papers.international"),
    domestic: t("papers.domestic"),
  };

  const sciCount = papersByCategory["SCI"]?.length ?? 0;
  const intlCount = papersByCategory["international"]?.length ?? 0;
  const domesticCount = papersByCategory["domestic"]?.length ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t("papers.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("papers.subtitle")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted">{t("papers.total")}</dt>
              <dd className="text-4xl font-bold">{papers.length}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("papers.sci")}</dt>
              <dd className="text-4xl font-bold">{sciCount}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("papers.international")}</dt>
              <dd className="text-4xl font-bold">{intlCount}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("papers.domestic")}</dt>
              <dd className="text-4xl font-bold">{domesticCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Papers Tables */}
      {papers.length === 0 ? (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-muted">{t("papers.empty")}</p>
          </div>
        </section>
      ) : (
        categoryOrder
          .filter((cat) => papersByCategory[cat]?.length)
          .map((cat) => (
            <section key={cat} className="border-t border-border px-6 py-20">
              <div className="mx-auto max-w-5xl">
                <h2 className="text-xl font-bold">
                  {categoryLabels[cat]} <span className="text-muted">({papersByCategory[cat].length}건)</span>
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-150 text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="w-12 py-3 pr-3 font-semibold text-muted">{t("papers.tableNo")}</th>
                        <th className="w-16 py-3 pr-3 font-semibold text-muted">{t("papers.date")}</th>
                        <th className="py-3 font-semibold text-muted">{t("papers.paperTitle")}</th>
                      </tr>
                    </thead>
                    <AccordionTableBody>
                      {papersByCategory[cat].map((paper, i) => (
                        <DetailExpandableRow
                          key={paper.id}
                          accordionKey={`paper-${paper.id}`}
                          colSpan={3}
                          detail={
                            <PaperDetail
                              paper={paper}
                              labels={{
                                authors: t("papers.authors"),
                                journal: t("papers.journal"),
                                volume: t("papers.volume"),
                                pages: t("papers.pages"),
                                articleNo: t("papers.articleNo"),
                                status: t("papers.status"),
                                underReview: t("papers.underReview"),
                                published: t("papers.published"),
                                searchScholar: t("papers.searchScholar"),
                              }}
                            />
                          }
                        >
                          <td className="py-3 pr-3 text-muted">{i + 1}</td>
                          <td className="py-3 pr-3 whitespace-nowrap tabular-nums text-muted">{paper.date}</td>
                          <td className="py-3">
                            <div className="flex items-baseline gap-2">
                              <DetailTrigger>
                                {paper.title}
                              </DetailTrigger>
                              {paper.status === "under-review" && (
                                <span className="shrink-0 rounded bg-muted/10 px-1.5 py-0.5 text-[11px] text-muted">
                                  {t("papers.underReview")}
                                </span>
                              )}
                            </div>
                          </td>
                        </DetailExpandableRow>
                      ))}
                    </AccordionTableBody>
                  </table>
                </div>
              </div>
            </section>
          ))
      )}
    </>
  );
}

interface PaperLabels {
  authors: string;
  journal: string;
  volume: string;
  pages: string;
  articleNo: string;
  status: string;
  underReview: string;
  published: string;
  searchScholar: string;
}

function PaperDetail({ paper, labels }: { paper: Paper; labels: PaperLabels }) {
  const volumeDisplay = paper.volume
    ? paper.issue
      ? `${paper.volume}(${paper.issue})`
      : paper.volume
    : null;

  return (
    <div className="space-y-3 text-sm">
      {/* 저자 */}
      <div>
        <span className="text-xs text-muted">{labels.authors}</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {paper.authors.map((author, i) => (
            <span
              key={i}
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs ${
                i === 0
                  ? "border-primary/30 bg-primary/5 font-medium text-primary"
                  : "border-border text-foreground/80"
              }`}
            >
              {author}
            </span>
          ))}
        </div>
      </div>

      {/* 논문 서지정보 */}
      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <span className="text-xs text-muted">{labels.journal}</span>
          <p className="text-foreground/90">{paper.journal}</p>
        </div>
        {volumeDisplay && (
          <div>
            <span className="text-xs text-muted">{labels.volume}</span>
            <p className="text-foreground/90">{volumeDisplay}</p>
          </div>
        )}
        {paper.pages && (
          <div>
            <span className="text-xs text-muted">{labels.pages}</span>
            <p className="text-foreground/90">{paper.pages}</p>
          </div>
        )}
        {paper.articleNo && (
          <div>
            <span className="text-xs text-muted">{labels.articleNo}</span>
            <p className="text-foreground/90">{paper.articleNo}</p>
          </div>
        )}
        {paper.status && (
          <div>
            <span className="text-xs text-muted">{labels.status}</span>
            <p className="text-foreground/90">
              {paper.status === "under-review" ? labels.underReview : labels.published}
            </p>
          </div>
        )}
      </div>

      {/* 링크 */}
      {(paper.linkUrl || paper.doi) && (
        <div>
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-4 text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              DOI: {paper.doi}
            </a>
          )}
          {paper.linkUrl && (
            <a
              href={paper.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {labels.searchScholar}
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
