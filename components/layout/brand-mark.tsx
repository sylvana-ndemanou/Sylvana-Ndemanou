"use client";

import type { ReactNode } from "react";

import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Link, usePathname } from "@/i18n/navigation";

// Fixed top-left brand mark (links home). Hidden on the immersive story page,
// which has its own back-to-site control.
export function BrandMark(): ReactNode {
  const pathname = usePathname();
  if (pathname === "/story" || pathname.startsWith("/story/")) return null;

  return (
    <Link
      href="/"
      aria-label="Sylvana Ndemanou — home"
      className="focus-ring fixed left-5 top-5 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/8 bg-background text-foreground shadow-sm transition-colors hover:text-accent"
    >
      <AnimatedLogo className="h-5 w-5" duration={1.4} />
    </Link>
  );
}
