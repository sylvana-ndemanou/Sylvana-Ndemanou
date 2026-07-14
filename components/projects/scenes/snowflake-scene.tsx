"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";

// TEMP(testing): force motion + loop so the run can be recorded even in
// reduced-motion browsers. Set BOTH back to false before committing.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 720;
const H = 405;
const px = (v: number): string => `${(v / W) * 100}%`;
const py = (v: number): string => `${(v / H) * 100}%`;

const ROWS: [string, string, string][] = [
  ["West", "61,204", "$1.51M"],
  ["North", "48,120", "$1.24M"],
  ["South", "39,540", "$0.98M"],
  ["East", "33,880", "$0.82M"],
  ["Central", "27,455", "$0.66M"],
  ["Nordics", "18,900", "$0.44M"],
];

const RUN_BTN: [number, number] = [670, 19];
const START: [number, number] = [690, 360];

export function SnowflakeScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.45 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState(reduce ? ROWS.length : 0);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setRows(0);
      setDone(false);
      setPressed(false);
      setRunning(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(450);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(750);
      if (!alive) return;
      setPressed(true);
      await sleep(160);
      if (!alive) return;
      setPressed(false);
      setRunning(true);
      await sleep(750);
      if (!alive) return;
      setRunning(false);
      for (let i = 0; i < ROWS.length; i++) {
        if (!alive) return;
        setRows(i + 1);
        await sleep(230);
      }
      if (!alive) return;
      setDone(true);
      await sleep(1500);
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
  const kw = { color: "#2D7FF9" };
  const str = { color: "#C2410C" };
  const txt = { color: "#1F2937" };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
      style={{ maxWidth: 760, aspectRatio: `${W} / ${H}` }}
    >
      {/* Left nav */}
      <div className="absolute inset-y-0 left-0 flex flex-col items-center gap-3 border-r border-black/8 bg-[#f6f8fa] py-3" style={{ width: px(52) }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M11 2 L11 20 M3.5 6.2 L18.5 15.8 M3.5 15.8 L18.5 6.2" stroke="#29B5E8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-4 w-4 rounded bg-black/10" />
        ))}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 flex items-center justify-between border-b border-black/8 bg-white px-4" style={{ left: px(52), right: 0, height: py(38) }}>
        <span className="text-[12px] font-semibold text-[#3C4450]">orders_by_region.sql</span>
        <div
          className="flex items-center gap-1.5 rounded-lg bg-[#2D7FF9] px-3 py-1.5 text-[12px] font-semibold text-white"
          style={{ transform: pressed ? "scale(0.9)" : "scale(1)", transition: "transform 0.14s ease" }}
        >
          ▶ Run
        </div>
      </div>

      {/* SQL editor */}
      <div className="absolute font-mono text-[12px] leading-[20px]" style={{ left: px(70), top: py(50) }}>
        <div><span style={kw}>select</span> <span style={txt}>region, count(*) </span><span style={kw}>as</span><span style={txt}> orders,</span></div>
        <div><span style={txt}>       sum(amount) </span><span style={kw}>as</span><span style={txt}> revenue</span></div>
        <div><span style={kw}>from</span> <span style={txt}>sales.orders</span></div>
        <div><span style={kw}>where</span> <span style={txt}>order_date &gt;= </span><span style={str}>&apos;2026-01-01&apos;</span></div>
        <div><span style={kw}>group by</span> <span style={txt}>region </span><span style={kw}>order by</span><span style={txt}> revenue </span><span style={kw}>desc</span><span style={txt}>;</span></div>
      </div>

      {/* Results */}
      <div className="absolute border-t border-black/10 bg-[#fbfcfd]" style={{ left: px(52), right: 0, top: py(168), bottom: 0 }}>
        <div className="flex items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#8A93A0]">
          <span>Results</span>
          {running ? <span className="text-[#2D7FF9]">running…</span> : null}
          {done ? <span className="text-[#2f8f47]">✓ {ROWS.length} rows · 1.9s</span> : null}
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-y border-black/8 bg-[#f3f5f7] px-6 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A93A0]">
          <span>Region</span><span>Orders</span><span>Revenue</span>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-6 text-[12px]"
            style={{
              height: py(26),
              alignItems: "center",
              backgroundColor: i % 2 ? "#f6f8fa" : "transparent",
              opacity: i < rows ? 1 : 0,
              transform: i < rows ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            <span className="font-medium text-[#1F2937]">{r[0]}</span>
            <span className="text-[#3C4450]">{r[1]}</span>
            <span className="font-medium text-[#2E7D6B]">{r[2]}</span>
          </div>
        ))}
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
        <ToolCursor name="Sylvana" />
      </div>
    </div>
  );
}
