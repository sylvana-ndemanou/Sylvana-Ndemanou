import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/metadata";
import { PROJECT_SLUGS } from "@/lib/projects";

function localizedUrl(locale: string, path: string): string {
  // Locales are always prefixed (localePrefix: "always").
  const clean = path === "/" ? "" : path;
  return `${siteConfig.url}/${locale}${clean}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/projects",
    "/about",
    ...PROJECT_SLUGS.map((slug) => `/projects/${slug}`),
  ];

  return paths.map((path) => ({
    url: localizedUrl(routing.defaultLocale, path),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, localizedUrl(locale, path)])
      ),
    },
  }));
}
