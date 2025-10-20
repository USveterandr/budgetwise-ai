import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Add output configuration for Cloudflare Pages
  output: 'export',
  // Configure images for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;