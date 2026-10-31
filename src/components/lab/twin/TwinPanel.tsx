"use client";

/**
 * Lab v2 트윈 옆 패널 — 지금 보기(구축 · 실 · 그린리모델링)의 설명 · 진행 · 결과.
 * 수치는 v1 데이터(viewer.json · ai-building-workspace-energy.json)에서 그대로 읽는다.
 *
 * 그래프 규칙(홈 히어로 패널과 같음): 차트 하나에 축 하나, 계열 2개 이상이면 범례,
 * 마우스를 올리면 세로선 + 툴팁, 글자는 계열 색이 아닌 글자 색.
 */

import { useRef, useState } from "react";
import energy from "@/data/lab/ai-building-workspace-energy.json";
import { BUILD, REMODEL, REMODEL_STEP_KEYS, THERMAL_STOPS, span, type TwinFloor, type TwinMode } from "./twinModel";

export type TwinLabels = {
  loading: string;
  unsupported: string;
  hint: string;
  tabsLabel: string;
  tabs: Record<TwinMode, string>;
  play: string;
  pause: string;
  footnote: string;
  build: {
    kicker: string;
    title: string;
    desc: string;
    stats: Record<"lines" | "layers" | "walls" | "windows", string>;
    steps: Record<"plan" | "rise", string>;
    replay: string;
    roofNote: string;
  };
  rooms: {
    kicker: string;
    title: string;
    desc: string;
    floorLabel: string;
    floors: Record<TwinFloor, string>;
    area: string;
    perimeter: string;
    wallArea: string;
    railing: string;
    auto: string;
    review: string;
    total: string;
    pick: string;
  };
  remodel: {
    kicker: string;
    title: string;
    desc: string;
    steps: Record<"scan" | "insulation" | "windows" | "pv", { title: string; desc: string }>;
    waiting: string;
    done: string;
    legendLow: string;
    legendHigh: string;
    result: string;
    before: string;
    after: string;
    heating: string;
    cooling: string;
    unit: string;
    chart: string;
    pvAnnual: string;
    pvNote: string;
    view: string;
    thermal: string;
    replay: string;
    note: string;
    more: string;
  };
};

export type PanelRoom = { key: string; floor: TwinFloor; area: number; review: boolean; L?: number | null; WA?: number | null; railing?: number | null };

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const n0 = (v: number) => Math.round(v).toLocaleString("ko-KR");

// 어두운 표면(#07141b)에서 밝기 · 채도 · 색각 이상 구분 검사를 통과한 계열 색 (홈 히어로 패널과 같다)
const SERIES_AFTER = "#2C9DB3";
const SERIES_BEFORE = "#CC7E33";

const E = energy.energy;
const TOTAL_BEFORE = E.before.heat + E.before.cool;
const TOTAL_AFTER = E.after.heat + E.after.cool;
const SAVING = Math.round((1 - TOTAL_AFTER / TOTAL_BEFORE) * 100);
const MONTHLY_BEFORE = E.before.heat_m.map((h, i) => h + E.before.cool_m[i]);
const MONTHLY_AFTER = E.after.heat_m.map((h, i) => h + E.after.cool_m[i]);

const card = "rounded-2xl border border-white/12 bg-[#07141b]/92 p-5 text-left text-white shadow-2xl backdrop-blur-md";
const kickerCls = "text-[11px] font-semibold tracking-wide text-primary-light";
const button =
  "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="mt-1 text-lg font-semibold leading-none tabular-nums">
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-medium text-white/50">{unit}</span>}
      </div>
    </div>
  );
}

function Step({ n, title, desc, amount, waiting, done, children }: { n: number; title: string; desc?: string; amount: number; waiting: string; done: string; children?: React.ReactNode }) {
  const state = amount >= 1 ? done : amount > 0 ? `${Math.round(amount * 100)}%` : waiting;
  return (
    <li className="flex gap-3">
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums ${amount >= 1 ? "border-primary bg-primary text-white" : amount > 0 ? "border-primary-light text-primary-light" : "border-white/20 text-white/40"}`}
        aria-hidden="true"
      >
        {amount >= 1 ? (
          <svg width="9" height="9" viewBox="0 0 10 10">
            <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          n
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[13px] font-semibold ${amount > 0 ? "text-white" : "text-white/55"}`}>{title}</span>
          <span className="text-[11px] tabular-nums text-white/50">{state}</span>
        </div>
        <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-primary-light" style={{ width: `${amount * 100}%` }} />
        </div>
        {desc && <p className="mt-1.5 text-[12px] leading-relaxed text-white/60">{desc}</p>}
        {children}
      </div>
    </li>
  );
}

/* ── 월별 그래프 ──────────────────────────────────────────────────── */

const W = 320;
const H = 130;
const PAD = { l: 34, r: 8, t: 8, b: 20 };

function MonthChart({ before, after, labels, unit }: { before: number[]; after: number[]; labels: { before: string; after: string }; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const top = Math.ceil(Math.max(...before, ...after) / 500) * 500;
  const x = (i: number) => PAD.l + ((i + 0.5) / 12) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + ((top - v) / top) * (H - PAD.t - PAD.b);
  const path = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const series = [
    { label: labels.before, color: SERIES_BEFORE, values: before },
    { label: labels.after, color: SERIES_AFTER, values: after },
  ];
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.round(((((e.clientX - r.left) / r.width) * W - PAD.l) / (W - PAD.l - PAD.r)) * 12 - 0.5);
    setHover(Math.min(11, Math.max(0, i)));
  };
  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/60">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={series.map((s) => s.label).join(", ")}>
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="rgba(255,255,255,0.08)" />
            <text x={PAD.l - 6} y={y(v) + 3.5} textAnchor="end" className="fill-white/45" fontSize={9}>
              {n0(v)}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 11].map((i) => (
          <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="fill-white/45" fontSize={9}>
            {i + 1}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.label} d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.35)" />
            {series.map((s) => (
              <circle key={s.label} cx={x(hover)} cy={y(s.values[hover])} r={4} fill={s.color} stroke="#07141b" strokeWidth={2} />
            ))}
          </>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-6 rounded-md border border-white/12 bg-[#050d13]/95 px-2 py-1.5 text-[11px] leading-tight text-white/85 shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: x(hover) > W * 0.6 ? "translateX(calc(-100% - 8px))" : "translateX(8px)" }}
        >
          <div className="mb-0.5 text-white/50">{hover + 1}</div>
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 tabular-nums">
              <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
              <span className="font-semibold">{n0(s.values[hover])}</span>
              <span className="text-white/50">{unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 패널 ─────────────────────────────────────────────────────────── */

export default function TwinPanel({
  mode,
  labels,
  build,
  remodel,
  floor,
  onFloor,
  rooms,
  roomNames,
  selected,
  onSelect,
  before,
  onBefore,
  thermal,
  onThermal,
  onReplay,
  v1Href,
  LinkComponent,
  className,
}: {
  mode: TwinMode;
  labels: TwinLabels;
  build: number;
  remodel: number;
  floor: TwinFloor;
  onFloor: (f: TwinFloor) => void;
  rooms: PanelRoom[];
  roomNames: Record<string, string>;
  selected: string | null;
  onSelect: (key: string | null) => void;
  before: boolean;
  onBefore: (v: boolean) => void;
  thermal: boolean;
  onThermal: (v: boolean) => void;
  onReplay: (() => void) | null;
  v1Href: string;
  LinkComponent: React.ComponentType<{ href: string; className?: string; children: React.ReactNode }>;
  className?: string;
}) {
  const L = labels;
  const A = energy.assumptions;
  const env = energy.envelope;
  const pv = energy.pv;

  return (
    <div data-twin-ui className={`${card} ${className ?? ""}`} aria-live="polite">
      {mode === "build" && (
        <>
          <p className={kickerCls}>{L.build.kicker}</p>
          <h3 className="mt-1 text-lg font-bold">{L.build.title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-white/65">{L.build.desc}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label={L.build.stats.lines} value="14,682" />
            <Stat label={L.build.stats.layers} value="38" />
            <Stat label={L.build.stats.walls} value={env.wallArea.toFixed(1)} unit="㎡" />
            <Stat label={L.build.stats.windows} value={String(env.windows)} unit={`· ${env.windowArea.toFixed(1)} ㎡`} />
          </div>
          <ol className="mt-5 space-y-3">
            <Step n={1} title={L.build.steps.plan} amount={span(build, [BUILD.plan1[0], BUILD.plan2[1]])} waiting={L.remodel.waiting} done={L.remodel.done} />
            <Step n={2} title={L.build.steps.rise} amount={span(build, BUILD.rise)} waiting={L.remodel.waiting} done={L.remodel.done} />
          </ol>
          <p className="mt-4 text-[11px] leading-relaxed text-white/45">{L.build.roofNote}</p>
          {onReplay && build >= 1 && (
            <button type="button" onClick={onReplay} className={`${button} mt-4`}>
              <ReplayIcon />
              {L.build.replay}
            </button>
          )}
        </>
      )}

      {mode === "rooms" && <RoomsSection labels={L} floor={floor} onFloor={onFloor} rooms={rooms} roomNames={roomNames} selected={selected} onSelect={onSelect} />}

      {mode === "remodel" && (
        <>
          <p className={kickerCls}>{L.remodel.kicker}</p>
          <h3 className="mt-1 text-lg font-bold">{L.remodel.title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-white/65">{L.remodel.desc}</p>
          <ol className="mt-4 space-y-3">
            {REMODEL_STEP_KEYS.map((step, i) => {
              const s = L.remodel.steps[step];
              const desc =
                step === "insulation"
                  ? fill(s.desc, { area: env.wallArea.toFixed(1), before: A.before.wallU, after: A.after.wallU })
                  : step === "windows"
                    ? fill(s.desc, { count: env.windows, area: env.windowArea.toFixed(1), before: A.before.windowU, after: A.after.windowU })
                    : step === "pv"
                      ? fill(s.desc, { w: pv.moduleW, count: pv.modules, kw: pv.kw })
                      : s.desc;
              return (
                <Step key={step} n={i + 1} title={s.title} desc={desc} amount={span(remodel, REMODEL[step])} waiting={L.remodel.waiting} done={L.remodel.done}>
                  {step === "scan" && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-white/45">
                      <span>{L.remodel.legendLow}</span>
                      <span className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${THERMAL_STOPS.join(", ")})` }} aria-hidden="true" />
                      <span>{L.remodel.legendHigh}</span>
                    </div>
                  )}
                </Step>
              );
            })}
          </ol>

          {remodel >= 1 && (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-white/50">{L.remodel.view}</span>
                <div role="group" aria-label={L.remodel.view} className="inline-flex rounded-full border border-white/15 p-0.5">
                  {[true, false].map((b) => (
                    <button
                      key={String(b)}
                      type="button"
                      aria-pressed={before === b}
                      onClick={() => onBefore(b)}
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${before === b ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
                    >
                      {b ? L.remodel.before : L.remodel.after}
                    </button>
                  ))}
                </div>
                <button type="button" aria-pressed={thermal} onClick={() => onThermal(!thermal)} className={`${button} ${thermal ? "border-primary-light/60 text-white" : ""}`}>
                  <span className="h-2 w-2 rounded-full" style={{ background: thermal ? THERMAL_STOPS[3] : "rgba(255,255,255,0.3)" }} aria-hidden="true" />
                  {L.remodel.thermal}
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[11px] text-white/50">{L.remodel.result}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">−{SAVING}%</span>
                  <span className="text-[12px] tabular-nums text-white/60">
                    {n0(TOTAL_BEFORE)} → {n0(TOTAL_AFTER)} {L.remodel.unit}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Stat label={`${L.remodel.heating} · ${L.remodel.unit}`} value={`${n0(E.before.heat)} → ${n0(E.after.heat)}`} />
                  <Stat label={`${L.remodel.cooling} · ${L.remodel.unit}`} value={`${n0(E.before.cool)} → ${n0(E.after.cool)}`} />
                </div>
              </div>

              <h4 className="mt-5 text-[12px] font-semibold text-white/80">{L.remodel.chart}</h4>
              <div className="mt-2">
                <MonthChart before={MONTHLY_BEFORE} after={MONTHLY_AFTER} labels={{ before: L.remodel.before, after: L.remodel.after }} unit="kWh" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Stat label={L.remodel.pvAnnual} value={n0(pv.annualKWh)} unit="kWh" />
                <Stat label={L.remodel.steps.pv.title} value={String(pv.kw)} unit="kW" />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/45">{L.remodel.pvNote}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-white/45">{L.remodel.note}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {onReplay && (
                  <button type="button" onClick={onReplay} className={button}>
                    <ReplayIcon />
                    {L.remodel.replay}
                  </button>
                )}
                <LinkComponent href={v1Href} className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-light hover:text-white">
                  {L.remodel.more}
                  <span aria-hidden="true">→</span>
                </LinkComponent>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ReplayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 1.8v1.9h1.9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RoomsSection({
  labels: L,
  floor,
  onFloor,
  rooms,
  roomNames,
  selected,
  onSelect,
}: {
  labels: TwinLabels;
  floor: TwinFloor;
  onFloor: (f: TwinFloor) => void;
  rooms: PanelRoom[];
  roomNames: Record<string, string>;
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  const list = rooms.filter((r) => r.floor === floor);
  const room = list.find((r) => r.key === selected) ?? null;
  const total = list.reduce((a, r) => a + r.area, 0);
  return (
    <>
      <p className={kickerCls}>{L.rooms.kicker}</p>
      <h3 className="mt-1 text-lg font-bold">{L.rooms.title}</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-white/65">{L.rooms.desc}</p>
      <div role="group" aria-label={L.rooms.floorLabel} className="mt-4 inline-flex rounded-full border border-white/15 p-0.5">
        {(["1f", "2f"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={floor === f}
            onClick={() => onFloor(f)}
            className={`rounded-full px-4 py-1 text-[12px] font-semibold transition-colors ${floor === f ? "bg-white/15 text-white" : "text-white/55 hover:text-white"}`}
          >
            {L.rooms.floors[f]}
          </button>
        ))}
      </div>

      {room ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[14px] font-semibold">{roomNames[room.key] ?? room.key}</div>
            <span className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] ${room.review ? "border-amber-400/60 text-amber-300" : "border-primary-light/50 text-primary-light"}`}>
              {room.review ? L.rooms.review : L.rooms.auto}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Stat label={L.rooms.area} value={room.area.toFixed(2)} unit="㎡" />
            {room.L != null && <Stat label={L.rooms.perimeter} value={room.L.toFixed(1)} unit="m" />}
            {room.WA != null ? <Stat label={L.rooms.wallArea} value={room.WA.toFixed(1)} unit="㎡" /> : room.railing != null && <Stat label={L.rooms.railing} value={room.railing.toFixed(1)} unit="m" />}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[12px] text-white/50">{L.rooms.pick}</p>
      )}

      <ul className="mt-4 divide-y divide-white/8 border-y border-white/8">
        {list.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onSelect(r.key === selected ? null : r.key)}
              aria-pressed={r.key === selected}
              className={`flex w-full items-center justify-between gap-3 py-2 text-left text-[12px] transition-colors ${r.key === selected ? "text-white" : "text-white/70 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-sm ${r.review ? "bg-amber-400" : "bg-primary-light"}`} aria-hidden="true" />
                {roomNames[r.key] ?? r.key}
              </span>
              <span className="tabular-nums text-white/55">{r.area.toFixed(2)} ㎡</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between text-[12px] font-semibold">
        <span className="text-white/60">{L.rooms.total}</span>
        <span className="tabular-nums">{total.toFixed(2)} ㎡</span>
      </div>
    </>
  );
}
