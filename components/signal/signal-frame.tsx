"use client";

import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type ReactNode } from "react";

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/**
 * Full-viewport iframe of the Signal mini-games app (source: /signal).
 * Locale and theme are passed as query params so the iframe matches the shell.
 */
export function SignalFrame({ title }: { title: string }): ReactNode {
  const locale = useLocale();
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";
  const src = `/signal-app/index.html?locale=${locale}&theme=${theme}`;

  return (
    <main id="main-content" className="h-dvh overflow-hidden pt-[4.75rem]">
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-0 bg-background"
        sandbox="allow-scripts allow-same-origin"
      />
    </main>
  );
}
