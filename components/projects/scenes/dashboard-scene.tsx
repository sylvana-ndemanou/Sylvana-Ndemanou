"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";

// TEMP(testing): force motion + loop so the build can be recorded even in
// reduced-motion browsers. Set BOTH back to false before committing.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 720;
const H = 405;
const px = (v: number): string => `${(v / W) * 100}%`;
const py = (v: number): string => `${(v / H) * 100}%`;

const KPIS: [string, string, string, boolean][] = [
  ["Transactions", "168", "+3.4%", true],
  ["Clients", "164", "+1.8%", true],
  ["Revenue", "$14,939", "+9.7%", true],
  ["Avg value", "$91.09", "-2.1%", false],
];

// Area/line chart geometry (local viewBox 440 x 190).
const CW = 440;
const CH = 190;
const VALS = [30, 54, 44, 70, 50, 80, 60];
const PL = 34;
const PR = 420;
const PT = 26;
const PB = 150;
const PTS = VALS.map((v, i) => [
  +(PL + (i * (PR - PL)) / (VALS.length - 1)).toFixed(1),
  +(PB - (v / 100) * (PB - PT)).toFixed(1),
] as [number, number]);
const LINE = PTS.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
const AREA = `M ${PL} ${PB} ${PTS.map((p) => `L ${p[0]} ${p[1]}`).join(" ")} L ${PR} ${PB} Z`;

const APPLY_BTN: [number, number] = [648, 20];
const START: [number, number] = [690, 360];

export function DashboardScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.45 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [kpis, setKpis] = useState(reduce ? KPIS.length : 0);
  const [chart, setChart] = useState(reduce);
  const [donut, setDonut] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setKpis(0);
      setChart(false);
      setDonut(false);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(450);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: APPLY_BTN[0], y: APPLY_BTN[1] });
      await sleep(720);
      if (!alive) return;
      setPressed(true);
      await sleep(160);
      if (!alive) return;
      setPressed(false);
      for (let i = 0; i < KPIS.length; i++) {
        if (!alive) return;
        setKpis(i + 1);
        await sleep(200);
      }
      await sleep(150);
      if (!alive) return;
      setCursor({ x: 210, y: 250 });
      setChart(true);
      await sleep(700);
      if (!alive) return;
      setCursor({ x: 560, y: 250 });
      setDonut(true);
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

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm"
      style={{ maxWidth: 760, aspectRatio: `${W} / ${H}`, backgroundColor: "#eef1f0" }}
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-black/8 bg-white px-4" style={{ height: py(40) }}>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-[#3AA76A]" />
          <span className="text-[13px] font-semibold text-[#2A3138]">Analytics</span>
          <span className="ml-2 rounded-md bg-[#1F7A4D] px-2 py-0.5 text-[10px] font-semibold text-white">Transactions</span>
        </div>
        <div
          className="rounded-lg bg-[#1F7A4D] px-3 py-1.5 text-[12px] font-semibold text-white"
          style={{ transform: pressed ? "scale(0.9)" : "scale(1)", transition: "transform 0.14s ease" }}
        >
          Apply filters
        </div>
      </div>

      {/* KPI row */}
      {KPIS.map((k, i) => {
        const on = i < kpis;
        return (
          <div
            key={i}
            className="absolute rounded-xl border border-black/8 bg-white px-3 py-2 shadow-sm"
            style={{
              left: px(16 + i * 176),
              top: py(52),
              width: px(160),
              height: py(66),
              opacity: on ? 1 : 0,
              transform: on ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div className="text-[10px] font-medium text-[#7A8891]">{k[0]}</div>
            <div className="mt-0.5 text-[18px] font-semibold text-[#2E7D6B]">{k[1]}</div>
            <div className="text-[10px] font-semibold" style={{ color: k[3] ? "#2FA35F" : "#D6553F" }}>
              {k[3] ? "▲" : "▼"} {k[2].replace(/[+-]/, "")}
            </div>
          </div>
        );
      })}

      {/* Area/line chart card */}
      <div className="absolute rounded-xl border border-black/8 bg-white p-3 shadow-sm" style={{ left: px(16), top: py(130), width: px(452), bottom: py(16) }}>
        <div className="text-[12px] font-semibold text-[#2A3138]">Revenue by date</div>
        <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" className="mt-1 h-[calc(100%-24px)] w-full" aria-hidden="true">
          <path
            d={AREA}
            fill="#3AA76A"
            style={{ opacity: chart ? 0.15 : 0, transition: "opacity 0.6s ease 0.3s" }}
          />
          <path
            d={LINE}
            fill="none"
            stroke="#2FA35F"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: chart ? 0 : 1, transition: "stroke-dashoffset 0.9s ease-in-out" }}
          />
        </svg>
      </div>

      {/* Donut card */}
      <div className="absolute rounded-xl border border-black/8 bg-white p-3 shadow-sm" style={{ left: px(484), top: py(130), width: px(220), bottom: py(16) }}>
        <div className="text-[12px] font-semibold text-[#2A3138]">On-target rate</div>
        <div className="relative mt-1 flex h-[calc(100%-24px)] items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="46" fill="none" stroke="#E6F2EB" strokeWidth="16" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="#1F7A4D"
              strokeWidth="16"
              strokeLinecap="round"
              pathLength={1}
              transform="rotate(-90 60 60)"
              style={{ strokeDasharray: 1, strokeDashoffset: donut ? 0.32 : 1, transition: "stroke-dashoffset 0.9s ease-in-out" }}
            />
          </svg>
          <span className="absolute text-[18px] font-semibold text-[#1F7A4D]" style={{ opacity: donut ? 1 : 0, transition: "opacity 0.4s ease 0.4s" }}>
            68%
          </span>
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
        <ToolCursor name="Sylvana" />
      </div>
    </div>
  );
}
