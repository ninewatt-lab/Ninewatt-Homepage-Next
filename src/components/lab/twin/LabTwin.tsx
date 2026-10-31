"use client";

/**
 * Lab v2 — 도면으로 지은 3D 트윈 섹션.
 * 화면에 가까워지면 데이터(twin.json · viewer.json)와 3D 장면을 불러오고, 처음 보이면 도면 → 3D 구축을 한 번 보여 준다.
 * 보기: 도면 → 3D · 실 · 면적 · 그린리모델링. 옆 패널은 넓은 화면에서 장면 위 오른쪽, 좁은 화면에서 장면 아래.
 */

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import TwinPanel, { type PanelRoom, type TwinLabels } from "./TwinPanel";
import { STATIC_HOUR, createTwinSim, type TwinFloor, type TwinMode, type TwinSim } from "./twinModel";
import type { TwinPlanData, TwinRoom } from "./TwinScene";

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

const hhmm = (h: number) => `${String(Math.floor(h) % 24).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;

export default function LabTwin({
  planUrl,
  viewerUrl,
  poster,
  posterAlt,
  labels,
  roomNames,
  v1Href,
}: {
  planUrl: string;
  /** v1 뷰어 데이터 (실 · 모델 경로) */
  viewerUrl: string;
  poster: { src: string; width: number; height: number };
  posterAlt: string;
  labels: TwinLabels;
  roomNames: Record<string, string>;
  v1Href: string;
}) {
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

  const [mode, setMode] = useState<TwinMode>("build");
  const [floor, setFloor] = useState<TwinFloor>("1f");
  const [selected, setSelected] = useState<string | null>(null);
  const [before, setBefore] = useState(false);
  const [thermal, setThermal] = useState(false);
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

  // 처음 보이면 도면 → 3D 를 한 번
  useEffect(() => {
    if (ready && visible && sim.current.build === 0) sim.current.buildRun = true;
  }, [ready, visible]);

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

  const rooms = data?.rooms ?? [];

  return (
    <div ref={section}>
      <div className="relative">
      <div data-twin-stage className="relative h-[68vh] min-h-[460px] max-h-[860px] overflow-hidden rounded-2xl border border-white/10 bg-[#050d13] lg:h-[82vh]">
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
              {roomNames[r.key] ?? r.key}
              <span className="ml-1.5 font-medium text-white/55">{r.area.toFixed(1)} ㎡</span>
            </button>
          ))}

        {/* 보기 고르기 */}
        <div data-twin-chrome role="tablist" aria-label={labels.tabsLabel} className="absolute left-3 top-3 z-10 flex gap-1 rounded-full border border-white/12 bg-[#07141b]/80 p-1 backdrop-blur-sm sm:left-4 sm:top-4">
          {MODES.map((m, i) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => choose(m)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors sm:px-4 sm:text-[13px] ${mode === m ? "bg-primary text-white" : "text-white/65 hover:text-white"}`}
            >
              <span className="mr-1 text-[10px] opacity-60">{i + 1}</span>
              {labels.tabs[m]}
            </button>
          ))}
        </div>

        {/* 시계 · 시간 멈추기 */}
        {ready && (
          <div data-twin-chrome className="absolute right-3 top-14 z-10 flex items-center gap-1 rounded-full border border-white/12 bg-[#07141b]/80 py-1 pl-3 pr-1 text-[12px] font-semibold tabular-nums text-white/80 backdrop-blur-sm sm:top-4 sm:right-4 lg:right-[24.5rem]">
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
        )}

        {ready && <p data-twin-chrome className="pointer-events-none absolute bottom-3 left-4 z-10 hidden text-[11px] text-white/45 sm:block">{labels.hint}</p>}
      </div>

      <TwinPanel
        mode={mode}
        labels={labels}
        build={snap.build}
        remodel={snap.remodel}
        floor={floor}
        onFloor={(f) => {
          setFloor(f);
          setSelected(null);
        }}
        rooms={rooms}
        roomNames={roomNames}
        selected={selected}
        onSelect={setSelected}
        before={before}
        onBefore={setBefore}
        thermal={thermal}
        onThermal={setThermal}
        onReplay={frozen ? null : replay}
        v1Href={v1Href}
        LinkComponent={Link}
        className="mt-4 lg:absolute lg:bottom-4 lg:right-4 lg:top-4 lg:mt-0 lg:w-[22rem] lg:overflow-y-auto"
      />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted">{labels.footnote}</p>
    </div>
  );
}
