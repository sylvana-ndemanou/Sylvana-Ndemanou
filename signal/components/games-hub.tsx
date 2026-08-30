// @ts-nocheck
"use client";

import { SignalLink } from "@s/components/signal-link";
import { useMemo, useSyncExternalStore } from "react";
import { DustBanner } from "@s/components/dust-banner";
import { GameMark, GamePreview, PlayLink } from "@s/components/game-previews";
import { Button } from "@s/components/ui/button";
import { GAMES, MAX_SCORE, TRACKS, type GameTrack } from "@s/lib/games";
import { useI18n } from "@s/lib/i18n";
import { usePlayHover } from "@s/components/play-hover";
import { play } from "@s/lib/audio";
import { AUTHOR_NAME, PORTFOLIO_URL } from "@s/lib/site";
import {
  getScoresServerSnapshot,
  getScoresSnapshot,
  subscribeScores,
  type ScoreMap,
} from "@s/lib/scores";

function GameGrid({ track, scores }: { track: GameTrack; scores: ScoreMap }) {
  const { t } = useI18n();
  const { enter, leave } = usePlayHover();
  const games = GAMES.filter((game) => game.track === track);
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {games.map((game, i) => {
        const record = scores[game.slug];
        const copy = t.games[game.slug];
        return (
          <li
            key={game.slug}
            className="reveal-up game-card group/card relative z-0 flex flex-col overflow-visible rounded-3xl border border-border bg-card transition duration-300 hover:z-20 hover:-translate-y-1 hover:border-primary/40"
            style={{ animationDelay: `${i * 70}ms` }}
            onPointerEnter={() => {
              play("grain");
              enter(game.slug);
            }}
            onPointerLeave={() => leave(game.slug)}
          >
            <div className="relative z-10 flex flex-1 flex-col overflow-visible p-5 pb-9">
              <div className="flex items-center gap-3">
                <span
                  className="game-mark-tile flex size-11 shrink-0 items-center justify-center text-[oklch(0.16_0.04_122)]"
                  style={{ background: game.accent }}
                >
                  <GameMark slug={game.slug} live />
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading text-3xl leading-none tracking-tight">{copy.name}</h3>
                  {record ? (
                    <p className="mt-1 font-mono text-xs text-signal">
                      {t.hub.played(record.best, MAX_SCORE)}
                    </p>
                  ) : (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{t.hub.idle}</p>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.tagline}</p>
              <PlayLink game={game} verb={copy.verb} />
            </div>
            <GamePreview slug={game.slug} />
          </li>
        );
      })}
    </ul>
  );
}

export function GamesHub() {
  const { t } = useI18n();
  const raw = useSyncExternalStore(subscribeScores, getScoresSnapshot, getScoresServerSnapshot);
  const scores = useMemo<ScoreMap>(() => {
    if (!raw) return {};
    try {
      return JSON.parse(raw) as ScoreMap;
    } catch {
      return {};
    }
  }, [raw]);

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-14 sm:px-8"
      onPointerDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("button, a")) {
          play("tap");
        }
      }}
    >
      <header className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-6xl leading-none tracking-tight sm:text-8xl">Signal</h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.hub.lede}
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-border bg-card/60 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t.hub.principle}</p>
          <p className="mt-2 text-sm leading-relaxed">{t.hub.principleBody}</p>
        </div>
      </header>

      {TRACKS.map((track) => {
        const copy = t.tracks[track.id];
        return (
          <section
            key={track.id}
            id={track.id}
            data-track-section={track.id}
            className="mt-14 scroll-mt-28"
          >
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-signal">{copy.kicker}</p>
            <h2 className="font-heading mt-1 text-3xl tracking-tight sm:text-4xl">{copy.title}</h2>
            <p className="mt-2 mb-6 max-w-xl text-muted-foreground">{copy.blurb}</p>
            <GameGrid track={track.id} scores={scores} />
          </section>
        );
      })}

      <DustBanner className="dark mt-16 rounded-3xl border border-white/10 bg-[oklch(0.11_0.02_118)]">
        <div className="relative z-[1] flex flex-col gap-8 px-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-12">
          <div className="max-w-md">
            <h2 className="font-heading text-4xl tracking-tight text-foreground sm:text-5xl">
              {t.hub.dustTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t.hub.dustBody}
            </p>
          </div>
          <Button
            nativeButton={false}
            size="lg"
            className="relative z-[2] h-12 self-start px-6 text-base sm:self-auto"
            render={<SignalLink href="/play/schema" />}
          >
            {t.hub.dustCta}
          </Button>
        </div>
      </DustBanner>

      <footer className="mt-12 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          {t.hub.footerAuthor}{" "}
          <a href={PORTFOLIO_URL} className="text-foreground underline-offset-4 hover:underline">
            {AUTHOR_NAME}
          </a>
          .
        </p>
        <p>{t.hub.footerScores}</p>
      </footer>
    </div>
  );
}
