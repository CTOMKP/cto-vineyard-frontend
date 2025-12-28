import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker/Coolify deployment
  output: 'standalone',
  
  // Image optimization with CloudFront
  images: {
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
    ],
  },
  
  // Optimize bundle size
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLOUDFRONT_DOMAIN: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || 'd2cjbd1iqkwr9j.cloudfront.net',
  },
};

export default nextConfig;

