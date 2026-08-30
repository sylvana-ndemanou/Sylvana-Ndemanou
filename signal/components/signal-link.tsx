// @ts-nocheck
"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { signalHref, useSignalBasePath } from "@s/lib/base-path";

type SignalLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function SignalLink({ href, ...props }: SignalLinkProps) {
  const basePath = useSignalBasePath();
  return <Link href={signalHref(basePath, href)} {...props} />;
}
