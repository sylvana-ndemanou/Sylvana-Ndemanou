// @ts-nocheck
import { MAX_SCORE } from "@s/lib/games";
import type { Locale } from "@s/lib/locale";

const LINES: Record<Locale, [number, string][]> = {
  fr: [
    [1, "Score parfait. On t’invite au QBR. Ou on te craint."],
    [0.86, "L’œil est chaud. Le comité survivrait."],
    [0.7, "Solide. Un CFO te laisserait parler."],
    [0.5, "Pas mal. Les vanity metrics te piègent encore un peu."],
    [0.3, "On reprend. Les dashboards mentent — c’est pour ça que tu es là."],
    [0, "Les chiffres ont gagné ce round. Reviens, l’œil ça se musclait."],
  ],
  en: [
    [1, "Perfect score. You’re invited to the QBR. Or feared."],
    [0.86, "The eye is hot. The committee would survive."],
    [0.7, "Solid. A CFO would let you talk."],
    [0.5, "Not bad. Vanity metrics still trip you a little."],
    [0.3, "We reset. Dashboards lie — that’s why you’re here."],
    [0, "The numbers won this run. Come back, the eye is a muscle."],
  ],
};

export function scoreLine(score: number, max = MAX_SCORE, locale: Locale = "fr"): string {
  const ratio = max === 0 ? 0 : score / max;
  const table = LINES[locale] ?? LINES.fr;
  const hit = table.find(([bar]) => ratio >= bar);
  return hit?.[1] ?? table[table.length - 1][1];
}

export function roundTone(points: number, max = 10): "ok" | "mid" | "miss" {
  if (points >= max) return "ok";
  if (points >= max * 0.5) return "mid";
  return "miss";
}
