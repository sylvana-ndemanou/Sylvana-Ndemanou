import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const WEEKS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12"];

export function weekLabels(n: number) {
  return WEEKS.slice(0, n);
}

export function monthLabels(n: number) {
  return MONTHS.slice(0, n);
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
}: BarChartProps) {
  const max = Math.max(...values, 1);
  const interactive = Boolean(onSelect) && !disabled;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex h-52 items-stretch gap-1.5 sm:h-64 sm:gap-2">
        {values.map((value, index) => {
          const isSelected = selected === index;
          const isReveal = revealed === index;
          const isWrong = isSelected && revealed !== null && revealed !== index;
          const pct = Math.max(10, (value / max) * 100);
          return (
            <button
              key={`${index}-${value}`}
              type="button"
              disabled={!interactive}
              onClick={() => onSelect?.(index)}
              className={cn(
                "group relative flex h-full min-w-0 flex-1 flex-col items-center gap-2 border-0 bg-transparent p-0 appearance-none",
                interactive && "cursor-pointer"
              )}
            >
              <span className="relative flex min-h-0 w-full flex-1 items-end">
                <span
                  className={cn(
                    "w-full min-h-3 rounded-t-md transition-all duration-200",
                    interactive && "group-hover:brightness-125",
                    isSelected && revealed === null && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    isReveal && "bg-anomaly",
                    isWrong && "opacity-40"
                  )}
                  style={{
                    height: `${pct}%`,
                    backgroundColor: isReveal ? undefined : color,
                  }}
                />
              </span>
              {labels?.[index] ? (
                <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
                  {labels[index]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  highlightFrom,
  highlightTo,
  overlay,
  className,
  stroke = "var(--primary)",
}: {
  values: number[];
  highlightFrom?: number;
  highlightTo?: number;
  overlay?: "tendance" | "saison" | "bruit" | "rupture" | null;
  className?: string;
  stroke?: string;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const w = 320;
  const h = 120;
  const pad = 8;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const from = highlightFrom ?? -1;
  const to = highlightTo ?? -1;
  const hi = from >= 0 && to >= 0;
  const x1 = hi ? pts[from]?.x ?? pad : 0;
  const x2 = hi ? pts[to]?.x ?? w - pad : 0;
  const yAt = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2);
  const first = pts[0];
  const last = pts[pts.length - 1];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const spike = pts.reduce((best, p, i) => (values[i] > values[best] ? i : best), 0);
  const peaks = pts
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i > 0 && i < pts.length - 1 && values[i] >= values[i - 1] && values[i] >= values[i + 1] && values[i] > mean * 1.08);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full", className)} role="img">
      {hi ? (
        <rect
          x={Math.min(x1, x2) - 6}
          y={4}
          width={Math.abs(x2 - x1) + 12}
          height={h - 8}
          rx={8}
          fill="color-mix(in oklch, var(--primary) 12%, transparent)"
          stroke="color-mix(in oklch, var(--primary) 35%, transparent)"
        />
      ) : null}
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      {overlay === "tendance" && first && last ? (
        <line
          x1={first.x}
          y1={first.y}
          x2={last.x}
          y2={last.y}
          stroke="var(--anomaly)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      ) : null}
      {overlay === "saison"
        ? peaks.map(({ p, i }) => (
            <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="none" stroke="var(--chart-3)" strokeWidth="2" />
          ))
        : null}
      {overlay === "bruit" && pts[spike] ? (
        <circle cx={pts[spike].x} cy={pts[spike].y} r="11" fill="none" stroke="var(--anomaly)" strokeWidth="2" />
      ) : null}
      {overlay === "rupture" && hi ? (
        <>
          <line
            x1={x1}
            y1={8}
            x2={x1}
            y2={h - 8}
            stroke="var(--chart-5)"
            strokeWidth="1.6"
            strokeDasharray="3 3"
          />
          <line
            x1={pad}
            y1={yAt(values.slice(0, Math.max(from, 1)).reduce((a, b) => a + b, 0) / Math.max(from, 1))}
            x2={x1}
            y2={yAt(values.slice(0, Math.max(from, 1)).reduce((a, b) => a + b, 0) / Math.max(from, 1))}
            stroke="var(--chart-5)"
            strokeWidth="1.5"
          />
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
      angle += sweep;
      const x1 = 160 + Math.cos(start) * 52;
      const y1 = 75 + Math.sin(start) * 52;
      const x2 = 160 + Math.cos(angle) * 52;
      const y2 = 75 + Math.sin(angle) * 52;
      const large = sweep > Math.PI ? 1 : 0;
      return { d: `M160 75 L${x1} ${y1} A52 52 0 ${large} 1 ${x2} ${y2} Z`, i };
    });
    const crowded = series.length > 5;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
        {slices.map((s) => (
          <path
            key={s.i}
            d={s.d}
            fill="var(--primary)"
            opacity={0.35 + (s.i / Math.max(series.length, 1)) * 0.6}
            stroke="var(--background)"
            strokeWidth="1"
          />
        ))}
        {crowded ? (
          <text x="160" y="144" textAnchor="middle" className="fill-anomaly" fontSize="11">
            illisible
          </text>
        ) : null}
      </svg>
    );
  }

  if (kind === "scatter") {
    const pts = points ?? series.map((v, i) => ({ x: i, y: v }));
    const maxX = Math.max(1, ...pts.map((p) => p.x));
    const maxY = Math.max(1, ...pts.map((p) => p.y));
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={pad + (p.x / maxX) * (w - pad * 2)}
            cy={h - pad - (p.y / maxY) * (h - pad * 2)}
            r="4"
            fill="var(--primary)"
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
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
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
                fill="var(--primary)"
                opacity={0.4 + s * 0.25}
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      {kind === "bar" || kind === "area" ? null : null}
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
            />
          ))
        : null}
      {kind === "line" ? <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.6" /> : null}
      {kind === "area" ? (
        <path d={area} fill="color-mix(in oklch, var(--primary) 28%, transparent)" stroke="var(--primary)" strokeWidth="2" />
      ) : null}
      {labels?.length && labels.length <= 6
        ? labels.map((lab, i) => (
            <text
              key={lab}
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
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2">
      {steps.map((step, i) => {
        const width = 100 - i * (70 / Math.max(steps.length - 1, 1));
        const drop = rates && i > 0 && rates[i - 1] != null ? rates[i - 1] : null;
        const worst =
          rates && drop !== null ? drop === Math.min(...rates.filter((r) => r != null)) : false;
        return (
          <div key={step} className="flex w-full flex-col items-center gap-1">
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
              className="flex h-11 items-center justify-center rounded-md bg-primary/15 text-sm font-medium text-foreground"
              style={{ width: `${width}%` }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
}
