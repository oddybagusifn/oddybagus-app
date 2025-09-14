'use client';

import React, { useEffect, useRef, useState } from 'react';

type Range = number | [number, number];

export interface TextTypeProps {
  text: string;

  /** Typing delay per char (ms) — number or [min,max] for human-like jitter */
  typeRange?: Range;          // default [70, 120]
  /** Deleting delay per char (ms) — number or [min,max] */
  deleteRange?: Range;        // default [45, 85]

  /** Pause after text fully typed (ms) */
  pauseTyped?: number;        // default 900
  /** Pause after fully deleted (ms) */
  pauseDeleted?: number;      // default 700

  /** Start typing after this delay (ms) */
  startDelay?: number;        // default 0

  /** If true, will delete after typing */
  erase?: boolean;            // default false
  /** If true, will loop typing/deleting */
  loop?: boolean;             // default false

  /** Show caret | cursor */
  cursor?: boolean;           // default true
  cursorChar?: string;        // default "|"

  className?: string;
}

const randIn = (r: Range, fallback: number) => {
  if (typeof r === 'number') return r;
  if (Array.isArray(r) && r.length === 2) {
    const [min, max] = r;
    return Math.floor(min + Math.random() * Math.max(0, max - min));
  }
  return fallback;
};

type Phase = 'typing' | 'pauseAfterType' | 'deleting' | 'pauseAfterDelete' | 'idle';

const TextType: React.FC<TextTypeProps> = ({
  text,
  typeRange = [70, 120],
  deleteRange = [45, 85],
  pauseTyped = 900,
  pauseDeleted = 700,
  startDelay = 0,
  erase = false,
  loop = false,
  cursor = true,
  cursorChar = '|',
  className = '',
}) => {
  const [started, setStarted] = useState(startDelay === 0);
  const [out, setOut] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');

  const timerRef = useRef<number | null>(null);

  // Start after delay (stable deps -> no warning)
  useEffect(() => {
    if (startDelay === 0) return;
    const id = window.setTimeout(() => setStarted(true), startDelay);
    return () => window.clearTimeout(id);
  }, [startDelay]);

  // Clear any scheduled work on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const schedule = (ms: number, fn: () => void) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(fn, ms);
  };

  useEffect(() => {
    if (!started || phase === 'idle') return;

    // TYPING
    if (phase === 'typing') {
      if (idx < text.length) {
        const delay = randIn(typeRange, 100);
        schedule(delay, () => {
          const next = idx + 1;
          setOut(text.slice(0, next));
          setIdx(next);
          if (next === text.length) {
            if (erase || loop) setPhase('pauseAfterType');
            else setPhase('idle');
          }
        });
      } else {
        // Safety (shouldn’t get here with logic above)
        if (erase || loop) setPhase('pauseAfterType');
        else setPhase('idle');
      }
      return;
    }

    // PAUSE AFTER TYPED
    if (phase === 'pauseAfterType') {
      schedule(pauseTyped, () => {
        if (erase || loop) {
          setPhase('deleting');
        } else {
          setPhase('idle');
        }
      });
      return;
    }

    // DELETING
    if (phase === 'deleting') {
      if (idx > 0) {
        const delay = randIn(deleteRange, 70);
        schedule(delay, () => {
          const next = idx - 1;
          setOut(text.slice(0, next));
          setIdx(next);
          if (next === 0) setPhase('pauseAfterDelete');
        });
      } else {
        setPhase('pauseAfterDelete');
      }
      return;
    }

    // PAUSE AFTER DELETED
    if (phase === 'pauseAfterDelete') {
      schedule(pauseDeleted, () => {
        if (loop) {
          setPhase('typing');
        } else {
          setPhase('idle');
        }
      });
      return;
    }
  }, [
    started,
    phase,
    idx,
    text,
    typeRange,
    deleteRange,
    pauseTyped,
    pauseDeleted,
    erase,
    loop,
  ]);

  return (
    <span className={className}>
      <span aria-live="polite">{out}</span>
      {cursor && (
        <span className="tt-caret inline-block w-[0.6ch] ml-[0.1ch] align-baseline">
          {cursorChar}
        </span>
      )}

      {/* caret blink */}
      <style jsx>{`
        .tt-caret {
          animation: tt-blink 1.05s step-end infinite;
          opacity: 1;
        }
        @keyframes tt-blink {
          0%, 49%   { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

export default TextType;
