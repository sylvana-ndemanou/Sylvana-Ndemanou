import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Default locale (en) has no prefix; French is served under /fr.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
