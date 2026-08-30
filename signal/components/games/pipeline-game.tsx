// @ts-nocheck
"use client";

import { useCallback, useMemo, useState } from "react";
import { shuffle } from "@s/components/drag-kit";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { stepCount, takeDeck, awardPartial } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { roundTone, scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Scenario = {
  tier: Difficulty;
  name: string;
  steps: string[];
  lesson: string;
};

const SCENARIOS: Scenario[] = [
  {
    tier: "easy",
    name: "Batch quotidien",
    steps: ["Extraire", "Charger", "Publier"],
    lesson: "On n’expose pas avant d’avoir chargé. Extraire → poser → publier. L’ordre est le métier.",
  },
  {
    tier: "easy",
    name: "Fichier partenaire",
    steps: ["Ingest", "Valider", "Agréger"],
    lesson: "On n’agrège pas un fichier sale. Quarantaine d’abord, totaux ensuite.",
  },
  {
    tier: "easy",
    name: "Mart simple",
    steps: ["Brut", "Propre", "Mart"],
    lesson: "Bronze, Silver, Gold — même idée en trois mots. Le dashboard ne lit que le mart.",
  },
  {
    tier: "hard",
    name: "Medallion retail",
    steps: ["Atterrir en Bronze", "Conformer en Silver", "Surrogate keys", "Mart Gold", "Exposer au BI"],
    lesson:
      "On ne pose pas de clé métier instable dans le Gold. D'abord le brut, puis le conforme, puis les clés, puis le contrat dashboard.",
  },
  {
    tier: "hard",
    name: "ELT quotidien",
    steps: ["Extraire la source", "Charger le brut", "Transformer", "Tests d'assertion", "Publier le mart"],
    lesson:
      "Charger avant de transformer (ELT) : le brut reste recouvrable. Tester avant de publier : un mart vert, pas un mart « on verra lundi ».",
  },
  {
    tier: "hard",
    name: "CDC commandes",
    steps: ["Capturer les logs", "Dédupliquer par clé", "Fusionner SCD2", "Reconstruire le fait", "Rafraîchir le cache BI"],
    lesson:
      "Le CDC arrive en désordre. Dédupliquer, puis versionner, puis le fait. Rafraîchir le BI en premier, c'est servir la panique.",
  },
  {
    tier: "hard",
    name: "Migration de schéma",
    steps: ["Geler le contrat", "Backfill historique", "Double run", "Cutover", "Superviser 48h"],
    lesson:
      "Sans backfill, le YoY est un mensonge. Sans double run, le cutover est un saut. L'ingénierie, c'est de l'ennui bien ordonné.",
  },
  {
    tier: "hard",
    name: "Fichiers partenaires",
    steps: ["Ingest tel quel", "Valider le schéma", "Rejeter les lignes sales", "Mapper les IDs", "Agrégats métier"],
    lesson:
      "On n'agrège pas un fichier sale. Quarantaine d'abord. Sinon le partenaire t'envoie des nulls, et le CA se met à danser.",
  },
  {
    tier: "brutal",
    name: "Late-arriving fact",
    steps: ["Ingest événement", "Attendre la dim", "Park orphelin", "Réconcilier", "Publier le fait", "Alerte SLA"],
    lesson: "Un fait trop tôt, sans dimension, pollue le mart. On parque, on réconcilie, on publie. Pas l’inverse.",
  },
  {
    tier: "brutal",
    name: "SCD2 + CDC en conflit",
    steps: ["Ordonner les commits", "Fermer la version", "Ouvrir la suivante", "Pointer le fait", "Rebuild snapshot", "Test d’unicité"],
    lesson:
      "Deux updates le même jour : l’ordre des commits décide de l’histoire. Tester l’unicité après, pas avant.",
  },
  {
    tier: "brutal",
    name: "Contract-first API",
    steps: ["Geler le JSON schema", "Stub consommateur", "Backfill", "Shadow traffic", "Cutover", "Retirer le stub"],
    lesson:
      "Le contrat avant les octets. Shadow avant cutover. Retirer le stub en dernier — sinon tu sers deux vérités.",
  },
  {
    tier: "brutal",
    name: "PII quarantine",
    steps: ["Ingest chiffré", "Tokenizer", "Vault", "Mart sans PII", "Accès just-in-time", "Audit log"],
    lesson:
      "Le mart ne voit jamais le brut identifiant. Vault, puis contrat. Inverser, c’est une fuite GDPR dans le BI.",
  },
  {
    tier: "brutal",
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

  const scenario = deck[index];
  const n = scenario?.steps.length ?? 0;
  const used = new Set(docks.filter(Boolean) as string[]);
  const idle = pool.filter((s) => !used.has(s));
  const complete = n > 0 && docks.length === n && docks.every(Boolean);
  const busy = locked || running;

  const startRound = useCallback(
    (i: number) => {
      const s = deck[i];
      setPool(shuffle(s.steps));
      setDocks(Array(s.steps.length).fill(null));
      setHeld(null);
      setLocked(false);
      setRunning(false);
      setPacketAt(-1);
      setBoom(-1);
      setPoints(0);
    },
    [deck]
  );

  function pickJob(job: string) {
    if (busy) return;
    play("lift");
    setHeld((h) => (h === job ? null : job));
  }

  function tapDock(di: number) {
    if (busy) return;
    const occupant = docks[di];
    if (held) {
      setDocks((prev) => {
        const next = [...prev];
        const from = next.indexOf(held);
        if (from >= 0) next[from] = occupant;
        next[di] = held;
        return next;
      });
      play(occupant && occupant !== held ? "swap" : "dock");
      setHeld(null);
      return;
    }
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
        title="Pipeline"
        how="Tape un job, puis un quai — il s’aimante. Tape un quai occupé pour le reprendre. Ensuite tu lances le paquet. Un quai menteur, ça explose."
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
        title="Pipeline"
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

  const perfect = points === POINTS_PER_ROUND;

  return (
    <GameShell title="Pipeline" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader
        context={scenario.name}
        question={held ? `Quai pour « ${held} » ?` : "Monte la ligne. Ensuite on fait courir un paquet."}
      />
      <div className="mt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Convoyeur</p>
        <div className="mt-2 flex items-stretch gap-1.5 overflow-x-auto pb-1">
          {docks.map((id, di) => (
            <div key={di} className="flex min-w-[5.2rem] flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[11px] text-muted-foreground">{di + 1}</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => tapDock(di)}
                className={cn(
                  "flex h-[4.6rem] w-full items-center justify-center rounded-2xl border-2 border-dashed px-1.5 text-center text-[11px] leading-tight transition",
                  id ? "border-solid border-border bg-card" : "border-border/70 bg-muted/30",
                  held && !id && "border-primary bg-primary/10",
                  boom === di && "border-anomaly bg-anomaly/20",
                  packetAt === di && boom !== di && "border-primary bg-primary/15"
                )}
              >
                {id ? (
                  <span key={`${id}-${di}`} className="magnet-snap font-mono">
                    {id}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">{held ? "aimanter ici" : "quai"}</span>
                )}
              </button>
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
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tas de jobs</p>
        <div className="mt-2 flex min-h-[4.4rem] flex-wrap gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-3">
          {idle.map((step) => (
            <button
              key={step}
              type="button"
              disabled={busy}
              onClick={() => pickJob(step)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left text-[12px] leading-tight transition",
                held === step
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              {step}
            </button>
          ))}
          {idle.length === 0 ? (
            <span className="font-mono text-xs text-muted-foreground">Tas vide — lance le run.</span>
          ) : null}
        </div>
      </div>
      {locked ? (
        <Verdict
          tone={roundTone(points)}
          title={perfect ? "Le paquet est passé." : boom >= 0 ? `Explosion au quai ${boom + 1}.` : "Presque."}
          lesson={scenario.lesson}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          label={running ? "Le paquet court…" : "Lancer le pipeline"}
          disabled={!complete || running}
          onLock={run}
        />
      )}
    </GameShell>
  );
}
