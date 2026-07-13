import {
  BrainCircuit,
  Database,
  Network,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type ProjectSlug =
  | "etl-modernization"
  | "bi-architecture"
  | "reporting-automation"
  | "applied-ai-exploration";

export type ProjectMeta = {
  slug: ProjectSlug;
  icon: LucideIcon;
  /** Personal / exploratory work rather than a client mandate. */
  personal: boolean;
};

/**
 * Case-study registry. All narrative content lives in the translation files
 * (messages/*.json under `CaseStudy.items.<slug>`). No client names appear
 * anywhere — these are anonymized mission types.
 */
export const PROJECTS: readonly ProjectMeta[] = [
  { slug: "etl-modernization", icon: Database, personal: false },
  { slug: "bi-architecture", icon: Network, personal: false },
  { slug: "reporting-automation", icon: Workflow, personal: true },
  { slug: "applied-ai-exploration", icon: BrainCircuit, personal: true },
];

export const PROJECT_SLUGS: readonly ProjectSlug[] = PROJECTS.map(
  (p) => p.slug
);

export function getProject(slug: string): ProjectMeta | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
