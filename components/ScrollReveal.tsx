"use client";

import React, { useMemo } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";

interface Props {
  children: string;
  className?: string;
}

export default function ScrollRevealLite({ children, className = "" }: Props) {
  const { ref, visible } = useInViewOnce<HTMLHeadingElement>();

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) =>
        word.trim() === "" ? (
          word
        ) : (
          <span
            key={i}
            className={`inline-block transition-all duration-700 ease-out
              ${
                visible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-6 blur-sm"
              }`}
            style={{ transitionDelay: `${i * 35}ms` }}
          >
            {word}
          </span>
        )
      ),
    [children, visible]
  );

  return (
    <h2
      ref={ref}
      className={`leading-[1.4] text-[clamp(1.6rem,4vw,3rem)] font-semibold ${className}`}
    >
      {words}
    </h2>
  );
}
