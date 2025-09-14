"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function ParticlesHeader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const options = useMemo<ISourceOptions>(() => ({
    fpsLimit: 60,
    detectRetina: true,
    fullScreen: { enable: false },
    background: { color: "transparent" },
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" }, resize: { enable: true } },
      modes: { repulse: { distance: 120, duration: 0.4 } },
    },
    particles: {
      number: { value: 180, density: { enable: true, area: 700 } },
      color: { value: "#212121" },
      links: { enable: true, distance: 120, color: "#212121", opacity: 0.55, width: 1 },
      opacity: { value: { min: 0.35, max: 0.8 } },
      size: { value: { min: 1, max: 2.5 } },
      move: { enable: true, speed: { min: 0.15, max: 0.9 }, outModes: { default: "out" } },
    },
  }), []);

  if (!ready) return null;

  // isi seluruh area header (pakai absolute di parent header)
  return (
    <Particles
      id="tsparticles-header"
      options={options}
      className="absolute inset-0 z-0 pointer-events-none
                 [filter:drop-shadow(0_2px_6px_rgba(33,33,33,.18))]"
    />
  );
}
