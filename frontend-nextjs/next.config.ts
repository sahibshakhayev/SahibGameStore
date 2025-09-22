import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5159',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'your-production-domain.com', // add prod domain later
        pathname: '/images/**',
      },
    ],
  },/* config options here */
};

export default nextConfig;
