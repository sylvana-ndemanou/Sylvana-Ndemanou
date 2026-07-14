"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";
import { useIsDark } from "@/components/projects/scenes/use-is-dark";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 1360;
const H = 760;
const RAIL = 48;
const TOPBAR = 32;
const EXPLORER = 244;
const MAIN_X = RAIL + EXPLORER; // 292

const SQL = [
  "use role sysadmin;",
  "drop database if exists analytics_clone;",
  "create database analytics_clone clone analytics_prod;",
  "",
  "-- daily zero-copy clone task",
  "create or replace task clone_daily",
  "  warehouse = compute_wh",
  "  schedule = 'using cron 0 6 * * * utc'",
  "as",
  "  create or replace database analytics_clone clone analytics_prod;",
  "",
  "alter task clone_daily resume;",
  "",
  "-- verify the latest clone",
  "select created, database_name",
  "from snowflake.account_usage.databases",
  "where database_name = 'analytics_clone'",
  "order by created desc limit 1;",
];
const KW = new Set([
  "use", "role", "drop", "database", "if", "exists", "create", "or", "replace",
  "clone", "task", "warehouse", "schedule", "as", "alter", "resume", "select",
  "from", "where", "order", "by", "desc", "limit",
]);

const DBS = ["ANALYTICS_CLONE", "ANALYTICS_PROD", "CUSTOMER_360", "FINANCE_DW", "HR_CORE", "MARKETING_DW", "PRODUCT_CATALOG", "SALES_PROD", "SALES_RAW", "WEB_EVENTS"];
const WS_TABS = ["drop_clone_table.sql", "zero_copy_clone.sql", "task_comparison.sql", "untitled_3.sql"];

const RUN_BTN: [number, number] = [316, 114];
const START: [number, number] = [1180, 620];

export function SnowflakeScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const dark = useIsDark();
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.4 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
    const runOnce = async (): Promise<void> => {
      setDone(false);
      setRunning(false);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(650);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: RUN_BTN[0], y: RUN_BTN[1] });
      await sleep(1100);
      if (!alive) return;
      setPressed(true);
      await sleep(220);
      if (!alive) return;
      setPressed(false);
      setRunning(true);
      await sleep(1200);
      if (!alive) return;
      setRunning(false);
      setDone(true);
      await sleep(2600);
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
  const C = dark
    ? { bg: "#17181c", panel: "#1e1f24", border: "#2c2e35", text: "#d6d8dd", muted: "#8b909a", editor: "#1b1c20", gutter: "#202127", gutterTx: "#565b66", kw: "#4a9cff", str: "#ce9178", com: "#7ea36a", num: "#4ec9b0", tabBar: "#202127", tabActive: "#1b1c20", results: "#191a1e", head: "#202127", chip: "#24262c", accent: "#29B5E8", run: "#2f7fe0", zebra: "#1d1e23" }
    : { bg: "#ffffff", panel: "#f6f8fa", border: "#e5e7eb", text: "#1f2937", muted: "#8a93a0", editor: "#ffffff", gutter: "#f5f7f9", gutterTx: "#b5bcc6", kw: "#2D7FF9", str: "#C2410C", com: "#7c8a5b", num: "#0f766e", tabBar: "#eceff3", tabActive: "#ffffff", results: "#fbfcfd", head: "#f3f5f7", chip: "#eef1f4", accent: "#29B5E8", run: "#2D7FF9", zebra: "#f6f8fa" };

  const tokenColor = (tok: string): string => {
    if (tok.startsWith("'")) return C.str;
    if (KW.has(tok.toLowerCase())) return C.kw;
    if (/^\d+$/.test(tok)) return C.num;
    return C.text;
  };
  const renderLine = (line: string): ReactNode => {
    if (line.trimStart().startsWith("--")) return <span style={{ color: C.com }}>{line}</span>;
    const toks = line.match(/'[^']*'|[A-Za-z_]\w*|\d+|[^\sA-Za-z0-9']+|\s+/g) ?? [];
    return toks.map((t, i) => <span key={i} style={{ color: tokenColor(t) }}>{t}</span>);
  };

  const editorTop = TOPBAR + 34 + 34; // topbar + ws tabs + context bar
  const RESULTS_TOP = 496;

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border shadow-md"
      style={{ height: H * scale, backgroundColor: C.bg, borderColor: C.border }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Left rail (always dark, like Snowsight) */}
        <div className="absolute inset-y-0 left-0 flex flex-col items-center gap-4 py-3" style={{ width: RAIL, backgroundColor: "#0b1220" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M11 2 L11 20 M3.5 6.2 L18.5 15.8 M3.5 15.8 L18.5 6.2" stroke="#29B5E8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-4 w-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />)}
        </div>

        {/* Top strip: Workspaces / Databases */}
        <div className="absolute flex items-center gap-4 border-b px-4 text-[12px]" style={{ left: RAIL, right: 0, top: 0, height: TOPBAR, backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
          <span>Workspaces</span>
          <span className="font-semibold" style={{ color: C.text }}>Databases</span>
          <span className="ml-auto" style={{ color: C.muted }}>＋</span>
          <span style={{ color: C.muted }}>⌕</span>
        </div>

        {/* Database Explorer */}
        <div className="absolute border-r" style={{ left: RAIL, top: TOPBAR, width: EXPLORER, bottom: 0, backgroundColor: C.panel, borderColor: C.border }}>
          <div className="flex items-center justify-between px-3 pt-3">
            <span className="text-[13px] font-semibold" style={{ color: C.text }}>Database Explorer</span>
            <span style={{ color: C.muted }}>⟳</span>
          </div>
          <div className="mt-2 flex gap-4 border-b px-3 text-[11.5px]" style={{ borderColor: C.border }}>
            <span className="border-b-2 pb-1.5 font-medium" style={{ borderColor: C.accent, color: C.text }}>Objects</span>
            <span className="pb-1.5" style={{ color: C.muted }}>Data Products</span>
          </div>
          <div className="mx-3 mt-2 flex h-7 items-center rounded-md border px-2 text-[11px]" style={{ borderColor: C.border, backgroundColor: C.bg, color: C.muted }}>Search</div>
          <div className="px-3 pt-2 text-[10px] font-medium" style={{ color: C.muted }}>Filter</div>
          <div className="mt-1 flex flex-col">
            {DBS.map((d, i) => (
              <div key={d} className="flex items-center gap-1.5 px-3 py-[3px] text-[11.5px]" style={{ color: i === 0 ? C.accent : C.text }}>
                <span style={{ color: C.muted }}>›</span>
                <span className="h-3 w-3 rounded-[2px]" style={{ backgroundColor: i === 0 ? C.accent : (dark ? "#3a3d45" : "#9aa6b4") }} />
                <span className="truncate">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worksheet tabs */}
        <div className="absolute flex items-stretch overflow-hidden border-b" style={{ left: MAIN_X, right: 0, top: TOPBAR, height: 34, backgroundColor: C.tabBar, borderColor: C.border }}>
          <div className="flex items-center px-3" style={{ color: C.muted }}>⌂</div>
          {WS_TABS.map((t, i) => (
            <div key={t} className="flex items-center gap-2 border-r px-3 text-[11.5px]" style={{ borderColor: C.border, backgroundColor: i === 1 ? C.tabActive : "transparent", color: i === 1 ? C.text : C.muted }}>
              <span style={{ color: C.accent }}>▦</span>
              <span className="whitespace-nowrap">{t}</span>
            </div>
          ))}
          <div className="flex items-center px-3" style={{ color: C.muted }}>＋</div>
        </div>

        {/* Context bar */}
        <div className="absolute flex items-center justify-between border-b px-4 text-[11.5px]" style={{ left: MAIN_X, right: 0, top: TOPBAR + 34, height: 34, backgroundColor: C.bg, borderColor: C.border, color: C.muted }}>
          <span>My Workspace <span style={{ color: C.text }}>› zero_copy_clone.sql</span></span>
          <div className="flex items-center gap-3">
            <span>SYSADMIN</span>
            <span>· COMPUTE_WH (XS)</span>
            <span className="rounded px-2 py-0.5" style={{ backgroundColor: C.chip, color: C.text }}>ANALYTICS_CLONE · PUBLIC</span>
            <span className="rounded px-2 py-0.5 font-medium" style={{ backgroundColor: C.chip, color: C.text }}>Share</span>
          </div>
        </div>

        {/* Editor toolbar (Run) */}
        <div className="absolute flex items-center gap-2 border-b px-3" style={{ left: MAIN_X, right: 0, top: editorTop, height: 28, backgroundColor: C.editor, borderColor: C.border }}>
          <div
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: C.run, transform: pressed ? "scale(0.9)" : "scale(1)", transition: "transform 0.16s ease" }}
          >
            ▶ Run
          </div>
          <span className="text-[11px]" style={{ color: C.muted }}>{running ? "running…" : done ? "done" : "ready"}</span>
        </div>

        {/* Editor (gutter + code) */}
        <div className="absolute overflow-hidden" style={{ left: MAIN_X, right: 0, top: editorTop + 28, height: RESULTS_TOP - (editorTop + 28), backgroundColor: C.editor }}>
          <div className="flex h-full">
            <div className="w-10 shrink-0 py-2 text-right font-mono text-[11px]" style={{ backgroundColor: C.gutter, color: C.gutterTx }}>
              {SQL.map((_, i) => <div key={i} className="pr-2 leading-[19px]">{i + 1}</div>)}
            </div>
            <pre className="flex-1 overflow-hidden py-2 pl-3 font-mono text-[12.5px] leading-[19px]">
              {SQL.map((line, i) => <div key={i} style={{ minHeight: 19 }}>{renderLine(line)}</div>)}
            </pre>
          </div>
        </div>

        {/* Results panel */}
        <div className="absolute border-t" style={{ left: MAIN_X, right: 0, top: RESULTS_TOP, bottom: 0, backgroundColor: C.results, borderColor: C.border }}>
          <div className="flex items-center gap-4 px-4 pt-2.5 text-[12px]">
            <span className="font-semibold" style={{ color: C.text }}>Results</span>
            {done && <span style={{ color: C.muted }}>(just now)</span>}
            <span className="ml-2 border-b-2 pb-1 text-[11.5px] font-medium" style={{ borderColor: C.accent, color: C.text }}>Table</span>
            <span className="pb-1 text-[11.5px]" style={{ color: C.muted }}>Chart</span>
            <span className="pb-1 text-[11.5px]" style={{ color: C.muted }}>Pivot</span>
            <span className="ml-auto text-[11px]" style={{ color: C.muted }}>{done ? "1 row · 2.0s" : running ? "…" : ""}</span>
          </div>
          <div className="mt-1 grid grid-cols-[60px_1fr_1fr] border-y text-[11px] font-semibold uppercase tracking-wide" style={{ borderColor: C.border, color: C.muted, backgroundColor: C.head }}>
            <span className="px-3 py-1.5" style={{ color: C.muted }}>#</span>
            <span className="px-3 py-1.5">CREATED</span>
            <span className="px-3 py-1.5">DATABASE_NAME</span>
          </div>
          <div
            className="grid grid-cols-[60px_1fr_1fr] text-[12.5px]"
            style={{ opacity: done ? 1 : 0, transform: done ? "translateY(0)" : "translateY(6px)", transition: `opacity 0.35s ease, transform 0.35s ${EASE}` }}
          >
            <span className="px-3 py-2" style={{ color: C.muted }}>1</span>
            <span className="px-3 py-2" style={{ color: C.text }}>2026-07-09 02:55:01.161 -0400</span>
            <span className="px-3 py-2 font-medium" style={{ color: C.text }}>ANALYTICS_CLONE</span>
          </div>
          {running && (
            <div className="px-4 py-3 text-[12px]" style={{ color: C.muted }}>Running query…</div>
          )}
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
          } as CSSProperties}
        >
          <ToolCursor name="Sylvana" color={C.accent} />
        </div>
      </div>
    </div>
  );
}
