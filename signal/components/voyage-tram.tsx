// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { play, startTrainRoll, stopTrainRoll, trainBell } from "@s/lib/audio";
import { cn } from "@s/lib/utils";

type Stop = { t: number; label: string; rows?: string };

const TRAIN_W = 220;
const ENTER_X = -260;
const SPEED_PX = 168;

function stopX(head: number, n: number, width: number) {
  const pad = Math.min(width * 0.42, Math.max(TRAIN_W / 2 + 32, width * 0.2));
  const inner = Math.max(1, width - pad * 2);
  const t = n <= 1 ? 0.5 : head / (n - 1);
  return pad + t * inner;
}

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
  const current = events[head];
  const lost = (label: string) => /perdu|gone|trop tard|too late|0 jour|0 day/i.test(label);
  const fail = (label: string) => /fail-safe|failsafe/i.test(label);
  const city = current?.rows?.split("·")[1]?.trim() || current?.label || "";

  const trackRef = useRef(null);
  const xRef = useRef(ENTER_X);
  const targetRef = useRef(ENTER_X);
  const wheelRef = useRef(0);
  const rollingRef = useRef(false);
  const bellRef = useRef(false);
  const reducedRef = useRef(false);
  const [pose, setPose] = useState({ x: ENTER_X, wheel: 0, rolling: true });

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const aim = () => {
      const next = stopX(head, n, el.clientWidth || 1);
      targetRef.current = next;
    };
    aim();
    const ro = new ResizeObserver(aim);
    ro.observe(el);
    return () => ro.disconnect();
  }, [head, n]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let postedX = ENTER_X;
    let postedRoll = true;
    const tick = (now: number) => {
      const speed = reducedRef.current ? SPEED_PX * 2.4 : SPEED_PX;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = targetRef.current;
      let x = xRef.current;
      const dx = target - x;
      const moving = Math.abs(dx) > 1.2;
      if (moving) {
        const step = speed * dt * Math.sign(dx);
        x = Math.abs(step) > Math.abs(dx) ? target : x + step;
        wheelRef.current += (x - xRef.current) * 1.35;
        if (!rollingRef.current) {
          rollingRef.current = true;
          if (!bellRef.current) {
            bellRef.current = true;
            if (!reducedRef.current) trainBell();
          }
          if (!reducedRef.current) startTrainRoll();
        }
      } else {
        x = target;
        if (rollingRef.current) {
          rollingRef.current = false;
          stopTrainRoll();
        }
      }
      xRef.current = x;
      if (Math.abs(x - postedX) > 0.4 || rollingRef.current !== postedRoll) {
        postedX = x;
        postedRoll = rollingRef.current;
        setPose({ x, wheel: wheelRef.current, rolling: rollingRef.current });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stopTrainRoll();
    };
  }, []);

  function jump(i: number) {
    onHead(i);
    play("tap");
  }

  return (
    <div className="voyage-map overflow-hidden rounded-[1.6rem] border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{kicker}</p>
        <span className="voyage-ticket font-mono text-[10px] uppercase tracking-[0.18em]">{ticket}</span>
      </div>

      <div className="voyage-sky mt-4 rounded-[1.2rem]">
        <div className={cn("voyage-skyline", pose.rolling && "voyage-skyline-live")} data-city={city.toLowerCase()} aria-hidden />
        <div ref={trackRef} className="voyage-track relative mx-2 mt-6 mb-2 h-[7.25rem]">
          <div className={cn("voyage-wire")} aria-hidden />
          <div className={cn("voyage-rails", pose.rolling && "voyage-rails-live")} aria-hidden />
          <div
            className={cn("voyage-tram", pose.rolling && "voyage-tram-live")}
            style={{ transform: `translateX(${pose.x - TRAIN_W / 2}px)` }}
            aria-hidden
          >
            <TrainConsist wheel={pose.wheel} rolling={pose.rolling} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-[4.35rem] h-8">
            {events.map((ev, i) => {
              const t = n <= 1 ? 0.5 : i / (n - 1);
              const pad = Math.min(trackRef.current?.clientWidth * 0.42 || TRAIN_W, Math.max(TRAIN_W / 2 + 32, (trackRef.current?.clientWidth || 1) * 0.2));
              return (
                <button
                  key={`${ev.t}-${i}`}
                  type="button"
                  disabled={locked}
                  onClick={() => jump(i)}
                  className="pointer-events-auto absolute top-0 z-[1] flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `calc(${pad}px + (100% - ${pad * 2}px) * ${t})` }}
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
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {events.map((ev, i) => (
          <button
            key={`${ev.label}-${i}`}
            type="button"
            disabled={locked}
            onClick={() => jump(i)}
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
        onChange={(e) => jump(Number(e.target.value))}
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

function TrainConsist({ wheel, rolling }: { wheel: number; rolling: boolean }) {
  return (
    <svg viewBox="0 0 220 72" className="h-[4.5rem] w-[13.75rem]" overflow="visible">
      <ellipse cx="188" cy="62" rx="48" ry="5" fill="currentColor" opacity="0.12" />
      <ellipse cx="78" cy="62" rx="44" ry="5" fill="currentColor" opacity="0.1" />
      {rolling ? (
        <g className="voyage-steam" fill="currentColor">
          <circle cx="198" cy="14" r="5" opacity="0.22" />
          <circle cx="208" cy="6" r="4" opacity="0.14" />
          <circle cx="190" cy="4" r="3.2" opacity="0.12" />
        </g>
      ) : null}
      <g fill="currentColor">
        <rect x="8" y="22" width="118" height="32" rx="6" />
        <rect x="126" y="18" width="82" height="36" rx="8" />
        <path d="M196 22 L214 28 V50 H196 Z" />
        <rect x="14" y="16" width="20" height="8" rx="2" opacity="0.85" />
      </g>
      <g className="voyage-window">
        <rect x="18" y="28" width="18" height="12" rx="2" />
        <rect x="42" y="28" width="18" height="12" rx="2" />
        <rect x="66" y="28" width="18" height="12" rx="2" />
        <rect x="90" y="28" width="18" height="12" rx="2" />
        <rect x="136" y="24" width="16" height="14" rx="2" />
        <rect x="156" y="24" width="16" height="14" rx="2" />
        <rect x="176" y="24" width="14" height="14" rx="2" />
      </g>
      <circle cx="208" cy="36" r="3" fill="#f8f4c4" opacity="0.95" />
      {rolling ? <ellipse cx="218" cy="36" rx="10" ry="4" fill="#f8f4c4" opacity="0.28" /> : null}
      <path d="M164 18 V6 H176 V10" className="voyage-pantograph" />
      <Wheel cx={32} cy={56} rot={wheel} />
      <Wheel cx={78} cy={56} rot={wheel} />
      <Wheel cx={148} cy={56} rot={wheel} />
      <Wheel cx={188} cy={56} rot={wheel} />
    </svg>
  );
}

function Wheel({ cx, cy, rot }: { cx: number; cy: number; rot: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <circle r="7.2" className="voyage-wheel" />
      <circle r="2.2" fill="currentColor" opacity="0.35" />
      <path d="M0 -7 V7 M-7 0 H7" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
    </g>
  );
}
