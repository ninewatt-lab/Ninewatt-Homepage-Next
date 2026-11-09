"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export interface PlatformShot {
  src: string;
  width: number;
  height: number;
  caption: string;
}

// 16:10 보다 긴 캡처는 위쪽을 기준으로 잘라 보이고, 넓은 캡처는 잘리지 않게 들인다
const FRAME_RATIO = 16 / 10;

/** 캡션이 붙은 플랫폼 화면. 큰 화면을 누르면 전체 캡처를 띄운다. */
export function PlatformGallery({
  shots,
  alt,
  labels,
  preload = false,
}: {
  shots: PlatformShot[];
  alt: string;
  labels: { open: string; close: string; prev: string; next: string };
  preload?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = shots[active];
  const wide = current.width / current.height >= FRAME_RATIO;

  const step = useCallback(
    (d: number) => setActive((i) => (i + d + shots.length) % shots.length),
    [shots.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${labels.open}: ${current.caption}`}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={`${alt} · ${current.caption}`}
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          preload={preload && active === 0}
          className={wide ? "object-contain" : "object-cover object-top"}
        />
        <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {labels.open}
        </span>
      </button>
      <p className="mt-3 text-sm text-muted">
        <span className="mr-2 font-semibold text-foreground tabular-nums">
          {active + 1} / {shots.length}
        </span>
        {current.caption}
      </p>
      {shots.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={s.caption}
              aria-pressed={i === active}
              className={`relative h-14 w-24 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === active
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-border/50 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={s.src} alt="" fill sizes="96px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex items-center gap-3 px-4 py-3 text-white">
            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="mr-2 font-semibold tabular-nums">
                {active + 1} / {shots.length}
              </span>
              {current.caption}
            </p>
            {shots.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label={labels.prev} className="rounded-full p-2 hover:bg-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button type="button" onClick={() => step(1)} aria-label={labels.next} className="rounded-full p-2 hover:bg-white/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} autoFocus className="rounded-full p-2 hover:bg-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
          {/* 긴 캡처는 이 안에서 세로로 스크롤한다 */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-6"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={`${alt} · ${current.caption}`}
              width={current.width}
              height={current.height}
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="mx-auto h-auto w-full max-w-[1440px] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
