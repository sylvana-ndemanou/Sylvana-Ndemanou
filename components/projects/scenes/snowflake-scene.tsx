"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 980;
const H = 600;

const ROWS: [string, string, string][] = [
  ["West", "61,204", "$1.51M"],
  ["North", "48,120", "$1.24M"],
  ["South", "39,540", "$0.98M"],
  ["East", "33,880", "$0.82M"],
  ["Central", "27,455", "$0.66M"],
  ["Nordics", "18,900", "$0.44M"],
];

const RUN_BTN: [number, number] = [910, 24];
const START: [number, number] = [930, 540];

export function SnowflakeScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

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
      await sleep(700);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(1100);
      if (!alive) return;
      setPressed(true);
      await sleep(240);
      if (!alive) return;
      setPressed(false);
      setRunning(true);
      await sleep(1000);
      if (!alive) return;
      setRunning(false);
      for (let i = 0; i < ROWS.length; i++) {
        if (!alive) return;
        setRows(i + 1);
        await sleep(340);
      }
      if (!alive) return;
      setDone(true);
      await sleep(2400);
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
  const kw = { color: "#2D7FF9" };
  const str = { color: "#C2410C" };
  const txt = { color: "#1F2937" };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
      style={{ height: H * scale }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Left nav */}
        <div className="absolute inset-y-0 left-0 flex flex-col items-center gap-4 border-r border-black/8 bg-[#f6f8fa] py-4" style={{ width: 64 }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path d="M13 3 L13 23 M4.5 7.5 L21.5 18.5 M4.5 18.5 L21.5 7.5" stroke="#29B5E8" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-5 w-5 rounded bg-black/10" />
          ))}
        </div>

        {/* Top bar */}
        <div className="absolute top-0 flex items-center justify-between border-b border-black/8 bg-white px-5" style={{ left: 64, right: 0, height: 48 }}>
          <span className="text-[14px] font-semibold text-[#3C4450]">orders_by_region.sql</span>
          <div
            className="flex items-center gap-2 rounded-lg bg-[#2D7FF9] px-4 py-2 text-[14px] font-semibold text-white"
            style={{ transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}
          >
            ▶ Run
          </div>
        </div>

        {/* SQL editor */}
        <div className="absolute font-mono text-[14px] leading-[26px]" style={{ left: 92, top: 66 }}>
          <div><span style={kw}>select</span> <span style={txt}>region, count(*) </span><span style={kw}>as</span><span style={txt}> orders,</span></div>
          <div><span style={txt}>       sum(amount) </span><span style={kw}>as</span><span style={txt}> revenue</span></div>
          <div><span style={kw}>from</span> <span style={txt}>sales.orders</span></div>
          <div><span style={kw}>where</span> <span style={txt}>order_date &gt;= </span><span style={str}>&apos;2026-01-01&apos;</span></div>
          <div><span style={kw}>group by</span> <span style={txt}>region </span><span style={kw}>order by</span><span style={txt}> revenue </span><span style={kw}>desc</span><span style={txt}>;</span></div>
        </div>

        {/* Results */}
        <div className="absolute border-t border-black/10 bg-[#fbfcfd]" style={{ left: 64, right: 0, top: 224, bottom: 0 }}>
          <div className="flex items-center gap-3 px-6 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#8A93A0]">
            <span>Results</span>
            {running ? <span className="text-[#2D7FF9]">running…</span> : null}
            {done ? <span className="text-[#2f8f47]">✓ {ROWS.length} rows · 1.9s</span> : null}
          </div>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 border-y border-black/8 bg-[#f3f5f7] px-8 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-[#8A93A0]">
            <span>Region</span><span>Orders</span><span>Revenue</span>
          </div>
          {ROWS.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-8 text-[14px]"
              style={{
                height: 42,
                alignItems: "center",
                backgroundColor: i % 2 ? "#f6f8fa" : "transparent",
                opacity: i < rows ? 1 : 0,
                transform: i < rows ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
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
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-4px, -3px)",
            opacity: cursorOn ? 1 : 0,
            transition: `left 0.95s ${EASE}, top 0.95s ${EASE}, opacity 0.45s ease`,
          }}
        >
          <ToolCursor name="Sylvana" />
        </div>
      </div>
    </div>
  );
}
