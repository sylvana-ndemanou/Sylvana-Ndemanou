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
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";

// TEMP(testing): force motion + loop so the build can be recorded even in
// reduced-motion browsers. Set BOTH back to false before committing.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 980;
const H = 600;
const TOOLBAR = 56;
const PALETTE_W = 214;
const ICON = 46;
const NODE_W = 152;

type Node = {
  icon: LucideIcon;
  label: string;
  color: string;
  cx: number;
  cy: number;
  py: number;
};

const NODES: Node[] = [
  { icon: Table2, label: "Extract · SAP", color: "#3E7BFB", cx: 372, cy: 180, py: 128 },
  { icon: Users, label: "Extract · CRM", color: "#3E7BFB", cx: 372, cy: 432, py: 196 },
  { icon: Shuffle, label: "Transform", color: "#C8A86A", cx: 566, cy: 306, py: 264 },
  { icon: ShieldCheck, label: "Validate", color: "#7C6BEF", cx: 736, cy: 306, py: 332 },
  { icon: Database, label: "Load · Snowflake", color: "#29B5E8", cx: 896, cy: 306, py: 400 },
];

const R = 30;
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
  const dy = NODES[c.s]!.cy > NODES[c.t]!.cy ? 8 : NODES[c.s]!.cy < NODES[c.t]!.cy ? -8 : 0;
  return curve(x0, y0, x1, y1 + dy);
};

const RUN_BTN: [number, number] = [905, 28];
const START: [number, number] = [930, 540];

export function MatillionScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

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
      await sleep(700);
      if (!alive) return;
      setCursorOn(true);
      await sleep(500);

      for (let i = 0; i < NODES.length; i++) {
        if (!alive) return;
        setCursor({ x: 112, y: NODES[i]!.py });
        await sleep(950);
        if (!alive) return;
        setDrag(i);
        await sleep(420);
        if (!alive) return;
        setCursor({ x: NODES[i]!.cx, y: NODES[i]!.cy });
        await sleep(1100);
        if (!alive) return;
        setPlaced(i + 1);
        setDrag(null);
        await sleep(420);
      }

      for (let i = 0; i < CONNS.length; i++) {
        if (!alive) return;
        const c = CONNS[i]!;
        const [sx, sy] = port(NODES[c.s]!, "out");
        const [tx, ty] = port(NODES[c.t]!, "in");
        setCursor({ x: sx, y: sy });
        await sleep(650);
        if (!alive) return;
        setCursor({ x: tx, y: ty });
        setDrawn(i + 1);
        await sleep(1050);
      }

      if (!alive) return;
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(950);
      if (!alive) return;
      setPressed(true);
      await sleep(260);
      if (!alive) return;
      setPressed(false);
      setSuccess(true);
      await sleep(2600);
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
  const MOVE = "0.85s";

  const nodePos = (i: number): { left: number; top: number; on: boolean; grabbed: boolean } => {
    const n = NODES[i]!;
    if (i < placed) return { left: n.cx - NODE_W / 2, top: n.cy - ICON / 2, on: true, grabbed: false };
    if (i === drag) return { left: cursor.x - NODE_W / 2, top: cursor.y - 8, on: true, grabbed: true };
    return { left: 24, top: n.py - ICON / 2, on: false, grabbed: false };
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-sm"
      style={{ height: H * scale, backgroundColor: "#f6f7f9" }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Dot grid over canvas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: PALETTE_W,
            right: 0,
            top: TOOLBAR,
            bottom: 0,
            backgroundImage: "radial-gradient(circle, rgba(20,30,50,0.10) 1.4px, transparent 1.4px)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Toolbar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-black/8 bg-white px-5" style={{ height: TOOLBAR }}>
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="h-3 w-3 rounded-full bg-black/15" />
            <span className="ml-3 text-[15px] font-semibold text-[#3C4450]">daily_load.orch</span>
          </div>
          <div
            className="rounded-lg bg-[#2D7FF9] px-4 py-2 text-[14px] font-semibold text-white"
            style={{ transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}
          >
            ▶ Validate
          </div>
        </div>

        {/* Palette */}
        <div className="absolute border-r border-black/8 bg-[#eef1f4]" style={{ left: 0, top: TOOLBAR, width: PALETTE_W, bottom: 0 }}>
          <div className="px-4 pt-4 text-[11px] font-semibold uppercase tracking-wide text-[#8A93A0]">Components</div>
          <div className="mt-2 flex flex-col gap-2 px-3">
            {NODES.map((n, i) => {
              const Icon = n.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-lg border border-black/5 bg-white px-2.5 py-2.5"
                  style={{ opacity: i < placed || i === drag ? 0.35 : 1, transition: "opacity 0.4s ease" }}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: n.color }}>
                    <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.4} aria-hidden="true" />
                  </span>
                  <span className="truncate text-[12.5px] font-medium text-[#3C4450]">{n.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connectors */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" aria-hidden="true">
          {CONNS.map((c, i) => (
            <path
              key={i}
              d={connPath(c)}
              fill="none"
              stroke="#3FA45B"
              strokeWidth={2.5}
              strokeLinecap="round"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: i < drawn ? 0 : 1, transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          ))}
        </svg>

        {/* Nodes */}
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
                width: NODE_W,
                opacity: p.on ? 1 : 0,
                transform: p.grabbed ? "scale(1.06)" : "scale(1)",
                zIndex: p.grabbed ? 20 : 1,
                transition: `left ${MOVE} ${EASE}, top ${MOVE} ${EASE}, opacity 0.35s ease, transform 0.25s ease`,
              }}
            >
              <div className="relative">
                <span
                  className="absolute rounded-[15px] border-[2.5px] border-[#34A853]"
                  style={{
                    inset: -6,
                    opacity: success ? 1 : 0,
                    transform: success ? "scale(1)" : "scale(0.8)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                  }}
                />
                <span
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: ICON,
                    height: ICON,
                    backgroundColor: n.color,
                    boxShadow: p.grabbed ? "0 12px 24px -6px rgba(0,0,0,0.35)" : "0 2px 5px rgba(0,0,0,0.18)",
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.2} aria-hidden="true" />
                </span>
              </div>
              <span className="mt-2 text-center text-[13px] font-medium leading-tight text-[#3C4450]">{n.label}</span>
            </div>
          );
        })}

        {/* Success toast */}
        <div
          className="absolute left-1/2 flex items-center gap-2 rounded-full border border-[#34A853]/30 bg-white px-4 py-2 text-[13px] font-semibold text-[#2f8f47] shadow-sm"
          style={{
            bottom: 22,
            opacity: success ? 1 : 0,
            transform: success ? "translate(-50%, 0)" : "translate(-50%, 10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" /> Pipeline validated · 0 errors
        </div>

        {/* Cursor */}
        <div
          className="pointer-events-none absolute z-30"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-4px, -3px)",
            opacity: cursorOn ? 1 : 0,
            transition: `left ${MOVE} ${EASE}, top ${MOVE} ${EASE}, opacity 0.45s ease`,
          }}
        >
          <ToolCursor name="Sylvana" />
        </div>
      </div>
    </div>
  );
}
