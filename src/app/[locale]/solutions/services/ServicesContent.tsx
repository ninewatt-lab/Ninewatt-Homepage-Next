"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface ServiceProject {
  client: string;
  period: string;
  title: string;
  detail?: {
    description: string;
    images: string[];
    link: string;
  };
}

// ─── Accordion Context ───

const AccordionContext = createContext<{
  openKey: string | null;
  setOpenKey: (key: string | null) => void;
} | null>(null);

function AccordionBody({ children }: { children: React.ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ openKey, setOpenKey }}>
      <tbody>{children}</tbody>
    </AccordionContext.Provider>
  );
}

function ServiceRow({ project, index }: { project: ServiceProject; index: number }) {
  const accordion = useContext(AccordionContext);
  const key = `svc-${index}`;
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

  // Reset active image when closing
  useEffect(() => {
    if (!open) setActiveImage(0);
  }, [open]);

  return (
    <>
      <tr
        className={`border-b border-border ${hasDetail ? "cursor-pointer hover:bg-secondary/30 transition-colors" : ""} ${animateOpen ? "border-b-0!" : ""}`}
        onClick={toggle}
      >
        <td className="py-3 pr-4 whitespace-nowrap text-muted">{project.client}</td>
        <td className="py-3 pr-4 whitespace-nowrap text-muted">{project.period}</td>
        <td className="py-3">
          <span className="flex items-center gap-2">
            {project.title}
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
      </tr>
      {hasDetail && mounted && (
        <tr className={animateOpen ? "border-b border-border" : ""}>
          <td colSpan={3} className="p-0!">
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                animateOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 py-6 bg-secondary/20">
                  {/* Image gallery */}
                  <div className="mb-4">
                    <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-lg border border-border/50 bg-black/5 dark:bg-white/5">
                      <Image
                        src={project.detail!.images[activeImage]}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="object-contain"
                      />
                    </div>
                    {project.detail!.images.length > 1 && (
                      <div className="mt-3 flex gap-2">
                        {project.detail!.images.map((img, i) => (
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
                            <Image src={img} alt={`${project.title} ${i + 1}`} fill sizes="96px" className="object-contain" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-foreground/90 leading-relaxed max-w-3xl">
                    {project.detail!.description}
                  </p>

                  {/* Link */}
                  {project.detail!.link && (
                    <a
                      href={project.detail!.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
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
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function ServicesContent({ projects }: { projects: ServiceProject[] }) {
  const t = useTranslations("solutions");
  const headers = t.raw("services.tableHeaders") as { client: string; period: string; content: string };

  const hasDetailProjects = projects.some((p) => p.detail);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("services.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("services.subtitleTemplate", {
              count: projects.length,
              partners: new Set(projects.map((p) => p.client)).size,
            })}
          </p>
          {hasDetailProjects && (
            <p className="mt-2 text-sm text-muted">
              {t("services.clickHint")}
            </p>
          )}
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
              <AccordionBody>
                {projects.map((p, i) => (
                  <ServiceRow key={i} project={p} index={i} />
                ))}
              </AccordionBody>
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
