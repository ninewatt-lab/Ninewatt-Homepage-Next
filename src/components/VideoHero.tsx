"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";

// 끝 1초를 첫 장면과 크로스페이드한 끊김 없는 루프 (원본: S3 videos/intro.mp4)
const VIDEO_BASE = "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/videos";
const VIDEO_DESKTOP_URL = `${VIDEO_BASE}/hero-loop-1080.mp4`;
const VIDEO_MOBILE_URL = `${VIDEO_BASE}/hero-loop-720.mp4`;
const POSTER_URL = "/images/hero-poster.webp";

export default function VideoHero() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  // 하이드레이션 전에 canplay가 이미 지나갔으면 이벤트를 다시 받지 못하므로 붙는 시점에 확인한다
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && node.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) setVideoReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      video.pause();
      return;
    }

    // 화면 밖에서는 디코딩을 멈춰 배터리 · CPU 를 아낀다
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!userPausedRef.current) video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative -mt-16 h-dvh w-full overflow-hidden bg-gray-900">
      {/* Poster — LCP 이미지. 영상이 준비될 때까지, 그리고 움직임 줄이기 설정에서는 계속 보인다 */}
      <Image
        src={POSTER_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover transition-opacity duration-700 ${videoReady ? "opacity-0 motion-reduce:opacity-100" : "opacity-100"}`}
      />

      {/* Background video — media 를 무시하는 브라우저는 첫 source(1080p)를 쓴다 */}
      <video
        ref={attachVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:hidden ${videoReady ? "opacity-100" : "opacity-0"}`}
      >
        <source src={VIDEO_DESKTOP_URL} type="video/mp4" media="(min-width: 768px)" />
        <source src={VIDEO_MOBILE_URL} type="video/mp4" />
      </video>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* CES Badge */}
        <div className="hero-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm" style={{ animationDelay: "0.2s" }}>
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
        <h1 className="hero-fade-in text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl" style={{ animationDelay: "0.5s" }}>
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
        <div className="hero-fade-in mx-auto mt-8 h-px w-16 bg-linear-to-r from-transparent via-primary to-transparent" style={{ animationDelay: "0.8s" }} />

        {/* Subtitle */}
        <p className="hero-fade-in mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg" style={{ animationDelay: "1s" }}>
          {t("hero.subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="hero-fade-in mt-10 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: "1.2s" }}>
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
        <div className="hero-fade-in absolute bottom-6 left-0 flex w-full flex-col items-center justify-center gap-3 px-6 sm:bottom-12 sm:flex-row sm:gap-x-8" style={{ animationDelay: "1.5s" }}>
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              {t("hero.familyLabel")}
            </span>
            <span className="text-center text-[12px] leading-relaxed text-white/60 sm:text-[13px]">
              한국건설기술연구원 · 한국에너지기술연구원 · 한국전기연구원
            </span>
          </div>
          <div className="hidden h-3 w-px bg-white/20 sm:block" />
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-3">
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              {t("hero.partnerLabel")}
            </span>
            <span className="text-[12px] text-white/60 sm:text-[13px]">
              한국전력공사
            </span>
          </div>
        </div>
      </div>

      {/* 5초 넘게 자동재생되는 영상의 정지 수단 (WCAG 2.2.2) */}
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? t("hero.pauseVideo") : t("hero.playVideo")}
        className="absolute right-4 top-20 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-colors hover:border-white/50 hover:text-white motion-reduce:hidden sm:top-24 sm:right-8"
      >
        {isPlaying ? (
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
