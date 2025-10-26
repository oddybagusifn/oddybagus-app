"use client";

import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Mengembalikan { ref, inView }.
 * - ref: tempelkan ke elemen DOM (div/img/dll)
 * - inView: true hanya sekali ketika elemen pertama kali masuk viewport
 */
export default function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return { ref: ref as RefObject<T>, inView };
}
