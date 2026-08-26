"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Lightweight replacement for framer-motion's `whileInView` fade/slide-in
 * pattern (initial opacity/offset -> animate once the element scrolls into
 * view). A plain IntersectionObserver + CSS transition does the same job
 * without pulling every card in a grid into framer-motion's animation
 * runtime, which is what was inflating hydration/layout cost on pages with
 * many repeated cards. Visual output (timing, easing, distances) matches
 * the framer-motion config it replaces: framer's default tween easing for a
 * duration-only transition is "easeOut", which is CSS `ease-out` natively.
 */
export function useRevealOnView<T extends HTMLElement>(
  options: { x?: number; y?: number; duration: number; delay?: number; margin?: string } = { duration: 0.5 }
) {
  const { x = 0, y = 0, duration, delay = 0, margin = "0px" } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : `translate(${x}px, ${y}px)`,
    transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
  };

  return { ref, style };
}
