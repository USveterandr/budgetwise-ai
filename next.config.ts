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
  // Disable webpack caching to reduce build size
  webpack: (config, { isServer }) => {
    // Disable source maps to reduce bundle size
    config.devtool = false;
    
    // Disable webpack caching
    config.cache = false;
    
    // Reduce bundle size for Cloudflare Pages
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    
    // PWA configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;