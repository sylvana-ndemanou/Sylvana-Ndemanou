/**
 * Hand-authored, code-generated schematics for the case studies. Each project
 * archetype gets a distinct topology (no two look alike) and a muted accent hue
 * — a deliberate alternative to generic AI cover images. Everything is derived
 * from plain geometry so it stays crisp at any size and reads as intentional
 * design rather than stock art. Purely illustrative — no client data.
 */

export type VisualKind =
  | "pipeline"
  | "arc"
  | "serpentine"
  | "layers"
  | "loop"
  | "converge";

export type VPoint = { x: number; y: number; emphasis?: boolean };
export type VEdge = { a: number; b: number; d: string };

export type VLayout = {
  /** viewBox width — also sets the aspect ratio (W / H). */
  W: number;
  /** viewBox height. */
  H: number;
  pts: VPoint[];
  edges: VEdge[];
};

export type VisualTheme = {
  /** Primary stroke / accent hue for this archetype. */
  hue: string;
  /** Node label text color. */
  text: string;
};

export const VISUAL_THEMES: Record<VisualKind, VisualTheme> = {
  pipeline: { hue: "#c8a86a", text: "#efe7d6" },
  arc: { hue: "#d98a86", text: "#f3e0de" },
  serpentine: { hue: "#5fb0c4", text: "#dcf0f4" },
  layers: { hue: "#6aa6d8", text: "#dde9f6" },
  loop: { hue: "#a58be0", text: "#e9e2f7" },
  converge: { hue: "#6cbf97", text: "#dcf2e7" },
};

/** Representative node counts for the decorative (label-less) poster art. */
const POSTER_N: Record<VisualKind, number> = {
  pipeline: 4,
  arc: 5,
  serpentine: 4,
  layers: 5,
  loop: 6,
  converge: 4,
};

export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Smooth cubic connector biased along the dominant axis. */
function smooth(a: VPoint, b: VPoint): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const cx = a.x + dx * 0.5;
    return `M${a.x},${a.y} C${cx},${a.y} ${cx},${b.y} ${b.x},${b.y}`;
  }
  const cy = a.y + dy * 0.5;
  return `M${a.x},${a.y} C${a.x},${cy} ${b.x},${cy} ${b.x},${b.y}`;
}

function chainEdges(pts: VPoint[]): VEdge[] {
  const edges: VEdge[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    edges.push({ a: i, b: i + 1, d: smooth(pts[i]!, pts[i + 1]!) });
  }
  return edges;
}

/**
 * Deterministic layout for a given archetype and node count. Coordinates live
 * in the returned viewBox space (W×H); the SVG is drawn with
 * `preserveAspectRatio="none"` so HTML labels positioned by percentage line up
 * exactly with the connectors.
 */
export function layoutFor(kind: VisualKind, count: number): VLayout {
  const n = Math.max(count, 2);

  switch (kind) {
    case "pipeline": {
      const W = 160;
      const H = 66;
      const mx = 24;
      const span = W - mx * 2;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => ({
        x: mx + (span * i) / (n - 1),
        y: H / 2,
      }));
      return { W, H, pts, edges: chainEdges(pts) };
    }

    case "arc": {
      const W = 160;
      const H = 84;
      const mx = 24;
      const span = W - mx * 2;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        return {
          x: mx + span * t,
          y: 56 - Math.sin(Math.PI * t) * 20,
          emphasis: i === n - 1,
        };
      });
      return { W, H, pts, edges: chainEdges(pts) };
    }

    case "serpentine": {
      const W = 150;
      const H = 112;
      const cols = 2;
      const rows = Math.ceil(n / cols);
      const xL = 42;
      const xR = W - 42;
      const yTop = 26;
      const yStep = rows > 1 ? (H - yTop * 2) / (rows - 1) : 0;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => {
        const row = Math.floor(i / cols);
        let col = i % cols;
        if (row % 2 === 1) col = cols - 1 - col; // boustrophedon
        return { x: col === 0 ? xL : xR, y: yTop + row * yStep };
      });
      return { W, H, pts, edges: chainEdges(pts) };
    }

    case "layers": {
      const W = 120;
      const H = 126;
      const my = 22;
      const span = H - my * 2;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => ({
        x: W / 2,
        y: my + (span * i) / (n - 1),
      }));
      return { W, H, pts, edges: chainEdges(pts) };
    }

    case "loop": {
      const W = 116;
      const H = 116;
      const cx = W / 2;
      const cy = H / 2;
      const r = 40;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => {
        const ang = (-Math.PI / 2) + (2 * Math.PI * i) / n;
        return { x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r };
      });
      const edges: VEdge[] = pts.map((p, i) => {
        const q = pts[(i + 1) % n]!;
        return {
          a: i,
          b: (i + 1) % n,
          d: `M${p.x},${p.y} A${r},${r} 0 0 1 ${q.x},${q.y}`,
        };
      });
      return { W, H, pts, edges };
    }

    case "converge": {
      const W = 160;
      const H = 92;
      const pts: VPoint[] = [
        { x: 26, y: 26 },
        { x: 26, y: 66 },
      ];
      const chain = n - 2;
      const startX = 82;
      const endX = 138;
      for (let j = 0; j < chain; j++) {
        const x =
          chain > 1 ? startX + (endX - startX) * (j / (chain - 1)) : 108;
        pts.push({ x, y: H / 2, emphasis: j === 0 });
      }
      const edges: VEdge[] = [];
      if (pts.length >= 3) {
        edges.push({ a: 0, b: 2, d: smooth(pts[0]!, pts[2]!) });
        edges.push({ a: 1, b: 2, d: smooth(pts[1]!, pts[2]!) });
        for (let i = 2; i < pts.length - 1; i++) {
          edges.push({ a: i, b: i + 1, d: smooth(pts[i]!, pts[i + 1]!) });
        }
      } else {
        edges.push({ a: 0, b: 1, d: smooth(pts[0]!, pts[1]!) });
      }
      return { W, H, pts, edges };
    }

    default: {
      const W = 160;
      const H = 66;
      const pts: VPoint[] = Array.from({ length: n }, (_, i) => ({
        x: 24 + ((W - 48) * i) / (n - 1),
        y: H / 2,
      }));
      return { W, H, pts, edges: chainEdges(pts) };
    }
  }
}

export function posterLayout(kind: VisualKind): VLayout {
  return layoutFor(kind, POSTER_N[kind]);
}
