import { ContactCard } from "@/components/contact/contact-card";
import { ProjectPoster } from "@/components/projects/project-poster";
import { AppliedAiScene } from "@/components/projects/scenes/applied-ai-scene";
import { DashboardScene } from "@/components/projects/scenes/dashboard-scene";
import { MatillionScene } from "@/components/projects/scenes/matillion-scene";
import { SnowflakeScene } from "@/components/projects/scenes/snowflake-scene";
import { SolutionDiagram } from "@/components/projects/solution-diagram";
import type { ComponentType } from "react";
import { ToolGrid } from "@/components/projects/tool-grid";
import { ShaderFlow } from "@/components/shaders/shader-flow";
import { FadeIn, Reveal } from "@/components/ui/motion-primitives";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";
import { getProject, PROJECT_SLUGS } from "@/lib/projects";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type Params = { locale: string; slug: string };

// Animated, cursor-driven "tool" scenes per case study (real representations of
// the work: Matillion pipeline, Snowflake worksheet, BI dashboard, AI chat).
const SCENES: Record<string, ComponentType> = {
  "etl-modernization": MatillionScene,
  "bi-architecture": SnowflakeScene,
  "executive-reporting-automation": DashboardScene,
  "dashboard-poc": DashboardScene,
  "applied-ai-exploration": AppliedAiScene,
};

export function generateStaticParams(): Params[] {
  return routing.locales.flatMap((locale) =>
    PROJECT_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!getProject(slug)) return {};
  const t = await getTranslations({ locale, namespace: "CaseStudy" });
  return createMetadata({
    title: t(`items.${slug}.title`),
    description: t(`items.${slug}.summary`),
    path: `/${locale}/projects/${slug}`,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}): Promise<ReactNode> {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("CaseStudy");
  const tProjects = await getTranslations("Projects");

  const base = `items.${slug}`;
  const approach = t.raw(`${base}.approach`) as string[];
  const tools = t.raw(`${base}.tools`) as string[];
  const flow = t.raw(`${base}.flow`) as string[];

  return (
    <main id="main-content" className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-30 dark:opacity-20"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <ShaderFlow scale={3} brightness={3} />
      </div>
      <article className="relative mx-auto w-full max-w-5xl px-6 pt-40 pb-16 sm:px-10 sm:pt-52 sm:pb-20">
        <FadeIn className="flex max-w-2xl flex-col gap-6">
          <Link
            href="/projects"
            className="focus-ring inline-flex w-fit items-center gap-1.5 text-[14px] font-medium tracking-tight text-foreground/60 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("backToProjects")}
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[13px] font-medium tracking-tight text-foreground/80">
              {t(`${base}.tag`)}
            </span>
            {project.personal ? (
              <span className="text-[12px] font-medium uppercase tracking-wide text-foreground/40">
                {tProjects("personalBadge")}
              </span>
            ) : null}
          </div>

          <h1 className="font-serif text-[2.25rem] font-medium leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem]">
            {t(`${base}.title`)}
          </h1>
          <p className="text-[19px] leading-[1.5] tracking-tight text-foreground/70">
            {t(`${base}.summary`)}
          </p>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent/0" />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10">
          {(() => {
            const Scene = SCENES[slug];
            return Scene ? (
              <Scene />
            ) : (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-foreground/10">
                <ProjectPoster kind={project.visual} />
              </div>
            );
          })()}
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_16rem] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-10">
            <Section title={t("sections.context")}>
              <p>{t(`${base}.context`)}</p>
            </Section>

            <Section title={t("sections.approach")}>
              <ul className="flex flex-col gap-3">
                {approach.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-[12px] font-semibold text-accent">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title={t("sections.solution")}>
              <p>{t(`${base}.solution`)}</p>
              <div className="mt-5">
                <SolutionDiagram kind={project.visual} steps={flow} />
                <p className="mt-3 text-[12px] italic tracking-tight text-foreground/40">
                  {t("diagramCaption")}
                </p>
              </div>
            </Section>

            <Section title={t("sections.outcome")}>
              <p>{t(`${base}.outcome`)}</p>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-5 dark:bg-foreground/[0.04]">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent">
                  {t("sections.tools")}
                </h2>
                <div className="mt-4">
                  <ToolGrid tools={tools} />
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </article>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Reveal>
      <section className="flex flex-col gap-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent">
          {title}
        </h2>
        <div className="text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">
          {children}
        </div>
      </section>
    </Reveal>
  );
}
