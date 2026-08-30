"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { play } from "@/lib/audio";
import { PORTFOLIO_URL } from "@/lib/site";
import { readTheme, subscribeTheme, toggleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light");
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={cn("nav-orb", className)}
      aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"}
      onClick={() => {
        toggleTheme();
        play("tap");
      }}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function PortfolioLink({ className }: { className?: string }) {
  return (
    <a
      href={PORTFOLIO_URL}
      className={cn(
        "font-mono text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      Portfolio
    </a>
  );
}
