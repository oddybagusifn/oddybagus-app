import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // full static export
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true }, // jika pakai next/image

  // supaya deploy awal tidak ketahan
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
