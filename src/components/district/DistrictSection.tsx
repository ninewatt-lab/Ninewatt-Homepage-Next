"use client";

/**
 * Product 페이지 첫 화면 — 나인와트 제품이 모두 들어간 하나의 테마 지역(3D).
 * 시설(또는 떠 있는 라벨)을 누르면 제품 상세 페이지로 간다. 아무것도 고르지 않으면 시설을 하나씩 비춰 준다.
 */

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import type { AlertTexts, DistrictView } from "./DistrictScene";
import { PRODUCT_HREF, PRODUCT_ORDER, type ProductKey } from "./districtLayout";

// three.js 는 크기가 커서 제목 · 목록을 먼저 그린 뒤에 불러온다
const DistrictScene = dynamic(() => import("./DistrictScene"), { ssr: false });

/** WebGL 을 만들 수 없으면 3D 없이 아래 제품 목록만으로 충분하다 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type DistrictProductInfo = { name: string; place: string; tagline: string; desc: string };

const CYCLE_MS = 3200;
const IDLE_MS = 4000;

export default function DistrictSection({
  products,
  texts,
}: {
  products: Record<ProductKey, DistrictProductInfo>;
  texts: { title: string; subtitle: string; hint: string; more: string; view: { label: string; city: string; district: string }; alerts: AlertTexts };
}) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hover, setHoverState] = useState<ProductKey | null>(null);
  const [cycle, setCycle] = useState<number | null>(null);
  const [view, setView] = useState<DistrictView>("district");
  const lastHover = useRef(0);

  const setHover = useCallback((k: ProductKey | null) => {
    lastHover.current = Date.now();
    setHoverState(k);
  }, []);
  const go = useCallback((k: ProductKey) => router.push(PRODUCT_HREF[k] as "/product/bems"), [router]);

  // 화면 밖에서는 그리지 않는다
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 아무것도 고르지 않으면 시설을 하나씩 비춘다 (움직임 줄이기에서는 하지 않음)
  useEffect(() => {
    if (!ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (Date.now() - lastHover.current < IDLE_MS) return;
      setCycle((c) => ((c ?? -1) + 1) % PRODUCT_ORDER.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [ready]);

  const active = hover ?? (cycle === null ? null : PRODUCT_ORDER[cycle]);
  // 도시 보기에서는 시설 카드를 감춘다 (지역 보기로 돌아오면 다시)
  const info = active && view === "district" ? products[active] : null;
  const sceneProducts = Object.fromEntries(PRODUCT_ORDER.map((k) => [k, { name: products[k].name, place: products[k].place }])) as Record<ProductKey, { name: string; place: string }>;

  // 헤더 · 제품 탭이 위에 투명하게 겹치도록 헤더 높이만큼 끌어올리고 첫 화면을 꽉 채운다
  return (
    <section ref={sectionRef} className="relative -mt-16 h-dvh min-h-[600px] w-full overflow-hidden bg-[#050d13] text-white">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
        <SceneBoundary>
          <DistrictScene
            products={sceneProducts}
            active={active}
            onHover={setHover}
            onGo={go}
            onReady={() => setReady(true)}
            running={visible}
            view={view}
            onView={setView}
            alertTexts={texts.alerts}
            overlay={
              <>
                {/* 글자 쪽을 차분하게 (라벨보다는 아래) */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#050d13]/85 via-transparent via-30% to-transparent" />
                <div className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-[#050d13]/80 via-transparent via-35% to-transparent wide:block" />
              </>
            }
          />
        </SceneBoundary>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pb-6 pt-[7.5rem] sm:pb-10 sm:pt-[8.5rem] lg:px-10">
        {/* 보기 범위: 도시 ↔ 지역 */}
        <div
          role="group"
          aria-label={texts.view.label}
          data-district-ui
          className={`pointer-events-auto absolute right-6 top-[7.5rem] flex rounded-full border border-white/12 bg-[#07141b]/80 p-1 text-[12px] font-semibold shadow-lg shadow-black/30 backdrop-blur-sm transition-opacity duration-700 sm:top-[8.5rem] lg:right-10 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {(["city", "district"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-1 transition-colors ${view === v ? "bg-primary text-white" : "text-white/60 hover:text-white"}`}
            >
              {texts.view[v]}
            </button>
          ))}
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{texts.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/65 sm:mt-3 sm:text-base md:text-lg">{texts.subtitle}</p>
          <p className="mt-3 inline-flex sm:mt-4 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-light" aria-hidden="true" />
            {texts.hint}
          </p>
        </div>

        {/* 고른 시설의 제품 */}
        <div
          data-district-ui
          aria-live="polite"
          className={`pointer-events-auto w-full max-w-sm rounded-2xl border border-white/12 bg-[#07141b]/88 p-4 shadow-2xl sm:p-5 backdrop-blur-md transition-all duration-300 ${
            info ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
          onPointerEnter={() => active && setHover(active)}
          onPointerLeave={() => setHover(null)}
        >
          {info && active && (
            <>
              <p className="text-[11px] font-semibold tracking-wide text-primary-light">{info.place}</p>
              <p className="mt-1 text-lg font-bold sm:text-xl">{info.name}</p>
              <p className="mt-0.5 hidden text-[12px] text-white/50 sm:block">{info.tagline}</p>
              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/75 sm:mt-3 sm:line-clamp-3">{info.desc}</p>
              <Link
                href={PRODUCT_HREF[active] as "/product/bems"}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 sm:mt-4 text-[12px] font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                {texts.more}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
