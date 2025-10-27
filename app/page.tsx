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
import TiltedCard from "@/components/TiltedCard";

const projects = [
  {
    id: "p1",
    title: "Landing Clean UI",
    tag: "Next.js / Tailwind",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "p2",
    title: "Realtime Chat",
    tag: "Socket.io / Node",
    cover:
      "https://images.unsplash.com/photo-1523477800337-966dbabe060b?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "p3",
    title: "Commerce Headless",
    tag: "Stripe / CMS",
    cover:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop",
  },
];

const skills = [
  "Laravel 11/12",
  "MySQL",
  "REST API",
  "PHP",
  "Git/GitHub",
  "Web Design",
  "Unity 2D",
];

const stack = skills.map((label) => ({ content: label }));

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ===== HEADER: Navbar + Hero + Particles (full width) ===== */}
      <header className="relative isolate w-full">
        {/* Background particles hanya untuk area header */}
        <ParticlesHeader />

        {/* Hero di atas partikel, konten tepat di tengah */}
        <section className="relative z-10 min-h-[70vh] flex items-center justify-center">
          <div className="max-w-[1600px] w-full px-4 sm:px-6 mx-auto text-center">
            <h1 className="text-[48px] md:text-[72px] font-extrabold leading-tight mb-4">
              <span className="text-transparent align-baseline [-webkit-text-stroke:1px_#212121]">
                Hello, It’s
              </span>{" "}
              <TextPressure
                inline
                text="Vierre"
                textColor="#212121"
                stroke={false}
                wghtMin={900}
                wghtMax={1200}
                wdthMin={95}
                wdthMax={180}
                className="align-baseline"
              />
            </h1>

            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-[.08em]">
              LET’S BUILD SOMETHING{" "}
              <span className="text-transparent [-webkit-text-stroke:1px_#212121]">
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
          {/* Wrapper konten: left text (ScrollReveal) + right card, responsive */}
          <div className="px-4 sm:px-6 mx-auto max-w-[1600px] w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            {/* GANTI p -> div agar aman untuk block children & anim wrapper */}
            <div className="w-full md:w-[65%] text-[14px] sm:text-[15px] md:text-[20px] leading-relaxed text-[#212121]/100">
              <ScrollReveal
                baseOpacity={0}
                enableBlur={true}
                baseRotation={5}
                blurStrength={10}
              >
                When does a man die? When he is hit by a bullet? No! When he
                suffers a disease? No! When he ate a soup made out of a
                poisonous mushroom? No! A man dies when he is forgotten!
              </ScrollReveal>
            </div>

            <div className="shrink-0 ">
              <TiltedCard
                imageSrc="https://cdn.discordapp.com/attachments/1412827708827631731/1432150421354446989/WhatsApp_Image_2025-09-09_at_01.44.50_1c4e94f4.jpg?ex=69000184&is=68feb004&hm=591eb96ce903d49ae3d7f4d0a8fe66a9bab9dac0e56d40249a9f794349b065d8&"
                altText="Vierre"
                captionText="Vierre"
                /* >> perbesar di sini << */
                containerWidth="420px"
                containerHeight="420px"
                imageWidth="420px"
                imageHeight="420px"
                rotateAmplitude={15}
                scaleOnHover={1.2}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <g className="tilted-card-demo-text pt-16 ps-8 text-[20px]">
                    <b></b>
                  </g>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== “The Vierre Lab” section title + cards ===== */}
      <section id="builds" className="px-4 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          {/* Title block */}
          <div className="py-10 md:py-14 text-center">
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
            <p className="mt-2 text-sm sm:text-base text-[#212121]/70 max-w-2xl mx-auto">
              “Build, broken, rebuilt” here are some of my projects.
            </p>
          </div>

          {/* Cards */}
          <BuildsSection projects={projects} />
        </div>
      </section>

      {/* ===== Stack ===== */}
      <section id="stack" className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-[1600px]">
          <div className="text-center py-10 md:py-14">
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
            <p className="mt-2 text-sm sm:text-base text-[#212121]/70 max-w-2xl mx-auto">
              Tools that I work with.
            </p>
          </div>

          <StackSpotlightGrid />
        </div>
      </section>

            {/* ===== Marquee with reveal ===== */}
      <div className="py-16">
        <RevealSwipeFM direction="up" delay={0.1} duration={0.5}>
          <MarqueeVierre text="VIERRE." repeat={22} duration={24} gap="0rem" />
        </RevealSwipeFM>
      </div>

      <section id="story"></section>
      <section id="contact"></section>

      
    </main>
  );
}
