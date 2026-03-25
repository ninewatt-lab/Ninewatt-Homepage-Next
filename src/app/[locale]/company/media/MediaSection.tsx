"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MediaItem } from "@/data/media";

/* ── Icons ── */

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

/* ── View Toggle ── */

function ViewToggle({ view, onChange, labels }: { view: "card" | "table"; onChange: (v: "card" | "table") => void; labels: { card: string; table: string } }) {
  return (
    <div className="flex rounded-lg border border-border">
      <button
        onClick={() => onChange("card")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-l-lg ${
          view === "card"
            ? "bg-primary text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        <CardIcon />
        {labels.card}
      </button>
      <button
        onClick={() => onChange("table")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors rounded-r-lg ${
          view === "table"
            ? "bg-primary text-white"
            : "text-muted hover:text-foreground"
        }`}
      >
        <TableIcon />
        {labels.table}
      </button>
    </div>
  );
}

/* ── Cards ── */

function VideoCard({ item, noImageLabel }: { item: MediaItem; noImageLabel: string }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-muted/20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">{noImageLabel}</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{item.date} · {item.origin}</p>
        <p className="mt-1.5 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary">{item.title}</p>
      </div>
    </a>
  );
}

function NewsCard({ item, noImageLabel }: { item: MediaItem; noImageLabel: string }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video overflow-hidden bg-muted/20">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">{noImageLabel}</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted">{item.date} · {item.origin}</p>
        <p className="mt-1.5 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary">{item.title}</p>
      </div>
    </a>
  );
}

/* ── Table ── */

function MediaTable({ items, labels }: { items: MediaItem[]; labels: { date: string; title: string; source: string } }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-150 table-fixed text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="w-[5%] py-3 pr-3 font-semibold text-muted">No.</th>
            <th className="w-[12%] py-3 pr-3 font-semibold text-muted">{labels.date}</th>
            <th className="w-[68%] py-3 pr-3 font-semibold text-muted">{labels.title}</th>
            <th className="w-[15%] py-3 font-semibold text-muted">{labels.source}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.link} className="border-b border-border">
              <td className="py-3 pr-3 text-muted">{i + 1}</td>
              <td className="py-3 pr-3 whitespace-nowrap text-muted">{item.date}</td>
              <td className="py-3 pr-3">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary hover:underline"
                >
                  {item.title}
                </a>
              </td>
              <td className="py-3 whitespace-nowrap text-muted">{item.origin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Component ── */

type Tab = "news" | "videos";

export default function MediaContent({ news, videos }: { news: MediaItem[]; videos: MediaItem[] }) {
  const [tab, setTab] = useState<Tab>("news");
  const [view, setView] = useState<"card" | "table">("card");
  const t = useTranslations("company");

  const items = tab === "news" ? news : videos;
  const noImageLabel = t("media.noImage");
  const tableLabels = { date: t("media.date"), title: t("media.articleTitle"), source: t("media.source") };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        {/* Controls row */}
        <div className="flex items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setTab("news")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "news"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("media.news")} <span className="text-xs opacity-60">({news.length})</span>
            </button>
            <button
              onClick={() => setTab("videos")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "videos"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("media.videos")} <span className="text-xs opacity-60">({videos.length})</span>
            </button>
          </div>

          {/* View toggle */}
          <ViewToggle view={view} onChange={setView} labels={{ card: t("media.card"), table: t("media.table") }} />
        </div>

        {/* Content */}
        <div className="mt-8">
          {view === "card" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) =>
                tab === "videos" ? (
                  <VideoCard key={item.link} item={item} noImageLabel={noImageLabel} />
                ) : (
                  <NewsCard key={item.link} item={item} noImageLabel={noImageLabel} />
                )
              )}
            </div>
          ) : (
            <MediaTable items={items} labels={tableLabels} />
          )}
        </div>
      </div>
    </section>
  );
}
