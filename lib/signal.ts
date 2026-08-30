const DEFAULT_SIGNAL_ORIGIN = "https://sylvana-signal.vercel.app";
const LOCAL_SIGNAL_ORIGIN = "http://127.0.0.1:4567";

function resolveSignalOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SIGNAL_URL || "").replace(/\/$/, "");
  if (!raw) {
    return process.env.NODE_ENV === "production"
      ? DEFAULT_SIGNAL_ORIGIN
      : LOCAL_SIGNAL_ORIGIN;
  }

  try {
    const host = new URL(raw).hostname;
    // The portfolio URL must not iframe itself.
    if (host === "sylvanandemanou.vercel.app") {
      return DEFAULT_SIGNAL_ORIGIN;
    }
  } catch {
    return DEFAULT_SIGNAL_ORIGIN;
  }

  return raw;
}

export const SIGNAL_ORIGIN = resolveSignalOrigin();

export const SIGNAL_EMBED_URL =
  process.env.NEXT_PUBLIC_SIGNAL_EMBED_PATH ?? `${SIGNAL_ORIGIN}/`;
