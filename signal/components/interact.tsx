// @ts-nocheck
"use client";

import type { ReactNode } from "react";
import { Button } from "@s/components/ui/button";
import { cn } from "@s/lib/utils";

export function Chip({
  label,
  held,
  muted,
  onClick,
  disabled,
}: {
  label: string;
  held?: boolean;
  muted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 font-mono text-xs transition duration-200",
        "hover:-translate-y-px hover:border-primary/50",
        held && "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_35%,transparent)]",
        !held && "border-border bg-card",
        muted && "opacity-40"
      )}
    >
      {label}
    </button>
  );
}

export function Slot({
  label,
  children,
  onClick,
  hot,
  tone = "dim",
  disabled,
}: {
  label: string;
  children?: ReactNode;
  onClick?: () => void;
  hot?: boolean;
  tone?: "dim" | "fact" | "layer";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-16 min-w-20 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-3 py-2 transition duration-200",
        "hover:-translate-y-0.5",
        tone === "fact" && "border-primary/50 bg-primary/10",
        tone === "dim" && "border-chart-2/40 bg-chart-2/10",
        tone === "layer" && "border-border bg-card/80",
        hot && "border-solid border-primary bg-primary/20",
        children && "border-solid"
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </button>
  );
}

export function LockBar({
  disabled,
  onLock,
  label = "Valider",
}: {
  disabled?: boolean;
  onLock: () => void;
  label?: string;
}) {
  return (
    <Button size="lg" className="mt-6 h-11 w-full text-base" disabled={disabled} onClick={onLock}>
      {label}
    </Button>
  );
}
