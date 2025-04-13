import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Désactiver ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Retirer swcMinify qui n'est plus reconnu dans Next.js 15.3.0
  // Optimizations for Vercel deployment
  poweredByHeader: false,
  compress: true,
  // Configuration de l'environnement
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV
  }
};

export default nextConfig;
