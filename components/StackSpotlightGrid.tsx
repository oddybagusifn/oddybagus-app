"use client";

import Link from "next/link";
import SpotlightCard from "@/components/SpotlightCard";
import {
  SiLaravel,
  SiMysql,
  SiPhp,
  SiJavascript,
//   SiCSharp,
  SiFigma,
  SiUnity,
  SiGithub,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";

type Skill = {
  slug: string;
  name: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const skills: Skill[] = [
  { slug: "laravel", name: "Laravel 11/12", Icon: SiLaravel },
  { slug: "mysql", name: "MySQL", Icon: SiMysql },
  { slug: "php", name: "PHP", Icon: SiPhp },
  { slug: "javascript", name: "JavaScript", Icon: SiJavascript },
  { slug: "rest-api", name: "REST API", Icon: TbApi },
//   { slug: "csharp", name: "C#", Icon: SiCsharp },
  { slug: "figma", name: "Figma", Icon: SiFigma },
  { slug: "unity2d", name: "Unity 2D", Icon: SiUnity },
  { slug: "git-github", name: "Git / GitHub", Icon: SiGithub },
];

export default function StackSpotlightGrid() {
  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8">
      {/* Kartu di kiri */}
      <div className="col-span-12 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-6">
        {skills.map(({ slug, name, Icon }) => (
          <Link key={slug} href={`/stack/${slug}`} className="group block">
            <div className="stack-card">
              <SpotlightCard
                className="custom-spotlight-card"
                spotlightColor="rgba(230,230,230,.28)"
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <Icon size={56} color="#e6e6e6" />
                  <div className="mt-3 text-center text-[#e6e6e6] font-extrabold tracking-tight">
                    {name}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </Link>
        ))}
      </div>

      {/* (Opsional) ruang kanan — biarkan kosong dulu */}
      <div className="col-span-12 lg:col-span-5"></div>

      <style jsx>{`
        /* Shell kartu (wrapper di luar SpotlightCard) */
        .stack-card {
          perspective: 1000px;
        }
        /* Tampilan kartu */
        .custom-spotlight-card {
          border: 2px solid #212121;
          border-radius: 18px;
          background: #212121; /* gelap */
          box-shadow: 0 18px 40px rgba(33, 33, 33, 0.18),
            0 1px 0 rgba(230, 230, 230, 0.06) inset;
          transform: translateZ(0);
          transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 320ms ease;
          will-change: transform;
        }
        .group:hover .custom-spotlight-card {
          transform: translateY(-2px) scale(1.02) rotateX(0.6deg) rotateY(0.6deg);
          box-shadow: 0 26px 56px rgba(33, 33, 33, 0.22);
        }
      `}</style>
    </div>
  );
}
