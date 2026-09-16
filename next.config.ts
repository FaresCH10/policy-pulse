import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Lint is run explicitly via `npm run lint` so a lint error never masks a build error.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
