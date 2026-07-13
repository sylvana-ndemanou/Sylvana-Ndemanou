import { BookOpen, Github, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { BookCallButton } from "./book-call-button";
import { ContactForm } from "./contact-form";
import { Logo } from "@/components/ui/logo";
import { FadeIn } from "@/components/ui/motion-primitives";
import { NotionIcon } from "@/components/ui/notion-icon";
import { UpworkIcon } from "@/components/ui/upwork-icon";
import { Link } from "@/i18n/navigation";
import { siteLinks } from "@/lib/site";
import { ShaderFlow } from "../shaders/shader-flow";

const CARD_FADE_MASK =
  "radial-gradient(ellipse 90% 110% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0.15) 100%)";

export function ContactCard(): ReactNode {
  const t = useTranslations("Contact");
  const tStory = useTranslations("Story");
  const year = new Date().getFullYear();

  return (
    <section
      id="contact"
      className="mx-auto my-12 w-full max-w-275 scroll-mt-28 px-6 sm:my-20 sm:px-10"
    >
      <FadeIn>
        <div className="relative w-full overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
          <div className="relative w-full overflow-hidden rounded-[1.6rem]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-25"
              style={{
                WebkitMaskImage: CARD_FADE_MASK,
                maskImage: CARD_FADE_MASK,
              }}
            >
              <ShaderFlow scale={3} brightness={3} />
            </div>

            <div className="relative grid gap-8 p-6 sm:gap-10 sm:p-7 md:grid-cols-[1fr_1fr] md:items-stretch md:gap-8 md:p-8">
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-[2.25rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.25rem]">
                  {t("heading")}
                </h2>
                <p className="max-w-[36ch] text-[17px] leading-[1.45] tracking-tight text-foreground/65 sm:text-[19px]">
                  {t("blurb")}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <BookCallButton />
                  <Link
                    href="/projects"
                    className="focus-ring inline-flex h-11 items-center rounded-xl border border-foreground/10 bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                  >
                    {t("seeProjects")}
                  </Link>
                </div>

                <a
                  href={`mailto:${siteLinks.email}`}
                  className="focus-ring inline-flex w-fit items-center gap-2 text-[15px] font-medium tracking-tight text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                  {siteLinks.email}
                </a>

                <div className="mt-1 flex items-center gap-3">
                  <SocialIcon href={`mailto:${siteLinks.email}`} label={t("socialEmail")} icon={Mail} />
                  <SocialIcon href={siteLinks.linkedin} label={t("socialLinkedin")} icon={Linkedin} />
                  <SocialIcon href={siteLinks.github} label={t("socialGithub")} icon={Github} />
                  <SocialIcon href={siteLinks.notion} label={t("socialNotion")} icon={NotionIcon} />
                  <SocialIcon href={siteLinks.upwork} label={t("socialUpwork")} icon={UpworkIcon} />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Logo className="h-5 w-5 text-foreground/40" />
                  <p className="text-[12px] tracking-tight text-foreground/45">
                    {t("footerBuilt", { year })}
                  </p>
                  <Link
                    href="/story"
                    aria-label={tStory("entryLabel")}
                    title={tStory("entryLabel")}
                    className="focus-ring group/story ml-1 inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-foreground/25 transition-colors hover:text-accent"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] italic opacity-0 transition-all duration-500 group-hover/story:max-w-[10rem] group-hover/story:opacity-70">
                      {tStory("entryLabel")}
                    </span>
                  </Link>
                </div>
              </div>

              <div className="border-foreground/8 flex flex-col gap-4 rounded-[1.4rem] border bg-background/80 p-5 backdrop-blur-sm sm:p-6">
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {t("form.title")}
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}): ReactNode {
  const isExternal = href.startsWith("http");
  const props = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <a
      href={href}
      aria-label={label}
      className="border-foreground/8 hover:border-foreground/15 focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground/70 transition-colors hover:text-foreground"
      {...props}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
    </a>
  );
}
