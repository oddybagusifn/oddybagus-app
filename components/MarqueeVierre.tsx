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
      className="marquee-full select-none"
      aria-hidden="true"
      style={
        {
          // @ts-ignore custom CSS vars
          "--duration": `${duration}s`,
          "--gap": gap,
        } as React.CSSProperties
      }
    >
      <div className="track">
        <div className="inner">
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
        /* -------- full-bleed container (edge-to-edge) -------- */
        .marquee-full {
          position: relative;
          width: 100vw;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          background: transparent;
        }

        /* -------- track: moving text (left -> -50%) to repeat) -------- */
        .track {
          display: flex;
          width: max-content;
          transform: translate3d(0, 0, 0);
          animation: marquee var(--duration) linear infinite;
          will-change: transform;
          transition: animation-play-state 240ms ease;
        }

        /* pause on hover (smooth) */
        .marquee-full:hover .track {
          animation-play-state: paused;
        }

        .inner {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          gap: var(--gap);
          padding: 16px 0;
        }

        .word {
          line-height: 1;
          letter-spacing: 0.02em;
          font-size: clamp(28px, 5vw, 72px);
          text-transform: uppercase;
          font-family: "Bebas Neue", "Bebas", sans-serif;
          font-weight: 400;

          /* ★ text gradient using provided palette */
          background-image: linear-gradient(
            90deg,
            #ff6bcb,
            #feca57,
            #54a0ff,
            #5f27cd,
            #1dd1a1,
            #ff9ff3
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;

          /* animate gradient ping-pong L<->R (smooth) */
          animation: gradient-flow 6s ease-in-out infinite alternate;
        }

        /* slightly stagger words visually by very small translateZ to avoid weird aliasing */
        .inner .word:nth-child(odd) {
          transform: translateZ(0);
        }

        /* marquee animation (move left until half the full sequence so second inner continues) */
        @keyframes marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        /* gradient ping-pong (left->right->left) */
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        /* accessibility: respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .track {
            animation: none;
          }
          .word {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
