"use client";

import { Bookmark, Eye, LayoutGrid } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 1360;
const H = 760;

const FILTERS = ["Date", "Channel", "Show", "Price tier", "Report cat. 2", "Report cat. 3", "Producer"];

const KPIS: [string, string, string, "up" | "down"][] = [
  ["Transactions", "168", "116 ↗", "up"],
  ["Clients", "164", "113 ↗", "up"],
  ["Revenue", "$14,939", "$9,727 ↗", "up"],
  ["Avg client value", "$91.09", "-99.6 ↘", "down"],
  ["Avg transaction", "$88.93", "-11.3 ↘", "down"],
  ["Avg frequency", "1.0", "0 ↘", "down"],
];

const TABLE: [string, string, string, string, boolean][] = [
  ["Total", "168", "164", "$14,939", true],
  ["Comedy", "100", "99", "$8,441", false],
  ["Music", "26", "26", "$2,352", false],
  ["Theatre", "6", "6", "$775", false],
  ["Magic", "5", "5", "$592", false],
  ["Variety", "2", "2", "$240", false],
  ["Youth", "2", "2", "$141", false],
];

const PIE: [string, number, string][] = [
  ["Last minute", 100, "#0f5132"],
  ["1–4 weeks", 34, "#1f7a4d"],
  ["1–7 days", 25, "#2FA35F"],
  ["+1 month", 15, "#6cc39a"],
  ["+3 months", 12, "#a7dcbf"],
  ["+4 months", 8, "#d3efdf"],
];
const PIE_TOTAL = PIE.reduce((s, p) => s + p[1], 0);
const PIE_R = 78;
const PIE_C = 96;
function wedge(a0: number, a1: number): string {
  const p = (a: number): [number, number] => [
    PIE_C + PIE_R * Math.cos((a - 90) * (Math.PI / 180)),
    PIE_C + PIE_R * Math.sin((a - 90) * (Math.PI / 180)),
  ];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${PIE_C} ${PIE_C} L ${x0} ${y0} A ${PIE_R} ${PIE_R} 0 ${large} 1 ${x1} ${y1} Z`;
}
let acc = 0;
const PIE_WEDGES = PIE.map(([, v, c]) => {
  const a0 = (acc / PIE_TOTAL) * 360;
  acc += v;
  const a1 = (acc / PIE_TOTAL) * 360;
  return { d: wedge(a0, a1), color: c };
});

// Area/line chart geometry (local viewBox 480 x 170).
const CW = 480;
const CH = 170;
const VALS = [22, 92, 40, 30, 62, 26, 20, 48, 70, 44];
const PL = 34;
const PR = 464;
const PT = 16;
const PB = 140;
const PTS = VALS.map((v, i) => [
  +(PL + (i * (PR - PL)) / (VALS.length - 1)).toFixed(1),
  +(PB - (v / 100) * (PB - PT)).toFixed(1),
] as [number, number]);
const LINE = PTS.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
const AREA = `M ${PL} ${PB} ${PTS.map((p) => `L ${p[0]} ${p[1]}`).join(" ")} L ${PR} ${PB} Z`;
const TARGET_Y = PB - (58 / 100) * (PB - PT);

const BARS = [
  [520, 300, 180],
  [980, 760, 240],
  [300, 420, 160],
  [540, 360, 220],
  [880, 700, 300],
  [610, 470, 200],
  [720, 520, 260],
];
const BAR_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const BAR_SERIES = ["#1f7a4d", "#6cc39a", "#c3e8d3"];
const BAR_MAX = 1000;
const BAR_TARGET = 600;

const FILTER_CLICK: [number, number] = [88, 150];
const HOVER: [number, number] = [450, 330];
const START: [number, number] = [1200, 560];

export function DashboardScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.35 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [built, setBuilt] = useState(reduce);

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const runOnce = async (): Promise<void> => {
      setBuilt(false);
      setPressed(false);
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(650);
      if (!alive) return;
      setCursorOn(true);
      setCursor({ x: FILTER_CLICK[0], y: FILTER_CLICK[1] });
      await sleep(1000);
      if (!alive) return;
      setPressed(true);
      await sleep(220);
      if (!alive) return;
      setPressed(false);
      setBuilt(true);
      await sleep(450);
      if (!alive) return;
      setCursor({ x: HOVER[0], y: HOVER[1] });
      await sleep(3200);
      if (!alive) return;
      setCursorOn(false);
    };

    (async () => {
      do {
        await runOnce();
        if (DEMO_LOOP && alive) await sleep(1700);
      } while (DEMO_LOOP && alive);
    })();

    return () => {
      alive = false;
    };
  }, [inView, reduce]);

  // Reveal the revenue line by its real length.
  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = reduce || built ? "0" : `${L}`;
  }, [built, reduce]);

  const EASE = "cubic-bezier(0.33, 0, 0.15, 1)";
  const reveal = (delay: number): CSSProperties => ({
    opacity: built ? 1 : 0,
    transform: built ? "translateY(0)" : "translateY(12px)",
    transition: `opacity 0.45s ease ${delay}s, transform 0.5s ${EASE} ${delay}s`,
  });

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl border border-black/10 shadow-md"
      style={{ height: H * scale, backgroundColor: "#eef2f0" }}
    >
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        {/* Top tab strip */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-white px-4" style={{ height: 34 }}>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#1f7a4d] px-3 py-1 text-[11px] font-semibold text-white">Transaction</span>
            <span className="rounded-md bg-[#e6f2ea] px-3 py-1 text-[11px] font-semibold text-[#1f7a4d]">Enterprise</span>
          </div>
          <div className="flex items-center gap-3 text-[#9AA5AD]">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <Eye className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        {/* Header band */}
        <div className="absolute inset-x-0 flex items-center justify-between px-6" style={{ top: 34, height: 62 }}>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-[#2FA35F]" />
            <span className="text-[18px] font-semibold tracking-tight text-[#1f6b57]">Insight</span>
          </div>
          <div className="text-[22px] font-semibold text-[#1f6b57]">Transaction analysis</div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#8A93A0]">Start date</span>
            <span className="text-[#8A93A0]">→</span>
            <span className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#8A93A0]">End date</span>
          </div>
        </div>

        {/* Left filter rail */}
        <div className="absolute rounded-2xl bg-[#e3f0e8]" style={{ left: 16, top: 108, width: 160, bottom: 16 }}>
          <div className="flex flex-col gap-3 p-3">
            {FILTERS.map((f, i) => (
              <div
                key={f}
                className="flex items-center justify-between rounded-lg bg-[#14664a] px-3 py-2.5 text-[12px] font-medium text-white"
                style={{ transform: pressed && i === 0 ? "scale(0.94)" : "scale(1)", transition: "transform 0.16s ease" }}
              >
                <span className="truncate">{f}</span>
                <span className="opacity-70">▾</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="absolute text-[11px] font-medium leading-tight text-[#7A8891]" style={{ left: 192, top: 118, width: 128 }}>
          This year <span className="text-[#2A3138]">vs</span> last year
        </div>
        {KPIS.map((k, i) => (
          <div
            key={k[0]}
            className="absolute rounded-xl border border-black/8 bg-white px-3 py-2.5 shadow-sm"
            style={{ left: 332 + i * 170, top: 108, width: 158, height: 82, ...reveal(0.05 * i) }}
          >
            <div className="text-[11px] font-medium text-[#7A8891]">{k[0]}</div>
            <div className="mt-1 text-[20px] font-semibold text-[#1f7a4d]">{k[1]}</div>
            <div className="text-[10px] font-semibold" style={{ color: k[3] === "up" ? "#2FA35F" : "#D6553F" }}>{k[2]}</div>
          </div>
        ))}

        {/* Area chart card */}
        <div className="absolute rounded-xl border border-black/8 bg-white p-4 shadow-sm" style={{ left: 192, top: 206, width: 508, height: 262 }}>
          <div className="text-[13px] font-semibold text-[#2A3138]">Revenue by date</div>
          <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" className="mt-2 h-[calc(100%-52px)] w-full" aria-hidden="true">
            <path d={AREA} fill="#2FA35F" style={{ opacity: built ? 0.14 : 0, transition: "opacity 0.7s ease 0.5s" }} />
            <line x1={PL} y1={TARGET_Y} x2={PR} y2={TARGET_Y} stroke="#2FA35F" strokeWidth={1} strokeDasharray="5 4" style={{ opacity: built ? 0.7 : 0, transition: "opacity 0.4s ease 0.4s" }} />
            <path ref={lineRef} d={LINE} fill="none" stroke="#146c4a" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ transition: "stroke-dashoffset 1.2s ease 0.45s" }} />
          </svg>
          <div className="mt-1 flex justify-between px-1 text-[9px] text-[#9AA5AD]">
            {["Apr", "Jun", "Aug", "Oct", "Dec", "Feb"].map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Details table card */}
        <div className="absolute overflow-hidden rounded-xl border border-black/8 bg-white shadow-sm" style={{ left: 712, top: 206, width: 632, height: 262 }}>
          <div className="px-4 py-3 text-[13px] font-semibold text-[#2A3138]">Transaction details</div>
          <div className="grid grid-cols-[1fr_120px_120px_130px] gap-2 bg-[#14664a] px-4 py-2 text-[11px] font-semibold text-white">
            <span>Category</span><span>Transactions</span><span>Clients</span><span>Revenue</span>
          </div>
          {TABLE.map((r, i) => (
            <div
              key={r[0]}
              className="grid grid-cols-[1fr_120px_120px_130px] items-center gap-2 px-4 text-[12.5px]"
              style={{ height: 27, backgroundColor: i % 2 ? "#f5f8f6" : "transparent", ...reveal(0.45 + i * 0.06) }}
            >
              <span className="flex items-center gap-1.5" style={{ fontWeight: r[4] ? 600 : 400, color: "#2A3138" }}>
                {!r[4] && <span className="text-[#9AA5AD]">＋</span>}
                {r[0]}
              </span>
              <span className="text-[#3C4450]">{r[1]}</span>
              <span className="text-[#3C4450]">{r[2]}</span>
              <span className="font-medium text-[#1f7a4d]">{r[3]}</span>
            </div>
          ))}
        </div>

        {/* Pie card */}
        <div className="absolute flex rounded-xl border border-black/8 bg-white p-4 shadow-sm" style={{ left: 192, top: 482, width: 396, bottom: 16 }}>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-[#2A3138]">Booking lead variance</div>
            <svg width="176" height="176" viewBox="0 0 192 192" className="mt-1" aria-hidden="true">
              {PIE_WEDGES.map((w, i) => (
                <path
                  key={i}
                  d={w.d}
                  fill={w.color}
                  style={{ opacity: built ? 1 : 0, transformOrigin: "96px 96px", transform: built ? "scale(1)" : "scale(0.6)", transition: `opacity 0.4s ease ${0.7 + i * 0.08}s, transform 0.5s ${EASE} ${0.7 + i * 0.08}s` }}
                />
              ))}
            </svg>
          </div>
          <div className="flex w-[150px] flex-col justify-center gap-1.5">
            {PIE.map(([label, , color], i) => (
              <div key={label} className="flex items-center gap-2 text-[11px] text-[#3C4450]" style={reveal(0.8 + i * 0.05)}>
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart card */}
        <div className="absolute rounded-xl border border-black/8 bg-white p-4 shadow-sm" style={{ left: 604, top: 482, width: 740, bottom: 16 }}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-[#2A3138]">Shows by month</div>
            <div className="flex items-center gap-3">
              {["15:00", "19:00", "20:00"].map((t, i) => (
                <span key={t} className="flex items-center gap-1 text-[10px] text-[#7A8891]">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: BAR_SERIES[i] }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mt-3 flex h-[150px] items-end justify-between border-b border-black/10 px-2">
            {/* target line */}
            <div className="absolute left-2 right-2 flex items-center" style={{ bottom: (BAR_TARGET / BAR_MAX) * 150 }}>
              <div className="h-px flex-1" style={{ backgroundColor: "#D6553F", opacity: built ? 0.8 : 0, transition: "opacity 0.4s ease 0.6s" }} />
            </div>
            {BARS.map((group, gi) => (
              <div key={gi} className="flex items-end gap-1">
                {group.map((v, si) => (
                  <div
                    key={si}
                    className="w-3.5 rounded-t-sm"
                    style={{
                      height: built ? (v / BAR_MAX) * 150 : 0,
                      backgroundColor: BAR_SERIES[si],
                      transition: `height 0.7s ${EASE} ${0.6 + gi * 0.05 + si * 0.02}s`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between px-2 text-[10px] text-[#9AA5AD]">
            {BAR_MONTHS.map((m) => <span key={m}>{m}</span>)}
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
          <ToolCursor name="Sylvana" color="#1f7a4d" />
        </div>
      </div>
    </div>
  );
}
