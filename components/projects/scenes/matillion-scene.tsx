"use client";

import {
  BadgeCheck,
  Database,
  ShieldCheck,
  Shuffle,
  Table2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";

// TEMP(testing): force motion + loop so the build can be recorded even in
// reduced-motion browsers. Set BOTH back to false before committing.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 1360;
const H = 760;
const APPBAR = 44;
const TABBAR = 36;
const RAIL = 56;
const PANEL = 150; // bottom panel height
const ICON = 46;
const NODE_W = 156;

type Node = { icon: LucideIcon; label: string; color: string; cx: number; cy: number };
const NODES: Node[] = [
  { icon: Table2, label: "Extract · SAP", color: "#3E7BFB", cx: 220, cy: 268 },
  { icon: Users, label: "Extract · CRM", color: "#3E7BFB", cx: 220, cy: 452 },
  { icon: Shuffle, label: "Transform", color: "#C8A86A", cx: 470, cy: 360 },
  { icon: ShieldCheck, label: "Quality gate", color: "#7C6BEF", cx: 700, cy: 360 },
  { icon: BadgeCheck, label: "Validate", color: "#2FA35F", cx: 930, cy: 360 },
  { icon: Database, label: "Load · Snowflake", color: "#29B5E8", cx: 1160, cy: 360 },
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
  { s: 4, t: 5 },
];
const port = (n: Node, side: "out" | "in"): [number, number] => [
  side === "out" ? n.cx + R : n.cx - R,
  n.cy,
];
const connPath = (c: Conn): string => {
  const [x0, y0] = port(NODES[c.s]!, "out");
  const [x1, y1] = port(NODES[c.t]!, "in");
  const dy = NODES[c.s]!.cy > NODES[c.t]!.cy ? 10 : NODES[c.s]!.cy < NODES[c.t]!.cy ? -10 : 0;
  return curve(x0, y0, x1, y1 + dy);
};

const TABS = [
  "main_orchestration",
  "load_dimensions",
  "load_facts",
  "extract_orders",
  "flatten_raw",
  "get_totals_api",
  "fetch_delta",
];
const TASKS: [string, string, string][] = [
  ["load_dimensions", "14:40:13", "Running"],
  ["extract_orders", "14:40:08", "Running"],
  ["extract_sap_sales", "14:21:05", "14:21:10"],
];

const RUN_BTN: [number, number] = [1305, 104];
const START: [number, number] = [1280, 560];

export function MatillionScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.35 });

  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [placed, setPlaced] = useState(reduce ? NODES.length : 0);
  const [carry, setCarry] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(reduce ? CONNS.length : 0);
  const [pressed, setPressed] = useState(false);
  const [success, setSuccess] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    // Fetch a component with the cursor and drop it on the canvas.
    const place = async (i: number): Promise<boolean> => {
      const t = NODES[i]!;
      setCursor({ x: t.cx - 168, y: t.cy - 78 });
      await sleep(760);
      if (!alive) return false;
      setCarry(i);
      await sleep(360);
      if (!alive) return false;
      setCursor({ x: t.cx, y: t.cy });
      await sleep(900);
      if (!alive) return false;
      setPlaced((p) => Math.max(p, i + 1));
      setCarry(null);
      await sleep(420);
      return alive;
    };

    // Drag a connector from the source's output port to the target's input.
    const draw = async (ci: number): Promise<boolean> => {
      const c = CONNS[ci]!;
      const [sx, sy] = port(NODES[c.s]!, "out");
      const [tx, ty] = port(NODES[c.t]!, "in");
      setCursor({ x: sx, y: sy });
      await sleep(560);
      if (!alive) return false;
      setCursor({ x: tx, y: ty });
      setDrawn((d) => Math.max(d, ci + 1));
      await sleep(960);
      return alive;
    };

    const runOnce = async (): Promise<void> => {
      setPlaced(0);
      setCarry(null);
      setDrawn(0);
      setSuccess(false);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(700);
      if (!alive) return;
      setCursorOn(true);
      await sleep(450);

      // Build the pipeline incrementally: fetch a component, wire it, repeat.
      if (!(await place(0))) return; // Extract · SAP
      if (!(await place(1))) return; // Extract · CRM
      if (!(await place(2))) return; // Transform
      if (!(await draw(0))) return; // SAP → Transform
      if (!(await draw(1))) return; // CRM → Transform
      if (!(await place(3))) return; // Quality gate
      if (!(await draw(2))) return; // Transform → Quality
      if (!(await place(4))) return; // Validate
      if (!(await draw(3))) return; // Quality → Validate
      if (!(await place(5))) return; // Load
      if (!(await draw(4))) return; // Validate → Load

      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(950);
      if (!alive) return;
      setPressed(true);
      await sleep(260);
      if (!alive) return;
      setPressed(false);
      setSuccess(true);
      await sleep(2800);
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

  // Draw connectors using their real length so the stroke reveals smoothly.
  useLayoutEffect(() => {
    const paths = svgRef.current?.querySelectorAll<SVGPathElement>("path.mtl-conn");
    if (!paths) return;
    paths.forEach((el, i) => {
      const L = el.getTotalLength();
      el.style.strokeDasharray = `${L}`;
      el.style.strokeDashoffset = reduce || i < drawn ? "0" : `${L}`;
    });
  }, [drawn, reduce]);

  const EASE = "cubic-bezier(0.33, 0, 0.15, 1)";
  const MOVE = "0.9s";
  const canvasTop = APPBAR + TABBAR;

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-md"
      style={{ height: H * scale, backgroundColor: "#f6f7f9" }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* App bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-[#0f1729] px-4 text-white" style={{ height: APPBAR }}>
          <div className="flex items-center gap-3 text-[13px]">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1e293b]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2 L8 14 M2.5 5 L13.5 11 M2.5 11 L13.5 5" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-semibold">analytics_dw</span>
            <span className="text-white/40">/ Production</span>
            <span className="ml-2 rounded bg-[#1e293b] px-2 py-0.5 text-[11px] text-white/70">⑂ main</span>
            <span className="ml-1 text-white/50">Schemas</span>
          </div>
          <span className="text-[12px] text-white/40">Search files &amp; quick actions</span>
        </div>

        {/* Left rail */}
        <div className="absolute left-0 flex flex-col items-center gap-4 bg-[#0b1220] py-4" style={{ top: APPBAR, width: RAIL, bottom: 0 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="h-5 w-5 rounded bg-white/12" />
          ))}
        </div>

        {/* Tab strip */}
        <div className="absolute flex items-stretch overflow-hidden border-b border-black/10 bg-[#eceff3]" style={{ left: RAIL, right: 0, top: APPBAR, height: TABBAR }}>
          {TABS.map((tname, i) => (
            <div
              key={tname}
              className="flex items-center gap-2 border-r border-black/8 px-3 text-[11.5px] font-medium"
              style={{ backgroundColor: i === 0 ? "#f6f7f9" : "transparent", color: i === 0 ? "#1e293b" : "#64748b" }}
            >
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#3E7BFB]" />
              <span className="whitespace-nowrap">{tname}</span>
            </div>
          ))}
        </div>

        {/* Canvas dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: RAIL,
            right: 0,
            top: canvasTop,
            bottom: PANEL,
            backgroundColor: "#f6f7f9",
            backgroundImage: "radial-gradient(circle, rgba(20,30,50,0.10) 1.4px, transparent 1.4px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating action toolbar (top-right) */}
        <div className="absolute z-20 flex items-center gap-4 text-[13px]" style={{ right: 24, top: 92 }}>
          <span className="text-[#475569]">Review ▾</span>
          <span className="text-[#475569]">Validate ✓</span>
          <span className="text-[#475569]">Schedule ⏱</span>
          <div
            className="rounded-lg bg-[#16324f] px-5 py-2 font-semibold text-white shadow"
            style={{ transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}
          >
            ▶ Run
          </div>
        </div>

        {/* Sticky notes */}
        <div className="absolute rounded-md bg-[#fff2b0] px-3 py-2 text-[11px] font-medium text-[#7A6410] shadow-sm" style={{ left: 120, top: 150, width: 150 }}>
          Re-orch · parallel sources
        </div>
        <div className="absolute rounded-md bg-[#fff2b0] px-3 py-2 text-[11px] font-medium text-[#7A6410] shadow-sm" style={{ left: 980, top: 172, width: 160 }}>
          Finance validation before delivery
        </div>

        {/* Connectors */}
        <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" aria-hidden="true">
          {CONNS.map((c, i) => (
            <path
              key={i}
              className="mtl-conn"
              d={connPath(c)}
              fill="none"
              stroke="#3FA45B"
              strokeWidth={2.5}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          ))}
        </svg>

        {/* Nodes */}
        {NODES.map((n, i) => {
          const Icon = n.icon;
          const placedNode = i < placed;
          const carried = i === carry;
          const on = placedNode || carried;
          const left = placedNode
            ? n.cx - NODE_W / 2
            : carried
              ? cursor.x - NODE_W / 2
              : n.cx - 168 - NODE_W / 2; // parked at the fetch/staging point
          const top = placedNode
            ? n.cy - ICON / 2
            : carried
              ? cursor.y - ICON / 2
              : n.cy - 78 - ICON / 2;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left,
                top,
                width: NODE_W,
                opacity: on ? 1 : 0,
                transform: carried ? "scale(1.06)" : "scale(1)",
                zIndex: carried ? 22 : 1,
                transition: `left ${MOVE} ${EASE}, top ${MOVE} ${EASE}, opacity 0.4s ease, transform 0.28s ease`,
              }}
            >
              <div className="relative">
                <span
                  className="absolute rounded-[16px] border-[2.5px] border-[#34A853]"
                  style={{
                    inset: -6,
                    opacity: success ? 1 : 0,
                    transform: success ? "scale(1)" : "scale(0.85)",
                    transition: "opacity 0.5s ease, transform 0.5s ease",
                  }}
                />
                <span
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: ICON,
                    height: ICON,
                    backgroundColor: n.color,
                    boxShadow: carried ? "0 14px 28px -6px rgba(0,0,0,0.35)" : "0 2px 6px rgba(0,0,0,0.18)",
                    transition: "box-shadow 0.28s ease",
                  }}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.2} aria-hidden="true" />
                </span>
              </div>
              <span className="mt-2 text-center text-[13px] font-medium leading-tight text-[#3C4450]">{n.label}</span>
            </div>
          );
        })}

        {/* Zoom control */}
        <div className="absolute rounded-md border border-black/10 bg-white px-2.5 py-1 text-[12px] text-[#64748b] shadow-sm" style={{ right: 20, bottom: PANEL + 16 }}>
          55% ▾
        </div>

        {/* Success toast */}
        <div
          className="absolute z-20 flex items-center gap-2 rounded-full border border-[#34A853]/30 bg-white px-4 py-2 text-[13px] font-semibold text-[#2f8f47] shadow-sm"
          style={{
            left: RAIL + (W - RAIL) / 2,
            bottom: PANEL + 18,
            opacity: success ? 1 : 0,
            transform: success ? "translate(-50%, 0)" : "translate(-50%, 10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#34A853]" /> Pipeline validated · 0 errors
        </div>

        {/* Bottom panel */}
        <div className="absolute border-t border-black/10 bg-white" style={{ left: RAIL, right: 0, bottom: 0, height: PANEL }}>
          <div className="flex items-center gap-5 border-b border-black/8 px-5 py-2.5 text-[12px]">
            <span className="font-semibold text-[#1e293b]">Task history</span>
            {["Sample data", "Metadata", "Variables", "Review results", "Tests"].map((t) => (
              <span key={t} className="text-[#94a3b8]">{t}</span>
            ))}
          </div>
          <div className="grid grid-cols-[120px_1fr_120px_120px] gap-3 px-5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-[#94a3b8]">
            <span>Task</span><span>Pipeline</span><span>Queued</span><span>Completed</span>
          </div>
          {TASKS.map((row, i) => {
            const running = row[2] === "Running";
            return (
              <div
                key={i}
                className="grid grid-cols-[120px_1fr_120px_120px] items-center gap-3 px-5 text-[12.5px]"
                style={{
                  height: 26,
                  opacity: success ? 1 : 0,
                  transform: success ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 0.4s ease ${i * 0.12}s, transform 0.4s ease ${i * 0.12}s`,
                }}
              >
                <span className="flex items-center gap-1.5 text-[#334155]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: running ? "#e0a400" : "#34A853" }} />
                  Validate
                </span>
                <span className="truncate text-[#334155]">Production/{row[0]}</span>
                <span className="text-[#64748b]">{row[1]}</span>
                <span style={{ color: running ? "#e0a400" : "#2f8f47" }}>{running ? "Running" : row[2]}</span>
              </div>
            );
          })}
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
