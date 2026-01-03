// components/ScrollFloat.tsx
"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

    // Build span .char sekali saja
    if (!el.querySelector(".char")) {
      const raw = el.textContent ?? "";
      el.textContent = "";

      for (const ch of raw) {
        if (ch === "\n") {
          el.appendChild(document.createElement("br"));
          continue;
        }

        const span = document.createElement("span");
        span.className = "char";

        span.textContent = ch === " " ? "\u00A0" : ch;

        // 🎨 gradient langsung via style
        span.style.backgroundImage =
          "linear-gradient(120deg,#ff6bcb,#feca57,#54a0ff,#5f27cd,#1dd1a1,#ff9ff3)";
        span.style.backgroundSize = "300% 300%";
        span.style.backgroundPosition = "0% 50%";
        span.style.webkitBackgroundClip = "text";
        span.style.backgroundClip = "text";
        span.style.color = "transparent";
        span.style.webkitTextFillColor = "transparent";

        el.appendChild(span);
      }
    }

    

    const chars = el.querySelectorAll<HTMLSpanElement>(".char");
    if (!chars.length) return;

    const ctx = gsap.context(() => {
      el.classList.add("in-view");

      // ✨ FLOAT + SCRUB (scroll)
      gsap.fromTo(
        chars,
        {
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

      // 🎛️ ANIMASI GRADIENT BOLAK-BALIK (NO JUMP, SUPER SMOOTH)
      gsap.fromTo(
        chars,
        { backgroundPosition: "0% 50%" },
        {
          backgroundPosition: "200% 50%",
          duration: 4,
          ease: "linear",
          repeat: -1,
          yoyo: true, // 🔥 ini membuat animasi bergerak kanan → kiri → kanan … tanpa patah
        }
      );
    }, el);

    return () => ctx.revert();
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <span ref={wrapRef} className={`float-wrapper ${className}`}>
      {children}
    </span>
  );
}
