// @ts-nocheck
"use client";

import { SignalLink } from "@s/components/signal-link";
import { useState, type ReactNode } from "react";
import { ArrowLeft, CalendarDays, Check, Link2, User, Users } from "lucide-react";
import { GamePreview } from "@s/components/game-previews";
import { BoardOrb, RankedBoard } from "@s/components/ranked-board";
import { Button, buttonVariants } from "@s/components/ui/button";
import { usePlaySession } from "@s/components/play-session";
import { play } from "@s/lib/audio";
import { useI18n } from "@s/lib/i18n";
import { difficultiesFor, type Difficulty } from "@s/lib/play";
import { cn } from "@s/lib/utils";

export function GameLobby({
  title,
  how,
  onStart,
}: {
  title: string;
  how: string;
  onStart: () => void;
}) {
  const { t } = useI18n();
  const session = usePlaySession();
  const levels = difficultiesFor(session.slug);
  const [invite, setInvite] = useState(session.mode === "multi");
  const [copied, setCopied] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const labels: Record<Difficulty, string> = {
    easy: t.lobby.easy,
    hard: t.lobby.hard,
    brutal: t.lobby.brutal,
  };

  function startSolo() {
    session.setMode("solo");
    play("start");
    onStart();
  }

  function startDaily() {
    session.setMode("daily");
    play("start");
    onStart();
  }

  function openMulti() {
    play("tap");
    session.ensureRoom();
    setInvite(true);
  }

  async function copyInvite() {
    const room = session.ensureRoom();
    const url =
      session.inviteUrl ||
      `${window.location.origin}${window.location.pathname}?mode=multi&d=${session.difficulty}&seed=${room}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      play("ok");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      play("miss");
    }
  }

  function startMulti() {
    session.ensureRoom();
    play("start");
    onStart();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <Button nativeButton={false} variant="ghost" size="sm" render={<SignalLink href="/" />}>
          <ArrowLeft />
          {t.shell.games}
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center px-4 pb-8 sm:px-8">
        <div className="group/card flex w-full max-w-lg min-h-[min(40rem,calc(100dvh-9.5rem))] flex-1 flex-col rounded-[2rem] border border-border bg-card px-7 py-8 shadow-[0_20px_60px_color-mix(in_oklch,var(--foreground)_8%,transparent)] sm:px-8 sm:py-10">
          <h1 className="font-heading text-5xl tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-3 max-w-sm text-[13px] leading-5 text-muted-foreground">{how}</p>
          <p className="mt-3 font-mono text-[11px] text-signal">
            {t.lobby.rounds(session.rounds)} · {labels[session.difficulty]}
          </p>
          <div className="mt-6 min-h-0 flex-1">
            <GamePreview slug={session.slug} className="h-full min-h-[11rem] rounded-2xl" />
          </div>

          {invite ? (
            <div className="mt-8 space-y-6">
              <div>
                <p className="font-heading text-3xl tracking-tight">{t.lobby.inviteTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.lobby.inviteBody}</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t.lobby.room}</span>
                <span className="font-heading text-3xl tracking-[0.2em]">{session.seed.slice(0, 6)}</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="h-12 flex-1 text-base" onClick={copyInvite}>
                  {copied ? <Check /> : <Link2 />}
                  {copied ? t.lobby.copied : t.lobby.copyLink}
                </Button>
                <Button size="lg" variant="outline" className="h-12 flex-1 text-base" onClick={startMulti}>
                  {t.lobby.play}
                </Button>
              </div>
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => {
                  session.setMode("solo");
                  setInvite(false);
                }}
              >
                {t.lobby.back}
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {t.lobby.mode}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <ModeOrb
                    label={t.lobby.solo}
                    active={session.mode === "solo"}
                    onClick={() => {
                      play("tap");
                      session.setMode("solo");
                    }}
                  >
                    <User />
                  </ModeOrb>
                  <ModeOrb label={t.lobby.multi} active={session.mode === "multi"} onClick={openMulti}>
                    <Users />
                  </ModeOrb>
                  <ModeOrb
                    label={t.lobby.daily}
                    active={session.mode === "daily"}
                    featured
                    onClick={() => {
                      play("tap");
                      session.setMode("daily");
                    }}
                  >
                    <CalendarDays />
                  </ModeOrb>
                  <BoardOrb
                    label={t.board.open}
                    onClick={() => {
                      play("tap");
                      setBoardOpen(true);
                    }}
                  />
                </div>
                <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  {session.mode === "daily"
                    ? t.lobby.dailyHint(new Date().toISOString().slice(0, 10))
                    : session.mode === "multi"
                      ? t.lobby.multiHint
                      : t.lobby.soloHint}
                </p>
              </div>

              <DifficultyStrip
                levels={levels}
                value={session.difficulty}
                labels={labels}
                onChange={(level) => {
                  play("tap");
                  session.setDifficulty(level);
                }}
              />

              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "relative z-10 h-12 w-full text-base"
                )}
                onClick={() => {
                  if (session.mode === "daily") startDaily();
                  else startSolo();
                }}
              >
                {t.lobby.start}
              </button>
            </div>
          )}
        </div>
      </div>
      <RankedBoard open={boardOpen} onClose={() => setBoardOpen(false)} />
    </div>
  );
}

function ModeOrb({
  label,
  active,
  featured,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  featured?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="group/orb"
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-full border transition-[transform,background-color,border-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "[&_svg]:size-5 [&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover/orb:-translate-y-0.5 group-hover/orb:[&_svg]:scale-110 group-hover/orb:[&_svg]:-rotate-8",
          active
            ? "border-primary bg-primary text-primary-foreground shadow-[0_0_22px_color-mix(in_oklch,var(--primary)_40%,transparent)] group-hover/orb:shadow-[0_0_34px_color-mix(in_oklch,var(--primary)_55%,transparent)]"
            : "border-foreground/20 bg-transparent text-muted-foreground group-hover/orb:border-primary group-hover/orb:bg-primary/18 group-hover/orb:text-primary group-hover/orb:shadow-[0_0_22px_color-mix(in_oklch,var(--primary)_32%,transparent)]",
          featured && !active && "ring-1 ring-primary/45 ring-offset-2 ring-offset-card"
        )}
      >
        {children}
      </span>
    </button>
  );
}

function DifficultyStrip({
  levels,
  value,
  labels,
  onChange,
}: {
  levels: Difficulty[];
  value: Difficulty;
  labels: Record<Difficulty, string>;
  onChange: (level: Difficulty) => void;
}) {
  const { t } = useI18n();
  const index = Math.max(0, levels.indexOf(value));

  function move(delta: number) {
    const next = levels[index + delta];
    if (next) onChange(next);
  }

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {t.lobby.difficulty}
      </p>
      <div
        role="radiogroup"
        aria-label={t.lobby.difficulty}
        className="mt-2 grid grid-cols-3 gap-2"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            move(-1);
          }
        }}
      >
        {levels.map((level) => {
          const on = level === value;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={labels[level]}
              onClick={() => onChange(level)}
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-left transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                on && "border-primary bg-primary/12 shadow-[0_0_22px_color-mix(in_oklch,var(--primary)_22%,transparent)]",
                !on && "border-border bg-muted/30 hover:border-primary/40",
                on && level === "brutal" && "border-anomaly bg-anomaly/10 shadow-[0_0_22px_color-mix(in_oklch,var(--anomaly)_28%,transparent)]"
              )}
            >
              <span className="block text-[13px] font-medium leading-none tracking-tight">{labels[level]}</span>
              <span
                className={cn(
                  "mt-1.5 block font-mono text-[10px] uppercase tracking-wider",
                  on ? "text-foreground/70" : "text-muted-foreground"
                )}
              >
                {t.lobby.diffRounds[level]}
              </span>
              <span className="mt-2 flex gap-0.5" aria-hidden>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      i <= (level === "easy" ? 0 : level === "hard" ? 1 : 2)
                        ? level === "brutal"
                          ? "bg-anomaly"
                          : "bg-primary"
                        : "bg-foreground/12"
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{t.lobby.diffHint[value]}</p>
    </div>
  );
}
