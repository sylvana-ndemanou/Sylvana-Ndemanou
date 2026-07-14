"use client";

import { Sparkles } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";
import { useIsDark } from "@/components/projects/scenes/use-is-dark";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 940;
const H = 560;

const QUESTION = "Which regions beat target this quarter?";
const ANSWER =
  "3 of 6 regions beat target: West (+21%), North (+8%) and Central (+3%). Total revenue is $4.9M — up 9.7% year over year.";
const Q_WORDS = QUESTION.split(" ");
const A_WORDS = ANSWER.split(" ");

const INPUT_POS: [number, number] = [420, 512];
const SEND_BTN: [number, number] = [872, 512];
const START: [number, number] = [900, 470];

export function AppliedAiScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const dark = useIsDark();
  const S = dark
    ? { card: "#1b1c20", ink: "#e2e6ec", muted: "#8b909a", line: "rgba(255,255,255,0.09)", ab: "#26272d", field: "#202127" }
    : { card: "#ffffff", ink: "#2A3138", muted: "#8A93A0", line: "rgba(0,0,0,0.09)", ab: "#F1F1F4", field: "#f7f8fa" };
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [qN, setQN] = useState(reduce ? Q_WORDS.length : 0);
  const [sent, setSent] = useState(reduce);
  const [thinking, setThinking] = useState(false);
  const [aN, setAN] = useState(reduce ? A_WORDS.length : 0);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setQN(0);
      setSent(false);
      setThinking(false);
      setAN(0);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(700);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: INPUT_POS[0], y: INPUT_POS[1] });
      await sleep(900);
      for (let i = 0; i < Q_WORDS.length; i++) {
        if (!alive) return;
        setQN(i + 1);
        await sleep(190);
      }
      await sleep(300);
      if (!alive) return;
      setCursor({ x: SEND_BTN[0], y: SEND_BTN[1] });
      await sleep(800);
      if (!alive) return;
      setPressed(true);
      await sleep(240);
      if (!alive) return;
      setPressed(false);
      setSent(true);
      setThinking(true);
      await sleep(1200);
      if (!alive) return;
      setThinking(false);
      for (let i = 0; i < A_WORDS.length; i++) {
        if (!alive) return;
        setAN(i + 1);
        await sleep(105);
      }
      await sleep(2200);
      if (!alive) return;
      setCursorOn(false);
    };

    (async () => {
      do {
        await runOnce();
        if (DEMO_LOOP && alive) await sleep(1800);
      } while (DEMO_LOOP && alive);
    })();

    return () => {
      alive = false;
    };
  }, [inView, reduce]);

  const EASE = "cubic-bezier(0.33, 0, 0.15, 1)";
  const typed = Q_WORDS.slice(0, qN).join(" ");
  const answer = A_WORDS.slice(0, aN).join(" ");

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border shadow-sm"
      style={{ height: H * scale, backgroundColor: "var(--card)", borderColor: "var(--line)", ["--card"]: S.card, ["--ink"]: S.ink, ["--muted"]: S.muted, ["--line"]: S.line, ["--ab"]: S.ab, ["--field"]: S.field } as CSSProperties}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Header */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-2.5 border-b border-[var(--line)] bg-[var(--card)] px-5" style={{ height: 56 }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C6BEF]">
            <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold text-[var(--ink)]">Data Assistant</span>
          <span className="text-[12.5px] text-[var(--muted)]">· grounded on your warehouse</span>
        </div>

        {/* Messages */}
        <div className="absolute inset-x-0 flex flex-col gap-4 px-7" style={{ top: 76, bottom: 108 }}>
          <div className="flex justify-end" style={{ opacity: sent ? 1 : 0, transition: "opacity 0.3s ease" }}>
            <div className="max-w-[70%] rounded-2xl rounded-br-md bg-[#7C6BEF] px-4 py-3 text-[15px] font-medium text-white">
              {QUESTION}
            </div>
          </div>
          {(thinking || aN > 0) && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[var(--ab)] px-4 py-3 text-[15px] leading-[1.6] text-[var(--ink)]">
                {thinking ? (
                  <span className="inline-flex gap-1.5 py-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA5AD]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA5AD] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA5AD] [animation-delay:300ms]" />
                  </span>
                ) : (
                  answer
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-[var(--line)] bg-[var(--card)] px-6" style={{ height: 96 }}>
          <div className="flex h-12 flex-1 items-center rounded-xl border border-[var(--line)] bg-[var(--field)] px-4 text-[15px]">
            {!sent && typed.length > 0 ? (
              <span className="text-[var(--ink)]">
                {typed}
                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-[#7C6BEF] align-middle" />
              </span>
            ) : (
              <span className="text-[var(--muted)]">Ask about your data…</span>
            )}
          </div>
          <div
            className="flex h-12 items-center rounded-xl bg-[#7C6BEF] px-6 text-[15px] font-semibold text-white"
            style={{ transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}
          >
            Send
          </div>
        </div>

        {/* Cursor */}
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-4px, -3px)",
            opacity: cursorOn ? 1 : 0,
            transition: `left 0.95s ${EASE}, top 0.95s ${EASE}, opacity 0.45s ease`,
          }}
        >
          <ToolCursor name="Sylvana" color="#7C6BEF" />
        </div>
      </div>
    </div>
  );
}
