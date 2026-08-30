"use client";

import type { ReactNode } from "react";

import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Link, usePathname } from "@/i18n/navigation";

// Fixed top-left brand mark (links home). Hidden on the immersive story page
// and the full-viewport Signal iframe, which have their own chrome.
export function BrandMark(): ReactNode {
  const pathname = usePathname();
  if (pathname === "/story" || pathname.startsWith("/story/")) return null;
  if (pathname === "/signal" || pathname.startsWith("/signal/")) return null;

  return (
    <Link
      href="/"
      aria-label="Sylvana Ndemanou — home"
      className="focus-ring border-foreground/8 bg-background text-foreground hover:text-accent fixed top-5 left-5 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-colors"
    >
      <AnimatedLogo className="h-5 w-5" duration={1.4} />
    </Link>
  );
}
