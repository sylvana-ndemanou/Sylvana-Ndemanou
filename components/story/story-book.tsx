"use client";

import { ArrowLeft, ChevronDown, Film, Play } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

import { StoryAudioToggle, useStoryAudio } from "./story-audio";
import { Logo } from "@/components/ui/logo";
import { Link } from "@/i18n/navigation";

type Chapter = {
  scene: string;
  title: string;
  body: string[];
};

const SCENE_SRC: Record<string, string> = {
  roots: "/story-roots.png",
  france: "/story-france.png",
  piano: "/story-piano.png",
  canada: "/story-canada.png",
  life: "/story-life.png",
  now: "/story-now.png",
};

const PAGE = "#f6efe0";
const INK = "#3d3122";

export function StoryBook(): ReactNode {
  const t = useTranslations("Story");
  const locale = useLocale();
  const chapters = t.raw("chapters") as Chapter[];

  return (
    <main
      id="main-content"
      lang={locale}
      className="relative flex flex-1 flex-col"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #1c1710 0%, #100c08 60%, #0a0705 100%)",
      }}
    >
      <Link
        href="/"
        className="focus-ring fixed left-5 top-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-[13px] font-medium tracking-tight text-white/80 backdrop-blur transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("backHome")}
      </Link>

      <BookCover />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pb-16 sm:gap-16 sm:px-6">
        {chapters.map((chapter, index) => (
          <ChapterSpread key={chapter.scene} chapter={chapter} index={index} />
        ))}

        <ClosingPage />
      </div>

      <StoryAudioToggle />
    </main>
  );
}

function BookCover(): ReactNode {
  const t = useTranslations("Story");
  const { available, playing, toggle } = useStoryAudio();
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 0.55], [0, -158]);
  const coverRotate = reduceMotion ? -158 : rotate;
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section ref={ref} className="relative h-[190vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-4 [perspective:2200px]">
        <div className="relative aspect-[3/4] w-[min(78vw,22rem)]">
          {/* Inner title page (revealed as the cover opens) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-r-lg rounded-l-sm px-6 text-center shadow-2xl"
            style={{ backgroundColor: PAGE, color: INK }}
          >
            <div
              className="absolute inset-3 rounded-sm border"
              style={{ borderColor: "rgba(154,123,67,0.4)" }}
              aria-hidden="true"
            />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              {t("cover.kicker")}
            </p>
            <h1 className="relative font-serif text-[2rem] font-medium leading-[1.05] sm:text-[2.4rem]">
              {t("cover.title")}
            </h1>
            <p className="relative max-w-[26ch] text-[14px] leading-[1.5] opacity-75">
              {t("cover.subtitle")}
            </p>
            {available && (
              <button
                type="button"
                onClick={toggle}
                className="focus-ring relative mt-2 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-[13px] font-medium text-[#3d3122] transition-colors hover:bg-accent/20"
              >
                <Play className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                {playing ? t("audioPause") : t("audioPlay")}
              </button>
            )}
          </div>

          {/* Front cover (rotates open on scroll) */}
          <motion.div
            style={{
              rotateY: coverRotate,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-r-lg rounded-l-sm shadow-2xl [backface-visibility:hidden]"
          >
            <div
              className="absolute inset-0 rounded-r-lg rounded-l-sm"
              style={{
                background:
                  "linear-gradient(135deg, #2c2016 0%, #3a2a1c 45%, #241a11 100%)",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-3 rounded-sm border-2"
              style={{ borderColor: "rgba(200,168,106,0.55)" }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-5 rounded-sm border"
              style={{ borderColor: "rgba(200,168,106,0.3)" }}
              aria-hidden="true"
            />
            <Logo className="relative h-20 w-20 text-[#c8a86a]" />
            <p className="relative font-serif text-[1.5rem] font-medium tracking-wide text-[#e8dcc4]">
              {t("cover.title")}
            </p>
            <p className="relative text-[11px] uppercase tracking-[0.3em] text-[#c8a86a]/80">
              Sylvana Ndemanou
            </p>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-10 flex flex-col items-center gap-1 text-white/70"
        >
          <span className="text-[12px] uppercase tracking-[0.2em]">
            {t("openHint")}
          </span>
          <motion.span
            animate={reduceMotion ? { y: 0 } : { y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

function ChapterSpread({
  chapter,
  index,
}: {
  chapter: Chapter;
  index: number;
}): ReactNode {
  const reduceMotion = useReducedMotion();
  const flip = index % 2 === 1;
  const src = SCENE_SRC[chapter.scene];

  return (
    <motion.article
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl shadow-2xl"
      style={{ backgroundColor: PAGE, color: INK }}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-md border"
        style={{ borderColor: "rgba(154,123,67,0.35)" }}
        aria-hidden="true"
      />
      <div
        className={`grid items-center gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-2 ${
          flip ? "md:[direction:rtl]" : ""
        }`}
      >
        <div className="relative overflow-hidden rounded-lg [direction:ltr]">
          {src && (
            <motion.div
              initial={reduceMotion ? { scale: 1 } : { scale: 1.12 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square w-full"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 400px, 90vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </div>

        <div className="[direction:ltr]">
          <p className="mb-1 font-serif text-[13px] italic tracking-tight text-accent">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="font-serif text-[1.6rem] font-medium leading-[1.15] sm:text-[2rem]">
            {chapter.title}
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-[1.7] sm:text-[16px]">
            {chapter.body.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[3rem] first-letter:leading-[0.8] first-letter:text-accent"
                    : ""
                }
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ClosingPage(): ReactNode {
  const t = useTranslations("Story");
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl px-6 py-12 text-center shadow-2xl sm:px-10 sm:py-16"
      style={{ backgroundColor: PAGE, color: INK }}
    >
      <div
        className="pointer-events-none absolute inset-3 rounded-md border"
        style={{ borderColor: "rgba(154,123,67,0.35)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
        <Logo className="h-12 w-12 text-accent" />
        <h2 className="font-serif text-[1.8rem] font-medium sm:text-[2.2rem]">
          {t("closing.title")}
        </h2>
        <p className="text-[16px] leading-[1.6] opacity-80">
          {t("closing.body")}
        </p>

        {/* Reserved slot for a future testimonial video (drop
            public/story-testimonial.mp4 to fill it). */}
        <div
          className="mt-4 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed"
          style={{
            borderColor: "rgba(154,123,67,0.4)",
            backgroundColor: "rgba(154,123,67,0.06)",
          }}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
            <Film className="h-5 w-5 text-accent" aria-hidden="true" />
          </span>
          <p className="max-w-[28ch] text-[14px] italic leading-[1.5] opacity-70">
            {t("closing.testimonialSoon")}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
