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

const KPIS: [string, string, string, boolean][] = [
  ["Transactions", "168", "3.4%", true],
  ["Clients", "164", "1.8%", true],
  ["Revenue", "$14,939", "9.7%", true],
  ["Avg value", "$91.09", "2.1%", false],
];

// Area/line chart geometry (local viewBox 560 x 300).
const CW = 560;
const CH = 300;
const VALS = [30, 54, 44, 70, 50, 80, 60];
const PL = 40;
const PR = 540;
const PT = 30;
const PB = 250;
const PTS = VALS.map((v, i) => [
  +(PL + (i * (PR - PL)) / (VALS.length - 1)).toFixed(1),
  +(PB - (v / 100) * (PB - PT)).toFixed(1),
] as [number, number]);
const LINE = PTS.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
const AREA = `M ${PL} ${PB} ${PTS.map((p) => `L ${p[0]} ${p[1]}`).join(" ")} L ${PR} ${PB} Z`;

const APPLY_BTN: [number, number] = [890, 26];
const START: [number, number] = [930, 540];

export function DashboardScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

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
      await sleep(700);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: APPLY_BTN[0], y: APPLY_BTN[1] });
      await sleep(1050);
      if (!alive) return;
      setPressed(true);
      await sleep(240);
      if (!alive) return;
      setPressed(false);
      for (let i = 0; i < KPIS.length; i++) {
        if (!alive) return;
        setKpis(i + 1);
        await sleep(280);
      }
      await sleep(300);
      if (!alive) return;
      setCursor({ x: 300, y: 360 });
      setChart(true);
      await sleep(1200);
      if (!alive) return;
      setCursor({ x: 800, y: 360 });
      setDonut(true);
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

  const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm"
      style={{ height: H * scale, backgroundColor: "#eef1f0" }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-black/8 bg-white px-5" style={{ height: 52 }}>
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-5 rounded bg-[#3AA76A]" />
            <span className="text-[15px] font-semibold text-[#2A3138]">Analytics</span>
            <span className="ml-2 rounded-md bg-[#1F7A4D] px-2.5 py-1 text-[11px] font-semibold text-white">Transactions</span>
          </div>
          <div
            className="rounded-lg bg-[#1F7A4D] px-4 py-2 text-[14px] font-semibold text-white"
            style={{ transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}
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
              className="absolute rounded-xl border border-black/8 bg-white px-4 py-3 shadow-sm"
              style={{
                left: 24 + i * 236,
                top: 68,
                width: 216,
                height: 92,
                opacity: on ? 1 : 0,
                transform: on ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <div className="text-[12px] font-medium text-[#7A8891]">{k[0]}</div>
              <div className="mt-1 text-[24px] font-semibold text-[#2E7D6B]">{k[1]}</div>
              <div className="text-[12px] font-semibold" style={{ color: k[3] ? "#2FA35F" : "#D6553F" }}>
                {k[3] ? "▲" : "▼"} {k[2]}
              </div>
            </div>
          );
        })}

        {/* Area/line chart card */}
        <div className="absolute rounded-xl border border-black/8 bg-white p-4 shadow-sm" style={{ left: 24, top: 180, width: 596, bottom: 24 }}>
          <div className="text-[14px] font-semibold text-[#2A3138]">Revenue by date</div>
          <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" className="mt-2 h-[calc(100%-28px)] w-full" aria-hidden="true">
            <path d={AREA} fill="#3AA76A" style={{ opacity: chart ? 0.15 : 0, transition: "opacity 0.8s ease 0.4s" }} />
            <path
              d={LINE}
              fill="none"
              stroke="#2FA35F"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: chart ? 0 : 1, transition: "stroke-dashoffset 1.2s ease-in-out" }}
            />
          </svg>
        </div>

        {/* Donut card */}
        <div className="absolute rounded-xl border border-black/8 bg-white p-4 shadow-sm" style={{ left: 640, top: 180, width: 316, bottom: 24 }}>
          <div className="text-[14px] font-semibold text-[#2A3138]">On-target rate</div>
          <div className="relative mt-2 flex h-[calc(100%-28px)] items-center justify-center">
            <svg width="176" height="176" viewBox="0 0 176 176" aria-hidden="true">
              <circle cx="88" cy="88" r="66" fill="none" stroke="#E6F2EB" strokeWidth="22" />
              <circle
                cx="88"
                cy="88"
                r="66"
                fill="none"
                stroke="#1F7A4D"
                strokeWidth="22"
                strokeLinecap="round"
                pathLength={1}
                transform="rotate(-90 88 88)"
                style={{ strokeDasharray: 1, strokeDashoffset: donut ? 0.32 : 1, transition: "stroke-dashoffset 1.1s ease-in-out" }}
              />
            </svg>
            <span className="absolute text-[26px] font-semibold text-[#1F7A4D]" style={{ opacity: donut ? 1 : 0, transition: "opacity 0.5s ease 0.5s" }}>
              68%
            </span>
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
          <ToolCursor name="Sylvana" />
        </div>
      </div>
    </div>
  );
}
