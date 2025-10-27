// app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import CursorVierre from "@/components/CursorVierre";

export const metadata: Metadata = {
  title: "Vierre",
  description: "Let's build something different.",
};

const poppins = Poppins({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bebas",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${bebas.variable} bg-[#e6e6e6] text-[#212121] antialiased`}>
        <CursorVierre />
        <SmoothScroll />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
