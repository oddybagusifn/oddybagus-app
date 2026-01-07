"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Moon, Sun, X } from "lucide-react";

const NAV = ["BUILDS", "STACK", "CONTACT"] as const;
type NavLabel = (typeof NAV)[number];

const SECTION_ID: Record<NavLabel, string> = {
  BUILDS: "builds",
  STACK: "stack",
  CONTACT: "contact",
};

const CONTAINER = "max-w-[1600px] mx-auto";

type AngleStyle = CSSProperties & { ["--angle"]?: string };

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
    <button
      aria-label="Toggle Icon"
      onClick={toggle}
      className="relative w-8 h-8 overflow-visible"
    >
      <style jsx>{`
        .burst .dot {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
          animation: dot-burst 520ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        @keyframes dot-burst {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          60% {
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateY(-14px) scale(1.05);
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateY(-22px) scale(0.88);
            opacity: 0;
          }
        }
        .burst .ray {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0);
          animation: ray-burst 520ms cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }
        @keyframes ray-burst {
          0% {
            opacity: 0;
            width: 0;
          }
          50% {
            opacity: 1;
            width: 14px;
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateY(-10px);
          }
          100% {
            opacity: 0;
            width: 18px;
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateY(-18px);
          }
        }
      `}</style>
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavLabel>("BUILDS");
  const isManualNav = useRef(false);

  const isProgrammaticScroll = useRef(false);


  const ulRef = useRef<HTMLUListElement | null>(null);
  const liRefs = useRef<Record<NavLabel, HTMLLIElement | null>>({
    BUILDS: null,
    STACK: null,
    CONTACT: null,
  });

  const activeRef = useRef<NavLabel>(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const [indicatorCenter, setIndicatorCenter] = useState(0);

  const moveIndicatorTo = (label: NavLabel) => {
    const ulRect = ulRef.current?.getBoundingClientRect();
    const li = liRefs.current[label];
    const rect = li?.getBoundingClientRect();
    if (!ulRect || !rect) return;
    const center = rect.left - ulRect.left + rect.width / 2;
    setIndicatorCenter(center);
  };


  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        // 🔒 abaikan observer hanya saat scroll dari klik nav
        if (isProgrammaticScroll.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = (visible.target as HTMLElement).id;
        const found = (Object.keys(SECTION_ID) as NavLabel[]).find(
          (k) => SECTION_ID[k] === id
        );

        if (found && found !== activeRef.current) {
          setActive(found);
          moveIndicatorTo(found);
        }
      },
      {
        threshold: [0.35, 0.6],
        rootMargin: "-25% 0px -45% 0px",
      }
    );

    const els = Object.values(SECTION_ID)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as Element[];

    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);


  useEffect(() => {
    const raf = requestAnimationFrame(() => moveIndicatorTo(active));
    const onResize = () => moveIndicatorTo(active);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  const onClickNav = (label: NavLabel) => {
    const el = document.getElementById(SECTION_ID[label]);
    if (!el) return;

    // 🔒 lock observer
    isProgrammaticScroll.current = true;

    setActive(label);
    moveIndicatorTo(label);

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // 🔓 unlock setelah scroll selesai
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  };




  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-transparent pointer-events-none">
      {/* wrapper untuk center + padding top */}
      <div className="px-4 sm:px-6 pt-4 md:pt-6">
        <div className={`${CONTAINER} pointer-events-auto`}>
          {/* CAPSULE NAV */}
          <div
            className={`
    flex items-center justify-between
    rounded-full
    border border-white/20
    bg-white/10
    shadow-[0_18px_45px_rgba(0,0,0,0.55)]
    backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl
    px-4 sm:px-6 md:px-8
    py-3 md:py-4
  `}
          >
            {/* Logo */}
            <div className="shrink-0">
              <span className="text-[26px] md:text-[28px] font-black tracking-wide select-none">
                <span className="text-[#ebebeb]">VIERRE</span>•
              </span>
            </div>

            {/* NAV desktop */}
            <div className="hidden md:flex flex-1 justify-center">
              <ul
                ref={ulRef}
                className={`relative flex items-center gap-20 tracking-[0.12em] font-bold
                transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]
                ${open
                    ? "opacity-100 translate-x-0 pointer-events-auto"
                    : "opacity-0 translate-x-3 pointer-events-none"
                  }`}
              >
                <span
                  className={`pointer-events-none absolute top-full mt-2 h-[3px] w-5
    rounded-full shadow-[0_8px_18px_rgba(0,0,0,0.28)] -translate-x-1/2
    transition-[left,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]
    indicator-gradient
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
                      className={`${open ? "animate-slide-soft" : ""
                        } relative select-none`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <button
                        onClick={() => onClickNav(label)}
                        className="relative"
                      >
                        <span
                          className={
                            isActive
                              ? "text-gradient-animated"
                              : "text-transparent [-webkit-text-stroke:0.5px_#ebebeb] hover:text-[#ebebeb] transition-colors duration-300"
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
            <div className="shrink-0 flex items-center gap-6 text-[#ebebeb]">
              <IconBurstToggle />
              <button
                aria-label="Menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="relative w-12 h-12 overflow-hidden"
              >
                <span
                  className={`absolute inset-0 grid place-items-center transition-all duration-300
                ${open
                      ? "opacity-0 scale-75 rotate-90"
                      : "opacity-100 scale-100 rotate-0"
                    }`}
                >
                  <OutlineGrid9 size={48} strokeWidth={1} />
                </span>
                <span
                  className={`absolute inset-0 grid place-items-center transition-all duration-300
                ${open
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 -rotate-90 scale-75"
                    }`}
                >
                  <X size={48} strokeWidth={1} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Mobile NAV fullscreen overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40
  bg-[rgba(230,230,230,0)]
  backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl
  transition-[opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]
  ${open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div
          className={`${CONTAINER} h-full px-6
  flex items-center justify-center`}
        >
          <ul className="flex flex-col items-center gap-6">
            {NAV.map((label, i) => {
              const isActive = active === label;
              return (
                <li
                  key={label}
                  className={`${open ? "animate-slide-soft" : ""}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <button
                    onClick={() => onClickNav(label)}
                    className="relative inline-block"
                  >
                    <span
                      className={
                        isActive
                          ? "text-[28px] font-extrabold text-gradient-animated"
                          : "text-[28px] font-extrabold text-transparent [-webkit-text-stroke:1px_#ebebeb] hover:text-[#ebebeb] transition-colors duration-300"
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

      <style jsx>{`
  @keyframes gradient-flow {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* ✅ TEXT GRADIENT */
  .text-gradient-animated {
    background-image: linear-gradient(
      120deg,
      #ff6bcb,#54a0ff,#5f27cd,#1dd1a1,#ff9ff3
    );
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: gradient-flow 4s ease-in-out infinite;
  }

  /* ✅ UNDERLINE / INDICATOR GRADIENT */
  .indicator-gradient {
    background-image: linear-gradient(
      120deg,
      #ff6bcb,#54a0ff,#5f27cd,#1dd1a1,#ff9ff3
    );
    background-size: 300% 300%;
    animation: gradient-flow 4s ease-in-out infinite;
  }
`}</style>

    </nav>
  );
}


