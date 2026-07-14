import type { ReactNode } from "react";

import {
  hexToRgba,
  posterLayout,
  VISUAL_THEMES,
  type VisualKind,
} from "@/lib/project-visuals";

/**
 * Ambient, label-less cover art for a case study — a glowing, code-drawn
 * schematic keyed to the project's archetype. Deterministic and crisp at any
 * size; a deliberate, on-brand alternative to generic AI cover images. Used on
 * the project cards and as the case-study header banner.
 */
export function ProjectPoster({
  kind,
  className,
}: {
  kind: VisualKind;
  className?: string;
}): ReactNode {
  const { W, H, pts, edges } = posterLayout(kind);
  const { hue } = VISUAL_THEMES[kind];
  const uid = `pv-${kind}`;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(130% 90% at 50% 0%, ${hexToRgba(
          hue,
          0.16
        )} 0%, rgba(11,13,16,0) 58%), linear-gradient(180deg, #0e1116 0%, #0a0c0f 100%)`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${hexToRgba(
            hue,
            0.14
          )} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
          opacity: 0.5,
          maskImage:
            "radial-gradient(120% 100% at 50% 40%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 100% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {edges.map((e, i) => (
          <g key={`e-${i}`}>
            <path
              d={e.d}
              fill="none"
              stroke={hexToRgba(hue, 0.32)}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
            <path
              className="pv-flow"
              d={e.d}
              fill="none"
              stroke={hexToRgba(hue, 0.95)}
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeDasharray="3 58"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          </g>
        ))}

        {pts.map((p, i) => {
          if (kind === "layers") {
            const bw = W * 0.62;
            const bh = 12;
            return (
              <g key={`n-${i}`}>
                <rect
                  x={p.x - bw / 2}
                  y={p.y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={5}
                  fill={hexToRgba(hue, 0.1)}
                  stroke={hexToRgba(hue, 0.55)}
                  strokeWidth={1}
                />
                <rect
                  x={p.x - bw / 2 + 4}
                  y={p.y - 1}
                  width={bw * (0.3 + 0.14 * i)}
                  height={2}
                  rx={1}
                  fill={hexToRgba(hue, 0.7)}
                />
              </g>
            );
          }
          const r = p.emphasis ? 6.5 : 5;
          return (
            <g key={`n-${i}`}>
              <circle cx={p.x} cy={p.y} r={r + 8} fill={hexToRgba(hue, 0.12)} />
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={hexToRgba(hue, 0.16)}
                stroke={hexToRgba(hue, 0.85)}
                strokeWidth={1.2}
              />
              <circle cx={p.x} cy={p.y} r={r * 0.42} fill={hexToRgba(hue, 0.95)} />
              {p.emphasis ? (
                <circle
                  className="pv-pulse"
                  cx={p.x}
                  cy={p.y}
                  r={r + 4}
                  fill="none"
                  stroke={hexToRgba(hue, 0.6)}
                  strokeWidth={0.9}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 60px 0 rgba(0,0,0,0.45)`,
        }}
        data-uid={uid}
      />
    </div>
  );
}
