import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build artifact for Railway: smaller container, faster cold-start.
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

  // 301-redirect legacy WordPress URLs to anchors / new routes so existing
  // backlinks don't 404 after the cutover.
  async redirects() {
    return [
      { source: "/tjanster",       destination: "/#tjanster", permanent: true },
      { source: "/tjanster/:slug", destination: "/#tjanster", permanent: true },
      { source: "/om-oss",         destination: "/kontakt",   permanent: true },
      { source: "/bilar-i-lager",  destination: "/",          permanent: true },
    ];
  },
};

export default nextConfig;
