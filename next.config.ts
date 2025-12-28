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
      {
        protocol: 'https',
        hostname: 's3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

