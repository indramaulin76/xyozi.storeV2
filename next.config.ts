import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.v2.tokovoucher.id',
      },
      {
        protocol: 'https',
        hostname: 'cdn1.codashop.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.unipin.com',
      },
    ],
  },
};

export default nextConfig;
