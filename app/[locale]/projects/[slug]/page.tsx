import { ContactCard } from "@/components/contact/contact-card";
import { FlowDiagram } from "@/components/projects/flow-diagram";
import { FadeIn } from "@/components/ui/motion-primitives";
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
    path: `/projects/${slug}`,
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
    <main id="main-content" className="flex flex-1 flex-col">
      <article className="mx-auto w-full max-w-160 px-6 pt-40 pb-16 sm:px-10 sm:pt-52 sm:pb-20">
        <FadeIn className="flex flex-col gap-6">
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
        </FadeIn>

        <FadeIn delay={0.1} className="mt-12 flex flex-col gap-10">
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
            <div className="mt-5 rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-4 dark:bg-foreground/[0.04] sm:p-5">
              <FlowDiagram steps={flow} />
              <p className="mt-3 text-[12px] italic tracking-tight text-foreground/40">
                {t("diagramCaption")}
              </p>
            </div>
          </Section>

          <Section title={t("sections.outcome")}>
            <p>{t(`${base}.outcome`)}</p>
          </Section>

          <Section title={t("sections.tools")}>
            <div className="flex flex-wrap gap-2.5">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-foreground/10 bg-background px-4 py-2 text-[14px] tracking-tight text-foreground/85"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Section>
        </FadeIn>
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
    <section className="flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-accent">
        {title}
      </h2>
      <div className="text-[17px] leading-[1.7] tracking-tight text-foreground/75 sm:text-[18px]">
        {children}
      </div>
    </section>
  );
}
