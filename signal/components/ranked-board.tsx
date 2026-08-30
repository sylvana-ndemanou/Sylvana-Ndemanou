"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { LayoutGrid, X } from "lucide-react";
import { usePlaySession } from "@/components/play-session";
import { Button } from "@/components/ui/button";
import {
  claimRun,
  countFor,
  formatBoardScore,
  getInitials,
  readBoard,
  rowsFor,
  setInitials,
  submitRun,
  subscribeBoard,
  type BoardTab,
} from "@/lib/board";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const TABS: BoardTab[] = ["easy", "hard", "brutal", "daily"];

function useBoardTick() {
  return useSyncExternalStore(
    subscribeBoard,
    () => JSON.stringify(readBoard()),
    () => "[]"
  );
}

export function RankedBoard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const session = usePlaySession();
  const [tab, setTab] = useState<BoardTab>(session.mode === "daily" ? "daily" : session.difficulty);
  const tick = useBoardTick();
  const rows = useMemo(() => rowsFor(session.slug, tab), [session.slug, tab, tick]);
  const total = useMemo(() => countFor(session.slug), [session.slug, tick]);
  const labels: Record<BoardTab, string> = {
    easy: t.lobby.easy,
    hard: t.lobby.hard,
    brutal: t.lobby.brutal,
    daily: t.lobby.daily,
  };

  useEffect(() => {
    if (!open) return;
    setTab(session.mode === "daily" ? "daily" : session.difficulty);
  }, [open, session.mode, session.difficulty]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground/25 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-title"
        className="flex max-h-[min(36rem,86dvh)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground)_18%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 id="board-title" className="font-heading text-4xl tracking-tight">
              {t.board.title}
            </h2>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{t.board.submitted(total)}</p>
          </div>
          <button
            type="button"
            aria-label={t.board.close}
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 flex gap-5 overflow-x-auto border-b border-border px-6">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "relative shrink-0 pb-2 text-sm transition-colors",
                tab === item ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[item]}
              {tab === item ? <span className="absolute inset-x-0 -bottom-px h-px bg-foreground" /> : null}
            </button>
          ))}
        </div>

        <ol className="min-h-0 flex-1 overflow-y-auto px-6 py-3">
          {rows.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted-foreground">{t.board.empty}</li>
          ) : (
            rows.map((row, i) => (
              <li
                key={row.id}
                className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 border-b border-border/70 py-3 last:border-0"
              >
                <span className="font-mono text-sm text-muted-foreground">{i + 1}</span>
                <span className="text-center text-sm tracking-[0.18em]">{row.initials}</span>
                <span className="font-mono text-sm tabular-nums">{formatBoardScore(row.score)}</span>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}

export function BoardOrb({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="group/orb">
      <span className="board-orb grid size-12 place-items-center rounded-full text-foreground transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/orb:-translate-y-0.5 group-hover/orb:[&_svg]:scale-110">
        <LayoutGrid className="size-5" />
      </span>
    </button>
  );
}

export function InitialsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useI18n();
  return (
    <label className="block text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {t.board.initials}
      </span>
      <input
        value={value}
        maxLength={3}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))}
        className="mt-2 w-28 rounded-2xl border border-border bg-background px-3 py-2 text-center font-heading text-3xl tracking-[0.28em] outline-none focus:border-primary"
        aria-label={t.board.initials}
      />
    </label>
  );
}

export function BoardCapture({ score, max }: { score: number; max: number }) {
  const { t } = useI18n();
  const session = usePlaySession();
  const [letters, setLetters] = useState("");
  const [posted, setPosted] = useState("");
  const [open, setOpen] = useState(false);

  const publish = useCallback(
    (raw: string) => {
      const name = setInitials(raw);
      if (name.length < 2) return;
      const id = `${session.seed}|${session.slug}|${session.difficulty}|${session.mode}|${score}`;
      if (claimRun(id)) {
        submitRun({
          slug: session.slug,
          initials: name,
          score,
          max,
          difficulty: session.difficulty,
          daily: session.mode === "daily",
        });
      }
      setPosted(name);
    },
    [max, score, session.difficulty, session.mode, session.seed, session.slug]
  );

  useEffect(() => {
    const existing = getInitials();
    if (existing.length >= 2) publish(existing);
  }, [publish]);

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {posted ? (
        <p className="font-mono text-[11px] text-muted-foreground">{t.board.posted(posted)}</p>
      ) : (
        <>
          <p className="max-w-xs text-sm text-muted-foreground">{t.board.needInitials}</p>
          <InitialsField value={letters} onChange={setLetters} />
          <Button size="sm" disabled={letters.length < 2} onClick={() => publish(letters)}>
            {t.board.post}
          </Button>
        </>
      )}
      <Button variant="outline" size="lg" className="h-12 px-8 text-base" onClick={() => setOpen(true)}>
        <LayoutGrid />
        {t.board.open}
      </Button>
      <RankedBoard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
