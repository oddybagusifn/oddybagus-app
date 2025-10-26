"use client";

import { useEffect, useRef } from "react";

export default function CursorVierre() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return; // guard for React StrictMode double-mount
    mounted.current = true;

    const html = document.documentElement;
    html.classList.add("has-vierre-dot");

    const el = dotRef.current!;
    // place offscreen until first move
    el.style.setProperty("--vx", "-9999px");
    el.style.setProperty("--vy", "-9999px");
    el.style.opacity = "0";

    const move = (e: MouseEvent) => {
      el.style.setProperty("--vx", `${e.clientX}px`);
      el.style.setProperty("--vy", `${e.clientY}px`);
      el.style.opacity = "1";
    };
    const down = () => el.classList.add("is-down");
    const up = () => el.classList.remove("is-down");
    const leave = () => (el.style.opacity = "0");
    const enter = () => (el.style.opacity = "1");

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseenter", enter);
      html.classList.remove("has-vierre-dot");
    };
  }, []);

  return <div ref={dotRef} className="vierre-dot" aria-hidden="true" />;
}
