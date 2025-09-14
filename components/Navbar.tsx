"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Moon, Sun, X } from "lucide-react";

/* -------------------- Config -------------------- */
const NAV = ["BUILDS", "STACK", "STORY", "TALK"] as const;
type NavLabel = (typeof NAV)[number];

const SECTION_ID: Record<NavLabel, string> = {
  BUILDS: "builds",
  STACK: "stack",
  STORY: "story",
  TALK: "talk",
};

const CONTAINER = "max-w-[1600px] mx-auto px-4 sm:px-6";

/* -------------------- Icons -------------------- */
function OutlineGrid9({
  size = 24,
  strokeWidth = 1,
  className = "",
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="2.1" />
      <circle cx="12" cy="6" r="2.1" />
      <circle cx="18" cy="6" r="2.1" />
      <circle cx="6" cy="12" r="2.1" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="18" cy="12" r="2.1" />
      <circle cx="6" cy="18" r="2.1" />
      <circle cx="12" cy="18" r="2.1" />
      <circle cx="18" cy="18" r="2.1" />
    </svg>
  );
}

/* Moon -> Sun + burst */
function IconBurstToggle() {
  const [isSun, setIsSun] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const dots = useMemo(() => Array.from({ length: 10 }), []);
  const rays = useMemo(() => Array.from({ length: 8 }), []);

  const toggle = () => {
    setIsSun((v) => !v);
    setBurstKey((k) => k + 1);
  };

  return (
    <button aria-label="Toggle Icon" onClick={toggle} className="relative w-8 h-8 overflow-visible">
      {/* Moon */}
      <span
        className={`absolute inset-0 grid place-items-center transition-all duration-300 ease-out
        ${isSun ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"}`}
      >
        <Moon size={24} strokeWidth={1} />
      </span>

      {/* Sun */}
      <span
        className={`absolute inset-0 grid place-items-center transition-all duration-300 ease-out
        ${isSun ? "opacity-100 scale-100 rotate-0" : "opacity-0 -rotate-90 scale-50"}`}
      >
        <Sun size={24} strokeWidth={1} />
      </span>

      {/* Burst particles & rays */}
      {isSun && (
        <span key={burstKey} className="burst pointer-events-none absolute inset-0">
          {dots.map((_, i) => (
            <span
              key={`d${i}`}
              className="dot absolute left-1/2 top-1/2 w-[3px] h-[3px] rounded-full bg-[#212121]"
              style={{ "--angle": `${i * 36}deg` } as CSSProperties}
            />
          ))}
          {rays.map((_, i) => (
            <span
              key={`r${i}`}
              className="ray absolute left-1/2 top-1/2 h-[1.5px] w-[10px] bg-[#212121] rounded-full"
              style={{ "--angle": `${i * 45}deg` } as CSSProperties}
            />
          ))}
        </span>
      )}

      <style jsx>{`
        .burst .dot {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
          animation: dot-burst 520ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        @keyframes dot-burst {
          0% { opacity: 0; }
          30% { opacity: 1; }
          60% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-14px) scale(1.05); }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-22px) scale(0.88); opacity: 0; }
        }
        .burst .ray {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
          animation: ray-burst 520ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        @keyframes ray-burst {
          0% { opacity: 0; width: 0; }
          50% { opacity: 1; width: 14px; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-10px); }
          100% { opacity: 0; width: 18px; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-18px); }
        }
      `}</style>
    </button>
  );
}

/* -------------------- Navbar -------------------- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavLabel>("BUILDS");

  const ulRef = useRef<HTMLUListElement | null>(null);
  const liRefs = useRef<Record<NavLabel, HTMLLIElement | null>>({
    BUILDS: null,
    STACK: null,
    STORY: null,
    TALK: null,
  });

  const activeRef = useRef<NavLabel>(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // posisi center indikator (dipakai dengan -translate-x-1/2)
  const [indicatorCenter, setIndicatorCenter] = useState(0);

  /** Hitung posisi indikator tepat di tengah item */
  const moveIndicatorTo = (label: NavLabel) => {
    const ulRect = ulRef.current?.getBoundingClientRect();
    const li = liRefs.current[label];
    const rect = li?.getBoundingClientRect();
    if (!ulRect || !rect) return;
    const center = rect.left - ulRect.left + rect.width / 2;
    setIndicatorCenter(center);
  };

  /* ScrollSpy */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!top) return;
        const id = top.target.id;
        const found = (Object.keys(SECTION_ID) as NavLabel[]).find(
          (k) => SECTION_ID[k] === id
        );
        if (found && found !== activeRef.current) {
          setActive(found);
        }
      },
      { threshold: [0.3, 0.6], rootMargin: "-20% 0px -40% 0px" }
    );

    const els = (Object.values(SECTION_ID) as string[])
      .map((id) => document.getElementById(id))
      .filter(Boolean) as Element[];

    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);

  // Reposisi indikator saat active berubah
  useEffect(() => {
    const raf = requestAnimationFrame(() => moveIndicatorTo(active));
    const onResize = () => moveIndicatorTo(active);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // Reposisi indikator saat menu dibuka/ditutup (handle layout shift awal)
  useEffect(() => {
    if (!open) return;

    const recalc = () => moveIndicatorTo(activeRef.current);

    const raf1 = requestAnimationFrame(recalc);
    const timeout = setTimeout(recalc, 520);

    const el = ulRef.current;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "transform" || e.propertyName === "opacity") recalc();
    };
    el?.addEventListener("transitionend", onEnd);

    let cancelled = false;
    const fontsReady = (document as any).fonts?.ready;
    if (fontsReady?.then) {
      fontsReady.then(() => {
        if (!cancelled && open) recalc();
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(timeout);
      el?.removeEventListener("transitionend", onEnd);
    };
  }, [open]);

  const onClickNav = (label: NavLabel) => {
    const id = SECTION_ID[label];
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });

    // Tutup hanya di mobile
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setOpen(false);
    }
    setActive(label);
    moveIndicatorTo(label);
  };

  return (
    <nav className="sticky top-0 z-50 bg-transparent relative z-10">
      <div className={`${CONTAINER} py-16 flex items-center justify-between`}>
        {/* Logo */}
        <div className="shrink-0">
          <span className="text-[26px] md:text-[28px] font-black tracking-wide select-none">
            <span className="text-[#212121]">VIERRE</span>
            {/* <span className="text-transparent font-black [-webkit-text-stroke:1px_#212121]">BAGUS</span>{" "} */}
            •
          </span>
        </div>

        {/* NAV desktop — muncul saat open, geser halus dari kanan */}
        <div className="hidden md:flex flex-1 justify-center">
          <ul
            ref={ulRef}
            className={`relative flex items-center gap-20 tracking-[0.12em] font-bold
              transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]
              ${open ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-3 pointer-events-none"}`}
          >
            {/* indikator aktif (centered via -translate-x-1/2) */}
            <span
              className={`pointer-events-none absolute top-full mt-2 h-[3px] w-8 bg-[#212121]
              rounded-full shadow-[0_8px_18px_rgba(0,0,0,0.28)] -translate-x-1/2
              transition-[left,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]
              ${open ? "opacity-100" : "opacity-0"}`}
              style={{ left: `${indicatorCenter}px` }}
            />

            {NAV.map((label, i) => {
              const isActive = active === label;
              return (
                <li
                  key={label}
                  ref={(el) => {
                    liRefs.current[label] = el;
                  }}
                  className={`${open ? "animate-slide-soft" : ""} relative select-none`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <button onClick={() => onClickNav(label)} className="relative">
                    <span
                      className={
                        isActive
                          ? "text-[#212121]"
                          : "text-transparent [-webkit-text-stroke:1px_#212121] hover:text-[#212121] transition-colors duration-300"
                      }
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Icons kanan */}
        <div className="shrink-0 flex items-center gap-6">
          <IconBurstToggle />

          {/* Toggle Menu: Grid outline -> X */}
          <button
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative w-12 h-12 overflow-hidden"
          >
            {/* GRID */}
            <span
              className={`absolute inset-0 grid place-items-center transition-all duration-250
              ${open ? "opacity-0 scale-75 rotate-90" : "opacity-100 scale-100 rotate-0"}`}
            >
              <OutlineGrid9 size={48} strokeWidth={1} />
            </span>
            {/* X */}
            <span
              className={`absolute inset-0 grid place-items-center transition-all duration-300
              ${open ? "opacity-100 scale-100 rotate-0" : "opacity-0 -rotate-90 scale-75"}`}
            >
              <X size={48} strokeWidth={1} />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile NAV (dropdown) */}
      <div
        className={`md:hidden overflow-hidden border-t border-[#212121]/10
        transition-[max-height,opacity,transform] duration-400 ease-[cubic-bezier(.22,1,.36,1)]
        ${open ? "max-h-96 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1"}`}
      >
        <div className={`${CONTAINER} px-6 py-6`}>
          <ul className="flex flex-col items-center gap-6">
            {NAV.map((label, i) => {
              const isActive = active === label;
              return (
                <li
                  key={label}
                  className={`${open ? "animate-slide-soft" : ""}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <button onClick={() => onClickNav(label)} className="relative inline-block">
                    <span
                      className={
                        isActive
                          ? "text-2xl font-extrabold text-[#212121]"
                          : "text-2xl font-extrabold text-transparent [-webkit-text-stroke:1px_#212121] hover:text-[#212121] transition-colors duration-300"
                      }
                    >
                      {label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Keyframes: smooth + tiny bounce */}
      <style jsx>{`
        @keyframes slide-soft {
          0%   { transform: translateX(20px); opacity: 0; }
          70%  { transform: translateX(-1.5px); opacity: 1; }
          100% { transform: translateX(0); }
        }
        .animate-slide-soft {
          animation: slide-soft 480ms cubic-bezier(.22,1,.36,1) both;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-soft { animation: none; }
        }
      `}</style>
    </nav>
  );
}
