"use client";

/**
 * Lab v2 — 도면으로 지은 3D 트윈 섹션.
 * 화면에 가까워지면 데이터(twin.json · viewer.json)와 3D 장면을 불러오고, 처음 보이면 도면 → 3D 구축을 한 번 보여 준다.
 * 보기: 도면 → 3D · 실 · 면적 · 그린리모델링. 장면 아래쪽에 자막 · 챕터(StageBar), 장면 밑 본문에 수치(TwinDetails).
 * 도구: 단면 · 치수 · 전후 비교 · 링크 복사. 보기 · 층 · 조합은 주소(?view=remodel&wall=150&win=old&pv=2)에 담아 그대로 공유된다.
 * 건물: A(v1 보건시설) · B(도면에서 자동 생성한 어린이집). 고르면 장면을 새로 만든다(주소 &b=b).
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { StageBar, TwinDetails, type PanelRoom, type TwinLabels } from "./TwinUI";
import { BUILDINGS, type BuildingKey, type TwinBuilding } from "./buildings";
import {
  PV_OPTIONS,
  STATIC_HOUR,
  WIN_OPTIONS,
  atHour,
  createTwinSim,
  scenarioKey,
  type HourlyData,
  type Scenario,
  type ThermalBasis,
  type TwinFloor,
  type TwinMode,
  type TwinSim,
} from "./twinModel";
import type { MeasureState, TwinPlanData, TwinRoom, TwinTool } from "./TwinScene";

const TwinScene = dynamic(() => import("./TwinScene"), { ssr: false });

/** WebGL 을 만들 수 없으면 안내 문구로 */
class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type Data = { plan: TwinPlanData; rooms: (TwinRoom & PanelRoom)[]; model: string };

const MODES: TwinMode[] = ["build", "rooms", "remodel"];
// 움직임 줄이기 설정 — 서버는 모르므로 하이드레이션 뒤에 읽는다 (서버 값 false)
const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReduce = () => window.matchMedia(REDUCE).matches;
const getReduceServer = () => false;

/** 주소의 보기 · 층 · 조합 (틀린 값은 기본값으로) */
function readView(q: URLSearchParams | null, b: TwinBuilding) {
  const DRAWN = b.start;
  const pick = <T,>(list: readonly T[], v: T | undefined, fallback: T) => (v !== undefined && list.includes(v) ? v : fallback);
  const num = (k: string) => (q?.get(k) == null ? undefined : Number(q.get(k)));
  return {
    mode: pick(MODES, (q?.get("view") ?? undefined) as TwinMode | undefined, "build"),
    floor: pick(b.frame.floors, (q?.get("floor") ?? undefined) as TwinFloor | undefined, "1f"),
    basis: pick(["u", "winter", "summer"] as ThermalBasis[], (q?.get("heat") ?? undefined) as ThermalBasis | undefined, "u"),
    scenario: {
      wall: pick(b.walls, num("wall") as Scenario["wall"] | undefined, DRAWN.wall),
      win: pick(WIN_OPTIONS, (q?.get("win") ?? undefined) as Scenario["win"] | undefined, DRAWN.win),
      pv: pick(PV_OPTIONS, num("pv") as Scenario["pv"] | undefined, DRAWN.pv),
    } as Scenario,
  };
}

function writeView(mode: TwinMode, floor: TwinFloor, s: Scenario, basis: ThermalBasis, b: TwinBuilding) {
  const DRAWN = b.start;
  const q = new URLSearchParams();
  if (b.key !== "a") q.set("b", b.key);
  if (mode !== "build") q.set("view", mode);
  if (mode === "rooms" && floor !== "1f") q.set("floor", floor);
  if (mode === "remodel" && (s.wall !== DRAWN.wall || s.win !== DRAWN.win || s.pv !== DRAWN.pv)) {
    q.set("wall", String(s.wall));
    q.set("win", s.win);
    q.set("pv", String(s.pv));
  }
  if (mode === "remodel" && basis !== "u") q.set("heat", basis);
  const qs = q.toString();
  return `${window.location.pathname}${qs ? `?${qs}` : ""}`;
}

const hhmm = (h: number) => `${String(Math.floor(h) % 24).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;

const TOOL_ICONS = {
  section: (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 10.5l6 3 6-3M2 7.5l6 3 6-3M8 1.5l6 3-6 3-6-3z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
    </svg>
  ),
  measure: (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 11.5l9-9 2 2-9 9zM5 9l1.2 1.2M7 7l1.6 1.6M9 5l1.2 1.2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  compare: (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path d="M8 1.5v13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  share: (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6.5 9.5a3 3 0 004.2 0l2.1-2.1a3 3 0 00-4.2-4.2l-.9.9M9.5 6.5a3 3 0 00-4.2 0L3.2 8.6a3 3 0 004.2 4.2l.9-.9" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

function ToolButton({ on, label, onClick, children }: { on: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      title={label}
      className={`flex h-7 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold transition-colors ${on ? "bg-white text-[#07141b]" : "text-white/70 hover:text-white"}`}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

type Props = {
  poster: { src: string; width: number; height: number };
  posterAlt: string;
  labels: TwinLabels;
  /** 건물 A 의 실 이름 (v1 번역 키) */
  roomNames: Record<string, string>;
  /** 자동 생성 건물의 도면 실 이름(한국어)을 옮길 낱말 — 한국어 페이지는 비어 있다 */
  roomWords: Record<string, string>;
  v1Href: string;
};

/** 건물 고르기 + 고른 건물의 트윈 */
export default function LabTwin(props: Props) {
  const params = useSearchParams();
  const [bkey, setBkey] = useState<BuildingKey>(() => {
    const b = params?.get("b");
    return b && b in BUILDINGS ? (b as BuildingKey) : "a";
  });
  const L = props.labels.buildings;
  return (
    <div>
      <div role="group" aria-label={L.label} className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(BUILDINGS) as BuildingKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={bkey === k}
            onClick={() => setBkey(k)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-colors sm:px-4 sm:py-3 ${bkey === k ? "border-primary bg-primary/5" : "border-border hover:bg-surface"}`}
          >
            <span className="block text-sm font-semibold">{L[k].name}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted sm:hidden">{L[k].short}</span>
            <span className="mt-0.5 hidden text-xs leading-relaxed text-muted sm:block">{L[k].desc}</span>
          </button>
        ))}
      </div>
      <TwinView key={bkey} building={BUILDINGS[bkey]} {...props} />
    </div>
  );
}

/** 낱말 바꾸기 (긴 것부터) — 도면의 실 이름을 다른 언어로 */
function translateRoom(name: string, words: Record<string, string>) {
  let out = name;
  for (const w of Object.keys(words).sort((a, b) => b.length - a.length)) out = out.split(w).join(words[w]);
  return out;
}

function TwinView({ building, poster, posterAlt, labels, roomNames, roomWords, v1Href }: Props & { building: TwinBuilding }) {
  const planUrl = building.data.plan;
  const viewerUrl = building.data.viewer;
  const hourlyUrl = building.data.hourly;
  const section = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const frozen = useSyncExternalStore(subscribeReduce, getReduce, getReduceServer);
  const [initial] = useState(() => createTwinSim(false));
  const sim = useRef<TwinSim>(initial);
  // 움직임 줄이기: 다 지은 모습 · 오후 2시에 멈춘다
  useEffect(() => {
    if (!frozen) return;
    sim.current.build = 1;
    sim.current.buildRun = false;
    sim.current.hour = STATIC_HOUR;
  }, [frozen]);

  const params = useSearchParams();
  const [start] = useState(() => readView(params, building));
  const [mode, setMode] = useState<TwinMode>(start.mode);
  const [floor, setFloor] = useState<TwinFloor>(start.floor);
  const [selected, setSelected] = useState<string | null>(null);
  const [before, setBefore] = useState(false);
  // 공유 링크가 겨울 · 여름 하루 열화상이면 켠 채로 시작
  const [thermal, setThermal] = useState(start.basis !== "u");
  // 리모델링 조합 — 처음엔 도면 사양 (+ 태양광 제안 4장)
  const [scenario, setScenario] = useState<Scenario>(start.scenario);
  // 도구 — 단면 높이(m, 평면도처럼 1.2 m 에서 시작) · 비교 막대 위치(0~1) · 잰 점
  const [tool, setTool] = useState<TwinTool>(null);
  const [cut, setCut] = useState(1.2);
  const split = useRef(0.5);
  const measure = useRef<MeasureState>({ pts: [] });
  const [splitPct, setSplitPct] = useState(50);
  // 열화상 기준 — 열관류율(고정 색) · 겨울 하루 · 여름 하루(EnergyPlus 시간별)
  const [basis, setBasisState] = useState<ThermalBasis>(start.basis);
  const [hourly, setHourly] = useState<HourlyData | null>(null);
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);
  const [snap, setSnap] = useState({ hour: initial.hour, build: initial.build, remodel: 0 });
  const chips = useRef<Record<string, HTMLElement | null>>({});

  // 가까워지면 불러오고, 화면 밖에서는 그리지 않는다
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near || data) return;
    let cancelled = false;
    Promise.all([fetch(planUrl).then((r) => r.json()), fetch(viewerUrl).then((r) => r.json())])
      .then(([plan, viewer]) => {
        if (cancelled) return;
        const base = viewerUrl.slice(0, viewerUrl.lastIndexOf("/") + 1);
        setData({ plan, rooms: viewer.rooms, model: base + viewer.model });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [near, data, planUrl, viewerUrl]);

  // 처음 보이면 도면 → 3D 를 한 번. 공유 링크로 다른 보기에서 시작하면 다 지은(· 다 고친) 모습으로
  useEffect(() => {
    const s = sim.current;
    if (!ready || !visible || s.build !== 0) return;
    if (start.mode === "build") s.buildRun = true;
    else {
      s.build = 1;
      if (start.mode === "remodel") s.remodel = 1;
    }
  }, [ready, visible, start.mode]);

  // 보기 · 층 · 조합 · 열화상 기준을 주소에 (기록은 남기지 않고 바꿔 둔다)
  useEffect(() => {
    const url = writeView(mode, floor, scenario, basis, building);
    if (url !== window.location.pathname + window.location.search) window.history.replaceState(window.history.state, "", url);
  }, [mode, floor, scenario, basis, building]);

  // 시간별 값은 겨울 · 여름 하루를 고를 때 한 번 불러온다
  useEffect(() => {
    if (basis === "u" || hourly) return;
    let cancelled = false;
    fetch(hourlyUrl)
      .then((r) => r.json())
      .then((d: HourlyData) => !cancelled && setHourly(d))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [basis, hourly, hourlyUrl]);

  const setBasis = useCallback((b: ThermalBasis) => {
    setBasisState(b);
    // 겨울 · 여름 하루를 고르면 열화상을 켠다
    if (b !== "u") setThermal(true);
  }, []);

  // 대표일 표기 (예: 1월 23일 · Jan 23)
  const dates = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" });
    const fmt = (md: string) => {
      const [m, d] = md.split("-").map(Number);
      return f.format(new Date(2026, m - 1, d));
    };
    return { winter: fmt(hourly?.days.winter ?? "01-23"), summer: fmt(hourly?.days.summer ?? "07-28") };
  }, [locale, hourly]);

  // 겨울 · 여름 하루 열화상: 지금 시각의 바깥 기온 · 건물 부하 (전 → 고른 조합)
  const readout = useMemo(() => {
    if (basis === "u" || !hourly) return null;
    const base = hourly.runs["w0-old"][basis];
    const run = hourly.runs[scenarioKey(scenario)][basis];
    const k = basis === "winter" ? "heat" : "cool";
    const B = labels.remodel.basis;
    return B.caption
      .replace("{date}", dates[basis])
      .replace("{time}", hhmm(snap.hour))
      .replace("{out}", atHour(base.out, snap.hour).toFixed(1))
      .replace("{kind}", basis === "winter" ? B.heating : B.cooling)
      .replace("{before}", atHour(base[k], snap.hour).toFixed(1))
      .replace("{after}", atHour(run[k], snap.hour).toFixed(1));
  }, [basis, hourly, scenario, snap.hour, dates, labels]);

  const share = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }, []);

  // 비교 막대 끌기 — 3D 는 매 프레임 split 을 읽고, 막대 위치는 직접 옮긴다
  const dragSplit = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const stage = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!stage || !(e.buttons & 1)) return;
    const x = Math.min(0.95, Math.max(0.05, (e.clientX - stage.left) / stage.width));
    split.current = x;
    e.currentTarget.style.left = `${x * 100}%`;
  }, []);

  // 패널 · 시계는 0.25초마다 읽는다
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 250) return;
      last = now;
      const s = sim.current;
      setSnap((p) => (p.hour === s.hour && p.build === s.build && p.remodel === s.remodel ? p : { hour: s.hour, build: s.build, remodel: s.remodel }));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready]);

  const choose = useCallback((m: TwinMode) => {
    const s = sim.current;
    setMode(m);
    setSelected(null);
    setTool(null);
    // 다른 보기로 가면 짓는 장면은 끝낸다
    if (m !== "build" && s.build < 1) {
      s.build = 1;
      s.buildRun = false;
    }
    if (m === "remodel" && s.remodel === 0) {
      s.remodelRun = true;
      setBefore(false);
    }
  }, []);

  const replay = useCallback(() => {
    const s = sim.current;
    if (mode === "build") {
      s.build = 0;
      s.buildRun = true;
    } else if (mode === "remodel") {
      s.remodel = 0;
      s.remodelRun = true;
      setBefore(false);
      setThermal(false);
    }
  }, [mode]);

  const rooms = useMemo(() => data?.rooms ?? [], [data]);
  // 실 이름: 건물 A 는 v1 번역, 자동 생성 건물은 도면 글자(다른 언어는 낱말을 옮긴다), 없으면 "실 n"
  const names = useMemo(() => {
    const out: Record<string, string> = {};
    rooms.forEach((r, i) => {
      out[r.key] = roomNames[r.key] ?? (r.name ? translateRoom(r.name, roomWords) : `${labels.rooms.unnamed} ${i + 1}`);
    });
    return out;
  }, [rooms, roomNames, roomWords, labels]);
  // 평면 도면 선 수 (twin.json 의 선분)
  const planLines = useMemo(() => (data ? Object.values(data.plan.floors).reduce((a, f) => a + Object.values(f.groups).reduce((b, g) => b + g.length / 4, 0), 0) : 0), [data]);

  return (
    <div ref={section}>
      <div data-twin-stage className="relative h-[68vh] min-h-[460px] max-h-[820px] overflow-hidden rounded-2xl border border-white/10 bg-[#050d13] lg:h-[76vh]">
        {/* 불러오기 전 · 실패하면 v1 모델 투시도 */}
        <Image
          src={poster.src}
          width={poster.width}
          height={poster.height}
          alt={posterAlt}
          sizes="(min-width: 1280px) 80rem, 100vw"
          className={`absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity duration-1000 ${ready ? "opacity-0" : ""}`}
        />
        {data && !failed && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Boundary fallback={<p className="absolute inset-x-6 top-1/2 text-center text-sm text-white/70">{labels.unsupported}</p>}>
              <TwinScene
                building={building}
                simRef={sim}
                modelUrl={data.model}
                plan={data.plan}
                rooms={rooms}
                mode={mode}
                floor={floor}
                selected={selected}
                onSelect={setSelected}
                before={before}
                thermal={thermal}
                scenario={scenario}
                tool={tool}
                cut={cut}
                basis={basis}
                hourly={hourly}
                splitRef={split}
                measureRef={measure}
                chipsRef={chips}
                active={visible}
                frozen={frozen}
                paused={paused}
                onReady={() => setReady(true)}
              />
            </Boundary>
          </div>
        )}
        {!ready && !failed && <p className="absolute inset-x-0 bottom-6 text-center text-sm text-white/60">{labels.loading}</p>}
        {failed && <p className="absolute inset-x-6 top-1/2 text-center text-sm text-white/70">{labels.unsupported}</p>}

        {/* 실 이름표 — 장면이 매 프레임 위치를 옮긴다 */}
        {mode === "rooms" &&
          rooms.map((r) => (
            <button
              key={r.key}
              type="button"
              data-twin-ui
              ref={(el) => {
                chips.current[r.key] = el;
              }}
              onClick={() => setSelected(r.key === selected ? null : r.key)}
              style={{ visibility: "hidden" }}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-semibold leading-none tabular-nums shadow-lg backdrop-blur-sm transition-colors ${
                selected === r.key ? "border-primary-light bg-[#0b2a33]/90 text-white" : "border-white/15 bg-[#07141b]/75 text-white/85 hover:border-white/40"
              }`}
            >
              {names[r.key]}
              <span className="ml-1.5 font-medium text-white/55">{r.area.toFixed(1)} ㎡</span>
            </button>
          ))}

        {/* 보기 고르기 */}
        <div data-twin-chrome role="tablist" aria-label={labels.tabsLabel} className="absolute left-3 top-3 z-10 flex gap-1 rounded-full border border-white/12 bg-[#07141b]/80 p-1 backdrop-blur-sm sm:left-4 sm:top-4">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => choose(m)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors sm:px-4 sm:text-[13px] ${mode === m ? "bg-primary text-white" : "text-white/65 hover:text-white"}`}
            >
              {labels.tabs[m]}
            </button>
          ))}
        </div>

        {/* 치수 결과 — 장면이 두 점 가운데로 옮긴다 */}
        <div
          ref={(el) => {
            chips.current.measure = el;
          }}
          style={{ visibility: "hidden" }}
          className="pointer-events-none absolute left-0 top-0 z-10 rounded-md bg-[#ffd27a] px-2 py-1 text-[12px] font-semibold tabular-nums text-[#1a1406] shadow-lg"
        />

        {/* 전후 비교 막대 */}
        {tool === "compare" && snap.remodel >= 1 && (
          <div
            data-twin-chrome
            role="slider"
            aria-label={labels.tools.handle}
            aria-valuemin={5}
            aria-valuemax={95}
            aria-valuenow={splitPct}
            tabIndex={0}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onPointerMove={dragSplit}
            onPointerUp={() => setSplitPct(Math.round(split.current * 100))}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              split.current = Math.min(0.95, Math.max(0.05, split.current + (e.key === "ArrowLeft" ? -0.03 : 0.03)));
              e.currentTarget.style.left = `${split.current * 100}%`;
              setSplitPct(Math.round(split.current * 100));
            }}
            style={{ left: "50%" }}
            className="absolute bottom-0 top-28 z-[5] w-10 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-none sm:top-16"
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80" />
            <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[#07141b]/80 text-white shadow-lg backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M5 3.5L1.5 7 5 10.5M9 3.5L12.5 7 9 10.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="absolute right-6 top-3 whitespace-nowrap rounded bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold text-white/85">{labels.remodel.before}</span>
            <span className="absolute left-6 top-3 whitespace-nowrap rounded bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold text-white/85">{labels.remodel.chosen}</span>
          </div>
        )}

        {/* 도구 · 시계 */}
        {ready && (
          <div data-twin-chrome className="absolute right-3 top-14 z-10 flex items-center gap-2 sm:right-4 sm:top-4">
            <div role="toolbar" aria-label={labels.tools.label} className="flex items-center gap-0.5 rounded-full border border-white/12 bg-[#07141b]/80 p-1 backdrop-blur-sm">
              {mode !== "rooms" &&
                (["section", "measure", ...(mode === "remodel" && snap.remodel >= 1 ? (["compare"] as const) : [])] as const).map((k) => (
                  <ToolButton
                    key={k}
                    on={tool === k}
                    label={labels.tools[k]}
                    onClick={() => {
                      // 비교 막대는 열 때마다 가운데에서, 차이가 잘 보이게 열화상과 함께
                      split.current = 0.5;
                      setSplitPct(50);
                      if (k === "compare" && tool !== k) setThermal(true);
                      setTool(tool === k ? null : k);
                    }}
                  >
                    {TOOL_ICONS[k]}
                  </ToolButton>
                ))}
              <ToolButton on={copied} label={copied ? labels.tools.copied : labels.tools.share} onClick={share}>
                {TOOL_ICONS.share}
              </ToolButton>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-white/12 bg-[#07141b]/80 py-1 pl-3 pr-1 text-[12px] font-semibold tabular-nums text-white/80 backdrop-blur-sm">
            {hhmm(snap.hour)}
            {!frozen && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? labels.play : labels.pause}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              >
                {paused ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M3 2l5 3-5 3z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M3 2v6M7 2v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            )}
            </div>
          </div>
        )}

        {ready && (
          <div data-twin-chrome>
            <StageBar
              building={building}
              mode={mode}
              labels={labels}
              scenario={scenario}
              build={snap.build}
              remodel={snap.remodel}
              floor={floor}
              onFloor={(f) => {
                setFloor(f);
                setSelected(null);
              }}
              before={before}
              onBefore={setBefore}
              thermal={thermal}
              onThermal={setThermal}
              onReplay={frozen ? null : replay}
              tool={tool}
              cut={cut}
              onCut={setCut}
              basis={basis}
              readout={readout}
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <TwinDetails
          mode={mode}
          labels={labels}
          scenario={scenario}
          onScenario={setScenario}
          basis={basis}
          onBasis={setBasis}
          hourly={hourly}
          hour={snap.hour}
          dates={dates} rooms={rooms} roomNames={names} building={building} planLines={planLines} floor={floor} selected={selected} onSelect={setSelected} v1Href={v1Href} LinkComponent={Link} />
      </div>
      <p className="mt-8 border-t border-border pt-4 text-xs leading-relaxed text-muted">{labels.buildings[building.key].footnote ?? labels.footnote}</p>
    </div>
  );
}
