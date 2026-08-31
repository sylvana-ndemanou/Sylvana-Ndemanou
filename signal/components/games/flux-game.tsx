// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { Button } from "@s/components/ui/button";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { beatWindowMsAt, takeDeck, tempoScaleAt } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  bpm: number;
  needData: boolean;
  consume: "dml" | "select" | "empty";
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Le stream a des INSERT. Task : WHEN SYSTEM$STREAM_HAS_DATA.",
    question: "Tape DML sur le beat, seulement s’il y a des lignes.",
    bpm: 72,
    needData: true,
    consume: "dml",
    ok: "HAS_DATA évite les runs à vide. Un stream, c’est un signet, pas une table de plus.",
    miss: "Taper dans le vide, c’est un warehouse qui se réveille pour rien.",
  },
  {
    tier: "easy",
    context: "Personne n’a écrit. Le stream est calme.",
    question: "Le beat tourne. Tu ne dois PAS consommer.",
    bpm: 76,
    needData: false,
    consume: "empty",
    ok: "Pas de DML source = pas de change records. Lancer la task, c’est payer 60 s pour un MERGE vide.",
    miss: "Tu as tapé. STREAM_HAS_DATA() était là pour skip.",
  },
  {
    tier: "easy",
    context: "Le stream a des lignes. Tu fais SELECT * FROM s.",
    question: "L’offset n’avance pas. Tape DML pour vraiment consommer.",
    bpm: 70,
    needData: true,
    consume: "dml",
    ok: "Un SELECT n’avance pas l’offset. Il faut un DML qui lit le stream.",
    miss: "Le SELECT est un aperçu. Le signet ne bouge que dans une transaction DML.",
  },
  {
    tier: "hard",
    context: "CREATE STREAM s ON TABLE brut. Des INSERT arrivent. Task : WHEN SYSTEM$STREAM_HAS_DATA.",
    question: "Tape sur le beat, seulement s’il y a des lignes dans le stream.",
    bpm: 88,
    needData: true,
    consume: "dml",
    ok: "La task se déclenche sur un CRON, mais le prédicat STREAM_HAS_DATA évite les runs à vide. Un stream, c’est un signet (offset), pas une table de plus.",
    miss: "Taper dans le vide, c’est un warehouse qui se réveille pour rien. HAS_DATA = le bookmark a du CDC derrière lui.",
  },
  {
    tier: "hard",
    context: "Personne n’a écrit dans brut. Le stream est calme.",
    question: "Le beat tourne. Tu ne dois PAS consommer.",
    bpm: 96,
    needData: false,
    consume: "empty",
    ok: "Pas de DML source = pas de change records. Lancer la task quand même, c’est payer le minimum 60 s du warehouse pour un MERGE vide.",
    miss: "Tu as tapé. Snowflake aurait pu skip grâce à WHEN SYSTEM$STREAM_HAS_DATA(). C’est fait pour ça.",
  },
  {
    tier: "hard",
    context: "Le stream a des lignes. Tu fais SELECT * FROM s.",
    question: "L’offset avance-t-il ? Tape DML pour vraiment consommer, pas SELECT.",
    bpm: 80,
    needData: true,
    consume: "dml",
    ok: "Querying a stream alone does not advance its offset. Il faut un DML (INSERT…SELECT, MERGE, CTAS). Plusieurs SELECT peuvent lire les mêmes changes.",
    miss: "Le SELECT est un aperçu. Le signet ne bouge que dans une transaction DML qui lit le stream.",
  },
  {
    tier: "hard",
    context: "Burst CDC. Tu dois tout avaler d’un coup — un MERGE, un beat.",
    question: "Un tap pile sur la mesure, stream plein. C’est le consume transactionnel.",
    bpm: 100,
    needData: true,
    consume: "dml",
    ok: "Un stream renvoie le set minimal de changes depuis l’offset jusqu’à la version courante. Un MERGE les pose et avance le bookmark d’un coup.",
    miss: "Hors beat ou stream vide : tu fractionnes mal. L’idée CDC, c’est une conso transactionnelle, pas du picorage.",
  },
  {
    tier: "hard",
    context: "Task enfant après la task parent. Le graphe a un rythme : parent, puis child.",
    question: "Laisse passer le beat parent (auto), tape seulement le beat enfant après le flash.",
    bpm: 84,
    needData: true,
    consume: "dml",
    ok: "Les task graphs s’enchaînent. L’enfant part après le succès du parent. Ce n’est plus un CRON isolé, c’est une mesure à deux temps.",
    miss: "Taper trop tôt, c’est lancer l’enfant avant que le parent ait commité. Snowflake attend la dépendance.",
  },
  {
    tier: "brutal",
    context: "Stream APPEND_ONLY. Des UPDATE arrivent sur la table source.",
    question: "Les UPDATE ne sont pas dans l’append-only. N’avale que s’il y a de vrais inserts.",
    bpm: 110,
    needData: false,
    consume: "empty",
    ok: "APPEND_ONLY ignore update/delete. HAS_DATA peut rester faux. Taper, c’est un run à vide.",
    miss: "Tu as consommé un stream qui n’avait rien à dire. APPEND_ONLY ≠ standard.",
  },
  {
    tier: "brutal",
    context: "Deux tasks lisent le même stream. La première a déjà MERGÉ.",
    question: "L’offset a bougé. La seconde ne doit PAS retaper.",
    bpm: 118,
    needData: false,
    consume: "empty",
    ok: "Un stream, un offset. Deux consumers, il te faut deux streams. Le second tap relit du vide.",
    miss: "Tu as rejoué un bookmark déjà avancé. Un stream n’est pas une queue Kafka à plusieurs groupes.",
  },
  {
    tier: "brutal",
    context: "SHOW STREAMS : stale after 14 days without consume. Le stream a dormi.",
    question: "Il a des lignes « anciennes ». Recréer / recréer l’offset, pas SELECT.",
    bpm: 104,
    needData: true,
    consume: "dml",
    ok: "Un stream stale se recréé. Un SELECT ne le répare pas. DML (ou recreate) pour reprendre un offset sain.",
    miss: "SELECT sur un stale, tu lis n’importe quoi. Recréer, puis DML.",
  },
  {
    tier: "brutal",
    context: "Task graph : parent fail, child ne doit pas partir. Le beat parent clignote rouge.",
    question: "N’avale l’enfant que si le parent a commité — ici, non.",
    bpm: 122,
    needData: false,
    consume: "empty",
    ok: "Dépendance de graphe. Parent en erreur = child skip. Taper l’enfant, c’est servir un mart à moitié.",
    miss: "Le flash enfant n’autorise pas. Le parent n’a pas commité.",
  },
  {
    tier: "brutal",
    context: "MERGE … WHEN MATCHED. Stream plein, beat serré. Un tap pile.",
    question: "C’est le consume. SELECT serait un aperçu. Empty serait un mensonge.",
    bpm: 128,
    needData: true,
    consume: "dml",
    ok: "Un MERGE qui lit le stream avance l’offset. C’est le geste. Le tempo ne pardonne plus.",
    miss: "Hors fenêtre ou SELECT : tu n’as pas consommé. Brutal, le beat est court.",
  },
];

export function FluxGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(
    () =>
      takeDeck(ROUNDS_DATA, difficulty).map((r, i) => ({
        ...r,
        bpm: Math.round(r.bpm * tempoScaleAt(difficulty, i, total)),
      })),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [dots, setDots] = useState(0);
  const [okHit, setOkHit] = useState(false);
  const [childGo, setChildGo] = useState(false);
  const beatRef = useRef(0);
  const lastBeat = useRef(0);

  const round = deck[index];
  const interval = 60000 / (round?.bpm ?? 90);

  useEffect(() => {
    if (phase !== "play" || locked) return;
    setDots(round.needData ? 3 + (index % 3) : 0);
    setOkHit(false);
    setChildGo(false);
    const start = Date.now();
    const id = window.setInterval(() => {
      beatRef.current += 1;
      lastBeat.current = Date.now();
      play("beat");
      setPulse(true);
      window.setTimeout(() => setPulse(false), 120);
      if (round.context.includes("enfant") && beatRef.current === 2) {
        setChildGo(true);
      }
      if (!round.needData && Math.random() < 0.08) {
        /* stay empty */
      }
    }, interval);
    const t0 = start;
    void t0;
    return () => window.clearInterval(id);
  }, [phase, locked, index, interval, round.needData, round.context]);

  function tap(kind: "dml" | "select") {
    if (locked) return;
    const dt = Date.now() - lastBeat.current;
    const windowMs = beatWindowMsAt(difficulty, index, total);
    const onBeat = dt < windowMs || dt > interval - windowMs;
    const has = dots > 0;
    let good = false;
    if (round.consume === "empty") {
      good = false;
    } else if (round.consume === "dml") {
      good = kind === "dml" && has && onBeat && (!round.context.includes("enfant") || childGo);
    }
    if (round.consume === "empty") {
      setLocked(true);
      setScore((s) => s);
      play("miss");
      return;
    }
    if (good) {
      play("ok");
      setOkHit(true);
      setDots(0);
      setLocked(true);
      setScore((s) => s + POINTS_PER_ROUND);
    } else {
      play("miss");
      setLocked(true);
    }
  }

  function hold() {
    if (locked) return;
    if (round.consume === "empty") {
      play("ok");
      setOkHit(true);
      setLocked(true);
      setScore((s) => s + POINTS_PER_ROUND);
      return;
    }
    play("miss");
    setLocked(true);
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    beatRef.current = 0;
    setIndex((v) => v + 1);
    setLocked(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Flux"
        how="Attrape les paquets sur le beat — tape l’orbe. Un stream vide, tu ne tends pas la main."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Flux"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          beatRef.current = 0;
        }}
      />
    );
  }

  return (
    <GameShell title="Flux" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          disabled={locked}
          onClick={() => {
            if (dots > 0) tap("dml");
            else hold();
          }}
          className={cn(
            "catch-orb relative flex size-36 items-center justify-center rounded-full border-4 transition",
            pulse ? "scale-110 border-primary bg-primary/30" : "border-border bg-card",
            dots > 0 && "shadow-[0_0_40px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
          )}
        >
          <span
            className="beat-ring pointer-events-none absolute inset-0 rounded-full border-2 border-primary/50"
            style={{ ["--beat" as string]: `${interval}ms` }}
          />
          {dots > 0
            ? Array.from({ length: Math.min(dots, 3) }).map((_, i) => (
                <span
                  key={i}
                  className="catch-packet pointer-events-none"
                  style={{ animationDelay: `${i * 220}ms` }}
                />
              ))
            : null}
          <span className="relative font-heading text-3xl tabular-nums">{round.bpm}</span>
        </button>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          BPM task · {childGo ? "enfant prêt" : "parent"} · fenêtre {beatWindowMsAt(difficulty, index, total)} ms
        </p>
        <div className="mt-4 flex min-h-10 items-center gap-2">
          {Array.from({ length: dots }).map((_, i) => (
            <span
              key={i}
              className="stream-dot size-4 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
          {dots === 0 ? (
            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              stream vide · HAS_DATA = false
            </span>
          ) : (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
              HAS_DATA = true
            </span>
          )}
        </div>
      </div>
      {locked ? (
        <Verdict
          tone={okHit ? "ok" : "miss"}
          title={okHit ? "Offset avancé." : "Mauvais temps."}
          lesson={okHit ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button size="lg" className="h-14" onClick={() => tap("dml")}>
            MERGE / INSERT SELECT
          </Button>
          <Button size="lg" variant="outline" className="h-14" onClick={() => tap("select")}>
            SELECT FROM stream
          </Button>
          <Button size="lg" variant="ghost" className="h-14" onClick={hold}>
            Ne rien lancer
          </Button>
        </div>
      )}
    </GameShell>
  );
}
