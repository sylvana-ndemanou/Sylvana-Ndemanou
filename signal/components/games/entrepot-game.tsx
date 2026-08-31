// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { LockBar } from "@s/components/interact";
import { Button } from "@s/components/ui/button";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { expandBand, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

const SIZES = [
  { id: "XS", label: "X-Small", credits: 1 },
  { id: "S", label: "Small", credits: 2 },
  { id: "M", label: "Medium", credits: 4 },
  { id: "L", label: "Large", credits: 8 },
  { id: "XL", label: "X-Large", credits: 16 },
  { id: "2XL", label: "2X-Large", credits: 32 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  min: SizeId;
  max: SizeId;
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "SELECT COUNT(*) FROM dim_magasin. Un X-Small suffit.",
    question: "Reste petit. Trop gros ne va pas plus vite — ça double la facture.",
    min: "XS",
    max: "S",
    ok: "X-Small = 1 crédit/heure. Compter des magasins n’a pas besoin d’un XL.",
    miss: "Un XL pour un COUNT, c’est jeter des crédits.",
  },
  {
    tier: "easy",
    context: "Jointure lourde, milliards de lignes. Ça rame en Small.",
    question: "Monte. Les grosses requêtes veulent du compute.",
    min: "L",
    max: "2XL",
    ok: "Complex queries want more compute. Un Small sur 2 milliards, c’est de la file.",
    miss: "Rester en Small ici, c’est de l’attente payante.",
  },
  {
    tier: "easy",
    context: "Tu RESUME, tu t’arrêtes 8 secondes plus tard.",
    question: "Minimum facturé à chaque démarrage : 60 secondes. Dimensionne n’importe, le piège est le resume.",
    min: "XS",
    max: "2XL",
    ok: "Per-second billing, 60-second minimum. Huit secondes = une minute payée.",
    miss: "Resume / suspend en boucle, c’est jeter le premier crédit.",
  },
  {
    tier: "hard",
    context: "SELECT COUNT(*) FROM dim_magasin. Un entrepôt X-Small suffit.",
    question: "Dimensionne. Un warehouse trop gros ne va pas plus vite sur une requête triviale — il double juste la facture.",
    min: "XS",
    max: "S",
    ok: "Docs Snowflake : larger is not necessarily faster for small, basic queries. X-Small = 1 crédit/heure. XL = 16.",
    miss: "Compter des magasins n’a pas besoin de 16 crédits/heure. La taille scale le compute, pas la magie.",
  },
  {
    tier: "hard",
    context: "Jointure lourde, ~2 milliards de lignes, fenêtre analytique. Ça rame en Small.",
    question: "Monte le fader. Query performance scales with warehouse size — pour les grosses.",
    min: "L",
    max: "2XL",
    ok: "Les ressources supplémentaires ne touchent pas les requêtes déjà en cours. Elles servent la file et les suivantes.",
    miss: "Un Small sur 2 milliards de lignes, c’est de la file d’attente. Snowflake le dit : complex queries want more compute.",
  },
  {
    tier: "hard",
    context: "COPY INTO de 12 fichiers de 8 Mo. Pas des milliers.",
    question: "Le load se joue sur le nombre de fichiers, pas sur le 6XL.",
    min: "XS",
    max: "M",
    ok: "Increasing warehouse size does not always improve data loading. Sauf bulk de centaines de fichiers, Small/Medium suffisent.",
    miss: "Un 2XL pour douze fichiers : plus de crédits, pas plus de débit. Le load aime le parallélisme de fichiers, pas le gigantisme.",
  },
  {
    tier: "hard",
    context: "Tu viens de RESUME. Tu t’arrêtes 8 secondes plus tard.",
    question: "Combien de secondes minimum Snowflake facture à chaque démarrage ?",
    min: "XS",
    max: "2XL",
    ok: "Per-second billing, with a 60-second minimum each time the warehouse starts. Huit secondes = une minute payée.",
    miss: "Le minimum de 60 secondes est dans la doc warehouses. Resume / suspend en boucle, c’est jeter le premier crédit.",
  },
  {
    tier: "hard",
    context: "Les requêtes s’empilent. La file d’attente gonfle. Ce n’est plus une requête lente : c’est de la concurrence.",
    question: "Pour la concurrence, Snowflake recommande le multi-cluster — pas un 6XL unique.",
    min: "M",
    max: "L",
    ok: "Resizing aide un peu la file. Le scaling automatique de concurrence, c’est multi-cluster warehouses (Enterprise).",
    miss: "Un 6XL traite plus vite UNE requête. Plusieurs sessions concurrentes : un deuxième cluster, pas juste plus gros.",
  },
  {
    tier: "brutal",
    context: "Search optimization + lookup point. Warehouse déjà XS. Monter ne sert à rien.",
    question: "Reste au plus petit. Le service est ailleurs.",
    min: "XS",
    max: "XS",
    ok: "Le lookup est payé par Search Optimization, pas par un 2XL. Larger is not faster here.",
    miss: "Monter le fader, c’est payer du compute pour un service que tu as déjà allumé.",
  },
  {
    tier: "brutal",
    context: "500 000 petits fichiers. Load. Snowflake parallélise par fichier.",
    question: "Là, un Medium/Large aide. Pas un XS, pas un 6XL.",
    min: "M",
    max: "L",
    ok: "Beaucoup de fichiers : plus de threads de load. Medium/Large. Un 2XL n’est plus linéairement utile.",
    miss: "XS sous-parallélise. 2XL surfacture. La fenêtre est étroite.",
  },
  {
    tier: "brutal",
    context: "BI dashboard, 40 users, queries courtes. File, pas lenteur d’une requête.",
    question: "Taille pour la concurrence raisonnable — pas un 2XL « au cas où ».",
    min: "S",
    max: "M",
    ok: "Queries courtes + concurrence : multi-cluster ou un S/M. Un 2XL gaspille le idle.",
    miss: "Un 2XL pour du BI court, c’est 16× le crédit d’un XS pour du cache result.",
  },
  {
    tier: "brutal",
    context: "Snowpark UDF Python, grosse frame, une session. Ça swap en Small.",
    question: "Monte pour la mémoire du warehouse, pas pour la file.",
    min: "L",
    max: "XL",
    ok: "Snowpark aime la RAM du warehouse. Large/XL. 2XL si tu n’as vraiment plus de mémoire — ici XL suffit.",
    miss: "XS/S vont OOM. 2XL est du luxe. La fenêtre, c’est L–XL.",
  },
  {
    tier: "brutal",
    context: "Auto-suspend 1 s. Tu relances toutes les 20 s toute la journée.",
    question: "Le minimum 60 s te tue. Taille : petit, mais surtout arrête de resume.",
    min: "XS",
    max: "S",
    ok: "Chaque resume = 60 s. Vingt relances/heure = tu paies XS comme s’il était toujours allumé. Reste petit, allonge l’auto-suspend.",
    miss: "Monter le fader empire la facture. Le vrai levier, c’est arrêter le yo-yo resume.",
  },
];

const ORDER: SizeId[] = ["XS", "S", "M", "L", "XL", "2XL"];

function SizeFader({
  index,
  disabled,
  onChange,
}: {
  index: number;
  disabled?: boolean;
  onChange: (i: number) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const last = useRef(index);
  last.current = index;
  const [glide, setGlide] = useState<number | null>(null);
  const top = SIZES.length - 1;
  const t = glide ?? index / top;
  const nearest = Math.round(t * top);

  function yToT(clientY: number) {
    const el = railRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (rect.bottom - clientY) / rect.height));
  }

  function applyT(nextT: number, commit: boolean) {
    const i = Math.round(nextT * top);
    if (i !== last.current) onChange(i);
    if (commit) {
      onChange(i);
      setGlide(null);
    } else {
      setGlide(nextT);
    }
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    applyT(yToT(event.clientY), false);
    const move = (ev: PointerEvent) => applyT(yToT(ev.clientY), false);
    const up = (ev: PointerEvent) => {
      applyT(yToT(ev.clientY), true);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  return (
    <div className="flex flex-col items-center px-1">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Compute</p>
      <div
        role="slider"
        aria-label="Taille du warehouse"
        aria-valuemin={0}
        aria-valuemax={top}
        aria-valuenow={index}
        aria-valuetext={`${SIZES[index].id} · ${SIZES[index].credits} crédits / heure`}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={onPointerDown}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowUp" || event.key === "ArrowRight") {
            event.preventDefault();
            onChange(Math.min(top, index + 1));
          }
          if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
            event.preventDefault();
            onChange(Math.max(0, index - 1));
          }
          if (event.key === "Home") {
            event.preventDefault();
            onChange(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            onChange(top);
          }
        }}
        className={cn(
          "wh-fader grid h-56 select-none grid-cols-[2.6rem_1.35rem_2.7rem] touch-none py-2 outline-none",
          glide != null && "is-glide",
          disabled ? "cursor-default opacity-55" : "cursor-ns-resize"
        )}
        style={{ ["--wh-t" as string]: String(t) }}
      >
        <div className="relative">
          {SIZES.map((size, i) => (
            <span
              key={size.id}
              className="wh-tick absolute right-1.5 h-[3px] origin-right rounded-full"
              data-on={i <= nearest ? "" : undefined}
              data-now={i === nearest ? "" : undefined}
              style={{
                bottom: `${(i / top) * 100}%`,
                width: `${0.55 + i * 0.28}rem`,
                transform: "translateY(-50%)",
              }}
            />
          ))}
        </div>
        <div ref={railRef} className="wh-rail relative mx-auto w-2">
          <div className="wh-fill" />
          <div className="wh-thumb" />
        </div>
        <div className="relative">
          {SIZES.map((size, i) => (
            <button
              key={size.id}
              type="button"
              disabled={disabled}
              tabIndex={-1}
              onClick={() => onChange(i)}
              className={cn(
                "wh-size absolute left-1.5 -translate-y-1/2 cursor-pointer rounded-md px-1 py-0.5 text-left font-mono text-[11px] leading-none tracking-wide disabled:cursor-default",
                i === nearest && "is-now"
              )}
              style={{ bottom: `${(i / top) * 100}%` }}
            >
              {size.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EntrepotGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [credits, setCredits] = useState(0);
  const [locked, setLocked] = useState(false);
  const [guess60, setGuess60] = useState("");

  const round = deck[index];
  const size = SIZES[sizeIdx];
  const isMinBill = index === 3;

  useEffect(() => {
    if (!running || locked) return;
    const id = window.setInterval(() => {
      play("credit");
      setCredits((c) => c + size.credits / 90);
    }, 380);
    return () => window.clearInterval(id);
  }, [running, locked, size.credits]);

  function inBand(id: SizeId) {
    const a = ORDER.indexOf(round.min);
    const b = ORDER.indexOf(round.max);
    const x = ORDER.indexOf(id);
    const [lo, hi] = expandBand(a, b, difficulty, ORDER.length - 1, index, total);
    return x >= lo && x <= hi;
  }

  const correct = isMinBill
    ? guess60.trim() === "60" || guess60.trim() === "60s" || guess60.toLowerCase().includes("60")
    : inBand(size.id);

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setSizeIdx(0);
    setRunning(false);
    setCredits(0);
    setLocked(false);
    setGuess60("");
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Entrepôt"
        how="Un virtual warehouse, c’est du compute détaché du stockage. Tu entends les crédits. X-Small = 1 crédit/heure, chaque taille double. Auto-suspend, sinon ça tourne dans le vide."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Entrepôt"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
        }}
      />
    );
  }

  return (
    <GameShell title="Entrepôt" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Virtual warehouse</p>
          <p className="font-heading mt-1 text-4xl">{size.label}</p>
          <p className="mt-1 font-mono text-sm text-signal">{size.credits} crédit{size.credits > 1 ? "s" : ""} / heure</p>
          <div className="wh-cluster mt-4" data-run={running ? "" : undefined}>
            {Array.from({ length: size.credits }).map((_, i) => (
              <span key={i} className="wh-node" style={{ animationDelay: `${i * 55}ms` }} />
            ))}
          </div>
          <p className={cn("mt-4 font-mono text-xs", running ? "kpi-flash text-signal" : "text-muted-foreground")}>
            Crédits simulés · {credits.toFixed(3)}
            {running ? " · RUNNING" : " · SUSPENDED"}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant={running ? "outline" : "default"}
              disabled={locked}
              onClick={() => {
                if (running) {
                  setRunning(false);
                  play("tap");
                } else {
                  setRunning(true);
                  play("start");
                }
              }}
            >
              {running ? "SUSPEND" : "RESUME"}
            </Button>
          </div>
          {isMinBill ? (
            <label className="mt-4 block">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Minimum de facturation (secondes)
              </span>
              <input
                value={guess60}
                onChange={(e) => setGuess60(e.target.value)}
                inputMode="numeric"
                placeholder="…"
                disabled={locked}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-heading text-2xl outline-none focus:border-primary"
              />
            </label>
          ) : null}
        </div>
        <SizeFader
          index={sizeIdx}
          disabled={locked}
          onChange={(v) => {
            setSizeIdx(v);
            play("tick");
          }}
        />
      </div>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Compute juste." : "Mauvais wattage."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          disabled={isMinBill && !guess60.trim()}
          label="Sceller la taille"
          onLock={() => {
            setLocked(true);
            setRunning(false);
            setScore((s) => s + (correct ? POINTS_PER_ROUND : 0));
          }}
        />
      )}
    </GameShell>
  );
}
