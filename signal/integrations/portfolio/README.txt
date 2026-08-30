Apply this onto the portfolio repo (github.com/sylvana-ndemanou/Sylvana-Ndemanou).
Do not add Signal to lib/projects.ts — it is a top-bar tab, not a case study.

From the portfolio root:

  git apply /path/to/signal/integrations/portfolio/signal-tab.patch

Or copy the files in this folder onto the same relative paths.

Then set NEXT_PUBLIC_SIGNAL_URL to the public Signal origin (the iframe on /signal loads that URL).
Push to main so sylvanandemanou.vercel.app picks up Accueil / Projets / À propos / Signal.
