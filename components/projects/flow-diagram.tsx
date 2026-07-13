"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Abstract, schematic data-flow diagram rendered purely with markup — no
 * product screenshots or fabricated mockups. Nodes stagger in on view and the
 * connectors gently pulse to suggest flow (on the full/detail variant only).
 */
export function FlowDiagram({
  steps,
  compact = false,
}: {
  steps: string[];
  compact?: boolean;
}): ReactNode {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`flex flex-wrap items-stretch gap-2 ${compact ? "" : "sm:gap-3"}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ show: { transition: { staggerChildren: 0.09 } } }}
      aria-hidden={compact ? "true" : undefined}
    >
      {steps.map((step, index) => (
        <div key={`${step}-${index}`} className="flex items-center gap-2 sm:gap-3">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 8, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-center font-medium tracking-tight text-foreground ${
              compact
                ? "px-2.5 py-1.5 text-[11px]"
                : "px-4 py-2.5 text-[12px] sm:text-[13px]"
            }`}
          >
            <span
              className={`inline-block shrink-0 rounded-full bg-accent ${
                compact ? "h-1 w-1" : "h-1.5 w-1.5"
              }`}
              aria-hidden="true"
            />
            {step}
          </motion.div>

          {index < steps.length - 1 && (
            <motion.span
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              className="shrink-0 text-accent"
            >
              <motion.span
                className="inline-flex"
                {...(!compact && !reduceMotion
                  ? {
                      animate: { x: [0, 5, 0], opacity: [0.5, 1, 0.5] },
                      transition: {
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut" as const,
                      },
                    }
                  : {})}
              >
                <ArrowRight
                  className={compact ? "h-3.5 w-3.5" : "h-5 w-5"}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </motion.span>
            </motion.span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
