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
const ARM_GUARD_MS = 520;

export function useCountdown(onGo: () => void) {
  const [beat, setBeat] = useState<Beat | null>(null);
  const fired = useRef(false);
  const armedAt = useRef(0);
  const goRef = useRef(onGo);
  goRef.current = onGo;

  function arm() {
    fired.current = false;
    armedAt.current = Date.now();
    unlockAudio();
    setBeat(3);
  }

  function fire() {
    if (fired.current) return;
    fired.current = true;
    play("start");
    goRef.current();
    setBeat(null);
  }

  function advance() {
    if (beat === null) return;
    if (Date.now() - armedAt.current < ARM_GUARD_MS) return;
    if (beat === "go") {
      fire();
      return;
    }
    setBeat(beat === 1 ? "go" : ((beat - 1) as Beat));
  }

  useEffect(() => {
    if (beat === null) return;
    if (beat === "go") {
      const t = window.setTimeout(fire, GO_MS);
      return () => window.clearTimeout(t);
    }
    play("tick");
    const t = window.setTimeout(() => {
      setBeat(beat === 1 ? "go" : ((beat - 1) as Beat));
    }, BEAT_MS);
    return () => window.clearTimeout(t);
  }, [beat]);

  return { beat, arm, advance, armed: beat !== null };
}

export function CountdownOverlay({
  beat,
  onAdvance,
}: {
  beat: Beat | null;
  onAdvance: () => void;
}) {
  const { t } = useI18n();
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (beat === null) {
      setLive(false);
      return;
    }
    setLive(false);
    const t = window.setTimeout(() => setLive(true), ARM_GUARD_MS);
    return () => window.clearTimeout(t);
  }, [beat]);

  if (!ready || beat === null) return null;

  const label = beat === "go" ? t.lobby.go : String(beat);

  return createPortal(
    <button
      type="button"
      aria-live="assertive"
      data-signal-countdown
      onClick={onAdvance}
      className={cn(
        "countdown-veil",
        beat === "go" && "countdown-go",
        `countdown-${beat}`,
        !live && "countdown-armed"
      )}
    >
      <span className="countdown-kicker">{beat === "go" ? t.lobby.start : t.lobby.ready}</span>
      <span key={label} className="countdown-num">
        {label}
      </span>
    </button>,
    document.body
  );
}
