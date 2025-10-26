// components/ScrollFloat.tsx
"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once on the client (avoid SSR/TS errors)
if (typeof window !== "undefined" && !(gsap as any).plugins?.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: React.ReactNode;
  className?: string;
  animationDuration?: number;
  ease?: string | gsap.EaseFunction;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
};

export default function ScrollFloat({
  children,
  className = "",
  animationDuration = 0.9,
  ease = "back.inOut(3)",
  scrollStart = "top 85%",
  scrollEnd = "top 50%",
  stagger = 0.03,
}: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // Build .char spans only once (preserve spaces with NBSP)
    if (!el.querySelector(".char")) {
      const raw = el.textContent ?? "";
      el.textContent = "";

      for (const ch of raw) {
        if (ch === "\n") {
          el.appendChild(document.createElement("br"));
          continue;
        }
        const span = document.createElement("span");
        span.className = "char inline-block";
        span.textContent = ch === " " ? "\u00A0" : ch; // keep spaces visible
        el.appendChild(span);
      }
    }

    const chars = el.querySelectorAll<HTMLSpanElement>(".char");
    if (!chars.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        {
          willChange: "opacity, transform",
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 0%",
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <span
      ref={wrapRef}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}
