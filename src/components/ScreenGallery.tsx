"use client";

import { useState } from "react";
import Image from "next/image";

export interface Screen {
  src: string;
  width: number;
  height: number;
}

/** 제품 화면 스크린샷. 2장 이상이면 썸네일로 전환한다. */
export function ScreenGallery({ screens, alt, sizes = "(max-width: 1024px) 100vw, 1024px" }: { screens: Screen[]; alt: string; sizes?: string }) {
  const [active, setActive] = useState(0);
  const current = screens[active];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <Image
          key={current.src}
          src={current.src}
          alt={`${alt} ${active + 1}`}
          width={current.width}
          height={current.height}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
      {screens.length > 1 && (
        <div className="mt-3 flex gap-2">
          {screens.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-pressed={i === active}
              className={`relative h-14 w-24 overflow-hidden rounded border-2 transition-all ${
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
    </div>
  );
}
