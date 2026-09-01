// @ts-nocheck
import type { GameSlug } from "@s/lib/games";
import { useI18n } from "@s/lib/i18n";
import type { Locale } from "@s/lib/locale";
import { scoreLine } from "@s/lib/feedback";
import { PLAY_ROUNDS, PLAY_UI, type RoundNarration } from "@s/lib/play-copy";

export function overlayRound<T extends { id?: string }>(
  slug: GameSlug,
  locale: Locale,
  round: T | null | undefined
): T & RoundNarration {
  if (!round) return round as T & RoundNarration;
  const pack = PLAY_ROUNDS[locale]?.[slug]?.[round.id ?? ""];
  if (!pack) return round as T & RoundNarration;
  const next = { ...round, ...pack } as T & RoundNarration;
  if (!pack.title && pack.context && "title" in (round as object)) {
    (next as { title: string }).title = pack.context;
  }
  if (pack.events && Array.isArray((round as { events?: unknown }).events)) {
    next.events = (round as { events: Array<Record<string, unknown>> }).events.map((ev, i) => ({
      ...ev,
      ...(pack.events?.[i] ?? {}),
    }));
  }
  if (pack.steps) next.steps = pack.steps;
  if (pack.zones) next.zones = pack.zones;
  if (pack.leftName && (round as { left?: { name: string } }).left) {
    (next as { left: { name: string } }).left = {
      ...(round as { left: { name: string } }).left,
      name: pack.leftName,
    };
  }
  if (pack.rightName && (round as { right?: { name: string } }).right) {
    (next as { right: { name: string } }).right = {
      ...(round as { right: { name: string } }).right,
      name: pack.rightName,
    };
  }
  return next;
}

export function usePlay(slug: GameSlug) {
  const { t, locale } = useI18n();
  const ui = PLAY_UI[locale];
  return {
    locale,
    t,
    ui,
    title: t.games[slug].name,
    how: t.games[slug].how,
    scoreLine: (score: number, max: number) => scoreLine(score, max, locale),
    nextLabel: (index: number, total: number) => (index + 1 >= total ? t.shell.score : t.shell.next),
    punch: (ok: boolean) => (ok ? ui.punch[slug].ok : ui.punch[slug].miss),
    punchMid: ui.punchMid,
    round: (id: string) => PLAY_ROUNDS[locale]?.[slug]?.[id],
    overlay: <T extends { id?: string }>(round: T | null | undefined) => overlayRound(slug, locale, round),
  };
}
