// components/TrackWavePlayer.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BAR_COUNT = 220;
const MAX_HEIGHT = 0.9;
const GLOBAL_PLAY_EVENT = "trackwave-play";

// register plugin only on client and guard for safety
if (typeof window !== "undefined") {
  try {
    // wrap in try/catch in case something odd happens during module init
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    // ignore - safe fallback if register fails briefly
    // console.warn("GSAP registerPlugin failed:", e);
  }
}

export type Track = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  artworkUrl: string;
  waveformUrl?: string;
  lengthSeconds?: number;
  genre?: string;
};

interface TrackWavePlayerProps {
  track: Track;
  previewSeconds?: number; // durasi demo
}

export default function TrackWavePlayer({
  track,
  previewSeconds = 40,
}: TrackWavePlayerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [bufferDuration, setBufferDuration] = useState<number | null>(null);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [isLoadingWave, setIsLoadingWave] = useState(false);

  // track whether we're currently fading to avoid duplicate fades
  const isFadingRef = useRef(false);

  /* ------------ Build PEAKS sekali (hanya 0–previewSeconds) ----------- */
  useEffect(() => {
    let cancelled = false;

    async function buildPeaks() {
      try {
        setIsLoadingWave(true);
        setPeaks(null);

        const res = await fetch(track.audioUrl);
        const arrayBuffer = await res.arrayBuffer();

        const AudioCtx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();

        const decoded = await audioCtx.decodeAudioData(arrayBuffer);
        const channelData = decoded.getChannelData(0);

        // hanya ambil bagian 0–previewSeconds
        const previewRatio = Math.min(
          1,
          previewSeconds / (decoded.duration || previewSeconds)
        );
        const effectiveLength = Math.floor(channelData.length * previewRatio);

        const samplesPerBar = Math.floor(effectiveLength / BAR_COUNT) || 1;
        const nextPeaks: number[] = [];

        for (let i = 0; i < BAR_COUNT; i++) {
          const start = i * samplesPerBar;
          if (start >= effectiveLength) {
            nextPeaks.push(0);
            continue;
          }
          const end = Math.min(start + samplesPerBar, effectiveLength);
          let max = 0;
          for (let j = start; j < end; j++) {
            const v = Math.abs(channelData[j]);
            if (v > max) max = v;
          }
          nextPeaks.push(max * MAX_HEIGHT);
        }

        audioCtx.close();

        if (!cancelled) {
          setPeaks(nextPeaks);
          setBufferDuration(decoded.duration);
        }
      } catch (err) {
        console.error("Waveform build failed:", err);
      } finally {
        if (!cancelled) setIsLoadingWave(false);
      }
    }

    buildPeaks();
    return () => {
      cancelled = true;
    };
  }, [track.audioUrl, previewSeconds]);

  /* ------------ Audio event (time & limit preview) ----------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration || 0);

    const onTimeUpdate = () => {
      if (!audio.duration) return;

      // Stop di batas previewSeconds
      if (audio.currentTime >= previewSeconds) {
        // ensure fade state is reset for next play
        isFadingRef.current = false;
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setDisplayTime(0);
        // trigger auto-next saat preview selesai
        handleAutoNext();
        return;
      }

      setDisplayTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setDisplayTime(0);
      // lanjut ke next saat lagu benar-benar ended
      handleAutoNext();
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    // sync play/pause state
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewSeconds]);

  /* ------------ Auto-next logic (internal) ----------- */
  const handleAutoNext = () => {
    try {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(".track-wave-player")
      );
      if (!nodes.length) return;

      const idx = nodes.findIndex((n) => n.dataset.trackId === String(track.id));
      if (idx === -1) return;

      const next = nodes[idx + 1];
      if (!next) return;

      const nextAudio = next.querySelector<HTMLAudioElement>("audio");
      if (!nextAudio) return;

      // dispatch event to stop others, and identify next
      window.dispatchEvent(
        new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: next.dataset.trackId } })
      );

      // try to play next (its component listens to 'play' and will set its isPlaying)
      nextAudio
        .play()
        .then(() => {
          // success
        })
        .catch(() => {
          // autoplay blocked: ignore
        });
    } catch (e) {
      // silent
    }
  };

  /* ------------ Fade-out near end (gentle volume fade) ----------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isFadingRef.current = false;

    const handleTimeUpdate = () => {
      // we base fade on previewSeconds (user requested demo length)
      const visualEnd = Math.min(previewSeconds, audio.duration || previewSeconds);
      const remaining = visualEnd - audio.currentTime;

      // If we are within last 2 seconds of the preview window, fade out
      if (remaining <= 2 && remaining > 0 && !isFadingRef.current) {
        isFadingRef.current = true;
        const startVol = audio.volume ?? 1;
        const fadeDuration = Math.min(2000, Math.max(400, remaining * 1000)); // ms
        const steps = 20;
        const stepTime = fadeDuration / steps;
        let currentStep = 0;

        const fadeInterval = window.setInterval(() => {
          currentStep++;
          const pct = Math.max(0, 1 - currentStep / steps);
          audio.volume = startVol * pct;
          if (currentStep >= steps) {
            clearInterval(fadeInterval);
            audio.volume = startVol; // restore original volume for next playback
            // pause & reset (we want consistent behavior)
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            setDisplayTime(0);
            // then jump to next after a micro timeout to allow state to settle
            setTimeout(() => {
              handleAutoNext();
              // reset fading flag for when next track plays
              isFadingRef.current = false;
            }, 50);
          }
        }, stepTime);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
    // depend on previewSeconds so fade logic updates if that prop changes
  }, [previewSeconds]);

  /* ------------ Hanya 1 track yang bisa play (stop others) ----------- */
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>;
      if (ce.detail?.id !== track.id) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          setIsPlaying(false);
          setDisplayTime(0);
        }
      }
    };

    window.addEventListener(GLOBAL_PLAY_EVENT, handler);
    return () => window.removeEventListener(GLOBAL_PLAY_EVENT, handler);
  }, [track.id]);

  /* ------------ Scroll reveal animation per card (GSAP) ----------- */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Guard: pastikan kita di client dan ScrollTrigger tersedia
    if (typeof window === "undefined" || typeof ScrollTrigger === "undefined") {
      // nothing to do on server or if plugin missing
      return;
    }

    // safe set initial values
    gsap.set(el, { y: 22, opacity: 0, transformOrigin: "center" });

    // create ScrollTrigger for this element
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.05,
          ease: "expo.out",
        });
      },
      onLeave: () => {
        gsap.to(el, {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "expo.in",
        });
      },
      onEnterBack: () => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.05,
          ease: "expo.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(el, {
          y: 22,
          opacity: 0,
          duration: 0.8,
          ease: "expo.in",
        });
      },
    });

    return () => {
      try {
        st && st.kill && st.kill();
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);

  /* ------------ Render waveform (ping-pong gradient + 0–previewSeconds) ----------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = window.devicePixelRatio ?? 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // visualDuration = previewSeconds
      const visualDuration = previewSeconds;

      const audio = audioRef.current;
      const now = audio?.currentTime ?? displayTime;

      const ratio =
        visualDuration > 0
          ? Math.min(now, visualDuration) / visualDuration
          : 0;

      const playPos = ratio * peaks.length;
      const fullBars = Math.floor(playPos);
      const frac = playPos - fullBars;

      const barFullWidth = width / peaks.length;
      const gap = Math.max(1, barFullWidth * 0.3);
      const barWidth = Math.max(1, barFullWidth - gap);

      // draw background (all bars gray)
      ctx.fillStyle = "rgba(230,230,230,0.8)";
      for (let i = 0; i < peaks.length; i++) {
        const amp = peaks[i];
        const barHeight = amp * height;
        const x = i * barFullWidth + gap / 2;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      // gradient ping-pong (smooth left-right-left)
      const t = performance.now();
      const speed = 0.0009; // tweak = kecepatan pergerakan gradient
      const osc = (Math.sin(t * speed) + 1) / 2; // 0..1
      const startX = -width + width * osc;
      const endX = startX + width * 2;

      const gradient = ctx.createLinearGradient(startX, 0, endX, 0);
      const colors = [
        "#ff6bcb",
        "#feca57",
        "#54a0ff",
        "#5f27cd",
        "#1dd1a1",
        "#ff9ff3",
      ];
      const step = 1 / (colors.length - 1);
      colors.forEach((c, i) => gradient.addColorStop(i * step, c));

      // draw played bars with gradient (full)
      ctx.fillStyle = gradient;
      for (let i = 0; i < fullBars; i++) {
        const amp = peaks[i];
        const barHeight = amp * height;
        const x = i * barFullWidth + gap / 2;
        const y = (height - barHeight) / 2;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      // partially played bar
      if (fullBars < peaks.length && frac > 0) {
        const i = fullBars;
        const amp = peaks[i];
        const barHeight = amp * height;
        const x = i * barFullWidth + gap / 2;
        const y = (height - barHeight) / 2;
        const playedWidth = barWidth * frac;

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, playedWidth, barHeight);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [peaks, previewSeconds, displayTime]);

  /* ------------ Controls ----------- */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      window.dispatchEvent(
        new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: track.id } })
      );

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;

    const visualDuration = previewSeconds;
    let target = pct * visualDuration;

    // If some other audio is playing, switch to this track and start from beginning
    const otherPlaying = Array.from(document.querySelectorAll("audio")).some(
      (a) => !a.paused && a !== audio
    );

    if (otherPlaying && audio.paused) {
      // stop others and play this from 0
      window.dispatchEvent(
        new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: track.id } })
      );
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          setDisplayTime(0);
          setIsPlaying(true);
        })
        .catch(console.error);
      return;
    }

    // normal seek behavior (also if audio paused but no other playing, we seek but don't auto-play)
    if (target > previewSeconds) target = previewSeconds;
    audio.currentTime = target;
    setDisplayTime(target);

    // if audio was paused and it's the current track, start playback so user hears seek result
    if (audio.paused) {
      window.dispatchEvent(
        new CustomEvent(GLOBAL_PLAY_EVENT, { detail: { id: track.id } })
      );
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const totalDuration = previewSeconds;

  /* ------------ RENDER UI ----------- */
  return (
    <div
      ref={rootRef}
      className="track-wave-player flex items-center gap-4 rounded-lg px-4 py-3"
      data-track-id={track.id}
    >
      {/* artwork */}
      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden bg-[#222]">
        <img
          src={track.artworkUrl}
          alt={track.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* text + controls */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* bar atas: artist/title + genre di kanan */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm uppercase tracking-[0.15em] text-[#888]">
              {track.artist}
            </div>
            <div className="truncate text-lg font-bold text-[#f5f5f5]">
              {track.title}
            </div>

            {/* BUTTON di bawah title */}
            <button
              onClick={togglePlay}
              className="
                mt-2
                inline-flex items-center justify-center
                w-12 h-12 rounded-full bg-white text-black
                shadow-[0_4px_12px_rgba(0,0,0,0.35)]
              "
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <span className="flex m-0 p-0 w-5 h-5 items-stretch justify-between">
                  <span className="block w-[4px] rounded-sm bg-black" />
                  <span className="block w-[4px] rounded-sm bg-black" />
                </span>
              ) : (
                <svg className="w-9 h-9" viewBox="0 0 32 32" aria-hidden="true">
                  <polygon points="11,8 11,24 23,16" fill="black" />
                </svg>
              )}
            </button>
          </div>

          {track.genre && (
            <span className="ml-4 mt-1 inline-flex items-center rounded-full border border-[#444] px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-[#aaa] whitespace-nowrap">
              {track.genre}
            </span>
          )}
        </div>

        {/* waveform */}
        <div className="mt-1 flex items-center gap-3">
          <span className="w-10 text-[11px] tabular-nums text-[#bbb]">
            {formatTime(displayTime)}
          </span>

          <div className="relative flex-1">
            <canvas
              ref={canvasRef}
              onClick={handleSeek}
              className="h-14 w-full cursor-pointer"
            />
            {isLoadingWave && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[#777]">
                Loading waveform…
              </div>
            )}
          </div>

          <span className="w-10 text-[11px] tabular-nums text-[#777] text-right">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      <audio ref={audioRef} src={track.audioUrl} preload="metadata" />
    </div>
  );
}
