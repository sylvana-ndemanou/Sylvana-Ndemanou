#!/usr/bin/env bash
# Skip the leftover Vercel project "signal" (repo root, null Root Directory).
# Mini-games already ship in-process on the portfolio; that extra project only
# fails the GitHub check. Exit 0 = skip build, exit 1 = proceed.
set -euo pipefail

if [ "${VERCEL_PROJECT_ID:-}" = "prj_TRBVfAPCOV2cXGO9gAksGiMLlWLF" ]; then
  echo "Skipping leftover Vercel project signal"
  exit 0
fi

exit 1
