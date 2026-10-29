"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import HeroEnergyCanvas from "./HeroEnergyCanvas";
import {
  AI_SAVING,
  BEMS_FLOOR,
  DAY_SECONDS,
  ESS_KW,
  ESS_KWH,
  ESS_RTE,
  EUI_KWH_M2,
  FLOORS,
  GFA_M2,
  HP_COP,
  HVAC_SHARE,
  NIGHT_EXTRA,
  PEAK_CUT,
  PEAK_KW,
  PV_HOURS,
  PV_KWP,
} from "./heroSim";

// three.js 는 크기가 커서 첫 화면(텍스트)을 그린 뒤에 불러온다
const HeroBuildingScene = dynamic(() => import("./HeroBuildingScene"), { ssr: false });

const pct = (v: number) => Math.round(v * 100);
// 근거 문장의 숫자는 시뮬레이션 상수에서 그대로 가져온다
const SIM_VALUES = {
  floors: FLOORS,
  gfa: (Math.round(GFA_M2 / 100) * 100).toLocaleString("en-US"),
  eui: EUI_KWH_M2,
  peak: Math.round(PEAK_KW / 5) * 5,
  kwp: PV_KWP,
  hours: PV_HOURS,
  daily: Math.round(PV_KWP * PV_HOURS),
  essKw: ESS_KW,
  essKwh: ESS_KWH,
  rte: pct(ESS_RTE),
  cut: pct(PEAK_CUT),
  cop: HP_COP.toFixed(1),
  hvac: pct(HVAC_SHARE),
  ai: pct(AI_SAVING),
  sec: DAY_SECONDS,
  floor: BEMS_FLOOR + 1,
  pct: pct(NIGHT_EXTRA),
};
const SIM_ITEMS = ["building", "load", "solar", "ess", "heatPump", "ai", "bems"] as const;

/** WebGL 을 만들 수 없는 브라우저에서는 2D 배경으로 대신한다 */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function HeroSection() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  // 근거 패널: 바깥을 누르거나 Esc 로 닫는다
  useEffect(() => {
    if (!infoOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!infoRef.current?.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInfoOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [infoOpen]);

  // 화면 밖에서는 그리지 않는다
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative -mt-16 h-dvh w-full overflow-hidden bg-[#050d13]">
      {/* 에너지를 보여주는 건물 3D — 층별 사용량 · 태양광 · ESS · 히트펌프 · AI 스캔 */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
        <SceneBoundary fallback={<HeroEnergyCanvas paused={paused} />}>
          <HeroBuildingScene active={visible && !paused} eventSource={sectionRef} onReady={() => setReady(true)} />
        </SceneBoundary>
      </div>

      {/* 텍스트 쪽을 차분하게: 넓은 화면은 왼쪽, 세로 화면은 아래쪽 */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#050d13] via-[#050d13]/80 via-35% to-transparent to-55% wide:hidden" />
      <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#050d13]/95 via-[#050d13]/55 via-35% to-transparent to-60% wide:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-[#050d13]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-[#050d13]/90 to-transparent" />

      {/* Content overlay — 3D 이벤트가 건물까지 닿도록 빈 영역은 통과시킨다 */}
      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-end px-6 pb-36 text-center sm:pb-40 wide:items-start wide:justify-center wide:pb-0 wide:text-left lg:px-10">
        {/* CES Badge */}
        <div className="hero-fade-in pointer-events-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm wide:mb-8" style={{ animationDelay: "0.2s" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-amber-400"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-semibold text-white">
            {t("hero.badge")}
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-fade-in pointer-events-auto text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl" style={{ animationDelay: "0.5s" }}>
          {t.rich("hero.headline", {
            accent: (chunks) => (
              <span className="hero-accent">{chunks}</span>
            ),
          })}
          <br />
          <span className="hero-shine">
            {t.rich("hero.headlineHighlight", {
              accent: (chunks) => (
                <span className="hero-accent-on-shine">{chunks}</span>
              ),
            })}
          </span>
        </h1>

        {/* Accent line */}
        <div className="hero-fade-in mx-auto mt-6 h-px w-16 bg-linear-to-r from-transparent via-primary to-transparent wide:mx-0 wide:mt-8 wide:from-primary" style={{ animationDelay: "0.8s" }} />

        {/* Subtitle */}
        <p className="hero-fade-in pointer-events-auto mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg wide:mt-6" style={{ animationDelay: "1s" }}>
          {t("hero.subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="hero-fade-in pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-4 wide:mt-10 wide:justify-start" style={{ animationDelay: "1.2s" }}>
          <Link
            href="/contact"
            className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:-translate-y-0.5"
          >
            {t("hero.ctaContact")}
          </Link>
          <Link
            href="/product"
            className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            {t("hero.ctaProducts")}
          </Link>
        </div>

        {/* Trust bar */}
        <div className="hero-fade-in pointer-events-auto absolute bottom-6 left-0 flex w-full flex-col items-center justify-center gap-3 px-6 sm:bottom-12 sm:flex-row sm:gap-x-8 wide:justify-start lg:px-10" style={{ animationDelay: "1.5s" }}>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              {t("hero.familyLabel")}
            </span>
            <span className="text-center text-[12px] leading-relaxed text-white/60 sm:text-[13px]">
              {t("hero.familyNames")}
            </span>
          </div>
          <div className="hidden h-3 w-px bg-white/20 sm:block" />
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              {t("hero.partnerLabel")}
            </span>
            <span className="text-[12px] text-white/60 sm:text-[13px]">
              {t("hero.partnerName")}
            </span>
          </div>
        </div>
      </div>

      {/* 화면 수치의 근거 — 실측이 아닌 시뮬레이션임을 밝힌다 */}
      <div ref={infoRef} className="absolute right-16 top-20 z-20 sm:right-20 sm:top-24">
        <button
          type="button"
          onClick={() => setInfoOpen((o) => !o)}
          aria-expanded={infoOpen}
          aria-controls="hero-sim-info"
          className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 text-[11px] font-medium text-white/70 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
            <path d="M8 7v4.2M8 4.8v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {t("hero.sim.caption")}
        </button>
        {infoOpen && (
          <div
            id="hero-sim-info"
            role="region"
            aria-label={t("hero.sim.title")}
            className="absolute -right-12 top-full mt-2 w-[calc(100vw-2rem)] rounded-xl sm:right-0 sm:w-[26rem] border border-white/15 bg-[#07141b]/95 p-4 text-left shadow-2xl backdrop-blur-md"
          >
            <p className="text-xs font-semibold tracking-wide text-primary-light">{t("hero.sim.title")}</p>
            <ul className="mt-3 space-y-2.5">
              {SIM_ITEMS.map((key) => (
                <li key={key} className="text-[12px] leading-relaxed text-white/70">
                  {t(`hero.sim.items.${key}`, SIM_VALUES)}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/45">{t("hero.sim.note", SIM_VALUES)}</p>
          </div>
        )}
      </div>

      {/* 5초 넘게 움직이는 배경의 정지 수단 (WCAG 2.2.2) */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? t("hero.playAnimation") : t("hero.pauseAnimation")}
        className="absolute right-4 top-20 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white motion-reduce:hidden sm:top-24 sm:right-8"
      >
        {!paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1.5" width="2.5" height="9" rx="0.5" />
            <rect x="7.5" y="1.5" width="2.5" height="9" rx="0.5" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.8v8.4a.5.5 0 0 0 .76.43l6.9-4.2a.5.5 0 0 0 0-.86l-6.9-4.2A.5.5 0 0 0 3 1.8z" />
          </svg>
        )}
      </button>
    </section>
  );
}
