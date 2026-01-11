import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable instrumentation for auto-release service
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
