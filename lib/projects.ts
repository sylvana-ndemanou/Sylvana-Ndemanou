import {
  BrainCircuit,
  Database,
  Gauge,
  LayoutDashboard,
  Network,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { VisualKind } from "@/lib/project-visuals";

export type ProjectSlug =
  | "etl-modernization"
  | "bi-architecture"
  | "executive-reporting-automation"
  | "applied-ai-exploration"
  | "reporting-automation"
  | "dashboard-poc";

export type ProjectMeta = {
  slug: ProjectSlug;
  icon: LucideIcon;
  /** Personal / exploratory work rather than a client mandate. */
  personal: boolean;
  /** Which code-generated schematic represents this project (unique per slug). */
  visual: VisualKind;
};

/**
 * Case-study registry. All narrative content lives in the translation files
 * (messages/*.json under `CaseStudy.items.<slug>`). No client names appear
 * anywhere — these are anonymized mission types. Each project gets a distinct
 * `visual` archetype so the cover art and technical-solution diagram never
 * repeat across the case studies.
 */
export const PROJECTS: readonly ProjectMeta[] = [
  { slug: "etl-modernization", icon: Database, personal: false, visual: "serpentine" },
  { slug: "bi-architecture", icon: Network, personal: false, visual: "layers" },
  { slug: "executive-reporting-automation", icon: Gauge, personal: false, visual: "arc" },
  { slug: "applied-ai-exploration", icon: BrainCircuit, personal: true, visual: "loop" },
  { slug: "reporting-automation", icon: Workflow, personal: true, visual: "pipeline" },
  { slug: "dashboard-poc", icon: LayoutDashboard, personal: false, visual: "converge" },
];

export const PROJECT_SLUGS: readonly ProjectSlug[] = PROJECTS.map(
  (p) => p.slug
);

export function getProject(slug: string): ProjectMeta | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
