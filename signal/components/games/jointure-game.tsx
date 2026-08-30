// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { MiniTable } from "@s/components/data-glyphs";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { heat, scaleByHeat, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type JoinKind = "inner" | "left" | "full" | "anti";

type Table = { name: string; headers: string[]; rows: string[][] };

type Round = {
  tier: Difficulty;
  context: string;
  question: string;
  left: Table;
  right: Table;
  answer: JoinKind;
  views: Record<JoinKind, Table>;
  ok: string;
  miss: string;
};

const LENSES: { id: JoinKind; label: string; hint: string }[] = [
  { id: "inner", label: "INNER", hint: "l’intersection" },
  { id: "left", label: "LEFT", hint: "tout à gauche" },
  { id: "full", label: "FULL", hint: "personne perdu" },
  { id: "anti", label: "ANTI", hint: "sans match" },
];

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    context: "Commandes + clients. On ne veut que les commandes avec un client connu.",
    question: "INNER ou LEFT ? Essaie. Qui disparaît ?",
    left: {
      name: "commandes",
      headers: ["id", "client", "€"],
      rows: [
        ["1", "Léa", "40"],
        ["2", "?", "80"],
      ],
    },
    right: {
      name: "clients",
      headers: ["nom"],
      rows: [["Léa"]],
    },
    answer: "inner",
    views: {
      inner: { name: "INNER", headers: ["id", "client", "€"], rows: [["1", "Léa", "40"]] },
      left: { name: "LEFT", headers: ["id", "client", "€"], rows: [["1", "Léa", "40"], ["2", "?", "80"]] },
      full: { name: "FULL", headers: ["id", "client", "€"], rows: [["1", "Léa", "40"], ["2", "?", "80"]] },
      anti: { name: "ANTI", headers: ["id", "client", "€"], rows: [["2", "?", "80"]] },
    },
    ok: "INNER : la commande sans client disparaît. C’est voulu si le métier dit « clients connus ».",
    miss: "LEFT garde l’orpheline. INNER la jette. Ici on voulait l’intersection.",
  },
  {
    tier: "easy",
    context: "Tous les clients, même sans commande.",
    question: "Marc n’a rien acheté. Doit-il rester ?",
    left: {
      name: "clients",
      headers: ["nom"],
      rows: [
        ["Léa"],
        ["Marc"],
      ],
    },
    right: {
      name: "commandes",
      headers: ["nom", "€"],
      rows: [["Léa", "40"]],
    },
    answer: "left",
    views: {
      inner: { name: "INNER", headers: ["nom", "€"], rows: [["Léa", "40"]] },
      left: { name: "LEFT", headers: ["nom", "€"], rows: [["Léa", "40"], ["Marc", "∅"]] },
      full: { name: "FULL", headers: ["nom", "€"], rows: [["Léa", "40"], ["Marc", "∅"]] },
      anti: { name: "ANTI", headers: ["nom", "€"], rows: [["Marc", "∅"]] },
    },
    ok: "LEFT depuis clients : Marc reste. INNER l’efface et tu crois n’avoir qu’un client.",
    miss: "INNER fait disparaître Marc. Pour une liste clients, LEFT.",
  },
  {
    tier: "easy",
    context: "Trouver la commande sans client — juste le problème.",
    question: "Quelle lentille ne garde que l’orpheline ?",
    left: {
      name: "commandes",
      headers: ["id", "€"],
      rows: [
        ["1", "40"],
        ["9", "80"],
      ],
    },
    right: {
      name: "clients",
      headers: ["id"],
      rows: [["1"]],
    },
    answer: "anti",
    views: {
      inner: { name: "INNER", headers: ["id", "€"], rows: [["1", "40"]] },
      left: { name: "LEFT", headers: ["id", "€"], rows: [["1", "40"], ["9", "80"]] },
      full: { name: "FULL", headers: ["id", "€"], rows: [["1", "40"], ["9", "80"]] },
      anti: { name: "ANTI", headers: ["id", "€"], rows: [["9", "80"]] },
    },
    ok: "ANTI : uniquement ceux qui ne matchent pas. C’est le test qualité.",
    miss: "LEFT mélange le bon et le sale. ANTI ne garde que le sale.",
  },
  {
    tier: "hard",
    context: "On veut le CA des commandes rattachées à un client connu.",
    question: "Essaie les lentilles. Qui disparaît ?",
    left: {
      name: "commandes",
      headers: ["id", "client_id", "€"],
      rows: [
        ["1", "10", "40"],
        ["2", "10", "25"],
        ["3", "99", "80"],
      ],
    },
    right: {
      name: "clients",
      headers: ["id", "nom"],
      rows: [
        ["10", "Léa"],
        ["11", "Marc"],
      ],
    },
    answer: "inner",
    views: {
      inner: { name: "INNER", headers: ["id", "nom", "€"], rows: [["1", "Léa", "40"], ["2", "Léa", "25"]] },
      left: { name: "LEFT", headers: ["id", "nom", "€"], rows: [["1", "Léa", "40"], ["2", "Léa", "25"], ["3", "∅", "80"]] },
      full: {
        name: "FULL",
        headers: ["id", "nom", "€"],
        rows: [
          ["1", "Léa", "40"],
          ["2", "Léa", "25"],
          ["3", "∅", "80"],
          ["∅", "Marc", "∅"],
        ],
      },
      anti: { name: "ANTI", headers: ["id", "nom", "€"], rows: [["3", "∅", "80"]] },
    },
    ok: "INNER : la commande 99 disparaît. C'est voulu si le métier dit « clients connus ». Sinon tu viens de cacher 80 €.",
    miss: "La commande 99 n'a pas de client. INNER la jette. LEFT la garde. ANTI ne garde qu'elle.",
  },
  {
    tier: "hard",
    context: "Liste de tous les clients, même ceux sans commande ce mois-ci.",
    question: "En partant des clients : qui doit rester à l’écran ?",
    left: {
      name: "clients",
      headers: ["id", "nom"],
      rows: [
        ["10", "Léa"],
        ["11", "Marc"],
      ],
    },
    right: {
      name: "commandes",
      headers: ["id", "client_id", "€"],
      rows: [
        ["1", "10", "40"],
        ["2", "10", "25"],
      ],
    },
    answer: "left",
    views: {
      inner: { name: "INNER", headers: ["nom", "€"], rows: [["Léa", "65"]] },
      left: { name: "LEFT", headers: ["nom", "€"], rows: [["Léa", "65"], ["Marc", "∅"]] },
      full: { name: "FULL", headers: ["nom", "€"], rows: [["Léa", "65"], ["Marc", "∅"]] },
      anti: { name: "ANTI", headers: ["nom", "€"], rows: [["Marc", "∅"]] },
    },
    ok: "LEFT depuis clients : Marc reste, avec un vide. INNER l'efface et tu crois n'avoir qu'un client actif.",
    miss: "Marc n'a pas commandé. INNER le fait disparaître. Pour un taux d'activité, il doit rester — d'où le LEFT.",
  },
  {
    tier: "hard",
    context: "Qualité : trouver les commandes orphelines, sans client.",
    question: "Quelle lentille ne garde que le problème ?",
    left: {
      name: "commandes",
      headers: ["id", "client_id", "€"],
      rows: [
        ["1", "10", "40"],
        ["3", "99", "80"],
      ],
    },
    right: {
      name: "clients",
      headers: ["id", "nom"],
      rows: [["10", "Léa"]],
    },
    answer: "anti",
    views: {
      inner: { name: "INNER", headers: ["id", "€"], rows: [["1", "40"]] },
      left: { name: "LEFT", headers: ["id", "€"], rows: [["1", "40"], ["3", "80"]] },
      full: { name: "FULL", headers: ["id", "€"], rows: [["1", "40"], ["3", "80"]] },
      anti: { name: "ANTI", headers: ["id", "€"], rows: [["3", "80"]] },
    },
    ok: "ANTI (LEFT … WHERE right IS NULL) : uniquement les orphelins. C'est le premier test qu'un pipeline sérieux pose.",
    miss: "INNER les cache. LEFT les mélange aux bonnes lignes. Pour la qualité, on veut ceux qui ne matchent pas : ANTI.",
  },
  {
    tier: "hard",
    context: "Catalogue : produits jamais vendus ce trimestre.",
    question: "En partant des produits, fais apparaître le stock mort.",
    left: {
      name: "produits",
      headers: ["sku", "nom"],
      rows: [
        ["A", "Thé"],
        ["B", "Café"],
        ["C", "Cacao"],
      ],
    },
    right: {
      name: "lignes",
      headers: ["sku", "qty"],
      rows: [
        ["A", "12"],
        ["C", "3"],
      ],
    },
    answer: "anti",
    views: {
      inner: { name: "INNER", headers: ["sku", "nom"], rows: [["A", "Thé"], ["C", "Cacao"]] },
      left: { name: "LEFT", headers: ["sku", "nom"], rows: [["A", "Thé"], ["B", "Café"], ["C", "Cacao"]] },
      full: { name: "FULL", headers: ["sku", "nom"], rows: [["A", "Thé"], ["B", "Café"], ["C", "Cacao"]] },
      anti: { name: "ANTI", headers: ["sku", "nom"], rows: [["B", "Café"]] },
    },
    ok: "Le Café n'apparaît dans aucune ligne. ANTI depuis produits. Un INNER « ventes » ne te le dira jamais.",
    miss: "INNER ne montre que Thé et Cacao. Pour le stock mort, on part du catalogue et on garde l'absence de match.",
  },
  {
    tier: "hard",
    context: "Deux listes de codes promo : CRM et e-commerce. On ne veut perdre personne.",
    question: "Réconcilie sans faire disparaître une source.",
    left: { name: "crm", headers: ["code"], rows: [["WELCOME"], ["VIP"]] },
    right: { name: "web", headers: ["code"], rows: [["VIP"], ["FREESHIP"]] },
    answer: "full",
    views: {
      inner: { name: "INNER", headers: ["code"], rows: [["VIP"]] },
      left: { name: "LEFT", headers: ["code"], rows: [["WELCOME"], ["VIP"]] },
      full: { name: "FULL", headers: ["code", "crm", "web"], rows: [["WELCOME", "oui", "∅"], ["VIP", "oui", "oui"], ["FREESHIP", "∅", "oui"]] },
      anti: { name: "ANTI", headers: ["code"], rows: [["WELCOME"]] },
    },
    ok: "FULL OUTER : l'union des mondes, avec des trous visibles. C'est la réconciliation, pas le reporting.",
    miss: "INNER ne garde que VIP. LEFT oublie FREESHIP. Pour fusionner deux sources, FULL — puis on décide qui gagne.",
  },
  {
    tier: "brutal",
    context: "Employés vs badges : qui n’a jamais badgé ce mois, pour la sécu.",
    question: "On part des employés. On ne veut QUE les absents.",
    left: {
      name: "employes",
      headers: ["id", "nom"],
      rows: [
        ["1", "Léa"],
        ["2", "Marc"],
        ["3", "Inès"],
      ],
    },
    right: {
      name: "badges",
      headers: ["emp_id", "jour"],
      rows: [
        ["1", "04-01"],
        ["3", "04-02"],
      ],
    },
    answer: "anti",
    views: {
      inner: { name: "INNER", headers: ["nom"], rows: [["Léa"], ["Inès"]] },
      left: { name: "LEFT", headers: ["nom"], rows: [["Léa"], ["Marc"], ["Inès"]] },
      full: { name: "FULL", headers: ["nom"], rows: [["Léa"], ["Marc"], ["Inès"]] },
      anti: { name: "ANTI", headers: ["nom"], rows: [["Marc"]] },
    },
    ok: "ANTI depuis employés. LEFT les garde tous ; INNER cache Marc. La sécu veut l’absence.",
    miss: "LEFT montre tout le monde. INNER cache le problème. ANTI isole Marc.",
  },
  {
    tier: "brutal",
    context: "Factures vs paiements : écarts des deux côtés, à réconcilier.",
    question: "Personne ne doit disparaître. Ni facture orpheline, ni paiement fantôme.",
    left: { name: "factures", headers: ["ref"], rows: [["F-1"], ["F-2"]] },
    right: { name: "paiements", headers: ["ref"], rows: [["F-2"], ["P-9"]] },
    answer: "full",
    views: {
      inner: { name: "INNER", headers: ["ref"], rows: [["F-2"]] },
      left: { name: "LEFT", headers: ["ref"], rows: [["F-1"], ["F-2"]] },
      full: { name: "FULL", headers: ["ref", "fac", "pay"], rows: [["F-1", "oui", "∅"], ["F-2", "oui", "oui"], ["P-9", "∅", "oui"]] },
      anti: { name: "ANTI", headers: ["ref"], rows: [["F-1"]] },
    },
    ok: "FULL : F-1 sans paiement, P-9 sans facture. C’est la réconciliation, pas un reporting d’intersection.",
    miss: "ANTI ne montre que F-1. INNER que F-2. Les deux mondes, c’est FULL.",
  },
  {
    tier: "brutal",
    context: "Cohortes : users signup vs first_purchase. Taux d’activation.",
    question: "Le dénominateur, c’est tous les inscrits. Même ceux à 0 €.",
    left: {
      name: "signups",
      headers: ["user"],
      rows: [["u1"], ["u2"], ["u3"]],
    },
    right: {
      name: "achats",
      headers: ["user", "€"],
      rows: [["u1", "12"]],
    },
    answer: "left",
    views: {
      inner: { name: "INNER", headers: ["user", "€"], rows: [["u1", "12"]] },
      left: { name: "LEFT", headers: ["user", "€"], rows: [["u1", "12"], ["u2", "∅"], ["u3", "∅"]] },
      full: { name: "FULL", headers: ["user", "€"], rows: [["u1", "12"], ["u2", "∅"], ["u3", "∅"]] },
      anti: { name: "ANTI", headers: ["user", "€"], rows: [["u2", "∅"], ["u3", "∅"]] },
    },
    ok: "LEFT depuis signups. INNER calcule un faux 100 % d’activation. ANTI oublie ceux qui ont payé.",
    miss: "Le taux d’activation se dénombre sur tous les inscrits. INNER les jette.",
  },
  {
    tier: "brutal",
    context: "SKU web vs SKU ERP : mismatches des deux côtés, pour un data contract.",
    question: "On veut le delta complet, pas seulement « web sans ERP ».",
    left: { name: "web", headers: ["sku"], rows: [["A"], ["B"]] },
    right: { name: "erp", headers: ["sku"], rows: [["B"], ["C"]] },
    answer: "full",
    views: {
      inner: { name: "INNER", headers: ["sku"], rows: [["B"]] },
      left: { name: "LEFT", headers: ["sku"], rows: [["A"], ["B"]] },
      full: { name: "FULL", headers: ["sku", "web", "erp"], rows: [["A", "oui", "∅"], ["B", "oui", "oui"], ["C", "∅", "oui"]] },
      anti: { name: "ANTI", headers: ["sku"], rows: [["A"]] },
    },
    ok: "FULL montre A (web only) et C (ERP only). Un ANTI web-only oublie C. Le contrat, c’est les deux deltas.",
    miss: "ANTI = seulement A. LEFT oublie C. INNER = le match, donc le silence.",
  },
  {
    tier: "brutal",
    context: "Emails consentis vs base CRM. RGPD : qui est dans le CRM sans consentement.",
    question: "On part du CRM. On garde ceux SANS match consentement.",
    left: {
      name: "crm",
      headers: ["email"],
      rows: [["a@x"], ["b@x"], ["c@x"]],
    },
    right: {
      name: "consent",
      headers: ["email"],
      rows: [["a@x"], ["c@x"]],
    },
    answer: "anti",
    views: {
      inner: { name: "INNER", headers: ["email"], rows: [["a@x"], ["c@x"]] },
      left: { name: "LEFT", headers: ["email"], rows: [["a@x"], ["b@x"], ["c@x"]] },
      full: { name: "FULL", headers: ["email"], rows: [["a@x"], ["b@x"], ["c@x"]] },
      anti: { name: "ANTI", headers: ["email"], rows: [["b@x"]] },
    },
    ok: "ANTI depuis CRM : b@x n’a pas consenti. LEFT les garde tous. INNER cache le risque.",
    miss: "Le risque RGPD, c’est l’absence de match. ANTI, pas INNER.",
  },
];

function lensesFor(
  difficulty: Difficulty,
  roundIndex: number,
  totalRounds: number,
  answer: JoinKind
): typeof LENSES {
  const n = Math.max(2, Math.round(scaleByHeat(2, LENSES.length, heat(difficulty, roundIndex, totalRounds))));
  const keep = new Set<JoinKind>([answer]);
  for (const lens of LENSES) {
    if (keep.size >= n) break;
    keep.add(lens.id);
  }
  return LENSES.filter((lens) => keep.has(lens.id));
}

export function JointureGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(() => takeDeck(ROUNDS_DATA, difficulty), [difficulty]);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lens, setLens] = useState<JoinKind | null>(null);
  const [locked, setLocked] = useState(false);

  const round = deck[index];
  const lenses = round ? lensesFor(difficulty, index, total, round.answer) : LENSES;
  const correct = lens === round?.answer;
  const view = lens ? round.views[lens] : null;

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setLens(null);
    setLocked(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Jointure"
        how="Deux tables, quatre lentilles. Chaque lentille fait vivre ou mourir des lignes. Tu regardes, tu comprends, tu valides."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Jointure"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setLens(null);
          setLocked(false);
        }}
      />
    );
  }

  return (
    <GameShell title="Jointure" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniTable name={round.left.name} headers={round.left.headers} rows={round.left.rows} />
        <MiniTable name={round.right.name} headers={round.right.headers} rows={round.right.rows} />
      </div>
      <div className={cn("mt-4 grid gap-2", lenses.length <= 2 ? "grid-cols-2" : "grid-cols-4")}>
        {lenses.map((l) => (
          <button
            key={l.id}
            type="button"
            disabled={locked}
            onClick={() => setLens(l.id)}
            className={cn(
              "rounded-2xl border px-1 py-3 text-center transition",
              lens === l.id && "border-primary bg-primary/15",
              lens !== l.id && "border-border bg-card hover:border-primary/40",
              locked && l.id === round.answer && "border-ok bg-ok/15",
              locked && lens === l.id && l.id !== round.answer && "border-anomaly bg-anomaly/10"
            )}
          >
            <span className="block font-mono text-sm">{l.label}</span>
            <span className="text-[10px] text-muted-foreground">{l.hint}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-24">
        {view ? (
          <MiniTable name={`résultat · ${view.name}`} headers={view.headers} rows={view.rows} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            Pose une lentille. Les lignes survivent — ou pas.
          </p>
        )}
      </div>
      {locked ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Les bonnes lignes." : "Mauvais match."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <LockBar
          disabled={!lens}
          label="Garder cette lentille"
          onLock={() => {
            setLocked(true);
            setScore((s) => s + (lens === round.answer ? POINTS_PER_ROUND : 0));
          }}
        />
      )}
    </GameShell>
  );
}
