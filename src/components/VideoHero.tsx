"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";

const VIDEO_URL = "/intro-optimized.mp4";
const POSTER_URL = "/intro-poster.jpg";

export default function VideoHero() {
  const t = useTranslations("home");
  const [videoReady, setVideoReady] = useState(false);

  const handleCanPlay = useCallback(() => {
    setVideoReady(true);
  }, []);

  return (
    <section className="relative -mt-16 h-dvh w-full overflow-hidden bg-gray-900">
      {/* Poster fallback — shown while video loads */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${videoReady ? "opacity-0" : "opacity-100"}`}
        style={{ backgroundImage: `url(${POSTER_URL})` }}
      />

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER_URL}
        onCanPlay={handleCanPlay}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* CES Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
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
        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-7xl">
          {t("hero.headline")}
          <br />
          <span className="hero-shine text-primary-light">{t("hero.headlineHighlight")}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          {t("hero.subtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
      </div>

    </section>
  );
}
