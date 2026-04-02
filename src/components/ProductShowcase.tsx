"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Product {
  id: string;
  label: string;
  titleKey: string;
  descriptionKey: string;
  href: string;
  linkTextKey: string;
  media:
    | { type: "video"; src: string }
    | { type: "image"; src: string; alt: string }
    | { type: "imageSlider"; images: { src: string; alt: string }[] };
}

const products: Product[] = [
  {
    id: "opti",
    label: "Opti",
    titleKey: "showcase.opti.title",
    descriptionKey: "showcase.opti.description",
    href: "/solutions/opti",
    linkTextKey: "showcase.opti.linkText",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/opti-scene-short.mp4",
    },
  },
  {
    id: "greenplanner",
    label: "GreenPlanner",
    titleKey: "showcase.greenplanner.title",
    descriptionKey: "showcase.greenplanner.description",
    href: "/product/greenplanner",
    linkTextKey: "showcase.greenplanner.linkText",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/greenplanner-scene.mp4",
    },
  },
  {
    id: "watti",
    label: "Watti",
    titleKey: "showcase.watti.title",
    descriptionKey: "showcase.watti.description",
    href: "/solutions/watti",
    linkTextKey: "showcase.watti.linkText",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/watti-scene.mp4",
    },
  },
  {
    id: "repark",
    label: "RE:park",
    titleKey: "showcase.repark.title",
    descriptionKey: "showcase.repark.description",
    href: "/product/repark",
    linkTextKey: "showcase.repark.linkText",
    media: {
      type: "video",
      src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos/repark-scene.mp4",
    },
  },
  {
    id: "solar-site",
    label: "SolarScope",
    titleKey: "showcase.solarScope.title",
    descriptionKey: "showcase.solarScope.description",
    href: "/product/solar-site",
    linkTextKey: "showcase.solarScope.linkText",
    media: {
      type: "imageSlider",
      images: [
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_1.png", alt: "SolarScope Map Analysis Dashboard" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_7.png", alt: "SolarScope Nationwide Grid Analysis" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/SolarScope/SolarScope_8.png", alt: "SolarScope 3D Roof Analysis" },
      ],
    },
  },
  {
    id: "pv-intelligence",
    label: "PV Intelligence",
    titleKey: "showcase.pvIntelligence.title",
    descriptionKey: "showcase.pvIntelligence.description",
    href: "/product/pv-intelligence",
    linkTextKey: "showcase.pvIntelligence.linkText",
    media: {
      type: "imageSlider",
      images: [
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_2.png", alt: "PV Intelligence Dashboard" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_3.png", alt: "PV Intelligence Site Map" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_4.png", alt: "PV Intelligence Cross-Site Analysis" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_5.png", alt: "PV Intelligence Revenue Analysis" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_6.png", alt: "PV Intelligence AI Alerts" },
        { src: "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/images/PVIntelligence/PV_Intelligence_1.png", alt: "PV Intelligence String Layout" },
      ],
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

const SLIDE_DURATION = 4000;

function ImageSlider({ images }: { images: { src: string; alt: string }[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto-advance with progress tracking
  useEffect(() => {
    if (images.length <= 1) return;

    const start = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / SLIDE_DURATION, 1));
      if (elapsed < SLIDE_DURATION) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setPrev(current);
      setCurrent((p) => (p + 1) % images.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [current, images.length]);

  // Clear prev after transition completes
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 1200);
    return () => clearTimeout(t);
  }, [prev]);

  const goTo = (i: number) => {
    if (i === current) return;
    setPrev(current);
    setCurrent(i);
    setProgress(0);
  };

  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      {images.map((img, i) => {
        const isActive = i === current;
        const isLeaving = i === prev;
        return (
          <div
            key={img.src}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : isLeaving ? 0 : 0,
              zIndex: isActive ? 2 : isLeaving ? 1 : 0,
              transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover object-top"
              style={{
                transform: isActive ? "scale(1.08)" : "scale(1)",
                transition: `transform ${SLIDE_DURATION + 1200}ms cubic-bezier(0.25, 0, 0.15, 1)`,
              }}
            />
          </div>
        );
      })}

      {/* Bottom gradient for dots visibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Progress indicator */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="group relative h-1 w-8 overflow-hidden rounded-full bg-white/20"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width]"
              style={{
                width:
                  i === current
                    ? `${progress * 100}%`
                    : i < current || (current === 0 && prev === images.length - 1 && i !== 0)
                      ? "100%"
                      : "0%",
                transition: i === current ? "none" : "width 0.3s ease",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaBlock({ product, isActive }: { product: Product; isActive?: boolean }) {
  let content: React.ReactNode;

  if (product.media.type === "video") {
    content = (
      <video className="h-auto w-full" autoPlay loop muted playsInline>
        <source src={product.media.src} type="video/mp4" />
      </video>
    );
  } else if (product.media.type === "imageSlider") {
    content = <ImageSlider images={product.media.images} />;
  } else {
    content = (
      <Image
        src={product.media.src}
        alt={product.media.alt}
        width={1200}
        height={675}
        className="h-auto w-full"
      />
    );
  }

  return (
    <BrowserFrame url={productUrls[product.id] ?? "app.ninewatt.com"} isActive={isActive}>
      {content}
    </BrowserFrame>
  );
}

export default function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(0);
  const direction = activeIndex >= prevIndexRef.current ? 1 : -1;
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslations("home");

  useEffect(() => {
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

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
            {t("showcase.label")}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("showcase.heading")}
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

              {/* Active product info — staggered crossfade */}
              <div className="relative min-h-[300px]">
                {products.map((product, i) => {
                  const isActive = activeIndex === i;
                  const offsetY = isActive ? 0 : direction > 0 ? 24 : -24;
                  return (
                    <div
                      key={product.id}
                      className={`${
                        isActive
                          ? "relative pointer-events-auto"
                          : "absolute inset-0 pointer-events-none"
                      }`}
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${offsetY}px)`,
                        transition: "opacity 600ms ease-out, transform 600ms ease-out",
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: `translateY(${isActive ? 0 : 12}px)`,
                          transition: "opacity 500ms ease-out 0ms, transform 500ms ease-out 0ms",
                        }}
                      >
                        {product.label}
                      </p>
                      <h2
                        className="mt-4 text-3xl font-bold leading-snug tracking-tight whitespace-pre-line lg:text-4xl"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: `translateY(${isActive ? 0 : 12}px)`,
                          transition: "opacity 500ms ease-out 80ms, transform 500ms ease-out 80ms",
                        }}
                      >
                        {t(product.titleKey)}
                      </h2>
                      <p
                        className="mt-5 text-base leading-relaxed text-muted"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: `translateY(${isActive ? 0 : 12}px)`,
                          transition: "opacity 500ms ease-out 160ms, transform 500ms ease-out 160ms",
                        }}
                      >
                        {t(product.descriptionKey)}
                      </p>
                      <Link
                        href={product.href}
                        className="group mt-12 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: `translateY(${isActive ? 0 : 12}px)`,
                          transition: "opacity 500ms ease-out 240ms, transform 500ms ease-out 240ms",
                        }}
                      >
                        {t(product.linkTextKey)}
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Sticky stacking media */}
          <div className="relative flex flex-col">
            {products.map((product, i) => {
              const isActive = activeIndex === i;
              const isPast = i < activeIndex;
              return (
                <div
                  key={product.id}
                  ref={(el) => {
                    sectionRefs.current[i] = el;
                  }}
                  className="scroll-mt-[10vh]"
                  style={{ minHeight: "80vh" }}
                >
                  <div
                    className="sticky w-full"
                    style={{
                      top: "25vh",
                      zIndex: i + 1,
                    }}
                  >
                    <div
                      style={{
                        opacity: isActive ? 1 : isPast ? 0.4 : 0.2,
                        transform: isActive
                          ? "scale(1)"
                          : isPast
                            ? `scale(${0.95 - (activeIndex - i) * 0.02})`
                            : "scale(0.95) translateY(20px)",
                        filter: isActive ? "blur(0)" : isPast ? "blur(1px)" : "blur(2px)",
                        transition: "opacity 700ms ease-out, transform 700ms ease-out, filter 700ms ease-out",
                      }}
                    >
                      <MediaBlock product={product} isActive={isActive} />
                    </div>

                    {/* Inline label under each media */}
                    <p
                      className="mt-4 text-center text-xs font-medium tracking-wider uppercase"
                      style={{
                        color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${isActive ? 0 : 8}px)`,
                        transition: "opacity 500ms ease-out 200ms, transform 500ms ease-out 200ms, color 500ms ease-out",
                      }}
                    >
                      {product.label}
                    </p>
                  </div>
                </div>
              );
            })}
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
                  {t(product.titleKey)}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted">
                  {t(product.descriptionKey)}
                </p>
                <Link
                  href={product.href}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {t(product.linkTextKey)}
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
