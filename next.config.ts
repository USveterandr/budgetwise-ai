import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configure for static export
  output: 'export',
  // Configure images for static export
  images: {
    unoptimized: true,
  },
  // Optimize build for production
  trailingSlash: true,
  // Configure base path for production
  basePath: '',
  // Configure asset prefix for production
  assetPrefix: '',
};

export default nextConfig;