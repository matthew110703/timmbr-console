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
};

export default nextConfig;
