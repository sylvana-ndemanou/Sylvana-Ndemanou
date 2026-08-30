"use client";

import { GamePlayer } from "@s/components/game-player";
import { GamesHub } from "@s/components/games-hub";
import { PlayHoverRoot } from "@s/components/play-hover";
import { AudioRoot } from "@s/components/sound-toggle";
import { SignalBasePathProvider } from "@s/lib/base-path";
import type { GameSlug } from "@s/lib/games";
import { SignalLocaleProvider } from "@s/lib/i18n";
import type { Locale } from "@s/lib/locale";
import type { ReactNode } from "react";

export function SignalApp({
  locale,
  basePath,
  slug,
}: {
  locale: string;
  basePath: string;
  slug?: GameSlug;
}): ReactNode {
  const signalLocale: Locale = locale === "en" ? "en" : "fr";

  return (
    <div className="signal-root flex min-h-[calc(100svh-5.75rem)] flex-1 flex-col">
      <SignalLocaleProvider locale={signalLocale}>
        <SignalBasePathProvider basePath={basePath}>
          <AudioRoot />
          <PlayHoverRoot>
            {slug ? <GamePlayer slug={slug} /> : <GamesHub />}
          </PlayHoverRoot>
        </SignalBasePathProvider>
      </SignalLocaleProvider>
    </div>
  );
}
