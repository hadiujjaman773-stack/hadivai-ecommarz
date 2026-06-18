import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.118", "localhost", "127.0.0.1"],
  serverExternalPackages: ["@prisma/client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "mosafamart.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
    ],
    // Local /uploads/* paths work without remotePatterns
  },
};

export default nextConfig;
