"use client";

import { useEffect, useRef } from "react";

export default function CircularCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const rotation = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", move);

    const animate = () => {
      if (!wrapperRef.current || !svgRef.current) return;

      // smooth follow
      pos.current.x += (mouse.current.x - pos.current.x) * 0.2;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.2;

      // center wrapper exactly on cursor
      wrapperRef.current.style.transform = `
        translate(${pos.current.x}px, ${pos.current.y}px)
      `;

      // rotate text
      rotation.current += 1;
      svgRef.current.style.transform = `
        translate(-50%, -50%) rotate(${rotation.current}deg)
      `;

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener("mousemove", move);
  }, []);

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
