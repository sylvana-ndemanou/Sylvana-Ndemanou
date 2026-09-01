// @ts-nocheck
import { cn } from "@s/lib/utils";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export function weekLabels(n: number) {
  const count = Math.max(0, Math.round(n));
  return Array.from({ length: count }, (_, i) => `S${i + 1}`);
}

export function monthLabels(n: number) {
  const count = Math.max(0, Math.round(n));
  return Array.from({ length: count }, (_, i) => {
    const month = MONTHS[i % 12];
    const year = Math.floor(i / 12);
    return year === 0 ? month : `${month}+${year}`;
  });
}

type BarChartProps = {
  values: number[];
  labels?: string[];
  selected?: number | null;
  revealed?: number | null;
  onSelect?: (index: number) => void;
  disabled?: boolean;
  className?: string;
  color?: string;
  unit?: string;
  showValues?: boolean;
  showMean?: boolean;
  kind?: "spike" | "dip" | "break";
};

export function BarChart({
  values,
  labels,
  selected = null,
  revealed = null,
  onSelect,
  disabled,
  className,
  color = "var(--primary)",
  unit,
  showValues = false,
  showMean = false,
  kind = "spike",
}: BarChartProps) {
  const max = Math.max(...values, 1);
  const mean = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
  const interactive = Boolean(onSelect) && !disabled;
  const minPct = showValues ? 12 : 5;

  const axis = labels && labels.length === values.length ? labels : values.map((_, i) => `S${i + 1}`);
  const dense = values.length > 12;

  return (
    <div className={cn("chart-stage w-full", className)}>
      <div className="chart-plot relative flex h-48 items-stretch gap-0.5 sm:h-56 sm:gap-1">
        {showMean ? (
          <span
            className="chart-mean pointer-events-none absolute inset-x-0 z-[1] border-t border-dashed border-foreground/25"
            style={{ bottom: `${(mean / max) * 100}%` }}
          />
        ) : null}
        {values.map((value, index) => {
          const isSelected = selected === index;
          const isReveal = revealed === index;
          const isWrong = isSelected && revealed !== null && revealed !== index;
          const pct = Math.max(minPct, (value / max) * 100);
          return (
            <button
              key={`${index}-${value}`}
              type="button"
              disabled={!interactive}
              onClick={() => onSelect?.(index)}
              aria-label={axis[index]}
              title={axis[index]}
              className={cn(
                "group relative flex h-full min-w-0 flex-1 flex-col items-center gap-1 border-0 bg-transparent p-0 appearance-none",
                interactive && "cursor-pointer"
              )}
            >
              {showValues ? (
                <span className="bar-value pointer-events-none z-[2] font-mono text-[9px] tabular-nums text-foreground/80 sm:text-[10px]">
                  {value}
                  {unit ? ` ${unit}` : ""}
                </span>
              ) : null}
              <span className="relative flex min-h-0 w-full flex-1 items-end">
                <span
                  className={cn(
                    "bar-grow bar-body w-full min-h-3 rounded-t-md transition-[filter,box-shadow,opacity,transform] duration-200",
                    interactive && "group-hover:brightness-125 group-hover:-translate-y-0.5",
                    isSelected && revealed === null && "life-pick ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isReveal && "life-hit",
                    isReveal && kind === "dip" && "bg-chart-2",
                    isReveal && kind === "break" && "bg-chart-5",
                    isReveal && kind === "spike" && "bg-anomaly",
                    isWrong && "bar-miss opacity-45"
                  )}
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isReveal ? undefined : color,
                    ["--bar-delay"]: `${index * 45}ms`,
                  }}
                />
              </span>
              {isReveal ? (
                <span className="pointer-events-none absolute -top-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-anomaly">
                  {kind === "dip" ? "creux" : kind === "break" ? "rupture" : "spike"}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div className={cn("chart-axis mt-1.5 flex gap-0.5 sm:gap-1", dense && "chart-axis-dense")}>
        {axis.map((label, index) => (
          <span
            key={`${label}-${index}`}
            className={cn(
              "min-w-0 flex-1 truncate text-center font-mono text-[9px] text-muted-foreground sm:text-[10px]",
              revealed === index && "font-semibold text-foreground"
            )}
            title={label}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SvgGrid({ w, h, pad }: { w: number; h: number; pad: number }) {
  const ticks = [0.25, 0.5, 0.75];
  return (
    <g stroke="var(--grid-line)" strokeWidth="0.7">
      {ticks.map((t) => (
        <line
          key={`h${t}`}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
        />
      ))}
      {ticks.map((t) => (
        <line
          key={`v${t}`}
          y1={pad}
          y2={h - pad}
          x1={pad + t * (w - pad * 2)}
          x2={pad + t * (w - pad * 2)}
        />
      ))}
    </g>
  );
}

const CHART_INK = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function Sparkline({
  values,
  highlightFrom,
  highlightTo,
  overlay,
  className,
  stroke = "var(--primary)",
  showRange = true,
}: {
  values: number[];
  highlightFrom?: number;
  highlightTo?: number;
  overlay?: "tendance" | "saison" | "bruit" | "rupture" | null;
  className?: string;
  stroke?: string;
  showRange?: boolean;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const w = 320;
  const h = 132;
  const pad = 18;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${d} L ${pts[pts.length - 1]?.x ?? w - pad} ${h - pad} L ${pts[0]?.x ?? pad} ${h - pad} Z`;
  const from = highlightFrom ?? -1;
  const to = highlightTo ?? -1;
  const hi = from >= 0 && to >= 0;
  const x1 = hi ? pts[from]?.x ?? pad : 0;
  const x2 = hi ? pts[to]?.x ?? w - pad : 0;
  const yAt = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const before = values.slice(0, Math.max(from, 1));
  const after = values.slice(Math.max(from, 0));
  const meanBefore = before.reduce((a, b) => a + b, 0) / Math.max(before.length, 1);
  const meanAfter = after.reduce((a, b) => a + b, 0) / Math.max(after.length, 1);
  const spike = pts.reduce((best, p, i) => (values[i] > values[best] ? i : best), 0);
  const peaks = pts
    .map((p, i) => ({ p, i }))
    .filter(
      ({ i }) =>
        i > 0 &&
        i < pts.length - 1 &&
        values[i] >= values[i - 1] &&
        values[i] >= values[i + 1] &&
        values[i] > mean * 1.08
    );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full", className)} role="img">
      <SvgGrid w={w} h={h} pad={pad} />
      {hi ? (
        <rect
          x={Math.min(x1, x2) - 6}
          y={6}
          width={Math.abs(x2 - x1) + 12}
          height={h - 12}
          rx={8}
          className="zone-pulse"
          fill="color-mix(in oklch, var(--primary) 14%, transparent)"
          stroke="color-mix(in oklch, var(--primary) 40%, transparent)"
        />
      ) : null}
      <path d={area} fill="color-mix(in oklch, var(--primary) 12%, transparent)" />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="spark-draw"
      />
      {overlay === "tendance" && first && last ? (
        <line
          x1={first.x}
          y1={first.y}
          x2={last.x}
          y2={last.y}
          stroke="var(--anomaly)"
          strokeWidth="2.2"
          strokeDasharray="5 4"
          className="overlay-in"
        />
      ) : null}
      {overlay === "saison"
        ? peaks.map(({ p, i }) => (
            <g key={i} className="overlay-in">
              <line
                x1={p.x}
                x2={p.x}
                y1={pad}
                y2={h - pad}
                stroke="var(--chart-3)"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.55"
              />
              <circle cx={p.x} cy={p.y} r="5" fill="none" stroke="var(--chart-3)" strokeWidth="2" />
            </g>
          ))
        : null}
      {overlay === "bruit" && pts[spike] ? (
        <circle
          cx={pts[spike].x}
          cy={pts[spike].y}
          r="12"
          fill="none"
          stroke="var(--anomaly)"
          strokeWidth="2.2"
          className="bruit-ring"
        />
      ) : null}
      {overlay === "rupture" && hi ? (
        <g className="overlay-in">
          <line
            x1={x1}
            y1={8}
            x2={x1}
            y2={h - 8}
            stroke="var(--chart-5)"
            strokeWidth="1.8"
            strokeDasharray="3 3"
          />
          <line x1={pad} y1={yAt(meanBefore)} x2={x1} y2={yAt(meanBefore)} stroke="var(--chart-5)" strokeWidth="1.6" />
          <line
            x1={x1}
            y1={yAt(meanAfter)}
            x2={w - pad}
            y2={yAt(meanAfter)}
            stroke="var(--chart-5)"
            strokeWidth="1.6"
          />
        </g>
      ) : null}
      {showRange ? (
        <>
          <text x={4} y={pad + 3} fontSize="8" className="fill-muted-foreground">
            {max.toFixed(max >= 20 ? 0 : 1)}
          </text>
          <text x={4} y={h - pad + 3} fontSize="8" className="fill-muted-foreground">
            {min.toFixed(min >= 20 ? 0 : 1)}
          </text>
        </>
      ) : null}
    </svg>
  );
}

export type ChartKind = "line" | "bar" | "pie" | "area" | "scatter" | "stack";

export function LiveSketch({
  kind,
  values,
  labels,
  stacks,
  points,
}: {
  kind: ChartKind;
  values?: number[];
  labels?: string[];
  stacks?: number[][];
  points?: { x: number; y: number }[];
}) {
  const series = values ?? [];
  const w = 320;
  const h = 150;
  const pad = 16;
  const max = Math.max(1, ...series, ...(stacks ?? []).flat(), ...(points ?? []).map((p) => p.y));

  if (kind === "pie") {
    const total = series.reduce((a, b) => a + b, 0) || 1;
    let angle = -Math.PI / 2;
    const slices = series.map((v, i) => {
      const sweep = (v / total) * Math.PI * 2;
      const start = angle;
      const mid = start + sweep / 2;
      angle += sweep;
      const x1 = 160 + Math.cos(start) * 52;
      const y1 = 75 + Math.sin(start) * 52;
      const x2 = 160 + Math.cos(angle) * 52;
      const y2 = 75 + Math.sin(angle) * 52;
      const large = sweep > Math.PI ? 1 : 0;
      const lx = 160 + Math.cos(mid) * 34;
      const ly = 75 + Math.sin(mid) * 34;
      return {
        d: `M160 75 L${x1} ${y1} A52 52 0 ${large} 1 ${x2} ${y2} Z`,
        i,
        pct: Math.round((v / total) * 100),
        lx,
        ly,
      };
    });
    const crowded = series.length > 5;
    return (
      <svg key="pie" viewBox={`0 0 ${w} ${h}`} className="sketch-in h-40 w-full">
        {slices.map((s) => (
          <path
            key={s.i}
            d={s.d}
            fill={CHART_INK[s.i % CHART_INK.length]}
            opacity={crowded ? 0.45 : 0.82}
            stroke="var(--background)"
            strokeWidth="1.5"
          />
        ))}
        {!crowded
          ? slices.map((s) =>
              s.pct >= 8 ? (
                <text key={`l${s.i}`} x={s.lx} y={s.ly + 3} textAnchor="middle" fontSize="9" fill="var(--background)">
                  {s.pct}%
                </text>
              ) : null
            )
          : (
            <text x="160" y="144" textAnchor="middle" className="fill-anomaly" fontSize="11">
              illisible · trop de parts
            </text>
          )}
      </svg>
    );
  }

  if (kind === "scatter") {
    const pts = points ?? series.map((v, i) => ({ x: i, y: v }));
    const maxX = Math.max(1, ...pts.map((p) => p.x));
    const maxY = Math.max(1, ...pts.map((p) => p.y));
    return (
      <svg key="scatter" viewBox={`0 0 ${w} ${h}`} className="sketch-in h-40 w-full">
        <SvgGrid w={w} h={h} pad={pad} />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={pad + (p.x / maxX) * (w - pad * 2)}
            cy={h - pad - (p.y / maxY) * (h - pad * 2)}
            r="4"
            fill="var(--primary)"
            className="dot-pop"
            style={{ animationDelay: `${i * 28}ms` }}
          />
        ))}
      </svg>
    );
  }

  if (kind === "stack" && stacks && stacks.length) {
    const cols = stacks[0].length;
    const colMax = Array.from({ length: cols }, (_, i) => stacks.reduce((s, row) => s + row[i], 0));
    const top = Math.max(1, ...colMax);
    const gap = (w - pad * 2) / cols;
    return (
      <svg key="stack" viewBox={`0 0 ${w} ${h}`} className="sketch-in h-40 w-full">
        <SvgGrid w={w} h={h} pad={pad} />
        {Array.from({ length: cols }, (_, c) => {
          let y = h - pad;
          return stacks.map((row, s) => {
            const hh = (row[c] / top) * (h - pad * 2);
            y -= hh;
            return (
              <rect
                key={`${s}-${c}`}
                x={pad + c * gap + 4}
                y={y}
                width={Math.max(6, gap - 8)}
                height={hh}
                fill={CHART_INK[s % CHART_INK.length]}
                opacity={0.78}
                className="bar-grow"
                style={{ transformBox: "fill-box", transformOrigin: "center bottom", animationDelay: `${c * 40 + s * 20}ms` }}
              />
            );
          });
        })}
      </svg>
    );
  }

  const barW = series.length ? (w - pad * 2) / series.length : 10;
  const yOf = (v: number) => h - pad - (v / max) * (h - pad * 2);
  const line = series
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(pad + (i + 0.5) * barW).toFixed(1)} ${yOf(v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${(pad + (series.length - 0.5) * barW).toFixed(1)} ${h - pad} L ${pad + 0.5 * barW} ${h - pad} Z`;

  return (
    <svg key={kind} viewBox={`0 0 ${w} ${h}`} className="sketch-in h-40 w-full">
      <SvgGrid w={w} h={h} pad={pad} />
      {kind === "bar"
        ? series.map((v, i) => (
            <rect
              key={i}
              x={pad + i * barW + 3}
              y={yOf(v)}
              width={Math.max(6, barW - 6)}
              height={h - pad - yOf(v)}
              rx="2"
              fill="var(--primary)"
              className="bar-grow"
              style={{ transformBox: "fill-box", transformOrigin: "center bottom", animationDelay: `${i * 40}ms` }}
            />
          ))
        : null}
      {kind === "line" ? (
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.6" className="spark-draw" />
      ) : null}
      {kind === "area" ? (
        <>
          <path d={area} fill="color-mix(in oklch, var(--primary) 28%, transparent)" />
          <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" className="spark-draw" />
        </>
      ) : null}
      {labels?.length && labels.length <= 8
        ? labels.map((lab, i) => (
            <text
              key={`${lab}-${i}`}
              x={pad + (i + 0.5) * barW}
              y={h - 2}
              textAnchor="middle"
              fontSize="8"
              className="fill-muted-foreground"
            >
              {lab}
            </text>
          ))
        : null}
    </svg>
  );
}

export function MiniChartGlyph({
  kind,
  active,
}: {
  kind: "line" | "bar" | "pie" | "area" | "scatter" | "stack";
  active?: boolean;
}) {
  const stroke = active ? "var(--primary-foreground)" : "var(--primary)";
  const fill = active
    ? "color-mix(in oklch, var(--primary-foreground) 25%, transparent)"
    : "color-mix(in oklch, var(--primary) 20%, transparent)";
  return (
    <svg viewBox="0 0 72 48" className="h-12 w-[72px]" aria-hidden>
      {kind === "line" && (
        <path d="M6 34 L20 22 L34 26 L50 10 L66 16" fill="none" stroke={stroke} strokeWidth="2.5" />
      )}
      {kind === "bar" && (
        <>
          <rect x="8" y="20" width="10" height="20" rx="2" fill={stroke} />
          <rect x="24" y="10" width="10" height="30" rx="2" fill={stroke} />
          <rect x="40" y="16" width="10" height="24" rx="2" fill={stroke} />
          <rect x="56" y="24" width="10" height="16" rx="2" fill={stroke} />
        </>
      )}
      {kind === "pie" && (
        <>
          <circle cx="36" cy="24" r="16" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M36 24 L36 8 A16 16 0 0 1 50 32 Z" fill={stroke} />
        </>
      )}
      {kind === "area" && (
        <path
          d="M6 38 L6 28 L22 18 L38 24 L54 12 L66 16 L66 38 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
      )}
      {kind === "scatter" && (
        <>
          <circle cx="16" cy="30" r="3" fill={stroke} />
          <circle cx="28" cy="22" r="3" fill={stroke} />
          <circle cx="38" cy="26" r="3" fill={stroke} />
          <circle cx="50" cy="14" r="3" fill={stroke} />
          <circle cx="58" cy="18" r="3" fill={stroke} />
        </>
      )}
      {kind === "stack" && (
        <>
          <rect x="10" y="28" width="14" height="10" fill={stroke} opacity="0.4" />
          <rect x="10" y="18" width="14" height="10" fill={stroke} opacity="0.7" />
          <rect x="10" y="10" width="14" height="8" fill={stroke} />
          <rect x="30" y="24" width="14" height="14" fill={stroke} opacity="0.4" />
          <rect x="30" y="16" width="14" height="8" fill={stroke} opacity="0.7" />
          <rect x="30" y="8" width="14" height="8" fill={stroke} />
          <rect x="50" y="26" width="14" height="12" fill={stroke} opacity="0.4" />
          <rect x="50" y="18" width="14" height="8" fill={stroke} opacity="0.7" />
          <rect x="50" y="12" width="14" height="6" fill={stroke} />
        </>
      )}
    </svg>
  );
}

export function FunnelShape({
  steps,
  rates,
}: {
  steps: string[];
  rates?: number[];
}) {
  let remaining = 100;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1.5">
      {steps.map((step, i) => {
        const width = 100 - i * (70 / Math.max(steps.length - 1, 1));
        const drop = rates && i > 0 && rates[i - 1] != null ? rates[i - 1] : null;
        if (drop !== null) remaining = Math.round(remaining * (1 - drop / 100));
        const worst =
          rates && drop !== null ? drop === Math.min(...rates.filter((r) => r != null)) : false;
        return (
          <div
            key={step}
            className="funnel-in flex w-full flex-col items-center gap-1"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {drop !== null ? (
              <p
                className={cn(
                  "font-mono text-[11px] tracking-wide",
                  worst ? "text-anomaly" : "text-muted-foreground"
                )}
              >
                −{drop}% {worst ? "· plus grosse fuite" : ""}
              </p>
            ) : null}
            <div
              className={cn(
                "funnel-band flex h-12 items-center justify-between gap-3 px-3 text-sm font-medium text-foreground",
                worst ? "bg-anomaly/18 ring-1 ring-anomaly/40" : "bg-primary/18"
              )}
              style={{
                width: `${width}%`,
                clipPath:
                  i === steps.length - 1
                    ? "polygon(10% 0, 90% 0, 78% 100%, 22% 100%)"
                    : "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",
              }}
            >
              <span className="truncate">{step}</span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{remaining}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RawSeries({
  values,
  labels,
  caption,
}: {
  values: number[];
  labels?: string[];
  caption?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="raw-series relative flex h-40 items-end gap-1 overflow-hidden rounded-xl bg-muted/20 px-3 pb-8 pt-4">
      <span className="chart-grid pointer-events-none absolute inset-3 opacity-40" />
      {values.map((value, i) => (
        <div key={`${i}-${value}`} className="relative z-[1] flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[10px] tabular-nums text-foreground/80">{value}</span>
          <span
          className="raw-dot life-bob block w-full max-w-8 rounded-full bg-primary/55"
            style={{ height: `${Math.max(8, (value / max) * 72)}px`, animationDelay: `${i * 40}ms` }}
          />
          <span className="absolute -bottom-5 font-mono text-[10px] text-muted-foreground">
            {labels?.[i] ?? i + 1}
          </span>
        </div>
      ))}
      <p className="pointer-events-none absolute inset-x-0 top-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {caption}
      </p>
    </div>
  );
}
