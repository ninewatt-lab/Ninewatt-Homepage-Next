"use client";

import { ReactNode, useState } from "react";

interface LogoMarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number; // seconds for one full cycle
}

function LogoMarqueeRow({ children, direction = "left", speed = 30 }: LogoMarqueeProps) {
  const [paused, setPaused] = useState(false);
  const animationClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";

  return (
    <div
      className="relative flex overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />

      {/* Two copies for seamless loop — pr-12 ensures gap between end of copy 1 and start of copy 2 */}
      <div
        className={`flex shrink-0 items-center gap-12 pr-12 ${animationClass}`}
        style={{ animationDuration: `${speed}s`, animationPlayState: paused ? "paused" : "running" }}
      >
        {children}
      </div>
      <div
        className={`flex shrink-0 items-center gap-12 pr-12 ${animationClass}`}
        style={{ animationDuration: `${speed}s`, animationPlayState: paused ? "paused" : "running" }}
        aria-hidden
      >
        {children}
      </div>
    </div>
  );
}

export default function LogoMarquee({
  row1,
  row2,
}: {
  row1: ReactNode[];
  row2: ReactNode[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <LogoMarqueeRow direction="left" speed={35}>
        {row1.map((logo, i) => (
          <div
            key={i}
            className="flex h-12 w-[160px] shrink-0 items-center justify-center text-muted opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            {logo}
          </div>
        ))}
      </LogoMarqueeRow>
      <LogoMarqueeRow direction="right" speed={40}>
        {row2.map((logo, i) => (
          <div
            key={i}
            className="flex h-12 w-[160px] shrink-0 items-center justify-center text-muted opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            {logo}
          </div>
        ))}
      </LogoMarqueeRow>
    </div>
  );
}
