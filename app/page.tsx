"use client";

import Navbar from "@/components/Navbar";
import TextPressure from "@/components/TextPressure";
import ParticlesHeader from "@/components/ParticlesHeader";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollFloat from "@/components/ScrollFloat";
import BuildsSection from "@/components/BuildsSection";
import StackSpotlightGrid from "@/components/StackSpotlightGrid";
import MarqueeVierre from "@/components/MarqueeVierre";
import RevealSwipeFM from "@/components/RevealSwipeFM";
import HeadBustCanvas from "@/components/HeadBustCanvas";
import Ballpit from "@/components/Ballpit";
import ScrambledText from "@/components/ScrambledText";
import SlideInOnScroll from "@/components/SlideInOnScroll";
import TrackWavePlayer, { Track } from "@/components/TrackWavePlayer";
import FloatingMiniPlayer from "@/components/FloatingMiniPlayer";
import TiltedCard from "@/components/TiltedCard";
import { FiSend } from "react-icons/fi";
import Contact from "@/components/Contact";
import ModelViewer from "@/components/ModelViewer";

const projects = [
  {
    id: "p1",
    title: "Vierre App",
    tag: "Next JS / Tailwind CSS",
    cover: "/vierre_app.PNG",
  },
  {
    id: "p2",
    title: "Ngode",
    tag: "Laravel / Bootstrap 5",
    cover: "/ngode.PNG",
  },
  {
    id: "p3",
    title: "Honda Mobil Purwokerto",
    tag: "Laravel",
    cover: "/honda.svg",
  },
  {
    id: "p4",
    title: "Super Hood",
    tag: "Unity 2D / C#",
    cover: "/superhood.PNG",
  },
];

const tracks: Track[] = [
  {
    id: "t1",
    title: "Salting Melting (On Work)",
    artist: "vierre",
    artworkUrl: "/artworks/salting-melting-artwork.PNG",
    audioUrl: "/audio/salting-melting.wav",
    lengthSeconds: 95, // 1:35 (opsional)
    genre: "HipDut",
  },
  {
    id: "t2",
    title: "Semu (On Work)",
    artist: "vierre",
    artworkUrl: "/artworks/laydown-artwork.jpg",
    audioUrl: "/audio/semu.mp3",
    lengthSeconds: 132,
    genre: "Indie",
  },
  {
    id: "t3",
    title: "Black Out ",
    artist: "vierre",
    artworkUrl: "/artworks/black-out-artwork.png",
    audioUrl: "/audio/blackout.mp3",
    lengthSeconds: 132,
    genre: "Color Bass / Dubstep",
  },
  {
    id: "t4",
    title: "Drum Go Dum Remix ",
    artist: "vierre",
    artworkUrl: "/artworks/drum-go-dum-artwork.PNG",
    audioUrl: "/audio/Drum-go-dum-Remix.mp3",
    lengthSeconds: 132,
    genre: "Trap",
  },
];

const skills = [
  "Laravel 11/12",
  "MySQL",
  "REST API",
  "PHP",
  "Git",
  "Web Design",
  "Unity 2D",
  "FL Studio 21",
];

const stack = skills.map((label) => ({ content: label }));

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ===== HEADER: Navbar + Hero + Particles (full width) ===== */}
      <header className="relative isolate w-full">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
          {/* BALLPIT SEBAGAI BACKGROUND FULL 100VH */}
          {/* <Ballpit
            className="absolute inset-0 -z-10 h-full w-full"
            count={1}
            gravity={0.1}
            friction={2}
            wallBounce={0.1}
            followCursor={false}
          /> */}

          {/* HERO TEXT DI ATAS BALLPIT */}
          <div className="relative z-10 max-w-[1600px] w-full px-4 sm:px-6 mx-auto text-center">
            <h1 className="text-[48px] md:text-[72px] font-extrabold leading-tight mb-4">
              <span className="text-transparent align-baseline [-webkit-text-stroke:1px_#ebebeb]">
                Hello, It’s
              </span>{" "}
              <TextPressure
                inline
                text="Vierre"
                // ✨ gradient colorful
                gradient
                gradientColors="linear-gradient(120deg,#ff6bcb,#feca57,#54a0ff,#5f27cd,#1dd1a1,#ff9ff3)"
                gradientSpeed={10} // lebih besar = animasi lebih pelan
                textColor="#ebebeb" // fallback kalau gradient mati
                stroke={false}
                wghtMin={900}
                wghtMax={1200}
                wdthMin={95}
                wdthMax={180}
                className="align-baseline"
              />
            </h1>

            <h2 className="text-[28px] md:text-[36px] text-[#ebebeb] font-extrabold tracking-[.08em]">
              LET’S BUILD SOMETHING{" "}
              <span className="text-transparent [-webkit-text-stroke:1px_#ebebeb]">
                DIFFERENT
              </span>
              <span className="font-black">.</span>
            </h2>
          </div>
        </section>
      </header>

      {/* ===== CAPTION (di luar header → tidak kena partikel) ===== */}
      <div className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-[1600px] py-6 sm:py-8">
          <div
            className="
        grid 
        grid-cols-1 
        md:grid-cols-[65%_35%]
        gap-10
        items-center
        w-full
      "
          >
            {/* TEXT + animasi scroll */}
            <SlideInOnScroll distance={400} delay={0.0}>
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                Hi, I am <span>Oddy Bagus</span> 👋 I build modern, fast, and
                aesthetic websites through fullstack development and thoughtful
                design. I also produce music ♪ blending sound and technology to
                create expressive digital experiences. I help brands and
                creators bring ideas to life through code, design, and sound.
              </ScrambledText>
            </SlideInOnScroll>

            <SlideInOnScroll distance={400} delay={0.2}>
              <div className="flex justify-end">
                {/* <HeadBustCanvas /> */}
              </div>
            </SlideInOnScroll>
          </div>
        </div>
      </div>

      {/* ===== “The Vierre Lab” section title + cards ===== */}
      <section id="builds" className="px-4 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          {/* Title block */}
          <div className="py-10 md:py-14 ">
            <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-[.08em]">
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(3)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
              >
                THE VIERRE LAB
              </ScrollFloat>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#ebebeb]/100 max-w-2xl">
              “Build, broken, rebuilt” here are some of my projects.
            </p>
          </div>

          {/* Cards */}
          <BuildsSection projects={projects} />
        </div>

        {/* ===== Marquee with reveal ===== */}
        <div className="relative py-16 text-[#ebebeb] ">
          <RevealSwipeFM direction="up" delay={0.1} duration={0.5}>
            <MarqueeVierre text="VIERRE." repeat={22} duration={24} />
          </RevealSwipeFM>
        </div>

        {/* SECTION AUDIO */}
        <section className="relative w-full px-4 sm:px-6 mt-16">
          <div className="mx-auto max-w-[1600px] space-y-4">
            <h2 className="text-sm font-semibold tracking-[0.2em] text-[#ebebeb] uppercase">
              VIerre Audio
            </h2>

            <p className="text-sm text-[#ebebeb]">
              Short 40s previews of some tracks I’ve produced.
            </p>

            <div className="space-y-3">
              {tracks.map((t) => (
                <TrackWavePlayer key={t.id} track={t} previewSeconds={40} />
              ))}
            </div>

            {/* CTA di kanan */}
            <div className="flex justify-end mt-6">
              <a
                href="https://soundcloud.com/imvierre"
                target="_blank"
                className="group relative inline-flex items-center gap-3
         rounded-full px-6 py-3 bg-[#0c0c0c] text-[#ebebeb] font-medium
         overflow-hidden transition-all border"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M17.5 10.5c-.7 0-1.3.2-1.8.6-.3-2.8-2.6-5-5.5-5-2.3 0-4.3 1.4-5.1 3.4-.2 0-.4-.1-.6-.1-2 0-3.5 1.7-3.5 3.8S2.5 17 4.5 17h13c1.7 0 3-1.5 3-3.3s-1.3-3.2-3-3.2z" />
                </svg>

                <span className="relative z-10">
                  Want to listen to more? Check it out on SoundCloud →
                </span>
              </a>
            </div>
          </div>
        </section>
      </section>

      <FloatingMiniPlayer />

      {/* ===== Stack ===== */}
      <section id="stack" className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="py-10 md:py-14">
            <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-[.08em]">
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(3)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
              >
                WHAT I USE?
              </ScrollFloat>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#ebebeb]/70 max-w-2xl">
              Tools that I work with.
            </p>
          </div>

          {/* Replace your previous wrapper with this */}
          <div className="w-full">
            <div className="max-w-full">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-24 md:gap-24">
                {/* LEFT: Stacks (menempel ke kiri pada container) */}
                <div className="w-full md:w 2/3">
                  {/* ensure the grid inside StackSpotlightGrid does not center itself */}
                  <div className="pl">
                    <StackSpotlightGrid />
                  </div>
                </div>

                {/* RIGHT: Arrow + Text */}
                <div className="w-full md:w-2/3 flex items-center justify-center">
                  <div className="flex flex-col md:flex-row items-center justify-center md:items-center gap-4 md:gap-6">
                    {/* Text block - arrow is aligned center horizontally with this block */}
                    <div className="text-center md:text-left w-full">
                      <p className="text-md text-[#ebebeb] leading-relaxed">
                        These are the stacks and tools I frequently use to build
                        modern, production-ready applications. From backend
                        systems and REST APIs to frontend interfaces, game
                        prototypes and music production workflows these tools
                        help me move fast while keeping results polished and
                        professional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* LEFT - TEXT & FORM */}
            <div>
              <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-[.08em]">
                <ScrollFloat
                  animationDuration={1}
                  ease="back.inOut(3)"
                  scrollStart="center bottom+=50%"
                  scrollEnd="bottom bottom-=40%"
                  stagger={0.03}
                >
                  CONNECT WITH VIERRE
                </ScrollFloat>
              </h1>

              <p className="mt-2 text-sm sm:text-base text-[#ebebeb]/70 max-w-2xl">
                Feel free to reach out for collaborations, projects, or creative
                discussions.
              </p>

              <Contact />
            </div>

            {/* RIGHT - 3D MODEL */}
            <div className="relative w-full h-[480px]">
              {/* <ModelViewer /> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
