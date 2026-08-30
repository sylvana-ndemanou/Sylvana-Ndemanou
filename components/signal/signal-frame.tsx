"use client";

import { SIGNAL_EMBED_URL, SIGNAL_ORIGIN } from "@/lib/signal";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const LOAD_TIMEOUT_MS = 12_000;

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function embedSrc(theme: "light" | "dark"): string {
  const url = new URL(SIGNAL_EMBED_URL);
  url.searchParams.set("theme", theme);
  return url.toString();
}

export function SignalFrame(): ReactNode {
  const t = useTranslations("Signal");
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";
  const src = mounted && SIGNAL_EMBED_URL ? embedSrc(theme) : null;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(!SIGNAL_EMBED_URL);

  useEffect(() => {
    if (ready || !SIGNAL_EMBED_URL) return;
    const id = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <div className="relative min-h-[calc(100svh-5.75rem)]">
      {!ready && !failed ? (
        <div className="bg-background absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-foreground/55 text-sm font-medium tracking-tight">
            {t("loading")}
          </p>
        </div>
      ) : null}

      {failed && !ready ? (
        <div className="bg-background absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-foreground/70 max-w-[36ch] text-sm leading-relaxed">
            {t("unavailable")}
          </p>
          <a
            href={SIGNAL_ORIGIN}
            target="_blank"
            rel="noreferrer"
            className="focus-ring bg-foreground text-background inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
          >
            {t("openInTab")}
          </a>
        </div>
      ) : null}

      {src ? (
        <iframe
          title="Signal"
          src={src}
          className="bg-background absolute inset-0 h-full w-full border-0"
          allow="autoplay"
          onLoad={() => {
            setReady(true);
            setFailed(false);
          }}
        />
      ) : null}
    </div>
  );
}
