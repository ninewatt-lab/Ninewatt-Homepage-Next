"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns whether the sub-nav should be visible.
 * Visible when: scrolling up, near the top, or scroll delta is small.
 */
export function useScrollDirection(threshold = 10) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (currentY <= 80) {
          // Near top — always show
          setVisible(true);
        } else if (delta > threshold) {
          // Scrolling down past threshold
          setVisible(false);
        } else if (delta < -threshold) {
          // Scrolling up past threshold
          setVisible(true);
        }

        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}
