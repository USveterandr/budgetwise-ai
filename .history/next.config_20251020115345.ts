import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add output configuration for Cloudflare Pages
  output: 'export',
  // Configure images for static export
  images: {
    unoptimized: true,
  },
  // Reduce build output size for Cloudflare Pages
  experimental: {
    webpackBuildWorker: false,
  },
  // Optimize build for static export
  trailingSlash: true,
};

export default nextConfig;