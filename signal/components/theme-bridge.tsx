"use client";

import { useEffect } from "react";
import { applyTheme, type Theme } from "@/lib/theme";

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/** When Signal is iframed by the portfolio, follow the parent theme. */
export function ThemeBridge() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("theme");
    if (isTheme(query)) applyTheme(query);

    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; theme?: unknown } | null;
      if (!data || data.type !== "signal-theme" || !isTheme(data.theme)) return;
      applyTheme(data.theme);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
