import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js build — no standalone output, no cp commands needed.
  // For static export (GitHub Pages), see README "GitHub Pages" section.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Three.js + R3F ecosystem needs transpilation for Next.js
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
  ],
  turbopack: {},
};

export default nextConfig;
