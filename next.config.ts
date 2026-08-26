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
  // The site has no legitimate reason to ever render inside someone else's
  // page - blocking all framing is what stops a third party from iframing
  // snapingo.com behind their own URL and having it look like the site
  // "opened" from their domain. X-Frame-Options is the legacy header for
  // browsers that don't honor CSP's frame-ancestors yet.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
