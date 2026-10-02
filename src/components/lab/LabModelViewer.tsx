"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useEffect, useState, type ReactNode } from "react";
import type { Level, Look, ViewerData } from "./LabModelCanvas";

// three.js 는 크기가 커서 "3D로 보기"를 누른 뒤에만 불러온다
const LabModelCanvas = dynamic(() => import("./LabModelCanvas"), { ssr: false });

/** WebGL 을 만들 수 없는 브라우저(오래된 기기, 하드웨어 가속 꺼짐)에서 캔버스 오류가 페이지 전체로 번지지 않게 막는다 */
class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export interface ViewerLabels {
  open: string;
  loading: string;
  hint: string;
  reset: string;
  level: string;
  levels: Record<Level, string>;
  look: string;
  looks: Record<Look, string>;
  plan: string;
  roomHint: string;
  roomHintAll: string;
  area: string;
  perimeter: string;
  wallArea: string;
  railing: string;
  status: string;
  auto: string;
  review: string;
  close: string;
  roofNote: string;
  unsupported: string;
}

export default function LabModelViewer({
  dataUrl,
  poster,
  posterAlt,
  labels,
  roomNames,
}: {
  /** viewer.json URL. 모델·평면 경로는 이 파일 기준 상대 경로 */
  dataUrl: string;
  poster: { src: string; width: number; height: number };
  posterAlt: string;
  labels: ViewerLabels;
  roomNames: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [data, setData] = useState<ViewerData | null>(null);
  const [error, setError] = useState(false);
  const [level, setLevel] = useState<Level>("all");
  const [look, setLook] = useState<Look>("material");
  const [plan, setPlan] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const base = dataUrl.slice(0, dataUrl.lastIndexOf("/") + 1);

  useEffect(() => {
    if (!open || data) return;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setError(true));
  }, [open, data, dataUrl]);

  // 층을 바꾸면 선택한 실이 화면에서 사라질 수 있으므로 해제한다
  const changeLevel = (v: Level) => {
    setLevel(v);
    setSelected(null);
  };

  // 지붕이 덮여 있으면 도면이 안 보이므로, 도면을 켜면 지붕을 걷는다
  const togglePlan = () => {
    if (!plan && level === "all") changeLevel("noRoof");
    setPlan(!plan);
  };

  const room = data?.rooms.find((r) => r.key === selected);

  const seg = <T extends string>(value: T, current: T, set: (v: T) => void, text: string) => (
    <button
      key={value}
      type="button"
      onClick={() => set(value)}
      aria-pressed={current === value}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        current === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"
      }`}
    >
      {text}
    </button>
  );

  if (!open) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-white">
        <Image
          src={poster.src}
          alt={posterAlt}
          width={poster.width}
          height={poster.height}
          sizes="(min-width: 1024px) 64rem, 100vw"
          className="h-auto w-full"
        />
        <button
          type="button"
          onClick={() => (hasWebGL() ? setOpen(true) : setUnsupported(true))}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
            <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
          </svg>
          {labels.open}
        </button>
        {unsupported && (
          <p className="absolute bottom-4 left-4 right-48 rounded-lg bg-white/95 px-3 py-2 text-xs text-neutral-700 shadow">
            {labels.unsupported}
          </p>
        )}
      </div>
    );
  }

  const roomHint = level === "all" ? labels.roomHintAll : labels.roomHint;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* 도구 막대 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-background px-3 py-2">
        <div className="flex items-center gap-1" role="group" aria-label={labels.level}>
          {(["all", "noRoof", "f1"] as Level[]).map((v) => seg(v, level, changeLevel, labels.levels[v]))}
        </div>
        <div className="flex items-center gap-1" role="group" aria-label={labels.look}>
          {(["material", "line"] as Look[]).map((v) => seg(v, look, setLook, labels.looks[v]))}
        </div>
        <button
          type="button"
          onClick={togglePlan}
          aria-pressed={plan}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            plan ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:text-foreground"
          }`}
        >
          {labels.plan}
        </button>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="ml-auto rounded-full px-3 py-1 text-xs font-medium text-muted hover:text-foreground"
        >
          {labels.reset}
        </button>
      </div>

      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        {data ? (
          <CanvasBoundary
            fallback={
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
                {labels.unsupported}
              </div>
            }
          >
          <LabModelCanvas
            base={base}
            data={data}
            level={level}
            look={look}
            plan={plan}
            selected={selected}
            onSelect={setSelected}
            resetKey={resetKey}
          />
          </CanvasBoundary>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {error ? "—" : labels.loading}
          </div>
        )}

        {/* 실 정보 */}
        {room && (
          <div className="absolute left-3 top-3 w-60 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-snug">{roomNames[room.key] ?? room.key}</p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label={labels.close}
                className="-mr-1 -mt-1 rounded p-1 text-muted hover:text-foreground"
              >
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{labels.area}</dt>
                <dd className="tabular-nums">{room.area.toFixed(2)} ㎡</dd>
              </div>
              {room.L != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{labels.perimeter}</dt>
                  <dd className="tabular-nums">{room.L.toFixed(1)} m</dd>
                </div>
              )}
              {room.WA != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{labels.wallArea}</dt>
                  <dd className="tabular-nums">{room.WA.toFixed(1)} ㎡</dd>
                </div>
              )}
              {room.railing != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{labels.railing}</dt>
                  <dd className="tabular-nums">{room.railing.toFixed(1)} m</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{labels.status}</dt>
                <dd className={room.review ? "text-amber-700 dark:text-amber-400" : ""}>
                  {room.review ? labels.review : labels.auto}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <p className="pointer-events-none absolute bottom-2 left-3 right-3 text-[11px] leading-snug text-neutral-600">
          {labels.hint} · {roomHint}
          {level === "all" && look === "material" ? ` · ${labels.roofNote}` : ""}
        </p>
      </div>
    </div>
  );
}
