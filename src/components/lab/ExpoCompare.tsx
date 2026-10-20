"use client";

import Image from "next/image";
import { useState } from "react";
import type { LabImage } from "@/data/labProjects";

/**
 * 같은 카메라로 그린 리모델링 전 ↔ 후 비교 슬라이더 (/expo 열 손실 장면).
 * 슬라이더 왼쪽은 전, 오른쪽은 후. 렌더가 어두운 무대라 틀도 어둡게 둔다.
 */
export default function ExpoCompare({
  before,
  after,
  labels,
}: {
  before: LabImage;
  after: LabImage;
  labels: { before: string; after: string; handle: string };
}) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-[#0d0f10]">
      <Image src={after.src} alt={labels.after} width={after.width} height={after.height} sizes="(min-width: 1024px) 64rem, 100vw" className="h-auto w-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={before.src} alt={labels.before} width={before.width} height={before.height} sizes="(min-width: 1024px) 64rem, 100vw" className="h-auto w-full" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-white/70" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/60 text-white">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M6 4L2 8l4 4M10 4l4 4-4 4" />
          </svg>
        </span>
      </div>
      <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">{labels.before}</span>
      <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white">{labels.after}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={labels.handle}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
