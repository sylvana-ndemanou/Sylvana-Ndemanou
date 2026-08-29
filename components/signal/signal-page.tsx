import {
  Activity,
  ArrowUpRight,
  FileCode2,
  Layers,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ContactCard } from "@/components/contact/contact-card";
import { SignalMark } from "@/components/signal/signal-mark";
import { SignalVisual } from "@/components/signal/signal-visual";
import { FadeIn, Reveal } from "@/components/ui/motion-primitives";
import { SIGNAL_FEATURE_KEYS, type SignalFeatureKey } from "@/lib/signal";
import { siteLinks } from "@/lib/site";

const FEATURE_ICONS: Record<SignalFeatureKey, LucideIcon> = {
  templates: FileCode2,
  profiler: Activity,
  privacy: ShieldCheck,
  field: Layers,
};

type FeatureCopy = {
  title: string;
  body: string;
};

export async function SignalPage(): Promise<ReactNode> {
  const t = await getTranslations("Signal");
  const features = t.raw("features") as Record<SignalFeatureKey, FeatureCopy>;
  const stack = t.raw("stack") as string[];

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-275 px-6 pt-44 pb-16 sm:px-10 sm:pt-56 sm:pb-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn className="flex flex-col gap-5">
            <p className="text-foreground/50 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.14em] uppercase">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#00E5CC]/12 text-[#00917A] ring-1 ring-[#00E5CC]/25 dark:text-[#00E5CC]">
                <SignalMark className="h-3 w-4" strokeWidth={1.4} animated />
              </span>
              {t("kicker")}
            </p>
            <h1 className="text-foreground font-serif text-[2.75rem] leading-[1.05] font-medium tracking-tight md:text-[3.25rem] lg:text-[3.75rem]">
              {t("title")}
            </h1>
            <p className="text-[22px] leading-[1.25] font-medium tracking-tight text-[#00917A] sm:text-[24px] dark:text-[#00E5CC]">
              {t("tagline")}
            </p>
            <p className="text-foreground/65 max-w-[46ch] text-[17px] leading-[1.5] tracking-tight sm:text-[19px]">
              {t("intro")}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <a
                href={siteLinks.signal}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring bg-foreground text-background inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {t("cta")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <span className="text-foreground/45 text-[13px] tracking-tight">
                vynio.io
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="border-foreground/8 bg-background rounded-4xl border p-1.5 shadow-sm">
              <SignalVisual />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto w-full max-w-275 px-6 pb-16 sm:px-10 sm:pb-24">
        <Reveal>
          <h2 className="text-foreground mb-8 text-center font-serif text-[1.75rem] font-medium tracking-tight sm:text-[2rem]">
            {t("featuresTitle")}
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {SIGNAL_FEATURE_KEYS.map((key, index) => {
            const Icon = FEATURE_ICONS[key];
            const feature = features[key];
            return (
              <Reveal key={key} delay={index * 0.06}>
                <article className="border-foreground/8 bg-background flex h-full flex-col gap-3 rounded-3xl border p-5 sm:p-6">
                  <span className="border-foreground/10 bg-background inline-flex h-9 w-9 items-center justify-center rounded-lg border text-[#00917A] dark:text-[#00E5CC]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-foreground text-[18px] font-medium tracking-tight sm:text-[19px]">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/65 text-[14px] leading-[1.55] tracking-tight sm:text-[15px]">
                    {feature.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-275 px-6 pb-8 sm:px-10">
        <Reveal>
          <div className="border-foreground/5 bg-foreground/1.5 dark:bg-foreground/3 rounded-4xl border p-6 sm:p-8">
            <h2 className="text-foreground text-[15px] font-semibold tracking-tight">
              {t("stackTitle")}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {stack.map((item) => (
                <span
                  key={item}
                  className="border-foreground/8 bg-background text-foreground/85 rounded-full border px-4 py-2 text-[14px] tracking-tight sm:text-[15px]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-foreground/60 mt-6 max-w-[48ch] text-[15px] leading-[1.55] tracking-tight">
              {t("note")}
            </p>
          </div>
        </Reveal>
      </section>

      <ContactCard />
      <div className="h-12 sm:h-16" />
    </main>
  );
}
