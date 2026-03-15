import { defineConfig } from "@remix-run/dev";

export default defineConfig({
  appDirectory: "remix/app",
  assetsBuildDirectory: "build/client",
  publicPath: "/build/",
  serverBuildPath: "build/server/index.js",
  serverBuildTarget: "cloudflare-pages",
  serverModuleFormat: "esm",
  ignoredRouteFiles: ["**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true
  }
});
