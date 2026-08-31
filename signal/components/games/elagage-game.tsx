// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { LockBar } from "@s/components/interact";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { heat, scaleByHeat, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { sameSet } from "@s/components/drag-kit";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Part = { id: string; dates: string; region: string; d0: number; d1: number; regionCode: string };

type Round = {
  tier: Difficulty;
  context: string;
  sql: string;
  parts: Part[];
  scan: string[];
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Quatre tuiles. Filtre sur une date de fin décembre.",
    sql: "WHERE date = '2024-12-25'",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "11–20 déc", region: "Nord", d0: 11, d1: 20, regionCode: "N" },
      { id: "p2", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p3", dates: "01–15 nov", region: "Nord", d0: -30, d1: -16, regionCode: "N" },
    ],
    scan: ["p2"],
    ok: "Le 25 n’existe que dans 21–31. Novembre et début décembre tombent. C’est le pruning.",
    miss: "Novembre n’overlap pas le 25. Seule la tuile 21–31 reste.",
  },
  {
    tier: "easy",
    context: "Filtre région Sud. Deux tuiles Sud, deux Nord.",
    sql: "WHERE region = 'Sud'",
    parts: [
      { id: "p0", dates: "déc", region: "Nord", d0: 1, d1: 31, regionCode: "N" },
      { id: "p1", dates: "déc", region: "Sud", d0: 1, d1: 31, regionCode: "S" },
      { id: "p2", dates: "nov", region: "Nord", d0: -30, d1: -1, regionCode: "N" },
      { id: "p3", dates: "nov", region: "Sud", d0: -30, d1: -1, regionCode: "S" },
    ],
    scan: ["p1", "p3"],
    ok: "Sud = les deux tuiles Sud. Nord est hors range. Le pruning colonnaire suffit.",
    miss: "Nord ne contient pas Sud. Tu scannes p1 et p3.",
  },
  {
    tier: "easy",
    context: "Décembre entier.",
    sql: "WHERE date BETWEEN '2024-12-01' AND '2024-12-31'",
    parts: [
      { id: "p0", dates: "01–15 déc", region: "mix", d0: 1, d1: 15, regionCode: "M" },
      { id: "p1", dates: "16–31 déc", region: "mix", d0: 16, d1: 31, regionCode: "M" },
      { id: "p2", dates: "novembre", region: "mix", d0: -30, d1: -1, regionCode: "M" },
    ],
    scan: ["p0", "p1"],
    ok: "Décembre : deux tuiles. Novembre tombe.",
    miss: "Novembre n’intersecte pas décembre.",
  },
  {
    tier: "hard",
    context: "Table ventes, 8 micro-partitions. Filtre sur une date.",
    sql: "WHERE date = '2024-12-25'",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "11–20 déc", region: "Nord", d0: 11, d1: 20, regionCode: "N" },
      { id: "p2", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p3", dates: "21–31 déc", region: "Sud", d0: 21, d1: 31, regionCode: "S" },
      { id: "p4", dates: "01–15 nov", region: "Nord", d0: -30, d1: -16, regionCode: "N" },
      { id: "p5", dates: "16–30 nov", region: "Sud", d0: -15, d1: -1, regionCode: "S" },
    ],
    scan: ["p2", "p3"],
    ok: "Snowflake garde min/max par colonne dans les métadonnées. 25 déc n’existe que dans les partitions 21–31. Le reste est pruned — tu ne le paies pas en scan.",
    miss: "Les partitions novembre n’overlapent pas le 25. Les deux de fin décembre, Nord et Sud, oui : le filtre n’est pas sur la région.",
  },
  {
    tier: "hard",
    context: "Même table, filtre région.",
    sql: "WHERE region = 'Sud'",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "11–20 déc", region: "Nord", d0: 11, d1: 20, regionCode: "N" },
      { id: "p2", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p3", dates: "21–31 déc", region: "Sud", d0: 21, d1: 31, regionCode: "S" },
      { id: "p4", dates: "01–15 nov", region: "Nord", d0: -30, d1: -16, regionCode: "N" },
      { id: "p5", dates: "16–30 nov", region: "Sud", d0: -15, d1: -1, regionCode: "S" },
    ],
    scan: ["p3", "p5"],
    ok: "Pruning colonnaire : Snowflake peut élaguer sur region sans lire date. Seules les micro-partitions dont le min/max contient Sud sont scannées.",
    miss: "Nord est hors range. Sud = p3 et p5. Si tes partitions mélangent Nord et Sud, le pruning pourrit — d’où clustering.",
  },
  {
    tier: "hard",
    context: "Un BETWEEN large. Beaucoup d’overlap.",
    sql: "WHERE date BETWEEN '2024-12-01' AND '2024-12-31'",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "11–20 déc", region: "Nord", d0: 11, d1: 20, regionCode: "N" },
      { id: "p2", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p3", dates: "21–31 déc", region: "Sud", d0: 21, d1: 31, regionCode: "S" },
      { id: "p4", dates: "01–15 nov", region: "Nord", d0: -30, d1: -16, regionCode: "N" },
      { id: "p5", dates: "16–30 nov", region: "Sud", d0: -15, d1: -1, regionCode: "S" },
    ],
    scan: ["p0", "p1", "p2", "p3"],
    ok: "Décembre entier : quatre partitions. Novembre tombe. 50–500 Mo non compressés par micro-partition, donc l’élagage est fin.",
    miss: "Novembre n’intersecte pas décembre. Les quatre tuiles de décembre restent.",
  },
  {
    tier: "hard",
    context: "Predicate avec sous-requête. Snowflake ne prune pas là-dessus.",
    sql: "WHERE date = (SELECT MAX(date) FROM cal)",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "11–20 déc", region: "Nord", d0: 11, d1: 20, regionCode: "N" },
      { id: "p2", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p3", dates: "21–31 déc", region: "Sud", d0: 21, d1: 31, regionCode: "S" },
    ],
    scan: ["p0", "p1", "p2", "p3"],
    ok: "Not all predicates prune. Un subquery, même s’il rend une constante, ne sert pas à l’élagage. Toute la table est lue.",
    miss: "Tu as cru pouvoir garder deux tuiles. La doc : Snowflake does not prune based on a predicate with a subquery.",
  },
  {
    tier: "hard",
    context: "Clustering depth : les ranges se chevauchent trop.",
    sql: "WHERE date = '2024-12-25'  — table mal clusterisée",
    parts: [
      { id: "p0", dates: "01 déc–31 déc", region: "mix", d0: 1, d1: 31, regionCode: "M" },
      { id: "p1", dates: "10 déc–28 déc", region: "mix", d0: 10, d1: 28, regionCode: "M" },
      { id: "p2", dates: "20 déc–31 déc", region: "mix", d0: 20, d1: 31, regionCode: "M" },
      { id: "p3", dates: "05 déc–26 déc", region: "mix", d0: 5, d1: 26, regionCode: "M" },
    ],
    scan: ["p0", "p1", "p2", "p3"],
    ok: "Overlap profond = clustering depth élevée = on scanne presque tout. Une clustering key sur date resserrerait les min/max.",
    miss: "Les quatre ranges contiennent le 25. Mal clusterisé, le pruning ne sauve plus rien. C’est le moment d’un clustering key.",
  },
  {
    tier: "brutal",
    context: "Filtre sur une expression : DATE_TRUNC('week', date) = …",
    sql: "WHERE DATE_TRUNC('week', date) = '2024-12-23'",
    parts: [
      { id: "p0", dates: "16–22 déc", region: "mix", d0: 16, d1: 22, regionCode: "M" },
      { id: "p1", dates: "23–29 déc", region: "mix", d0: 23, d1: 29, regionCode: "M" },
      { id: "p2", dates: "30–31 déc", region: "mix", d0: 30, d1: 31, regionCode: "M" },
      { id: "p3", dates: "01–07 jan", region: "mix", d0: 32, d1: 38, regionCode: "M" },
      { id: "p4", dates: "nov", region: "mix", d0: -30, d1: -1, regionCode: "M" },
    ],
    scan: ["p0", "p1", "p2", "p3", "p4"],
    ok: "Une fonction sur la colonne casse souvent le pruning. Snowflake ne peut plus utiliser min/max de date brute. Tout passe.",
    miss: "Tu as cru élaguer la semaine. DATE_TRUNC empêche le pruning sur date. Scan total.",
  },
  {
    tier: "brutal",
    context: "OR entre deux colonnes. Le pruning devient timide.",
    sql: "WHERE date = '2024-12-25' OR region = 'Sud'",
    parts: [
      { id: "p0", dates: "01–10 déc", region: "Nord", d0: 1, d1: 10, regionCode: "N" },
      { id: "p1", dates: "21–31 déc", region: "Nord", d0: 21, d1: 31, regionCode: "N" },
      { id: "p2", dates: "nov", region: "Sud", d0: -30, d1: -1, regionCode: "S" },
      { id: "p3", dates: "nov", region: "Nord", d0: -30, d1: -1, regionCode: "N" },
    ],
    scan: ["p1", "p2"],
    ok: "OR : on garde une tuile si ELLE satisfait au moins un prédicat. p1 (25 déc) et p2 (Sud). p0 ni date ni Sud. p3 ni l’un ni l’autre.",
    miss: "Un OR n’est pas un scan total. p0 (1–10 Nord) rate les deux. p3 novembre Nord aussi.",
  },
  {
    tier: "brutal",
    context: "Clustering key sur region, filtre sur date. Les min/max date sont larges.",
    sql: "WHERE date = '2024-12-25'",
    parts: [
      { id: "p0", dates: "01 nov–31 déc", region: "Nord", d0: -30, d1: 31, regionCode: "N" },
      { id: "p1", dates: "01 nov–31 déc", region: "Sud", d0: -30, d1: 31, regionCode: "S" },
      { id: "p2", dates: "01 nov–31 déc", region: "Est", d0: -30, d1: 31, regionCode: "E" },
      { id: "p3", dates: "01 nov–31 déc", region: "Ouest", d0: -30, d1: 31, regionCode: "O" },
    ],
    scan: ["p0", "p1", "p2", "p3"],
    ok: "Clusterisé sur region, le min/max de date couvre tout. Filtrer la date ne prune plus. Mauvaise clustering key pour cette query.",
    miss: "Toutes les tuiles overlapent le 25. Le clustering region n’aide pas un filtre date.",
  },
  {
    tier: "brutal",
    context: "IN list de 3 dates, partitions serrées.",
    sql: "WHERE date IN ('2024-12-01', '2024-12-25', '2024-12-31')",
    parts: [
      { id: "p0", dates: "01–05 déc", region: "mix", d0: 1, d1: 5, regionCode: "M" },
      { id: "p1", dates: "20–26 déc", region: "mix", d0: 20, d1: 26, regionCode: "M" },
      { id: "p2", dates: "27–31 déc", region: "mix", d0: 27, d1: 31, regionCode: "M" },
      { id: "p3", dates: "10–15 déc", region: "mix", d0: 10, d1: 15, regionCode: "M" },
      { id: "p4", dates: "nov", region: "mix", d0: -30, d1: -1, regionCode: "M" },
    ],
    scan: ["p0", "p1", "p2"],
    ok: "IN prune si chaque constante est hors min/max. p3 (10–15) n’a aucune des trois dates. Novembre non plus.",
    miss: "p3 ne contient ni le 1, ni le 25, ni le 31. On ne la scanne pas.",
  },
  {
    tier: "brutal",
    context: "CAST(date AS string) = '2024-12-25'. Encore une expression.",
    sql: "WHERE CAST(date AS VARCHAR) = '2024-12-25'",
    parts: [
      { id: "p0", dates: "21–31 déc", region: "N", d0: 21, d1: 31, regionCode: "N" },
      { id: "p1", dates: "01–10 déc", region: "N", d0: 1, d1: 10, regionCode: "N" },
      { id: "p2", dates: "nov", region: "S", d0: -30, d1: -1, regionCode: "S" },
    ],
    scan: ["p0", "p1", "p2"],
    ok: "CAST casse le pruning. Même si tu « sais » que c’est le 25, le compilateur ne s’en sert pas. Scan total.",
    miss: "Tu as gardé 21–31. Hélas, l’expression empêche l’élagage. Tout passe.",
  },
];

function scaleElagage(round: Round, difficulty: Difficulty, roundIndex: number, totalRounds: number): Round {
  if (round.tier) return round;
  const h = heat(difficulty, roundIndex, totalRounds);
  const needed = round.parts.filter((part) => round.scan.includes(part.id));
  const decoys = round.parts.filter((part) => !round.scan.includes(part.id));
  if (decoys.length === 0) return round;
  const decoyN = Math.max(1, Math.round(scaleByHeat(1, decoys.length, h)));
  const kept = new Set(needed.concat(decoys.slice(0, decoyN)).map((part) => part.id));
  return { ...round, parts: round.parts.filter((part) => kept.has(part.id)) };
}

export function ElagageGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(
    () => takeDeck(ROUNDS_DATA, difficulty).map((item, i) => scaleElagage(item, difficulty, i, total)),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [scan, setScan] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  const round = deck[index];
  const correct = sameSet(scan, round?.scan ?? []);

  function toggle(id: string) {
    if (locked) return;
    setScan((s) => {
      const on = s.includes(id);
      if (on) return s.filter((x) => x !== id);
      play("prune");
      return [...s, id];
    });
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setScan([]);
    setLocked(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Élagage"
        how="Les données Snowflake vivent en micro-partitions colonnaires (50–500 Mo non compressés). Tu touches celles que le filtre doit scanner. Les autres restent muettes : pruned."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Élagage"
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
    <GameShell title="Élagage" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question="Touche les micro-partitions à scanner. Le silence, c’est du pruning." />
      <p className="mt-4 rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs text-signal">{round.sql}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {round.parts.map((p, i) => {
          const on = scan.includes(p.id);
          const should = round.scan.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              disabled={locked}
              onClick={() => toggle(p.id)}
              className={cn(
                "part-tile rounded-2xl border px-3 py-3 text-left transition",
                on && !locked && "border-primary bg-primary/20",
                !on && "border-border bg-card hover:border-primary/40",
                locked && should && "border-ok bg-ok/15",
                locked && on && !should && "border-anomaly bg-anomaly/15",
                locked && !on && !should && "opacity-45"
              )}
            >
              <p className="font-mono text-[10px] text-muted-foreground">μ-part {i + 1}</p>
              <p className="mt-1 font-mono text-sm">{p.dates}</p>
              <p className="text-xs text-muted-foreground">{p.region}</p>
              {locked ? (
                <p className={cn("mt-1 font-mono text-[10px] uppercase", should ? "text-ok" : "text-muted-foreground")}>
                  {should ? "scan" : "pruned"}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {scan.length}/{round.parts.length} scannée{scan.length > 1 ? "s" : ""} · le silence, c’est du pruning
      </p>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Pruning net." : "Trop (ou trop peu) lu."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          disabled={scan.length === 0}
          label="Lancer le scan"
          onLock={() => {
            setLocked(true);
            setScore((s) => s + (correct ? POINTS_PER_ROUND : 0));
          }}
        />
      )}
    </GameShell>
  );
}
