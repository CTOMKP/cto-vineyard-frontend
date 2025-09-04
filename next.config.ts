import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'ctomemes.xyz',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'ctomemes.xyz',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
