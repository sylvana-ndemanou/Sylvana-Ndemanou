import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  // Workaround for a Next.js 16 + Vercel bug where the middleware/lambda trace
  // drops @swc/helpers ESM modules, causing MIDDLEWARE_INVOCATION_FAILED (500)
  // on deploy while working locally. See vercel/next.js discussion #93895.
  outputFileTracingIncludes: {
    "*": ["./node_modules/@swc/helpers/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
