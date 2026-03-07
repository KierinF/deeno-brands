import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/api/analyze/", destination: "/api/analyze" },
      { source: "/api/contact/", destination: "/api/contact" },
    ];
  },
};

export default nextConfig;
