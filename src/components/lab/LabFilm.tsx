"use client";

import { useCallback, useRef, useState } from "react";

/** Lab 상세의 프로젝트 영상 + 챕터 내비게이션. */

export interface LabFilmChapter {
  start: number;
  label: string;
  clock: string;
}

export function LabFilm({
  src,
  poster,
  title,
  chapters,
  chapterNavLabel,
  disclaimer,
}: {
  src: string;
  poster: string;
  title: string;
  chapters: LabFilmChapter[];
  chapterNavLabel: string;
  disclaimer: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(-1);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    video.play().catch(() => {
      // 자동재생 정책으로 막히면 시점만 옮겨 두고 사용자가 재생하게 둔다
    });
  }, []);

  const onTimeUpdate = () => {
    const t = videoRef.current?.currentTime ?? 0;
    let idx = -1;
    chapters.forEach((c, i) => {
      if (t >= c.start) idx = i;
    });
    setActive(idx);
  };

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <video
          ref={videoRef}
          className="aspect-video h-auto w-full"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={title}
          onTimeUpdate={onTimeUpdate}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <p className="mt-3 text-sm text-muted">{disclaimer}</p>

      {chapters.length > 0 && (
        <nav aria-label={chapterNavLabel} className="mt-6">
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {chapters.map((c, i) => (
              <li key={c.start}>
                <button
                  type="button"
                  onClick={() => seek(c.start)}
                  aria-current={active === i ? "step" : undefined}
                  className={`flex h-full w-full flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    active === i
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 hover:bg-surface"
                  }`}
                >
                  <span className="flex w-full items-center justify-between text-xs text-muted">
                    <span className={active === i ? "text-primary" : ""}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{c.clock}</span>
                  </span>
                  <span className="text-sm font-medium leading-snug text-foreground">{c.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
