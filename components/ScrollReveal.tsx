"use client";

import React, { useMemo } from "react";
import { useInViewOnce } from "@/hooks/useInViewOnce";

interface Props {
  children: string;
  className?: string;
}

const GRADIENT_WORDS = [
  "Oddy",
  "Bagus",
  "websites",
  "music",
];

export default function ScrollRevealLite({
  children,
  className = "",
}: Props) {
  const { ref, visible } = useInViewOnce<HTMLHeadingElement>();

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) => {
        if (word.trim() === "") return word;

        const cleanWord = word.replace(/[^\w]/g, "");
        const isGradient = GRADIENT_WORDS.includes(cleanWord);

        return (
          <span
            key={i}
            className={`
              inline-block transition-all duration-700 ease-out
              ${
                visible
                  ? "opacity-100 translate-y-0 blur-0"
                  : "opacity-0 translate-y-6 blur-sm"
              }
              ${
                isGradient
                  ? "text-transparent bg-clip-text animate-gradient-x"
                  : ""
              }
            `}
            style={{
              transitionDelay: `${i * 35}ms`,
              backgroundImage: isGradient
                ? "linear-gradient(120deg,#ff6bcb,#54a0ff,#5f27cd,#1dd1a1,#ff9ff3)"
                : undefined,
            }}
          >
            {word}
          </span>
        );
      }),
    [children, visible]
  );

  return (
    <h2
      ref={ref}
      className={`
        leading-[1.4]
        text-[clamp(1.6rem,4vw,3rem)]
        font-semibold
        ${className}
      `}
    >
      {words}
    </h2>
  );
}
