"use client";

import React from "react";

export default function MarqueeVierre({
  text = "VIERRE.",
  repeat = 18,
  duration = 22,
  gap = "",
}: {
  text?: string;
  repeat?: number;
  duration?: number;
  gap?: string;
}) {
  const items = Array.from({ length: repeat }, () => text);

  return (
    <section
      className="marquee group select-none"
      aria-hidden="true"
      style={
        {
          // @ts-ignore custom CSS vars
          "--duration": `${duration}s`,
          "--gap": gap,
        } as React.CSSProperties
      }
    >
      <div
        className="track font-bebas"
        style={{ fontFamily: '"Bebas Neue", sans-serif', fontWeight: 400 }}
      >
        <div className="inner" aria-hidden={false}>
          {items.map((t, i) => (
            <span key={`c1-${i}`} className="word">
              {t}
            </span>
          ))}
        </div>
        <div className="inner" aria-hidden>
          {items.map((t, i) => (
            <span key={`c2-${i}`} className="word">
              {t}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          background: transparent;
          border-top: 1px solid rgba(33, 33, 33, 0.08);
          border-bottom: 1px solid rgba(33, 33, 33, 0.08);
        }

        .track {
          display: flex;
          width: max-content;
          transform: translate3d(0, 0, 0);
          animation: marquee var(--duration) linear infinite;
          will-change: transform;
        }

        .group:hover .track {
          animation-play-state: paused;
        }

        .inner {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          gap: var(--gap);
          padding: 14px 0;
          padding-right: var(--gap);
          color: #212121;
        }

        .word {
          line-height: 1;
          letter-spacing: 0.02em;
          font-size: clamp(28px, 5vw, 72px);
          text-transform: uppercase;
        }

        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
