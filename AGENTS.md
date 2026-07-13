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
- `npm run build` — production build.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` / `npm run format` — ESLint 9 / Prettier.

Non-obvious caveats:
- Use **`npm install`** (not `npm ci`): the committed `package-lock.json` is out of sync with
  `package.json`, so `npm ci` fails. A `pnpm-lock.yaml` is also committed but the project uses npm.

### i18n (bilingual EN/FR — next-intl)

- Uses `next-intl` v4 with the App Router. Routes live under `app/[locale]/`; the root layout is
  `app/[locale]/layout.tsx`. `localePrefix: "as-needed"` → English is served at `/` (no prefix),
  French at `/fr`.
- All user-facing copy is externalized in `messages/en.json` and `messages/fr.json`. Do NOT hardcode
  UI strings in components — add keys to both files. Lists/objects (skills, experience, case-study
  arrays) are read with `t.raw(...)`.
- i18n wiring: `i18n/routing.ts`, `i18n/navigation.ts` (locale-aware `Link`/`useRouter`/`usePathname`
  — import navigation from here, not `next/navigation`), `i18n/request.ts`, and `proxy.ts` at the
  repo root (Next 16 renamed `middleware.ts` → `proxy.ts`).
- Project case studies are anonymized (no client names anywhere). Narrative content is in
  `messages/*.json` under `CaseStudy.items.<slug>`; the slug/icon registry is `lib/projects.ts`.

### Contact form (Resend) + Cal.com

- `POST /api/contact` sends email via Resend. It reads `RESEND_API_KEY_PORTFOLIO` first and falls
  back to `RESEND_API_KEY` (Cloud Secret / Vercel env var; never committed). Optional `RESEND_FROM`
  overrides the sender. Note: Cloud Agent secrets are injected at VM startup, so a secret added
  mid-session won't be visible until a new session; for the deployed site, add the key in the
  Vercel project env vars.
- Resend sandbox limitation: with the default `onboarding@resend.dev` sender, Resend only delivers
  to the account owner's own email. To deliver to `sylvana.ndemanou@proton.me`, verify a domain at
  resend.com/domains and set `RESEND_FROM` to an address on that domain. The route degrades
  gracefully (the form shows a mailto fallback) when sending fails or the key is missing.
- Cal.com booking uses a popup embed; the public event link is a placeholder in `lib/site.ts`
  (`calLink`) — replace with the real `username/event-slug`.
- The hero portrait and OG image reference `public/sylvana.jpg` (not committed). Drop the photo
  there; until then the portrait shows an empty framed box (no crash).
