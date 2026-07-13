"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { LOGO_PATHS } from "./logo";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The monogram drawn stroke-by-stroke (SVG pathLength animation) for a clean,
 * smooth line-draw effect. Used as a signature-style reveal.
 *
 * - `trigger="mount"` draws once on mount.
 * - `trigger="inView"` draws when scrolled into view.
 * - `loop` replays the draw continuously (used for the faint hero watermark).
 */
export function AnimatedLogo({
  className,
  title = "Sylvana Ndemanou",
  duration = 1.6,
  delay = 0,
  strokeWidth = 4,
  trigger = "mount",
  loop = false,
}: {
  className?: string;
  title?: string;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  trigger?: "mount" | "inView";
  loop?: boolean;
}): ReactNode {
  const reduceMotion = useReducedMotion();
  const perStroke = duration / LOGO_PATHS.length;

  const animateProps = reduceMotion
    ? { animate: { pathLength: 1, opacity: 1 } }
    : trigger === "inView"
      ? {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: !loop, margin: "-40px" },
        }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
        };

  return (
    <svg
      viewBox="0 0 157 151"
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
      {LOGO_PATHS.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          {...animateProps}
          transition={{
            duration: perStroke * 3,
            delay: delay + i * perStroke,
            ease: EASE,
            ...(loop && !reduceMotion
              ? { repeat: Infinity, repeatType: "loop" as const, repeatDelay: 1.2 }
              : {}),
          }}
        />
      ))}
    </svg>
  );
}
