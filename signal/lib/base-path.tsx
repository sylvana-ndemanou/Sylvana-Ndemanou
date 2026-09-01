// @ts-nocheck
"use client";

import { createContext, useContext, type ReactNode } from "react";

const SignalBasePathContext = createContext("");

export function SignalBasePathProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: ReactNode;
}) {
  return (
    <SignalBasePathContext.Provider value={basePath}>
      {children}
    </SignalBasePathContext.Provider>
  );
}

export function useSignalBasePath(): string {
  return useContext(SignalBasePathContext);
}

export function signalHref(basePath: string, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (!basePath) return clean;
  if (clean === "/") return basePath;
  return `${basePath}${clean}`;
}
