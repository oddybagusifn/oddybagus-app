"use client";

import React, { useEffect, useRef, useState } from "react";

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  className?: string;
  minFontSize?: number;
  inline?: boolean;

  // variable-font controls
  wghtMin?: number;
  wghtMax?: number;
  wdthMin?: number;
  wdthMax?: number;
  italMax?: number;
}

const TextPressure: React.FC<TextPressureProps> = ({
  text = "Compressa",
  fontFamily = "Compressa VF",
  fontUrl = "https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#FFFFFF",
  strokeColor = "#FF0000",
  className = "",
  minFontSize = 24,
  inline = false,

  // defaults so it isn't too thin/narrow
  wghtMin = 520,
  wghtMax = 900,
  wdthMin = 90,
  wdthMax = 200,
  italMax = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLElement | null>(null);
  const spansRef = useRef<Array<HTMLSpanElement | null>>([]);

  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split("");

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(b.x - a.x, b.y - a.y);

  // keep refs array sized (avoids undefined indexes)
  useEffect(() => {
    if (spansRef.current.length !== chars.length) {
      spansRef.current = Array(chars.length).fill(null);
    }
  }, [chars.length]);

  // fit (non-inline)
  const setSize = () => {
    if (inline) return;
    if (!containerRef.current || !titleRef.current) return;

    const { width: w, height: h } = containerRef.current.getBoundingClientRect();
    let newSize = w / (chars.length / 2);
    newSize = Math.max(newSize, minFontSize);

    setFontSize(newSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const r = titleRef.current.getBoundingClientRect();
      if (scale && r.height > 0) {
        const yRatio = h / r.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  };

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
    };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: false });

    if (containerRef.current) {
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      mouseRef.current.x = left + width / 2;
      mouseRef.current.y = top + height / 2;
      cursorRef.current.x = mouseRef.current.x;
      cursorRef.current.y = mouseRef.current.y;
    }

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  useEffect(() => {
    setSize();
    if (!inline) {
      window.addEventListener("resize", setSize);
      return () => window.removeEventListener("resize", setSize);
    }
  }, [scale, text, inline]);

  // animate variable font axes by distance to eased pointer
  useEffect(() => {
    let raf: number;
    const tick = () => {
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        const maxDist = Math.max(80, rect.width / 2);

        const getAttr = (d: number, min: number, max: number) => {
          const val = max - Math.abs((max * d) / maxDist);
          return Math.max(min, val + min);
        };

        spansRef.current.forEach((span) => {
          if (!span) return;
          const s = span.getBoundingClientRect();
          const center = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
          const d = dist(mouseRef.current, center);

          const wdth = width ? Math.floor(getAttr(d, wdthMin, wdthMax)) : wdthMin;
          const wght = weight ? Math.floor(getAttr(d, wghtMin, wghtMax)) : wghtMin;
          const ital = italic ? getAttr(d, 0, italMax).toFixed(2) : "0";
          const a = alpha ? getAttr(d, 0, 1).toFixed(2) : "1";

          span.style.opacity = a;
          span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
        });
      }

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [
    inline,
    width,
    weight,
    italic,
    alpha,
    wdthMin,
    wdthMax,
    wghtMin,
    wghtMax,
    italMax,
  ]);

  const TitleTag: React.ElementType = inline ? "span" : "h1";

  const dyn = [
    className,
    flex && !inline ? "flex" : "",
    stroke ? "stroke" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={containerRef}
      style={{
        position: inline ? "static" : "relative",
        display: inline ? "inline-block" : "block",
        width: inline ? "auto" : "100%",
        height: inline ? "1em" : "100%",
        background: "transparent",
        verticalAlign: "baseline",
      }}
    >
      <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
        .flex { display:flex; justify-content:space-between; }
        .stroke span{ position:relative; color:${textColor}; }
        .stroke span::after{
          content: attr(data-char);
          position:absolute; left:0; top:0;
          color:transparent; z-index:-1;
          -webkit-text-stroke-width:3px;
          -webkit-text-stroke-color:${strokeColor};
        }
        .text-pressure-title{ color:${textColor}; }
      `}</style>

      <TitleTag
        ref={titleRef as React.Ref<any>}
        className={`text-pressure-title ${dyn}`}
        style={{
          fontFamily,
          textTransform: "uppercase",
          fontSize: inline ? "1em" : fontSize,
          lineHeight: inline ? 1 : lineHeight,
          transform: inline ? "none" : `scale(1, ${scaleY})`,
          transformOrigin: inline ? "left bottom" : "center top",
          margin: 0,
          textAlign: inline ? "left" : "center",
          userSelect: "none",
          whiteSpace: "nowrap",
          fontWeight: 100,
          width: inline ? "auto" : "100%",
          display: inline ? "inline-block" : "block",
          verticalAlign: "baseline",
        }}
      >
        {chars.map((c, i) => (
          <span
            key={i}
            ref={(el: HTMLSpanElement | null) => {
              spansRef.current[i] = el; // <-- no return value
            }}
            data-char={c}
            style={{
              display: "inline-block",
              color: stroke ? undefined : textColor,
            }}
          >
            {c}
          </span>
        ))}
      </TitleTag>
    </div>
  );
};

export default TextPressure;
