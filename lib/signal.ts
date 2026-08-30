const fallbackOrigin =
  process.env.NODE_ENV === "production" ? "" : "http://127.0.0.1:4567";

export const SIGNAL_ORIGIN = (
  process.env.NEXT_PUBLIC_SIGNAL_URL || fallbackOrigin
).replace(/\/$/, "");

export const SIGNAL_EMBED_URL =
  process.env.NEXT_PUBLIC_SIGNAL_EMBED_PATH ??
  (SIGNAL_ORIGIN ? `${SIGNAL_ORIGIN}/` : "");
