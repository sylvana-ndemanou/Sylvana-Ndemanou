// @ts-nocheck
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@s/lib/i18n";
import { cn } from "@s/lib/utils";
import {
  hydrateMute,
  play,
  readMuted,
  subscribeMute,
  toggleMute,
  unlockAudio,
} from "@s/lib/audio";

export function AudioRoot() {
  useEffect(() => {
    hydrateMute();
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });

    const SELECTOR = "button, a, [role='button'], [data-slot='button']";
    let lastAt = 0;
    let lastHit: Element | null = null;

    function hover(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const node = event.target;
      if (!(node instanceof Element)) return;
      const hit = node.closest(SELECTOR);
      if (!(hit instanceof HTMLElement)) return;
      if (hit.getAttribute("aria-disabled") === "true") return;
      if ("disabled" in hit && (hit as HTMLButtonElement).disabled) return;
      const from = event.relatedTarget;
      if (from instanceof Node && hit.contains(from)) return;
      if (hit === lastHit && event.timeStamp - lastAt < 80) return;
      lastHit = hit;
      lastAt = event.timeStamp;
      unlockAudio();
      play("hover");
    }

    document.addEventListener("pointerover", hover);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("pointerover", hover);
    };
  }, []);
  return null;
}

export function SoundToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const muted = useSyncExternalStore(subscribeMute, readMuted, () => false);
  const label = muted ? t.bar.unmute : t.bar.mute;

  return (
    <button
      type="button"
      className={cn("nav-orb", className)}
      aria-label={label}
      onClick={() => {
        toggleMute();
        if (muted) {
          unlockAudio();
          play("tap");
        }
      }}
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
