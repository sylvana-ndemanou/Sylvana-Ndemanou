export const SIGNAL_ORIGIN =
  process.env.NEXT_PUBLIC_SIGNAL_URL ?? "https://signal-games.vercel.app";

export const SIGNAL_EMBED_URL =
  process.env.NEXT_PUBLIC_SIGNAL_EMBED_PATH ??
  `${SIGNAL_ORIGIN.replace(/\/$/, "")}/`;
