// app/layout.tsx
import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import CursorVierre from "@/components/CursorVierre";
import CircularCursor from "@/components/CircularCursor";
import "@/components/CircularCursor.css";

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
      <body className={`${poppins.variable} ${bebas.variable} bg-[#0c0c0c] text-[#ebebeb]  antialiased`}>
        <CircularCursor />
        <SmoothScroll />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
