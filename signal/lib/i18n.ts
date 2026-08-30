"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MESSAGES, type Messages } from "@/lib/messages";
import {
  hydrateLocale,
  readLocale,
  subscribeLocale,
  toggleLocale,
  type Locale,
} from "@/lib/locale";

export function useI18n(): { locale: Locale; t: Messages; toggle: () => void } {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, (): Locale => "fr");
  return { locale, t: MESSAGES[locale], toggle: toggleLocale };
}

export function LocaleRoot() {
  useEffect(() => {
    hydrateLocale();
  }, []);
  useSyncExternalStore(subscribeLocale, readLocale, (): Locale => "fr");
  return null;
}
