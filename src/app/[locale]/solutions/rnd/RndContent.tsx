"use client";

import { useState } from "react";
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
  };
}

function ProjectRow({ project, labels }: { project: RndProject; labels: { goal: string; contents: string; category: string; department: string; budget: string } }) {
  const [open, setOpen] = useState(false);
  const hasDetail = !!project.detail;

  return (
    <>
      <tr
        className={`border-b border-border ${hasDetail ? "cursor-pointer hover:bg-secondary/30 transition-colors" : ""}`}
        onClick={() => hasDetail && setOpen(!open)}
      >
        <td className="py-3 pr-4 text-muted">{project.agency}</td>
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
      {hasDetail && open && (
        <tr className="border-b border-border bg-secondary/20">
          <td colSpan={4} className="px-4 py-5">
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
      <table className="w-full min-w-[700px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.agency}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.research}</th>
            <th className="py-3 pr-4 font-semibold text-muted">{headerLabels.lead}</th>
            <th className="py-3 font-semibold text-muted">{headerLabels.period}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <ProjectRow key={i} project={p} labels={detailLabels} />
          ))}
        </tbody>
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
    </>
  );
}
