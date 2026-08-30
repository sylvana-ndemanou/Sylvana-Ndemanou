"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { GameLobby } from "@/components/game-lobby";
import { BoardCapture } from "@/components/ranked-board";
import { Button } from "@/components/ui/button";
import { play } from "@/lib/audio";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function GameShell({
  title,
  round,
  total,
  score,
  maxScore,
  children,
  footer,
}: {
  title: string;
  round: number;
  total: number;
  score: number;
  maxScore: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div
      className="flex min-h-full flex-1 flex-col"
      onPointerDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("button, a")) {
          play("tap");
        }
      }}
    >
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/" />}>
          <ArrowLeft />
          {t.shell.games}
        </Button>
        <p className="font-heading text-xl tracking-tight sm:text-2xl">{title}</p>
        <p className="font-mono text-sm text-muted-foreground">
          <span key={score} className="score-pop text-foreground">
            {score}
          </span>
          /{maxScore}
        </p>
      </header>
      <div className="flex items-center justify-center gap-2 px-4">
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
      <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
        {Math.min(round + 1, total)} / {total}
      </p>
      <div
        key={round}
        className="scene-round mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-6"
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
}: {
  tone: "ok" | "mid" | "miss";
  title: string;
  lesson: string;
  onNext: () => void;
  nextLabel?: string;
}) {
  const { t } = useI18n();
  useEffect(() => {
    play(tone);
  }, [tone, title]);
  return (
    <div className="reveal-up mt-auto space-y-5 rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_12%,transparent)] backdrop-blur">
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
        {nextLabel ?? t.shell.next}
      </Button>
    </div>
  );
}

export function Intro({
  title,
  how,
  onStart,
}: {
  title: string;
  how: string;
  onStart: () => void;
}) {
  return <GameLobby title={title} how={how} onStart={onStart} />;
}

export function Result({
  title,
  score,
  max,
  line,
  onReplay,
}: {
  title: string;
  score: number;
  max: number;
  line: string;
  onReplay: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    play("score");
  }, [score]);
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/" />}>
          <ArrowLeft />
          {t.shell.games}
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        <p className="font-heading mt-4 text-7xl tabular-nums sm:text-8xl [animation:scene-up_0.65s_cubic-bezier(0.22,1,0.36,1)_both]">
          {score.toFixed(score % 1 === 0 ? 0 : 1)}
          <span className="text-3xl text-muted-foreground">/{max}</span>
        </p>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-foreground/90">{line}</p>
        <BoardCapture score={score} max={max} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base" onClick={onReplay}>
            {t.shell.replay}
          </Button>
          <Button nativeButton={false} variant="outline" size="lg" className="h-12 px-8 text-base" render={<Link href="/" />}>
            {t.shell.all}
          </Button>
        </div>
      </div>
    </div>
  );
}
