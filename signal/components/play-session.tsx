// @ts-nocheck
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameSlug } from "@s/lib/games";
import {
  dailyKey,
  defaultDifficulty,
  makeRoomCode,
  maxScoreFor,
  parseDifficulty,
  parseMode,
  rngFromSeed,
  roundsFor,
  type Difficulty,
  type PlayMode,
} from "@s/lib/play";

export type PlaySession = {
  slug: GameSlug;
  mode: PlayMode;
  difficulty: Difficulty;
  seed: string;
  rounds: number;
  maxScore: number;
  rng: () => number;
  setMode: (mode: PlayMode) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  inviteUrl: string;
  ensureRoom: () => string;
};

const PlaySessionContext = createContext<PlaySession | null>(null);

export function PlaySessionRoot({
  slug,
  children,
  initialMode,
  initialDifficulty,
  initialSeed,
}: {
  slug: GameSlug;
  children: ReactNode;
  initialMode?: string | null;
  initialDifficulty?: string | null;
  initialSeed?: string | null;
}) {
  const [mode, setModeState] = useState<PlayMode>(() => parseMode(initialMode ?? null));
  const [difficulty, setDifficultyState] = useState<Difficulty>(() =>
    parseDifficulty(initialDifficulty ?? null, slug)
  );
  const [seed, setSeed] = useState(() => {
    if (initialSeed) return initialSeed;
    if (parseMode(initialMode ?? null) === "daily") return dailyKey(slug);
    return `solo-${slug}`;
  });

  const writeUrl = useCallback(
    (nextMode: PlayMode, nextDifficulty: Difficulty, nextSeed: string) => {
      if (typeof window === "undefined") return;
      const query = new URLSearchParams();
      if (nextMode !== "solo") query.set("mode", nextMode);
      if (nextDifficulty !== defaultDifficulty(slug)) query.set("d", nextDifficulty);
      if (nextMode === "multi" && nextSeed) query.set("seed", nextSeed);
      const suffix = query.toString();
      const path = window.location.pathname;
      window.history.replaceState(null, "", suffix ? `${path}?${suffix}` : path);
    },
    [slug]
  );

  const setMode = useCallback(
    (next: PlayMode) => {
      const nextSeed =
        next === "daily"
          ? dailyKey(slug)
          : next === "multi" && !seed.startsWith("solo-") && !seed.startsWith("daily-")
            ? seed
            : next === "multi"
              ? makeRoomCode()
              : seed;
      setModeState(next);
      setSeed(nextSeed);
      writeUrl(next, difficulty, nextSeed);
    },
    [difficulty, seed, slug, writeUrl]
  );

  const setDifficulty = useCallback(
    (next: Difficulty) => {
      setDifficultyState(next);
      writeUrl(mode, next, seed);
    },
    [mode, seed, writeUrl]
  );

  const ensureRoom = useCallback(() => {
    if (mode === "multi" && seed && !seed.startsWith("solo-") && !seed.startsWith("daily-")) return seed;
    const room = makeRoomCode();
    setModeState("multi");
    setSeed(room);
    writeUrl("multi", difficulty, room);
    return room;
  }, [difficulty, mode, seed, writeUrl]);

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const query = new URLSearchParams({ mode: "multi", d: difficulty, seed });
    return `${window.location.origin}${window.location.pathname}?${query.toString()}`;
  }, [difficulty, seed]);

  const value = useMemo<PlaySession>(
    () => ({
      slug,
      mode,
      difficulty,
      seed,
      rounds: roundsFor(difficulty),
      maxScore: maxScoreFor(difficulty),
      rng: rngFromSeed(`${slug}:${seed}:${difficulty}`),
      setMode,
      setDifficulty,
      inviteUrl,
      ensureRoom,
    }),
    [difficulty, ensureRoom, inviteUrl, mode, seed, setDifficulty, setMode, slug]
  );

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
}

export function usePlaySession(): PlaySession {
  const ctx = useContext(PlaySessionContext);
  if (!ctx) {
    throw new Error("usePlaySession must be used within PlaySessionRoot");
  }
  return ctx;
}
