// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { BarChart, weekLabels } from "@s/components/mini-charts";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import type { Difficulty } from "@s/lib/play";
import { heat, scaleByHeat, takeDeck } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";

type Round = {
  title: string;
  unit: string;
  values: number[];
  labels: string[];
  answer: number;
  kind: "spike" | "dip" | "break";
  ok: string;
  miss: string;
};

type Spec = Omit<Round, "values" | "labels" | "answer"> & { tier: Difficulty };

function makeRounds(rng: () => number, difficulty: Difficulty, total: number): Round[] {
  const specs: Spec[] = [
    {
      tier: "easy",
      title: "CA hebdo — boutique en ligne",
      unit: "k€",
      kind: "spike",
      ok: "Un pic qui sort du lot, c’est le premier réflexe : on pointe du doigt, on ne fête pas encore.",
      miss: "La barre trop haute n’est pas « une belle semaine ». C’est l’intrus. Toujours celle-là.",
    },
    {
      tier: "easy",
      title: "Taux de conversion — landing",
      unit: "%",
      kind: "dip",
      ok: "Le trou se voit à l’œil. Une page cassée, un pixel mort, un formulaire qui ne soumet plus.",
      miss: "Le creux n’est pas la moyenne. C’est la semaine où le tunnel a lâché.",
    },
    {
      tier: "easy",
      title: "Tickets support — file unique",
      unit: "vol.",
      kind: "spike",
      ok: "Le volume double d’un coup. Incident produit, ou un e-mail parti trop tôt.",
      miss: "Quand tout est plat sauf une barre, ce n’est pas « un peu plus d’activité ». C’est l’incident.",
    },
    {
      tier: "hard",
      title: "CA hebdo — marketplace",
      unit: "k€",
      kind: "spike",
      ok: "Pic isolé. Avant de fêter, on vérifie le tracking, une promo non prévue, ou un gros client unique.",
      miss: "Le pic n'est pas une victoire tant qu'on n'a pas écarté le bot, le double comptage, ou la commande B2B one-shot.",
    },
    {
      tier: "hard",
      title: "Taux de conversion — tunnel 4 étapes",
      unit: "%",
      kind: "dip",
      ok: "Une chute nette dans une série stable, c'est souvent un bug de tunnel, pas un marché qui s'effondre.",
      miss: "Ici c'est le creux qui parle. Une conversion qui plonge une seule semaine = formulaire, pixel, ou page qui a cassé.",
    },
    {
      tier: "hard",
      title: "Panier moyen — mix canaux",
      unit: "€",
      kind: "dip",
      ok: "Le panier moyen a décroché. Mix produits, remise trop large, ou un canal low-ticket qui a pris le dessus.",
      miss: "Le plus petit n'est pas toujours le plus intéressant — sauf quand il casse la tendance. C'était celui-là.",
    },
    {
      tier: "hard",
      title: "NPS — vagues mensuelles",
      unit: "pts",
      kind: "spike",
      ok: "Un NPS qui saute d’un coup, c’est souvent un échantillon trop petit, ou un incident très visible.",
      miss: "Ce n’était pas la tendance : une seule vague hors norme. On ne refait pas la culture pour une dent.",
    },
    {
      tier: "hard",
      title: "Utilisateurs actifs — app",
      unit: "k",
      kind: "break",
      ok: "Ce n'est pas un bruit : la série change de régime. Tracking, définition du KPI, ou vrai changement d'usage.",
      miss: "Une rupture de palier, ce n'est pas une saison. On cherche ce qui a changé dans la mesure — ou dans le produit.",
    },
    {
      tier: "brutal",
      title: "Marge brute — SKU mixés",
      unit: "%",
      kind: "dip",
      ok: "Le creux est minuscule. C’est souvent un SKU low-margin qui a pris le volume, pas « le marché ». ",
      miss: "Brutal : l’intrus se cache dans le bruit. Le plus petit écart, s’il casse la pente, est le signal.",
    },
    {
      tier: "brutal",
      title: "Sessions — après refonte tracking",
      unit: "k",
      kind: "break",
      ok: "Le palier a bougé de quelques points. En BI, un changement de pixel se lit comme une « croissance ». ",
      miss: "Ce n’est pas une saison. La série a changé de monde — souvent la définition, pas les clients.",
    },
    {
      tier: "brutal",
      title: "Délai livraison — 3PL",
      unit: "j",
      kind: "spike",
      ok: "Un jour de plus, une fois. Grève, entrepôt, ou un batch de commandes B2B. Pas une nouvelle politique.",
      miss: "Le pic est trop discret pour sauter aux yeux. En Costaud on le voyait ; ici il faut comparer barre à barre.",
    },
    {
      tier: "brutal",
      title: "Taux d’ouverture — 18 envois",
      unit: "%",
      kind: "dip",
      ok: "Un envoi un peu plus bas. Objet trop long, ou un segment fatigué. Pas une « chute d’engagement ». ",
      miss: "Sans le contexte des autres envois, ce creux passe pour du bruit. C’était bien l’intrus.",
    },
    {
      tier: "brutal",
      title: "CA quotidien — 14 jours",
      unit: "k€",
      kind: "break",
      ok: "À mi-parcours, la moyenne glisse. Promo permanente, ou un canal qui s’installe. On date le changement.",
      miss: "Une rupture douce n’est pas un pic. On cherche le jour où la pente a changé, pas la barre la plus haute.",
    },
  ];

  return takeDeck(specs, difficulty).map((spec, round) => {
    const h = heat(difficulty, round, total);
    const n = Math.round(scaleByHeat(5, 16, h));
    const labels = weekLabels(n);
    const start = 40 + round * 8 + Math.round(rng() * 12);
    const slope = spec.kind === "break" ? 0.4 : 1.2 + round * 0.15;
    const noise = scaleByHeat(0.35, 7.4, h);
    const values = Array.from({ length: n }, (_, i) => {
      const trend = start + slope * i;
      return Math.max(4, Math.round(trend + (rng() - 0.5) * noise));
    });
    const margin = Math.round(scaleByHeat(2, 3, h));
    const answer = margin + Math.floor(rng() * Math.max(1, n - margin * 2));
    const subtlety = scaleByHeat(1.15, 0.07, h);
    if (spec.kind === "spike") {
      values[answer] = Math.round(values[answer] * (1 + subtlety));
    } else if (spec.kind === "dip") {
      values[answer] = Math.max(3, Math.round(values[answer] * (1 - subtlety)));
    } else {
      const lift = start * scaleByHeat(0.58, 0.09, h);
      for (let i = answer; i < n; i += 1) {
        values[i] = Math.round(values[i] + lift);
      }
    }
    return { ...spec, values, labels, answer };
  });
}

export function AnomalieGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, rng, difficulty } = usePlaySession();
  const rounds = useMemo(
    () => makeRounds(rng, difficulty, total).slice(0, total),
    [difficulty, rng, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const round = rounds[index];
  const correct = picked === round?.answer;

  function pick(i: number) {
    if (revealed || picked !== null) return;
    setPicked(i);
    setRevealed(true);
    setScore((s) => s + (i === round.answer ? POINTS_PER_ROUND : 0));
  }

  function next() {
    if (index + 1 >= total) {
      const finalScore = score;
      setPhase("done");
      onFinish(finalScore);
      return;
    }
    setIndex((v) => v + 1);
    setPicked(null);
    setRevealed(false);
  }

  function replay() {
    setPhase("intro");
    setIndex(0);
    setScore(0);
    setPicked(null);
    setRevealed(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Anomalie"
        how="Un graphique, un intrus. Touche la barre qui n'appartient pas à la série — spike, creux, ou rupture."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result title="Anomalie" score={score} max={maxScore} line={scoreLine(score, maxScore)} onReplay={replay} />
    );
  }

  return (
    <GameShell title="Anomalie" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.title} question="Où est l’intrus ?" />
      <div className="mt-8">
        <BarChart
          values={round.values}
          labels={round.labels}
          selected={picked}
          revealed={revealed ? round.answer : null}
          onSelect={pick}
          disabled={revealed}
        />
      </div>
      {revealed ? (
        <Verdict
          tone={correct ? "ok" : "miss"}
          title={correct ? "Vu." : "À côté."}
          lesson={correct ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Unité : {round.unit}. Touche une barre.
        </p>
      )}
    </GameShell>
  );
}
