// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { LockBar } from "@s/components/interact";
import { play, unlockAudio } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { holdMsAt, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Move = "clone" | "ctas" | "dml";

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  answer: Move;
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Les devs veulent un bac à sable de prod, tout de suite. Pas de facture storage en plus.",
    question: "Un tap. Pas une copie. Quelle opération ?",
    answer: "clone",
    ok: "CLONE pose des pointeurs. Instantané. Le stockage ne bouge pas tant que personne n’écrit.",
    miss: "CTAS recopie les octets. Pour un sandbox interne, c’est CLONE.",
  },
  {
    tier: "easy",
    context: "Le comptable n’a pas Snowflake. Il veut un export, un vrai fichier.",
    question: "Là, tu veux des octets. Maintiens jusqu’au bout.",
    answer: "ctas",
    ok: "CTAS matérialise. Un clone resterait lié aux micro-partitions sources — inutile hors du compte.",
    miss: "Un clone n’est pas un fichier. Pour un dump, tu copies.",
  },
  {
    tier: "easy",
    context: "Le clone existe. Quelqu’un UPDATE 1 % des lignes dessus.",
    question: "Le stockage a-t-il bougé ? Frappe le clone.",
    answer: "dml",
    ok: "L’UPDATE écrit de nouveaux fichiers pour les lignes touchées. Seul l’écart est facturé.",
    miss: "Snowflake ne réécrit pas toute la table. DML = nouvelles micro-partitions.",
  },
  {
    tier: "hard",
    context: "Les devs veulent une copie de prod_ventes pour tester, maintenant, sans doubler le stockage.",
    question: "Quelle opération ? Tape, maintiens, ou frappe.",
    answer: "clone",
    ok: "CREATE TABLE … CLONE pose de nouveaux pointeurs de métadonnées vers les mêmes micro-partitions. Instantané. Le stockage ne bouge que quand le clone diverge.",
    miss: "CTAS recopie les octets : lent, cher, et tu perds le zéro-copie. CLONE, c’est le branchement Git du flocon.",
  },
  {
    tier: "hard",
    context: "Un partenaire hors Snowflake doit recevoir un export physique indépendant.",
    question: "Là, tu veux de vrais fichiers, pas des pointeurs.",
    answer: "ctas",
    ok: "CTAS (ou COPY INTO) matérialise. Le clone resterait lié aux micro-partitions sources — parfait en interne, inutile pour un dump.",
    miss: "Un clone n’est pas un fichier. Pour un export, tu copies. Pour un sandbox interne, tu clones.",
  },
  {
    tier: "hard",
    context: "Clone créé. Un stagiaire UPDATE 1 % des lignes sur le clone.",
    question: "Que se passe-t-il côté stockage ?",
    answer: "dml",
    ok: "Les micro-partitions sont immuables. L’UPDATE écrit de nouveaux fichiers pour les lignes touchées. Seul l’écart est facturé. Le reste reste partagé.",
    miss: "Snowflake ne réécrit pas toute la table. DML = nouvelles micro-partitions + métadonnées. C’est pour ça que le clone reste cheap après un petit UPDATE.",
  },
  {
    tier: "hard",
    context: "Table avec clustering key. Tu clones.",
    question: "Le clustering key est copié. Automatic clustering, lui ?",
    answer: "clone",
    ok: "Le clone hérite de la clustering key, mais automatic clustering est suspendu sur la nouvelle table. Il faut le REPRENDRE explicitement (doc cloning).",
    miss: "Ce n’est pas un CTAS. CLONE copie la définition, pas l’auto-cluster qui tourne. Sinon tu paierais le clustering deux fois sans le savoir.",
  },
  {
    tier: "hard",
    context: "Table de 2 To. Les devs veulent un sandbox aujourd’hui, sans ligne de stockage en plus.",
    question: "Quelle opération garde la facture storage plate ?",
    answer: "clone",
    ok: "Après CLONE, tu paies toujours ~2 To, pas 4. Les fichiers sont partagés tant qu’aucun DML ne réécrit de micro-partitions sur le clone.",
    miss: "CTAS duplique 2 To. Le clone, c’est le même cloud storage vu deux fois par les métadonnées.",
  },
  {
    tier: "brutal",
    context: "CLONE d’une table transient. Time Travel du clone ?",
    question: "L’opération est un CLONE. Le piège est dans ce que tu hérites.",
    answer: "clone",
    ok: "CLONE copie le type. Transient reste transient : rétention courte, pas de Fail-safe. Ce n’est pas un CTAS qui « réparerait » en permanent.",
    miss: "CTAS créerait une table neuve (souvent permanente si tu le demandes). Ici on clone — on hérite le transient.",
  },
  {
    tier: "brutal",
    context: "Devs veulent une copie indépendante pour un vendor qui n’a pas accès au compte.",
    question: "Zéro-copie ne sert à rien hors du compte. Quelle opération ?",
    answer: "ctas",
    ok: "Hors du compte, les pointeurs ne voyagent pas. CTAS ou COPY INTO. Le clone n’est pas un export.",
    miss: "CLONE reste dans le compte. Un vendor n’hérite pas tes micro-partitions.",
  },
  {
    tier: "brutal",
    context: "Après CLONE, un DELETE de 40 % des lignes sur le clone, puis un INSERT massif.",
    question: "Le stockage a divergé. Quel geste l’a fait ?",
    answer: "dml",
    ok: "DELETE + INSERT = nouvelles micro-partitions. Le zéro-copie est fini sur la partie touchée. C’est du DML, pas un second CLONE.",
    miss: "Ce n’est plus un clone « gratuit ». Chaque DML écrit. CTAS aurait tout recopié dès le départ.",
  },
  {
    tier: "brutal",
    context: "CLONE AT (TIMESTAMP => hier 09:00) d’une table de 800 Go.",
    question: "Toujours zéro-copie, même dans le passé ?",
    answer: "clone",
    ok: "CLONE AT réutilise les micro-partitions de cette version. Toujours zéro-copie. Ce n’est pas un CTAS historique.",
    miss: "Time Travel + CLONE, ce n’est pas un export. Les pointeurs visent les fichiers d’hier.",
  },
  {
    tier: "brutal",
    context: "SWAP d’une table clone vers prod après un backfill. Le backfill a tout réécrit.",
    question: "Le backfill, c’était quel geste ?",
    answer: "dml",
    ok: "Un backfill, c’est du DML (ou un INSERT). Le clone a divergé. SWAP échange les noms, pas la magie zéro-copie.",
    miss: "SWAP n’est pas CTAS. Ce qui a coûté, c’est le DML du backfill.",
  },
];

export function CloneGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [zone, setZone] = useState<Move | null>(null);
  const [locked, setLocked] = useState(false);
  const [copying, setCopying] = useState(false);
  const [hold, setHold] = useState(0);
  const [punch, setPunch] = useState(false);
  const holdRef = useRef<number | null>(null);
  const startedAt = useRef(0);

  const round = deck[index];
  const holdNeed = holdMsAt(difficulty, index, total);
  const correct = zone === round?.answer;
  const blocks = 8;
  const shared = zone === "clone" || zone === "dml";
  const extra = zone === "ctas" ? blocks : zone === "dml" ? 2 : 0;

  function clearHold() {
    if (holdRef.current) window.clearInterval(holdRef.current);
    holdRef.current = null;
    setHold(0);
  }

  useEffect(() => () => clearHold(), []);

  function chooseClone() {
    if (locked) return;
    clearHold();
    unlockAudio();
    play("ok");
    setZone("clone");
    setCopying(false);
    setPunch(false);
  }

  function startCtas(event: React.PointerEvent) {
    if (locked || event.button !== 0) return;
    event.preventDefault();
    unlockAudio();
    play("copy");
    setCopying(true);
    setPunch(false);
    startedAt.current = Date.now();
    setHold(0);
    holdRef.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt.current) / holdNeed);
      setHold(p);
      if (p >= 1) {
        clearHold();
        setZone("ctas");
        window.setTimeout(() => setCopying(false), 280);
      }
    }, 40);
  }

  function endCtas() {
    if (hold >= 1) return;
    if (Date.now() - startedAt.current < holdNeed) {
      clearHold();
      setCopying(false);
      play("miss");
    }
  }

  function punchDml() {
    if (locked) return;
    clearHold();
    unlockAudio();
    play("grain");
    setPunch(true);
    setCopying(false);
    setZone("dml");
    window.setTimeout(() => setPunch(false), 320);
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setZone(null);
    setLocked(false);
    setCopying(false);
    setPunch(false);
    clearHold();
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Clone"
        how="CLONE, un tap : pointeurs, ding, instantané. CTAS, tu maintiens — ça rumble, les octets se copient. UPDATE, tu frappes le clone : de nouveaux µ-parts rouges apparaissent."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Clone"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setZone(null);
          setLocked(false);
        }}
      />
    );
  }

  return (
    <GameShell title="Clone" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">prod_ventes</p>
            <div className="mt-2 grid grid-cols-4 gap-1">
              {Array.from({ length: blocks }).map((_, i) => (
                <span key={i} className="size-6 rounded-sm bg-primary/80" />
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              {zone === "clone"
                ? "clone · pointeurs"
                : zone === "ctas"
                  ? "ctas · octets"
                  : zone === "dml"
                    ? "clone + delta"
                    : "cible"}
            </p>
            <div className={cn("mt-2 grid grid-cols-4 gap-1", copying && "hold-rumble opacity-70")}>
              {Array.from({ length: zone ? blocks : 0 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("size-6 rounded-sm magnet-snap", shared ? "bg-primary/30 ring-1 ring-primary" : "bg-chart-3")}
                />
              ))}
              {Array.from({ length: extra }).map((_, i) => (
                <span key={`x${i}`} className={cn("size-6 rounded-sm bg-anomaly", punch && "punch-hit")} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            disabled={locked}
            onClick={chooseClone}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-3 transition",
              zone === "clone" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"
            )}
          >
            <span className="font-mono text-sm">CLONE</span>
            <span className="mt-1 text-center text-[11px] text-muted-foreground">tap · zéro copie</span>
          </button>
          <button
            type="button"
            disabled={locked}
            onPointerDown={startCtas}
            onPointerUp={endCtas}
            onPointerLeave={endCtas}
            onPointerCancel={endCtas}
            className={cn(
              "relative flex min-h-24 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-3 transition select-none",
              zone === "ctas" ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
              copying && "hold-rumble"
            )}
          >
            <span
              className="pointer-events-none absolute inset-y-0 left-0 bg-chart-3/35"
              style={{ width: `${Math.round(hold * 100)}%` }}
            />
            <span className="relative font-mono text-sm">CTAS / COPY</span>
            <span className="relative mt-1 text-center text-[11px] text-muted-foreground">
              maintiens {Math.round(holdNeed / 100) / 10}s · octets
            </span>
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={punchDml}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center rounded-2xl border-2 p-3 transition",
              zone === "dml" ? "border-anomaly bg-anomaly/10" : "border-border bg-card hover:border-anomaly/40",
              punch && "punch-hit"
            )}
          >
            <span className="font-mono text-sm">UPDATE clone</span>
            <span className="mt-1 text-center text-[11px] text-muted-foreground">frappe · nouveaux µ-part</span>
          </button>
        </div>
      </div>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Pointeurs justes." : "Mauvaise copie."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          disabled={!zone}
          onLock={() => {
            setLocked(true);
            setScore((s) => s + (correct ? POINTS_PER_ROUND : 0));
          }}
        />
      )}
    </GameShell>
  );
}
