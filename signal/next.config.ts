// @ts-nocheck
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.SIGNAL_BASE_PATH || "",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://sylvanandemanou.vercel.app https://*.vercel.app http://127.0.0.1:4570 http://localhost:4570 http://127.0.0.1:3000 http://localhost:3000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
