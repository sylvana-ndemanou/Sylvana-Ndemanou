"use client";

import { Music, Pause, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Drop an audio file here (public/story-audio.mp3) to enable the soundtrack.
// If the file is absent, all audio UI stays hidden — nothing breaks.
const AUDIO_SRC = "/story-audio.mp3";

type StoryAudioCtx = {
  available: boolean;
  playing: boolean;
  toggle: () => void;
  play: () => void;
};

const Context = createContext<StoryAudioCtx | null>(null);

export function useStoryAudio(): StoryAudioCtx {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useStoryAudio must be used within StoryAudioProvider");
  return ctx;
}

export function StoryAudioProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(AUDIO_SRC, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setAvailable(r.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {
      /* autoplay may be blocked until a user gesture; that's fine */
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  // Start on the reader's first interaction (scroll/click/touch/key), which
  // also satisfies the browser autoplay gesture requirement.
  useEffect(() => {
    if (!available) return;
    const onFirst = (): void => {
      if (startedRef.current) return;
      startedRef.current = true;
      play();
      cleanup();
    };
    const cleanup = (): void => {
      window.removeEventListener("scroll", onFirst);
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("touchstart", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
    window.addEventListener("scroll", onFirst, { passive: true });
    window.addEventListener("pointerdown", onFirst);
    window.addEventListener("touchstart", onFirst, { passive: true });
    window.addEventListener("keydown", onFirst);
    return cleanup;
  }, [available, play]);

  return (
    <Context.Provider value={{ available, playing, toggle, play }}>
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {children}
    </Context.Provider>
  );
}

/** Floating, retractable soundtrack control that never covers the story. */
export function StoryAudioToggle(): ReactNode {
  const t = useTranslations("Story");
  const { available, playing, toggle } = useStoryAudio();
  const [collapsed, setCollapsed] = useState(false);

  if (!available) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label={t("audioTitle")}
        className="focus-ring fixed bottom-5 right-5 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-background/80 text-accent shadow-md backdrop-blur"
      >
        <Music className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-1 rounded-full border border-foreground/10 bg-background/80 p-1 shadow-md backdrop-blur">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t("audioPause") : t("audioPlay")}
        className="focus-ring inline-flex h-9 items-center gap-2 rounded-full bg-accent/10 px-3 text-[13px] font-medium tracking-tight text-foreground transition-colors hover:bg-accent/20"
      >
        {playing ? (
          <Pause className="h-4 w-4 text-accent" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4 text-accent" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">
          {playing ? t("audioPause") : t("audioPlay")}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        aria-label="Hide"
        className="focus-ring inline-flex h-9 w-7 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
