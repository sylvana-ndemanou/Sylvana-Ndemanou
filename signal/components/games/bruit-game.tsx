// @ts-nocheck
"use client";

import { useMemo, useRef, useState } from "react";
import { Sparkline } from "@s/components/mini-charts";
import { DragBoard, Draggable, DropSlot } from "@s/components/drag-kit";
import { ChoiceTile, LockBar } from "@s/components/interact";
import { GameShell, Intro, PlayStage, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { usePlay } from "@s/lib/play-text";
import { along, optionCapAt, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { cn } from "@s/lib/utils";

type Label = "tendance" | "saison" | "bruit" | "rupture";

type Round = {
  id: string;
  tier: Difficulty;
  title: string;
  values: number[];
  from: number;
  to: number;
  answer: Label;
  ok: string;
  miss: string;
};

const LABELS: { id: Label; name: string; hint: string }[] = [
  { id: "tendance", name: "Tendance", hint: "une pente qui tient" },
  { id: "saison", name: "Saison", hint: "ça revient" },
  { id: "bruit", name: "Bruit", hint: "une dent" },
  { id: "rupture", name: "Rupture", hint: "le palier change" },
];

function series(points: number, fn: (i: number) => number) {
  return Array.from({ length: points }, (_, i) => Math.round(fn(i) * 10) / 10);
}

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    id: "visites",
    title: "Visites, 12 semaines — ça grimpe clairement",
    values: series(12, (i) => 40 + i * 4),
    from: 8,
    to: 11,
    answer: "tendance",
    ok: "La pente est là depuis le début. Un bon mois n’est pas une tendance. Une pente qui tient, si.",
    miss: "Ce n’est pas un pic isolé : ça monte depuis la semaine 1.",
  },
  {
    tier: "easy",
    id: "noel",
    title: "CA mensuel — Noël revient",
    values: series(24, (i) => 80 + (i % 12 === 11 ? 50 : 0)),
    from: 11,
    to: 12,
    answer: "saison",
    ok: "Décembre revient chaque année. On compare à N-1, pas au mois d’avant.",
    miss: "Un pic qui se répète au même moment, ce n’est pas une rupture. C’est un calendrier.",
  },
  {
    tier: "easy",
    id: "dent",
    title: "Taux d’ouverture — une dent, puis plus rien",
    values: series(14, (i) => 22 + (i === 7 ? 14 : 0)),
    from: 6,
    to: 8,
    answer: "bruit",
    ok: "Un pic, puis retour. Sans cause qui tient, c’est du bruit.",
    miss: "Une seule dent, ça n’est pas une tendance. Attends de voir si ça tient.",
  },
  {
    tier: "hard",
    id: "org",
    title: "Visites organiques, 24 semaines",
    values: series(24, (i) => 80 + i * 2.4 + Math.sin(i / 2) * 2),
    from: 16,
    to: 23,
    answer: "tendance",
    ok: "La pente était déjà là avant la zone. Un bon mois n'est pas une tendance. Une pente qui tient, si.",
    miss: "Ce n'est pas un pic isolé : la série grimpe depuis le début. Tendance = direction qui survit à une semaine bruyante.",
  },
  {
    tier: "hard",
    id: "ca3y",
    title: "CA mensuel, 3 ans",
    values: series(36, (i) => 100 + (i % 12 === 10 ? 48 : i % 12 === 11 ? 62 : i % 12 === 0 ? 20 : 8) + i * 0.4),
    from: 22,
    to: 24,
    answer: "saison",
    ok: "Novembre–décembre reviennent chaque année. On compare à N-1, pas au mois d'avant.",
    miss: "Un pic qui se répète au même moment, ce n'est pas une rupture. C'est un calendrier. YoY, pas MoM.",
  },
  {
    tier: "hard",
    id: "open",
    title: "Taux d'ouverture e-mail, 20 envois",
    values: series(20, (i) => 22 + (i === 13 ? 9 : (i % 3) - 1.2)),
    from: 12,
    to: 14,
    answer: "bruit",
    ok: "Un pic, puis retour à la moyenne. Sans cause, c'est du bruit. On ne refait pas la stratégie pour une bulle.",
    miss: "Une seule dent qui sort, ça n'est pas une tendance. Attends de voir si ça tient.",
  },
  {
    tier: "hard",
    id: "delay",
    title: "Délai de livraison, 18 semaines",
    values: series(18, (i) => (i < 9 ? 2.4 + (i % 2) * 0.15 : 4.6 + (i % 2) * 0.12)),
    from: 8,
    to: 17,
    answer: "rupture",
    ok: "Le palier a changé et il reste. Nouveau 3PL, grève, ou définition du KPI.",
    miss: "Ce n'est plus du bruit : la série ne revient pas. Quand la moyenne change de monde, on parle rupture.",
  },
  {
    tier: "hard",
    id: "nps",
    title: "NPS, 16 vagues",
    values: series(16, (i) => 32 + i * 0.15 + (i === 7 ? -14 : 0) + Math.sin(i) * 1.2),
    from: 6,
    to: 8,
    answer: "bruit",
    ok: "Un NPS qui plonge une vague puis revient, c'est souvent un échantillon trop petit. Pas une culture qui casse.",
    miss: "Regarde après le trou : ça reprend. Une rupture, ça s'installe. Ici, c'est une dent.",
  },
  {
    tier: "brutal",
    id: "paid",
    title: "Sessions paid, 28 jours — pente faible sous le bruit",
    values: series(28, (i) => 100 + i * 0.35 + Math.sin(i) * 4.2),
    from: 18,
    to: 27,
    answer: "tendance",
    ok: "Sous le bruit quotidien, ça grimpe encore. Brutal : la pente est réelle, minuscule.",
    miss: "Les dents sont plus visibles que la pente. Zoom arrière : la direction tient.",
  },
  {
    tier: "brutal",
    id: "summer",
    title: "Tickets, 36 mois — été calme, pas une crise",
    values: series(36, (i) => 40 + (i % 12 >= 6 && i % 12 <= 7 ? -11 : 0) + i * 0.12),
    from: 18,
    to: 20,
    answer: "saison",
    ok: "Juillet–août reviennent. Un creux d’été n’est pas une rupture de process.",
    miss: "Ça se répète chaque année à la même place. Saison, pas incident.",
  },
  {
    tier: "brutal",
    id: "jeudi",
    title: "Panier moyen, 22 semaines — un jeudi pourri",
    values: series(22, (i) => 54 + Math.sin(i / 3) * 1.4 + (i === 14 ? -3.2 : 0)),
    from: 13,
    to: 15,
    answer: "bruit",
    ok: "Moins 3 € une semaine, puis la moyenne. Pas un nouveau mix. Du bruit.",
    miss: "L’écart est trop petit et trop court pour une rupture. Une dent, on passe.",
  },
  {
    tier: "brutal",
    id: "checkout",
    title: "Conversion, 20 semaines — nouveau checkout, palier +0,4 pt",
    values: series(20, (i) => (i < 11 ? 2.4 + (i % 2) * 0.04 : 2.82 + (i % 2) * 0.04)),
    from: 10,
    to: 19,
    answer: "rupture",
    ok: "Le palier a bougé de presque rien, et il reste. C’est une rupture, pas une dent.",
    miss: "Brutal : la marche est minuscule. Si ça ne revient pas, ce n’est plus du bruit.",
  },
  {
    tier: "brutal",
    id: "dau",
    title: "DAU, 30 jours — weekend vs semaine, pas une tendance",
    values: series(30, (i) => 80 + (i % 7 === 5 || i % 7 === 6 ? -18 : 0) + i * 0.08),
    from: 19,
    to: 21,
    answer: "saison",
    ok: "Le weekend revient toutes les 7 dents. Ce n’est pas une chute d’usage. C’est un calendrier.",
    miss: "Un rythme hebdo, c’est de la saisonnalité courte. Pas une tendance, pas une rupture.",
  },
];

function scaleBruit(
  round: Round,
  difficulty: Difficulty,
  roundIndex: number,
  totalRounds: number
): Round {
  const noise = along(difficulty, roundIndex, totalRounds, [0, 0.12], [0.28, 0.48], [0.82, 1.18]);
  const values = round.values.map((v, i) =>
    Math.round((v + (((i * 17) % 7) - 3) * noise) * 10) / 10
  );
  const spanScale = along(difficulty, roundIndex, totalRounds, [1, 0.92], [0.78, 0.66], [0.55, 0.42]);
  const from = round.from;
  const span = Math.max(2, Math.round((round.to - round.from) * spanScale));
  return { ...round, values, to: Math.min(values.length - 1, from + span) };
}

function stampsFor(answer: Label, difficulty: Difficulty, roundIndex: number, totalRounds: number) {
  const cap = optionCapAt(difficulty, LABELS.length, roundIndex, totalRounds);
  const primary = LABELS.find((lab) => lab.id === answer) ?? LABELS[0];
  const rest = LABELS.filter((lab) => lab.id !== answer);
  return [primary, ...rest].slice(0, cap);
}

export function BruitGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const playI18n = usePlay("bruit");
  const deck = useMemo(
    () => takeDeck(ROUNDS_DATA, difficulty).map((r, i) => scaleBruit(r, difficulty, i, total)),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stamp, setStamp] = useState<Label | null>(null);
  const [locked, setLocked] = useState(false);
  const sealed = useRef(false);

  const round = playI18n.overlay(deck[index]);
  const labels = round ? stampsFor(round.answer, difficulty, index, total) : [];
  const correct = stamp === round?.answer;

  function pickStamp(id: Label) {
    if (locked) return;
    if (stamp === id) {
      lockIn();
      return;
    }
    setStamp(id);
  }

  function lockIn() {
    if (sealed.current || !stamp) return;
    sealed.current = true;
    setLocked(true);
    setScore((s) => s + (stamp === round.answer ? POINTS_PER_ROUND : 0));
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setStamp(null);
    setLocked(false);
    sealed.current = false;
  }

  if (phase === "intro") {
    return (
      <Intro
        slug="bruit"
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        slug="bruit"
        score={score}
        max={maxScore}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setStamp(null);
          setLocked(false);
          sealed.current = false;
        }}
      />
    );
  }

  return (
    <GameShell slug="bruit" round={index} total={total} score={score} maxScore={maxScore} briefContext={round.title} briefQuestion={playI18n.ui.bruitQ}>
      <RoundHeader context={round.title} question={playI18n.ui.bruitQ} />
      <PlayStage slug="bruit" className="mt-6">
      <DragBoard
        disabled={locked}
        onDrop={(piece, zone) => {
          if (zone === "series" && LABELS.some((l) => l.id === piece)) pickStamp(piece as Label);
        }}
        onTap={(piece) => {
          if (LABELS.some((l) => l.id === piece)) pickStamp(piece as Label);
        }}
      >
        <DropSlot id="series" className="relative overflow-hidden rounded-2xl border border-dashed border-primary/35 bg-card p-4">
          <span className="chart-grid pointer-events-none absolute inset-3 opacity-40" />
          <Sparkline
            values={round.values}
            highlightFrom={round.from}
            highlightTo={round.to}
            overlay={stamp}
            showRange={difficulty !== "brutal"}
          />
          {stamp ? (
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
              {playI18n.ui.bruitLayer(playI18n.ui.noise[stamp])}
            </p>
          ) : (
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {playI18n.ui.bruitDrag(round.to - round.from + 1)}
            </p>
          )}
        </DropSlot>
        <div className={cn("scene-opts mt-4 grid gap-2", labels.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
          {labels.map((lab) => (
            <Draggable key={lab.id} id={lab.id} label={playI18n.ui.noise[lab.id]} disabled={locked}>
              <ChoiceTile
                title={playI18n.ui.noise[lab.id]}
                hint={playI18n.ui.noiseHint[lab.id]}
                selected={stamp === lab.id}
                locked={locked}
                isAnswer={lab.id === round.answer}
                isWrong={stamp === lab.id && lab.id !== round.answer}
                disabled={locked}
                onClick={() => pickStamp(lab.id)}
                onConfirm={lockIn}
              />
            </Draggable>
          ))}
        </div>
      </DragBoard>
      </PlayStage>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={playI18n.punch(correct)}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          isLast={index + 1 >= total}
        />
      ) : (
        <LockBar disabled={!stamp} label={playI18n.ui.sealRead} onLock={lockIn} />
      )}
    </GameShell>
  );
}
