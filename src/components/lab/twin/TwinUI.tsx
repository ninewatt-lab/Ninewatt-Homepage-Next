"use client";

/**
 * Lab v2 트윈의 화면 요소 — 장면 아래쪽의 자막 · 챕터 막대(StageBar)와, 장면 밑 본문의 수치(TwinDetails).
 *
 * 장면 위에는 지금 무엇을 하는지(자막)와 어디까지 왔는지(챕터)만 두고, 숫자 · 표는 페이지 본문 모양
 * (v1 상세의 통계 칸 · 표와 같은 모양, 라이트/다크 테마를 따른다)으로 장면 밑에 둔다.
 * 실 수치는 v1 데이터(viewer.json · ai-building-workspace-energy.json), 리모델링 수치는 조합마다 EnergyPlus 로
 * 계산한 ai-building-workspace-scenarios.json(scripts/lab/energy_scenarios.py)에서 그대로 읽는다.
 */

import { useRef, useState, useSyncExternalStore } from "react";
import type { BuildingKey, ScenarioRun, TwinBuilding } from "./buildings";
import {
  BUILD,
  PV_OPTIONS,
  REMODEL,
  REMODEL_STEP_KEYS,
  THERMAL_STOPS,
  WIN_OPTIONS,
  WIN_U,
  scenarioKey,
  span,
  wallU,
  GAIN_COLORS,
  type HourlyData,
  type ThermalBasis,
  type RemodelStep,
  type Scenario,
  type TwinFloor,
  type TwinMode,
  type WinKind,
} from "./twinModel";

export type TwinLabels = {
  buildings: { label: string } & Record<
    BuildingKey,
    {
      name: string;
      /** 좁은 화면의 카드에 쓰는 짧은 설명 */
      short: string;
      desc: string;
      roofNote: string;
      /** 도면 사양이 조합 표에 없을 때의 안내 · 자동 생성 안내 · 장면 아래 출처 (자동 생성 건물) */
      drawnNote?: string;
      autoNote?: string;
      footnote?: string;
    }
  >;
  tools: {
    label: string;
    section: string;
    measure: string;
    compare: string;
    share: string;
    copied: string;
    handle: string;
    height: string;
    sectionCaption: string;
    measureCaption: string;
    compareCaption: string;
  };
  loading: string;
  unsupported: string;
  tabsLabel: string;
  tabs: Record<TwinMode, string>;
  play: string;
  pause: string;
  replay: string;
  footnote: string;
  build: {
    steps: Record<"plan" | "rise", string>;
    captions: Record<"plan" | "rise" | "done", string>;
    stats: Record<"lines" | "layers" | "walls" | "windows", string>;
    windowsValue: string;
  };
  rooms: {
    caption: string;
    floorLabel: string;
    floors: Record<TwinFloor, string>;
    cols: Record<"room" | "area" | "perimeter" | "wallArea" | "status", string>;
    railing: string;
    auto: string;
    review: string;
    total: string;
    note: string;
    unnamed: string;
  };
  remodel: {
    steps: Record<RemodelStep, { short: string; caption: string }>;
    done: string;
    legendLow: string;
    legendHigh: string;
    view: string;
    before: string;
    after: string;
    thermal: string;
    results: string;
    total: string;
    heating: string;
    cooling: string;
    pv: string;
    unit: string;
    works: string;
    cols: Record<"work" | "spec" | "qty" | "u", string>;
    items: Record<"insulation" | "windows" | "pv", { name: string }>;
    scenario: {
      title: string;
      desc: string;
      wall: string;
      win: string;
      pv: string;
      none: string;
      drawn: string;
      wins: Record<WinKind, string>;
      count: string;
      pvHint: string;
      reset: string;
      example: string;
      resetExample: string;
      descNoPv: string;
    };
    chosen: string;
    coolingUp: string;
    doneNone: string;
    captions: Record<
      | "insulation"
      | "insulationNone"
      | "windows"
      | "windowsNone"
      | "pv"
      | "pvNone",
      string
    >;
    specs: Record<"insulation" | "insulationGeneric" | "none" | WinKind | "pv", string>;
    noteScenario: string;
    basis: {
      title: string;
      u: string;
      winter: string;
      summer: string;
      hintU: string;
      hintDay: string;
      legendLoss: string;
      legendGain: string;
      caption: string;
      heating: string;
      cooling: string;
      chart: string;
      now: string;
      note: string;
    };
    windowsQty: string;
    chart: string;
    note: string;
    pvNote: string;
    more: string;
  };
};

export type PanelRoom = {
  key: string;
  floor: TwinFloor;
  area: number;
  review: boolean;
  L?: number | null;
  WA?: number | null;
  railing?: number | null;
};

const fill = (s: string, v: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));
const n0 = (v: number) => Math.round(v).toLocaleString("ko-KR");
/** 열관류율: 1 → "1.0", 0.16 → "0.16" */
const uv = (v: number) => (Number.isInteger(v) ? v.toFixed(1) : String(v));

type Run = ScenarioRun;
/** 리모델링 전 = 외단열 없음 · 기존 창 */
const baseOf = (b: TwinBuilding) => b.runs["w0-old"];
const runOf = (b: TwinBuilding, s: Scenario) => b.runs[scenarioKey(s)];
const total = (r: Run) => r.heat + r.cool;
const monthly = (r: Run) => r.heat_m.map((h, i) => h + r.cool_m[i]);
const savingOf = (b: TwinBuilding, s: Scenario) => Math.round((1 - total(runOf(b, s)) / total(baseOf(b))) * 100);
/** 태양광을 3D 지붕에 놓은 건물만 태양광 단계 · 선택이 있다 */
const stepsOf = (b: TwinBuilding) => REMODEL_STEP_KEYS.filter((k) => k !== "pv" || b.pv);

/* ── 장면 아래쪽: 자막 · 챕터 ─────────────────────────────────────── */

const pill =
  "rounded-full px-3 py-1 text-[12px] font-semibold transition-colors";

function Chapter({
  label,
  amount,
  active,
}: {
  label: string;
  amount: number;
  active: boolean;
}) {
  return (
    <li className="min-w-0 flex-1">
      <div
        className={`mb-1.5 truncate text-[11px] font-medium transition-colors ${active ? "text-white" : amount >= 1 ? "text-white/60" : "text-white/35"}`}
      >
        {label}
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-primary-light"
          style={{ width: `${amount * 100}%` }}
        />
      </div>
    </li>
  );
}

export function StageBar({
  mode,
  labels: L,
  build,
  remodel,
  floor,
  onFloor,
  before,
  onBefore,
  thermal,
  onThermal,
  onReplay,
  scenario,
  building,
  tool,
  cut,
  onCut,
  basis,
  readout,
}: {
  mode: TwinMode;
  labels: TwinLabels;
  scenario: Scenario;
  building: TwinBuilding;
  basis: ThermalBasis;
  /** 겨울 · 여름 하루 열화상일 때 지금 시각의 값 (쉬는 동안 자막 대신) */
  readout: string | null;
  tool: "section" | "measure" | "compare" | null;
  cut: number;
  onCut: (v: number) => void;
  build: number;
  remodel: number;
  floor: TwinFloor;
  onFloor: (f: TwinFloor) => void;
  before: boolean;
  onBefore: (v: boolean) => void;
  thermal: boolean;
  onThermal: (v: boolean) => void;
  onReplay: (() => void) | null;
}) {
  let caption: string;
  let chapters: { key: string; label: string; amount: number }[] = [];
  if (mode === "build") {
    const plan = span(build, [0, BUILD.plan2[1]]);
    const rise = span(build, BUILD.rise);
    caption =
      rise >= 1
        ? L.build.captions.done
        : plan >= 1
          ? L.build.captions.rise
          : L.build.captions.plan;
    chapters = [
      { key: "plan", label: L.build.steps.plan, amount: plan },
      { key: "rise", label: L.build.steps.rise, amount: rise },
    ];
  } else if (mode === "rooms") {
    caption = L.rooms.caption;
  } else {
    chapters = stepsOf(building).map((k) => ({
      key: k,
      label: L.remodel.steps[k].short,
      amount: span(remodel, REMODEL[k]),
    }));
    const now = stepsOf(building).find((k) => span(remodel, REMODEL[k]) < 1);
    const C = L.remodel.captions;
    const pct = savingOf(building, scenario);
    // 고른 조합에 맞춘 자막 (그 공사가 없는 조합이면 없다고 알려 준다)
    const stepCaption = (k: RemodelStep) =>
      k === "scan"
        ? L.remodel.steps.scan.caption
        : k === "insulation"
          ? scenario.wall
            ? fill(C.insulation, { mm: scenario.wall })
            : C.insulationNone
          : k === "windows"
            ? scenario.win !== "old"
              ? fill(C.windows, { type: L.remodel.scenario.wins[scenario.win] })
              : C.windowsNone
            : scenario.pv
              ? fill(C.pv, { count: scenario.pv })
              : C.pvNone;
    caption =
      remodel >= 1 || !now
        ? pct > 0
          ? fill(L.remodel.done, { pct })
          : L.remodel.doneNone
        : stepCaption(now);
  }
  if (mode === "remodel" && readout && (remodel === 0 || remodel >= 1)) caption = readout;
  // 도구를 쓰는 동안은 자막이 도구 안내로 바뀐다 (단면은 챕터 자리에 높이 막대)
  if (tool === "section") caption = L.tools.sectionCaption;
  else if (tool === "measure") caption = L.tools.measureCaption;
  else if (tool === "compare" && mode === "remodel" && remodel >= 1)
    caption = L.tools.compareCaption;
  if (tool === "section") chapters = [];
  const activeKey = chapters.find((c) => c.amount < 1)?.key;
  const done =
    mode === "build" ? build >= 1 : mode === "remodel" ? remodel >= 1 : false;
  const showLegend =
    mode === "remodel" &&
    ((remodel > 0 && remodel < REMODEL.cool[1]) || thermal);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-[#050d13]/95 via-[#050d13]/60 to-transparent px-4 pb-4 pt-20 sm:px-6 sm:pb-5">
      <div className="flex items-end justify-between gap-6">
        <p
          aria-live="polite"
          className="max-w-2xl text-[13px] leading-relaxed text-white/90 sm:text-[15px]"
        >
          {caption}
        </p>
        {showLegend && (
          <div
            className="hidden shrink-0 items-center gap-2 pb-1 text-[10px] text-white/50 sm:flex"
            aria-hidden="true"
          >
            {basis === "u" ? (
              <>
                <span>{L.remodel.legendLow}</span>
                <span
                  className="h-1.5 w-24 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${THERMAL_STOPS.join(", ")})`,
                  }}
                />
                <span>{L.remodel.legendHigh}</span>
              </>
            ) : (
              // 들어오는 열(햇볕) ← 0 → 새는 열
              <>
                <span>{L.remodel.basis.legendGain}</span>
                <span
                  className="h-1.5 w-32 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${[...GAIN_COLORS].reverse().join(", ")}, ${THERMAL_STOPS.join(", ")})`,
                  }}
                />
                <span>{L.remodel.basis.legendLoss}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 좁은 화면은 챕터 아래 줄에 버튼을 둔다 (챕터 라벨이 잘리지 않게) */}
      <div className="pointer-events-auto mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex min-w-0 flex-1 items-end gap-3">
          {onReplay && done && (
            <button
              type="button"
              onClick={onReplay}
              aria-label={L.replay}
              title={L.replay}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path
                  d="M2.5 6a3.5 3.5 0 1 0 1-2.5M2.5 1.8v1.9h1.9"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}

          {tool === "section" && (
            <label className="flex min-w-0 flex-1 items-center gap-3 text-[11px] font-medium text-white/70">
              <span className="shrink-0">{L.tools.height}</span>
              <input
                type="range"
                min={0.3}
                max={+(building.frame.height - 0.1).toFixed(2)}
                step={0.05}
                value={cut}
                onChange={(e) => onCut(Number(e.target.value))}
                className="h-1 min-w-0 flex-1 cursor-pointer accent-[#7fe3f3]"
              />
              <span className="w-14 shrink-0 text-right text-[13px] font-semibold tabular-nums text-white">
                {cut.toFixed(2)} m
              </span>
            </label>
          )}

          {chapters.length > 0 && (
            <ol className="flex min-w-0 flex-1 gap-1.5 pb-[3px]">
              {chapters.map((c) => (
                <Chapter
                  key={c.key}
                  label={c.label}
                  amount={c.amount}
                  active={c.key === activeKey}
                />
              ))}
            </ol>
          )}
        </div>

        {mode === "rooms" && building.frame.floors.length > 1 && (
          <div
            role="group"
            aria-label={L.rooms.floorLabel}
            className="flex self-start rounded-full bg-white/10 p-0.5 sm:order-first"
          >
            {building.frame.floors.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={floor === f}
                onClick={() => onFloor(f)}
                className={`${pill} ${floor === f ? "bg-white text-[#07141b]" : "text-white/70 hover:text-white"}`}
              >
                {L.rooms.floors[f]}
              </button>
            ))}
          </div>
        )}

        {mode === "remodel" && done && (
          <div className="flex shrink-0 items-center gap-2">
            {tool !== "compare" && (
              <div
                role="group"
                aria-label={L.remodel.view}
                className="flex rounded-full bg-white/10 p-0.5"
              >
                {[true, false].map((b) => (
                  <button
                    key={String(b)}
                    type="button"
                    aria-pressed={before === b}
                    onClick={() => onBefore(b)}
                    className={`${pill} ${before === b ? "bg-white text-[#07141b]" : "text-white/70 hover:text-white"}`}
                  >
                    {b ? L.remodel.before : L.remodel.after}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              aria-pressed={thermal}
              onClick={() => onThermal(!thermal)}
              className={`${pill} border ${thermal ? "border-[#f78c1f]/70 bg-[#f78c1f]/15 text-white" : "border-white/20 text-white/70 hover:text-white"}`}
            >
              {L.remodel.thermal}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 장면 밑: 수치 ────────────────────────────────────────────────── */

/** 한 줄 선택 (사이트 본문 모양 · 라이트/다크) */
function Choice<T extends string | number>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold">{label}</span>
        <span className="truncate text-xs text-muted">{hint}</span>
      </div>
      <div
        role="group"
        aria-label={label}
        className="mt-2 flex rounded-lg border border-border bg-surface p-0.5"
      >
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-sm transition-colors ${value === o.value ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background px-5 py-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

const big = "whitespace-nowrap text-xl font-semibold tabular-nums sm:text-2xl";
const unit = "ml-0.5 text-sm font-normal text-muted";
const th = "px-4 py-3 font-medium";

export function TwinDetails({
  mode,
  labels: L,
  rooms,
  roomNames,
  floor,
  selected,
  onSelect,
  v1Href,
  LinkComponent,
  scenario,
  onScenario,
  building,
  planLines,
  basis,
  onBasis,
  hourly,
  hour,
  dates,
}: {
  mode: TwinMode;
  labels: TwinLabels;
  scenario: Scenario;
  onScenario: (s: Scenario) => void;
  building: TwinBuilding;
  /** 평면 도면 선 수 (twin.json 의 선분) */
  planLines: number;
  basis: ThermalBasis;
  onBasis: (b: ThermalBasis) => void;
  hourly: HourlyData | null;
  hour: number;
  /** 대표일 표기 (예: 1월 23일) */
  dates: Record<"winter" | "summer", string>;
  rooms: PanelRoom[];
  roomNames: Record<string, string>;
  floor: TwinFloor;
  selected: string | null;
  onSelect: (key: string | null) => void;
  v1Href: string;
  LinkComponent: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
}) {
  const ST = building.stats;
  const BL = L.buildings[building.key];
  if (mode === "build") {
    return (
      <div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          <Cell label={L.build.stats.lines}>
            <span className={big}>{n0(planLines)}</span>
          </Cell>
          <Cell label={L.build.stats.layers}>
            <span className={big}>{ST.layers}</span>
          </Cell>
          <Cell label={L.build.stats.walls}>
            <span className={big}>{ST.wallArea.toFixed(1)}</span>
            <span className={unit}>㎡</span>
          </Cell>
          <Cell label={L.build.stats.windows}>
            {/* "{count}개 · {area} ㎡" — 개수만 크게 */}
            <span className={big}>{ST.windows}</span>
            <span className={unit}>
              {fill(L.build.windowsValue.split("{count}")[1] ?? "", {
                area: ST.windowArea.toFixed(1),
              })}
            </span>
          </Cell>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {BL.roofNote}
          {BL.autoNote && ` ${BL.autoNote}`}
        </p>
      </div>
    );
  }

  if (mode === "rooms") {
    const list = rooms.filter((r) => r.floor === floor);
    const total = list.reduce((a, r) => a + r.area, 0);
    return (
      <div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">{L.rooms.floors[floor]}</caption>
            <thead className="bg-surface text-xs text-muted">
              <tr>
                <th scope="col" className={th}>
                  {L.rooms.cols.room}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {L.rooms.cols.area}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {L.rooms.cols.perimeter}
                </th>
                <th scope="col" className={`${th} text-right`}>
                  {L.rooms.cols.wallArea}
                </th>
                <th scope="col" className={th}>
                  {L.rooms.cols.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const on = r.key === selected;
                return (
                  <tr
                    key={r.key}
                    className={`transition-colors ${on ? "bg-primary/10" : "hover:bg-surface"}`}
                  >
                    <td className="px-4 py-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => onSelect(on ? null : r.key)}
                        className={`w-full py-3 text-left ${on ? "font-semibold text-foreground" : ""}`}
                      >
                        {roomNames[r.key] ?? r.key}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.area.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.L != null ? r.L.toFixed(1) : "–"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {r.WA != null
                        ? r.WA.toFixed(1)
                        : r.railing != null
                          ? fill(L.rooms.railing, {
                              length: r.railing.toFixed(1),
                            })
                          : "–"}
                    </td>
                    <td className="px-4 py-3">
                      {r.review ? (
                        <span className="whitespace-nowrap rounded border border-amber-500/60 px-1.5 py-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                          {L.rooms.review}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">
                          {L.rooms.auto}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-border bg-surface font-semibold">
              <tr>
                <td className="px-4 py-3">
                  {L.rooms.floors[floor]} {L.rooms.total}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {total.toFixed(2)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {L.rooms.note}
        </p>
      </div>
    );
  }

  const R = L.remodel;
  const BASE = baseOf(building);
  const run = runOf(building, scenario);
  const PV = building.pv;
  const pvRun = PV && scenario.pv ? PV.runs[String(scenario.pv)] : null;
  const pct = savingOf(building, scenario);
  const DRAWN = building.start;
  const isDrawn =
    scenario.wall === DRAWN.wall &&
    scenario.win === DRAWN.win &&
    scenario.pv === DRAWN.pv;
  const works = [
    {
      key: "insulation",
      spec: scenario.wall
        ? fill(building.drawn ? R.specs.insulation : R.specs.insulationGeneric, { mm: scenario.wall })
        : R.specs.none,
      qty: scenario.wall ? `${ST.wallArea.toFixed(1)} ㎡` : "–",
      u: scenario.wall
        ? `${uv(wallU(0))} → ${wallU(scenario.wall).toFixed(2)}`
        : uv(wallU(0)),
    },
    {
      key: "windows",
      spec: R.specs[scenario.win],
      qty:
        scenario.win !== "old"
          ? fill(R.windowsQty, {
              count: ST.windows,
              area: ST.windowArea.toFixed(1),
            })
          : "–",
      u:
        scenario.win !== "old"
          ? `${uv(WIN_U.old)} → ${uv(WIN_U[scenario.win])}`
          : uv(WIN_U.old),
    },
    {
      key: "pv",
      spec: PV && scenario.pv
        ? fill(R.specs.pv, { w: PV.moduleW, count: scenario.pv })
        : R.specs.none,
      qty: PV && scenario.pv
        ? `${((scenario.pv * PV.moduleW) / 1000).toFixed(2)} kW`
        : "–",
      u: "–",
    },
  ].filter((w) => w.key !== "pv" || PV) as { key: "insulation" | "windows" | "pv"; spec: string; qty: string; u: string }[];
  // 도면 사양과 같은 재료면 "도면", 아니면 "예시"
  const tag = building.drawn ? R.scenario.drawn : R.scenario.example;
  const set = (patch: Partial<Scenario>) =>
    onScenario({ ...scenario, ...patch });
  return (
    <div>
      {/* 조합 고르기 — 위 3D 건물도 같이 바뀐다 */}
      <div className="rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-sm font-semibold">{R.scenario.title}</h3>
          {!isDrawn && (
            <button
              type="button"
              onClick={() => onScenario(DRAWN)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {building.drawn ? R.scenario.reset : R.scenario.resetExample}
            </button>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {building.pv ? R.scenario.desc : R.scenario.descNoPv}
        </p>
        <div className={`mt-5 grid gap-5 ${PV ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <Choice
            label={R.scenario.wall}
            hint={`${tag} ${DRAWN.wall} mm`}
            options={building.walls.map((v) => ({
              value: v,
              label: v ? `${v} mm` : R.scenario.none,
            }))}
            value={scenario.wall}
            onChange={(wall) => set({ wall })}
          />
          <Choice
            label={R.scenario.win}
            hint={`${tag} ${R.scenario.wins[DRAWN.win]}`}
            options={WIN_OPTIONS.map((v) => ({
              value: v,
              label: R.scenario.wins[v],
            }))}
            value={scenario.win}
            onChange={(win) => set({ win })}
          />
          {PV && (
            <Choice
              label={R.scenario.pv}
              hint={R.scenario.pvHint}
              options={PV_OPTIONS.map((v) => ({
                value: v,
                label: v ? fill(R.scenario.count, { count: v }) : R.scenario.none,
              }))}
              value={scenario.pv}
              onChange={(pv) => set({ pv })}
            />
          )}
        </div>
        {!building.drawn && <p className="mt-4 text-xs leading-relaxed text-muted">{L.buildings[building.key].drawnNote}</p>}
      </div>

      {/* 열화상 기준 — 겨울 · 여름 하루면 시간별 EnergyPlus 값으로 칠하고, 그날의 부하를 그린다 */}
      <ThermalCard R={R} basis={basis} onBasis={onBasis} hourly={hourly} scenario={scenario} hour={hour} dates={dates} />

      <h3 className="mt-10 text-sm font-semibold">{R.results}</h3>
      <dl className={`mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border ${PV ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <Cell label={R.total}>
          <span className={`${big} ${pct > 0 ? "text-primary" : ""}`}>
            {pct > 0 ? `−${pct}%` : `${-pct}%`}
          </span>
          <span className="mt-1 block text-xs tabular-nums text-muted">
            {n0(total(BASE))} → {n0(total(run))} {R.unit}
          </span>
        </Cell>
        <Cell label={`${R.heating} · ${R.unit}`}>
          <span className={big}>
            {n0(BASE.heat)} → {n0(run.heat)}
          </span>
        </Cell>
        <Cell label={`${R.cooling} · ${R.unit}`}>
          <span
            className={`${big} ${run.cool > BASE.cool ? "text-amber-700 dark:text-amber-400" : ""}`}
          >
            {n0(BASE.cool)} → {n0(run.cool)}
          </span>
        </Cell>
{PV && (
        <Cell label={`${R.pv} · ${R.unit}`}>
          <span className={big}>{pvRun ? n0(pvRun.annual) : "–"}</span>
        </Cell>
        )}
      </dl>
      {run.cool > BASE.cool && (
        <p className="mt-3 border-l-2 border-amber-500 pl-3 text-sm leading-relaxed text-muted">
          {fill(R.coolingUp, { before: n0(BASE.cool), after: n0(run.cool) })}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-sm font-semibold">{R.works}</h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>
                  <th scope="col" className={th}>
                    {R.cols.work}
                  </th>
                  <th scope="col" className={th}>
                    {R.cols.spec}
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    {R.cols.qty}
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    {R.cols.u}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {works.map((w) => (
                  <tr key={w.key}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">
                      {R.items[w.key].name}
                    </td>
                    <td className="px-4 py-3 text-muted">{w.spec}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {w.qty}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {w.u}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold">{R.chart}</h3>
          <div className="mt-3">
            <MonthChart
              before={monthly(BASE)}
              after={monthly(run)}
              labels={{ before: R.before, after: R.chosen }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2 text-sm leading-relaxed text-muted">
        <p>{R.note}</p>
        <p>{R.noteScenario}</p>
        {PV && <p>{R.pvNote}</p>}
      </div>
      {/* 물량 · 견적은 v1(건물 A)에만 있다 */}
      {!building.auto && (
        <LinkComponent
          href={v1Href}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {R.more}
          <span aria-hidden="true">→</span>
        </LinkComponent>
      )}
    </div>
  );
}

// 넓은 칸(md 이상)인지 — 시간별 그래프의 viewBox 를 칸 폭에 맞춘다 (서버 값 false)
const MD = "(min-width: 768px)";
const subscribeMd = (cb: () => void) => {
  const mq = window.matchMedia(MD);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

function ThermalCard({
  R,
  basis,
  onBasis,
  hourly,
  scenario,
  hour,
  dates,
}: {
  R: TwinLabels["remodel"];
  basis: ThermalBasis;
  onBasis: (b: ThermalBasis) => void;
  hourly: HourlyData | null;
  scenario: Scenario;
  hour: number;
  dates: Record<"winter" | "summer", string>;
}) {
  const wide = useSyncExternalStore(subscribeMd, () => window.matchMedia(MD).matches, () => false);
  return (
    <div className="mt-4 rounded-xl border border-border p-5">
      <div className="grid gap-5 md:grid-cols-[1fr_2fr] md:items-start">
        <div>
          <Choice
            label={R.basis.title}
            hint=""
            options={(["u", "winter", "summer"] as const).map((v) => ({ value: v, label: R.basis[v] }))}
            value={basis}
            onChange={onBasis}
          />
          <p className="mt-3 text-sm leading-relaxed text-muted">{basis === "u" ? R.basis.hintU : fill(R.basis.hintDay, { date: dates[basis] })}</p>
        </div>
        {basis !== "u" && hourly && (
          <div>
            <h4 className="text-xs font-semibold">
              {fill(R.basis.chart, { date: dates[basis], kind: basis === "winter" ? R.basis.heating : R.basis.cooling })}
            </h4>
            <div className="mt-2">
              <LineChart
                before={hourly.runs["w0-old"][basis][basis === "winter" ? "heat" : "cool"]}
                after={hourly.runs[scenarioKey(scenario)][basis][basis === "winter" ? "heat" : "cool"]}
                labels={{ before: R.before, after: R.chosen }}
                unit="kW"
                digits={1}
                ticks={[0, 6, 12, 18, 23]}
                tickLabel={(i) => `${String(i).padStart(2, "0")}:00`}
                now={hour / 24}
                nowLabel={R.basis.now}
                width={wide ? 640 : W}
                height={wide ? 180 : H}
              />
            </div>
          </div>
        )}
      </div>
      {basis !== "u" && <p className="mt-4 text-xs leading-relaxed text-muted">{R.basis.note}</p>}
    </div>
  );
}

/* ── 월별 그래프 (라이트 · 다크 각각 검사를 통과한 계열 색) ───────── */

const SERIES = {
  before: {
    stroke: "stroke-[#c0661c] dark:stroke-[#CC7E33]",
    fill: "fill-[#c0661c] dark:fill-[#CC7E33]",
    bg: "bg-[#c0661c] dark:bg-[#CC7E33]",
  },
  after: {
    stroke: "stroke-[#0f8fab] dark:stroke-[#2C9DB3]",
    fill: "fill-[#0f8fab] dark:fill-[#2C9DB3]",
    bg: "bg-[#0f8fab] dark:bg-[#2C9DB3]",
  },
};
const W = 360;
const H = 170;
const PAD = { l: 40, r: 8, t: 10, b: 22 };

function MonthChart(props: { before: number[]; after: number[]; labels: { before: string; after: string } }) {
  return <LineChart {...props} unit="kWh" ticks={Array.from({ length: 12 }, (_, i) => i)} tickLabel={(i) => String(i + 1)} />;
}

/** 0 부터 올라가는 축의 깔끔한 끝값 (1 · 2 · 2.5 · 5 · 10 단위) */
function niceTop(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-6))));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

/** 두 계열 선 그래프 — 마우스를 올리면 세로선 + 툴팁. now(0~1)를 주면 그 위치에 "지금" 세로선 */
function LineChart({
  before,
  after,
  labels,
  unit,
  ticks,
  tickLabel,
  digits = 0,
  now = null,
  nowLabel,
  width = W,
  height = H,
}: {
  before: number[];
  after: number[];
  labels: { before: string; after: string };
  unit: string;
  ticks: number[];
  tickLabel: (i: number) => string;
  digits?: number;
  now?: number | null;
  nowLabel?: string;
  /** viewBox 크기 — 넓은 칸에 놓을 때는 넓게 (글자가 커지지 않게) */
  width?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const n = before.length;
  const top = niceTop(Math.max(...before, ...after, 1e-6) * 1.02);
  const fmt = (v: number) => (digits ? v.toFixed(digits) : n0(v));
  const x = (i: number) => PAD.l + ((i + 0.5) / n) * (width - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + ((top - v) / top) * (height - PAD.t - PAD.b);
  const path = (vs: number[]) =>
    vs
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join("");
  const series = [
    { key: "before" as const, label: labels.before, values: before },
    { key: "after" as const, label: labels.after, values: after },
  ];
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.round(
      ((((e.clientX - r.left) / r.width) * width - PAD.l) / (width - PAD.l - PAD.r)) *
        n -
        0.5,
    );
    setHover(Math.min(n - 1, Math.max(0, i)));
  };
  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-0.5 w-3 rounded-full ${SERIES[s.key].bg}`}
            />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${width} ${height}`}
        className="block w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={series.map((s) => s.label).join(", ")}
      >
        {[0, top / 2, top].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={width - PAD.r}
              y1={y(v)}
              y2={y(v)}
              className="stroke-black/10 dark:stroke-white/10"
            />
            <text
              x={PAD.l - 6}
              y={y(v) + 3.5}
              textAnchor="end"
              className="fill-muted"
              fontSize={10}
            >
              {fmt(v)}
            </text>
          </g>
        ))}
        {ticks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 6}
            textAnchor="middle"
            className="fill-muted"
            fontSize={10}
          >
            {tickLabel(i)}
          </text>
        ))}
        {now !== null && (
          <g>
            <line
              x1={PAD.l + now * (width - PAD.l - PAD.r)}
              x2={PAD.l + now * (width - PAD.l - PAD.r)}
              y1={PAD.t}
              y2={height - PAD.b}
              className="stroke-primary"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {nowLabel && (
              <text x={PAD.l + now * (width - PAD.l - PAD.r) + 4} y={PAD.t + 8} className="fill-primary" fontSize={9}>
                {nowLabel}
              </text>
            )}
          </g>
        )}
        {series.map((s) => (
          <path
            key={s.key}
            d={path(s.values)}
            fill="none"
            className={SERIES[s.key].stroke}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {hover !== null && (
          <>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.t}
              y2={height - PAD.b}
              className="stroke-black/25 dark:stroke-white/30"
            />
            {series.map((s) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(s.values[hover])}
                r={4}
                className={`${SERIES[s.key].fill} stroke-background`}
                strokeWidth={2}
              />
            ))}
          </>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-8 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs leading-tight shadow-lg"
          style={{
            left: `${(x(hover) / width) * 100}%`,
            transform:
              x(hover) > width * 0.6
                ? "translateX(calc(-100% - 8px))"
                : "translateX(8px)",
          }}
        >
          <div className="mb-0.5 text-muted">{tickLabel(hover)}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 tabular-nums">
              <span
                className={`inline-block h-2 w-2 rounded-sm ${SERIES[s.key].bg}`}
              />
              <span className="font-semibold">{fmt(s.values[hover])}</span>
              <span className="text-muted">{unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
