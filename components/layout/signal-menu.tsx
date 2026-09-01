"use client";

import { PlayMark } from "@s/components/game-previews";
import {
  hydrateMute,
  play,
  readMuted,
  subscribeMute,
  toggleMute,
  unlockAudio,
} from "@s/lib/audio";
import { GAMES, type GameTrack } from "@s/lib/games";
import { MESSAGES } from "@s/lib/messages";
import { Link, usePathname } from "@/i18n/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

function canHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}

function signalCopy(locale: string) {
  return locale === "en" ? MESSAGES.en : MESSAGES.fr;
}

export function NavSoundToggle(): ReactNode {
  const t = useTranslations("Nav");
  const muted = useSyncExternalStore(subscribeMute, readMuted, () => false);

  useEffect(() => {
    hydrateMute();
  }, []);

  const label = muted ? t("unmute") : t("mute");

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={muted}
      onClick={() => {
        toggleMute();
        if (muted) {
          unlockAudio();
          play("tap");
        }
      }}
      className="focus-ring bg-background ring-foreground/8 relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-1 transition-colors"
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

export function SignalNavItem({
  active,
  children,
  itemRef,
}: {
  active: boolean;
  children: ReactNode;
  itemRef?: (el: HTMLLIElement | null) => void;
}): ReactNode {
  const locale = useLocale();
  const pathname = usePathname();
  const copy = signalCopy(locale);
  const [open, setOpen] = useState(false);
  const [track, setTrack] = useState<GameTrack | null>(null);
  const rootRef = useRef<HTMLLIElement>(null);
  const leaveTimer = useRef<number | null>(null);

  function closeMenu() {
    setOpen(false);
    setTrack(null);
  }

  function cancelLeave() {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function scheduleLeave() {
    cancelLeave();
    leaveTimer.current = window.setTimeout(closeMenu, 120);
  }

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    function onPointer(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (rootRef.current?.contains(event.target)) return;
      closeMenu();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const tracks: GameTrack[] = ["bi", "data", "snowflake"];
  const trayGames = track ? GAMES.filter((game) => game.track === track) : [];

  return (
    <li
      ref={(el) => {
        rootRef.current = el;
        itemRef?.(el);
      }}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        cancelLeave();
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
          return;
        }
        scheduleLeave();
      }}
      onFocusCapture={() => {
        cancelLeave();
        setOpen(true);
      }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        scheduleLeave();
      }}
    >
      <Link
        href="/signal"
        aria-current={active ? "page" : undefined}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="signal-nav-tray"
        aria-label={copy.bar.menu}
        onClick={(event) => {
          if (!canHover() && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="focus-ring relative inline-flex cursor-pointer items-center justify-center rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-300 sm:px-4 sm:text-sm"
      >
        {children}
      </Link>
      <div
        id="signal-nav-tray"
        role="menu"
        aria-label={copy.bar.categories}
        className={`nav-signal-flyout absolute top-full left-1/2 z-50 pt-2 -translate-x-1/2 transition duration-200 ${
          open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        onPointerEnter={cancelLeave}
      >
        <div className={`bg-background border-foreground/8 w-max max-w-[min(92vw,40rem)] overflow-visible border p-1.5 shadow-sm ${
            track ? "rounded-[1.75rem]" : "rounded-full"
          }`}
        >
          <div className="flex items-center justify-center">
            {tracks.map((id) => {
              const on = track === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  aria-expanded={on}
                  aria-controls="signal-nav-tray-games"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return;
                    setTrack(id);
                  }}
                  onFocus={() => setTrack(id)}
                  onClick={() => {
                    play("tap");
                    setTrack(id);
                  }}
                  className={`focus-ring relative inline-flex h-8 cursor-pointer items-center justify-center rounded-full px-3 text-[13px] font-medium transition-colors sm:px-4 sm:text-sm ${
                    on
                      ? "bg-foreground/5 text-foreground ring-1 ring-foreground/8"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {copy.tracks[id].kicker}
                </button>
              );
            })}
          </div>
          {trayGames.length > 0 ? (
            <ul
              id="signal-nav-tray-games"
              className="mt-1 flex items-center justify-center px-1 pb-0.5"
            >
              {trayGames.map((game) => {
                const href = `/signal/play/${game.slug}`;
                const current = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={game.slug} className="group/play relative">
                    <Link
                      href={href}
                      role="menuitem"
                      onClick={() => play("tap")}
                      onPointerEnter={() => {
                        unlockAudio();
                        play("hover");
                      }}
                      className={`focus-ring relative inline-flex h-8 items-center rounded-full px-2.5 text-[13px] font-medium transition-colors sm:px-3 ${
                        current
                          ? "text-foreground"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {copy.games[game.slug].name}
                    </Link>
                    <PlayMark game={game} />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}
