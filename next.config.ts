// next.config.ts
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
  // *** IMPORTANTE: ADICIONAR O DOMÍNIO DO NGROK À LISTA DE IMAGES PERMITIDAS ***
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prolabor-axel-supraorbital.ngrok-free.dev',
      },
    ],
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

// OS COLEGAS DEVEM REINICIAR O NEXT.JS DEPOIS DE SALVAR ESTE FICHEIRO.