"use client";

import { useEffect, useRef, useState } from "react";
import "./PixelCard.css";

class Pixel {
  width: number;
  height: number;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  color: string;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInteger: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number
  ) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    this.isShimmer ? this.shimmer() : (this.size += this.sizeStep);
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;

    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  if (reducedMotion || value <= 0) return 0;
  return Math.min(value, 100) * 0.001;
}

const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#f8fafc,#f1f5f9,#cbd5e1",
    noFocus: false,
  },
  blue: {
    activeColor: "#e0f2fe",
    gap: 10,
    speed: 25,
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    noFocus: false,
  },
  yellow: {
    activeColor: "#fef08a",
    gap: 3,
    speed: 20,
    colors: "#fef08a,#fde047,#eab308",
    noFocus: false,
  },
  pink: {
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true,
  },
};

interface PixelCardProps {
  variant?: keyof typeof VARIANTS;
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  className = "",
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePrevRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const cfg = VARIANTS[variant];
  const finalGap = gap ?? cfg.gap;
  const finalSpeed = speed ?? cfg.speed;
  const finalColors = colors ?? cfg.colors;
  const finalNoFocus = noFocus ?? cfg.noFocus;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const handler = () => setReducedMotion(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    canvasRef.current.width = w;
    canvasRef.current.height = h;

    const colorsArr = finalColors.split(",");
    const pxs: Pixel[] = [];

    for (let x = 0; x < w; x += finalGap) {
      for (let y = 0; y < h; y += finalGap) {
        const color = colorsArr[Math.floor(Math.random() * colorsArr.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotion ? 0 : Math.sqrt(dx * dx + dy * dy);

        pxs.push(
          new Pixel(
            canvasRef.current,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(finalSpeed, reducedMotion),
            delay
          )
        );
      }
    }

    pixelsRef.current = pxs;
  };

  const animate = (method: keyof Pixel) => {
    animationRef.current = requestAnimationFrame(() => animate(method));

    const now = performance.now();
    if (now - timePrevRef.current < 16) return;
    timePrevRef.current = now;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let idle = true;
    for (const p of pixelsRef.current) {
      // @ts-ignore
      p[method]();
      if (!p.isIdle) idle = false;
    }

    if (idle && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const trigger = (m: keyof Pixel) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => animate(m));
  };

  useEffect(() => {
    initPixels();
    const ro = new ResizeObserver(initPixels);
    containerRef.current && ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      animationRef.current && cancelAnimationFrame(animationRef.current);
    };
  }, [finalGap, finalSpeed, finalColors, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      onMouseEnter={() => trigger("appear")}
      onMouseLeave={() => trigger("disappear")}
      onFocus={finalNoFocus ? undefined : () => trigger("appear")}
      onBlur={finalNoFocus ? undefined : () => trigger("disappear")}
      tabIndex={finalNoFocus ? -1 : 0}
    >
      {/* CONTENT */}
      <div className="pixel-content">{children}</div>

      {/* CANVAS OVERLAY */}
      <canvas className="pixel-canvas" ref={canvasRef} />
    </div>
  );
}
