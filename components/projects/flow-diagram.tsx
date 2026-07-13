import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Abstract, schematic data-flow diagram rendered purely with markup — no
 * product screenshots or fabricated mockups. Used on project cards and case
 * study pages to illustrate a pipeline without exposing any client system.
 */
export function FlowDiagram({
  steps,
  compact = false,
}: {
  steps: string[];
  compact?: boolean;
}): ReactNode {
  return (
    <div
      className={`flex flex-wrap items-stretch gap-2 ${compact ? "" : "sm:gap-3"}`}
      aria-hidden={compact ? "true" : undefined}
    >
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.03] text-center font-medium tracking-tight text-foreground/80 dark:bg-foreground/[0.06] ${
              compact
                ? "px-2.5 py-1.5 text-[11px]"
                : "px-3.5 py-2.5 text-[12px] sm:text-[13px]"
            }`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <ArrowRight
              className={`shrink-0 text-accent ${compact ? "h-3 w-3" : "h-4 w-4"}`}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
}
