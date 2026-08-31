// @ts-nocheck
"use client";

import { useMemo, useRef, useState } from "react";
import { LiveSketch, MiniChartGlyph, RawSeries, type ChartKind } from "@s/components/mini-charts";
import { DragBoard, Draggable, DropSlot } from "@s/components/drag-kit";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, PlayStage, QuestionBeat, Result, RoundHeader, Verdict, useBriefRound } from "@s/components/game-shell";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { usePlay } from "@s/lib/play-text";
import { optionCapAt, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { cn } from "@s/lib/utils";

type Round = {
  id: string;
  tier: Difficulty;
  question: string;
  context: string;
  tools: ChartKind[];
  answer: ChartKind;
  values: number[];
  labels?: string[];
  stacks?: number[][];
  points?: { x: number; y: number }[];
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    id: "ca-months",
    question: "Le CA monte-t-il, mois après mois ?",
    context: "Un film, pas une photo. L’outil doit raconter le temps.",
    tools: ["line", "pie"],
    answer: "line",
    values: [20, 22, 21, 26, 28, 31],
    labels: ["J", "F", "M", "A", "M", "J"],
    ok: "La courbe est faite pour ça. Un camembert sur six mois, c’est six parts sans histoire.",
    miss: "Pour une évolution, on veut une courbe. Le camembert compare des parts, pas un trajet.",
  },
  {
    tier: "easy",
    id: "region",
    question: "Quelle région pèse le plus, ce trimestre ?",
    context: "Quatre barres, un classement. Pas de temps.",
    tools: ["bar", "line"],
    answer: "bar",
    values: [48, 22, 18, 12],
    labels: ["IdF", "Aura", "Paca", "Ouest"],
    ok: "Barres : le plus gros se lit en une seconde. Quatre courbes, personne ne compare.",
    miss: "Un classement à un instant T, c’est des barres. Les courbes racontent le temps.",
  },
  {
    tier: "easy",
    id: "mix-3",
    question: "Comment se répartit le CA entre 3 produits — cette année ?",
    context: "Peu de parts, un instant T. Le camembert a le droit d’exister.",
    tools: ["pie", "line"],
    answer: "pie",
    values: [52, 30, 18],
    labels: ["Thé", "Café", "Cacao"],
    ok: "Trois parts, une photo : le camembert est lisible. Au-delà de cinq, on arrête.",
    miss: "Ici le camembert est permis. Les courbes n’ont rien à raconter sur une photo.",
  },
  {
    tier: "hard",
    id: "ca-12",
    question: "Comment le CA a-t-il évolué sur 12 mois ?",
    context: "Tourne les outils. Tu vas voir lequel raconte la pente — et lequel la cache.",
    tools: ["line", "pie", "bar", "scatter"],
    answer: "line",
    values: [42, 44, 41, 48, 51, 49, 55, 58, 54, 61, 66, 70],
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    ok: "La courbe montre le temps. Un camembert sur 12 mois, c'est un crime visuel : plus de parts, moins d'histoire.",
    miss: "Pour une évolution, on veut une courbe (ou des barres ordonnées dans le temps). Le camembert compare des parts, pas un trajet.",
  },
  {
    tier: "hard",
    id: "region-q",
    question: "Quelle région pèse le plus dans le CA ce trimestre ?",
    context: "Quatre régions. Une photo, pas un film. Change d’outil.",
    tools: ["line", "bar", "scatter", "pie"],
    answer: "bar",
    values: [32, 54, 21, 18],
    labels: ["IdF", "Aura", "Paca", "Ouest"],
    ok: "Barres : le classement se lit en une seconde. Quatre courbes, personne ne compare les hauteurs.",
    miss: "Un classement à un instant T, c'est des barres. Les courbes racontent le temps, pas le poids relatif.",
  },
  {
    tier: "hard",
    id: "cac-mix",
    question: "De quoi est composé le coût d'acquisition, mois après mois ?",
    context: "Mix ads / affiliation / organique. Fais tourner. Le mix doit rester visible.",
    tools: ["pie", "stack", "scatter", "line"],
    answer: "stack",
    values: [40, 42, 38, 45, 48, 44],
    stacks: [
      [18, 20, 16, 22, 24, 19],
      [12, 11, 13, 12, 14, 13],
      [10, 11, 9, 11, 10, 12],
    ],
    ok: "Empilé : on voit le total et le mix. Douze camemberts, c'est un PowerPoint, pas une analyse.",
    miss: "La composition dans le temps = empilement. Un camembert fige un mois. Une courbe unique cache le mix.",
  },
  {
    tier: "hard",
    id: "basket-nps",
    question: "Le panier moyen monte-t-il avec la satisfaction ?",
    context: "Chaque point est un client. Cherche un nuage, pas un total.",
    tools: ["bar", "pie", "scatter", "area"],
    answer: "scatter",
    values: [20, 28, 35, 42, 55],
    points: [
      { x: 12, y: 22 },
      { x: 18, y: 24 },
      { x: 21, y: 31 },
      { x: 28, y: 29 },
      { x: 33, y: 40 },
      { x: 36, y: 38 },
      { x: 44, y: 48 },
      { x: 51, y: 44 },
      { x: 58, y: 61 },
      { x: 62, y: 52 },
    ],
    ok: "Le nuage est le seul honnête ici. Corrélation n'est pas causalité — mais au moins on voit s'il y a un nuage, ou une soupe.",
    miss: "Deux variables continues, c'est un nuage de points. Les barres agrègent trop tôt et inventent une relation.",
  },
  {
    tier: "hard",
    id: "cash",
    question: "Le stock de trésorerie, mois après mois — on veut le volume sous la courbe.",
    context: "Pas juste la pente : l’aire compte. C’est une réserve, pas un ranking.",
    tools: ["area", "bar", "pie", "scatter"],
    answer: "area",
    values: [18, 22, 19, 28, 34, 31, 40],
    labels: ["J", "F", "M", "A", "M", "J", "J"],
    ok: "Les aires insistent sur le cumul visuel. Une barre compare des mois ; l’aire raconte la réserve.",
    miss: "Une barre classe. Une aire montre ce qui s’accumule. Ici on voulait le volume sous la courbe.",
  },
  {
    tier: "brutal",
    id: "cac-ltv",
    question: "CAC vs LTV, par cohorte. Y a-t-il seulement un lien ?",
    context: "Deux métriques continues. Pas de temps, pas de parts. Le piège, c’est la courbe.",
    tools: ["scatter", "line", "bar", "area"],
    answer: "scatter",
    values: [12, 18, 22, 31],
    points: [
      { x: 8, y: 40 },
      { x: 11, y: 38 },
      { x: 14, y: 52 },
      { x: 19, y: 47 },
      { x: 22, y: 61 },
      { x: 27, y: 55 },
      { x: 31, y: 72 },
      { x: 36, y: 64 },
    ],
    ok: "Un nuage. Relier les points dans le temps inventerait une histoire que les cohortes n’ont pas.",
    miss: "Une courbe ordonne un temps qui n’existe pas ici. Deux axes, des individus : scatter.",
  },
  {
    tier: "brutal",
    id: "mix-evo",
    question: "Mix paid / CRM / organique — et l’évolution du total, ensemble.",
    context: "Le total bouge, le mix aussi. Un seul dessin doit porter les deux.",
    tools: ["stack", "area", "line", "pie"],
    answer: "stack",
    values: [30, 36, 34, 42, 48, 51],
    stacks: [
      [10, 14, 11, 16, 20, 19],
      [12, 12, 13, 14, 15, 18],
      [8, 10, 10, 12, 13, 14],
    ],
    ok: "Empilé : mix + total. Une aire unique noie les canaux. Un camembert tue le temps.",
    miss: "L’aire unique cache qui pousse. Le camembert fige un mois. Ici, l’empilement est le contrat.",
  },
  {
    tier: "brutal",
    id: "sku-11",
    question: "Parts de 11 catégories SKU, ce mois-ci seulement.",
    context: "Trop de parts. Le camembert va mentir — même si c’est « une photo ».",
    tools: ["bar", "pie", "line", "scatter"],
    answer: "bar",
    values: [18, 16, 14, 11, 9, 8, 7, 6, 5, 4, 2],
    labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
    ok: "Onze parts : barres triées. Le camembert devient une roue illisible. La règle des 5 parts tient encore.",
    miss: "« Instant T » n’autorise pas le camembert à l’infini. Au-delà de cinq parts, on passe aux barres.",
  },
  {
    tier: "brutal",
    id: "ice",
    question: "Température vs ventes glaces, 40 jours. Relation, ou soupe ?",
    context: "Chaque jour est un point. Relier, c’est raconter un feuilleton.",
    tools: ["scatter", "line", "area", "bar"],
    answer: "scatter",
    values: [1, 2, 3],
    points: Array.from({ length: 18 }, (_, i) => ({
      x: 12 + i * 1.4 + ((i * 3) % 5) - 2,
      y: 20 + i * 1.1 + ((i * 5) % 7) - 3,
    })),
    ok: "Nuage. Une courbe imposerait un ordre (le calendrier) qui n’est pas la question.",
    miss: "La question n’est pas « comment ça a bougé dans le temps », c’est « est-ce lié ». Scatter.",
  },
  {
    tier: "brutal",
    id: "pipeline",
    question: "Pipeline commercial : combien dans chaque étape, aujourd’hui.",
    context: "Un classement d’étapes, pas un funnel animé. L’ordre métier est déjà dans l’axe.",
    tools: ["bar", "pie", "stack", "line"],
    answer: "bar",
    values: [120, 64, 28, 11],
    labels: ["Lead", "MQL", "SQL", "Won"],
    ok: "Barres horizontales (ou verticales) : le stock par étape. Un camembert cache les volumes absolus.",
    miss: "Un camembert donne des parts. Un pipeline se lit en têtes, pas en pourcentages.",
  },
];

const COUSINS: Record<ChartKind, ChartKind[]> = {
  line: ["line", "area", "bar", "scatter"],
  bar: ["bar", "stack", "line", "pie"],
  pie: ["pie", "bar", "stack", "area"],
  area: ["area", "line", "stack", "bar"],
  scatter: ["scatter", "line", "bar", "area"],
  stack: ["stack", "area", "bar", "pie"],
};

function toolsFor(round: Round, difficulty: Difficulty, roundIndex: number, totalRounds: number): ChartKind[] {
  const cap = optionCapAt(difficulty, 4, roundIndex, totalRounds);
  if (difficulty === "easy") {
    const wrong = round.tools.find((kind) => kind !== round.answer) ?? COUSINS[round.answer][1];
    return [round.answer, wrong];
  }
  if (difficulty === "hard") {
    return Array.from(new Set([round.answer, ...round.tools])).slice(0, cap);
  }
  return COUSINS[round.answer].slice(0, cap);
}

export function GraphiqueGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const playI18n = usePlay("graphique");
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [tool, setTool] = useState<ChartKind | null>(null);
  const [locked, setLocked] = useState(false);
  const sealed = useRef(false);

  const { brief, go } = useBriefRound(index, phase === "play");
  const round = playI18n.overlay(deck[index]);
  const tools = round ? toolsFor(round, difficulty, index, total) : [];
  const correct = tool === round?.answer;

  function pickTool(kind: ChartKind) {
    if (locked) return;
    if (tool === kind) {
      lockIn();
      return;
    }
    setTool(kind);
  }

  function lockIn() {
    if (sealed.current || !tool) return;
    sealed.current = true;
    setLocked(true);
    setScore((s) => s + (tool === round.answer ? POINTS_PER_ROUND : 0));
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setTool(null);
    setLocked(false);
    sealed.current = false;
  }

  if (phase === "intro") {
    return (
      <Intro
        slug="graphique"
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        slug="graphique"
        score={score}
        max={maxScore}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setTool(null);
          setLocked(false);
          sealed.current = false;
        }}
      />
    );
  }

  if (brief) {
    return (
      <GameShell slug="graphique" round={index} total={total} score={score} maxScore={maxScore}>
        <QuestionBeat context={round.context} question={round.question} onGo={go} />
      </GameShell>
    );
  }

  return (
    <GameShell slug="graphique" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <PlayStage slug="graphique" className="mt-5">
        <DragBoard
          disabled={locked}
          onDrop={(piece, zone) => {
            if (zone === "canvas" && tools.includes(piece as ChartKind)) pickTool(piece as ChartKind);
          }}
          onTap={(piece) => {
            if (tools.includes(piece as ChartKind)) pickTool(piece as ChartKind);
          }}
        >
        <DropSlot id="canvas" className="relative overflow-hidden rounded-2xl border border-dashed border-primary/35 bg-card p-3">
          {tool ? (
            <LiveSketch
              key={`${index}-${tool}`}
              kind={tool}
              values={round.values}
              labels={round.labels}
              stacks={round.stacks}
              points={round.points}
            />
          ) : (
            <RawSeries values={round.values} labels={round.labels} caption={playI18n.ui.rawPick} />
          )}
        </DropSlot>
        <div className={cn("scene-opts mt-4 grid gap-2", tools.length <= 2 ? "grid-cols-2" : "grid-cols-4")}>
          {tools.map((kind) => (
            <Draggable key={kind} id={kind} label={playI18n.ui.charts[kind]} disabled={locked}>
              <button
                type="button"
                disabled={locked}
                onClick={() => pickTool(kind)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition duration-200",
                  tool === kind && "border-primary bg-primary/15 shadow-[0_0_18px_color-mix(in_oklch,var(--primary)_22%,transparent)]",
                  tool !== kind && "border-border bg-card hover:border-primary/40",
                  locked && kind === round.answer && "border-ok bg-ok/15",
                  locked && tool === kind && kind !== round.answer && "border-anomaly bg-anomaly/10"
                )}
              >
                <MiniChartGlyph kind={kind} active={tool === kind} />
                <span className="text-[11px]">{playI18n.ui.charts[kind]}</span>
              </button>
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
        <LockBar disabled={!tool} label={playI18n.ui.readable} onLock={lockIn} />
      )}
    </GameShell>
  );
}
