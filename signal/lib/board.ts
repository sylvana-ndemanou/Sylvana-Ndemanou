import type { GameSlug } from "@/lib/games";
import type { Difficulty } from "@/lib/play";

const BOARD_KEY = "signal-board-v1";
const INITIALS_KEY = "signal-initials";
const EVENT = "signal-board";

export type BoardTab = Difficulty | "daily";

export type BoardRow = {
  id: string;
  initials: string;
  score: number;
  max: number;
  slug: GameSlug;
  difficulty: Difficulty;
  daily: boolean;
  at: number;
};

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

function readRaw(): BoardRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOARD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(rows: BoardRow[]) {
  window.localStorage.setItem(BOARD_KEY, JSON.stringify(rows.slice(0, 400)));
  emit();
}

export function getInitials(): string {
  if (typeof window === "undefined") return "";
  return (window.localStorage.getItem(INITIALS_KEY) ?? "").toUpperCase();
}

export function setInitials(value: string) {
  const next = value
    .toUpperCase()
    .replace(/[^A-ZÀ-Ü]/g, "")
    .slice(0, 3);
  window.localStorage.setItem(INITIALS_KEY, next);
  emit();
  return next;
}

export function readBoard(): BoardRow[] {
  return readRaw();
}

export function submitRun(input: Omit<BoardRow, "id" | "at">): BoardRow {
  const row: BoardRow = {
    ...input,
    initials: input.initials.toUpperCase().slice(0, 3),
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };
  writeRaw([row, ...readRaw()]);
  return row;
}

export function rowsFor(slug: GameSlug, tab: BoardTab): BoardRow[] {
  const rows = readRaw().filter((row) => row.slug === slug);
  const filtered =
    tab === "daily" ? rows.filter((row) => row.daily) : rows.filter((row) => !row.daily && row.difficulty === tab);
  return [...filtered].sort((a, b) => b.score - a.score || a.at - b.at);
}

export function countFor(slug: GameSlug): number {
  return readRaw().filter((row) => row.slug === slug).length;
}

/** One post per playthrough (same seed + score). Survives React Strict Mode. */
export function claimRun(id: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `signal-claimed-${id}`;
  try {
    if (window.sessionStorage.getItem(key) === "1") return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

export function formatBoardScore(score: number): string {
  return score.toFixed(2);
}

export function subscribeBoard(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}
