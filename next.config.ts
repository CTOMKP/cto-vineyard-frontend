/// <reference types="node" />
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker/Coolify deployment
  output: 'standalone',
  
  // Image optimization with CloudFront
  images: {
    // Re-enabled optimization as requested
    unoptimized: false, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2cjbd1iqkwr9j.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },

  // Proxy API requests to backend internally
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_INTERNAL_API_URL || 'http://cto-backend:3001'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
