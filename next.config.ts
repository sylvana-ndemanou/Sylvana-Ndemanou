import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  async redirects() {
    // No i18n middleware, so redirect the bare root to the default locale.
    return [
      { source: "/", destination: "/en", permanent: false },
      { source: "/projects", destination: "/en/projects", permanent: false },
      { source: "/about", destination: "/en/about", permanent: false },
      {
        source: "/projects/:slug",
        destination: "/en/projects/:slug",
        permanent: false,
      },
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
