import type { GameSlug } from "@/lib/games";

const KEY = "signal-bi-scores-v1";

export type GameScore = {
  best: number;
  last: number;
  plays: number;
};

export type ScoreMap = Partial<Record<GameSlug, GameScore>>;

export function readScores(): ScoreMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ScoreMap;
  } catch {
    return {};
  }
}

export function recordScore(slug: GameSlug, score: number): ScoreMap {
  const current = readScores();
  const prev = current[slug];
  const next: GameScore = {
    best: Math.max(prev?.best ?? 0, score),
    last: score,
    plays: (prev?.plays ?? 0) + 1,
  };
  const map = { ...current, [slug]: next };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("signal-scores"));
  } catch {
    /* ignore quota / private mode */
  }
  return map;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("signal-scores", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("signal-scores", onStoreChange);
  };
}

export function getScoresSnapshot() {
  return window.localStorage.getItem(KEY) ?? "";
}

export function getScoresServerSnapshot() {
  return "";
}

export { subscribe as subscribeScores };

