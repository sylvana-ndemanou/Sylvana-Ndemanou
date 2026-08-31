// @ts-nocheck
"use client";

import { useMemo, useRef, useState } from "react";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { ChoiceTile, LockBar } from "@s/components/interact";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { heat, scaleByHeat, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Action = "at" | "undrop" | "failsafe" | "now";

type Event = { t: number; label: string; rows?: string };

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  events: Event[];
  head: number;
  answer: Action;
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Léa habite Lyon. À 10:00, un UPDATE la met à Nantes. Le rapport de 09:00 doit encore dire Lyon.",
    question: "Rebobine avant l’UPDATE, puis lis.",
    events: [
      { t: 0, label: "09:00 Lyon", rows: "Léa · Lyon" },
      { t: 1, label: "10:00 Nantes", rows: "Léa · Nantes" },
      { t: 2, label: "Maintenant", rows: "Léa · Nantes" },
    ],
    head: 0,
    answer: "at",
    ok: "AT pinpointe 09:00. Tu relis Lyon. Time Travel, ce n’est pas un backup : c’est la version d’avant le DML.",
    miss: "Si la tête est après 10:00, tu lis Nantes.",
  },
  {
    tier: "easy",
    context: "Quelqu’un a DROP la table il y a deux heures. Rétention : 1 jour.",
    question: "Quelle commande ramène la table ?",
    events: [
      { t: 0, label: "Table ok" },
      { t: 1, label: "DROP 09:00" },
      { t: 2, label: "11:00" },
    ],
    head: 1,
    answer: "undrop",
    ok: "UNDROP restaure l’objet dropped tant qu’il est dans la rétention.",
    miss: "CREATE TABLE ne ramène pas l’histoire. UNDROP, si.",
  },
  {
    tier: "easy",
    context: "DROP il y a 9 jours. Rétention 1 jour, Fail-safe 7 jours. On est trop loin.",
    question: "Peux-tu encore UNDROP ?",
    events: [
      { t: 0, label: "J0 DROP" },
      { t: 1, label: "J1 fin TT" },
      { t: 2, label: "J9 perdu" },
    ],
    head: 2,
    answer: "failsafe",
    ok: "J+9, Fail-safe est fini. Plus de SELECT, plus d’UNDROP. Trop tard.",
    miss: "Time Travel ≠ archive infinie. J+9, c’est perdu.",
  },
  {
    tier: "hard",
    context: "Léa passe de Lyon à Nantes à 10:00. Les commandes de 09:00 doivent rester Lyon.",
    question: "Place la tête AVANT l’UPDATE, puis SELECT AT.",
    events: [
      { t: 0, label: "09:00 CREATE", rows: "Léa · Lyon" },
      { t: 1, label: "10:00 UPDATE Nantes", rows: "Léa · Nantes" },
      { t: 2, label: "11:00 maintenant", rows: "Léa · Nantes" },
    ],
    head: 0,
    answer: "at",
    ok: "AT | BEFORE pinpointe un timestamp, un OFFSET, ou un STATEMENT. SELECT AT (TIMESTAMP => '09:00') relit Lyon. Le schéma courant s’applique encore.",
    miss: "Si la tête est après 10:00, tu lis Nantes. Time Travel, ce n’est pas un backup : c’est la version immuable des micro-partitions d’avant le DML.",
  },
  {
    tier: "hard",
    context: "Quelqu’un a DROP TABLE fact_ventes il y a deux heures. Rétention Standard : 1 jour.",
    question: "La table est dans Time Travel. Quelle commande la ramène ?",
    events: [
      { t: 0, label: "hier 18:00 table ok" },
      { t: 1, label: "aujourd’hui 09:00 DROP" },
      { t: 2, label: "11:00 maintenant" },
    ],
    head: 2,
    answer: "undrop",
    ok: "UNDROP TABLE restaure l’objet dropped tant qu’il est dans la période de rétention. Standard = 1 jour (24 h), automatiquement.",
    miss: "CREATE TABLE ne ramène pas l’histoire. UNDROP, c’est l’extension SQL de Time Travel pour les objets dropped.",
  },
  {
    tier: "hard",
    context: "Rétention 1 jour. On est J+9. La table dropped n’est plus dans Time Travel.",
    question: "Où sont les octets ? Et peux-tu UNDROP ?",
    events: [
      { t: 0, label: "J0 DROP" },
      { t: 1, label: "J1 fin Time Travel" },
      { t: 2, label: "J2–J8 Fail-safe" },
      { t: 3, label: "J9 perdu" },
    ],
    head: 3,
    answer: "failsafe",
    ok: "Après la rétention, les données permanentes passent en Fail-safe (7 jours). Plus de SELECT, plus d’UNDROP, plus de CLONE. Seul Snowflake Support — best effort, pas un outil métier.",
    miss: "J+9, Fail-safe est fini. Ce n’est plus récupérable. Time Travel ≠ archive infinie.",
  },
  {
    tier: "hard",
    context: "Enterprise : tu peux monter DATA_RETENTION_TIME_IN_DAYS jusqu’à 90. Transient : max 1 jour.",
    question: "Pour un mart jetable, tu veux 0 jour de Time Travel. Quel effet ?",
    events: [
      { t: 0, label: "permanent 90j" },
      { t: 1, label: "transient 1j" },
      { t: 2, label: "0 jour = off" },
    ],
    head: 2,
    answer: "now",
    ok: "0 jour désactive Time Travel sur l’objet. DROP et c’est fini — pas d’UNDROP. Snowflake déconseille 0 si tu tiens à récupérer un drop.",
    miss: "0 n’est pas « Fail-safe plus court ». Ça coupe AT/BEFORE/UNDROP. Les transients n’ont de toute façon pas de Fail-safe.",
  },
  {
    tier: "hard",
    context: "CLONE historique : CREATE TABLE dev CLONE prod AT (TIMESTAMP => …).",
    question: "La tête est sur 09:00. Quelle action crée le clone à cet instant ?",
    events: [
      { t: 0, label: "09:00 prod v1" },
      { t: 1, label: "12:00 prod v2" },
      { t: 2, label: "15:00 maintenant" },
    ],
    head: 0,
    answer: "at",
    ok: "CREATE … CLONE accepte AT | BEFORE, comme SELECT. Sans clause, le clone est CURRENT_TIMESTAMP. Avec AT, tu dupliques un passé — toujours en zéro-copie sur les micro-partitions d’alors.",
    miss: "UNDROP restaure un objet dropped, ça ne clone pas un passé vivant. CLONE AT, c’est le voyage + la copie logique.",
  },
  {
    tier: "brutal",
    context: "Transient table dropped il y a 3 jours. Pas de Fail-safe sur transient.",
    question: "UNDROP ? Fail-safe ? Ou trop tard, tout court ?",
    events: [
      { t: 0, label: "J0 DROP transient" },
      { t: 1, label: "J1 fin TT (max 1j)" },
      { t: 2, label: "J3 — pas de Fail-safe" },
    ],
    head: 2,
    answer: "now",
    ok: "Transient : pas de Fail-safe. Après la rétention, c’est fini. UNDROP ne marchera pas. Ce n’est plus « Fail-safe, on appelle le support ».",
    miss: "Fail-safe n’existe pas sur transient. J+3, l’objet est parti.",
  },
  {
    tier: "brutal",
    context: "TRUNCATE il y a 20 minutes. La table existe encore.",
    question: "Ce n’est pas un DROP. Quelle action relit les lignes ?",
    events: [
      { t: 0, label: "09:00 1 M lignes" },
      { t: 1, label: "09:40 TRUNCATE" },
      { t: 2, label: "10:00 maintenant" },
    ],
    head: 0,
    answer: "at",
    ok: "TRUNCATE est un DML de métadonnées. Time Travel AT avant le truncate relit les lignes. UNDROP ne s’applique pas : l’objet n’est pas dropped.",
    miss: "UNDROP c’est pour DROP. Ici la table est là, vide. AT, pas UNDROP.",
  },
  {
    tier: "brutal",
    context: "Enterprise 90j. DROP J-40. Toujours dans Time Travel.",
    question: "La table est dropped mais dans la fenêtre. Quelle commande ?",
    events: [
      { t: 0, label: "J-40 DROP" },
      { t: 1, label: "J-20 encore TT" },
      { t: 2, label: "J0 maintenant" },
    ],
    head: 2,
    answer: "undrop",
    ok: "90 jours d’Enterprise : J-40 est encore UNDROP. Fail-safe, c’est après la rétention.",
    miss: "Ce n’est pas trop tard. Rétention 90j, UNDROP marche. Fail-safe serait plus tard, et sans SQL.",
  },
  {
    tier: "brutal",
    context: "CLONE AT d’avant un DROP. La table source n’existe plus « maintenant ».",
    question: "La tête est sur v1, avant le DROP. Quelle action ?",
    events: [
      { t: 0, label: "v1 vivante" },
      { t: 1, label: "DROP" },
      { t: 2, label: "maintenant (dropped)" },
    ],
    head: 0,
    answer: "at",
    ok: "CLONE AT (avant DROP) recrée un objet depuis Time Travel. UNDROP ramènerait l’objet dropped sous son nom. Ici on te demande le clone historique.",
    miss: "UNDROP restaure le nom dropped. CLONE AT copie un passé, éventuellement sous un autre nom.",
  },
  {
    tier: "brutal",
    context: "Rétention 0 sur un mart. DROP accidentel il y a 4 minutes.",
    question: "Zero Time Travel. Que reste-t-il ?",
    events: [
      { t: 0, label: "rétention 0" },
      { t: 1, label: "DROP" },
      { t: 2, label: "+4 min" },
    ],
    head: 2,
    answer: "now",
    ok: "0 jour = pas d’UNDROP, pas d’AT. Permanent sans TT, Fail-safe existe encore — mais pas en SQL. Ici le geste métier, c’est « pas de Time Travel ».",
    miss: "UNDROP exige une rétention. À 0, c’est fini pour toi.",
  },
];

const ACTIONS: { id: Action; label: string; hint: string }[] = [
  { id: "at", label: "SELECT / CLONE AT", hint: "lire ce timestamp" },
  { id: "undrop", label: "UNDROP", hint: "objet dropped" },
  { id: "failsafe", label: "Fail-safe", hint: "plus d’accès SQL" },
  { id: "now", label: "Pas de Time Travel", hint: "rétention 0" },
];

function actionsFor(difficulty: Difficulty, roundIndex: number, totalRounds: number, answer: Action) {
  const n = Math.max(2, Math.round(scaleByHeat(2, ACTIONS.length, heat(difficulty, roundIndex, totalRounds))));
  const keep = new Set<Action>([answer]);
  for (const action of ACTIONS) {
    if (keep.size >= n) break;
    keep.add(action.id);
  }
  return ACTIONS.filter((action) => keep.has(action.id));
}

export function VoyageGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [head, setHead] = useState(0);
  const [act, setAct] = useState<Action | null>(null);
  const [locked, setLocked] = useState(false);
  const sealed = useRef(false);

  const round = deck[index];
  const actions = round ? actionsFor(difficulty, index, total, round.answer) : ACTIONS;
  const needHead = round?.head;
  const headOk = head === needHead;
  const headRequired = difficulty === "brutal" || round?.answer === "at";
  const correct = act === round?.answer && (!headRequired || headOk);

  function lockAct() {
    if (sealed.current || !act) return;
    sealed.current = true;
    setLocked(true);
    setScore((s) => s + (act === round.answer && (!headRequired || head === round.head) ? POINTS_PER_ROUND : 0));
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    const n = index + 1;
    setIndex(n);
    setHead(deck[n].events.length - 1);
    setAct(null);
    setLocked(false);
    sealed.current = false;
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Voyage"
        how="Time Travel est allumé par défaut (1 jour). Enterprise : jusqu’à 90. Tu rebobines la bande, tu entends le défilement, tu décides AT, UNDROP, ou tu acceptes Fail-safe."
        onStart={() => {
          setHead(deck[0].events.length - 1);
          setPhase("play");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Voyage"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setAct(null);
          setLocked(false);
          sealed.current = false;
        }}
      />
    );
  }

  return (
    <GameShell title="Voyage" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Bande · Time Travel</p>
        <div className="relative mt-5">
          <div className="absolute left-3 right-3 top-3 h-0.5 bg-foreground/15" />
          <div className="relative flex justify-between gap-1">
            {round.events.map((ev, i) => {
              const lost = /perdu|trop tard|0 jour/i.test(ev.label);
              const fail = /fail-safe|failsafe/i.test(ev.label);
              return (
                <button
                  key={ev.label}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setHead(i);
                    play("rewind");
                  }}
                  className="relative z-[1] flex flex-1 flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "size-3 rounded-full border-2 transition",
                      i === head && "tape-head size-4 border-primary bg-primary shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_55%,transparent)]",
                      i !== head && lost && "border-anomaly bg-anomaly/40",
                      i !== head && fail && !lost && "border-chart-3 bg-chart-3/50",
                      i !== head && !lost && !fail && "border-border bg-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "w-full rounded-lg px-1 py-2 font-mono text-[10px] leading-tight",
                      i === head ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {ev.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={round.events.length - 1}
          value={head}
          disabled={locked}
          onChange={(e) => {
            const v = Number(e.target.value);
            setHead(v);
            play("rewind");
          }}
          className="mt-4 w-full accent-[var(--primary)]"
        />
        {round.events[head]?.rows ? (
          <p className="mt-3 font-heading text-2xl">{round.events[head].rows}</p>
        ) : (
          <p className="mt-3 font-mono text-xs text-muted-foreground">Tête de lecture · événement {head + 1}/{round.events.length}</p>
        )}
      </div>
      <div className="scene-opts mt-4 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <ChoiceTile
            key={a.id}
            title={a.label}
            hint={a.hint}
            selected={act === a.id}
            locked={locked}
            isAnswer={a.id === round.answer}
            isWrong={act === a.id && a.id !== round.answer}
            disabled={locked}
            onClick={() => setAct(a.id)}
            onConfirm={lockAct}
          />
        ))}
      </div>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Le passé tient." : "Mauvais instant."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar disabled={!act} label="Exécuter" onLock={lockAct} />
      )}
    </GameShell>
  );
}
