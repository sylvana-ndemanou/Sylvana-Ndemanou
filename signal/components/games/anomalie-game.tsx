// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { BarChart, weekLabels } from "@s/components/mini-charts";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import type { Difficulty } from "@s/lib/play";
import { along, takeDeck } from "@s/lib/play";
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

function neighbors(n: number, answer: number, radius: number) {
  const lo = Math.max(0, answer - radius);
  const hi = Math.min(n - 1, answer + radius);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((i) => i !== answer);
}

function capExcept(values: number[], answer: number, limit: number, kind: "spike" | "dip") {
  for (let i = 0; i < values.length; i += 1) {
    if (i === answer) continue;
    if (kind === "spike" && values[i] >= limit) values[i] = limit;
    if (kind === "dip" && values[i] <= limit) values[i] = limit;
  }
}

function sealSpike(values: number[], answer: number, difficulty: Difficulty, rng: () => number) {
  const n = values.length;
  if (difficulty === "easy") {
    const peak = Math.max(...values.filter((_, i) => i !== answer));
    values[answer] = Math.round(peak * 1.78);
    return;
  }
  const local = neighbors(n, answer, difficulty === "hard" ? 1 : 2);
  const base = Math.round(local.reduce((sum, i) => sum + values[i], 0) / Math.max(local.length, 1));
  if (difficulty === "hard") {
    const gap = Math.max(3, Math.round(base * 0.08));
    for (const i of local) values[i] = base;
    values[answer] = base + gap;
    capExcept(values, answer, values[answer] - 1, "spike");
    return;
  }
  for (const i of local) values[i] = base + (rng() < 0.5 ? 0 : 1);
  values[answer] = base + 2;
  capExcept(values, answer, values[answer] - 1, "spike");
}

function sealDip(values: number[], answer: number, difficulty: Difficulty, rng: () => number) {
  const n = values.length;
  if (difficulty === "easy") {
    const floor = Math.min(...values.filter((_, i) => i !== answer));
    values[answer] = Math.max(3, Math.round(floor * 0.38));
    return;
  }
  const local = neighbors(n, answer, difficulty === "hard" ? 1 : 2);
  const base = Math.round(local.reduce((sum, i) => sum + values[i], 0) / Math.max(local.length, 1));
  if (difficulty === "hard") {
    const gap = Math.max(3, Math.round(base * 0.08));
    for (const i of local) values[i] = base;
    values[answer] = Math.max(3, base - gap);
    capExcept(values, answer, values[answer] + 1, "dip");
    return;
  }
  for (const i of local) values[i] = base - (rng() < 0.5 ? 0 : 1);
  values[answer] = Math.max(3, base - 2);
  capExcept(values, answer, values[answer] + 1, "dip");
}

function sealBreak(values: number[], answer: number, step: number, difficulty: Difficulty) {
  for (let i = answer; i < values.length; i += 1) {
    values[i] = Math.round(values[i] + step);
  }
  if (difficulty !== "brutal") return;
  const before = values[Math.max(0, answer - 1)] ?? values[answer];
  const after = values[answer];
  if (Math.abs(after - before) > Math.max(2, Math.round(Math.abs(before) * 0.06))) {
    const target = before + (after > before ? 1 : -1) * Math.max(1, Math.round(Math.abs(before) * 0.04));
    const delta = target - values[answer];
    for (let i = answer; i < values.length; i += 1) values[i] = Math.round(values[i] + delta);
  }
}

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
    const n = Math.round(along(difficulty, round, total, [5, 7], [9, 12], [14, 18]));
    const labels = weekLabels(n);
    const start = 42 + round * 6 + Math.round(rng() * 10);
    const slope =
      spec.kind === "break"
        ? along(difficulty, round, total, [0.15, 0.1], [0.28, 0.18], [0.22, 0.14])
        : along(difficulty, round, total, [0.35, 0.55], [0.55, 0.85], [0.35, 0.5]);
    const noise = along(difficulty, round, total, [0.55, 1.1], [2.2, 3.4], [3.8, 5.6]);
    const values = Array.from({ length: n }, (_, i) => {
      const trend = start + slope * i;
      return Math.max(4, Math.round(trend + (rng() - 0.5) * 2 * noise));
    });
    const edge = difficulty === "easy" ? 1 : 2;
    const answer = edge + Math.floor(rng() * Math.max(1, n - edge * 2));
    if (spec.kind === "spike") {
      sealSpike(values, answer, difficulty, rng);
    } else if (spec.kind === "dip") {
      sealDip(values, answer, difficulty, rng);
    } else {
      const step = Math.round(
        start * along(difficulty, round, total, [0.48, 0.36], [0.12, 0.08], [0.045, 0.028])
      );
      sealBreak(values, answer, step, difficulty);
    }
    if (difficulty === "brutal") {
      const others = values.filter((_, i) => i !== answer);
      const lo = Math.min(...others);
      const hi = Math.max(...others);
      const spread = hi - lo;
      const cap = Math.max(4, Math.round(start * 0.06));
      if (spread > cap) {
        const mid = (lo + hi) / 2;
        for (let i = 0; i < values.length; i += 1) {
          if (i === answer) continue;
          values[i] = Math.round(mid + ((values[i] - mid) * cap) / spread);
        }
        if (spec.kind === "spike") {
          values[answer] = Math.max(...values.filter((_, i) => i !== answer)) + 1;
        } else if (spec.kind === "dip") {
          values[answer] = Math.max(3, Math.min(...values.filter((_, i) => i !== answer)) - 1);
        }
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
  const question =
    difficulty === "easy" && round
      ? round.kind === "spike"
        ? "Où est le pic ?"
        : round.kind === "dip"
          ? "Où est le creux ?"
          : "Où la série change-t-elle de régime ?"
      : "Où est l’intrus ?";
  const helpers = {
    showValues: difficulty === "easy",
    showMean: difficulty === "easy",
  };

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
      <RoundHeader context={round.title} question={question} />
      <div className="mt-8">
        <BarChart
          values={round.values}
          labels={round.labels}
          selected={picked}
          revealed={revealed ? round.answer : null}
          onSelect={pick}
          disabled={revealed}
          unit={round.unit}
          kind={round.kind}
          showValues={helpers.showValues}
          showMean={helpers.showMean}
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
          Unité : {round.unit}. {difficulty === "easy" ? "Touche une barre." : "Compare barre à barre."}
        </p>
      )}
    </GameShell>
  );
}
