"use client";

import { Bot, Cloud, Database, FileText, type LucideIcon } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";
import { useIsDark } from "@/components/projects/scenes/use-is-dark";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 1200;
const H = 600;
const TOP = 46;
const BOTTOM = 48;

type Mod = { icon: LucideIcon; label: string; color: string; cx: number };
const MODS: Mod[] = [
  { icon: Cloud, label: "Cloud storage", color: "#4b7bec", cx: 210 },
  { icon: FileText, label: "PDF · text extract", color: "#ef7d3a", cx: 470 },
  { icon: Bot, label: "Claude · categorize", color: "#c8663f", cx: 730 },
  { icon: Database, label: "Notion database", color: "#8256d0", cx: 990 },
];
const CY = TOP + (H - TOP - BOTTOM) / 2 - 6;
const MR = 34; // module radius

const RUN_BTN: [number, number] = [96, H - 24];
const START: [number, number] = [980, 470];

export function MakeScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const dark = useIsDark();
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [active, setActive] = useState(-1); // module currently processing
  const [done, setDone] = useState(reduce ? MODS.length : 0); // modules completed
  const [bundle, setBundle] = useState<{ x: number; y: number } | null>(reduce ? null : null);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const runOnce = async (): Promise<void> => {
      setActive(-1);
      setDone(0);
      setBundle(null);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(650);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(1000);
      if (!alive) return;
      setPressed(true);
      await sleep(220);
      setPressed(false);
      setBundle({ x: MODS[0]!.cx, y: CY });
      for (let i = 0; i < MODS.length; i++) {
        if (!alive) return;
        setBundle({ x: MODS[i]!.cx, y: CY });
        setActive(i);
        await sleep(650);
        if (!alive) return;
        setActive(-1);
        setDone(i + 1);
        await sleep(420);
      }
      if (!alive) return;
      setBundle(null);
      await sleep(2400);
      if (!alive) return;
      setCursorOn(false);
    };
    (async () => {
      do {
        await runOnce();
        if (DEMO_LOOP && alive) await sleep(1700);
      } while (DEMO_LOOP && alive);
    })();
    return () => { alive = false; };
  }, [inView, reduce]);

  const EASE = "cubic-bezier(0.33, 0, 0.15, 1)";
  const S = dark
    ? { canvas: "#14161b", grid: "rgba(200,212,232,0.10)", panel: "#1b1c20", ink: "#e2e6ec", muted: "#8b909a", line: "rgba(255,255,255,0.09)", conn: "rgba(255,255,255,0.28)" }
    : { canvas: "#f4f5f8", grid: "rgba(20,30,50,0.09)", panel: "#ffffff", ink: "#1f2937", muted: "#8a93a0", line: "rgba(0,0,0,0.08)", conn: "rgba(20,30,50,0.28)" };
  const PURPLE = "#6d3ad0";

  const conn = (a: Mod, b: Mod): string => {
    const mx = (a.cx + b.cx) / 2;
    return `M ${a.cx + MR} ${CY} C ${mx} ${CY}, ${mx} ${CY}, ${b.cx - MR} ${CY}`;
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border shadow-md"
      style={{ height: H * scale, backgroundColor: S.canvas, borderColor: S.line }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* dotted grid */}
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: 0, right: 0, top: TOP, bottom: BOTTOM, backgroundImage: `radial-gradient(circle, ${S.grid} 1.4px, transparent 1.4px)`, backgroundSize: "24px 24px" }} />

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b px-5" style={{ height: TOP, backgroundColor: S.panel, borderColor: S.line }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-[13px] font-bold text-white" style={{ backgroundColor: PURPLE }}>M</span>
            <span className="text-[14px] font-semibold" style={{ color: S.ink }}>invoice_to_notion</span>
            <span className="rounded px-2 py-0.5 text-[11px]" style={{ backgroundColor: dark ? "#24262c" : "#eef1f4", color: S.muted }}>every 15 min</span>
          </div>
          <span className="text-[12px]" style={{ color: S.muted }}>{done >= MODS.length && cursorOn === false ? "" : done >= MODS.length ? "" : ""}</span>
        </div>

        {/* Connectors (dotted) */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" aria-hidden="true">
          {MODS.slice(0, -1).map((m, i) => (
            <path key={i} d={conn(m, MODS[i + 1]!)} fill="none" stroke={S.conn} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" />
          ))}
        </svg>

        {/* Bundle dot travelling */}
        {bundle && (
          <div className="absolute z-10 h-3 w-3 rounded-full" style={{ left: bundle.x - 6, top: bundle.y - 6, backgroundColor: PURPLE, boxShadow: `0 0 12px 2px ${PURPLE}`, transition: `left 0.6s ${EASE}, top 0.6s ${EASE}` }} />
        )}

        {/* Modules */}
        {MODS.map((m, i) => {
          const Icon = m.icon;
          const isDone = i < done;
          const isActive = i === active;
          return (
            <div key={m.label} className="absolute flex flex-col items-center" style={{ left: m.cx - 60, top: CY - MR - 4, width: 120 }}>
              <div className="relative flex items-center justify-center" style={{ width: MR * 2, height: MR * 2 }}>
                {/* active pulse ring */}
                <span className="absolute rounded-full" style={{ inset: -6, border: `2px solid ${m.color}`, opacity: isActive ? 0.9 : 0, transform: isActive ? "scale(1.12)" : "scale(1)", transition: "opacity 0.3s ease, transform 0.5s ease" }} />
                <span className="flex items-center justify-center rounded-full shadow-md" style={{ width: MR * 2, height: MR * 2, backgroundColor: m.color }}>
                  <Icon className="h-7 w-7 text-white" strokeWidth={2} aria-hidden="true" />
                </span>
                {/* done check badge */}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: "#34A853", opacity: isDone ? 1 : 0, transform: isDone ? "scale(1)" : "scale(0.4)", transition: "opacity 0.3s ease, transform 0.35s ease" }}>✓</span>
                {/* ops badge */}
                <span className="absolute -bottom-1 -right-1 rounded-full px-1.5 text-[9px] font-semibold" style={{ backgroundColor: dark ? "#24262c" : "#ffffff", color: S.muted, border: `1px solid ${S.line}`, opacity: isDone ? 1 : 0, transition: "opacity 0.3s ease" }}>1</span>
              </div>
              <span className="mt-2.5 text-center text-[12px] font-medium leading-tight" style={{ color: S.ink }}>{m.label}</span>
            </div>
          );
        })}

        {/* Bottom bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 border-t px-5" style={{ height: BOTTOM, backgroundColor: S.panel, borderColor: S.line }}>
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: PURPLE, transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}>
            ▶ Run once
          </div>
          <span className="text-[12px]" style={{ color: S.muted }}>Scheduling: every 15 minutes</span>
          <span className="ml-auto text-[12px] font-medium" style={{ color: done >= MODS.length ? "#2f8f47" : S.muted }}>
            {done >= MODS.length ? "✓ 4 operations · 1 cycle" : `${done} / ${MODS.length} modules`}
          </span>
        </div>

        {/* Cursor */}
        <div className="pointer-events-none absolute z-30" style={{ left: cursor.x, top: cursor.y, transform: "translate(-4px, -3px)", opacity: cursorOn ? 1 : 0, transition: `left 0.95s ${EASE}, top 0.95s ${EASE}, opacity 0.45s ease` } as CSSProperties}>
          <ToolCursor name="Sylvana" color={PURPLE} />
        </div>
      </div>
    </div>
  );
}
