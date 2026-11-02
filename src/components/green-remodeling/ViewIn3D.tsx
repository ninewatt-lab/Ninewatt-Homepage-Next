"use client";

import type { GrKey } from "./grData";

/** 아래 카드에서 첫 화면 3D 로 올라가 그 건물 시공을 연다 (GRSection 이 이벤트를 받는다) */
export const FOCUS_EVENT = "gr:focus";

export default function ViewIn3D({ k, label }: { k: GrKey; label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        window.dispatchEvent(new CustomEvent(FOCUS_EVENT, { detail: k }));
      }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
    >
      {label}
      <span aria-hidden="true">↑</span>
    </button>
  );
}
