import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@timmbr/ui",
    "@timmbr/theme",
    "@timmbr/motion",
    "@timmbr/icons",
    "@timmbr/hooks",
    "@timmbr/utils",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-dc2a8fc90be54a65b2d2000bed9fc8d2.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
};

export default nextConfig;
