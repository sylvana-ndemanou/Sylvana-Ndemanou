import type { GameSlug } from "@/lib/games";
import { POINTS_PER_ROUND } from "@/lib/games";

export type PlayMode = "solo" | "multi" | "daily";
export type Difficulty = "easy" | "hard" | "brutal";

export const DIFFICULTIES: Difficulty[] = ["easy", "hard", "brutal"];

const GAME_DIFFICULTIES: Record<GameSlug, Difficulty[]> = {
  anomalie: ["easy", "hard", "brutal"],
  graphique: ["easy", "hard", "brutal"],
  entonnoir: ["easy", "hard", "brutal"],
  memoire: ["easy", "hard", "brutal"],
  bruit: ["easy", "hard", "brutal"],
  schema: ["easy", "hard", "brutal"],
  pipeline: ["easy", "hard", "brutal"],
  jointure: ["easy", "hard", "brutal"],
  grain: ["easy", "hard", "brutal"],
  entrepot: ["easy", "hard", "brutal"],
  elagage: ["easy", "hard", "brutal"],
  voyage: ["easy", "hard", "brutal"],
  clone: ["easy", "hard", "brutal"],
  flux: ["easy", "hard", "brutal"],
};

export function difficultiesFor(slug: GameSlug): Difficulty[] {
  return GAME_DIFFICULTIES[slug];
}

export function defaultDifficulty(slug: GameSlug): Difficulty {
  const list = difficultiesFor(slug);
  return list.includes("hard") ? "hard" : list[0];
}

export function roundsFor(difficulty: Difficulty): number {
  if (difficulty === "easy") return 3;
  return 5;
}

export function maxScoreFor(difficulty: Difficulty): number {
  return roundsFor(difficulty) * POINTS_PER_ROUND;
}

/**
 * 0–1 pressure. Bands never overlap, so Facile stays Facile and Brutal
 * starts already harder than Costaud’s last round.
 *   Facile  0.00 → 0.16
 *   Costaud 0.46 → 0.64
 *   Brutal  0.86 → 1.00
 */
export function heat(difficulty: Difficulty, roundIndex: number, totalRounds: number): number {
  const floor = difficulty === "easy" ? 0 : difficulty === "hard" ? 0.46 : 0.86;
  const ceil = difficulty === "easy" ? 0.16 : difficulty === "hard" ? 0.64 : 1;
  const span = Math.max(1, totalRounds - 1);
  const t = Math.min(1, Math.max(0, roundIndex / span));
  return floor + (ceil - floor) * t;
}

export function awardPartial(
  hit: number,
  total: number,
  difficulty: Difficulty,
  full = POINTS_PER_ROUND
): number {
  if (total <= 0) return 0;
  const placed = Math.max(0, Math.min(total, hit));
  if (placed === total) return full;
  if (difficulty === "brutal") return 0;
  if (difficulty === "easy") return Math.round((placed / total) * full);
  return Math.round((placed / total) * full * 0.65);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function scaleByHeat(easyVal: number, brutalVal: number, h: number): number {
  return lerp(easyVal, brutalVal, h);
}

export function lookSeconds(difficulty: Difficulty): number {
  return lookSecondsAt(difficulty, 0, roundsFor(difficulty));
}

export function lookSecondsAt(difficulty: Difficulty, roundIndex: number, totalRounds: number): number {
  return Math.max(2, Math.round(scaleByHeat(11, 2, heat(difficulty, roundIndex, totalRounds))));
}

export function optionCap(difficulty: Difficulty): number {
  return optionCapAt(difficulty, 4, 0, roundsFor(difficulty));
}

export function optionCapAt(
  difficulty: Difficulty,
  max: number,
  roundIndex: number,
  totalRounds: number
): number {
  const h = heat(difficulty, roundIndex, totalRounds);
  return Math.min(max, Math.max(2, Math.round(scaleByHeat(2, max, h))));
}

export function signalScale(difficulty: Difficulty): number {
  return scaleByHeat(2.4, 0.18, heat(difficulty, 0, roundsFor(difficulty)));
}

export function noiseScale(difficulty: Difficulty): number {
  return scaleByHeat(0.3, 2.8, heat(difficulty, 0, roundsFor(difficulty)));
}

export function beatWindowMs(difficulty: Difficulty): number {
  return beatWindowMsAt(difficulty, 0, roundsFor(difficulty));
}

export function beatWindowMsAt(difficulty: Difficulty, roundIndex: number, totalRounds: number): number {
  return Math.round(scaleByHeat(340, 62, heat(difficulty, roundIndex, totalRounds)));
}

export function tempoScale(difficulty: Difficulty): number {
  return tempoScaleAt(difficulty, 0, roundsFor(difficulty));
}

export function tempoScaleAt(difficulty: Difficulty, roundIndex: number, totalRounds: number): number {
  return scaleByHeat(0.58, 1.72, heat(difficulty, roundIndex, totalRounds));
}

export function holdMsAt(difficulty: Difficulty, roundIndex: number, totalRounds: number): number {
  return Math.round(scaleByHeat(280, 1750, heat(difficulty, roundIndex, totalRounds)));
}

export function stepCount(
  total: number,
  difficulty: Difficulty,
  roundIndex: number,
  totalRounds: number
): number {
  const n = Math.round(scaleByHeat(3, total, heat(difficulty, roundIndex, totalRounds)));
  return Math.max(3, Math.min(total, n));
}

type MaybeTier = { tier?: Difficulty };

/** Exclusive manches: tagged `tier` first, else three non-overlapping slices. */
export function takeDeck<T>(pool: T[], difficulty: Difficulty): T[] {
  const n = roundsFor(difficulty);
  if (pool.length === 0) return [];

  const tagged = pool.filter((item) => (item as MaybeTier).tier === difficulty);
  if (tagged.length > 0) return tagged.slice(0, n);

  const easyN = roundsFor("easy");
  const hardN = roundsFor("hard");
  const brutalN = roundsFor("brutal");
  if (pool.length >= easyN + hardN + brutalN) {
    if (difficulty === "easy") return pool.slice(0, easyN);
    if (difficulty === "hard") return pool.slice(easyN, easyN + hardN);
    return pool.slice(easyN + hardN, easyN + hardN + brutalN);
  }

  if (pool.length > n) {
    if (difficulty === "easy") return pool.slice(0, n);
    if (difficulty === "hard") {
      const start = Math.min(n, Math.max(0, pool.length - n * 2));
      return pool.slice(start, start + n);
    }
    return pool.slice(pool.length - n);
  }
  return pool.slice(0, n);
}

export function expandBand(
  min: number,
  max: number,
  difficulty: Difficulty,
  top: number,
  roundIndex = 0,
  totalRounds = roundsFor(difficulty)
): [number, number] {
  const h = heat(difficulty, roundIndex, totalRounds);
  const slack = Math.round(scaleByHeat(1.5, 0, h));
  const lo = Math.max(0, min - slack);
  const hi = Math.min(top, max + slack);
  if (h >= 0.92) {
    const mid = Math.round((min + max) / 2);
    return [mid, mid];
  }
  return [lo, Math.max(lo, hi)];
}

export function dailyKey(slug: GameSlug, day = utcDay()): string {
  return `daily-${slug}-${day}`;
}

export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function makeRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function mulberry32(seed: number): () => number {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngFromSeed(seed: string): () => number {
  return mulberry32(hashSeed(seed));
}

export function parseDifficulty(value: string | null, slug: GameSlug): Difficulty {
  const list = difficultiesFor(slug);
  if (value === "easy" || value === "hard" || value === "brutal") {
    return list.includes(value) ? value : defaultDifficulty(slug);
  }
  return defaultDifficulty(slug);
}

export function parseMode(value: string | null): PlayMode {
  if (value === "multi" || value === "daily") return value;
  return "solo";
}
