// @ts-nocheck
import { MAX_SCORE } from "@s/lib/games";

export function scoreLine(score: number, max = MAX_SCORE): string {
  const ratio = max === 0 ? 0 : score / max;
  if (ratio >= 1) return "Score parfait. On t'invite au QBR. Ou on te craint.";
  if (ratio >= 0.86) return "L'œil est chaud. Le comité survivrait.";
  if (ratio >= 0.7) return "Solide. Un CFO te laisserait parler.";
  if (ratio >= 0.5) return "Pas mal. Les vanity metrics te piègent encore un peu.";
  if (ratio >= 0.3) return "On reprend. Les dashboards mentent — c'est pour ça que tu es là.";
  return "Les chiffres ont gagné ce round. Reviens, l'œil ça se musclait.";
}

export function roundTone(points: number, max = 10): "ok" | "mid" | "miss" {
  if (points >= max) return "ok";
  if (points >= max * 0.5) return "mid";
  return "miss";
}
