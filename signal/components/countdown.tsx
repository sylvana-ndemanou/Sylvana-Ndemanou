// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { play, unlockAudio } from "@s/lib/audio";
import { useI18n } from "@s/lib/i18n";
import { cn } from "@s/lib/utils";

type Beat = 3 | 2 | 1 | "go";

const BEAT_MS = 900;
const GO_MS = 700;

export function useCountdown(onGo: () => void) {
  const [beat, setBeat] = useState<Beat | null>(null);
  const fired = useRef(false);
  const timers = useRef([]);
  const goRef = useRef(onGo);
  goRef.current = onGo;

  function clearTimers() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  function fire() {
    if (fired.current) return;
    fired.current = true;
    clearTimers();
    play("start");
    goRef.current();
    setBeat(null);
  }

  function arm() {
    clearTimers();
    fired.current = false;
    unlockAudio();
    setBeat(3);
    play("count");
    const plan = [
      [BEAT_MS, 2],
      [BEAT_MS * 2, 1],
      [BEAT_MS * 3, "go"],
      [BEAT_MS * 3 + GO_MS, "fire"],
    ];
    for (const [ms, next] of plan) {
      timers.current.push(
        window.setTimeout(() => {
          if (fired.current) return;
          if (next === "fire") {
            fire();
            return;
          }
          setBeat(next);
          if (next !== "go") play("count");
        }, ms)
      );
    }
  }

  useEffect(() => () => clearTimers(), []);

  return { beat, arm, fire, armed: beat !== null };
}

export function CountdownOverlay({
  beat,
  onGo,
}: {
  beat: Beat | null;
  onGo: () => void;
}) {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready || beat === null) return null;

  const label = beat === "go" ? t.lobby.go : String(beat);

  return createPortal(
    <div
      role="status"
      aria-live="assertive"
      data-signal-countdown
      className={cn(
        "signal-root countdown-veil",
        beat === "go" && "countdown-go",
        `countdown-${beat}`
      )}
      onClick={
        beat === "go"
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onGo();
            }
          : undefined
      }
    >
      <span className="countdown-kicker">{beat === "go" ? t.lobby.start : t.lobby.ready}</span>
      <span key={label} className="countdown-num">
        {label}
      </span>
    </div>,
    document.body
  );
}
