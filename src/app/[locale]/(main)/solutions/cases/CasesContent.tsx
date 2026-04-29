"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CaseItem {
  title: string;
  category: string;
  desc: string;
  detail?: {
    description: string;
    images: string[];
    link: string;
  };
}

interface StatItem {
  value: string;
  label: string;
}

function CaseRow({ item, index, openKey, setOpenKey }: { item: CaseItem; index: number; openKey: string | null; setOpenKey: (key: string | null) => void }) {
  const hasDetail = !!item.detail;
  const key = `case-${index}`;
  const open = openKey === key;

  const toggle = () => {
    if (!hasDetail) return;
    setOpenKey(open ? null : key);
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

  return (
    <div className={`${animateOpen ? "" : "border-b border-border"}`}>
      <div
        className={`py-4 ${hasDetail ? "cursor-pointer hover:bg-secondary/30 transition-colors rounded-md px-2 -mx-2" : ""}`}
        onClick={toggle}
      >
        <p className="text-base font-medium flex items-center gap-2">
          {item.title}
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
        </p>
        <p className="mt-1 text-base text-muted">{item.desc}</p>
      </div>

      {hasDetail && mounted && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            animateOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className={`px-2 -mx-2 pb-5 pt-1 ${animateOpen ? "border-b border-border" : ""}`}>
              <div className="rounded-lg bg-secondary/20 p-4">
                {/* Image gallery */}
                <div className="mb-4">
                  <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-lg border border-border/50 bg-black/5 dark:bg-white/5">
                    <Image
                      src={item.detail!.images[activeImage]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-contain"
                    />
                  </div>
                  {item.detail!.images.length > 1 && (
                    <div className="mt-3 flex gap-2">
                      {item.detail!.images.map((img, i) => (
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
                          <Image src={img} alt={`${item.title} ${i + 1}`} fill sizes="96px" className="object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-base text-foreground/90 leading-relaxed max-w-3xl">
                  {item.detail!.description}
                </p>

                {/* Link */}
                {item.detail!.link && (
                  <a
                    href={item.detail!.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                    </svg>
                    서비스 바로가기
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CasesContent({ cases, stats }: { cases: CaseItem[]; stats: StatItem[] }) {
  const t = useTranslations("solutions");
  const categories = t.raw("cases.categories") as Record<string, string>;
  const categoryValues = Object.values(categories);

  const [openKey, setOpenKey] = useState<string | null>(null);

  const hasDetailItems = cases.some((c) => c.detail);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border px-6 pb-16 pt-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t("cases.title")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            {t("cases.subtitle")}
          </p>
          {hasDetailItems && (
            <p className="mt-2 text-base text-muted">
              {t("cases.clickHint")}
            </p>
          )}
        </div>
      </section>

      {/* Cases grouped by category */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          {categoryValues.map((cat) => {
            const items = cases.filter((c) => c.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="text-xl font-bold">{cat}</h2>
                <div className="mt-4 divide-y-0">
                  {items.map((c) => {
                    const globalIndex = cases.indexOf(c);
                    return (
                      <CaseRow
                        key={c.title}
                        item={c}
                        index={globalIndex}
                        openKey={openKey}
                        setOpenKey={setOpenKey}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-12 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="ml-2 text-base text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
