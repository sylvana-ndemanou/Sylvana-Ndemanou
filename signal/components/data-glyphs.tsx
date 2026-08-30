import { cn } from "@/lib/utils";

export function MiniTable({
  name,
  headers,
  rows,
  highlightRows,
  keyCols = 0,
  selectedCols,
  onToggleCol,
  disabled,
  selectTone = "key",
}: {
  name: string;
  headers: string[];
  rows: string[][];
  highlightRows?: number[];
  keyCols?: number;
  selectedCols?: string[];
  onToggleCol?: (header: string) => void;
  disabled?: boolean;
  selectTone?: "key" | "yank";
}) {
  const marked = new Set(highlightRows ?? []);
  const picked = new Set(selectedCols ?? []);
  const interactive = Boolean(onToggleCol) && !disabled;
  return (
    <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-card">
      <p className="border-b border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-signal">
        {name}
      </p>
      <table className="w-full text-left font-mono text-[11px] sm:text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            {headers.map((h, i) => {
              const on = picked.has(h) || (!interactive && i < keyCols);
              return (
                <th key={h} className="p-0 font-medium">
                  {interactive ? (
                    <button
                      type="button"
                      onClick={() => onToggleCol?.(h)}
                      className={cn(
                        "w-full px-2 py-2 text-left transition",
                        on && selectTone === "key" && "bg-primary text-primary-foreground",
                        on && selectTone === "yank" && "bg-anomaly/20 text-anomaly line-through",
                        !on && "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {on ? (selectTone === "yank" ? `☠️ ${h}` : `🔑 ${h}`) : h}
                    </button>
                  ) : (
                    <span className={cn("block px-2 py-1.5", on && "text-signal")}>
                      {on ? `🔑 ${h}` : h}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={`${r}-${row.join("-")}`}
              className={cn(marked.has(r) && "bg-anomaly/20 text-anomaly")}
            >
              {row.map((cell, c) => (
                <td
                  key={`${r}-${c}`}
                  className={cn(
                    "whitespace-nowrap px-2 py-1",
                    picked.has(headers[c]) && selectTone === "key" && "bg-primary/10",
                    picked.has(headers[c]) && selectTone === "yank" && "bg-anomaly/10 line-through"
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StarSchemaGlyph({ compact }: { compact?: boolean }) {
  const box = compact ? "h-7 w-12 text-[8px]" : "h-9 w-16 text-[10px]";
  const fact = compact ? "h-9 w-14 text-[9px]" : "h-11 w-20 text-[11px]";
  return (
    <div className={cn("grid place-items-center gap-1", compact ? "py-2" : "py-4")}>
      <div className={cn("flex items-center justify-center rounded-md bg-chart-2/25 font-mono", box)}>
        date
      </div>
      <div className="flex items-center gap-1">
        <div className={cn("flex items-center justify-center rounded-md bg-chart-2/25 font-mono", box)}>
          magasin
        </div>
        <div className={cn("flex items-center justify-center rounded-md bg-primary font-mono text-primary-foreground", fact)}>
          fait
        </div>
        <div className={cn("flex items-center justify-center rounded-md bg-chart-2/25 font-mono", box)}>
          produit
        </div>
      </div>
      <div className={cn("flex items-center justify-center rounded-md bg-chart-2/25 font-mono", box)}>
        client
      </div>
    </div>
  );
}

export function PipelineGlyph() {
  const layers = [
    { name: "bronze", cls: "bg-chart-4/40" },
    { name: "silver", cls: "bg-chart-3/50" },
    { name: "gold", cls: "bg-primary/80 text-primary-foreground" },
  ];
  return (
    <div className="flex items-center justify-center gap-1 py-6">
      {layers.map((l, i) => (
        <div key={l.name} className="flex items-center gap-1">
          <div className={cn("rounded-md px-2 py-2 font-mono text-[10px]", l.cls)}>{l.name}</div>
          {i < layers.length - 1 ? <span className="text-muted-foreground">→</span> : null}
        </div>
      ))}
    </div>
  );
}

export function JoinGlyph() {
  return (
    <div className="relative mx-auto h-24 w-40">
      <div className="absolute left-2 top-4 h-16 w-20 rounded-lg border-2 border-chart-2/80 bg-chart-2/20" />
      <div className="absolute right-2 top-6 h-16 w-20 rounded-lg border-2 border-primary/80 bg-primary/20" />
    </div>
  );
}

export function GrainGlyph() {
  return (
    <div className="px-1 py-2">
      <div className="overflow-hidden rounded-lg border border-border font-mono text-[10px]">
        <div className="grid grid-cols-3 border-b border-border bg-primary/15 text-primary">
          <span className="px-2 py-1">date</span>
          <span className="px-2 py-1">sku</span>
          <span className="px-2 py-1">qty</span>
        </div>
        {["04-01 · A · 12", "04-01 · B · 4", "04-02 · A · 9"].map((line) => {
          const [a, b, c] = line.split(" · ");
          return (
            <div key={line} className="grid grid-cols-3 border-b border-border/60 last:border-0">
              <span className="px-2 py-1 text-primary">{a}</span>
              <span className="px-2 py-1 text-primary">{b}</span>
              <span className="px-2 py-1">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
