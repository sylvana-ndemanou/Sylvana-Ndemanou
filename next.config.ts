import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    // No i18n middleware, so redirect the bare root to the default locale.
    return [
      { source: "/", destination: "/en", permanent: false },
      { source: "/projects", destination: "/en/projects", permanent: false },
      { source: "/about", destination: "/en/about", permanent: false },
      { source: "/signal", destination: "/en/signal", permanent: false },
      {
        source: "/signal/play/:slug",
        destination: "/en/signal/play/:slug",
        permanent: false,
      },
      {
        source: "/projects/:slug",
        destination: "/en/projects/:slug",
        permanent: false,
      },
    ];
  },
  async headers() {
    // Never allow the portfolio to iframe itself (that stacked the nav bars).
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
  async rewrites() {
    const origin = process.env.SIGNAL_INTERNAL_URL?.replace(/\/$/, "");
    if (!origin) return [];
    return [
      { source: "/__signal", destination: `${origin}/__signal` },
      { source: "/__signal/:path*", destination: `${origin}/__signal/:path*` },
    ];
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
