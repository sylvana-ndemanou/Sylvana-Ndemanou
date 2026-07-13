import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Always prefix locales (/en, /fr). This lets us run WITHOUT an i18n
  // middleware (all pages are prerendered under [locale] and the locale comes
  // from the segment via setRequestLocale), avoiding the Next 16 + Vercel
  // MIDDLEWARE_INVOCATION_FAILED bug. `/` is redirected to /en in next.config.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
