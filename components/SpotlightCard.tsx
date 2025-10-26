"use client";

import React, { HTMLAttributes, useRef } from "react";
import clsx from "clsx";

type Props = {
  spotlightColor?: string;
} & HTMLAttributes<HTMLDivElement>;

export default function SpotlightCard({
  className,
  children,
  spotlightColor = "rgba(230,230,230,.25)",
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--sx", `${x}px`);
    el.style.setProperty("--sy", `${y}px`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--sx", `-1000px`);
    el.style.setProperty("--sy", `-1000px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={clsx("relative overflow-hidden", className)}
      style={
        {
          // @ts-ignore
          "--spot": spotlightColor,
          "--sx": "-1000px",
          "--sy": "-1000px",
        } as React.CSSProperties
      }
      {...rest}
    >
      {/* Spotlight layer */}
      <span className="pointer-events-none absolute inset-0">
        <span className="absolute -inset-24 opacity-0 transition-opacity duration-300 group-hover:opacity-70"
          style={{
            background:
              "radial-gradient(220px 220px at var(--sx) var(--sy), var(--spot), transparent 60%)",
          }}
        />
      </span>
      {children}
    </div>
  );
}
