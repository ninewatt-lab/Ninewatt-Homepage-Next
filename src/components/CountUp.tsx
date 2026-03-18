"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string;
  className?: string;
}

/**
 * Animates numeric portions of a string (e.g. "96.81%" → counts 0→96.81 then shows "%").
 * Non-numeric strings (e.g. "2019") are animated as integers.
 */
export default function CountUp({ value, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  });

  function animate() {
    // Extract leading numeric part and suffix
    const match = value.match(/^([0-9,.]+)(.*)$/);
    if (!match) {
      setDisplayed(value);
      return;
    }

    const numStr = match[1].replace(/,/g, "");
    const suffix = match[2]; // e.g. "%", "억", "+", "건"
    const target = parseFloat(numStr);
    const hasDecimal = numStr.includes(".");
    const decimalPlaces = hasDecimal ? (numStr.split(".")[1]?.length ?? 0) : 0;
    const hasComma = match[1].includes(",");

    const duration = 1500;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;

      let formatted: string;
      if (hasDecimal) {
        formatted = current.toFixed(decimalPlaces);
      } else {
        formatted = Math.round(current).toString();
      }

      if (hasComma) {
        formatted = Number(formatted).toLocaleString();
      }

      setDisplayed(formatted + suffix);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}
