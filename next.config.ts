import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FORÇA desabilitar ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // FORÇA desabilitar TypeScript strict checking durante build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Desabilita telemetria
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

export default nextConfig;
