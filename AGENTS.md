# AGENTS.md

## Cursor Cloud specific instructions

### What this repository is

This is the **GitHub profile README repository** (`sylvana-ndemanou/Sylvana-Ndemanou`, where the
repo name matches the username). It contains a single `README.md` that GitHub renders on the user's
profile page. There is **no application** here:

- No `package.json`, no framework, no source code beyond `README.md`.
- Nothing to install, build, lint, test, or run. There are no services.
- The only meaningful "change" workflow is editing `README.md` (Markdown).

Do not add application scaffolding (Next.js, a build system, etc.) to this repo unless the user
explicitly asks — a profile README repo is intentionally just a README.

### The portfolio web app lives in a DIFFERENT repository

The Next.js / TypeScript / Tailwind portfolio template ("React Bits Pro") is a **separate repo**:
`sylvana-ndemanou/rbp-portfolio` (public). If a task describes portfolio work — bilingual site,
`/projects` case studies, hero, contact form, GSAP/motion animations, `npm run build`, etc. — it is
meant for `rbp-portfolio`, NOT this repo. A Cloud Agent must be launched against `rbp-portfolio`
to do that work, because a Cloud Agent's bound repository cannot be changed mid-session.

Notes about `rbp-portfolio` (verified by cloning it into a scratch dir during setup):
- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind v4; animations via
  `motion` and `lenis`; WebGL via `ogl`; physics via `matter-js`. Node 20+ works (validated on Node 22).
- Package manager: use `npm` (README assumes npm). Both `package-lock.json` and `pnpm-lock.yaml`
  are committed, but `package-lock.json` is currently stale, so `npm ci` fails — use `npm install`.
- Scripts: `npm run dev` (port 3000), `npm run build`, `npm run lint`, `npm run typecheck`. No test script.
- `npm run lint` reports one pre-existing error in `components/layout/nav.tsx`
  (`react-hooks/set-state-in-effect`) that ships with the template; it does not block `dev`/`build`.
- No environment variables are required for local dev.
