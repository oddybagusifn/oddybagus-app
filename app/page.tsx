"use client";

import Navbar from "@/components/Navbar";
import TextPressure from "@/components/TextPressure";
import ParticlesHeader from "@/components/ParticlesHeader";
import TextType from "@/components/TextType";

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
  className="font-semibold text-[#212121] align-middle"
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

    </main>
  );
}
