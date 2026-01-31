import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["snarkjs"],
  experimental: {
    // @ts-ignore
    outputFileTracingIncludes: {
      '/api/prove': ['./zk-artifacts/**/*'],
    },
  },
};

export default nextConfig;
