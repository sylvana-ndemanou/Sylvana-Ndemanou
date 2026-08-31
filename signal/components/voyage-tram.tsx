// @ts-nocheck
"use client";

import { play } from "@s/lib/audio";
import { cn } from "@s/lib/utils";

type Stop = { t: number; label: string; rows?: string };

export function VoyageTram({
  events,
  head,
  locked,
  onHead,
  kicker,
  ticket,
  rewindHint,
}: {
  events: Stop[];
  head: number;
  locked?: boolean;
  onHead: (i: number) => void;
  kicker: string;
  ticket: string;
  rewindHint: string;
}) {
  const n = Math.max(1, events.length);
  const progress = n === 1 ? 0 : head / (n - 1);
  const current = events[head];
  const lost = (label: string) => /perdu|gone|trop tard|too late|0 jour|0 day/i.test(label);
  const fail = (label: string) => /fail-safe|failsafe/i.test(label);
  const city = current?.rows?.split("·")[1]?.trim() || current?.label || "";

  return (
    <div className="voyage-map overflow-hidden rounded-[1.6rem] border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{kicker}</p>
        <span className="voyage-ticket font-mono text-[10px] uppercase tracking-[0.18em]">{ticket}</span>
      </div>

      <div className="voyage-sky mt-4 overflow-hidden rounded-[1.2rem]">
        <div className="voyage-skyline" data-city={city.toLowerCase()} aria-hidden />
        <div className="voyage-track relative mx-3 mt-8 mb-3 h-28">
          <div className="voyage-rails" aria-hidden />
          <div
            className="voyage-tram"
            style={{ left: `calc(${progress * 100}% )` }}
            aria-hidden
          >
            <svg viewBox="0 0 88 44" className="h-11 w-[5.5rem]">
              <rect x="6" y="12" width="70" height="22" rx="6" fill="currentColor" />
              <rect x="12" y="16" width="12" height="10" rx="2" className="voyage-window" />
              <rect x="28" y="16" width="12" height="10" rx="2" className="voyage-window" />
              <rect x="44" y="16" width="12" height="10" rx="2" className="voyage-window" />
              <rect x="60" y="16" width="10" height="10" rx="2" className="voyage-window" />
              <circle cx="72" cy="28" r="2.2" fill="#f8f4c4" opacity="0.95" />
              <circle cx="22" cy="36" r="4.5" className="voyage-wheel" />
              <circle cx="60" cy="36" r="4.5" className="voyage-wheel" />
              <path d="M40 12 V4 H48" className="voyage-pantograph" />
            </svg>
          </div>
          <div className="absolute inset-x-1 top-[3.15rem] flex justify-between">
            {events.map((ev, i) => (
              <button
                key={`${ev.t}-${i}`}
                type="button"
                disabled={locked}
                onClick={() => {
                  onHead(i);
                  play("rewind");
                }}
                className="relative z-[1] flex flex-1 flex-col items-center"
              >
                <span
                  className={cn(
                    "voyage-stop",
                    i === head && "voyage-stop-here",
                    i !== head && lost(ev.label) && "voyage-stop-lost",
                    i !== head && fail(ev.label) && !lost(ev.label) && "voyage-stop-fail"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {events.map((ev, i) => (
          <button
            key={`${ev.label}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => {
              onHead(i);
              play("rewind");
            }}
            className={cn(
              "rounded-xl px-1.5 py-2 font-mono text-[10px] leading-tight transition",
              i === head
                ? "bg-primary text-primary-foreground shadow-[0_8px_22px_-12px_color-mix(in_oklch,var(--primary)_70%,transparent)]"
                : "bg-muted/80 text-muted-foreground hover:-translate-y-0.5 hover:bg-muted"
            )}
          >
            {ev.label}
          </button>
        ))}
      </div>

      <input
        type="range"
        min={0}
        max={n - 1}
        value={head}
        disabled={locked}
        onChange={(e) => {
          onHead(Number(e.target.value));
          play("rewind");
        }}
        className="voyage-slider mt-4 w-full"
        aria-label={rewindHint}
      />

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-heading text-2xl leading-none">{current?.rows || "—"}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{rewindHint}</p>
      </div>
    </div>
  );
}
