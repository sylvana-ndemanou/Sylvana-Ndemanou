/**
 * Signal is Sylvana's BI product (live at vynio.io). It is a first-class
 * portfolio surface — a nav tab, not a Projects case-study card.
 *
 * Brand tokens come from the Signal / Vynio kit (teal pulse mark).
 */
export const SIGNAL_TEAL = "#00E5CC";
export const SIGNAL_TEAL_PRINT = "#00917A";
export const SIGNAL_INK = "#080808";

export const SIGNAL_FEATURE_KEYS = [
  "templates",
  "profiler",
  "privacy",
  "field",
] as const;

export type SignalFeatureKey = (typeof SIGNAL_FEATURE_KEYS)[number];
