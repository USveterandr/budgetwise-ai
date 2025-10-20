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
  // Exclude API routes from static export
  exportPathMap: async function (
    defaultPathMap: { [key: string]: object }
  ) {
    const paths = { ...defaultPathMap };
    // Remove API routes from static export
    delete paths['/api/health'];
    delete paths['/api/ai/advisor'];
    return paths;
  },
};

export default nextConfig;