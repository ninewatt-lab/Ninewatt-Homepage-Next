"use client";

import Image from "next/image";
import { useState } from "react";
import type { LabImage } from "@/data/labProjects";

/**
 * 같은 축척·원점으로 맞춘 도면 ↔ 모델 비교.
 * 나눠 보기: 슬라이더 왼쪽은 도면, 오른쪽은 모델. 겹쳐 보기: 미리 합성한 overlay 이미지.
 */
export default function LabCompare({
  drawing,
  model,
  overlay,
  labels,
}: {
  drawing: LabImage;
  model: LabImage;
  overlay: LabImage;
  labels: { drawing: string; model: string; overlay: string; split: string; handle: string; legend: string };
}) {
  const [mode, setMode] = useState<"split" | "overlay">("split");
  const [pos, setPos] = useState(50);

  const tab = (value: "split" | "overlay", text: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        mode === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"
      }`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border p-1">
          {tab("split", labels.split)}
          {tab("overlay", labels.overlay)}
        </div>
        {mode === "overlay" && <p className="text-sm text-muted">{labels.legend}</p>}
      </div>

      {/* Drawings are black-on-white, so the frame stays white in dark mode too */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-white">
        {mode === "overlay" ? (
          <Image src={overlay.src} alt={labels.overlay} width={overlay.width} height={overlay.height} className="h-auto w-full" />
        ) : (
          <>
            <Image src={model.src} alt={labels.model} width={model.width} height={model.height} className="h-auto w-full" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Image src={drawing.src} alt={labels.drawing} width={drawing.width} height={drawing.height} className="h-auto w-full" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-px bg-primary" style={{ left: `${pos}%` }} aria-hidden="true">
              <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-white text-primary shadow-sm">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M6 4L2 8l4 4M10 4l4 4-4 4" />
                </svg>
              </span>
            </div>
            <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-medium text-neutral-800">
              {labels.drawing}
            </span>
            <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs font-medium text-neutral-800">
              {labels.model}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label={labels.handle}
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </>
        )}
      </div>
    </div>
  );
}
