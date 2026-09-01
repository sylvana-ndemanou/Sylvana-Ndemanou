// @ts-nocheck
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PortfolioNav } from "@s/components/portfolio-nav";

function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbedded());
  }, []);

  return (
    <>
      {embedded ? null : <PortfolioNav />}
      <div
        data-app-chrome=""
        className={
          embedded
            ? "flex min-h-full flex-1 flex-col"
            : "flex min-h-full flex-1 flex-col pt-[5.75rem]"
        }
      >
        {children}
      </div>
    </>
  );
}
