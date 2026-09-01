// @ts-nocheck
"use client";

import { SignalLink } from "@s/components/signal-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlayMark } from "@s/components/game-previews";
import { LanguageToggle } from "@s/components/language-toggle";
import { usePlayHover } from "@s/components/play-hover";
import { SoundToggle } from "@s/components/sound-toggle";
import { ThemeToggle } from "@s/components/theme-toggle";
import { play } from "@s/lib/audio";
import { GAMES, getGame, type GameTrack } from "@s/lib/games";
import { useI18n } from "@s/lib/i18n";
import { cn } from "@s/lib/utils";

export function SignalBar() {
  const { t } = useI18n();
  const { hoverSlug, clear } = usePlayHover();
  const pathname = usePathname();
  const playSlug = pathname.startsWith("/play/") ? pathname.slice("/play/".length) : null;
  const playing = playSlug ? getGame(playSlug) : undefined;
  const home = pathname === "/";
  const [open, setOpen] = useState<GameTrack | null>(null);
  const [scrolled, setScrolled] = useState<GameTrack | null>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    setOpen(null);
    clear();
  }, [pathname, clear]);

  useEffect(() => {
    if (!home) {
      setScrolled(null);
      return;
    }
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-track-section]")];
    if (!nodes.length) return;

    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = 96;
      let next: GameTrack | null = null;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top > line || rect.bottom <= line + 40) continue;
        const id = node.getAttribute("data-track-section");
        if (id === "bi" || id === "data" || id === "snowflake") next = id;
      }
      setScrolled((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [home]);

  useEffect(() => {
    if (!open) return;
    function down(event: PointerEvent) {
      const root = clusterRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return;
      setOpen(null);
    }
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  const current = playing?.track ?? (home ? scrolled : null);
  const trayGames = open ? GAMES.filter((game) => game.track === open) : [];
  const tracks = (["bi", "data", "snowflake"] as const).map((id) => ({ id, ...t.tracks[id] }));

  function cancelLeave() {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function scheduleLeave() {
    cancelLeave();
    leaveTimer.current = window.setTimeout(() => {
      setOpen(null);
      clear();
    }, 80);
  }

  function pickTrack(id: GameTrack) {
    play("tap");
    setOpen((prev) => (prev === id ? null : id));
    if (home) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      data-signal-bar=""
      className="pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4"
      aria-label={t.bar.nav}
    >
      <div
        ref={clusterRef}
        className="pointer-events-auto relative"
        onPointerEnter={cancelLeave}
        onPointerLeave={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && clusterRef.current?.contains(next)) return;
          scheduleLeave();
        }}
      >
        <div className="nav-pill grid h-12 w-[min(94vw,44rem)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center rounded-full px-1.5">
          <SignalLink
            href="/"
            className={cn("justify-self-start", "nav-link", home && "nav-link-on")}
          >
            Signal
          </SignalLink>
          <div className="flex items-center">
            {tracks.map((track) => {
              const on = current === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                    aria-expanded={open === track.id}
                    aria-controls="signal-tray"
                    onClick={() => pickTrack(track.id)}
                    onPointerEnter={() => {
                      if (window.matchMedia("(hover: hover)").matches) setOpen(track.id);
                    }}
                    className={cn("nav-link", (on || open === track.id) && "nav-link-on")}
                >
                  {track.kicker}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-self-end gap-1">
            <LanguageToggle />
            <SoundToggle />
            <ThemeToggle />
          </div>
        </div>

        <div
          className={cn(
            "absolute top-full left-1/2 z-10 origin-top pt-2 -translate-x-1/2 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
          )}
        >
          <div id="signal-tray" className="nav-pill relative w-max max-w-[min(92vw,42rem)] overflow-visible rounded-[1.75rem] p-2">
            <ul className="flex flex-nowrap items-center justify-center gap-0.5">
              {trayGames.map((game) => {
                const active = game.slug === playing?.slug;
                const hot = game.slug === hoverSlug;
                const copy = t.games[game.slug];
                return (
                  <li key={game.slug} className={cn("group/play relative", hot && "is-play-hot")}>
                    <SignalLink
                      href={`/play/${game.slug}`}
                      onClick={() => play("tap")}
                      className={cn("nav-link", (active || hot) && "nav-link-on")}
                    >
                      {copy.name}
                    </SignalLink>
                    <PlayMark game={game} />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
