// @ts-nocheck
"use client";

import { useCallback, useMemo, useState } from "react";
import { DragBoard, Draggable, DropSlot, shuffle } from "@s/components/drag-kit";
import { FunnelShape } from "@s/components/mini-charts";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, PlayStage, QuestionBeat, Result, RoundHeader, Verdict, useBriefRound } from "@s/components/game-shell";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { usePlay } from "@s/lib/play-text";
import { stepCount, takeDeck, awardPartial } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { roundTone } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Scenario = {
  id: string;
  tier: Difficulty;
  name: string;
  steps: string[];
  rates: number[];
  lesson: string;
};

const SCENARIOS: Scenario[] = [
  {
    tier: "easy",
    id: "boutique",
    name: "Boutique simple",
    steps: ["Visite", "Panier", "Achat"],
    rates: [40, 55],
    lesson: "Trois étages. Le leak est entre visite et panier — pas « à la caisse » par magie.",
  },
  {
    tier: "easy",
    id: "newsletter",
    name: "Newsletter",
    steps: ["Envoi", "Ouverture", "Clic"],
    rates: [28, 12],
    lesson: "Ouvrir n’est pas cliquer. Le vrai goulot est souvent le clic, pas l’objet.",
  },
  {
    tier: "easy",
    id: "app",
    name: "App onboarding",
    steps: ["Install", "Compte", "Premier usage"],
    rates: [62, 48],
    lesson: "L’install raconte le store. Le premier usage raconte le produit.",
  },
  {
    tier: "hard",
    id: "ecom",
    name: "E-commerce",
    steps: ["Visite", "Fiche produit", "Panier", "Paiement", "Achat"],
    rates: [38, 44, 31, 18],
    lesson:
      "La plus grosse fuite n'est pas toujours la dernière. Ici le paiement tient — c'est le passage fiche → panier qui saigne.",
  },
  {
    tier: "hard",
    id: "saas",
    name: "SaaS B2B",
    steps: ["Visite", "Essai", "Activation", "Payant", "Rétention 90j"],
    rates: [12, 41, 28, 22],
    lesson:
      "Un essai sans activation, c'est de la vanité. Le vrai goulot est souvent le « aha moment », pas la page de prix.",
  },
  {
    tier: "hard",
    id: "lead",
    name: "Lead gen",
    steps: ["Impression", "Clic", "Formulaire", "MQL", "SQL"],
    rates: [2.4, 18, 35, 40],
    lesson:
      "Multiplier des taux, ça descend vite. Un CTR fort avec un MQL pourri, c'est du média acheté pour rien.",
  },
  {
    tier: "hard",
    id: "mobile",
    name: "App mobile",
    steps: ["Install", "Onboarding", "J+1", "J+7", "Achat in-app"],
    rates: [62, 48, 33, 9],
    lesson:
      "La rétention J+7 raconte le produit. L'install raconte le store. On n'optimise pas les deux avec le même levier.",
  },
  {
    tier: "hard",
    id: "retail",
    name: "Retail omni",
    steps: ["Trafic magasin", "Essayage", "Passage caisse", "Ticket", "Retour 14j"],
    rates: [28, 55, 92, 8],
    lesson:
      "Un « retour » bas n'est pas un succès si personne n'arrive en caisse. On lit le funnel dans le sens du flux.",
  },
  {
    tier: "brutal",
    id: "plg",
    name: "PLG + sales-assist",
    steps: ["Visite", "Signup", "Activation", "PQL", "Demo", "Won"],
    rates: [18, 44, 22, 35, 28],
    lesson:
      "PQL n’est pas MQL. Inverser demo et activation, c’est vendre avant le « aha ». Le funnel PLG se lit produit d’abord.",
  },
  {
    tier: "brutal",
    id: "market",
    name: "Marketplace deux faces",
    steps: ["Visite acheteur", "Recherche", "Fiche", "Offre", "Paiement", "Livraison", "Avis"],
    rates: [54, 31, 48, 22, 81, 14],
    lesson:
      "Deux faces, un funnel. L’offre (vendeur) n’est pas la fiche (acheteur). Mélanger les deux, le leak devient illisible.",
  },
  {
    tier: "brutal",
    id: "abm",
    name: "ABM enterprise",
    steps: ["Compte cible", "Engagement", "MQL", "SAL", "SQL", "Proposal", "Close"],
    rates: [8, 40, 55, 48, 32, 22],
    lesson:
      "MQL ≠ SAL ≠ SQL. Trois sigles, trois propriétaires. Les empiler dans le désordre, c’est le reporting qui ment.",
  },
  {
    tier: "brutal",
    id: "viral",
    name: "Growth loop viral",
    steps: ["Invite", "Signup filleul", "Activation", "Invite suivante"],
    rates: [22, 51, 18],
    lesson:
      "Une boucle n’est pas un tunnel linéaire. Ici on te force à l’ordre causal : sans activation, l’invite suivante est du spam.",
  },
  {
    tier: "brutal",
    id: "support",
    name: "Support → expansion",
    steps: ["Ticket", "Résolu", "CSAT", "Upsell", "Renew"],
    rates: [71, 64, 9, 44],
    lesson:
      "L’upsell avant le CSAT, c’est vendre sur une plaie ouverte. Le funnel SAV n’est pas un funnel d’acquisition.",
  },
];

function scaleScenario(
  scenario: Scenario,
  difficulty: Difficulty,
  roundIndex: number,
  totalRounds: number
): Scenario {
  if (scenario.tier) return scenario;
  const n = stepCount(scenario.steps.length, difficulty, roundIndex, totalRounds);
  if (n >= scenario.steps.length) return scenario;
  return { ...scenario, steps: scenario.steps.slice(0, n), rates: scenario.rates.slice(0, n - 1) };
}

export function EntonnoirGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const playI18n = usePlay("entonnoir");
  const deck = useMemo(
    () => takeDeck(SCENARIOS, difficulty).map((s, i) => scaleScenario(s, difficulty, i, total)),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stack, setStack] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [pour, setPour] = useState(false);
  const [points, setPoints] = useState(0);

  const { brief, go } = useBriefRound(index, phase === "play");
  const scenario = playI18n.overlay(deck[index]);
  const n = scenario?.steps.length ?? 0;
  const idle = pool.filter((s) => !stack.includes(s));
  const complete = n > 0 && stack.length === n;

  const startRound = useCallback(
    (i: number) => {
      const s = playI18n.overlay(deck[i]);
      setPool(shuffle(s.steps));
      setStack([]);
      setLocked(false);
      setPour(false);
      setPoints(0);
    },
    [deck, playI18n.locale]
  );

  function pushStep(step: string) {
    if (locked || stack.length >= n || stack.includes(step)) return;
    play("drop");
    setStack((prev) => [...prev, step]);
  }

  function popShelf(i: number) {
    if (locked) return;
    play("lift");
    setStack((prev) => prev.filter((_, idx) => idx !== i));
  }

  function lockIn() {
    if (!complete || locked) return;
    const placed = stack.filter((s, i) => s === scenario.steps[i]).length;
    const gained = awardPartial(placed, n, difficulty);
    play(gained === POINTS_PER_ROUND ? "ok" : "mid");
    setPour(true);
    setLocked(true);
    setPoints(gained);
    setScore((s) => s + gained);
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    const nI = index + 1;
    setIndex(nI);
    startRound(nI);
  }

  if (phase === "intro") {
    return (
      <Intro
        slug="entonnoir"
        onStart={() => {
          startRound(0);
          setPhase("play");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        slug="entonnoir"
        score={score}
        max={maxScore}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
        }}
      />
    );
  }

  const leakAt =
    scenario.rates.length > 0
      ? scenario.rates.indexOf(Math.min(...scenario.rates)) + 1
      : -1;

  if (brief) {
    return (
      <GameShell slug="entonnoir" round={index} total={total} score={score} maxScore={maxScore}>
        <QuestionBeat context={scenario.name} question={playI18n.ui.funnelQ} onGo={go} />
      </GameShell>
    );
  }

  return (
    <GameShell slug="entonnoir" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={scenario.name} question={playI18n.ui.funnelQ} />
      <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {playI18n.ui.funnelFloors(n)}
      </p>
      <PlayStage slug="entonnoir">
      {locked ? (
        <div className="relative mt-8">
          <FunnelShape steps={scenario.steps} rates={scenario.rates} />
          {pour && leakAt > 0
            ? Array.from({ length: 7 }).map((_, k) => (
                <span
                  key={k}
                  className="leak-fall pointer-events-none absolute size-2 rounded-full bg-anomaly"
                  style={{
                    left: `${18 + k * 10}%`,
                    top: `${12 + leakAt * (70 / n)}%`,
                    animationDelay: `${k * 80}ms`,
                  }}
                />
              ))
            : null}
        </div>
      ) : (
        <DragBoard
          disabled={locked}
          className="mt-6"
          onDrop={(piece, zone) => {
            if (zone === "funnel" || zone.startsWith("shelf-")) pushStep(piece);
          }}
          onTap={(piece) => {
            const at = stack.indexOf(piece);
            if (at >= 0) popShelf(at);
            else pushStep(piece);
          }}
        >
          <DropSlot id="funnel" className="mx-auto flex max-w-md flex-col items-center gap-2 border-0 bg-transparent p-0">
            {Array.from({ length: n }).map((_, si) => {
              const width = 94 - si * (42 / Math.max(n - 1, 1));
              const id = stack[si];
              return (
                <DropSlot
                  key={si}
                  id={`shelf-${si}`}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-2xl border-2 border-dashed px-3 text-sm",
                    id ? "border-solid border-border bg-card" : "border-border/70 bg-muted/30",
                    si === stack.length && idle.length > 0 && "border-primary/50"
                  )}
                  style={{ width: `${width}%` }}
                >
                  {id ? (
                    <Draggable id={id} disabled={locked} className="w-full text-center">
                      <span className="magnet-snap">{id}</span>
                    </Draggable>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {si === stack.length ? playI18n.ui.dropHere : playI18n.ui.shelfN(si + 1)}
                    </span>
                  )}
                </DropSlot>
              );
            })}
          </DropSlot>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {playI18n.ui.looseSteps}
          </p>
          <div className="mt-2 flex min-h-[4.2rem] flex-wrap gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-3">
            {idle.map((step) => (
              <Draggable key={step} id={step} disabled={locked || stack.length >= n}>
                <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm transition hover:border-primary/50">
                  {step}
                </div>
              </Draggable>
            ))}
            {idle.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground">{playI18n.ui.funnelFull}</span>
            ) : null}
          </div>
        </DragBoard>
      )}
      </PlayStage>
      {locked ? (
        <Verdict
          tone={roundTone(points)}
          title={
            points === POINTS_PER_ROUND
              ? playI18n.punch(true)
              : playI18n.ui.partialN(
                  stack.filter((s, i) => s === scenario.steps[i]).length,
                  n
                )
          }
          lesson={scenario.lesson}
          onNext={next}
          isLast={index + 1 >= total}
        />
      ) : (
        <LockBar label={playI18n.ui.pour} disabled={!complete} onLock={lockIn} />
      )}
    </GameShell>
  );
}
