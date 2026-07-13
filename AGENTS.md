# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This repo (`sylvana-ndemanou/Sylvana-Ndemanou`) hosts the **personal portfolio web app** for
Sylvana Ndemanou, built on the "React Bits Pro" portfolio template (imported from the
`rbp-portfolio` fork). Stack: **Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5 +
Tailwind v4**, animations via `motion` + `lenis`, WebGL via `ogl`, physics via `matter-js`.

Note: the repo name matches the GitHub username, so `README.md` still renders on Sylvana's GitHub
**profile page**. `README.md` is intentionally kept as the profile bio and is unrelated to the app —
do not overwrite it with template/project docs unless explicitly asked.

### Running / building / linting

Standard scripts (see `package.json`):
- `npm run dev` — dev server on port 3000 (Turbopack, hot reload).
- `npm run build` — production build (generates static routes `/`, `/about`, `/projects`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` / `npm run format` — ESLint 9 / Prettier.

Non-obvious caveats:
- Use **`npm install`** (not `npm ci`): the committed `package-lock.json` is out of sync with
  `package.json`, so `npm ci` fails. A `pnpm-lock.yaml` is also committed but the project uses npm.
- `npm run lint` reports one **pre-existing** template error in `components/layout/nav.tsx`
  (`react-hooks/set-state-in-effect`). It does not block `dev` or `build`.
- No environment variables are required for local dev today. If a contact-form email service
  (e.g. Resend) or other integration is added, its API key must come from Cloud Secrets, never
  committed.
