"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface RndProject {
  agency: string;
  research: string;
  lead: string;
  period: string;
  status: "수행중" | "완료";
  detail?: {
    goal: string;
    contents: string[];
    budget: string;
    department: string;
    category: string;
    images?: string[];
    link?: string;
  };
}

// ─── Accordion Context ───

const RndAccordionContext = createContext<{
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
} | null>(null);

function RndAccordionBody({ children }: { children: React.ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <RndAccordionContext.Provider value={{ openKey, setOpenKey }}>
      <tbody>{children}</tbody>
    </RndAccordionContext.Provider>
  );
}

function ProjectRow({ project, index, labels }: { project: RndProject; index: number; labels: { goal: string; contents: string; category: string; department: string; budget: string } }) {
  const accordion = useContext(RndAccordionContext);
  const key = `rnd-${index}`;
  const hasDetail = !!project.detail;

  const open = accordion ? accordion.openKey === key : false;
  const toggle = () => {
    if (!hasDetail) return;
    if (accordion) {
      accordion.setOpenKey(open ? null : key);
    }
  };

  const [mounted, setMounted] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (open) {
      if (!mounted) {
        setMounted(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimateOpen(true);
          });
        });
      } else {
        setAnimateOpen(true);
      }
    } else {
      setAnimateOpen(false);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!open) setActiveImage(0);
  }, [open]);

  const images = project.detail?.images;

  return (
    <>
      <tr
        className={`border-b border-border ${hasDetail ? "cursor-pointer hover:bg-secondary/30 transition-colors" : ""} ${animateOpen ? "border-b-0!" : ""}`}
        onClick={toggle}
>
        <td className="py-3 pl-2 pr-8 text-muted">{project.agency}</td>
        <td className="py-3 pr-4">
          <span className="flex items-center gap-2">
            {project.research}
            {hasDetail && (
              <svg
                className={`w-4 h-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </td>
        <td className="py-3 pr-4 text-muted">{project.lead}</td>
        <td className="py-3 whitespace-nowrap text-muted">{project.period}</td>
      </tr>
      {hasDetail && mounted && (
        <tr className={animateOpen ? "border-b border-border" : ""}>
          <td colSpan={4} className="p-0!">
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                animateOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 py-5 bg-secondary/20">
                  {/* Image gallery */}
                  {images && images.length > 0 && (
                    <div className="mb-5">
                      <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-lg border border-border/50 bg-black/5 dark:bg-white/5">
                        <Image
                          src={images[activeImage]}
                          alt={project.research}
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          className="object-contain"
                        />
                      </div>
                      {images.length > 1 && (
                        <div className="mt-3 flex gap-2">
                          {images.map((img, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(i);
                              }}
                              className={`relative h-14 w-24 overflow-hidden rounded border-2 transition-all ${
                                i === activeImage
                                  ? "border-primary ring-1 ring-primary/30"
                                  : "border-border/50 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <Image src={img} alt={`${project.research} ${i + 1}`} fill sizes="96px" className="object-contain" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 text-sm">
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-1.5">
                        {labels.goal}
                      </h4>
                      <p className="text-foreground/90 leading-relaxed">
                        {project.detail!.goal}
                      </p>
                    </div>

                    {project.detail!.contents.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted mb-1.5">
                          {labels.contents}
                        </h4>
                        <ul className="space-y-1">
                          {project.detail!.contents.map((c, i) => (
                            <li key={i} className="flex gap-2 text-foreground/90 leading-relaxed">
                              <span className="text-muted shrink-0">{i + 1}.</span>
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-8 gap-y-2 md:col-span-2 pt-2 border-t border-border/50">
                      <div>
                        <span className="text-xs text-muted">{labels.category}</span>
                        <p className="text-foreground/90">{project.detail!.category}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted">{labels.department}</span>
                        <p className="text-foreground/90">{project.detail!.department}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted">{labels.budget}</span>
                        <p className="text-foreground/90">{project.detail!.budget}</p>
                      </div>
                    </div>

                    {project.detail!.link && (
                      <div className="md:col-span-2 pt-2">
                        <a
                          href={project.detail!.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                          </svg>
                          시스템 바로가기
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ProjectTable({ projects, headerLabels, detailLabels }: { projects: RndProject[]; headerLabels: { agency: string; research: string; lead: string; period: string }; detailLabels: { goal: string; contents: string; category: string; department: string; budget: string } }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 table-fixed text-sm">
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[53%]" />
          <col className="w-[14%]" />
          <col className="w-[15%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 pl-2 pr-8 font-semibold text-muted">{headerLabels.agency}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.research}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.lead}</th>
            <th className="py-3 font-semibold text-muted">{headerLabels.period}</th>
          </tr>
        </thead>
        <RndAccordionBody>
          {projects.map((p, i) => (
            <ProjectRow key={i} project={p} index={i} labels={detailLabels} />
          ))}
        </RndAccordionBody>
      </table>
    </div>
  );
}

export function RndContent({ projects }: { projects: RndProject[] }) {
  const t = useTranslations("solutions");
  const headerLabels = t.raw("rnd.tableHeaders") as { agency: string; research: string; lead: string; period: string };
  const detailLabels = t.raw("rnd.detailLabels") as { goal: string; contents: string; category: string; department: string; budget: string };

  const inProgress = projects.filter((p) => p.status === "수행중");
  const completed = projects.filter((p) => p.status === "완료");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("rnd.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("rnd.subtitle")} — {projects.length}{t("rnd.count")} ({t("rnd.inProgress")}{" "}
            {inProgress.length}, {t("rnd.completed")} {completed.length})
          </p>
          <p className="mt-2 text-sm text-muted">
            {t("rnd.clickHint")}
          </p>
        </div>
      </section>

      {/* In Progress */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            {t("rnd.inProgress")} <span className="text-muted">({inProgress.length}{t("rnd.count")})</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={inProgress} headerLabels={headerLabels} detailLabels={detailLabels} />
          </div>
        </div>
      </section>

      {/* Completed */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold">
            {t("rnd.completed")} <span className="text-muted">({completed.length}{t("rnd.count")})</span>
          </h2>
          <div className="mt-6">
            <ProjectTable projects={completed} headerLabels={headerLabels} detailLabels={detailLabels} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight">{t("rnd.ctaTitle")}</h2>
          <p className="mt-3 text-muted">
            {t("rnd.ctaDesc")}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            {t("rnd.ctaButton")}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
