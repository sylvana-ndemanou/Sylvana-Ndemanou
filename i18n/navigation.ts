import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Locale-aware navigation helpers. Always import Link/usePathname/useRouter
// from here (not from next/navigation) so the active locale is preserved.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
