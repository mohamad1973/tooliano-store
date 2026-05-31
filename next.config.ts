import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tooliano.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.vercel.app",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/vendors/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/uploads/vendors/**",
      },
    ],
  },
};

export default nextConfig;
