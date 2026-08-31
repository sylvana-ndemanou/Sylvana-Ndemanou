// @ts-nocheck
"use client";

import { useCallback, useMemo, useState } from "react";
import { DragBoard, Draggable, DropSlot, shuffle } from "@s/components/drag-kit";
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
  lesson: string;
};

const SCENARIOS: Scenario[] = [
  {
    tier: "easy",
    id: "batch",
    name: "Batch quotidien",
    steps: ["Extraire", "Charger", "Publier"],
    lesson: "On n’expose pas avant d’avoir chargé. Extraire → poser → publier. L’ordre est le métier.",
  },
  {
    tier: "easy",
    id: "partner",
    name: "Fichier partenaire",
    steps: ["Ingest", "Valider", "Agréger"],
    lesson: "On n’agrège pas un fichier sale. Quarantaine d’abord, totaux ensuite.",
  },
  {
    tier: "easy",
    id: "mart",
    name: "Mart simple",
    steps: ["Brut", "Propre", "Mart"],
    lesson: "Bronze, Silver, Gold — même idée en trois mots. Le dashboard ne lit que le mart.",
  },
  {
    tier: "hard",
    id: "medallion",
    name: "Medallion retail",
    steps: ["Atterrir en Bronze", "Conformer en Silver", "Surrogate keys", "Mart Gold", "Exposer au BI"],
    lesson:
      "On ne pose pas de clé métier instable dans le Gold. D'abord le brut, puis le conforme, puis les clés, puis le contrat dashboard.",
  },
  {
    tier: "hard",
    id: "elt",
    name: "ELT quotidien",
    steps: ["Extraire la source", "Charger le brut", "Transformer", "Tests d'assertion", "Publier le mart"],
    lesson:
      "Charger avant de transformer (ELT) : le brut reste recouvrable. Tester avant de publier : un mart vert, pas un mart « on verra lundi ».",
  },
  {
    tier: "hard",
    id: "cdc",
    name: "CDC commandes",
    steps: ["Capturer les logs", "Dédupliquer par clé", "Fusionner SCD2", "Reconstruire le fait", "Rafraîchir le cache BI"],
    lesson:
      "Le CDC arrive en désordre. Dédupliquer, puis versionner, puis le fait. Rafraîchir le BI en premier, c'est servir la panique.",
  },
  {
    tier: "hard",
    id: "migration",
    name: "Migration de schéma",
    steps: ["Geler le contrat", "Backfill historique", "Double run", "Cutover", "Superviser 48h"],
    lesson:
      "Sans backfill, le YoY est un mensonge. Sans double run, le cutover est un saut. L'ingénierie, c'est de l'ennui bien ordonné.",
  },
  {
    tier: "hard",
    id: "files",
    name: "Fichiers partenaires",
    steps: ["Ingest tel quel", "Valider le schéma", "Rejeter les lignes sales", "Mapper les IDs", "Agrégats métier"],
    lesson:
      "On n'agrège pas un fichier sale. Quarantaine d'abord. Sinon le partenaire t'envoie des nulls, et le CA se met à danser.",
  },
  {
    tier: "brutal",
    id: "late",
    name: "Late-arriving fact",
    steps: ["Ingest événement", "Attendre la dim", "Park orphelin", "Réconcilier", "Publier le fait", "Alerte SLA"],
    lesson: "Un fait trop tôt, sans dimension, pollue le mart. On parque, on réconcilie, on publie. Pas l’inverse.",
  },
  {
    tier: "brutal",
    id: "scd2",
    name: "SCD2 + CDC en conflit",
    steps: ["Ordonner les commits", "Fermer la version", "Ouvrir la suivante", "Pointer le fait", "Rebuild snapshot", "Test d’unicité"],
    lesson:
      "Deux updates le même jour : l’ordre des commits décide de l’histoire. Tester l’unicité après, pas avant.",
  },
  {
    tier: "brutal",
    id: "contract",
    name: "Contract-first API",
    steps: ["Geler le JSON schema", "Stub consommateur", "Backfill", "Shadow traffic", "Cutover", "Retirer le stub"],
    lesson:
      "Le contrat avant les octets. Shadow avant cutover. Retirer le stub en dernier — sinon tu sers deux vérités.",
  },
  {
    tier: "brutal",
    id: "pii",
    name: "PII quarantine",
    steps: ["Ingest chiffré", "Tokenizer", "Vault", "Mart sans PII", "Accès just-in-time", "Audit log"],
    lesson:
      "Le mart ne voit jamais le brut identifiant. Vault, puis contrat. Inverser, c’est une fuite GDPR dans le BI.",
  },
  {
    tier: "brutal",
    id: "hybrid",
    name: "Streaming + batch hybride",
    steps: ["Micro-batch 5 min", "Compaction horaire", "Exactly-once", "Watermark", "Late data replay", "Vue unifiée"],
    lesson:
      "Le streaming sans compaction, c’est des petits fichiers. Le replay des lates après le watermark, sinon le KPI saute.",
  },
];

function scalePipeline(
  scenario: Scenario,
  difficulty: Difficulty,
  roundIndex: number,
  totalRounds: number
): Scenario {
  if (scenario.tier) return scenario;
  const n = stepCount(scenario.steps.length, difficulty, roundIndex, totalRounds);
  if (n >= scenario.steps.length) return scenario;
  return { ...scenario, steps: scenario.steps.slice(0, n) };
}

export function PipelineGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const playI18n = usePlay("pipeline");
  const deck = useMemo(
    () => takeDeck(SCENARIOS, difficulty).map((s, i) => scalePipeline(s, difficulty, i, total)),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [docks, setDocks] = useState<(string | null)[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [held, setHeld] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [running, setRunning] = useState(false);
  const [packetAt, setPacketAt] = useState(-1);
  const [boom, setBoom] = useState(-1);
  const [points, setPoints] = useState(0);

  const { brief, go } = useBriefRound(index, phase === "play");
  const scenario = playI18n.overlay(deck[index]);
  const n = scenario?.steps.length ?? 0;
  const used = new Set(docks.filter(Boolean) as string[]);
  const idle = pool.filter((s) => !used.has(s));
  const complete = n > 0 && docks.length === n && docks.every(Boolean);
  const busy = locked || running;

  const startRound = useCallback(
    (i: number) => {
      const s = playI18n.overlay(deck[i]);
      setPool(shuffle(s.steps));
      setDocks(Array(s.steps.length).fill(null));
      setHeld(null);
      setLocked(false);
      setRunning(false);
      setPacketAt(-1);
      setBoom(-1);
      setPoints(0);
    },
    [deck, playI18n.locale]
  );

  function pickJob(job: string) {
    if (busy) return;
    play("lift");
    setHeld((h) => (h === job ? null : job));
  }

  function placeJob(job: string, di: number) {
    if (busy) return;
    const occupant = docks[di];
    setDocks((prev) => {
      const next = [...prev];
      const from = next.indexOf(job);
      if (from >= 0) next[from] = occupant;
      next[di] = job;
      return next;
    });
    play(occupant && occupant !== job ? "swap" : "dock");
    setHeld(null);
  }

  function tapDock(di: number) {
    if (busy) return;
    if (held) {
      placeJob(held, di);
      return;
    }
    const occupant = docks[di];
    if (occupant) {
      play("lift");
      setDocks((prev) => {
        const next = [...prev];
        next[di] = null;
        return next;
      });
      setHeld(occupant);
    }
  }

  function run() {
    if (!complete || running || locked) return;
    setRunning(true);
    setHeld(null);
    setBoom(-1);
    let step = 0;
    const snapshot = [...docks];
    const tick = () => {
      setPacketAt(step);
      play("grain");
      if (snapshot[step] !== scenario.steps[step]) {
        setBoom(step);
        play("miss");
        const placed = snapshot.filter((s, i) => s === scenario.steps[i]).length;
        const gained = awardPartial(placed, n, difficulty);
        window.setTimeout(() => {
          setRunning(false);
          setLocked(true);
          setPoints(gained);
          setScore((s) => s + gained);
        }, 650);
        return;
      }
      step += 1;
      if (step >= n) {
        play("ok");
        window.setTimeout(() => {
          setRunning(false);
          setLocked(true);
          setPoints(POINTS_PER_ROUND);
          setScore((s) => s + POINTS_PER_ROUND);
        }, 280);
        return;
      }
      window.setTimeout(tick, 260);
    };
    tick();
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
        slug="pipeline"
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
        slug="pipeline"
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

  const perfect = points === POINTS_PER_ROUND;

  if (brief) {
    return (
      <GameShell slug="pipeline" round={index} total={total} score={score} maxScore={maxScore}>
        <QuestionBeat context={scenario.name} question={playI18n.ui.pipelineQ} onGo={go} />
      </GameShell>
    );
  }

  return (
    <GameShell slug="pipeline" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader
        context={scenario.name}
        question={held ? playI18n.ui.pipelineHeld(held) : playI18n.ui.pipelineQ}
      />
      <PlayStage slug="pipeline" className="mt-6">
      <DragBoard
        disabled={busy}
        onDrop={(piece, zone) => {
          if (!zone.startsWith("dock-")) return;
          const di = Number(zone.slice(5));
          if (Number.isFinite(di)) placeJob(piece, di);
        }}
        onTap={(piece) => {
          const at = docks.indexOf(piece);
          if (at >= 0) tapDock(at);
          else pickJob(piece);
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{playI18n.ui.conveyor}</p>
        <div className="conveyor-rail mt-2 flex items-stretch gap-1 overflow-x-auto pb-1">
          {docks.map((id, di) => (
            <div key={di} className="flex min-w-[5.2rem] flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[11px] text-muted-foreground">
                {di + 1}
                {di < n - 1 ? " →" : ""}
              </span>
              <DropSlot
                id={`dock-${di}`}
                className={cn(
                  "flex h-[4.6rem] w-full items-center justify-center rounded-2xl border-2 border-dashed px-1.5 text-center text-[11px] leading-tight",
                  id ? "border-solid border-border bg-card" : "border-border/70 bg-muted/30",
                  held && !id && "border-primary bg-primary/10",
                  boom === di && "border-anomaly bg-anomaly/20 bar-miss",
                  packetAt === di && boom !== di && "border-primary bg-primary/15"
                )}
              >
                {id ? (
                  <Draggable id={id} disabled={busy} className="w-full">
                    <span key={`${id}-${di}`} className="magnet-snap block font-mono">
                      {id}
                    </span>
                  </Draggable>
                ) : (
                  <button type="button" disabled={busy} onClick={() => tapDock(di)} className="h-full w-full font-mono text-[10px] text-muted-foreground">
                    {held ? playI18n.ui.dropHere : playI18n.ui.dock}
                  </button>
                )}
              </DropSlot>
              {packetAt === di && boom !== di ? (
                <span className="packet-run size-2.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
              ) : boom === di ? (
                <span className="text-sm">💥</span>
              ) : (
                <span className="size-2.5" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{playI18n.ui.jobPile}</p>
        <div className="mt-2 flex min-h-[4.4rem] flex-wrap gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-3">
          {idle.map((step) => (
            <Draggable key={step} id={step} disabled={busy}>
              <div
                className={cn(
                  "rounded-xl border px-3 py-2 text-left text-[12px] leading-tight transition",
                  held === step
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {step}
              </div>
            </Draggable>
          ))}
          {idle.length === 0 ? (
            <span className="font-mono text-xs text-muted-foreground">{playI18n.ui.jobEmpty}</span>
          ) : null}
        </div>
      </DragBoard>
      </PlayStage>
      {locked ? (
        <Verdict
          tone={roundTone(points)}
          title={
            perfect
              ? playI18n.punch(true)
              : boom >= 0
                ? playI18n.ui.boomDock(boom + 1)
                : playI18n.ui.punchMid.almost
          }
          lesson={scenario.lesson}
          onNext={next}
          isLast={index + 1 >= total}
        />
      ) : (
        <LockBar
          label={running ? playI18n.ui.packetRunning : playI18n.ui.runPacket}
          disabled={!complete || running}
          onLock={run}
        />
      )}
    </GameShell>
  );
}
