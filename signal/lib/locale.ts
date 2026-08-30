// @ts-nocheck
export type Locale = "fr" | "en";

export const LOCALE_KEY = "signal-locale";

const listeners = new Set<() => void>();
let current: Locale = "fr";
let hydrated = false;

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeLocale(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function applyLang(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
}

export function hydrateLocale() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (stored === "en" || stored === "fr") current = stored;
  } catch {
    current = "fr";
  }
  applyLang(current);
}

export function readLocale(): Locale {
  hydrateLocale();
  return current;
}

export function setLocale(next: Locale) {
  current = next;
  applyLang(next);
  try {
    window.localStorage.setItem(LOCALE_KEY, next);
  } catch {
    /* ignore */
  }
  emit();
}

export function toggleLocale() {
  setLocale(readLocale() === "fr" ? "en" : "fr");
}

export const LOCALE_BOOT = `(function(){try{var l=localStorage.getItem("${LOCALE_KEY}");if(l==="en"||l==="fr")document.documentElement.lang=l;}catch(e){}})();`;
