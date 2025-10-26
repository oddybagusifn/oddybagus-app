// components/SmoothScroll.tsx
"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) return;

    const lenis = new Lenis({
      // “inertia/delay” rasa halus
      duration: 2,                           // makin besar makin berasa delay
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      // opsi yang masih ada di versi baru:
      // syncTouch: true,        // (opsional) sinkronkan momentum touch (biar tetap halus)
      // touchMultiplier: 1,     // (opsional) percepat/pelembat swipe
      // wheelMultiplier: 1,     // (opsional) percepat/pelembat scroll wheel
    });

    (window as any).lenis = lenis;

    let rafId = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(rafId);
      // @ts-ignore
      lenis?.destroy?.();
      (window as any).lenis = undefined;
    };
  }, []);

  return null;
}
