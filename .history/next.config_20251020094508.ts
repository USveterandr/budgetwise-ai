import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: "."
  },
  // Add output configuration for Cloudflare Pages
  output: 'export',
  // Ensure trailing slash is consistent
  trailingSlash: false,
  // Configure images for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;