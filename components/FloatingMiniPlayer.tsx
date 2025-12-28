// components/FloatingMiniPlayer.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

const GLOBAL_PLAY_EVENT = "trackwave-play";
const PREVIEW_SECONDS = 40;
const OPEN_CLOSE_MS = 520; // lebih halus
const IDLE_AUTO_CLOSE_MS = 30000; // 30 detik

export default function FloatingMiniPlayer() {
  const [visible, setVisible] = useState(false);
  const [animState, setAnimState] = useState<"idle" | "opening" | "open" | "closing">("idle");
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [meta, setMeta] = useState<{ id?: string; title?: string; artist?: string; artwork?: string }>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const rafRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  // refs for precise placement of hide handle (kept)
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const playBtnRef = useRef<HTMLButtonElement | null>(null);
  const hideHandleRef = useRef<HTMLButtonElement | null>(null);
  const [handlePos, setHandlePos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  // volume popover
  const [showVolPopover, setShowVolPopover] = useState(false);
  const volButtonRef = useRef<HTMLButtonElement | null>(null);
  const volPopoverRef = useRef<HTMLDivElement | null>(null);

  // find audio element by id or any playing audio
  function findAudioForId(trackId?: string) {
    if (trackId) {
      const root = document.querySelector<HTMLElement>(`.track-wave-player[data-track-id="${trackId}"]`);
      const a = root?.querySelector<HTMLAudioElement>("audio");
      if (a) return a;
    }
    const audios = Array.from(document.querySelectorAll<HTMLAudioElement>("audio"));
    for (const a of audios) if (!a.paused && a.currentTime > 0) return a;
    return audios[0] ?? null;
  }

  // idle timer helpers
  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };
  const startIdleTimer = () => {
    clearIdleTimer();
    idleTimerRef.current = window.setTimeout(() => {
      // only auto-close if currently open (don't change playing)
      if (animState === "open" || animState === "opening") {
        closeWithAnimation();
      }
      idleTimerRef.current = null;
    }, IDLE_AUTO_CLOSE_MS);
  };

  function attachAudio(a: HTMLAudioElement | null, reveal = false) {
    // cleanup old
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    setAudioEl(a);

    if (!a) {
      // no audio -> hide UI
      clearIdleTimer();
      setVisible(false);
      setAnimState("idle");
      setIsPlaying(false);
      setMeta({});
      setProgress(0);
      setCurrentTime(0);
      return;
    }

    const root = a.closest<HTMLElement>(".track-wave-player");
    const id = root?.dataset.trackId;
    const artwork = root?.querySelector<HTMLImageElement>("img")?.src;
    const artist =
      root?.querySelector<HTMLElement>(".text-sm.uppercase")?.textContent?.trim() ??
      root?.querySelector<HTMLElement>(".text-xs.uppercase")?.textContent?.trim();
    const title =
      root?.querySelector<HTMLElement>(".truncate.text-lg")?.textContent?.trim() ??
      root?.querySelector<HTMLElement>(".truncate.text-sm")?.textContent?.trim();

    setMeta({ id, artwork, artist: artist ?? undefined, title: title ?? undefined });
    setVolume(a.volume ?? 1);
    setIsPlaying(!a.paused);

    const onPlay = () => {
      setIsPlaying(true);
      // buka UI saat ada play
      openWithAnimation();
      // clear idle timer
      clearIdleTimer();
    };
    const onPause = () => {
      setIsPlaying(false);
      // mulai hitung idle -> auto-close setelah 30s
      startIdleTimer();
    };

    const onTime = () => {
      const t = Math.min(a.currentTime, PREVIEW_SECONDS);
      setCurrentTime(t);
      setProgress(PREVIEW_SECONDS > 0 ? t / PREVIEW_SECONDS : 0);

      if (a.currentTime >= PREVIEW_SECONDS) {
        a.pause();
        a.currentTime = 0;
        setIsPlaying(false);
        startIdleTimer();
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      // start auto-close timer when ended/idle
      startIdleTimer();
    };

    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);

    // raf loop for smoother progress updates
    const loop = () => {
      const t = Math.min(a.currentTime, PREVIEW_SECONDS);
      setCurrentTime(t);
      setProgress(PREVIEW_SECONDS > 0 ? t / PREVIEW_SECONDS : 0);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    cleanupRef.current = () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      clearIdleTimer();
    };

    // if the audio is paused at attach, start idle timer (auto close) — but only if UI is visible
    if (a.paused) {
      startIdleTimer();
    } else {
      clearIdleTimer();
    }

    // compute handle placement once player is attached
    requestAnimationFrame(() => computeHandlePos());
  }

  useEffect(() => {
    const onGlobal = (ev: Event) => {
      const ce = ev as CustomEvent<{ id?: string }>;
      const id = ce?.detail?.id;
      const found = findAudioForId(id) ?? findAudioForId();
      if (found) attachAudio(found, false);
    };

    const onNativePlay = (ev: Event) => {
      const target = ev.target as HTMLAudioElement;
      if (target?.tagName === "AUDIO") attachAudio(target, false);
    };

    window.addEventListener(GLOBAL_PLAY_EVENT, onGlobal);
    window.addEventListener("play", onNativePlay, true);

    const initial = findAudioForId();
    if (initial) attachAudio(initial, false);

    return () => {
      window.removeEventListener(GLOBAL_PLAY_EVENT, onGlobal);
      window.removeEventListener("play", onNativePlay, true);
      if (cleanupRef.current) cleanupRef.current();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearIdleTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioEl) return;
    attachAudio(audioEl, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEl]);

  const openWithAnimation = () => {
    if (animState === "open" || animState === "opening") return;
    setVisible(true);
    setAnimState("opening");
    startHandleRAF();
    // smoother: leave longer to complete
    window.setTimeout(() => {
      setAnimState("open");
    }, OPEN_CLOSE_MS);
  };

  const closeWithAnimation = () => {
    if (animState === "idle" || animState === "closing") return;
    setAnimState("closing");
    // do not stop playback when hiding
    window.setTimeout(() => {
      setAnimState("idle");
      setVisible(false);
      stopHandleRAF();
    }, OPEN_CLOSE_MS);
  };

  // togglePlay inside mini player should not retrigger open animation
  const togglePlay = () => {
    if (!audioEl) return;
    if (audioEl.paused) {
      const root = audioEl.closest<HTMLElement>(".track-wave-player");
      window.dispatchEvent(new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: root?.dataset.trackId } }));
      audioEl.play().catch(() => {});
    } else audioEl.pause();
  };

  const playSibling = (dir: "prev" | "next") => {
    if (!audioEl) return;
    const roots = Array.from(document.querySelectorAll<HTMLElement>(".track-wave-player"));
    const idx = roots.findIndex((r) => r.contains(audioEl));
    const target = dir === "next" ? roots[idx + 1] : roots[idx - 1];
    const a = target?.querySelector<HTMLAudioElement>("audio");
    if (!a) return;
    window.dispatchEvent(new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: target.dataset.trackId } }));
    a.play().catch(() => {});
    attachAudio(a, false); // don't reveal animation on sibling play
  };

  const onSeekPct = (pct: number) => {
    if (!audioEl) return;
    const target = Math.max(0, Math.min(1, pct)) * PREVIEW_SECONDS;
    audioEl.currentTime = target;
    setCurrentTime(target);
    setProgress(Math.max(0, Math.min(1, pct)));
  };

  const onVolumeChange = (v: number) => {
    setVolume(v);
    if (audioEl) audioEl.volume = v;
  };

  /* compute handle position precisely centered above play button */
  const computeHandlePos = () => {
    const wrap = wrapperRef.current;
    const playBtn = playBtnRef.current;
    const handle = hideHandleRef.current;
    if (!wrap || !playBtn || !handle) return;

    const wrapRect = wrap.getBoundingClientRect();
    const playRect = playBtn.getBoundingClientRect();

    const playCenterX = playRect.left + playRect.width / 2;
    const playCenterY = playRect.top + playRect.height / 2;

    const left = playCenterX - wrapRect.left;
    const top = playCenterY - wrapRect.top;

    setHandlePos({ left, top });
  };

  // RAF loop while open so position stays accurate (responsive + dynamic)
  const rafLoopRef = useRef<number | null>(null);
  const startHandleRAF = () => {
    if (rafLoopRef.current) return;
    const loop = () => {
      computeHandlePos();
      rafLoopRef.current = requestAnimationFrame(loop);
    };
    rafLoopRef.current = requestAnimationFrame(loop);
  };
  const stopHandleRAF = () => {
    if (rafLoopRef.current) {
      cancelAnimationFrame(rafLoopRef.current);
      rafLoopRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopHandleRAF();
    };
  }, []);

  useEffect(() => {
    const onResize = () => computeHandlePos();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  const HideHandle: React.FC = () => {
    return (
      <button
        ref={hideHandleRef}
        aria-label="Hide player"
        onClick={() => {
          // close with smooth translate down (doesn't stop audio)
          closeWithAnimation();
        }}
        className="fm-hide-handle"
        title="Hide player"
        style={{ left: handlePos.left ? `${handlePos.left}px` : "50%", top: handlePos.top ? `${handlePos.top}px` : "50%" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 12h12" stroke="#ebebeb" strokeWidth={2} strokeLinecap="round" />
        </svg>

        <style jsx>{`
          .fm-hide-handle {
            position: absolute;
            transform: translate(-50%, -220%);
            width: 36px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.0);
            border: 1px solid rgba(255, 255, 255, 0.0);
            cursor: pointer;
            transition: background 0.18s, transform 0.12s;
            z-index: 80;
            pointer-events: auto;
          }
          .fm-hide-handle:active { transform: translate(-50%, -220%) scale(0.98); }
          @media (max-width: 640px) {
            .fm-hide-handle { transform: translate(-50%, -170%); }
            .fm-hide-handle:active { transform: translate(-50%, -170%) scale(0.98); }
          }
        `}</style>
      </button>
    );
  };

  // close popover when clicking outside
  useEffect(() => {
    if (!showVolPopover) return;
    const onDoc = (ev: MouseEvent) => {
      const p = volPopoverRef.current;
      const btn = volButtonRef.current;
      if (!p || !btn) return;
      const target = ev.target as Node;
      if (p.contains(target) || btn.contains(target)) return;
      setShowVolPopover(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [showVolPopover]);

  // If still idle (no UI), render nothing
  if (animState === "idle" && !visible) {
    return null;
  }

  const wrapperClass =
    animState === "opening" ? "fm-inner opening" : animState === "open" ? "fm-inner open" : "fm-inner closing";

  return (
    <div className="fm-wrapper" aria-hidden={animState === "idle"}>
      <div className={wrapperClass} role="dialog" aria-label="Floating mini player" ref={wrapperRef}>
        <HideHandle />

        {/* === GRID LAYOUT: LEFT / CENTER / RIGHT (markup remains) === */}
        <div
          className="fm-player-grid rounded-full border border-white/10 bg-[#0c0c0c] shadow-[0_18px_45px_rgba(0,0,0,0.100)] backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl px-4 sm:px-6 md:px-8 py-3 md:py-4"
          style={{ width: "min(1000px, calc(100% - 48px))" }}
        >
          {/* LEFT */}
          <div className="col-left flex items-center gap-3 min-w-0">
            <div className="h-14 w-14 rounded-sm overflow-hidden bg-[#111] flex-shrink-0">
              {meta.artwork ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.artwork} alt={meta.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#222]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-[10px] text-[#cfcfcf] uppercase tracking-wide truncate">{meta.artist ?? "Unknown"}</div>

              <div className="title-clip relative overflow-hidden" style={{ maxWidth: "220px" }}>
                <div className="title-inner" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                  <div className="text-sm font-semibold text-white inline-block pr-4 truncate-block">{meta.title ?? "Untitled"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-center flex flex-col items-center gap-2">
            <div className="controls flex items-center gap-4">
              <button onClick={() => playSibling("prev")} className="p-1.5 rounded-full hover:bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ebebeb"><path d="M18 6v12l-10-6 10-6z" /></svg>
              </button>

              <button ref={playBtnRef} onClick={togglePlay} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black shadow">
                {isPlaying ? (
                  <svg className="m-1" width="24" height="24" viewBox="0 0 24 24" fill="black"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
                ) : (
                  <svg className="m-1" viewBox="0 0 32 32" aria-hidden><polygon points="11,8 11,24 23,16" fill="black"/></svg>
                )}
              </button>

              <button onClick={() => playSibling("next")} className="p-1.5 rounded-full hover:bg-white/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ebebeb"><path d="M6 6v12l10-6-10-6z" /></svg>
              </button>
            </div>

            <div className="w-full max-w-[720px]" onClick={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const px = (e as React.MouseEvent).clientX - rect.left;
              const pct = Math.max(0, Math.min(1, px / rect.width));
              onSeekPct(pct);
            }}>
              <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div style={{ width: `${progress * 100}%`, background: "#ebebeb" }} className="h-full" />
                <div style={{ position: "absolute", left: `${progress * 100}%`, top: "50%", transform: "translate(-50%, -50%)", width: 6, height: 6, borderRadius: 6, background: "#ebebeb" }} />
              </div>

              <div className="flex justify-between text-[10px] text-[#cfcfcf] mt-0.5">
                <div>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</div>
                <div>{new Date(PREVIEW_SECONDS * 1000).toISOString().substr(14, 5)}</div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-right flex items-center justify-start relative">
            <button
              ref={volButtonRef}
              aria-label="Volume"
              className="vol-btn p-1.5 rounded-full hover:bg-white/6"
              onClick={() => { setShowVolPopover((s) => !s); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ebebeb"><path d="M5 9v6h4l5 4V5L9 9H5z" /></svg>
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="vol-range desktop-only"
              style={{ accentColor: "#ebebeb" }}
              aria-label="Volume slider"
            />

            {showVolPopover && (
              <div ref={volPopoverRef} className="vol-popover" role="dialog" aria-label="Volume control">
                <input
                  type="range"
                  orient="vertical"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => { onVolumeChange(Number(e.target.value)); }}
                  className="vol-range-vertical"
                  aria-label="Mobile volume"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* wrapper and center placement (player centered bottom) */
        .fm-wrapper {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 8px;
          z-index: 60;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .fm-inner {
          transform-origin: center bottom;
          pointer-events: auto;
          display: inline-block;
          width: min(1000px, calc(100% - 48px));
          max-width: 100%;
        }

        /* vertical open/close: smooth translateY with ease-out, no bounce */
        .fm-inner.opening {
          animation: fm-open-vertical ${OPEN_CLOSE_MS}ms cubic-bezier(0.2, 0.9, 0.15, 1) both;
        }
        .fm-inner.open {
          transform: translateY(0);
          opacity: 1;
          transition: transform 260ms cubic-bezier(0.2,0.9,0.15,1), opacity 200ms ease;
        }
        .fm-inner.closing {
          animation: fm-close-vertical ${OPEN_CLOSE_MS}ms cubic-bezier(0.2, 0.9, 0.15, 1) both;
        }

        @keyframes fm-open-vertical {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fm-close-vertical {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(44px); opacity: 0; }
        }

        /* ------------ GRID LAYOUT STYLES (kept) ------------ */
        .fm-player-grid {
          display: grid;
          grid-template-columns: 1.5fr 4fr 1fr;
          align-items: center;
          gap: 12px;
        }
        .col-left { display:flex; align-items:center; min-width:0; }
        .col-center { display:flex; flex-direction:column; align-items:center; }
        .col-right { display:flex; align-items:center; justify-content:flex-start; }

        .vol-range { width: 96px; }
        .desktop-only { display: inline-block; }

        .vol-popover {
          position: absolute;
          right: 0;
          bottom: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          padding: 8px;
          border-radius: 12px;
          background: rgba(12,12,12,0.95);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 28px rgba(0,0,0,0.45);
          z-index: 85;
          transform-origin: center bottom;
          animation: pop-in 180ms cubic-bezier(0.2,0.9,0.2,1);
          pointer-events: auto;
        }
        @keyframes pop-in { from { transform: translateY(8px) scale(0.96); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }

        .vol-range-vertical {
          -webkit-appearance: none;
          appearance: none;
          width: 120px;
          height: 8px;
          transform: rotate(-90deg);
          transform-origin: center;
          background: transparent;
        }
        .vol-range-vertical::-webkit-slider-runnable-track {
          height: 8px;
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
        .vol-range-vertical::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ebebeb;
          margin-top: -2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }

        @media (min-width: 641px) { .vol-popover { display: none; } }
        @media (max-width: 640px) { .desktop-only { display: none; } .vol-btn { display: inline-flex; } }

        /* ensure we can still interact with UI */
        .fm-wrapper { pointer-events: none; }
        .fm-inner, .fm-player-grid, .fm-player-grid * { pointer-events: auto; }
      `}</style>
    </div>
  );
}
