import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/lib/imageHosts";

const nextConfig: NextConfig = {
  images: {
    qualities: [85],
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
