import type { Metadata } from "next";
import { Poppins } from "next/font/google";
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
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load Bebas Neue from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.className} bg-[#e6e6e6] text-[#212121] antialiased`}>
        <CursorVierre />
        <SmoothScroll />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
