// components/ScrollFloat.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

// ---- Props dasar (tanpa bergantung ke JSX.IntrinsicElements)
type BaseProps = {
  /** Teks yang dianimasikan (harus string agar bisa di-split per karakter) */
  children: string;

  /** Tag elemen yang ingin dirender (p/h1/h2/h3/h4/span/div/...) */
  as?: ElementType;

  /** Kelas untuk elemen container (tag yang dipilih lewat `as`) */
  containerClassName?: string;

  /** Kelas untuk <span> pembungkus karakter */
  textClassName?: string;

  /** Opsi animasi */
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
};

/** Gabungkan props dasar + semua props HTML tag `as` */
type PolymorphicProps<T extends ElementType> =
  BaseProps & Omit<ComponentPropsWithoutRef<T>, keyof BaseProps>;

export default function ScrollFloat<T extends ElementType = "h2">({
  children,
  as,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50%",
  scrollEnd = "bottom bottom-=40%",
  stagger = 0.03,
  ...rest
}: PolymorphicProps<T>) {
  const Element = (as ?? "h2") as ElementType; // default h2
  const containerRef = useRef<HTMLElement | null>(null);

  // Split per karakter
  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split("").map((char, i) => (
      <span className="char" key={i}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  // Animasi
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");

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

    return () => {
      // bersihkan trigger yang terkait elemen ini
      ScrollTrigger.getAll().forEach((t) => {
        if ((t as any).vars?.trigger === el) t.kill();
      });
    };
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <Element
      ref={containerRef as any}
      className={`scroll-float ${containerClassName}`}
      {...(rest as any)}
    >
      <span className={`scroll-float-text ${textClassName}`}>{splitText}</span>
    </Element>
  );
}
