// @ts-nocheck
"use client";

import { useMemo, useRef, useState } from "react";
import { GameShell, Intro, PlayStage, QuestionBeat, Result, RoundHeader, Verdict, useBriefRound } from "@s/components/game-shell";
import { VoyageTram } from "@s/components/voyage-tram";
import { ChoiceTile, LockBar } from "@s/components/interact";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { countAlong, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { usePlay } from "@s/lib/play-text";
import { cn } from "@s/lib/utils";

type Action = "at" | "undrop" | "failsafe" | "now";

type Event = { t: number; label: string; rows?: string };

type Round = {
  id: string;
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
    id: "lea-easy",
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
    id: "drop-easy",
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
    id: "fail-easy",
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
    id: "lea",
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
    id: "drop",
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
    id: "fail",
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
    id: "zero-tt",
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
    id: "clone-at",
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
    id: "transient",
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
    id: "truncate",
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
    id: "ent-90",
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
    id: "clone-drop",
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
    id: "zero-drop",
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

const ACTION_IDS: Action[] = ["at", "undrop", "failsafe", "now"];

function actionsFor(difficulty: Difficulty, roundIndex: number, totalRounds: number, answer: Action) {
  const n = Math.max(
    2,
    countAlong(difficulty, roundIndex, totalRounds, [2, 2], [3, 3], [ACTION_IDS.length, ACTION_IDS.length])
  );
  const keep = new Set<Action>([answer]);
  for (const id of ACTION_IDS) {
    if (keep.size >= n) break;
    keep.add(id);
  }
  return ACTION_IDS.filter((id) => keep.has(id));
}

export function VoyageGame({ onFinish }: { onFinish: (score: number) => void }) {
  const playI18n = usePlay("voyage");
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [head, setHead] = useState(0);
  const [act, setAct] = useState<Action | null>(null);
  const [locked, setLocked] = useState(false);
  const [touchedHead, setTouchedHead] = useState(false);
  const sealed = useRef(false);
  const { brief, go } = useBriefRound(index, phase === "play");

  const raw = deck[index];
  const round = playI18n.overlay(raw);
  const actions = raw ? actionsFor(difficulty, index, total, raw.answer) : ACTION_IDS;
  const headRequired = Boolean(raw && (difficulty === "brutal" || raw.answer === "at"));
  const defaultHead = (raw?.events.length ?? 1) - 1;
  const mustRewind = Boolean(raw && headRequired && raw.head !== defaultHead);
  const headOk = head === raw?.head;
  const correct = act === raw?.answer && (!headRequired || headOk);
  const canLock = Boolean(act) && (!mustRewind || touchedHead);

  function moveHead(i: number) {
    if (locked) return;
    setHead(i);
    setTouchedHead(true);
  }

  function lockAct() {
    if (sealed.current || !canLock) return;
    sealed.current = true;
    setLocked(true);
    const earned = act === round.answer && (!headRequired || head === round.head);
    setScore((s) => s + (earned ? POINTS_PER_ROUND : 0));
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
    setTouchedHead(false);
    sealed.current = false;
  }

  if (phase === "intro") {
    return (
      <Intro
        slug="voyage"
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
        slug="voyage"
        score={score}
        max={maxScore}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setAct(null);
          setLocked(false);
          setTouchedHead(false);
          sealed.current = false;
        }}
      />
    );
  }

  if (brief) {
    return (
      <GameShell slug="voyage" round={index} total={total} score={score} maxScore={maxScore}>
        <QuestionBeat context={round.context} question={round.question} onGo={go} />
      </GameShell>
    );
  }

  return (
    <GameShell slug="voyage" round={index} total={total} score={score} maxScore={maxScore} briefContext={round.context} briefQuestion={round.question}>
      <RoundHeader context={round.context} question={round.question} />
      <PlayStage slug="voyage" className="mt-6">
        <VoyageTram
          events={round.events}
          head={head}
          locked={locked}
          onHead={moveHead}
          kicker={playI18n.ui.voyage.band}
          ticket={playI18n.ui.voyage.ticket}
          rewindHint={playI18n.ui.voyage.rewind}
        />
      </PlayStage>
      <div className="scene-opts mt-4 grid grid-cols-2 gap-2">
        {actions.map((id) => {
          const meta = playI18n.ui.voyage.actions[id];
          return (
            <ChoiceTile
              key={id}
              title={meta.label}
              hint={meta.hint}
              selected={act === id}
              locked={locked}
              isAnswer={id === round.answer}
              isWrong={act === id && id !== round.answer}
              disabled={locked}
              onClick={() => setAct(id)}
              onConfirm={lockAct}
            />
          );
        })}
      </div>
      {mustRewind && act === "at" && !headOk && !locked ? (
        <p className={cn("mt-3 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-signal")}>
          {playI18n.ui.lockHead}
        </p>
      ) : null}
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={playI18n.punch(correct)}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          isLast={index + 1 >= total}
        />
      ) : (
        <LockBar
          disabled={!canLock}
          label={playI18n.ui.execute}
          idleLabel={!act ? undefined : playI18n.ui.lockHead}
          onLock={lockAct}
        />
      )}
    </GameShell>
  );
}
