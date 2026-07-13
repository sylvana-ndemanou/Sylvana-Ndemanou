import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { HeroCtas } from "./hero-ctas";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { FadeIn, ScaleUnblur } from "@/components/ui/motion-primitives";
import { PortraitMorph } from "./portrait-morph";

const PORTRAIT_SRC = "/sylvana-portrait.png";
const PORTRAIT_HOVER_SRC = "/sylvana-portrait-wave.png";

export function Hero(): ReactNode {
  const t = useTranslations("Hero");

  return (
    <section className="relative w-full overflow-hidden">
      <AnimatedLogo
        className="pointer-events-none absolute left-1/2 top-24 -z-0 hidden h-[24rem] w-[24rem] -translate-x-1/2 text-accent/20 sm:block lg:top-28 lg:h-[30rem] lg:w-[30rem]"
        title=""
        duration={3.2}
        strokeWidth={1.5}
        loop
      />
      <div className="relative mx-auto w-full max-w-275 px-6 pt-44 pb-24 sm:px-10 sm:pt-56 sm:pb-32">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-8">
          <FadeIn className="flex flex-col gap-4">
            <p className="text-[20px] leading-tight tracking-tight font-medium text-foreground">
              {t("greeting")}
              <span aria-hidden="true" className="ml-1">
                👋
              </span>
            </p>

            <h1 className="text-[2.75rem] font-medium leading-[1.05] tracking-tight text-foreground md:text-[2.5rem] lg:text-[3.65rem]">
              <span className="block">{t("title1")}</span>
              <span className="block text-accent">{t("title2")}</span>
            </h1>

            <p className="max-w-[42ch] text-[19px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[20px]">
              {t("subtitle")}
            </p>

            <HeroCtas />
          </FadeIn>

          <ScaleUnblur className="flex justify-stretch md:justify-end">
            <div className="relative aspect-square w-full md:max-w-105 overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
              <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                <PortraitMorph
                  srcA={PORTRAIT_SRC}
                  srcB={PORTRAIT_HOVER_SRC}
                  alt={t("portraitAlt")}
                />
              </div>
            </div>
          </ScaleUnblur>
        </div>
      </div>
    </section>
  );
}
