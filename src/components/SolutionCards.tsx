"use client";

import { useState, type ReactNode } from "react";

/* ── Icon mapping per solution id ── */
const icons: Record<string, ReactNode> = {
  "data-infra": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  monitoring: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m3 5.5V8.25m3 3v-2" />
    </svg>
  ),
  "ai-analysis": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  "bems-ai": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  ubem: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3 0h.008v.008H18V7.5z" />
    </svg>
  ),
  renewable: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
};

interface Solution {
  id: string;
  title: string;
  desc: string;
  items: string[];
}

export default function SolutionCards({ solutions }: { solutions: Solution[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {solutions.map((sol, idx) => {
        const isExpanded = expandedId === sol.id;
        return (
          <button
            key={sol.id}
            type="button"
            onClick={() => setExpandedId(isExpanded ? null : sol.id)}
            className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
              isExpanded
                ? "border-primary/40 bg-primary-50/50 shadow-lg shadow-primary/5"
                : "border-border bg-surface-elevated hover:border-primary/20 hover:shadow-md hover:shadow-primary/5"
            }`}
          >
            {/* Step number watermark */}
            <span
              className={`pointer-events-none absolute -right-2 -top-4 font-mono text-[5.5rem] font-black leading-none transition-colors duration-300 ${
                isExpanded ? "text-primary/10" : "text-foreground/[0.03] group-hover:text-primary/[0.06]"
              }`}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>

            <div className="relative p-6 md:p-8">
              {/* Header row */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                    isExpanded
                      ? "bg-primary text-white"
                      : "bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white"
                  }`}
                >
                  {icons[sol.id]}
                </div>
                <div className="min-w-0 flex-1">
                  {/* Step label */}
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Step {String(idx + 1).padStart(2, "0")}
                  </p>
                  {/* Title */}
                  <h3 className="mt-1 text-xl font-bold tracking-tight">{sol.title}</h3>
                </div>
                {/* Expand indicator */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`size-5 shrink-0 text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>

              {/* Description */}
              <p className="mt-3 text-base leading-relaxed text-muted">{sol.desc}</p>

              {/* Expandable detail items */}
              <div
                className={`grid transition-all duration-300 ${
                  isExpanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-2 border-t border-border/60 pt-4">
                    {sol.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-base text-muted">
                        <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-primary/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
