// components/BuildsSection.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

type Project = {
  id: string;
  title: string;
  tag?: string;
  cover: string;
  href?: string;
};

interface BuildsSectionProps {
  projects: Project[];
}

export default function BuildsSection({ projects }: BuildsSectionProps) {
  const [active, setActive] = useState(0);
  const popKey = useMemo(
    () => `${projects[active]?.id}-${active}`,
    [active, projects]
  );
  const safe = (i: number) =>
    Math.min(Math.max(i, 0), Math.max(projects.length - 1, 0));

  return (
    <section id="builds" className="px-4 sm:px-6">
      <div className="mx-auto max-w-[1600px] py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Preview kiri */}
        <div className="lg:col-span-6">
          <div className="preview relative rounded-[28px] overflow-hidden bg-[#e6e6e6] aspect-[16/10] sm:aspect-[4/3]">
            {projects.map((p, i) => {
              const on = i === active;
              return (
                <img
                  key={`${p.id}-${i}`}
                  src={p.cover}
                  alt={p.title}
                  className={[
                    "absolute inset-0 h-full w-full object-cover transition-all duration-600 ease-[cubic-bezier(.22,1,.36,1)]",
                    on ? "opacity-100 scale-100 animate-img-pop" : "opacity-0 scale-[.975]",
                  ].join(" ")}
                />
              );
            })}
            {/* bubble glow pop ketika aktif berganti */}
            <span key={popKey} className="pointer-events-none absolute inset-0 animate-pop-bubble" />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-between text-xs sm:text-sm text-[#212121]/80">
              <span className="font-medium">{projects[active]?.title}</span>
              {projects[active]?.tag ? <span>{projects[active]?.tag}</span> : null}
            </div>
          </div>
        </div>

        {/* List kanan */}
        <div className="lg:col-span-6">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-[.12em] text-[#212121]">
              WORK
            </h3>
            <span className="text-[#212121]/50 text-sm">{projects.length}</span>
          </div>

          {/* NOTE: class "list" dipakai untuk atur gap kiri-kanan border */}
          <ul className="list">
            {projects.map((p, i) => {
              const on = i === active;
              return (
                <li
                  key={p.id}
                  className={[
                    "row group relative overflow-hidden",
                    "transition-transform duration-450 ease-[cubic-bezier(.22,1,.36,1)]",
                    on ? "row-active" : "",
                  ].join(" ")}
                  onMouseMove={(e) => {
                    const t = e.currentTarget as HTMLLIElement;
                    const r = t.getBoundingClientRect();
                    t.style.setProperty(
                      "--mx",
                      `${((e.clientX - r.left) / r.width) * 100}%`
                    );
                    t.style.setProperty(
                      "--my",
                      `${((e.clientY - r.top) / r.height) * 100}%`
                    );
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(safe(i))}
                    onFocus={() => setActive(safe(i))}
                    onTouchStart={() => setActive(safe(i))}
                    onClick={() => setActive(safe(i))}
                    className="row-inner w-full flex items-center justify-between gap-4 py-5 px-4 sm:px-5 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <ArrowRight
                        size={18}
                        className={[
                          "arrow shrink-0 transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
                          on ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "title leading-none transition-colors duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
                          on ? "text-[color:var(--bg)]" : "text-[#212121]/85",
                        ].join(" ")}
                      >
                        {p.title}
                      </span>
                    </span>

                    <span
                      className={[
                        "tag text-xs sm:text-sm transition-colors duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
                        on ? "text-[color:var(--bg)]/75" : "text-[#212121]/55",
                      ].join(" ")}
                    >
                      {p.tag ?? ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* THEME + ANIMASI + BORDER INSET */}
      <style jsx>{`
        :root { --ink: #212121; --bg: #e6e6e6; }

        /* ====== LIST: border punya gap kiri-kanan ====== */
        .list { --gapX: 14px; }
        @media (min-width: 768px) { .list { --gapX: 18px; } }

        .row {
          background: transparent;
          transform-origin: center;
          will-change: background-color, transform, box-shadow;
        }
        /* garis atas baris pertama */
        .row:first-child::before {
          content: "";
          position: absolute;
          left: var(--gapX);
          right: var(--gapX);
          top: 0;
          height: 1px;
          background: rgba(33, 33, 33, 0.2);
          pointer-events: none;
        }
        /* garis bawah setiap baris */
        .row::after {
          content: "";
          position: absolute;
          left: var(--gapX);
          right: var(--gapX);
          bottom: 0;
          height: 1px;
          background: rgba(33, 33, 33, 0.2);
          transition: background 380ms cubic-bezier(.22,1,.36,1);
          pointer-events: none;
        }

        /* ====== HOVER/ACTIVE: bg #212121 + zoom + text ke #e6e6e6 ====== */
        .row:hover,
        .row:focus-within,
        .row.row-active {
          background: var(--ink);
          transform: scale(1.015);
          box-shadow: 0 12px 28px rgba(33, 33, 33, 0.18);
        }
        .row:hover::after,
        .row:focus-within::after,
        .row.row-active::after {
          background: rgba(230, 230, 230, 0.18);
        }

        .arrow { color: #212121; }
        .row:hover .arrow,
        .row:focus-within .arrow,
        .row.row-active .arrow {
          color: var(--bg);
          opacity: 1;
          transform: translateX(0);
        }
        .row:hover .title,
        .row:focus-within .title,
        .row.row-active .title,
        .row:hover .tag,
        .row:focus-within .tag,
        .row.row-active .tag {
          color: var(--bg);
        }

        /* spotlight mengikuti kursor di atas bg gelap */
        .row-inner { position: relative; z-index: 1; }
        .row::marker { display: none; }
        .row::selection { background: transparent; }
        .row > .row-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              160px 160px at var(--mx, 50%) var(--my, 50%),
              rgba(230,230,230,0.10),
              transparent 60%
            );
          opacity: 0;
          transform: scale(0.94);
          transition:
            opacity 380ms cubic-bezier(.22,1,.36,1),
            transform 380ms cubic-bezier(.22,1,.36,1);
          pointer-events: none;
          z-index: -1;
        }
        .row:hover > .row-inner::after,
        .row.row-active > .row-inner::after {
          opacity: 1;
          transform: scale(1);
        }

        /* preview glow + pop image (tetap) */
        .preview::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(60% 60% at 70% 30%, rgba(33,33,33,.06), transparent 60%);
          opacity: 0.65;
          filter: blur(28px);
          pointer-events: none;
        }
        @keyframes img-pop {
          0% { opacity: 0; transform: scale(0.965) translateY(6px); filter: drop-shadow(0 10px 20px rgba(33,33,33,.12)); }
          60% { opacity: 1; transform: scale(1.02); filter: drop-shadow(0 24px 48px rgba(33,33,33,.16)); }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 20px 40px rgba(33,33,33,.14)); }
        }
        .animate-img-pop { animation: img-pop 580ms cubic-bezier(.22,1,.36,1); }

        @keyframes pop-bubble {
          0% { opacity: 0; background:
            radial-gradient(180px 180px at 60% 40%, rgba(33,33,33,.18), transparent 60%),
            radial-gradient(220px 220px at 30% 70%, rgba(33,33,33,.10), transparent 60%); }
          60% { opacity: .85; }
          100% { opacity: 0; background:
            radial-gradient(260px 260px at 60% 40%, rgba(33,33,33,.00), transparent 70%),
            radial-gradient(320px 320px at 30% 70%, rgba(33,33,33,.00), transparent 70%); }
        }
        .animate-pop-bubble { animation: pop-bubble 680ms cubic-bezier(.22,1,.36,1); }
      `}</style>
    </section>
  );
}
