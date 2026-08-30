"use client";

import { play } from "@/lib/audio";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggle } = useI18n();

  return (
    <button
      type="button"
      className={cn("nav-orb font-mono text-[11px] tracking-[0.08em]", className)}
      aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}
      onClick={() => {
        toggle();
        play("tap");
      }}
    >
      {locale.toUpperCase()}
    </button>
  );
}
