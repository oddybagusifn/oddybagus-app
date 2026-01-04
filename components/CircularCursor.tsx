"use client";

import { useEffect, useRef, useState } from "react";

export default function CircularCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rotation = useRef(0);

  const [isDesktop, setIsDesktop] = useState(false);

  /* ===============================
     DETECT DESKTOP ONLY
  =============================== */
  useEffect(() => {
    const checkDevice = () => {
      const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
      const isWideScreen = window.innerWidth >= 768;

      setIsDesktop(hasFinePointer && isWideScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  /* ===============================
     CURSOR LOGIC (DESKTOP ONLY)
  =============================== */
  useEffect(() => {
    if (!isDesktop) return;

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", move);

    let rafId: number;

    const animate = () => {
      if (!wrapperRef.current || !svgRef.current) return;

      // smooth follow
      pos.current.x += (mouse.current.x - pos.current.x) * 0.2;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.2;

      // center cursor
      wrapperRef.current.style.transform = `
        translate(${pos.current.x}px, ${pos.current.y}px)
      `;

      // rotate text
      rotation.current += 1;
      svgRef.current.style.transform = `
        translate(-50%, -50%) rotate(${rotation.current}deg)
      `;

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(rafId);
    };
  }, [isDesktop]);

  /* ===============================
     HIDE ON MOBILE
  =============================== */
  if (!isDesktop) return null;

  return (
    <div ref={wrapperRef} className="circular-cursor">
      <svg
        ref={svgRef}
        className="circular-text"
        viewBox="0 0 200 200"
      >
        <defs>
          <path
            id="circlePath"
            d="
              M 100,100
              m -60,0
              a 60,60 0 1,1 120,0
              a 60,60 0 1,1 -120,0
            "
          />
        </defs>

        <text
          fill="white"
          fontSize="20"
          fontWeight="900"
          letterSpacing=".5"
        >
          <textPath href="#circlePath">
            VIERRE • VIERRE • VIERRE • VIERRE •
          </textPath>
        </text>
      </svg>

      <div className="cursor-dot" />
    </div>
  );
}
