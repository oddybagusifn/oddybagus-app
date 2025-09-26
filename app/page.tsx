"use client";

import Navbar from "@/components/Navbar";
import TextPressure from "@/components/TextPressure";
import ParticlesHeader from "@/components/ParticlesHeader";
import TextType from "@/components/TextType";
import ChromaGrid from "@/components/ProjectCards";
import ScrollFloat from '@/components/ScrollFloat';
import BuildsSection from "@/components/BuildsSection";


const projects = [
  {
      id: "p1",
      title: "Landing Clean UI",
      tag: "Next.js / Tailwind",
      cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "p2",
      title: "Realtime Chat",
      tag: "Socket.io / Node",
      cover: "https://images.unsplash.com/photo-1523477800337-966dbabe060b?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: "p3",
      title: "Commerce Headless",
      tag: "Stripe / CMS",
      cover: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop",
    },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ===== HEADER: Navbar + Hero + Particles (full width) ===== */}
      <header className="relative isolate w-full">
        {/* Background particles hanya untuk area header */}
        <ParticlesHeader />

        {/* Hero di atas partikel, konten dalam container max-w-1600 */}
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
    // keeps it not-too-thin
    wghtMin={900}
    wghtMax={1200}
    wdthMin={95}
    wdthMax={180}
    className="align-baseline"
  />
</h1>



    <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-[.08em]">
      LET’S BUILD SOMETHING{" "}
      <span className="text-transparent [-webkit-text-stroke:1px_#212121]">DIFFERENT</span>
      <span className="font-black">.</span>
    </h2>
  </div>
</section>

      </header>

      {/* ===== CAPTION (di luar header → tidak kena partikel) ===== */}
      <div className="px-4 sm:px-6">
  <div className="mx-auto max-w-[1600px] py-6 sm:py-8">
    {/* wrapper konten: width = konten, center pakai mx-auto */}
    <div className="w-fit mx-auto flex items-center gap-2 sm:gap-3 md:gap-4">
      <span className="h-2 w-2 rounded-full bg-[#212121] flex-none" />
      <p className="max-w-[600px] text-center text-[12px] sm:text-[13px] md:text-[18px] leading-relaxed text-[#212121]/80">
      <TextType
  text={`Hello World!👋 I’m Oddy Bagus, a passionate Web Developer focused on creating clean, efficient, and well-designed web applications.`}
  className="font-light text-[#212121] align-middle"
  typeRange={[50, 50]}     // faster typing -> lower numbers
  deleteRange={[45, 25]}    // delete speed if you enable erase/loop
  pauseTyped={900}
  pauseDeleted={700}
  startDelay={10}
  erase={true}
  loop={true}
  cursor
  cursorChar="_"
/>
      </p>
      <span className="h-2 w-2 rounded-full bg-[#212121] flex-none" />
    </div>
  </div>
</div>
{/* ===== “The Vierre Lab” section title + cards ===== */}
      <section id="builds" className="px-4 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          {/* Title block */}
<div className="py-10 md:py-14 text-center">
  <ScrollFloat
    animationDuration={1}
    ease="back.inOut(3)"
    scrollStart="center bottom+=50%"
    scrollEnd="bottom bottom-=40%"
    stagger={0.03}
  >
    The Vierre Lab
  </ScrollFloat>

  <p className="mt-2 text-sm sm:text-base text-[#212121]/70 max-w-2xl mx-auto">
    “Build, broken, rebuilt” here are some of my projects.
  </p>
</div>
          {/* Cards (keep your interactive canvas) */}
          
          <BuildsSection projects={projects} />
        </div>
      </section>

      <section id="stack">
        <div className="py-10 md:py-14 text-center">
  <ScrollFloat
    animationDuration={1}
    ease="back.inOut(3)"
    scrollStart="center bottom+=50%"
    scrollEnd="bottom bottom-=40%"
    stagger={0.03}
  >
    What I Use
  </ScrollFloat>

  <p className="mt-2 text-sm sm:text-base text-[#212121]/70 max-w-2xl mx-auto">
    Tools behind the work.
  </p>
</div>
      </section>
    </main>
  );
}
