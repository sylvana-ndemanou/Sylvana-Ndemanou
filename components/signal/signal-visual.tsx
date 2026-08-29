"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { SignalMark, SIGNAL_PULSE_PATH } from "@/components/signal/signal-mark";

const EASE = [0.22, 1, 0.36, 1] as const;

const LAYERS = ["raw", "staging", "mart"] as const;

/**
 * Code-drawn product surface for the Signal page — a dark workbench with the
 * pulse mark and a simplified "layers of data" schematic. Not a Projects card.
 */
export function SignalVisual(): ReactNode {
  const t = useTranslations("Signal");
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] bg-[#080808] text-[#f0f0f0] ring-1 ring-white/8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 20%, rgba(0,229,204,0.16), transparent 60%)",
        }}
      />

      <div className="relative flex items-center gap-2.5 border-b border-white/8 px-4 py-3 sm:px-5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#00E5CC]/12 text-[#00E5CC] ring-1 ring-[#00E5CC]/25">
          <SignalMark className="h-3 w-4" strokeWidth={1.4} />
        </span>
        <span className="text-[13px] font-medium tracking-tight">
          {t("title")}
        </span>
        <span className="ml-auto rounded-full bg-[#00E5CC]/12 px-2 py-0.5 text-[10px] font-medium tracking-wider text-[#00E5CC] uppercase">
          {t("liveLabel")}
        </span>
      </div>

      <div className="relative px-4 py-6 sm:px-6 sm:py-8">
        <svg
          viewBox="0 0 280 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-auto w-full max-w-md"
          aria-hidden="true"
        >
          <g transform="translate(12 36) scale(16 4)">
            <motion.path
              d={SIGNAL_PULSE_PATH}
              stroke="#00E5CC"
              strokeWidth={0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.4, ease: EASE, delay: 0.15 }
              }
            />
          </g>
        </svg>

        <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
          {LAYERS.map((layer, index) => (
            <motion.div
              key={layer}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.35 + index * 0.1,
                ease: EASE,
              }}
              className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2.5 sm:px-3 sm:py-3"
            >
              <span className="block font-mono text-[10px] tracking-wider text-[#00E5CC]/80 uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-[12px] font-medium tracking-tight sm:text-[13px]">
                {t(`layers.${layer}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
