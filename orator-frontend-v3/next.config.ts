import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{
      source: "/socket.io/:path*",
      destination: `${process.env.ORATOR_BACKEND_URL || "http://127.0.0.1:8100"}/socket.io/:path*`,
    }];
  },
};
export default nextConfig;
