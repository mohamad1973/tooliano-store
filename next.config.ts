import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tooliano.com",
        pathname: "/wp-content/uploads/**",
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
