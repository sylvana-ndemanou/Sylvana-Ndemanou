// @ts-nocheck
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameSlug } from "@s/lib/games";

type PlayHoverValue = {
  hoverSlug: GameSlug | null;
  enter: (slug: GameSlug) => void;
  leave: (slug: GameSlug) => void;
  clear: () => void;
};

const PlayHoverContext = createContext<PlayHoverValue | null>(null);

export function PlayHoverRoot({ children }: { children: ReactNode }) {
  const [hoverSlug, setHoverSlug] = useState<GameSlug | null>(null);
  const enter = useCallback((slug: GameSlug) => setHoverSlug(slug), []);
  const leave = useCallback((slug: GameSlug) => {
    setHoverSlug((current) => (current === slug ? null : current));
  }, []);
  const clear = useCallback(() => setHoverSlug(null), []);

  useEffect(() => {
    const hide = () => setHoverSlug(null);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, []);

  const value = useMemo(() => ({ hoverSlug, enter, leave, clear }), [hoverSlug, enter, leave, clear]);
  return <PlayHoverContext.Provider value={value}>{children}</PlayHoverContext.Provider>;
}

export function usePlayHover() {
  const ctx = useContext(PlayHoverContext);
  if (!ctx) {
    throw new Error("usePlayHover must be used within PlayHoverRoot");
  }
  return ctx;
}
