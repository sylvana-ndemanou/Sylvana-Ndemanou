"use client";

import { Sparkles } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";

// TEMP(testing): force motion + loop so the exchange can be recorded even in
// reduced-motion browsers. Set BOTH back to false before committing.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 720;
const H = 405;
const px = (v: number): string => `${(v / W) * 100}%`;
const py = (v: number): string => `${(v / H) * 100}%`;

const QUESTION = "Which regions beat target this quarter?";
const ANSWER =
  "3 of 6 regions beat target: West (+21%), North (+8%) and Central (+3%). Total revenue is $4.9M — up 9.7% year over year.";
const Q_WORDS = QUESTION.split(" ");
const A_WORDS = ANSWER.split(" ");

const INPUT_POS: [number, number] = [320, 372];
const SEND_BTN: [number, number] = [688, 372];
const START: [number, number] = [690, 330];

export function AppliedAiScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.45 });

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
      await sleep(450);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: INPUT_POS[0], y: INPUT_POS[1] });
      await sleep(650);
      for (let i = 0; i < Q_WORDS.length; i++) {
        if (!alive) return;
        setQN(i + 1);
        await sleep(120);
      }
      await sleep(150);
      if (!alive) return;
      setCursor({ x: SEND_BTN[0], y: SEND_BTN[1] });
      await sleep(520);
      if (!alive) return;
      setPressed(true);
      await sleep(160);
      if (!alive) return;
      setPressed(false);
      setSent(true);
      setThinking(true);
      await sleep(850);
      if (!alive) return;
      setThinking(false);
      for (let i = 0; i < A_WORDS.length; i++) {
        if (!alive) return;
        setAN(i + 1);
        await sleep(70);
      }
      await sleep(1400);
      if (!alive) return;
      setCursorOn(false);
    };

    (async () => {
      do {
        await runOnce();
        if (DEMO_LOOP && alive) await sleep(1600);
      } while (DEMO_LOOP && alive);
    })();

    return () => {
      alive = false;
    };
  }, [inView, reduce]);

  const EASE = "cubic-bezier(0.5, 0, 0.2, 1)";
  const typed = Q_WORDS.slice(0, qN).join(" ");
  const answer = A_WORDS.slice(0, aN).join(" ");

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
      style={{ maxWidth: 760, aspectRatio: `${W} / ${H}` }}
    >
      {/* Header */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 border-b border-black/8 bg-white px-4" style={{ height: py(42) }}>
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7C6BEF]">
          <Sparkles className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </span>
        <span className="text-[13px] font-semibold text-[#2A3138]">Data Assistant</span>
        <span className="text-[11px] text-[#8A93A0]">· grounded on your warehouse</span>
      </div>

      {/* Messages */}
      <div className="absolute inset-x-0 flex flex-col gap-3 px-5" style={{ top: py(56), bottom: py(74) }}>
        {/* User bubble */}
        <div className="flex justify-end" style={{ opacity: sent ? 1 : 0, transition: "opacity 0.25s ease" }}>
          <div className="max-w-[70%] rounded-2xl rounded-br-sm bg-[#7C6BEF] px-3.5 py-2 text-[12.5px] font-medium text-white">
            {QUESTION}
          </div>
        </div>
        {/* Assistant bubble */}
        {(thinking || aN > 0) && (
          <div className="flex justify-start">
            <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-[#F1F1F4] px-3.5 py-2 text-[12.5px] leading-[1.5] text-[#2A3138]">
              {thinking ? (
                <span className="inline-flex gap-1 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9AA5AD]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9AA5AD] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9AA5AD] [animation-delay:300ms]" />
                </span>
              ) : (
                answer
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-black/8 bg-white px-4" style={{ height: py(74) }}>
        <div className="flex h-9 flex-1 items-center rounded-xl border border-black/10 bg-[#f7f8fa] px-3 text-[12.5px]">
          {!sent && typed.length > 0 ? (
            <span className="text-[#2A3138]">
              {typed}
              <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[#7C6BEF] align-middle" />
            </span>
          ) : (
            <span className="text-[#9AA5AD]">Ask about your data…</span>
          )}
        </div>
        <div
          className="flex h-9 items-center rounded-xl bg-[#7C6BEF] px-4 text-[12.5px] font-semibold text-white"
          style={{ transform: pressed ? "scale(0.9)" : "scale(1)", transition: "transform 0.14s ease" }}
        >
          Send
        </div>
      </div>

      {/* Cursor */}
      <div
        className="pointer-events-none absolute z-30"
        style={{
          left: px(cursor.x),
          top: py(cursor.y),
          transform: "translate(-3px, -2px)",
          opacity: cursorOn ? 1 : 0,
          transition: `left 0.6s ${EASE}, top 0.6s ${EASE}, opacity 0.4s ease`,
        }}
      >
        <ToolCursor name="Sylvana" color="#7C6BEF" />
      </div>
    </div>
  );
}
