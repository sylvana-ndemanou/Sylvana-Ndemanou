"use client";

import { Bookmark, Eye, LayoutGrid } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { ToolCursor } from "@/components/projects/scenes/tool-cursor";
import { useAutoScale } from "@/components/projects/scenes/use-auto-scale";

// TEMP(testing): force motion + loop for recording in reduced-motion browsers.
const FORCE_MOTION = false;
const DEMO_LOOP = false;

const W = 1360;
const H = 760;

type Theme = {
  acc: string; // primary (values, cursor, tab)
  mid: string; // charts / up-deltas
  dark: string; // headers, pills
  lite: string; // tinted backgrounds
  title: string;
  pie: string[];
  bars: string[];
};
const THEMES: Record<string, Theme> = {
  green: { acc: "#1f7a4d", mid: "#2FA35F", dark: "#14664a", lite: "#e3f0e8", title: "#1f6b57", pie: ["#0f5132", "#1f7a4d", "#2FA35F", "#6cc39a", "#a7dcbf", "#d3efdf"], bars: ["#1f7a4d", "#6cc39a", "#c3e8d3"] },
  blue: { acc: "#1f6ba8", mid: "#2f86cc", dark: "#17436e", lite: "#e3eef8", title: "#1f5b86", pie: ["#0f3358", "#17436e", "#2f86cc", "#79b2e2", "#b3d3ee", "#d9e9f7"], bars: ["#17436e", "#79b2e2", "#cfe2f4"] },
  violet: { acc: "#5a49b0", mid: "#7c6bef", dark: "#3f327f", lite: "#ece9f9", title: "#4a3d92", pie: ["#2c2260", "#3f327f", "#7c6bef", "#a99bf0", "#cdc5f6", "#e7e2fb"], bars: ["#3f327f", "#a99bf0", "#ddd6f7"] },
  amber: { acc: "#b06a15", mid: "#e0902f", dark: "#8a5210", lite: "#f7ecdb", title: "#8a5a12", pie: ["#5c3608", "#8a5210", "#e0902f", "#eeb673", "#f4d3a6", "#faead2"], bars: ["#8a5210", "#eeb673", "#f7e2c4"] },
  teal: { acc: "#0f7a78", mid: "#17a2a2", dark: "#0b5a58", lite: "#ddf1f0", title: "#0f6b69", pie: ["#0a4241", "#0b5a58", "#17a2a2", "#67c7c6", "#a9e0df", "#d3efef"], bars: ["#0b5a58", "#67c7c6", "#c3e8e7"] },
};
const THEME_KEYS = ["green", "blue", "violet", "amber", "teal"];
const SWATCH_X = [1108, 1132, 1156, 1180, 1204];
const SWATCH_Y = 17;
const RED = "#D6553F";
const RECOLOR = "background-color 0.5s ease, color 0.5s ease, fill 0.5s ease, stroke 0.5s ease, border-color 0.5s ease";

const FILTERS = ["Date", "Channel", "Show", "Price tier", "Report cat. 2", "Report cat. 3", "Producer"];

const KPIS: [string, string, string, "up" | "down"][] = [
  ["Transactions", "168", "116 ↗", "up"],
  ["Clients", "164", "113 ↗", "up"],
  ["Revenue", "$14,939", "$9,727 ↗", "up"],
  ["Avg client value", "$91.09", "-99.6 ↘", "down"],
  ["Avg transaction", "$88.93", "-11.3 ↘", "down"],
  ["Avg frequency", "1.0", "0 ↘", "down"],
];
const SPARK_UP = "M0 15 L12 9 L24 11 L36 5 L48 7 L60 2";
const SPARK_DOWN = "M0 3 L12 6 L24 4 L36 9 L48 8 L60 14";

const TABLE: [string, string, string, string, boolean][] = [
  ["Total", "168", "164", "$14,939", true],
  ["Comedy", "100", "99", "$8,441", false],
  ["Music", "26", "26", "$2,352", false],
  ["Theatre", "6", "6", "$775", false],
  ["Magic", "5", "5", "$592", false],
  ["Variety", "2", "2", "$240", false],
  ["Youth", "2", "2", "$141", false],
];

const PIE_LABELS = ["Last minute", "1–4 weeks", "1–7 days", "+1 month", "+3 months", "+4 months"];
const PIE_VALS = [100, 34, 25, 15, 12, 8];
const PIE_TOTAL = PIE_VALS.reduce((s, v) => s + v, 0);
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
const PIE_WEDGES = PIE_VALS.map((v) => {
  const a0 = (acc / PIE_TOTAL) * 360;
  acc += v;
  const a1 = (acc / PIE_TOTAL) * 360;
  return wedge(a0, a1);
});

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
const BAR_MAX = 1000;
const BAR_TARGET = 600;

const P = [
  { L: 192, T: 104, Wd: 1152, Ht: 90 },
  { L: 192, T: 206, Wd: 508, Ht: 262 },
  { L: 712, T: 206, Wd: 632, Ht: 262 },
  { L: 192, T: 482, Wd: 396, Ht: 262 },
  { L: 604, T: 482, Wd: 740, Ht: 262 },
];
const START: [number, number] = [1200, 560];

function Card({ children, title }: { children: ReactNode; title: string }): ReactNode {
  return (
    <div className="flex h-full flex-col rounded-xl border border-black/8 bg-white p-4 shadow-sm">
      <div className="text-[13px] font-semibold text-[#2A3138]">{title}</div>
      <div className="relative mt-2 flex-1">{children}</div>
    </div>
  );
}
function Skeleton(): ReactNode {
  return <div className="absolute inset-0 rounded-lg bg-black/[0.05]" />;
}

export function DashboardScene(): ReactNode {
  const prefersReduce = useReducedMotion() ?? false;
  const reduce = FORCE_MOTION ? false : prefersReduce;
  const ref = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<SVGPathElement | null>(null);
  const scale = useAutoScale(ref, W);
  const inView = useInView(ref, { once: !DEMO_LOOP, amount: 0.35 });

  const [cursor, setCursor] = useState({ x: START[0], y: START[1] });
  const [cursorOn, setCursorOn] = useState(false);
  const [placed, setPlaced] = useState(reduce ? P.length : 0);
  const [carry, setCarry] = useState<number | null>(null);
  const [theme, setTheme] = useState("green");
  const T = THEMES[theme]!;

  useEffect(() => {
    if (!inView || reduce) return;
    let alive = true;
    const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

    const placePanel = async (i: number): Promise<boolean> => {
      const s = P[i]!;
      setCursor({ x: s.L - 110, y: s.T - 54 });
      await sleep(820);
      if (!alive) return false;
      setCarry(i);
      await sleep(340);
      if (!alive) return false;
      setCursor({ x: s.L + 30, y: s.T + 16 });
      await sleep(880);
      if (!alive) return false;
      setPlaced((p) => Math.max(p, i + 1));
      setCarry(null);
      await sleep(760);
      return alive;
    };

    const runOnce = async (): Promise<void> => {
      setPlaced(0);
      setCarry(null);
      setTheme("green");
      setCursor({ x: START[0], y: START[1] });
      setCursorOn(false);
      await sleep(650);
      if (!alive) return;
      setCursorOn(true);
      await sleep(400);
      for (let i = 0; i < P.length; i++) {
        if (!(await placePanel(i))) return;
      }
      // Then pick a colour theme with the cursor.
      await sleep(500);
      if (!alive) return;
      setCursor({ x: SWATCH_X[2]!, y: SWATCH_Y });
      await sleep(900);
      if (!alive) return;
      setTheme("violet");
      await sleep(1600);
      if (!alive) return;
      setCursor({ x: SWATCH_X[1]!, y: SWATCH_Y });
      await sleep(900);
      if (!alive) return;
      setTheme("blue");
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

    return () => {
      alive = false;
    };
  }, [inView, reduce]);

  useLayoutEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = reduce || placed > 1 ? "0" : `${L}`;
  }, [placed, reduce]);

  const EASE = "cubic-bezier(0.33, 0, 0.15, 1)";
  const MOVE = "0.9s";
  const reveal = (shown: boolean, delay: number): CSSProperties => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.4s ease ${delay}s, transform 0.45s ${EASE} ${delay}s`,
  });
  const panelStyle = (i: number): CSSProperties => {
    const s = P[i]!;
    const placedP = i < placed;
    const carried = i === carry;
    return {
      position: "absolute",
      left: placedP ? s.L : carried ? cursor.x - 30 : s.L - 140,
      top: placedP ? s.T : carried ? cursor.y - 16 : s.T - 70,
      width: s.Wd,
      height: s.Ht,
      opacity: placedP || carried ? 1 : 0,
      transform: carried ? "scale(1.02)" : "scale(1)",
      zIndex: carried ? 22 : 1,
      filter: carried ? "drop-shadow(0 16px 30px rgba(0,0,0,0.25))" : "none",
      transition: `left ${MOVE} ${EASE}, top ${MOVE} ${EASE}, opacity 0.35s ease, transform 0.25s ease`,
    };
  };
  const built = (i: number): boolean => i < placed;
  const skel = (i: number): boolean => i === carry;

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
            <span className="rounded-md px-3 py-1 text-[11px] font-semibold text-white" style={{ backgroundColor: T.acc, transition: RECOLOR }}>Transaction</span>
            <span className="rounded-md px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: T.lite, color: T.acc, transition: RECOLOR }}>Enterprise</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-[#9AA5AD]">Theme</span>
            {THEME_KEYS.map((k) => (
              <span
                key={k}
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: THEMES[k]!.acc, outline: theme === k ? `2px solid ${THEMES[k]!.acc}` : "none", outlineOffset: 2 }}
              />
            ))}
            <span className="mx-1 h-4 w-px bg-black/10" />
            <LayoutGrid className="h-4 w-4 text-[#9AA5AD]" aria-hidden="true" />
            <Bookmark className="h-4 w-4 text-[#9AA5AD]" aria-hidden="true" />
            <Eye className="h-4 w-4 text-[#9AA5AD]" aria-hidden="true" />
          </div>
        </div>

        {/* Header band */}
        <div className="absolute inset-x-0 flex items-center justify-between px-6" style={{ top: 34, height: 62 }}>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md" style={{ backgroundColor: T.mid, transition: RECOLOR }} />
            <span className="text-[18px] font-semibold tracking-tight" style={{ color: T.title, transition: RECOLOR }}>Insight</span>
          </div>
          <div className="text-[22px] font-semibold" style={{ color: T.title, transition: RECOLOR }}>Transaction analysis</div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#8A93A0]">Start date</span>
            <span className="text-[#8A93A0]">→</span>
            <span className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] text-[#8A93A0]">End date</span>
          </div>
        </div>

        {/* Left filter rail */}
        <div className="absolute rounded-2xl" style={{ left: 16, top: 108, width: 160, bottom: 16, backgroundColor: T.lite, transition: RECOLOR }}>
          <div className="flex flex-col gap-3 p-3">
            {FILTERS.map((f) => (
              <div key={f} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] font-medium text-white" style={{ backgroundColor: T.dark, transition: RECOLOR }}>
                <span className="truncate">{f}</span>
                <span className="opacity-70">▾</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 0 — KPI row */}
        <div style={panelStyle(0)}>
          <div className="flex h-full items-stretch gap-3">
            <div className="flex w-[128px] shrink-0 items-center text-[11px] font-medium leading-tight text-[#7A8891]" style={reveal(built(0), 0)}>
              This year <span className="mx-1 text-[#2A3138]">vs</span> last year
            </div>
            {KPIS.map((k, i) => (
              <div key={k[0]} className="relative flex-1 rounded-xl border border-black/8 bg-white px-3 py-2 shadow-sm">
                {skel(0) && <span className="absolute inset-2.5 rounded bg-black/[0.05]" />}
                <div style={reveal(built(0), 0.05 * i)}>
                  <div className="text-[11px] font-medium text-[#7A8891]">{k[0]}</div>
                  <div className="mt-0.5 text-[18px] font-semibold" style={{ color: T.acc, transition: RECOLOR }}>{k[1]}</div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold" style={{ color: k[3] === "up" ? T.mid : RED, transition: RECOLOR }}>{k[2]}</span>
                    <svg width="52" height="16" viewBox="0 0 60 16" className="opacity-90" aria-hidden="true">
                      <path d={k[3] === "up" ? SPARK_UP : SPARK_DOWN} fill="none" stroke={k[3] === "up" ? T.mid : RED} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{ transition: RECOLOR }} />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 1 — area chart */}
        <div style={panelStyle(1)}>
          <Card title="Revenue by date">
            {skel(1) && <Skeleton />}
            <div className="flex h-full" style={reveal(built(1), 0)}>
              <div className="flex w-8 shrink-0 flex-col justify-between py-1 text-[8px] text-[#9AA5AD]">
                <span>$100k</span><span>$50k</span><span>$0</span>
              </div>
              <div className="flex flex-1 flex-col">
                <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" className="w-full flex-1" aria-hidden="true">
                  {[PT, (PT + PB) / 2, PB].map((y) => <line key={y} x1={PL} y1={y} x2={PR} y2={y} stroke="#000" strokeOpacity={0.06} strokeWidth={1} />)}
                  <path d={AREA} fill={T.mid} style={{ opacity: built(1) ? 0.14 : 0, transition: `opacity 0.7s ease 0.3s, fill 0.5s ease` }} />
                  <line x1={PL} y1={TARGET_Y} x2={PR} y2={TARGET_Y} stroke={T.mid} strokeWidth={1} strokeDasharray="5 4" opacity={0.75} style={{ transition: RECOLOR }} />
                  <path ref={lineRef} d={LINE} fill="none" stroke={T.dark} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ transition: "stroke-dashoffset 1.2s ease 0.2s, stroke 0.5s ease" }} />
                </svg>
                <div className="flex justify-between px-1 text-[9px] text-[#9AA5AD]">
                  {["Apr", "Jun", "Aug", "Oct", "Dec", "Feb"].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Panel 2 — details table */}
        <div style={panelStyle(2)}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-black/8 bg-white shadow-sm">
            <div className="px-4 py-3 text-[13px] font-semibold text-[#2A3138]">Transaction details</div>
            {skel(2) && <span className="absolute inset-x-3 bottom-3 top-12 rounded-lg bg-black/[0.05]" />}
            <div className="grid grid-cols-[1fr_120px_120px_130px] gap-2 px-4 py-2 text-[11px] font-semibold text-white" style={{ backgroundColor: T.dark, transition: RECOLOR, ...reveal(built(2), 0) }}>
              <span>Category</span><span>Transactions</span><span>Clients</span><span>Revenue</span>
            </div>
            {TABLE.map((r, i) => (
              <div key={r[0]} className="grid grid-cols-[1fr_120px_120px_130px] items-center gap-2 px-4 text-[12.5px]" style={{ height: 27, backgroundColor: i % 2 ? "#f5f8f6" : "transparent", ...reveal(built(2), 0.1 + i * 0.06) }}>
                <span className="flex items-center gap-1.5" style={{ fontWeight: r[4] ? 600 : 400, color: "#2A3138" }}>
                  {!r[4] && <span className="text-[#9AA5AD]">＋</span>}
                  {r[0]}
                </span>
                <span className="text-[#3C4450]">{r[1]}</span>
                <span className="text-[#3C4450]">{r[2]}</span>
                <span className="font-medium" style={{ color: T.acc, transition: RECOLOR }}>{r[3]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3 — pie */}
        <div style={panelStyle(3)}>
          <Card title="Booking lead variance">
            {skel(3) && <Skeleton />}
            <div className="flex h-full items-center" style={reveal(built(3), 0)}>
              <svg width="160" height="160" viewBox="0 0 192 192" aria-hidden="true">
                {PIE_WEDGES.map((d, i) => (
                  <path key={i} d={d} fill={T.pie[i]} style={{ transformOrigin: "96px 96px", transform: built(3) ? "scale(1)" : "scale(0.4)", opacity: built(3) ? 1 : 0, transition: `transform 0.5s ${EASE} ${0.15 + i * 0.08}s, opacity 0.4s ease ${0.15 + i * 0.08}s, fill 0.5s ease` }} />
                ))}
              </svg>
              <div className="flex flex-col gap-1.5 pl-1">
                {PIE_LABELS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2 text-[11px] text-[#3C4450]">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: T.pie[i], transition: RECOLOR }} />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Panel 4 — bar chart */}
        <div style={panelStyle(4)}>
          <Card title="Shows by month">
            {skel(4) && <Skeleton />}
            <div style={reveal(built(4), 0)}>
              <div className="mb-2 flex items-center justify-end gap-3">
                {["15:00", "19:00", "20:00"].map((t, i) => (
                  <span key={t} className="flex items-center gap-1 text-[10px] text-[#7A8891]">
                    <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: T.bars[i], transition: RECOLOR }} />
                    {t}
                  </span>
                ))}
              </div>
              <div className="relative flex h-[150px] items-end justify-between border-b border-black/10 px-2">
                {[0.5, 1].map((f) => <div key={f} className="absolute left-2 right-2 h-px bg-black/[0.06]" style={{ bottom: f * 150 }} />)}
                <div className="absolute left-2 right-2" style={{ bottom: (BAR_TARGET / BAR_MAX) * 150 }}>
                  <div className="h-px w-full" style={{ backgroundColor: RED, opacity: 0.8 }} />
                </div>
                {BARS.map((group, gi) => (
                  <div key={gi} className="relative flex items-end gap-1">
                    {group.map((v, si) => (
                      <div key={si} className="w-3.5 rounded-t-sm" style={{ height: built(4) ? (v / BAR_MAX) * 150 : 0, backgroundColor: T.bars[si], transition: `height 0.7s ${EASE} ${0.15 + gi * 0.05 + si * 0.02}s, background-color 0.5s ease` }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between px-2 text-[10px] text-[#9AA5AD]">
                {BAR_MONTHS.map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>
          </Card>
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
          <ToolCursor name="Sylvana" color={T.acc} />
        </div>
      </div>
    </div>
  );
}
