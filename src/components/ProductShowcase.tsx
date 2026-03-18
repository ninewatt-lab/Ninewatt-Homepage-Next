"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  linkText: string;
  media:
    | { type: "video"; src: string }
    | { type: "image"; src: string; alt: string };
}

const products: Product[] = [
  {
    id: "opti",
    label: "Opti",
    title: "AI가 건물 에너지를\n진단하고 최적화합니다",
    description:
      "자연어로 건물 에너지를 질의하면, AI가 비용 절감 전략과 투자 시뮬레이션 결과를 실시간으로 제공합니다. CES 2026 Innovation Awards 수상작.",
    href: "/product/opti",
    linkText: "Opti 알아보기",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/opti-scene-short.mp4",
    },
  },
  {
    id: "greenplanner",
    label: "GreenPlanner",
    title: "그린리모델링,\n시뮬레이션으로 설계합니다",
    description:
      "건물의 단열·창호·설비 개선 효과를 사전에 시뮬레이션하고, 최적의 그린리모델링 시나리오를 도출합니다.",
    href: "/product/greenplanner",
    linkText: "GreenPlanner 알아보기",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/greenplanner-scene.mp4",
    },
  },
  {
    id: "watti",
    label: "Watti",
    title: "3D 맵 위에서\n건물 에너지를 읽다",
    description:
      "건축물·에너지·환경·도시 데이터를 3D 맵 위에 통합하고, 건물별 에너지 효율화 인사이트를 시각적으로 제공합니다.",
    href: "/product/watti",
    linkText: "Watti 알아보기",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/watti-scene.mp4",
    },
  },
  {
    id: "repark",
    label: "RE:park",
    title: "QR 하나로\n시설물을 관리합니다",
    description:
      "시민은 QR로 고장을 신고하고, 관리자는 접수·배정을 처리하고, 보수업체는 완료를 보고합니다. 세 주체를 하나로 잇는 스마트 시설물 관리 시스템입니다.",
    href: "/product/repark",
    linkText: "RE:park 알아보기",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/repark-scene.mp4",
    },
  },
  {
    id: "solar-site",
    label: "SolarScope",
    title: "주소 입력만으로\n태양광 적합성을 분석합니다",
    description:
      "토지·건물의 태양광 설치 가능성을 분석합니다. 규제, 이격거리, 배전망, 발전량, 수익성을 통합 평가합니다.",
    href: "/product/solar-site",
    linkText: "SolarScope 알아보기",
    media: {
      type: "image",
      src: "/images/SolarScope/SolarScope_Image_2.png",
      alt: "SolarScope 대시보드",
    },
  },
  {
    id: "pv-intelligence",
    label: "PV Intelligence",
    title: "태양광 발전소를\n하나의 플랫폼에서 관제합니다",
    description:
      "자체 RTU로 현장 데이터를 수집하고, 실시간 모니터링부터 AI 운영 분석까지 하나의 플랫폼에서 제공합니다.",
    href: "/product/pv-intelligence",
    linkText: "PV Intelligence 알아보기",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/pv-intelligence-scene.mp4",
    },
  },
];

function BrowserFrame({
  children,
  url,
  isActive,
}: {
  children: React.ReactNode;
  url: string;
  isActive?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;

    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (y - 0.5) * -8;
    const rotateY = (x - 0.5) * 8;

    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    glow.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(73, 182, 202, 0.15), transparent 60%)`;
    glow.style.opacity = "1";
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = frameRef.current;
    const glow = glowRef.current;
    if (el) el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    if (glow) glow.style.opacity = "0";
  }, []);

  return (
    <div
      ref={frameRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col overflow-hidden rounded-xl bg-[#1a1a2e] shadow-2xl ring-1 ring-white/10"
      style={{ transition: "transform 0.3s ease-out", transformStyle: "preserve-3d" }}
    >
      {/* Mouse-following glow overlay */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-20 rounded-xl opacity-0"
        style={{ transition: "opacity 0.3s ease-out" }}
      />

      {/* Active glow ring */}
      {isActive && (
        <div className="pointer-events-none absolute -inset-px z-10 rounded-xl ring-1 ring-primary/30" />
      )}

      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#141422] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-2 flex flex-1 items-center gap-2 rounded-md bg-white/[0.06] px-3 py-1">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="shrink-0 text-emerald-400"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="truncate text-[11px] text-white/40">{url}</span>
        </div>
      </div>
      {/* Content */}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
}

const productUrls: Record<string, string> = {
  opti: "app.ninewatt.com/opti",
  greenplanner: "app.ninewatt.com/greenplanner",
  watti: "app.ninewatt.com/watti",
  repark: "app.ninewatt.com/repark",
  "solar-site": "app.ninewatt.com/solarscope",
  "pv-intelligence": "app.ninewatt.com/pv-intelligence",
};

function MediaBlock({ product, isActive }: { product: Product; isActive?: boolean }) {
  const content =
    product.media.type === "video" ? (
      <video className="h-auto w-full" autoPlay loop muted playsInline>
        <source src={product.media.src} type="video/mp4" />
      </video>
    ) : (
      <Image
        src={product.media.src}
        alt={product.media.alt}
        width={1200}
        height={675}
        className="h-auto w-full"
      />
    );

  return (
    <BrowserFrame url={productUrls[product.id] ?? "app.ninewatt.com"} isActive={isActive}>
      {content}
    </BrowserFrame>
  );
}

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((el, index) => {
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index);
          }
        },
        { threshold: 0.3, rootMargin: "-20% 0px -20% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our Products
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            에너지 기술의 모든 것
          </h2>
        </div>

        {/* Desktop: sticky left + scrolling right */}
        <div className="hidden md:grid md:grid-cols-[4fr_8fr] md:gap-12 lg:gap-16">
          {/* Left — Sticky text panel */}
          <div className="relative">
            <div className="sticky top-[25vh]">
              {/* Step counter */}
              <div className="mb-6 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-primary">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-sm text-muted">
                  {String(products.length).padStart(2, "0")}
                </span>
              </div>

              {/* Product nav dots */}
              <div className="mb-10 flex gap-1.5">
                {products.map((product, i) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      sectionRefs.current[i]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    aria-label={product.label}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      activeIndex === i
                        ? "w-8 bg-primary"
                        : "w-4 bg-border hover:bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Active product info — crossfade */}
              <div className="relative min-h-[300px]">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    className={`transition-all duration-700 ease-out ${
                      activeIndex === i
                        ? "relative opacity-100 translate-y-0"
                        : "absolute inset-0 opacity-0 translate-y-6 pointer-events-none"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {product.label}
                    </p>
                    <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight whitespace-pre-line lg:text-4xl">
                      {product.title}
                    </h2>
                    <p className="mt-5 text-base leading-relaxed text-muted">
                      {product.description}
                    </p>
                    <Link
                      href={product.href}
                      className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {product.linkText}
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Scrolling media */}
          <div className="flex flex-col">
            {products.map((product, i) => (
              <div
                key={product.id}
                ref={(el) => {
                  sectionRefs.current[i] = el;
                }}
                className="flex min-h-[80vh] scroll-mt-[10vh] items-center py-8"
              >
                <div className="w-full">
                  <div
                    className={`transition-all duration-700 ease-out ${
                      activeIndex === i
                        ? "opacity-100 scale-100"
                        : "opacity-30 scale-[0.96]"
                    }`}
                  >
                    <MediaBlock product={product} isActive={activeIndex === i} />
                  </div>

                  {/* Inline label under each media */}
                  <p
                    className={`mt-4 text-center text-xs font-medium tracking-wider uppercase transition-all duration-500 ${
                      activeIndex === i ? "text-primary opacity-100" : "text-muted opacity-0"
                    }`}
                  >
                    {product.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="flex flex-col gap-24 md:hidden">
          {products.map((product, i) => (
            <div key={product.id} className="flex flex-col gap-6">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {product.label}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight whitespace-pre-line">
                  {product.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted">
                  {product.description}
                </p>
                <Link
                  href={product.href}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {product.linkText}
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              <MediaBlock product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
