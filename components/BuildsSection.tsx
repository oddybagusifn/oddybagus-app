// components/BuildsSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Transisi unik: Curtain wipe + sheen (media), drift+skew (title)
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const rows = gsap.utils.toArray<HTMLDivElement>(
      root.querySelectorAll(".reveal-row")
    );

    const cleanups: Array<() => void> = [];

    rows.forEach((row) => {
      const mediaWrap = row.querySelector(".media-wrap") as HTMLElement | null;
      const sheen = row.querySelector(".media-sheen") as HTMLElement | null;
      const titleEl = row.querySelector(".piece-title") as HTMLElement | null;

      // arah title masuk: dari sisi berlawanan gambar
      const titleSide = row.dataset.titleSide === "right" ? 1 : -1; // 1 = dari kanan, -1 = dari kiri

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 78%",
          end: "top 40%",
          once: true, // tampil sekali (seperti di video). Jika ingin bolak-balik: hapus ini dan pakai toggleActions
        },
        defaults: { ease: "expo.out" },
      });

      // MEDIA: curtain wipe via clip-path + depth pop
      if (mediaWrap) {
        // set state awal (tertutup dari kanan atau kiri, tergantung sisi gambar)
        const fromRight = row.dataset.imageSide === "right";
        const fromClip = fromRight ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";

        gsap.set(mediaWrap, {
          clipPath: fromClip,
          filter: "blur(6px)",
          y: 22,
          rotateZ: fromRight ? 1 : -1,
          scale: 0.96,
          transformPerspective: 1000,
          transformOrigin: "center",
          willChange: "clip-path, transform, filter, opacity",
        });

        tl.to(
          mediaWrap,
          {
            clipPath: "inset(0 0% 0 0%)",
            filter: "blur(0px)",
            y: 0,
            rotateZ: 0,
            duration: 0.9,
          },
          0
        )
          .to(
            mediaWrap,
            { scale: 1.02, duration: 0.32, ease: "power2.out" },
            0.0
          )
          .to(
            mediaWrap,
            { scale: 1, duration: 0.38, ease: "power2.out" },
            ">-0.1"
          );

        // Sheen (kilau) melintas
        if (sheen) {
          gsap.set(sheen, {
            xPercent: fromRight ? -130 : 130,
            rotate: fromRight ? 12 : -12,
            opacity: 0.0,
          });
          tl.to(
            sheen,
            {
              xPercent: fromRight ? 135 : -135,
              opacity: 0.18,
              duration: 0.7,
              ease: "power2.out",
            },
            0.08
          ).to(
            sheen,
            { opacity: 0, duration: 0.25, ease: "power1.out" },
            ">-0.12"
          );
        }
      }

      // TITLE: drift + skew + unblur dari sisi lawan gambar
      if (titleEl) {
        gsap.set(titleEl, {
          opacity: 0,
          x: 28 * titleSide,
          y: 14,
          skewX: 6 * titleSide,
          filter: "blur(3px)",
          willChange: "transform, opacity, filter",
        });

        tl.to(
          titleEl,
          {
            opacity: 1,
            x: 0,
            y: 0,
            skewX: 0,
            filter: "blur(0px)",
            duration: 0.9,
          },
          0.06
        );
      }

      cleanups.push(() => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    });

    return () => {
      cleanups.forEach((c) => c());
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section id="builds" className="px-4 sm:px-6">
      <div ref={containerRef} className="mx-auto max-w-[1600px]">
        <div className="h-2" />
        {projects.map((p, i) => (
          <BuildRow key={p.id} project={p} index={i} />
        ))}
        <div className="h-2" />
      </div>

      {/* gaya kecil untuk sheen */}
      <style jsx>{`
        .media-sheen {
          position: absolute;
          top: -10%;
          bottom: -10%;
          width: 35%;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            rgba(230, 230, 230, 0) 0%,
            rgba(230, 230, 230, 0.6) 50%,
            rgba(230, 230, 230, 0) 100%
          );
          filter: blur(4px);
          mix-blend-mode: screen;
        }
      `}</style>
    </section>
  );
}

function BuildRow({ project, index }: { project: Project; index: number }) {
  // selang-seling posisi (kiri-kanan) untuk gambar
  const imageLeft = index % 2 === 0;

  const boxStyle: React.CSSProperties = {
    height: "clamp(150px, 34vw, 320px)",
    minHeight: 150,
  };

  const TitleBlock = (
    <div
      className={[
        "piece piece-title col-span-6",
        imageLeft
          ? "order-2 pl-2 sm:pl-3 md:pl-6"
          : "order-1 pr-2 sm:pr-3 md:pr-6",
        "flex items-center",
      ].join(" ")}
    >
      <div className={imageLeft ? "text-left" : "text-right"}>
        <h3
          className={[
            "leading-[0.9] font-extrabold text-[#ebebeb] tracking-tight",
            "text-[clamp(26px,7.8vw,70px)] md:text-[clamp(36px,6.2vw,92px)]",
          ].join(" ")}
          style={{ letterSpacing: "-0.01em" }}
        >
          {project.title}
        </h3>

        {/* TAGS → 2 pill (atau lebih) terpisah, rapat berdampingan */}
        {(() => {
          const tags = (project.tag ?? "")
            .split("/")
            .map((t) => t.trim())
            .filter(Boolean);
          if (!tags.length) return null;

          return (
            <div className={imageLeft ? "mt-2 text-left" : "mt-2 text-right"}>
              <div className="inline-flex gap-2">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className={[
                      "px-3 py-1",
                      "font-semibold select-none",
                      "border border-[#212121] text-[#ebebeb] bg-transparent",
                      "rounded-full",
                      "whitespace-nowrap",              // ❌ tidak turun baris
                      "leading-none",
                      "text-[clamp(10px,2.6vw,14px)]",  // 🔥 auto shrink
                      "transition-colors",
                      "hover:bg-[#212121] hover:text-[#e6e6e6]",
                    ].join(" ")}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );

  const ImageCard = (
    <a
      href={project.href ?? "#"}
      target="_blank"
      aria-label={project.title}
      className={[
        "piece piece-media group/card col-span-6",
        imageLeft ? "order-1" : "order-2",
        "mx-[2px] sm:mx-[4px]",
        "block",
        // ⭐ SUPER SMOOTH CARD SHRINK
        "transform-gpu will-change-transform",
        "transition-transform duration-[1500ms]",
        "ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:scale-[0.94]", // sedikit mengecil (smooth)
      ].join(" ")}
    >
      <div
        className={[
          "media-wrap relative overflow-hidden w-full rounded-none bg-[#e6e6e6]",
          "ring-1 ring-[#212121]/12 shadow-[0_6px_20px_rgba(33,33,33,0.18)]",
          "transform-gpu will-change-transform",
        ].join(" ")}
        style={{ ...boxStyle }}
      >
        {/* Sheen */}
        <span className="media-sheen" />

        {/* ⭐ SUPER SMOOTH ZOOM-IN IMAGE */}
        <img
          src={project.cover}
          alt={project.title}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className={[
            "absolute inset-0 w-full h-full object-cover",
            "transform-gpu will-change-transform",
            // Durasi lebih lama agar buttery-smooth
            "transition-transform duration-[1500ms]",
            // Ease ultra smooth
            "ease-[cubic-bezier(0.16,1,0.3,1)]",
            // ⭐ Zoom in lembut tanpa patah
            "group-hover/card:scale-[1.18]",
          ].join(" ")}
        />
      </div>
    </a>
  );

  return (
    <div
      className={[
        "reveal-row",
        "grid grid-cols-12 items-center",
        "py-8 md:py-12",
        "gap-x-2 sm:gap-x-3 md:gap-x-6",
        "gap-y-6",
      ].join(" ")}
      data-title-side={imageLeft ? "right" : "left"}
      data-image-side={imageLeft ? "left" : "right"}
    >
      {imageLeft ? (
        <>
          {ImageCard}
          {TitleBlock}
        </>
      ) : (
        <>
          {TitleBlock}
          {ImageCard}
        </>
      )}
    </div>
  );
}
