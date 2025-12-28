// components/StackSpotlightGrid.tsx
"use client";

import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCard";
import {
  SiLaravel,
  SiMysql,
  SiPhp,
  SiJavascript,
  SiFigma,
  SiUnity,
  SiGithub,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";
import React from "react";

type Skill = {
  slug: string;
  name: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

/**
 * Simple FL Studio loader using public SVG file.
 */
const FlStudioIcon: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <img
    src="/icons/fl_studio.svg"
    alt="FL Studio Icon"
    width={size}
    height={size}
    className="fl-simple-icon"
  />
);

const skills: Skill[] = [
  { slug: "laravel", name: "Laravel 11/12", Icon: SiLaravel },
  { slug: "mysql", name: "MySQL", Icon: SiMysql },
  { slug: "php", name: "PHP", Icon: SiPhp },
  { slug: "javascript", name: "JavaScript", Icon: SiJavascript },
  { slug: "rest-api", name: "REST API", Icon: TbApi },
  { slug: "figma", name: "Figma", Icon: SiFigma },
  { slug: "unity2d", name: "Unity 2D", Icon: SiUnity },
  { slug: "git-github", name: "Git / GitHub", Icon: SiGithub },
  { slug: "fl-studio", name: "FL Studio 21", Icon: FlStudioIcon },
];

export default function StackSpotlightGrid() {
  // handler to update CSS vars for spotlight on wrapper element
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    // gently reset to center
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `50%`);
  };

  return (
    <div className="grid grid-cols-6 gap-12 md:gap-12 w-full">
      {/* Stacks grid — keep it aligned to left of the container */}
      <div className="col-span-12 lg:col-span-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8 md:gap-10 items-start">
          {skills.map(({ slug, name, Icon }) => (
            <Link key={slug} href={`/stack/${slug}`} className="group block">
              <div className="stack-card">
                {/* spot-wrapper controls spotlight (CSS vars --mx / --my) */}
                <div
                  className="spot-wrapper"
                  onMouseMove={handleMove}
                  onMouseLeave={handleLeave}
                  // init center
                  style={{ ["--mx" as any]: "50%", ["--my" as any]: "50%" }}
                >
                  <SpotlightCard
                    className="custom-spotlight-card"
                    spotlightColor="rgba(230,230,230,.28)"
                  >
                    <div className="flex flex-col items-center justify-center py-6 px-3">
                      <Icon size={56} color="#ebebeb" />
                      <div className="mt-3 text-center text-[#ebebeb] font-extrabold tracking-tight text-sm">
                        {name}
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .stack-card {
          perspective: 1000px;
        }

        /* wrapper that receives mouse and stores spotlight coordinates in CSS vars */
        .spot-wrapper {
          --mx: 50%;
          --my: 50%;
        }

        .custom-spotlight-card {
          position: relative; /* needed for the ::before spotlight */
          border: 2px solid #212121;
          border-radius: 18px;
          background: #212121;
          box-shadow: 0 18px 40px rgba(33, 33, 33, 0.18),
            0 1px 0 rgba(230, 230, 230, 0.06) inset;
          transform: translateZ(0);
          transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 320ms ease;
          will-change: transform;
          overflow: hidden;
        }

        /* the moving spotlight */
        .spot-wrapper .custom-spotlight-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          /* radial gradient circle centered by CSS vars */
          background: radial-gradient(
            240px circle at var(--mx, 50%) var(--my, 50%),
            rgba(255, 255, 255, 0.06),
            rgba(255, 255, 255, 0.02) 30%,
            rgba(255, 255, 255, 0) 60%
          );
          mix-blend-mode: screen;
          transition: background-position 120ms linear, opacity 220ms ease;
        }

        .group:hover .custom-spotlight-card {
          transform: translateY(-2px) scale(1.02) rotateX(0.6deg)
            rotateY(0.6deg);
          box-shadow: 0 26px 56px rgba(33, 33, 33, 0.22);
        }

        /* FL Studio SVG recolor to light tone (#ebebeb) using filter */
        .fl-simple-icon {
          display: block;
          width: 56px;
          height: 56px;
          object-fit: contain;
          filter: invert(93%) sepia(0%) saturate(0%) hue-rotate(180deg)
            brightness(105%) contrast(100%);
        }

        /* Small nicety: make the spotlight softer on small screens */
        @media (max-width: 640px) {
          .spot-wrapper .custom-spotlight-card::before {
            background: radial-gradient(
              160px circle at var(--mx, 50%) var(--my, 50%),
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.02) 30%,
              rgba(255, 255, 255, 0) 60%
            );
          }
        }
      `}</style>
    </div>
  );
}
