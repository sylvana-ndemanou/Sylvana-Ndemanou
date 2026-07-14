"use client";

import { FileText, Layers, RefreshCw, Send, ShieldCheck, type LucideIcon } from "lucide-react";
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
const ACC = "#3457b8";

const STEPS: [LucideIcon, string, string][] = [
  [RefreshCw, "Refresh star schema", "SCD2 history"],
  [ShieldCheck, "Data-quality checks", "consistency + row counts"],
  [Layers, "Build materialized views", "query performance"],
  [FileText, "Render executive report", "PDF + dashboard"],
  [Send, "Deliver to leadership", "Monday 06:00"],
];
const RUN_BTN: [number, number] = [1096, 24];
const START: [number, number] = [980, 470];

export function ExecutiveReportScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const dark = useIsDark();
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [running, setRunning] = useState(-1);
  const [done, setDone] = useState(reduce ? STEPS.length : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const runOnce = async (): Promise<void> => {
      setRunning(-1);
      setDone(0);
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
      for (let i = 0; i < STEPS.length; i++) {
        if (!alive) return;
        setRunning(i);
        await sleep(720);
        if (!alive) return;
        setRunning(-1);
        setDone(i + 1);
        await sleep(360);
      }
      await sleep(2200);
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
    ? { page: "#14161b", card: "#1b1c20", ink: "#e2e6ec", muted: "#8b909a", line: "rgba(255,255,255,0.09)", soft: "#22242a", chip: "#24262c" }
    : { page: "#eef1f5", card: "#ffffff", ink: "#1f2937", muted: "#8a93a0", line: "rgba(0,0,0,0.08)", soft: "#f4f6f9", chip: "#eef1f4" };

  const reportShown = done >= 4;
  const delivered = done >= 5;

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border shadow-md"
      style={{ height: H * scale, backgroundColor: S.page, borderColor: S.line }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b px-5" style={{ height: 48, backgroundColor: S.card, borderColor: S.line }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md text-white" style={{ backgroundColor: ACC }}><FileText className="h-3.5 w-3.5" aria-hidden="true" /></span>
            <span className="text-[14px] font-semibold" style={{ color: S.ink }}>Weekly executive report</span>
            <span className="rounded px-2 py-0.5 text-[11px]" style={{ backgroundColor: S.chip, color: S.muted }}>⏱ Mon 06:00 UTC · Enabled</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white" style={{ backgroundColor: ACC, transform: pressed ? "scale(0.92)" : "scale(1)", transition: "transform 0.16s ease" }}>
            ▶ Run now
          </div>
        </div>

        {/* Steps card */}
        <div className="absolute rounded-xl border p-4 shadow-sm" style={{ left: 24, top: 72, width: 520, bottom: 24, backgroundColor: S.card, borderColor: S.line }}>
          <div className="text-[13px] font-semibold" style={{ color: S.ink }}>Automated run</div>
          <div className="mt-1 text-[11px]" style={{ color: S.muted }}>No manual step — replaces the 6am hand-run.</div>
          <div className="mt-4 flex flex-col gap-2.5">
            {STEPS.map(([Icon, label, sub], i) => {
              const isDone = i < done;
              const isRunning = i === running;
              return (
                <div key={label} className="flex items-center gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: S.line, backgroundColor: isRunning ? (dark ? "#20242e" : "#f0f4fb") : S.soft, transition: "background-color 0.3s ease" }}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: isDone ? "#34A853" : isRunning ? ACC : S.chip, transition: "background-color 0.3s ease" }}>
                    {isDone ? <span className="text-[15px] font-bold text-white">✓</span> : <Icon className="h-4 w-4" strokeWidth={2.2} style={{ color: isRunning ? "#fff" : S.muted }} aria-hidden="true" />}
                  </span>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium" style={{ color: S.ink }}>{label}</div>
                    <div className="text-[10.5px]" style={{ color: S.muted }}>{sub}</div>
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: isDone ? "#2f8f47" : isRunning ? ACC : S.muted }}>
                    {isDone ? "done" : isRunning ? "running…" : "queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report preview card */}
        <div className="absolute rounded-xl border p-5 shadow-sm" style={{ left: 568, top: 72, width: 608, bottom: 24, backgroundColor: S.card, borderColor: S.line }}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold" style={{ color: S.ink }}>Executive report — preview</div>
            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: delivered ? "#e6f4ea" : S.chip, color: delivered ? "#2f8f47" : S.muted, transition: "all 0.3s ease" }}>
              {delivered ? "✓ Delivered" : "pending"}
            </span>
          </div>

          <div className="relative mt-3 flex-1 rounded-lg border" style={{ borderColor: S.line, backgroundColor: S.soft, height: 380 }}>
            {!reportShown && (
              <div className="absolute inset-0 flex items-center justify-center text-[12px]" style={{ color: S.muted }}>
                {done > 0 ? "Rendering…" : "Waiting for run"}
              </div>
            )}
            <div className="p-5" style={{ opacity: reportShown ? 1 : 0, transform: reportShown ? "translateY(0)" : "translateY(8px)", transition: `opacity 0.5s ease, transform 0.5s ${EASE}` }}>
              <div className="text-[16px] font-semibold" style={{ color: S.ink }}>Executive summary — Week 28</div>
              <div className="mt-1 text-[11px]" style={{ color: S.muted }}>Generated automatically · point-in-time (SCD2)</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["Revenue", "$14.9M", "▲ 9.7%", "#2f8f47"], ["Funded", "$20.1M", "▼ 8.1M", "#D6553F"], ["Approval", "34%", "▼ 31 pts", "#D6553F"]].map((k) => (
                  <div key={k[0]} className="rounded-lg border px-3 py-2.5" style={{ borderColor: S.line }}>
                    <div className="text-[10px]" style={{ color: S.muted }}>{k[0]}</div>
                    <div className="text-[18px] font-semibold" style={{ color: S.ink }}>{k[1]}</div>
                    <div className="text-[10px] font-semibold" style={{ color: k[3] }}>{k[2]}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex h-24 items-end gap-2 border-b pb-0" style={{ borderColor: S.line }}>
                {[40, 62, 48, 80, 55, 70, 90, 60].map((v, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height: `${v}%`, backgroundColor: ACC, opacity: 0.85 }} />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[11px]" style={{ color: S.muted }}>
                <span className="rounded px-2 py-0.5" style={{ backgroundColor: S.chip }}>0 manual steps</span>
                <span className="rounded px-2 py-0.5" style={{ backgroundColor: S.chip }}>quality checks passed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivered toast */}
        <div className="absolute left-1/2 flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-[13px] font-semibold shadow-sm" style={{ bottom: 18, color: "#2f8f47", borderColor: "rgba(52,168,83,0.3)", backgroundColor: dark ? "#1b1c20" : "#ffffff", opacity: delivered ? 1 : 0, transform: delivered ? "translate(-50%,0)" : "translate(-50%,10px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#34A853" }} /> Report delivered automatically · 0 manual steps
        </div>

        {/* Cursor */}
        <div className="pointer-events-none absolute z-30" style={{ left: cursor.x, top: cursor.y, transform: "translate(-4px, -3px)", opacity: cursorOn ? 1 : 0, transition: `left 0.95s ${EASE}, top 0.95s ${EASE}, opacity 0.45s ease` } as CSSProperties}>
          <ToolCursor name="Sylvana" color={ACC} />
        </div>
      </div>
    </div>
  );
}
