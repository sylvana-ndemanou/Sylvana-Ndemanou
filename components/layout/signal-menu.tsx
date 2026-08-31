"use client";

import { GameMark } from "@s/components/game-previews";
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
  const rootRef = useRef<HTMLLIElement>(null);
  const leaveTimer = useRef<number | null>(null);

  function cancelLeave() {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function scheduleLeave() {
    cancelLeave();
    leaveTimer.current = window.setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;
      if (rootRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const tracks: GameTrack[] = ["bi", "data", "snowflake"];

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
                <div className="bg-background border-foreground/8 w-max max-w-[min(92vw,28rem)] overflow-visible rounded-[1.35rem] border p-2 shadow-sm sm:max-w-[min(92vw,38rem)]">
          {tracks.map((id) => {
            const games = GAMES.filter((game) => game.track === id);
            return (
              <section key={id} className="px-1 py-1.5">
                <p className="px-3 pb-1 font-mono text-[10px] tracking-[0.18em] text-foreground/45 uppercase">
                  {copy.tracks[id].kicker}
                </p>
                <ul className="flex flex-wrap items-center">
                  {games.map((game) => {
                    const href = `/signal/play/${game.slug}`;
                    const current =
                      pathname === href || pathname.startsWith(`${href}/`);
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
                          className={`focus-ring group/play relative inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium transition-colors sm:px-3 ${
                            current
                              ? "text-foreground"
                              : "text-foreground/60 hover:text-foreground"
                          }`}
                        >
                          <span
                            aria-hidden
                            className="nav-signal-mark grid size-5 place-items-center rounded-[0.35rem] text-[oklch(0.16_0.04_122)]"
                            style={{ background: game.accent }}
                          >
                            <GameMark slug={game.slug} live />
                          </span>
                          {copy.games[game.slug].name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </li>
  );
}
