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
          // Force HTTPS on every future visit for a year, including subdomains -
          // safe here since the site has no legitimate plain-HTTP use.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Stops a browser from guessing a response's MIME type from its
          // content (e.g. treating an uploaded "image" as executable script).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Never leak the full referring URL (which can carry lead IDs/query
          // params) to third-party links; still allow it same-origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Explicitly deny browser features this site never uses.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
