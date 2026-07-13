import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 uses the `proxy.ts` convention (formerly `middleware.ts`).
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for API routes, Next internals, and static files.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
