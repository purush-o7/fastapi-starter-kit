import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "radix-ui"],
  },
};

export default nextConfig;
