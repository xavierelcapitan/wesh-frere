import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Optimizations for Vercel deployment
  poweredByHeader: false,
  compress: true,
  // Désactiver les vérifications de type au build
  typescript: {
    ignoreBuildErrors: true
  },
  // Désactiver la vérification de lint au build
  eslint: {
    ignoreDuringBuilds: true
  },
  // Configuration de l'environnement
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV
  }
};

export default nextConfig;
