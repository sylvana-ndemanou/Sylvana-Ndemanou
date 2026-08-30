// @ts-nocheck
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MESSAGES, type Messages } from "@s/lib/messages";
import {
  hydrateLocale,
  readLocale,
  subscribeLocale,
  toggleLocale,
  type Locale,
} from "@s/lib/locale";

const ForcedLocaleContext = createContext<Locale | null>(null);

export function SignalLocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <ForcedLocaleContext.Provider value={locale}>
      {children}
    </ForcedLocaleContext.Provider>
  );
}

export function useI18n(): { locale: Locale; t: Messages; toggle: () => void } {
  const forced = useContext(ForcedLocaleContext);
  const stored = useSyncExternalStore(
    subscribeLocale,
    readLocale,
    (): Locale => "fr",
  );
  const locale = forced ?? stored;
  return { locale, t: MESSAGES[locale], toggle: toggleLocale };
}

export function LocaleRoot() {
  const forced = useContext(ForcedLocaleContext);
  useEffect(() => {
    if (forced) return;
    hydrateLocale();
  }, [forced]);
  useSyncExternalStore(subscribeLocale, readLocale, (): Locale => "fr");
  return null;
}
