import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Template files are read by the scaffold route at runtime.
  outputFileTracingIncludes: {
    "/api/scaffold": ["./templates/**/*"],
  },
};

export default nextConfig;
