import type { ReactNode } from "react";

// Brand-ish colors for the real tools; falls back to graphite. Matched loosely
// so variants ("SQL (SCD2)", "REST APIs", "Power BI") still resolve.
const TOOL_COLORS: Array<{ match: RegExp; bg: string; fg: string }> = [
  { match: /snowflake/i, bg: "#29B5E8", fg: "#ffffff" },
  { match: /matillion/i, bg: "#19232d", fg: "#ffffff" },
  { match: /astrato/i, bg: "#6c5ce7", fg: "#ffffff" },
  { match: /power ?bi/i, bg: "#e0a400", fg: "#1a1a1a" },
  { match: /bigquery/i, bg: "#4285f4", fg: "#ffffff" },
  { match: /notion/i, bg: "#1f1f1f", fg: "#ffffff" },
  { match: /make/i, bg: "#6d00cc", fg: "#ffffff" },
  { match: /claude/i, bg: "#c8663f", fg: "#ffffff" },
  { match: /python|javascript|\bjs\b/i, bg: "#3776ab", fg: "#ffffff" },
  { match: /figma/i, bg: "#e64a19", fg: "#ffffff" },
  { match: /scrum/i, bg: "#1f7a4d", fg: "#ffffff" },
  { match: /materialized/i, bg: "#3d5a80", fg: "#ffffff" },
  { match: /sql/i, bg: "#4479a1", fg: "#ffffff" },
  { match: /rest|odata|\bapi/i, bg: "#525252", fg: "#ffffff" },
  { match: /pdf/i, bg: "#9a3b3b", fg: "#ffffff" },
];

function styleFor(name: string): { bg: string; fg: string } {
  return TOOL_COLORS.find((c) => c.match.test(name)) ?? { bg: "#3a3a3a", fg: "#ffffff" };
}

/** Stylized cards for the tools used — a visual stand-in for the (confidential)
 * client work: a colored monogram tile plus the tool name. */
export function ToolGrid({ tools }: { tools: string[] }): ReactNode {
  return (
    <ul className="flex flex-col gap-2.5">
      {tools.map((tool) => {
        const { bg, fg } = styleFor(tool);
        return (
          <li
            key={tool}
            className="flex items-center gap-3 rounded-xl border border-foreground/8 bg-background p-2 pr-3.5"
          >
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[14px] font-semibold"
              style={{ backgroundColor: bg, color: fg }}
              aria-hidden="true"
            >
              {tool.charAt(0)}
            </span>
            <span className="text-[14px] font-medium tracking-tight text-foreground/85">
              {tool}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
