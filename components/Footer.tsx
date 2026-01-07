"use client";

import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs tracking-widest text-[#bdbdbd]">
          {/* LEFT */}
          <span className="">
            © {new Date().getFullYear()} OddyBagus — All Rights Reserved.
          </span>

          {/* CENTER */}
          <span className="flex items-center gap-1 uppercase">
            Made with
            <span className="inline-flex items-center font-bold gap-1 text-gradient-love">
              Love ❤︎
            </span>
          </span>
        </div>
      </div>

      {/* styles */}
      <style jsx>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .text-gradient-love {
          background-image: linear-gradient(
            120deg,
            #ff6bcb,
            #54a0ff,
            #5f27cd,
            #1dd1a1
          );
          background-size: 300% 300%;
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          animation: gradient-flow 4s ease-in-out infinite;
        }
      `}</style>
    </footer>
  );
}
