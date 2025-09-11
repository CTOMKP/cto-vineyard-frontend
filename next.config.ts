import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/images/**',
      },
      {
        protocol: 'http',
        hostname: 'ctomemes.xyz',
        pathname: '/api/images/**',
      },
      {
        protocol: 'https',
        hostname: 'ctomemes.xyz',
        pathname: '/api/images/**',
      },
    ],
  },
};

export default nextConfig;
