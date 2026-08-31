// @ts-nocheck
"use client";

import { SignalLink } from "@s/components/signal-link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GameLobby } from "@s/components/game-lobby";
import { BoardCapture } from "@s/components/ranked-board";
import { Button } from "@s/components/ui/button";
import { play, setAudioPalette } from "@s/lib/audio";
import { useI18n } from "@s/lib/i18n";
import { usePlaySession } from "@s/components/play-session";
import type { GameSlug } from "@s/lib/games";
import { scoreLine } from "@s/lib/feedback";
import { PLAY_UI } from "@s/lib/play-copy";
import { PlayWorld } from "@s/components/play-world";
import { heat } from "@s/lib/play";
import { cn } from "@s/lib/utils";

export function GameShell({
  slug,
  title,
  round,
  total,
  score,
  maxScore,
  children,
  footer,
}: {
  slug?: GameSlug;
  title?: string;
  round: number;
  total: number;
  score: number;
  maxScore: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  const heading = title ?? (slug ? t.games[slug].name : "");
  const session = usePlaySession();
  const pressure = heat(session.difficulty, round, total);
  useEffect(() => {
    setAudioPalette(session.slug);
    return () => setAudioPalette(null);
  }, [session.slug]);
  const diffLabel =
    session.difficulty === "easy"
      ? t.lobby.easy
      : session.difficulty === "hard"
        ? t.lobby.hard
        : t.lobby.brutal;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Button nativeButton={false} variant="ghost" size="sm" render={<SignalLink href="/" />}>
          <ArrowLeft />
          {t.shell.games}
        </Button>
        <p className="font-heading text-xl tracking-tight sm:text-2xl">{heading}</p>
        <p className="font-mono text-sm text-muted-foreground">
          <span key={score} className="score-pop text-foreground">
            {score}
          </span>
          /{maxScore}
        </p>
      </header>
      <div className="flex flex-col items-center gap-2 px-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i < round && "w-8 bg-primary",
                i === round && "tick-active w-10 bg-primary shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_55%,transparent)]",
                i > round && "w-8 bg-foreground/15"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>
            {Math.min(round + 1, total)} / {total}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 tracking-[0.12em]",
              session.difficulty === "brutal"
                ? "bg-anomaly/15 text-anomaly"
                : "bg-primary/12 text-signal"
            )}
          >
            {diffLabel}
          </span>
          <span className="inline-flex items-center gap-1.5" title={t.shell.pressure}>
            <span>{t.shell.pressure}</span>
            <span className="heat-rail" aria-hidden>
              <span className="heat-fill" style={{ width: `${Math.round(pressure * 100)}%` }} />
            </span>
          </span>
        </div>
      </div>
      <div
        key={round}
        className="scene-round mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6"
      >
        {children}
      </div>
      {footer ? <div className="px-4 pb-8 sm:px-8">{footer}</div> : null}
    </div>
  );
}

export function RoundHeader({
  kicker,
  context,
  question,
}: {
  kicker?: string;
  context?: string;
  question: string;
}) {
  const { t } = useI18n();
  const label = kicker ?? t.shell.situation;
  return (
    <div className="text-center">
      {context ? (
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          <span className="scene-context-kicker mb-2 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            <span className="pulse-dot size-1.5 rounded-full bg-primary" />
            {label}
          </span>
          {context}
        </p>
      ) : null}
      <h2 className="mt-3 font-heading text-2xl leading-snug sm:text-3xl">{question}</h2>
    </div>
  );
}

export function Verdict({
  tone,
  title,
  lesson,
  onNext,
  nextLabel,
  isLast,
}: {
  tone: "ok" | "mid" | "miss";
  title: string;
  lesson: string;
  onNext: () => void;
  nextLabel?: string;
  isLast?: boolean;
}) {
  const { t } = useI18n();
  const label = nextLabel ?? (isLast ? t.shell.score : t.shell.next);
  useEffect(() => {
    play(tone);
  }, [tone, title]);
  return (
    <div className="verdict-card reveal-up mt-10 shrink-0 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_-18px_color-mix(in_oklch,var(--foreground)_22%,transparent),0_0_0_1px_color-mix(in_oklch,var(--primary)_12%,transparent)]">
      <div className={cn("verdict-tone", `verdict-tone-${tone}`)} />
      <div>
        <p
          className={cn(
            "font-heading text-2xl",
            tone === "ok" && "text-ok",
            tone === "mid" && "text-chart-3",
            tone === "miss" && "text-anomaly"
          )}
        >
          {title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson}</p>
      </div>
      <Button size="lg" className="h-11 w-full text-base" onClick={onNext}>
        {label}
      </Button>
    </div>
  );
}

export function Intro({
  slug,
  title,
  how,
  onStart,
}: {
  slug?: GameSlug;
  title?: string;
  how?: string;
  onStart: () => void;
}) {
  const { t } = useI18n();
  return (
    <GameLobby
      title={title ?? (slug ? t.games[slug].name : "")}
      how={how ?? (slug ? t.games[slug].how : "")}
      onStart={onStart}
    />
  );
}

export function Result({
  slug,
  title,
  score,
  max,
  line,
  onReplay,
}: {
  slug?: GameSlug;
  title?: string;
  score: number;
  max: number;
  line?: string;
  onReplay: () => void;
}) {
  const { t, locale } = useI18n();
  const heading = title ?? (slug ? t.games[slug].name : "");
  const blurb = line ?? scoreLine(score, max, locale);
  const session = usePlaySession();
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const diffLabel =
    session.difficulty === "easy"
      ? t.lobby.easy
      : session.difficulty === "hard"
        ? t.lobby.hard
        : t.lobby.brutal;
  useEffect(() => {
    play("score");
  }, [score]);
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Button nativeButton={false} variant="ghost" size="sm" render={<SignalLink href="/" />}>
          <ArrowLeft />
          {t.shell.games}
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{heading}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
          {diffLabel} · {t.lobby.rounds(session.rounds)}
        </p>
        <p className="font-heading mt-4 text-7xl tabular-nums sm:text-8xl [animation:scene-up_0.65s_cubic-bezier(0.22,1,0.36,1)_both]">
          {score.toFixed(score % 1 === 0 ? 0 : 1)}
          <span className="text-3xl text-muted-foreground">/{max}</span>
        </p>
        <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-foreground/10">
          <span className="score-fill block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/90">{blurb}</p>
        <BoardCapture score={score} max={max} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base" onClick={onReplay}>
            {t.shell.replay}
          </Button>
          <Button nativeButton={false} variant="outline" size="lg" className="h-12 px-8 text-base" render={<SignalLink href="/" />}>
            {t.shell.all}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useBriefRound(index: number, active: boolean) {
  const [brief, setBrief] = useState(true);
  useEffect(() => {
    if (!active) return;
    setBrief(true);
  }, [index, active]);
  const go = useCallback(() => setBrief(false), []);
  return { brief: Boolean(active && brief), go };
}

export function QuestionBeat({
  context,
  question,
  onGo,
  kicker,
}: {
  context?: string;
  question: string;
  onGo: () => void;
  kicker?: string;
}) {
  const { t, locale } = useI18n();
  const session = usePlaySession();
  const ui = PLAY_UI[locale];
  useEffect(() => {
    play("tick");
    const id = window.setTimeout(onGo, 4200);
    return () => window.clearTimeout(id);
  }, [onGo, question]);
  return (
    <button
      type="button"
      onClick={onGo}
      className={cn(
        "question-beat mx-auto flex min-h-[52vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center",
        session.slug && `question-beat-${session.slug}`
      )}
    >
      <p className="scene-context-kicker flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
        <span className="pulse-dot size-1.5 rounded-full bg-primary" />
        {kicker ?? t.shell.situation}
      </p>
      {context ? (
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">{context}</p>
      ) : null}
      <h2 className="font-heading mt-6 max-w-xl text-[clamp(1.45rem,4.2vw,2.35rem)] leading-tight">{question}</h2>
      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{ui.briefHint}</p>
      <span className="mt-3 inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
        {ui.briefContinue}
      </span>
    </button>
  );
}

export function PlayStage({
  slug,
  children,
  className,
}: {
  slug: GameSlug;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("play-stage", `play-stage-${slug}`, className)}>
      <PlayWorld slug={slug} />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
