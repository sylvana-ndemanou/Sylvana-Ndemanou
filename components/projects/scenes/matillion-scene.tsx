"use client";

import {
  Database,
  ShieldCheck,
  Shuffle,
  Table2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";

const W = 720;
const H = 405;
const px = (v: number): string => `${(v / W) * 100}%`;
const py = (v: number): string => `${(v / H) * 100}%`;

type Node = { icon: LucideIcon; label: string; color: string; cx: number; cy: number };

const NODES: Node[] = [
  { icon: Table2, label: "Extract · SAP", color: "#3E7BFB", cx: 132, cy: 150 },
  { icon: Users, label: "Extract · CRM", color: "#3E7BFB", cx: 132, cy: 262 },
  { icon: Shuffle, label: "Transform", color: "#C8A86A", cx: 338, cy: 206 },
  { icon: ShieldCheck, label: "Validate", color: "#7C6BEF", cx: 498, cy: 206 },
  { icon: Database, label: "Load · Snowflake", color: "#29B5E8", cx: 636, cy: 206 },
];

const R = 21;
function curve(x0: number, y0: number, x1: number, y1: number): string {
  const mx = (x0 + x1) / 2;
  return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
}
const CONNS: { d: string; mid: [number, number] }[] = [
  { d: curve(NODES[0]!.cx + R, NODES[0]!.cy, NODES[2]!.cx - R, NODES[2]!.cy - 6), mid: [236, 176] },
  { d: curve(NODES[1]!.cx + R, NODES[1]!.cy, NODES[2]!.cx - R, NODES[2]!.cy + 6), mid: [236, 236] },
  { d: curve(NODES[2]!.cx + R, NODES[2]!.cy, NODES[3]!.cx - R, NODES[3]!.cy), mid: [418, 206] },
  { d: curve(NODES[3]!.cx + R, NODES[3]!.cy, NODES[4]!.cx - R, NODES[4]!.cy), mid: [567, 206] },
];

const RUN_BTN: [number, number] = [648, 21];

export function MatillionScene(): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 655, y: 360 });
  const [cursorOn, setCursorOn] = useState(false);
  const [placed, setPlaced] = useState(reduce ? NODES.length : 0);
  const [drawn, setDrawn] = useState(reduce ? CONNS.length : 0);
  const [pressed, setPressed] = useState(false);
  const [success, setSuccess] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setPlaced(0);
      setDrawn(0);
      setSuccess(false);
      setPressed(false);
      setCursor({ x: 655, y: 360 });
      setCursorOn(false);
      await sleep(500);
      if (!alive) return;
      setCursorOn(true);
      await sleep(300);
      for (let i = 0; i < NODES.length; i++) {
        if (!alive) return;
        setCursor({ x: NODES[i]!.cx, y: NODES[i]!.cy });
        await sleep(560);
        if (!alive) return;
        setPlaced(i + 1);
        await sleep(260);
      }
      for (let i = 0; i < CONNS.length; i++) {
        if (!alive) return;
        setCursor({ x: CONNS[i]!.mid[0], y: CONNS[i]!.mid[1] });
        await sleep(460);
        if (!alive) return;
        setDrawn(i + 1);
        await sleep(520);
      }
      if (!alive) return;
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(620);
      if (!alive) return;
      setPressed(true);
      await sleep(170);
      if (!alive) return;
      setPressed(false);
      setSuccess(true);
      await sleep(1500);
      if (!alive) return;
      setCursorOn(false);
    };

    void runOnce();

    return () => {
      alive = false;
    };
  }, [inView, reduce]);

  const EASE = "cubic-bezier(0.5, 0, 0.2, 1)";

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm"
      style={{ maxWidth: 760, aspectRatio: `${W} / ${H}`, backgroundColor: "#f6f7f9" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          top: py(42),
          backgroundImage: "radial-gradient(circle, rgba(20,30,50,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Toolbar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-black/8 bg-white px-4"
        style={{ height: py(42) }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
          <span className="ml-2 text-[12px] font-semibold text-[#3C4450]">daily_load.orch</span>
        </div>
        <div
          className="rounded-lg bg-[#2D7FF9] px-3.5 py-1.5 text-[12px] font-semibold text-white"
          style={{ transform: pressed ? "scale(0.9)" : "scale(1)", transition: "transform 0.14s ease" }}
        >
          ▶ Validate
        </div>
      </div>

      {/* Connectors */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {CONNS.map((c, i) => (
          <path
            key={i}
            d={c.d}
            fill="none"
            stroke="#3FA45B"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: i < drawn ? 0 : 1,
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        ))}
      </svg>

      {/* Nodes */}
      {NODES.map((n, i) => {
        const Icon = n.icon;
        const on = i < placed;
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              left: px(n.cx - 55),
              top: py(n.cy - 17),
              width: 110,
              opacity: on ? 1 : 0,
              transform: on ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
              transition: "opacity 0.35s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div className="relative">
              <span
                className="absolute -inset-1.5 rounded-[13px] border-2 border-[#34A853]"
                style={{
                  opacity: success ? 1 : 0,
                  transform: success ? "scale(1)" : "scale(0.8)",
                  transition: "opacity 0.45s ease, transform 0.45s ease",
                }}
              />
              <span
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] shadow-sm"
                style={{ backgroundColor: n.color }}
              >
                <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.2} aria-hidden="true" />
              </span>
            </div>
            <span className="mt-1.5 text-center text-[11px] font-medium leading-tight text-[#3C4450]">
              {n.label}
            </span>
          </div>
        );
      })}

      {/* Success toast */}
      <div
        className="absolute left-1/2 flex items-center gap-1.5 rounded-full border border-[#34A853]/30 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#2f8f47] shadow-sm"
        style={{
          bottom: py(16),
          opacity: success ? 1 : 0,
          transform: success ? "translate(-50%, 0)" : "translate(-50%, 8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <span className="h-2 w-2 rounded-full bg-[#34A853]" /> Pipeline validated · 0 errors
      </div>

      {/* Cursor */}
      <div
        className="pointer-events-none absolute z-10"
        style={{
          left: px(cursor.x),
          top: py(cursor.y),
          // Align the arrow tip (≈3,2 in the SVG) to the target coordinate.
          transform: "translate(-3px, -2px)",
          opacity: cursorOn ? 1 : 0,
          transition: `left 0.5s ${EASE}, top 0.5s ${EASE}, opacity 0.4s ease`,
        }}
      >
        <ToolCursor name="Sylvana" />
      </div>
    </div>
  );
}
