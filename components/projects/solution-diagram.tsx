"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useId, useRef, type PointerEvent, type ReactNode } from "react";

import {
  hexToRgba,
  layoutFor,
  VISUAL_THEMES,
  type VisualKind,
} from "@/lib/project-visuals";

/** Max render width (px) per archetype — keeps near-square layouts compact. */
const MAX_WIDTH: Partial<Record<VisualKind, number>> = {
  loop: 400,
  layers: 420,
  serpentine: 480,
};

/**
 * Interactive, cursor-reactive schematic of a case study's technical solution.
 * The topology is chosen per project (see `lib/projects.ts`) so no two case
 * studies share the same diagram. Nodes carry the real (anonymized) flow steps;
 * the layer parallax-tilts toward the pointer, connectors pulse, and a data
 * packet travels each edge. Purely illustrative — no client data.
 */
export function SolutionDiagram({
  kind,
  steps,
}: {
  kind: VisualKind;
  steps: string[];
}): ReactNode {
  const reduce = useReducedMotion();
  const { W, H, pts, edges } = layoutFor(kind, steps.length);
  const { hue, text } = VISUAL_THEMES[kind];
  const uid = useId().replace(/[:]/g, "");

  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMove = (e: PointerEvent<HTMLDivElement>): void => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = (): void => {
    mx.set(0);
    my.set(0);
  };

  const maxW = MAX_WIDTH[kind];

  return (
    <div
      ref={ref}
      onPointerMove={reduce ? undefined : handleMove}
      onPointerLeave={reset}
      className="relative overflow-hidden rounded-2xl border p-4 sm:p-6 [perspective:1100px]"
      style={{
        borderColor: hexToRgba(hue, 0.2),
        background: `radial-gradient(120% 90% at 50% 0%, ${hexToRgba(
          hue,
          0.12
        )} 0%, rgba(11,13,16,0) 60%), linear-gradient(180deg, #0e1116 0%, #0a0c0f 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${hexToRgba(
            hue,
            0.06
          )} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(
            hue,
            0.06
          )} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
      />

      <motion.div
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative mx-auto w-full"
      >
        <div
          className="relative mx-auto w-full"
          style={{ aspectRatio: `${W} / ${H}`, maxWidth: maxW }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {edges.map((e, i) => {
              const id = `${uid}-e${i}`;
              return (
                <g key={id}>
                  <path
                    id={id}
                    d={e.d}
                    fill="none"
                    stroke={hexToRgba(hue, 0.35)}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  {!reduce && (
                    <path
                      className="pv-flow"
                      d={e.d}
                      fill="none"
                      stroke={hexToRgba(hue, 0.9)}
                      strokeWidth={1.6}
                      strokeLinecap="round"
                      strokeDasharray="3 46"
                      vectorEffect="non-scaling-stroke"
                      style={{ animationDelay: `${i * 0.4}s` }}
                    />
                  )}
                  {!reduce && (
                    <circle r={2.1} fill={hue}>
                      <animateMotion
                        dur="2.6s"
                        begin={`${i * 0.35}s`}
                        repeatCount="indefinite"
                        rotate="auto"
                        keyPoints="0;1"
                        keyTimes="0;1"
                        calcMode="linear"
                      >
                        <mpath href={`#${id}`} />
                      </animateMotion>
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {pts.map((p, i) => (
            <div
              key={`n-${i}`}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-lg border px-2.5 py-2 text-center backdrop-blur-sm transition-all duration-300"
              style={{
                left: `${(p.x / W) * 100}%`,
                top: `${(p.y / H) * 100}%`,
                width:
                  kind === "layers"
                    ? "62%"
                    : kind === "loop"
                      ? "86px"
                      : "clamp(80px, 21%, 132px)",
                borderColor: p.emphasis
                  ? hexToRgba(hue, 0.75)
                  : hexToRgba(hue, 0.35),
                backgroundColor: p.emphasis
                  ? hexToRgba(hue, 0.16)
                  : "rgba(255,255,255,0.03)",
                boxShadow: p.emphasis
                  ? `0 0 24px -4px ${hexToRgba(hue, 0.55)}`
                  : "none",
              }}
            >
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: hexToRgba(hue, 0.7) }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-[11px] font-medium leading-tight tracking-tight sm:text-[12px]"
                style={{ color: text }}
              >
                {steps[i] ?? ""}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
