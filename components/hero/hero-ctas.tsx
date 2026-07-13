"use client";

import { ArrowRight, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroCtas(): ReactNode {
  const tHero = useTranslations("Hero");
  const tContact = useTranslations("Contact");

  return (
    <motion.div
      initial={false}
      className="mt-2 flex flex-wrap items-center gap-3"
    >
      <motion.a
        href="#contact"
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="focus-ring inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
        {tContact("contact")}
      </motion.a>

      <Link
        href="/projects"
        className="border border-foreground/5 focus-ring group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-background px-5 py-2.5 text-sm font-medium text-foreground shadow-2xl transition-colors hover:bg-foreground/4"
      >
        {tHero("ctaWork")}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}
