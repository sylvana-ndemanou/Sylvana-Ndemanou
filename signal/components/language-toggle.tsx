// @ts-nocheck
"use client";

import { play } from "@s/lib/audio";
import { useI18n } from "@s/lib/i18n";
import { cn } from "@s/lib/utils";

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
