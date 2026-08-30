// @ts-nocheck
export type Theme = "light" | "dark";

export const THEME_KEY = "signal-theme";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore quota / private mode */
  }
  emit();
}

export function toggleTheme() {
  applyTheme(readTheme() === "dark" ? "light" : "dark");
}

export const THEME_BOOT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;
