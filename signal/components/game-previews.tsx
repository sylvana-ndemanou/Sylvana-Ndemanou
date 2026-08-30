"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { GameMeta, GameSlug } from "@/lib/games";
import { Button } from "@/components/ui/button";
import { usePlayHover } from "@/components/play-hover";
import { cn } from "@/lib/utils";

function MarkSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function LiveSvg({ slug, children }: { slug: GameSlug; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("mark-live size-[22px] overflow-visible", `mark-${slug}`)}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function LiveMark({ slug }: { slug: GameSlug }) {
  switch (slug) {
    case "anomalie":
      return (
        <LiveSvg slug={slug}>
          <rect className="mark-bar" x="2.8" y="13" width="2.8" height="8" rx="0.8" stroke="none" />
          <rect className="mark-bar" x="7.2" y="9.5" width="2.8" height="11.5" rx="0.8" stroke="none" />
          <rect className="mark-bar" x="11.6" y="7" width="2.8" height="14" rx="0.8" stroke="none" />
          <rect className="mark-spike" x="16" y="3.2" width="2.8" height="17.8" rx="0.8" stroke="none" />
          <rect className="mark-bar" x="20.4" y="11" width="2.8" height="10" rx="0.8" stroke="none" />
        </LiveSvg>
      );
    case "graphique":
      return (
        <LiveSvg slug={slug}>
          <path
            className="mark-line"
            d="M3 16 L8 11 L12 13 L21 5"
            fill="none"
            strokeWidth="2"
          />
          <circle className="mark-dot" cx="21" cy="5" r="2.1" stroke="none" />
        </LiveSvg>
      );
    case "entonnoir":
      return (
        <LiveSvg slug={slug}>
          <path d="M4.5 4.5 H19.5 L14 12.2 V18.2 L10 20.2 V12.2 Z" fill="none" strokeWidth="1.7" />
          <circle className="mark-drop" cx="12" cy="5.5" r="1.5" stroke="none" />
        </LiveSvg>
      );
    case "memoire":
      return (
        <LiveSvg slug={slug}>
          <rect x="3.5" y="3.5" width="7.4" height="7.4" rx="1.4" fill="none" />
          <rect className="mark-fade" x="13.1" y="3.5" width="7.4" height="7.4" rx="1.4" fill="none" />
          <rect x="3.5" y="13.1" width="7.4" height="7.4" rx="1.4" fill="none" />
          <rect x="13.1" y="13.1" width="7.4" height="7.4" rx="1.4" fill="none" />
        </LiveSvg>
      );
    case "bruit":
      return (
        <LiveSvg slug={slug}>
          <rect className="mark-window" x="13.5" y="4" width="7" height="16" rx="1.4" fill="currentColor" fillOpacity="0.18" stroke="none" />
          <path
            className="mark-wave"
            d="M2.5 14 C6 7.5, 8.5 17, 12 11.5 C15.5 6, 17.5 16, 21.5 9"
            fill="none"
            strokeWidth="2"
          />
        </LiveSvg>
      );
    case "schema":
      return (
        <LiveSvg slug={slug}>
          <line className="mark-spoke" x1="12" y1="7.2" x2="12" y2="9.6" fill="none" />
          <line className="mark-spoke" x1="12" y1="14.4" x2="12" y2="16.8" fill="none" />
          <line className="mark-spoke" x1="7.2" y1="12" x2="9.6" y2="12" fill="none" />
          <line className="mark-spoke" x1="14.4" y1="12" x2="16.8" y2="12" fill="none" />
          <rect className="mark-fact" x="9.4" y="9.4" width="5.2" height="5.2" rx="1" stroke="none" />
          <circle className="mark-node" cx="12" cy="5.2" r="2" stroke="none" />
          <circle className="mark-node" cx="12" cy="18.8" r="2" stroke="none" />
          <circle className="mark-node" cx="5.2" cy="12" r="2" stroke="none" />
          <circle className="mark-node" cx="18.8" cy="12" r="2" stroke="none" />
        </LiveSvg>
      );
    case "pipeline":
      return (
        <LiveSvg slug={slug}>
          <path d="M3 12 H8.5 L11.5 8 H21" fill="none" strokeWidth="1.8" />
          <path d="M8.5 12 L11.5 16 H21" fill="none" strokeWidth="1.8" />
          <circle className="mark-packet" cx="4.2" cy="12" r="1.7" stroke="none" />
        </LiveSvg>
      );
    case "jointure":
      return (
        <LiveSvg slug={slug}>
          <circle className="mark-left" cx="9.2" cy="12" r="5.4" fill="none" strokeWidth="1.8" />
          <circle className="mark-right" cx="14.8" cy="12" r="5.4" fill="none" strokeWidth="1.8" />
        </LiveSvg>
      );
    case "grain":
      return (
        <LiveSvg slug={slug}>
          <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2" fill="none" strokeWidth="1.5" />
          <path d="M3.2 10.2 H20.8 M11.2 4.2 V19.8" fill="none" strokeWidth="1.3" />
          <rect className="mark-key" x="4.1" y="5.2" width="6.2" height="4.2" rx="0.6" stroke="none" />
          <rect className="mark-key" x="4.1" y="11.1" width="6.2" height="3.6" rx="0.6" stroke="none" />
        </LiveSvg>
      );
    case "entrepot":
      return (
        <LiveSvg slug={slug}>
          <rect x="5" y="16" width="14" height="4" rx="1" fill="none" />
          <rect className="mark-wh" x="8" y="6" width="8" height="10" rx="1.2" stroke="none" />
        </LiveSvg>
      );
    case "elagage":
      return (
        <LiveSvg slug={slug}>
          <rect className="mark-part" x="3" y="5" width="5" height="14" rx="1" stroke="none" />
          <rect x="9.5" y="5" width="5" height="14" rx="1" fill="none" />
          <rect className="mark-part" x="16" y="5" width="5" height="14" rx="1" stroke="none" opacity="0.35" />
        </LiveSvg>
      );
    case "voyage":
      return (
        <LiveSvg slug={slug}>
          <circle cx="7" cy="12" r="4" fill="none" />
          <circle cx="17" cy="12" r="4" fill="none" />
          <path d="M11 12 H13" fill="none" />
          <path className="mark-head" d="M16.2 8.2 L18.2 12 L16.2 15.8" fill="none" />
        </LiveSvg>
      );
    case "clone":
      return (
        <LiveSvg slug={slug}>
          <rect x="3.5" y="5" width="9" height="14" rx="1.4" fill="none" />
          <rect className="mark-ghost" x="11.5" y="5" width="9" height="14" rx="1.4" fill="none" />
        </LiveSvg>
      );
    case "flux":
      return (
        <LiveSvg slug={slug}>
          <circle className="mark-beat" cx="12" cy="12" r="6.5" fill="none" />
          <circle className="mark-beat-in" cx="12" cy="12" r="2.2" stroke="none" />
        </LiveSvg>
      );
  }
}

export function GameMark({ slug, live = false }: { slug: GameSlug; live?: boolean }) {
  if (live) return <LiveMark slug={slug} />;

  switch (slug) {
    case "anomalie":
      return (
        <MarkSvg>
          <path d="M4 18 V12 M8 18 V8 M12 18 V4 M16 18 V11 M20 18 V14" strokeLinecap="round" />
        </MarkSvg>
      );
    case "graphique":
      return (
        <MarkSvg>
          <circle cx="8" cy="14" r="3.5" />
          <path d="M13 17 L20 7" strokeLinecap="round" />
        </MarkSvg>
      );
    case "entonnoir":
      return (
        <MarkSvg>
          <path d="M5 5 H19 L14 12 V19 L10 21 V12 Z" />
        </MarkSvg>
      );
    case "memoire":
      return (
        <MarkSvg>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </MarkSvg>
      );
    case "bruit":
      return (
        <MarkSvg>
          <path d="M3 14 C6 8, 9 18, 12 12 C15 6, 18 16, 21 10" strokeLinecap="round" />
        </MarkSvg>
      );
    case "schema":
      return (
        <MarkSvg>
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <circle cx="12" cy="4.5" r="2" />
          <circle cx="12" cy="19.5" r="2" />
          <circle cx="4.5" cy="12" r="2" />
          <circle cx="19.5" cy="12" r="2" />
        </MarkSvg>
      );
    case "pipeline":
      return (
        <MarkSvg>
          <path d="M4 12 H9 L12 8 H20" strokeLinecap="round" />
          <path d="M4 12 H9 L12 16 H20" strokeLinecap="round" />
        </MarkSvg>
      );
    case "jointure":
      return (
        <MarkSvg>
          <circle cx="9" cy="12" r="5.5" />
          <circle cx="15" cy="12" r="5.5" />
        </MarkSvg>
      );
    case "grain":
      return (
        <MarkSvg>
          <path d="M8 11 V19 M8 11 C8 7 12 6 14 9" strokeLinecap="round" />
          <circle cx="14" cy="8" r="2" />
        </MarkSvg>
      );
    case "entrepot":
      return (
        <MarkSvg>
          <rect x="5" y="16" width="14" height="4" rx="1" />
          <rect x="8" y="5" width="8" height="11" rx="1.2" />
        </MarkSvg>
      );
    case "elagage":
      return (
        <MarkSvg>
          <rect x="4" y="5" width="4.5" height="14" rx="1" />
          <rect x="10" y="5" width="4.5" height="14" rx="1" />
          <rect x="16" y="5" width="4.5" height="14" rx="1" />
        </MarkSvg>
      );
    case "voyage":
      return (
        <MarkSvg>
          <circle cx="7.5" cy="12" r="4" />
          <circle cx="16.5" cy="12" r="4" />
          <path d="M11.5 12 H12.5" />
        </MarkSvg>
      );
    case "clone":
      return (
        <MarkSvg>
          <rect x="4" y="5" width="9" height="14" rx="1.4" />
          <rect x="11" y="5" width="9" height="14" rx="1.4" />
        </MarkSvg>
      );
    case "flux":
      return (
        <MarkSvg>
          <circle cx="12" cy="12" r="6.5" />
          <circle cx="12" cy="12" r="2" />
        </MarkSvg>
      );
  }
}

export function GamePreview({ slug, className }: { slug: GameSlug; className?: string }) {
  return (
    <div className={cn("preview-frame relative h-40 overflow-hidden rounded-b-3xl", className)}>
      <div className="preview-stage absolute inset-0">
        {slug === "anomalie" && <AnomalieStage />}
        {slug === "graphique" && <GraphiqueStage />}
        {slug === "entonnoir" && <EntonnoirStage />}
        {slug === "memoire" && <MemoireStage />}
        {slug === "bruit" && <BruitStage />}
        {slug === "schema" && <SchemaStage />}
        {slug === "pipeline" && <PipelineStage />}
        {slug === "jointure" && <JointureStage />}
        {slug === "grain" && <GrainStage />}
        {slug === "entrepot" && <EntrepotStage />}
        {slug === "elagage" && <ElagageStage />}
        {slug === "voyage" && <VoyageStage />}
        {slug === "clone" && <CloneStage />}
        {slug === "flux" && <FluxStage />}
      </div>
    </div>
  );
}

function AnomalieStage() {
  const weeks = [
    { h: 42, spike: false },
    { h: 50, spike: false },
    { h: 56, spike: false },
    { h: 78, spike: true },
    { h: 58, spike: false },
    { h: 63, spike: false },
    { h: 68, spike: false },
  ];
  return (
    <div className="ano-stage flex h-full flex-col px-4 pb-3 pt-3">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">
          <span className="pulse-dot size-1.5 rounded-full bg-anomaly" />
          CA hebdo
        </p>
        <p className="font-mono text-[9px] text-muted-foreground">7 sem. · un intrus</p>
      </div>
      <div className="relative min-h-0 flex-1 rounded-xl border border-border/70 bg-background/40 px-3 py-1.5">
        <div className="pointer-events-none absolute inset-x-3 top-6 bottom-5 flex flex-col justify-between">
          <span className="h-px bg-foreground/[0.07]" />
          <span className="h-px bg-foreground/[0.07]" />
          <span className="h-px bg-foreground/[0.07]" />
        </div>
        <div className="relative grid h-full grid-cols-7 grid-rows-[1rem_minmax(0,1fr)_0.85rem] gap-x-1.5">
          {weeks.map((week, i) => (
            <div key={`t-${i}`} className="flex items-end justify-center">
              {week.spike ? (
                <span className="ano-tag font-mono text-[8px] leading-none uppercase tracking-[0.12em] text-anomaly">
                  spike
                </span>
              ) : null}
            </div>
          ))}
          {weeks.map((week, i) => (
            <div key={`b-${i}`} className="flex min-h-0 items-end justify-center">
              <span
                className={cn("ano-bar block w-full max-w-7 self-end rounded-t-[0.45rem]", week.spike && "ano-spike")}
                style={{ height: `${week.h}%` }}
              />
            </div>
          ))}
          {weeks.map((week, i) => (
            <span
              key={`s-${i}`}
              className={cn(
                "self-end text-center font-mono text-[8px] leading-none tracking-wide",
                week.spike ? "text-anomaly" : "text-muted-foreground/70"
              )}
            >
              S{i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraphiqueStage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="relative h-[7.5rem] w-[13.75rem]">
        <div className="absolute left-0 top-4 size-[5.5rem] rounded-[0.85rem] border border-border bg-background/80 p-2.5 shadow-lg transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:-rotate-8">
          <svg viewBox="0 0 64 40" className="h-full w-full">
            <path d="M4 28 L18 18 L30 22 L46 8 L60 14" fill="none" stroke="var(--primary)" strokeWidth="2.4" />
          </svg>
        </div>
        <div className="absolute left-1/2 top-2 z-[1] size-[5.5rem] -translate-x-1/2 rounded-[0.85rem] border border-border bg-card p-2.5 shadow-xl transition-transform duration-300 group-hover/card:-translate-y-2">
          <svg viewBox="0 0 64 40" className="h-full w-full">
            <rect x="8" y="18" width="8" height="16" rx="1" fill="var(--primary)" />
            <rect x="22" y="8" width="8" height="26" rx="1" fill="var(--primary)" />
            <rect x="36" y="14" width="8" height="20" rx="1" fill="var(--primary)" />
            <rect x="50" y="20" width="8" height="14" rx="1" fill="var(--primary)" />
          </svg>
        </div>
        <div className="absolute right-0 top-5 size-[5.5rem] rounded-[0.85rem] border border-border bg-background/90 p-2.5 shadow-lg transition-transform duration-300 group-hover/card:-translate-y-1 group-hover/card:rotate-8">
          <svg viewBox="0 0 64 40" className="h-full w-full">
            <circle cx="32" cy="20" r="14" fill="color-mix(in oklch, var(--primary) 22%, transparent)" stroke="var(--primary)" />
            <path d="M32 20 L32 6 A14 14 0 0 1 44 28 Z" fill="var(--primary)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function EntonnoirStage() {
  const steps = [
    { w: "92%", label: "visite" },
    { w: "70%", label: "panier" },
    { w: "48%", label: "paiement" },
    { w: "28%", label: "achat" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-5 py-3">
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">entonnoir</p>
      {steps.map((step) => (
        <div key={step.label} className="flex items-center gap-2">
          <div
            className="h-4 rounded-sm bg-chart-3/85 transition-colors duration-500 group-hover/card:bg-chart-3"
            style={{ width: step.w }}
          />
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function MemoireStage() {
  const tiles = [
    { k: "CA", v: "128 k€", d: "+6 %" },
    { k: "CVR", v: "2,4 %", d: "−1 %" },
    { k: "AOV", v: "54 €", d: "+2 %" },
    { k: "NPS", v: "31", d: "+4" },
  ];
  return (
    <div className="grid h-full grid-cols-2 gap-2 p-3">
      {tiles.map((t, i) => (
        <div
          key={t.k}
          className="rounded-xl border border-border bg-background/70 px-2.5 py-2 transition duration-300 group-hover/card:blur-[2px] group-hover/card:scale-[0.98]"
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t.k}</p>
          <p className="font-heading text-lg leading-none">{t.v}</p>
          <p className={cn("font-mono text-[10px]", t.d.startsWith("−") ? "text-anomaly" : "text-ok")}>{t.d}</p>
        </div>
      ))}
    </div>
  );
}

function BruitStage() {
  return (
    <div className="flex h-full flex-col px-4 py-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-signal">série</p>
        <p className="font-mono text-[9px] text-muted-foreground">fenêtre · saison</p>
      </div>
      <svg viewBox="0 0 280 100" className="min-h-0 w-full flex-1">
        <rect
          x="148"
          y="10"
          width="70"
          height="80"
          rx="8"
          className="fill-primary/12 stroke-primary/45"
        />
        <path
          d="M12 64 C 36 56, 48 46, 70 48 S 110 72, 140 40 S 190 22, 210 34 S 250 70, 268 58"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SchemaStage() {
  return (
    <div className="flex h-full flex-col px-4 py-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">étoile</p>
      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 place-items-center gap-1">
        <span />
        <span className="rounded-md bg-chart-2/25 px-2 py-1 font-mono text-[10px]">date</span>
        <span />
        <span className="rounded-md bg-chart-2/25 px-2 py-1 font-mono text-[10px]">magasin</span>
        <span className="rounded-lg bg-primary px-2.5 py-1.5 font-mono text-[10px] text-primary-foreground shadow-sm">
          fait
        </span>
        <span className="rounded-md bg-chart-2/25 px-2 py-1 font-mono text-[10px]">produit</span>
        <span />
        <span className="rounded-md bg-chart-2/25 px-2 py-1 font-mono text-[10px]">client</span>
        <span />
      </div>
    </div>
  );
}

function PipelineStage() {
  const layers = ["bronze", "silver", "gold"];
  return (
    <div className="relative flex h-full items-center justify-center gap-2 px-4">
      {layers.map((name, i) => (
        <div key={name} className="flex items-center gap-2">
          <div
            className={cn(
              "rounded-lg px-3 py-3 font-mono text-[11px] transition-all duration-300",
              i === 0 && "bg-chart-4/50 group-hover/card:bg-chart-4/80",
              i === 1 && "bg-chart-3/50 group-hover/card:bg-chart-3/80",
              i === 2 && "bg-primary/80 text-primary-foreground group-hover/card:bg-primary"
            )}
          >
            {name}
          </div>
          {i < 2 ? <span className="text-muted-foreground">→</span> : null}
        </div>
      ))}
      <span className="pointer-events-none absolute left-[12%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary opacity-0 group-hover/card:animate-[packet-run_1.6s_linear_infinite] group-hover/card:opacity-100" />
    </div>
  );
}

function JointureStage() {
  return (
    <div className="flex h-full flex-col px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-signal">inner join</p>
        <p className="font-mono text-[9px] text-muted-foreground">client_id</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <div className="rounded-xl border border-chart-2/45 bg-chart-2/15 px-2.5 py-2">
          <p className="font-mono text-[9px] text-chart-2">clients</p>
          <p className="mt-1.5 font-mono text-[12px] leading-5">Léa</p>
          <p className="font-mono text-[12px] leading-5">Marc</p>
        </div>
        <div className="flex flex-col items-center justify-center px-0.5">
          <span className="font-mono text-[9px] text-primary">∩</span>
          <span className="mt-1 h-8 w-px bg-primary/40" />
        </div>
        <div className="rounded-xl border border-primary/45 bg-primary/15 px-2.5 py-2">
          <p className="font-mono text-[9px] text-primary">commandes</p>
          <p className="mt-1.5 font-mono text-[12px] leading-5">40 €</p>
          <p className="font-mono text-[12px] leading-5">25 €</p>
        </div>
      </div>
    </div>
  );
}

function GrainStage() {
  const rows = [
    ["04-01", "A", "12"],
    ["04-01", "B", "4"],
    ["04-02", "A", "9"],
  ];
  return (
    <div className="flex h-full items-center px-4">
      <div className="w-full overflow-hidden rounded-xl border border-border font-mono text-[10px]">
        <div className="grid grid-cols-3 border-b border-border bg-primary/20 text-primary">
          <span className="px-2 py-1.5 transition-colors group-hover/card:bg-primary group-hover/card:text-primary-foreground">
            🔑 date
          </span>
          <span className="px-2 py-1.5 transition-colors group-hover/card:bg-primary group-hover/card:text-primary-foreground">
            🔑 sku
          </span>
          <span className="px-2 py-1.5">qty</span>
        </div>
        {rows.map((row) => (
          <div key={row.join()} className="grid grid-cols-3 border-b border-border/50 last:border-0">
            <span className="px-2 py-1 text-primary">{row[0]}</span>
            <span className="px-2 py-1 text-primary">{row[1]}</span>
            <span className="px-2 py-1">{row[2]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntrepotStage() {
  const sizes = ["XS", "S", "M", "L", "XL", "2XL"];
  const heights = [22, 32, 44, 58, 74, 90];
  return (
    <div className="flex h-full flex-col px-5 py-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">warehouse</p>
      <div className="flex min-h-0 flex-1 items-end justify-center gap-1.5">
        {sizes.map((size, i) => (
          <div key={size} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span
              className="w-full max-w-7 rounded-t-md bg-primary/85"
              style={{ height: `${heights[i]}%` }}
            />
            <span className="font-mono text-[8px] text-muted-foreground">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElagageStage() {
  const cells = [
    { scan: false },
    { scan: true },
    { scan: false },
    { scan: false },
    { scan: true },
    { scan: false },
  ];
  return (
    <div className="grid h-full grid-cols-3 gap-2 p-5">
      {cells.map((cell, i) => (
        <div
          key={i}
          className={cn(
            "flex items-end rounded-lg border px-2 py-2 transition duration-500",
            cell.scan
              ? "border-primary bg-primary/45 group-hover/card:bg-primary/75"
              : "border-border bg-muted/35 group-hover/card:opacity-25"
          )}
        >
          <span
            className={cn(
              "font-mono text-[9px] uppercase tracking-[0.14em]",
              cell.scan ? "text-primary-foreground" : "text-muted-foreground/70"
            )}
          >
            {cell.scan ? "scan" : "pruned"}
          </span>
        </div>
      ))}
    </div>
  );
}

function VoyageStage() {
  return (
    <div className="flex h-full flex-col justify-center px-5 py-3">
      <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">time travel</p>
      <div className="relative h-1.5 w-full rounded-full bg-border">
        <div className="h-full w-2/5 rounded-full bg-primary transition-all duration-700 group-hover/card:w-3/5" />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>hier</span>
        <span className="text-signal">AT TIMESTAMP</span>
        <span>now</span>
      </div>
    </div>
  );
}

function CloneStage() {
  return (
    <div className="flex h-full items-center justify-center gap-3 px-5 py-3">
      <div className="text-center">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="size-5 rounded-sm bg-primary" />
          ))}
        </div>
        <p className="mt-1.5 font-mono text-[9px] text-muted-foreground">table</p>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">→</span>
      <div className="text-center">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="size-5 rounded-sm bg-primary/40 ring-1 ring-primary/70" />
          ))}
        </div>
        <p className="mt-1.5 font-mono text-[9px] text-signal">clone</p>
      </div>
    </div>
  );
}

function FluxStage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-3">
      <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.16em] text-signal">stream</p>
      <div className="relative grid size-16 place-items-center rounded-full border-2 border-primary/50">
        <span className="size-2.5 rounded-full bg-primary" />
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">offset · CDC</p>
    </div>
  );
}

export function PlayMark({ game }: { game: GameMeta }) {
  return (
    <span aria-hidden className="play-mark">
      <span className="play-mark-tile" style={{ background: game.accent }}>
        <GameMark slug={game.slug} live />
      </span>
    </span>
  );
}

export function PlayLink({ game, verb }: { game: GameMeta; verb?: string }) {
  const { enter, leave } = usePlayHover();
  return (
    <div
      className="relative z-30 mt-4 self-start"
      onPointerEnter={() => enter(game.slug)}
      onPointerLeave={() => leave(game.slug)}
    >
      <Button
        nativeButton={false}
        size="lg"
        className="relative z-10 h-10 px-4 transition duration-200 hover:-translate-y-px hover:shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
        render={<Link href={`/play/${game.slug}`} />}
      >
        {verb ?? game.verb}
      </Button>
    </div>
  );
}
