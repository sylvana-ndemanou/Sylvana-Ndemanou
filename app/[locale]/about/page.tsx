import { Education } from "@/components/about/education";
import { Experience } from "@/components/about/experience";
import { PolaroidStrip } from "@/components/about/polaroid-strip";
import { Skills } from "@/components/about/skills";
import { Stack } from "@/components/about/stack";
import { ContactCard } from "@/components/contact/contact-card";
import { FadeIn } from "@/components/ui/motion-primitives";
import { createMetadata } from "@/lib/metadata";
import { siteLinks } from "@/lib/site";
import { Linkedin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return createMetadata({
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    path: `/${locale}/about`,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const bold = (chunks: ReactNode): ReactNode => (
    <strong className="font-semibold text-foreground">{chunks}</strong>
  );

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-312 pt-40 sm:pt-56">
        <PolaroidStrip />
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        <FadeIn delay={0.5}>
          <div className="rounded-4xl border border-foreground/5 bg-foreground/1.5 p-8 sm:p-12 dark:bg-foreground/3">
            <h1 className="font-serif text-[1.75rem] font-medium tracking-tight text-foreground sm:text-[2rem]">
              {t("helloPrefix")}
              <span className="border-b border-foreground/30 pb-0.5">
                {t("name")}
              </span>
              .
            </h1>
            <div className="mt-8 space-y-6 text-[17px] leading-[1.75] tracking-tight text-foreground/75 sm:text-[18px]">
              <p>{t.rich("bio1", { b: bold })}</p>
              <p>{t.rich("bio2", { b: bold })}</p>
              <p>{t.rich("bio3", { b: bold })}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-6 flex flex-col items-start gap-4 rounded-3xl border border-accent/20 bg-accent/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="text-[15px] leading-[1.5] tracking-tight text-foreground/75">
              {t("linkedinCtaText")}
            </p>
            <a
              href={siteLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <Linkedin className="h-4 w-4" aria-hidden="true" />
              {t("linkedinCtaButton")}
            </a>
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto w-full max-w-[40rem] px-6 pb-20 sm:px-10 sm:pb-28">
        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-10">
            <Experience />
            <Education />
            <Skills />
            <Stack />
          </div>
        </FadeIn>
      </section>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
