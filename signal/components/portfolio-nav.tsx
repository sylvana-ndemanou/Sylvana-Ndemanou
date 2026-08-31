// @ts-nocheck
"use client";

import { SignalLink } from "@s/components/signal-link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { PlayMark } from "@s/components/game-previews";
import { LanguageToggle } from "@s/components/language-toggle";
import { usePlayHover } from "@s/components/play-hover";
import { SoundToggle } from "@s/components/sound-toggle";
import { ThemeToggle } from "@s/components/theme-toggle";
import { play } from "@s/lib/audio";
import { GAMES, getGame, type GameTrack } from "@s/lib/games";
import { useI18n } from "@s/lib/i18n";
import { PORTFOLIO_URL } from "@s/lib/site";
import { cn } from "@s/lib/utils";

function portfolioPath(locale: "fr" | "en", path: string): string {
  const prefix = `${PORTFOLIO_URL.replace(/\/$/, "")}/${locale}`;
  return path === "/" ? prefix : `${prefix}${path}`;
}

function canHover() {
  return window.matchMedia("(hover: hover)").matches;
}

function useSlidingPill(activeKey: string | null, containerRef: RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ x: 0, w: 0, ready: false });

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || !activeKey) {
      setBox((prev) => ({ ...prev, ready: false }));
      return;
    }
    const node = root.querySelector<HTMLElement>(`[data-tab="${activeKey}"]`);
    if (!node) return;

    const update = () => {
      const rr = root.getBoundingClientRect();
      const nr = node.getBoundingClientRect();
      setBox({ x: nr.left - rr.left, w: nr.width, ready: true });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    ro.observe(node);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [activeKey, containerRef]);

  return box;
}

export function PortfolioNav() {
  const { locale, t } = useI18n();
  const { hoverSlug, enter, leave, clear } = usePlayHover();
  const pathname = usePathname();
  const playSlug = pathname.startsWith("/play/") ? pathname.slice("/play/".length) : null;
  const playing = playSlug ? getGame(playSlug) : undefined;
  const home = pathname === "/";
  const [open, setOpen] = useState<GameTrack | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState<GameTrack | null>(null);
  const signalRef = useRef<HTMLLIElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLUListElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | null>(null);

  const items = [
    { key: "home" as const, href: portfolioPath(locale, "/"), current: false },
    { key: "projects" as const, href: portfolioPath(locale, "/projects"), current: false },
    { key: "about" as const, href: portfolioPath(locale, "/about"), current: false },
    { key: "signal" as const, href: "/", current: true },
  ];

  useEffect(() => {
    setOpen(null);
    setMenuOpen(false);
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
    if (!menuOpen) return;
    function down(event: PointerEvent) {
      if (!(event.target instanceof Node) || isHot(event.target)) return;
      setOpen(null);
      setMenuOpen(false);
      clear();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(null);
      setMenuOpen(false);
      clear();
    }
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, clear]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  const preferred = playing?.track ?? (home ? scrolled : null) ?? "bi";
  const trayGames = open ? GAMES.filter((game) => game.track === open) : [];
  const tracks = (["bi", "data", "snowflake"] as const).map((id) => ({ id, ...t.tracks[id] }));
  const tabPill = useSlidingPill("signal", tabsRef);
  const trackPill = useSlidingPill(open, tracksRef);

  function isHot(node: EventTarget | Node | null) {
    return node instanceof Node && Boolean(signalRef.current?.contains(node) || trayRef.current?.contains(node));
  }

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
      setMenuOpen(false);
      clear();
    }, 80);
  }

  function openMenu() {
    cancelLeave();
    setMenuOpen(true);
  }

  function pickTrack(id: GameTrack) {
    play("tap");
    setMenuOpen(true);
    setOpen(id);
    if (home) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      data-portfolio-nav=""
      aria-label={t.bar.nav}
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2 overflow-visible px-3"
    >
      <div
        className="relative"
        onPointerEnter={cancelLeave}
        onPointerLeave={(event) => {
          if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
          scheduleLeave();
        }}
      >
        <div className="liquid-glass flex items-center gap-1 overflow-visible rounded-full p-1.5">
          <ul ref={tabsRef} className="relative z-10 flex items-center">
            <span
              aria-hidden
              className="nav-slider"
              style={{
                transform: `translateX(${tabPill.x}px)`,
                width: tabPill.w,
                opacity: tabPill.ready ? 1 : 0,
              }}
            />
            {items.map((item) =>
              item.key === "signal" ? (
                <li
                  key={item.key}
                  ref={signalRef}
                  className="relative z-10"
                  onPointerEnter={() => {
                    if (canHover()) openMenu();
                  }}
                >
                  <SignalLink
                    href="/"
                    data-tab="signal"
                    aria-current="page"
                    aria-expanded={menuOpen}
                    aria-controls="signal-tray"
                    onClick={(event) => {
                      if (home && !canHover()) {
                        event.preventDefault();
                        if (menuOpen) {
                          setOpen(null);
                          setMenuOpen(false);
                          clear();
                        } else {
                          openMenu();
                        }
                      }
                    }}
                    className="nav-link nav-link-quiet text-foreground"
                  >
                    {t.bar.signal}
                  </SignalLink>
                </li>
              ) : (
                <li key={item.key} className="relative z-10">
                  <a
                    href={item.href}
                    data-tab={item.key}
                    className="nav-link nav-link-quiet"
                  >
                    {t.bar[item.key]}
                  </a>
                </li>
              )
            )}
          </ul>
          <div className="relative z-10 flex items-center gap-1">
            <LanguageToggle
              className={cn(
                "h-8 min-w-8 rounded-full border-foreground/8 bg-transparent px-2 text-[13px] font-semibold tracking-wide"
              )}
            />
            <SoundToggle className="h-8 w-8 border-foreground/8 bg-transparent" />
            <ThemeToggle className="h-8 w-8 border-foreground/8 bg-transparent" />
          </div>
        </div>

        <div
          ref={trayRef}
          className={cn(
            "absolute top-full left-1/2 z-10 origin-top pt-2 -translate-x-1/2 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
          )}
          onPointerEnter={cancelLeave}
        >
          <div
            id="signal-tray"
            className={cn(
              "liquid-glass relative w-max max-w-[min(92vw,42rem)] overflow-visible p-1.5",
              open ? "rounded-[1.75rem]" : "rounded-full",
              menuOpen && "glass-melt"
            )}
          >
            <div ref={tracksRef} className="relative z-10 flex items-center justify-center">
              <span
                aria-hidden
                className="nav-slider nav-slider-inset"
                style={{
                  transform: `translateX(${trackPill.x}px)`,
                  width: trackPill.w,
                  opacity: trackPill.ready && open ? 1 : 0,
                }}
              />
              {tracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  data-tab={track.id}
                  aria-expanded={open === track.id}
                  aria-controls="signal-tray-games"
                  onClick={() => pickTrack(track.id)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    setMenuOpen(true);
                    setOpen(track.id);
                  }}
                  className={cn("nav-link nav-link-quiet relative z-10", open === track.id && "text-foreground")}
                >
                  {track.kicker}
                </button>
              ))}
            </div>
            {trayGames.length > 0 ? (
              <ul
                id="signal-tray-games"
                className="relative z-10 mt-1 flex items-center justify-center gap-0 px-1"
              >
                {trayGames.map((game, i) => {
                  const active = game.slug === playing?.slug;
                  const hot = game.slug === hoverSlug;
                  const copy = t.games[game.slug];
                  return (
                    <li
                      key={game.slug}
                      className={cn("group/play relative shrink-0", hot && "is-play-hot")}
                      style={{ animationDelay: `${40 + i * 45}ms` }}
                    >
                      <SignalLink
                        href={`/play/${game.slug}`}
                        onClick={() => play("tap")}
                        onPointerEnter={() => enter(game.slug)}
                        onPointerLeave={() => leave(game.slug)}
                        className={cn("nav-link tray-game", (active || hot) && "nav-link-on")}
                      >
                        {copy.name}
                      </SignalLink>
                      <PlayMark game={game} />
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
