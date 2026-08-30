// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { MiniTable } from "@s/components/data-glyphs";
import { sameSet } from "@s/components/drag-kit";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { takeDeck, awardPartial } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { roundTone, scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  table: { name: string; headers: string[]; rows: string[][]; highlightRows?: number[] };
  keys: string[];
  poison?: boolean;
  ok: string;
  miss: string;
};

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Une ligne = un client.",
    question: "Quelle colonne identifie le client ?",
    table: {
      name: "dim_client",
      headers: ["client_id", "nom", "ville"],
      rows: [
        ["10", "Léa", "Lyon"],
        ["11", "Marc", "Nantes"],
      ],
    },
    keys: ["client_id"],
    ok: "Une dimension client se clé sur l’id. Le nom n’est pas unique. La ville encore moins.",
    miss: "nom n’est pas une clé. Deux Léa, et le mart s’écroule.",
  },
  {
    tier: "easy",
    context: "Ventes par jour, un magasin.",
    question: "Tape la clé du fait quotidien.",
    table: {
      name: "fait_ca_jour",
      headers: ["date", "magasin_id", "CA"],
      rows: [
        ["04-01", "L1", "120"],
        ["04-02", "L1", "98"],
      ],
    },
    keys: ["date", "magasin_id"],
    ok: "Une ligne = un magasin pendant un jour. Oublier la date, tu n’as plus qu’un total à vie.",
    miss: "magasin_id seul fusionne tous les jours. date seule fusionne tous les magasins.",
  },
  {
    tier: "easy",
    context: "Sessions web.",
    question: "Quelle clé pour compter les visites ?",
    table: {
      name: "fact_session",
      headers: ["session_id", "user_id", "source"],
      rows: [
        ["s1", "u9", "sea"],
        ["s2", "u9", "direct"],
      ],
    },
    keys: ["session_id"],
    ok: "u9 a deux sessions. Clé user_id = une visite. Conversion = sessions.",
    miss: "user_id n’est pas unique. La visite, c’est la session.",
  },
  {
    tier: "hard",
    context: "Lignes de commande e-commerce.",
    question: "Tape les en-têtes qui forment la clé. La table se plie toute seule.",
    table: {
      name: "fact_ligne_commande",
      headers: ["commande_id", "ligne_id", "sku", "qty", "€"],
      rows: [
        ["1001", "1", "THÉ", "2", "18"],
        ["1001", "2", "CAFÉ", "1", "9"],
        ["1002", "1", "THÉ", "4", "36"],
      ],
    },
    keys: ["commande_id", "ligne_id"],
    ok: "Une commande a plusieurs lignes. commande_id seul écrase le détail. Le grain, c'est la plus petite chose vraie.",
    miss: "Si tu cles sur commande_id, la deuxième ligne de 1001 disparaît. D'où les CA magiques.",
  },
  {
    tier: "hard",
    context: "Snapshot de stock, un cliché par nuit.",
    question: "Le même SKU existe à Lyon et Nantes. Quelle clé n’invente pas de stock ?",
    table: {
      name: "fact_stock_jour",
      headers: ["date", "entrepot", "sku", "unités"],
      rows: [
        ["04-01", "Lyon", "A", "120"],
        ["04-01", "Lyon", "B", "40"],
        ["04-01", "Nantes", "A", "18"],
      ],
    },
    keys: ["date", "entrepot", "sku"],
    ok: "Le même SKU existe à Lyon et Nantes. Oublier l'entrepôt, c'est fusionner deux réalités.",
    miss: "date + sku mélange les entrepôts. sku tout court, c'est un master data, pas un fait.",
  },
  {
    tier: "hard",
    context: "On te demande un mart « CA par client par mois ».",
    question: "Tape la clé de cette agrégation. Le mois est dans la question.",
    table: {
      name: "mart_ca_client_mois",
      headers: ["client_id", "mois", "CA"],
      rows: [
        ["10", "2026-03", "240"],
        ["10", "2026-04", "80"],
        ["11", "2026-04", "15"],
      ],
    },
    keys: ["client_id", "mois"],
    ok: "Une ligne = un client pendant un mois. Remonter au client seul, tu perds le temps.",
    miss: "client_id tout seul, Léa n'a plus qu'un CA à vie. Le mois est dans la question : il est dans la clé.",
  },
  {
    tier: "hard",
    context: "Quelqu'un a collé le total commande sur chaque ligne produit.",
    question: "Arrache la colonne poison — celle qui va doubler le CA. Le reste reste sain.",
    table: {
      name: "ventes_sale",
      headers: ["commande_id", "sku", "qty", "total_commande"],
      rows: [
        ["1001", "THÉ", "2", "27"],
        ["1001", "CAFÉ", "1", "27"],
        ["1002", "THÉ", "4", "36"],
      ],
      highlightRows: [0, 1],
    },
    keys: ["total_commande"],
    poison: true,
    ok: "Sommer total_commande ici, tu doubles 27. Deux grains dans une table : le péché originel du self-service.",
    miss: "27 apparaît deux fois parce que c'est le total de la commande, pas de la ligne. Une SUM et le CA explose.",
  },
  {
    tier: "hard",
    context: "Sessions web pour un taux de conversion.",
    question: "Quelle clé pour compter les visites sans les écraser ?",
    table: {
      name: "fact_session",
      headers: ["session_id", "user_id", "entrée", "source"],
      rows: [
        ["s1", "u9", "09:01", "sea"],
        ["s2", "u9", "09:40", "direct"],
        ["s3", "∅", "10:12", "seo"],
      ],
    },
    keys: ["session_id"],
    ok: "u9 a deux sessions. Clé user_id = une visite. Et la session anonyme disparaît. Conversion = sessions.",
    miss: "user_id n'est pas unique, et parfois vide. La visite, c'est la session.",
  },
  {
    tier: "brutal",
    context: "Abonnement : un contrat, plusieurs sièges, un mois de facture.",
    question: "Mart « MRR par compte ». Quelle clé ? Attention au siège.",
    table: {
      name: "mart_mrr_compte_mois",
      headers: ["compte_id", "siege_id", "mois", "MRR"],
      rows: [
        ["c1", "sA", "2026-03", "40"],
        ["c1", "sB", "2026-03", "40"],
        ["c1", "sA", "2026-04", "40"],
      ],
    },
    keys: ["compte_id", "mois"],
    ok: "Le MRR est au grain compte×mois. Sommer les sièges, tu doubles. Le siège n’est pas dans la question.",
    miss: "siege_id dans la clé, tu éclates un MRR unique. compte_id seul, tu perds le mois.",
  },
  {
    tier: "brutal",
    context: "Pageviews + commandes collés dans une même table « events ».",
    question: "Arrache la colonne qui n’a rien à faire au grain pageview.",
    table: {
      name: "events_sale",
      headers: ["event_id", "page", "ts", "ca_commande"],
      rows: [
        ["e1", "/home", "09:01", "∅"],
        ["e2", "/pay", "09:04", "80"],
        ["e3", "/merci", "09:04", "80"],
      ],
      highlightRows: [1, 2],
    },
    keys: ["ca_commande"],
    poison: true,
    ok: "80 est collé sur deux events. Sommer ca_commande au grain pageview, tu doubles le CA.",
    miss: "Deux grains : le hit et la commande. La colonne poison vit au mauvais étage.",
  },
  {
    tier: "brutal",
    context: "Taux de conversion magasin × jour × canal.",
    question: "Quelle clé pour ne pas mélanger SEA et magasin ?",
    table: {
      name: "fait_conv",
      headers: ["date", "magasin_id", "canal", "sessions", "achats"],
      rows: [
        ["04-01", "L1", "sea", "400", "12"],
        ["04-01", "L1", "direct", "120", "9"],
        ["04-01", "N1", "sea", "80", "2"],
      ],
    },
    keys: ["date", "magasin_id", "canal"],
    ok: "Trois grains dans la question, trois colonnes dans la clé. Oublier canal, SEA mange direct.",
    miss: "date + magasin mélange les canaux. canal seul n’est pas un fait.",
  },
  {
    tier: "brutal",
    context: "SCD2 client : Léa a deux versions d’adresse.",
    question: "Pour joindre un fait à la bonne version, quelle clé ?",
    table: {
      name: "dim_client_hist",
      headers: ["client_sk", "client_id", "valid_from", "ville"],
      rows: [
        ["100", "10", "2023", "Lyon"],
        ["101", "10", "2024", "Nantes"],
      ],
    },
    keys: ["client_sk"],
    ok: "La surrogate key (sk) est la clé de jointure du fait. client_id seul ramène deux versions.",
    miss: "client_id n’est pas unique dans une SCD2. C’est tout l’intérêt du Type 2.",
  },
  {
    tier: "brutal",
    context: "Panier moyen : on a collé le CA commande sur chaque SKU du ticket.",
    question: "Arrache ce qui va exploser un AVG.",
    table: {
      name: "ticket_sale",
      headers: ["ticket_id", "sku", "qty", "ca_ticket"],
      rows: [
        ["t1", "THÉ", "2", "27"],
        ["t1", "CAFÉ", "1", "27"],
        ["t2", "THÉ", "1", "9"],
      ],
      highlightRows: [0, 1],
    },
    keys: ["ca_ticket"],
    poison: true,
    ok: "AVG(ca_ticket) au grain SKU pèse 27 deux fois. Le panier moyen se calcule au grain ticket.",
    miss: "27 n’est pas le prix de la ligne. C’est le ticket entier, répété. Poison.",
  },
];

function foldByKeys(headers: string[], rows: string[][], keys: string[]) {
  if (keys.length === 0) {
    return { groups: rows.map((row) => [row]), unique: rows.length, crushed: 0 };
  }
  const idx = keys.map((k) => headers.indexOf(k)).filter((i) => i >= 0);
  const map = new Map<string, string[][]>();
  for (const row of rows) {
    const k = idx.map((i) => row[i]).join("|");
    const bucket = map.get(k) ?? [];
    bucket.push(row);
    map.set(k, bucket);
  }
  const groups = [...map.values()];
  return { groups, unique: groups.length, crushed: rows.length - groups.length };
}

function poisonSum(rows: string[][], headers: string[], yanked: string[]) {
  const i = headers.indexOf("total_commande");
  if (i < 0 || yanked.includes("total_commande")) return null;
  return rows.reduce((acc, row) => acc + Number(row[i] || 0), 0);
}

export function GrainGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  const round = deck[index];
  const headers = round?.table.headers ?? [];
  const fold = useMemo(
    () => (round?.poison ? null : foldByKeys(headers, round?.table.rows ?? [], picked)),
    [headers, picked, round]
  );
  const sum = round?.poison ? poisonSum(round.table.rows, headers, picked) : null;
  const poisonOk = Boolean(round?.poison) && sameSet(picked, round.keys);
  const grainOk = round?.poison ? poisonOk : sameSet(picked, round?.keys ?? []);
  const extras = picked.filter((k) => !round.keys.includes(k)).length;
  const hits = round.keys.filter((k) => picked.includes(k)).length;
  const roundPoints = grainOk
    ? POINTS_PER_ROUND
    : extras > 0
      ? 0
      : awardPartial(hits, round.keys.length, difficulty);

  function toggle(header: string) {
    if (locked) return;
    setPicked((prev) => {
      const on = prev.includes(header);
      play(on ? "lift" : round?.poison ? "miss" : "grain");
      return on ? prev.filter((h) => h !== header) : [...prev, header];
    });
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    const n = index + 1;
    setIndex(n);
    setPicked([]);
    setLocked(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Grain"
        how="Tape les en-têtes : la table se plie sur ta clé. Trop peu de colonnes, des lignes s’écrasent. Une colonne poison, tu l’arraches — sinon le SUM explose."
        onStart={() => {
          setPicked([]);
          setPhase("play");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Grain"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setPicked([]);
          setLocked(false);
        }}
      />
    );
  }

  return (
    <GameShell title="Grain" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-5">
        <MiniTable
          name={round.table.name}
          headers={round.table.headers}
          rows={round.table.rows}
          highlightRows={round.table.highlightRows}
          selectedCols={picked}
          onToggleCol={toggle}
          disabled={locked}
          selectTone={round.poison ? "yank" : "key"}
        />
      </div>
      {round.poison ? (
        <p
          className={cn(
            "mt-3 text-center font-mono text-sm",
            sum !== null && sum > 63 ? "text-anomaly" : "text-muted-foreground"
          )}
        >
          {sum === null
            ? "Colonne poison arrachée. Le SUM redevient honnête."
            : `SUM(total_commande) = ${sum} € ${sum > 63 ? "— ça double." : ""}`}
        </p>
      ) : fold ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-center font-mono text-xs text-muted-foreground">
            {picked.length === 0
              ? "Tape une colonne-clé. La table te montrera ce qui fusionne."
              : fold.crushed === 0
                ? `${fold.unique} lignes uniques — rien ne s’écrase.`
                : `${fold.crushed} ligne${fold.crushed > 1 ? "s" : ""} écrasée${fold.crushed > 1 ? "s" : ""} · ${fold.unique} grain${fold.unique > 1 ? "s" : ""} restant${fold.unique > 1 ? "s" : ""}.`}
          </p>
          {fold.crushed > 0
            ? fold.groups
                .filter((g) => g.length > 1)
                .map((g) => (
                  <p
                    key={g.map((r) => r.join("-")).join("|")}
                    className="fold-crush rounded-lg border border-anomaly/40 bg-anomaly/10 px-3 py-1.5 text-center font-mono text-[11px] text-anomaly"
                  >
                    {g.length} lignes → 1 sur {picked.join(" × ")}
                  </p>
                ))
            : null}
        </div>
      ) : null}
      {locked ? (
        <Verdict
          tone={roundTone(roundPoints)}
          title={grainOk ? "Bon grain." : roundPoints > 0 ? "Presque le grain." : "Grain faux."}
          lesson={grainOk ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          disabled={picked.length === 0}
          label={round.poison ? "Verrouiller l’arrachement" : "Verrouiller le grain"}
          onLock={() => {
            setLocked(true);
            setScore((s) => s + roundPoints);
            play(grainOk ? "ok" : "miss");
          }}
        />
      )}
    </GameShell>
  );
}
