"use client";

/**
 * 그린리모델링 솔루션 페이지 첫 화면 — 3D 지역 위에 제목 · 건물 이름표 · 시공 패널을 겹친다.
 * 건물을 고르면 카메라가 다가간 뒤 시공을 시작하고, 패널의 절감률이 단계마다 EnergyPlus 결과만큼 올라간다.
 * 고친 건물은 그대로 남아, 네 채를 다 보면 지역 전체가 리모델링된다.
 */

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { ChipNodes } from "./GRScene";
import { FOCUS_EVENT } from "./ViewIn3D";
import { GR_ENERGY, GR_ORDER, createGrSim, phaseAt, savingAt, type GrKey, type GrSim } from "./grModel";

const GRScene = dynamic(() => import("./GRScene"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// 움직임 줄이기
const reduceQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const m = window.matchMedia(reduceQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const getReduce = () => window.matchMedia(reduceQuery).matches;
const getReduceServer = () => false;

/** 카메라가 다가간 뒤 시공을 시작한다 */
const START_DELAY_MS = 1100;

type Snap = Record<GrKey, number>;

// 서버 · 브라우저가 같은 글자를 내도록 페이지 언어로 (브라우저 언어를 쓰면 하이드레이션이 어긋난다)
const format = (locale: string) => (n: number, d = 0) => n.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });

export default function GRSection() {
  const t = useTranslations("greenRemodeling");
  const fmt = format(useLocale());
  const sectionRef = useRef<HTMLElement>(null);
  const frozen = useSyncExternalStore(subscribeReduce, getReduce, getReduceServer);
  const [initial] = useState(() => createGrSim(false));
  const sim = useRef<GrSim>(initial);
  const chips = useRef<ChipNodes>({});
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [focus, setFocus] = useState<GrKey | null>(null);
  const [snap, setSnap] = useState<Snap>({ envelope: 0, systems: 0, roof: 0, operations: 0 });

  // 화면 밖에서는 그리지 않는다
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 진행 값을 화면 글자로 (초당 10번이면 충분)
  useEffect(() => {
    const id = window.setInterval(() => {
      const p = sim.current.progress;
      setSnap((s) => (GR_ORDER.every((k) => s[k] === p[k]) ? s : { ...p }));
    }, 100);
    return () => window.clearInterval(id);
  }, [sim]);

  const start = useCallback(
    (k: GrKey, again = false) => {
      const s = sim.current;
      if (again) s.progress[k] = 0;
      if (s.progress[k] >= 1) return;
      s.running = k;
      if (frozen) s.progress[k] = 1;
    },
    [sim, frozen],
  );

  const select = useCallback(
    (k: GrKey | null) => {
      setFocus(k);
      // 다른 건물로 가면 하던 시공은 그 자리에서 멈춘다 (다시 오면 이어서)
      if (sim.current.running && sim.current.running !== k) sim.current.running = null;
    },
    [sim],
  );

  // 다가간 뒤 시작 (이미 다 지은 건물은 그대로 보여 준다)
  useEffect(() => {
    if (!focus) return;
    const id = window.setTimeout(() => start(focus), frozen ? 0 : START_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [focus, start, frozen]);

  // 아래 카드의 "3D로 보기"
  useEffect(() => {
    const onFocus = (e: Event) => {
      const k = (e as CustomEvent<GrKey>).detail;
      if (GR_ORDER.includes(k)) select(k);
    };
    window.addEventListener(FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_EVENT, onFocus);
  }, [select]);

  // Esc 로 닫기
  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, select]);

  return (
    <section ref={sectionRef} className="relative -mt-16 h-dvh min-h-[640px] w-full overflow-hidden bg-[#050d13] text-white">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
        <SceneBoundary>
          <GRScene
            simRef={sim}
            focus={focus}
            onSelect={select}
            chips={chips}
            active={visible}
            frozen={frozen}
            onReady={() => setReady(true)}
            overlay={
              <>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#050d13]/85 via-transparent via-30% to-transparent" />
                <div className={`pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#050d13]/85 via-[#050d13]/30 via-35% to-transparent transition-opacity duration-700 wide:block ${focus ? "opacity-0" : "opacity-100"}`} />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#050d13] via-[#050d13]/75 via-35% to-transparent to-60% wide:hidden" />
                {/* 건물 이름표 */}
                <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${ready && !focus ? "opacity-100" : "invisible opacity-0"}`}>
                  {GR_ORDER.map((k) => {
                    const done = snap[k] >= 1;
                    const pct = savingAt(k, snap[k]).pct;
                    return (
                      <button
                        key={k}
                        ref={(el) => {
                          chips.current[k] = el;
                        }}
                        type="button"
                        data-gr-ui
                        onClick={() => select(focus === k ? null : k)}
                        aria-pressed={focus === k}
                        className={`group pointer-events-auto absolute left-0 top-0 flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold shadow-lg shadow-black/30 backdrop-blur-sm transition-colors ${
                          focus === k ? "border-primary-light/70 bg-primary/90 text-white" : "border-white/15 bg-[#07141b]/85 text-white hover:border-primary-light/60"
                        } ${focus && focus !== k ? "opacity-60" : ""}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-300" : "bg-primary-light"}`} aria-hidden="true" />
                        <span>{t(`buildings.${k}.name`)}</span>
                        <span className={`hidden sm:inline ${focus === k ? "text-white/75" : "text-white/45"}`}>{t(`buildings.${k}.place`)}</span>
                        {snap[k] > 0 && <span className="tabular-nums text-emerald-200">−{fmt(pct, 1)}%</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            }
          />
        </SceneBoundary>
      </div>

      {/* 제목 (확대 중에는 넓은 화면에서 비켜 준다) */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-6 pt-[7.5rem] sm:pb-10 sm:pt-[8.5rem] wide:justify-center wide:pb-0 lg:px-10">
        <div className={`max-w-md lg:max-w-xl transition-opacity duration-500 ${focus ? "invisible opacity-0" : "opacity-100"}`}>
          <p className="text-sm font-semibold text-primary-light">{t("hero.kicker")}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">{t.rich("hero.title", { br: () => <br /> })}</h1>
          <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-white/65 sm:block sm:text-base md:text-lg">{t("hero.subtitle")}</p>
          <div data-gr-ui className="pointer-events-auto mt-5 grid max-w-sm grid-cols-2 gap-2">
            {GR_ORDER.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => select(k)}
                className="rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-left backdrop-blur-sm transition-colors hover:border-primary-light/60 hover:bg-white/10"
              >
                <span className="block text-[13px] font-semibold">{t(`buildings.${k}.name`)}</span>
                <span className="mt-0.5 block text-[11px] text-white/50">{t(`buildings.${k}.short`)}</span>
                <span className="mt-1.5 block text-[12px] font-semibold tabular-nums text-emerald-200">
                  {t("hero.upTo", { pct: fmt(GR_ENERGY[k].saving[GR_ENERGY[k].saving.length - 1], 1) })}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/40">{t("hero.hint")}</p>
        </div>

        {focus && <Panel k={focus} progress={snap[focus]} onClose={() => select(null)} onReplay={() => start(focus, true)} />}
      </div>
    </section>
  );
}

/* ── 시공 패널 ────────────────────────────────────────────────────── */

const USES = ["heating", "cooling", "lighting", "equipment"] as const;

function Panel({ k, progress, onClose, onReplay }: { k: GrKey; progress: number; onClose: () => void; onReplay: () => void }) {
  const t = useTranslations("greenRemodeling");
  const fmt = format(useLocale());
  const e = GR_ENERGY[k];
  const ph = phaseAt(k, progress);
  const now = savingAt(k, progress);
  const base = e.runs[0];
  const done = progress >= 1;
  const status = progress <= 0 ? t("panel.waiting") : done ? t("panel.done") : t("panel.running", { pct: Math.round(progress * 100) });
  // 지금 단계까지 끝난 계산 결과 (용도별 막대)
  const stepIdx = ph.steps.filter((v) => v >= 1).length;
  const cur = e.runs[stepIdx];
  const useMax = Math.max(...USES.map((u) => base.use[u]));
  const co2Saved = base.co2 - now.co2;

  return (
    <aside
      data-gr-ui
      aria-live="polite"
      className="pointer-events-auto absolute inset-x-3 bottom-3 max-h-[52dvh] overflow-y-auto rounded-2xl border border-white/12 bg-[#07141b]/92 p-4 shadow-2xl backdrop-blur-md sm:inset-x-6 sm:p-5 wide:inset-x-auto wide:bottom-auto wide:right-6 wide:top-[8.5rem] wide:max-h-[calc(100dvh-10rem)] wide:w-[22rem] lg:right-10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-primary-light">
            {t(`buildings.${k}.name`)} · {t(`buildings.${k}.place`)}
          </p>
          <p className="mt-1 text-lg font-bold">{t(`buildings.${k}.title`)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={t("panel.close")} className="-mr-1 -mt-1 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 절감 */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3">
        <div>
          <p className="text-[11px] text-white/50">{t("panel.primary")}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-200">−{fmt(now.pct, 1)}%</p>
        </div>
        <div>
          <p className="text-[11px] text-white/50">{t("panel.co2")}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums">
            −{fmt(co2Saved, 1)}
            <span className="ml-1 text-[11px] font-medium text-white/50">{t("panel.co2Unit")}</span>
          </p>
        </div>
        <p className="col-span-2 text-[11px] tabular-nums text-white/45">
          {t("panel.primaryLine", { before: fmt(base.primaryPerM2), now: fmt((now.primary / e.area), 0) })}
        </p>
      </div>

      {/* 단계 */}
      <ol className="mt-3 space-y-2.5">
        {[{ key: "scan", a: ph.scan, pct: null as number | null }, ...e.steps.map((st, i) => ({ key: st, a: ph.steps[i], pct: e.saving[i + 1] }))].map((st) => {
          const state = st.a >= 1 ? t("panel.stepDone") : st.a > 0 ? `${Math.round(st.a * 100)}%` : t("panel.stepWaiting");
          return (
            <li key={st.key} className="flex gap-3">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${st.a >= 1 ? "bg-emerald-300" : st.a > 0 ? "bg-primary-light" : "bg-white/20"}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-[13px] font-semibold ${st.a > 0 ? "text-white" : "text-white/55"}`}>{t(`steps.${st.key === "scan" ? `scan.${k}` : st.key}.title`)}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-white/45">
                    {st.pct !== null && st.a >= 1 ? <span className="mr-2 text-emerald-200">−{fmt(st.pct, 1)}%</span> : null}
                    {state}
                  </span>
                </div>
                {st.a > 0 && st.a < 1 && <p className="mt-1 text-[12px] leading-relaxed text-white/60">{t(`steps.${st.key === "scan" ? `scan.${k}` : st.key}.desc`)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {/* 용도별 1차 에너지: 시공 전(옅은 막대) · 지금(채운 막대) */}
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-[11px] text-white/50">{t("panel.byUse")}</p>
        <div className="mt-2 space-y-1.5">
          {USES.map((u) => (
            <div key={u} className="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-[11px]">
              <span className="text-white/60">{t(`uses.${u}`)}</span>
              <div className="relative h-2 rounded-full bg-white/8">
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/15" style={{ width: `${(base.use[u] / useMax) * 100}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-primary-light transition-[width] duration-500" style={{ width: `${(cur.use[u] / useMax) * 100}%` }} />
              </div>
            </div>
          ))}
          {e.pvKw !== null && (
            <div className="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-[11px]">
              <span className="text-white/60">{t("uses.pv")}</span>
              <span className="tabular-nums text-emerald-200">{cur.use.pv > 0 ? t("panel.pvLine", { kw: fmt(e.pvKw, 1), mwh: fmt(cur.use.pv / 1000, 0) }) : "—"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-white/45">{status}</span>
        <div className="ml-auto flex gap-2">
          {done && (
            <button type="button" onClick={onReplay} className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white">
              {t("panel.replay")}
            </button>
          )}
          <Link href="/contact" className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark">
            {t("panel.contact")}
          </Link>
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-white/35">{t("panel.footnote")}</p>
    </aside>
  );
}
