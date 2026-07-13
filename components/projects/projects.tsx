import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { FlowDiagram } from "./flow-diagram";
import { FadeIn } from "@/components/ui/motion-primitives";
import { Link } from "@/i18n/navigation";
import { PROJECTS, type ProjectMeta } from "@/lib/projects";

export type ProjectsProps = {
  withHeadline?: boolean;
  viewMoreVisible?: boolean;
};

export function Projects({
  withHeadline = false,
  viewMoreVisible = false,
}: ProjectsProps): ReactNode {
  const t = useTranslations("Projects");
  const items = viewMoreVisible ? PROJECTS.slice(0, 4) : PROJECTS;

  return (
    <section className="relative w-full">
      <div className="mx-auto w-full max-w-275 px-6 sm:px-10">
        {withHeadline ? (
          <FadeIn className="flex flex-col items-center gap-5 pt-12 pb-10 text-center sm:pt-20 sm:pb-14">
            <h2 className="font-serif text-[2.5rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[3rem] lg:text-[3.5rem]">
              {t("homeHeadline")}
            </h2>
            <p className="max-w-[42ch] text-[18px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              {t("homeIntro")}
            </p>
          </FadeIn>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7">
          {items.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>

        {viewMoreVisible ? (
          <div className="mt-12 flex justify-center sm:mt-16">
            <Link
              href="/projects"
              className="border border-foreground/8 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              {t("viewAll")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: ProjectMeta;
  index: number;
}): ReactNode {
  const t = useTranslations("CaseStudy");
  const tProjects = useTranslations("Projects");
  const Icon = project.icon;
  const base = `items.${project.slug}`;
  const flow = t.raw(`${base}.flow`) as string[];

  return (
    <FadeIn delay={Math.min(index * 0.06, 0.3)} className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="project-card group flex h-full flex-col gap-4 rounded-3xl border border-foreground/8 bg-background p-5 sm:p-6"
      >
        <header className="flex items-center gap-2.5">
          <span className="border-foreground/10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[12px] font-medium tracking-tight text-foreground/80">
            {t(`${base}.tag`)}
          </span>
          {project.personal ? (
            <span className="ml-auto text-[11px] font-medium uppercase tracking-wide text-foreground/40">
              {tProjects("personalBadge")}
            </span>
          ) : null}
        </header>

        <div className="rounded-2xl border border-foreground/5 bg-foreground/[0.02] p-4 dark:bg-foreground/[0.04]">
          <FlowDiagram steps={flow} compact />
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          <h3 className="text-[20px] font-medium leading-[1.2] tracking-tight text-foreground sm:text-[22px]">
            {t(`${base}.title`)}
          </h3>
          <p className="text-[14px] leading-normal tracking-tight text-foreground/65 sm:text-[15px]">
            {t(`${base}.summary`)}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-tight text-accent">
          {tProjects("viewCaseStudy")}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </Link>
    </FadeIn>
  );
}
