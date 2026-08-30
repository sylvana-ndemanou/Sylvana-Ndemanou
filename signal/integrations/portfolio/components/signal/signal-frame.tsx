"use client";

import { SIGNAL_EMBED_URL, SIGNAL_ORIGIN } from "@/lib/signal";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";

const LOAD_TIMEOUT_MS = 12_000;

export function SignalFrame(): ReactNode {
  const t = useTranslations("Signal");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <div className="relative min-h-[calc(100svh-5.75rem)]">
      {!ready && !failed ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <p className="text-sm font-medium tracking-tight text-foreground/55">
            {t("loading")}
          </p>
        </div>
      ) : null}

      {failed && !ready ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="max-w-[36ch] text-sm leading-relaxed text-foreground/70">
            {t("unavailable")}
          </p>
          <a
            href={SIGNAL_ORIGIN}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            {t("openInTab")}
          </a>
        </div>
      ) : null}

      <iframe
        title="Signal"
        src={SIGNAL_EMBED_URL}
        className="absolute inset-0 h-full w-full border-0 bg-background"
        allow="autoplay"
        onLoad={() => {
          setReady(true);
          setFailed(false);
        }}
      />
    </div>
  );
}
