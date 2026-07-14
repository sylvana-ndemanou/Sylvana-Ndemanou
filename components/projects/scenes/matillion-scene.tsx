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

const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 720;
const H = 405;
const TOOLBAR = 40;
const px = (v: number): string => `${(v / W) * 100}%`;
const py = (v: number): string => `${(v / H) * 100}%`;

type Node = {
  icon: LucideIcon;
  label: string;
  color: string;
  cx: number;
  cy: number;
  py: number;
};

// cx/cy = canvas target (icon centre); py = palette row centre y.
const NODES: Node[] = [
  { icon: Table2, label: "Extract · SAP", color: "#3E7BFB", cx: 300, cy: 120, py: 92 },
  { icon: Users, label: "Extract · CRM", color: "#3E7BFB", cx: 300, cy: 288, py: 140 },
  { icon: Shuffle, label: "Transform", color: "#C8A86A", cx: 452, cy: 204, py: 188 },
  { icon: ShieldCheck, label: "Validate", color: "#7C6BEF", cx: 572, cy: 204, py: 236 },
  { icon: Database, label: "Load · Snowflake", color: "#29B5E8", cx: 664, cy: 204, py: 284 },
];

const R = 21;
function curve(x0: number, y0: number, x1: number, y1: number): string {
  const mx = (x0 + x1) / 2;
  return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
}
type Conn = { s: number; t: number };
const CONNS: Conn[] = [
  { s: 0, t: 2 },
  { s: 1, t: 2 },
  { s: 2, t: 3 },
  { s: 3, t: 4 },
];
const port = (n: Node, side: "out" | "in"): [number, number] => [
  side === "out" ? n.cx + R : n.cx - R,
  n.cy,
];
const connPath = (c: Conn): string => {
  const [x0, y0] = port(NODES[c.s]!, "out");
  const [x1, y1] = port(NODES[c.t]!, "in");
  const dy = c.s === c.t ? 0 : NODES[c.s]!.cy > NODES[c.t]!.cy ? 6 : NODES[c.s]!.cy < NODES[c.t]!.cy ? -6 : 0;
  return curve(x0, y0, x1, y1 + dy);
};

const PALETTE_W = 168;
const RUN_BTN: [number, number] = [648, 20];
const START: [number, number] = [690, 372];

export function MatillionScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.45 });

  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [placed, setPlaced] = useState(reduce ? NODES.length : 0);
  const [drag, setDrag] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(reduce ? CONNS.length : 0);
  const [pressed, setPressed] = useState(false);
  const [success, setSuccess] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setPlaced(0);
      setDrag(null);
      setDrawn(0);
      setSuccess(false);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(450);
      if (!alive) return;
      setCursorOn(true);
      await sleep(250);

      // Drag each component out of the palette onto the canvas.
      for (let i = 0; i < NODES.length; i++) {
        if (!alive) return;
        setCursor({ x: 84, y: NODES[i]!.py });
        await sleep(480);
        if (!alive) return;
        setDrag(i); // grab
        await sleep(200);
        if (!alive) return;
        setCursor({ x: NODES[i]!.cx, y: NODES[i]!.cy }); // drag to canvas (tile follows)
        await sleep(560);
        if (!alive) return;
        setPlaced(i + 1); // drop
        setDrag(null);
        await sleep(180);
      }

      // Draw each connector: cursor drags from output port to input port while
      // the line draws in sync.
      for (let i = 0; i < CONNS.length; i++) {
        if (!alive) return;
        const c = CONNS[i]!;
        const [sx, sy] = port(NODES[c.s]!, "out");
        const [tx, ty] = port(NODES[c.t]!, "in");
        setCursor({ x: sx, y: sy });
        await sleep(340);
        if (!alive) return;
        setCursor({ x: tx, y: ty }); // drag...
        setDrawn(i + 1); // ...line draws in sync (same 0.5s transition)
        await sleep(560);
      }

      if (!alive) return;
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(560);
      if (!alive) return;
      setPressed(true);
      await sleep(170);
      if (!alive) return;
      setPressed(false);
      setSuccess(true);
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

  const nodePos = (i: number): { left: string; top: string; on: boolean; grabbed: boolean } => {
    const n = NODES[i]!;
    if (i < placed) return { left: px(n.cx - 55), top: py(n.cy - 17), on: true, grabbed: false };
    if (i === drag) return { left: px(cursor.x - 55), top: py(cursor.y - 6), on: true, grabbed: true };
    return { left: px(21), top: py(n.py - 17), on: false, grabbed: false };
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm"
      style={{ maxWidth: 760, aspectRatio: `${W} / ${H}`, backgroundColor: "#f6f7f9" }}
    >
      {/* Dot grid over the canvas area (right of palette) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: px(PALETTE_W),
          right: 0,
          top: py(TOOLBAR),
          bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(20,30,50,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Toolbar */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-black/8 bg-white px-4"
        style={{ height: py(TOOLBAR) }}
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

      {/* Palette */}
      <div
        className="absolute border-r border-black/8 bg-[#eef1f4]"
        style={{ left: 0, top: py(TOOLBAR), width: px(PALETTE_W), bottom: 0 }}
      >
        <div className="px-3 pt-3 text-[9px] font-semibold uppercase tracking-wide text-[#8A93A0]">
          Components
        </div>
        <div className="mt-1 flex flex-col gap-1 px-2">
          {NODES.map((n, i) => {
            const Icon = n.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border border-black/5 bg-white px-2 py-1.5"
                style={{ opacity: i < placed || i === drag ? 0.4 : 1, transition: "opacity 0.3s ease" }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: n.color }}
                >
                  <Icon className="h-2.5 w-2.5 text-white" strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span className="truncate text-[10px] font-medium text-[#3C4450]">{n.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connectors */}
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {CONNS.map((c, i) => (
          <path
            key={i}
            d={connPath(c)}
            fill="none"
            stroke="#3FA45B"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: i < drawn ? 0 : 1,
              transition: "stroke-dashoffset 0.55s ease-in-out",
            }}
          />
        ))}
      </svg>

      {/* Nodes (fly from palette to canvas) */}
      {NODES.map((n, i) => {
        const Icon = n.icon;
        const p = nodePos(i);
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              left: p.left,
              top: p.top,
              width: 110,
              opacity: p.on ? 1 : 0,
              transform: p.grabbed ? "scale(1.06)" : "scale(1)",
              zIndex: p.grabbed ? 20 : 1,
              transition: `left 0.5s ${EASE}, top 0.5s ${EASE}, opacity 0.3s ease, transform 0.2s ease`,
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
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                style={{
                  backgroundColor: n.color,
                  boxShadow: p.grabbed
                    ? "0 8px 18px -4px rgba(0,0,0,0.35)"
                    : "0 1px 3px rgba(0,0,0,0.18)",
                  transition: "box-shadow 0.2s ease",
                }}
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
          bottom: py(14),
          opacity: success ? 1 : 0,
          transform: success ? "translate(-50%, 0)" : "translate(-50%, 8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <span className="h-2 w-2 rounded-full bg-[#34A853]" /> Pipeline validated · 0 errors
      </div>

      {/* Cursor */}
      <div
        className="pointer-events-none absolute z-30"
        style={{
          left: px(cursor.x),
          top: py(cursor.y),
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
