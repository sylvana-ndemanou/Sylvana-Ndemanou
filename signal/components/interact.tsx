// @ts-nocheck
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { play } from "@s/lib/audio";
import { useI18n } from "@s/lib/i18n";
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

export function ChoiceTile({
  title,
  hint,
  selected,
  locked,
  isAnswer,
  isWrong,
  onClick,
  onConfirm,
  disabled,
  children,
}: {
  title: string;
  hint?: string;
  selected?: boolean;
  locked?: boolean;
  isAnswer?: boolean;
  isWrong?: boolean;
  onClick?: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (selected && onConfirm) onConfirm();
        else onClick?.();
      }}
      className={cn(
        "rounded-2xl border px-3 py-3 text-left transition duration-200",
        "hover:-translate-y-0.5 hover:border-primary/40",
        selected && "border-primary bg-primary/15 shadow-[0_0_18px_color-mix(in_oklch,var(--primary)_22%,transparent)]",
        !selected && "border-border bg-card",
        locked && isAnswer && "border-ok bg-ok/15",
        locked && isWrong && "border-anomaly bg-anomaly/10"
      )}
    >
      {children}
      <span className="block font-mono text-sm">{title}</span>
      {hint ? <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span> : null}
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
  label,
}: {
  disabled?: boolean;
  onLock: () => void;
  label?: string;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const lockRef = useRef(onLock);
  lockRef.current = onLock;
  const ready = !disabled;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!ready) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Enter" || event.repeat) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, [contenteditable]")) return;
      event.preventDefault();
      lockRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready]);

  function tap() {
    if (!ready) {
      play("miss");
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      return;
    }
    onLock();
  }

  const bar = (
    <div className="lock-dock pointer-events-none fixed inset-x-0 bottom-0 z-[90] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10">
      <button
        type="button"
        data-signal-lock
        onClick={tap}
        className={cn(
          "pointer-events-auto relative mx-auto flex h-16 w-full max-w-3xl items-center justify-center rounded-[1.35rem] font-heading text-2xl tracking-tight transition outline-none",
          "shadow-[0_-12px_40px_color-mix(in_oklch,var(--background)_80%,transparent)] focus-visible:ring-3 focus-visible:ring-ring/50",
          ready
            ? "lock-ready bg-primary text-primary-foreground hover:scale-[1.01]"
            : "border border-border bg-card/95 text-muted-foreground backdrop-blur",
          shake && "lock-shake"
        )}
      >
        {ready ? (label ?? t.shell.lock) : t.shell.lockIdle}
      </button>
    </div>
  );

  return (
    <>
      <div className="h-24 shrink-0" aria-hidden />
      <p className="sr-only">{t.shell.lockHint}</p>
      {mounted ? createPortal(bar, document.body) : bar}
    </>
  );
}
