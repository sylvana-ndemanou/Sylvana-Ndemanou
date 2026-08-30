const MUTE_KEY = "signal-audio-muted";

export type Cue =
  | "tap"
  | "hover"
  | "ok"
  | "mid"
  | "miss"
  | "start"
  | "score"
  | "grain"
  | "tick"
  | "credit"
  | "rewind"
  | "prune"
  | "copy"
  | "beat"
  | "lift"
  | "drop"
  | "dock"
  | "swap";

let ctx: AudioContext | null = null;
let muted = false;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeMute(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function readMuted() {
  hydrateMute();
  return muted;
}

export function hydrateMute() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    muted = window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    muted = false;
  }
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit();
}

export function toggleMute() {
  setMuted(!muted);
}

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

function noiseBuffer(audio: AudioContext, seconds: number) {
  const length = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playNoise(
  audio: AudioContext,
  time: number,
  {
    duration,
    freq,
    q,
    gain,
    type = "bandpass",
  }: { duration: number; freq: number; q: number; gain: number; type?: BiquadFilterType }
) {
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, duration);
  const filter = audio.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = audio.createGain();
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start(time);
  src.stop(time + duration + 0.02);
}

function playTone(
  audio: AudioContext,
  time: number,
  {
    freq,
    duration,
    gain,
    slide,
    type = "triangle",
  }: { freq: number; duration: number; gain: number; slide?: number; type?: OscillatorType }
) {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slide), time + duration);
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(time);
  osc.stop(time + duration + 0.03);
}

export function play(cue: Cue) {
  hydrateMute();
  if (muted) return;
  const audio = getCtx();
  if (!audio) return;
  const t = audio.currentTime + 0.001;

  switch (cue) {
    case "tap":
      playNoise(audio, t, { duration: 0.03, freq: 1800, q: 8, gain: 0.045 });
      playTone(audio, t, { freq: 210, duration: 0.04, gain: 0.03, type: "sine" });
      break;
    case "hover":
      playNoise(audio, t, { duration: 0.022, freq: 2400, q: 9, gain: 0.038 });
      playTone(audio, t, { freq: 880, duration: 0.035, gain: 0.028, type: "sine" });
      break;
    case "ok":
      playTone(audio, t, { freq: 392, duration: 0.11, gain: 0.06, type: "triangle" });
      playTone(audio, t + 0.07, { freq: 523.25, duration: 0.16, gain: 0.055, type: "triangle" });
      playNoise(audio, t, { duration: 0.05, freq: 900, q: 3, gain: 0.02 });
      break;
    case "mid":
      playTone(audio, t, { freq: 349, duration: 0.14, gain: 0.05, type: "triangle" });
      playNoise(audio, t, { duration: 0.06, freq: 700, q: 2.4, gain: 0.018 });
      break;
    case "miss":
      playNoise(audio, t, { duration: 0.09, freq: 180, q: 1.2, gain: 0.06, type: "lowpass" });
      playTone(audio, t, { freq: 164, duration: 0.18, gain: 0.05, slide: 92, type: "sine" });
      break;
    case "start":
      playNoise(audio, t, { duration: 0.22, freq: 420, q: 2, gain: 0.05 });
      playTone(audio, t + 0.04, { freq: 196, duration: 0.2, gain: 0.04, slide: 330, type: "sine" });
      break;
    case "score":
      playTone(audio, t, { freq: 261.6, duration: 0.18, gain: 0.045, type: "triangle" });
      playTone(audio, t + 0.1, { freq: 329.6, duration: 0.18, gain: 0.04, type: "triangle" });
      playTone(audio, t + 0.2, { freq: 392, duration: 0.28, gain: 0.05, type: "triangle" });
      playNoise(audio, t + 0.18, { duration: 0.12, freq: 2400, q: 1.4, gain: 0.015 });
      break;
    case "grain":
      playNoise(audio, t, { duration: 0.018, freq: 3200, q: 10, gain: 0.012 });
      break;
    case "tick":
      playTone(audio, t, { freq: 880, duration: 0.04, gain: 0.03, type: "square" });
      break;
    case "credit":
      playTone(audio, t, { freq: 196, duration: 0.07, gain: 0.04, type: "sine" });
      playNoise(audio, t, { duration: 0.04, freq: 240, q: 2, gain: 0.02, type: "lowpass" });
      break;
    case "rewind":
      playTone(audio, t, { freq: 420, duration: 0.28, gain: 0.045, slide: 140, type: "sawtooth" });
      playNoise(audio, t, { duration: 0.22, freq: 900, q: 1.2, gain: 0.03 });
      break;
    case "prune":
      playTone(audio, t, { freq: 523, duration: 0.05, gain: 0.028, type: "sine" });
      break;
    case "copy":
      playNoise(audio, t, { duration: 0.35, freq: 700, q: 1.8, gain: 0.04 });
      playTone(audio, t, { freq: 180, duration: 0.4, gain: 0.03, slide: 90, type: "sine" });
      break;
    case "beat":
      playNoise(audio, t, { duration: 0.04, freq: 80, q: 0.8, gain: 0.07, type: "lowpass" });
      playTone(audio, t, { freq: 110, duration: 0.08, gain: 0.05, type: "sine" });
      break;
    case "lift":
      playNoise(audio, t, { duration: 0.04, freq: 1400, q: 4, gain: 0.04 });
      playTone(audio, t, { freq: 220, duration: 0.09, gain: 0.04, slide: 420, type: "sine" });
      break;
    case "drop":
      playNoise(audio, t, { duration: 0.055, freq: 420, q: 2.2, gain: 0.07, type: "lowpass" });
      playTone(audio, t, { freq: 140, duration: 0.12, gain: 0.07, type: "sine" });
      playTone(audio, t + 0.018, { freq: 330, duration: 0.08, gain: 0.04, type: "triangle" });
      break;
    case "dock":
      playNoise(audio, t, { duration: 0.045, freq: 900, q: 6, gain: 0.05 });
      playTone(audio, t, { freq: 196, duration: 0.1, gain: 0.055, type: "sine" });
      playTone(audio, t + 0.05, { freq: 294, duration: 0.14, gain: 0.05, type: "triangle" });
      playTone(audio, t + 0.09, { freq: 392, duration: 0.16, gain: 0.04, type: "triangle" });
      break;
    case "swap":
      playNoise(audio, t, { duration: 0.04, freq: 700, q: 3, gain: 0.04 });
      playTone(audio, t, { freq: 247, duration: 0.07, gain: 0.045, type: "sine" });
      playTone(audio, t + 0.06, { freq: 185, duration: 0.09, gain: 0.04, type: "sine" });
      break;
  }
}

export const playCue = play;
