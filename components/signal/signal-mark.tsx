"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Official Signal v2 pulse mark (Brand Kit).
 * Path: M 0 6 L 4.5 6 L 6 10 L 9 2 L 10.5 6 L 16 6 — viewBox 0 0 16 12
 */
export const SIGNAL_PULSE_PATH = "M 0 6 L 4.5 6 L 6 10 L 9 2 L 10.5 6 L 16 6";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SignalMark({
  className,
  title = "Signal",
  strokeWidth = 1.2,
  animated = false,
}: {
  className?: string;
  title?: string;
  strokeWidth?: number;
  animated?: boolean;
}): ReactNode {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animated && !reduceMotion;

  return (
    <svg
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d={SIGNAL_PULSE_PATH}
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          shouldAnimate ? { duration: 1.1, ease: EASE } : { duration: 0 }
        }
      />
    </svg>
  );
}
