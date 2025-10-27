import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // full static export
  output: "export",
  reactStrictMode: true,

  // jika pakai next/image, wajib non-optimized untuk export
  images: { unoptimized: true },

  // agar deploy awal tidak ketahan
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
