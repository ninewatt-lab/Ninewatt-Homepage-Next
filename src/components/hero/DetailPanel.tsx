"use client";

/**
 * 설비 상세 패널 — 칩이나 3D 설비를 누르면 열린다.
 * 값은 시뮬레이션(heroSim)에서 0.5초마다 읽고, 그래프는 같은 계산으로 만든 평일 하루 곡선(simulateDay)이다.
 *
 * 그래프 규칙: 차트 하나에 축 하나(단위가 다르면 차트를 나눈다), 계열 2개 이상이면 범례,
 * 마우스를 올리면 세로선 + 툴팁, 글자는 계열 색이 아닌 글자 색.
 */

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AI_SAVING, ESS_KWH, HP_COP, PV_KWP, simulateDay, type Sim } from "./heroSim";

export type Focus = "ess" | "hp" | "solar" | "load";

// 어두운 표면(#0a1820)에서 밝기 · 채도 · 색각 이상 구분 검사를 통과한 계열 색
const SERIES_A = "#2C9DB3";
const SERIES_B = "#CC7E33";
const GRID = "rgba(255,255,255,0.08)";

const DAY = simulateDay();
const STEP = DAY[1].hour - DAY[0].hour;

/* ── 실시간 값 ────────────────────────────────────────────────────── */

type Snapshot = Pick<Sim, "hour" | "loadKw" | "solarKw" | "gridKw" | "essKw" | "essSoc" | "hpKw" | "aiKw">;

const EMPTY: Snapshot = { hour: 0, loadKw: 0, solarKw: 0, gridKw: 0, essKw: 0, essSoc: 0, hpKw: 0, aiKw: 0 };

function readSim(s: Sim): Snapshot {
  return { hour: s.hour, loadKw: s.loadKw, solarKw: s.solarKw, gridKw: s.gridKw, essKw: s.essKw, essSoc: s.essSoc, hpKw: s.hpKw, aiKw: s.aiKw };
}

// 계측기처럼 0.5초마다 갱신 (첫 값은 다음 프레임에 바로)
function useSnapshot(sim: RefObject<Sim>) {
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  useEffect(() => {
    let raf = 0;
    let last = -Infinity;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 500) return;
      last = now;
      setSnap(readSim(sim.current));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sim]);
  return snap;
}

const f1 = (v: number) => Math.abs(v).toFixed(1);
const hhmm = (h: number) => `${String(Math.floor(h) % 24).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;

/* ── 그래프 ───────────────────────────────────────────────────────── */

type Series = { label: string; color: string; values: number[]; kind: "line" | "area" | "bars" };

const W = 320;
const H = 120;
const PAD = { l: 34, r: 8, t: 8, b: 20 };

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-6))));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

function DayChart({ series, unit, now, min = 0, max }: { series: Series[]; unit: string; now: number; min?: number; max?: number }) {
  const t = useTranslations("home.hero.detail");
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const top = max ?? niceMax(Math.max(...series.flatMap((s) => s.values)) * 1.05);
  const bottom = min < 0 ? -niceMax(-Math.min(...series.flatMap((s) => s.values)) * 1.05) : min;
  const x = (h: number) => PAD.l + (h / 24) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + ((top - v) / (top - bottom)) * (H - PAD.t - PAD.b);
  const ticks = bottom < 0 ? [bottom, 0, top] : [bottom, top / 2, top];
  const nowIndex = Math.min(DAY.length - 1, Math.round(now / STEP));
  const active = hover ?? nowIndex;

  const path = (values: number[]) => values.map((v, i) => `${i ? "L" : "M"}${x(DAY[i].hour).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const h = (((e.clientX - r.left) / r.width) * W - PAD.l) / (W - PAD.l - PAD.r) * 24;
    setHover(Math.min(DAY.length - 1, Math.max(0, Math.round(h / STEP))));
  };

  const barW = Math.max(1, (W - PAD.l - PAD.r) / DAY.length - 1); // 막대 사이 1px 틈

  return (
    <div className="relative">
      {series.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/60">
          {series.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={series.map((s) => s.label).join(", ")}
      >
        {/* 가로 눈금선 · y 눈금 */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke={v === 0 && bottom < 0 ? "rgba(255,255,255,0.22)" : GRID} strokeWidth={1} />
            <text x={PAD.l - 6} y={y(v) + 3.5} textAnchor="end" className="fill-white/45" fontSize={9}>
              {Math.round(v)}
            </text>
          </g>
        ))}
        {/* x 눈금 (시) */}
        {[0, 6, 12, 18, 24].map((h) => (
          <text key={h} x={x(h)} y={H - 5} textAnchor="middle" className="fill-white/45" fontSize={9}>
            {h}
            {h === 24 ? t("hourUnit") : ""}
          </text>
        ))}

        {series.map((s) =>
          s.kind === "bars" ? (
            <g key={s.label}>
              {s.values.map((v, i) =>
                Math.abs(v) < 0.5 ? null : (
                  <rect
                    key={i}
                    x={x(DAY[i].hour)}
                    y={v > 0 ? y(v) : y(0)}
                    width={barW}
                    height={Math.abs(y(v) - y(0))}
                    rx={Math.min(1, barW / 2)}
                    fill={s.color}
                  />
                ),
              )}
            </g>
          ) : (
            <g key={s.label}>
              {s.kind === "area" && <path d={`${path(s.values)}L${x(24 - STEP)},${y(0)}L${x(0)},${y(0)}Z`} fill={s.color} opacity={0.18} />}
              <path d={path(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          ),
        )}

        {/* 지금 · 마우스 위치 */}
        <line x1={x(DAY[active].hour)} x2={x(DAY[active].hour)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        {series
          .filter((s) => s.kind !== "bars")
          .map((s) => (
            <circle key={s.label} cx={x(DAY[active].hour)} cy={y(s.values[active])} r={4} fill={s.color} stroke="#0a1820" strokeWidth={2} />
          ))}
      </svg>
      {/* 툴팁: 시각 + 계열별 값 (글자는 글자 색, 색은 옆의 표시가 맡는다) */}
      <div
        className="pointer-events-none absolute top-6 rounded-md border border-white/12 bg-[#050d13]/95 px-2 py-1.5 text-[11px] leading-tight text-white/85 shadow-lg"
        style={{
          left: `${(x(DAY[active].hour) / W) * 100}%`,
          transform: x(DAY[active].hour) > W * 0.6 ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
        }}
      >
        <div className="mb-0.5 text-white/50">{hover === null ? t("now") : hhmm(DAY[active].hour)}</div>
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 tabular-nums">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
            <span className="font-semibold">{f1(s.values[active])}</span>
            <span className="text-white/50">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 패널 ─────────────────────────────────────────────────────────── */

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="mt-1 text-lg font-semibold leading-none tabular-nums text-white">
        {value}
        {unit && <span className="ml-0.5 text-[11px] font-medium text-white/50">{unit}</span>}
      </div>
    </div>
  );
}

export default function DetailPanel({ focus, sim, onClose }: { focus: Focus; sim: RefObject<Sim>; onClose: () => void }) {
  const t = useTranslations("home.hero.detail");
  const snap = useSnapshot(sim);
  const heading = useRef<HTMLHeadingElement>(null);

  // 열리면 제목으로 초점을 옮긴다 (키보드 · 스크린리더)
  useEffect(() => {
    heading.current?.focus();
  }, [focus]);

  const day = useMemo(
    () => ({
      soc: DAY.map((p) => p.essSoc * 100),
      ess: DAY.map((p) => p.essKw),
      charge: DAY.map((p) => (p.essKw < 0 ? p.essKw : 0)),
      discharge: DAY.map((p) => (p.essKw > 0 ? p.essKw : 0)),
      hp: DAY.map((p) => p.hpKw),
      heat: DAY.map((p) => p.heatKw),
      solar: DAY.map((p) => p.solarKw),
      load: DAY.map((p) => p.loadKw),
      grid: DAY.map((p) => p.gridKw),
      peakBefore: Math.max(...DAY.map((p) => p.gridNoEssKw)),
      peakAfter: Math.max(...DAY.map((p) => p.gridKw)),
    }),
    [],
  );

  const pvToday = DAY.filter((p) => p.hour <= snap.hour).reduce((a, p) => a + p.solarKw * STEP, 0);
  const essMode = snap.essKw > 1 ? t("ess.discharge") : snap.essKw < -1 ? t("ess.charge") : t("ess.idle");

  return (
    <div
      data-hero-ui
      role="region"
      aria-labelledby="hero-detail-title"
      className="absolute inset-x-3 bottom-3 z-30 max-h-[56%] overflow-y-auto rounded-2xl border border-white/12 bg-[#07141b]/92 p-5 text-left shadow-2xl backdrop-blur-md wide:inset-x-auto wide:bottom-auto wide:right-6 wide:top-36 wide:max-h-[calc(100%-19rem)] wide:w-[22rem]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-primary-light">{t(`${focus}.kicker`)}</p>
          <h2 id="hero-detail-title" ref={heading} tabIndex={-1} className="mt-1 text-lg font-bold text-white outline-none">
            {t(`${focus}.title`)}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {focus === "ess" && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t("ess.soc")} value={f1(snap.essSoc * 100)} unit="%" />
            <Stat label={essMode} value={f1(Math.abs(snap.essKw) > 1 ? snap.essKw : 0)} unit="kW" />
            <Stat label={t("ess.capacity")} value={String(ESS_KWH)} unit="kWh" />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/65">
            {t("ess.peakNote", { before: Math.round(day.peakBefore), after: Math.round(day.peakAfter), cut: Math.round((1 - day.peakAfter / day.peakBefore) * 100) })}
          </p>
          <h3 className="mt-4 text-[12px] font-semibold text-white/80">{t("ess.socChart")}</h3>
          <div className="mt-2">
            <DayChart series={[{ label: t("ess.soc"), color: SERIES_A, values: day.soc, kind: "line" }]} unit="%" now={snap.hour} max={100} />
          </div>
          <h3 className="mt-4 text-[12px] font-semibold text-white/80">{t("ess.powerChart")}</h3>
          <div className="mt-2">
            <DayChart
              series={[
                { label: t("ess.charge"), color: SERIES_A, values: day.charge, kind: "bars" },
                { label: t("ess.discharge"), color: SERIES_B, values: day.discharge, kind: "bars" },
              ]}
              unit="kW"
              now={snap.hour}
              min={-1}
            />
          </div>
        </>
      )}

      {focus === "hp" && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t("hp.power")} value={f1(snap.hpKw)} unit="kW" />
            <Stat label={t("hp.heat")} value={f1(snap.hpKw * HP_COP)} unit="kW" />
            <Stat label="COP" value={HP_COP.toFixed(1)} />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/65">{t("hp.note", { cop: HP_COP.toFixed(1) })}</p>
          <h3 className="mt-4 text-[12px] font-semibold text-white/80">{t("hp.chart")}</h3>
          <div className="mt-2">
            <DayChart
              series={[
                { label: t("hp.power"), color: SERIES_A, values: day.hp, kind: "line" },
                { label: t("hp.heat"), color: SERIES_B, values: day.heat, kind: "line" },
              ]}
              unit="kW"
              now={snap.hour}
            />
          </div>
        </>
      )}

      {focus === "solar" && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t("solar.power")} value={f1(snap.solarKw)} unit="kW" />
            <Stat label={t("solar.today")} value={f1(pvToday)} unit="kWh" />
            <Stat label={t("solar.capacity")} value={String(PV_KWP)} unit="kWp" />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/65">{t("solar.note", { share: f1((snap.solarKw / Math.max(snap.loadKw, 1)) * 100) })}</p>
          <h3 className="mt-4 text-[12px] font-semibold text-white/80">{t("solar.chart")}</h3>
          <div className="mt-2">
            <DayChart series={[{ label: t("solar.power"), color: SERIES_A, values: day.solar, kind: "area" }]} unit="kW" now={snap.hour} />
          </div>
        </>
      )}

      {focus === "load" && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t("load.load")} value={f1(snap.loadKw)} unit="kW" />
            <Stat label={t("load.grid")} value={f1(snap.gridKw)} unit="kW" />
            <Stat label={t("load.ai")} value={`−${f1(snap.aiKw)}`} unit="kW" />
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-white/65">{t("load.note", { ai: Math.round(AI_SAVING * 100) })}</p>
          <h3 className="mt-4 text-[12px] font-semibold text-white/80">{t("load.chart")}</h3>
          <div className="mt-2">
            <DayChart
              series={[
                { label: t("load.load"), color: SERIES_A, values: day.load, kind: "line" },
                { label: t("load.grid"), color: SERIES_B, values: day.grid, kind: "line" },
              ]}
              unit="kW"
              now={snap.hour}
            />
          </div>
        </>
      )}

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/40">{t("footnote")}</p>
    </div>
  );
}
