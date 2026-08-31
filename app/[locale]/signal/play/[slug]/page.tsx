import { SignalApp } from "@/components/signal/signal-app";
import { routing } from "@/i18n/routing";
import { createMetadata } from "@/lib/metadata";
import { GAMES, getGame, type GameSlug } from "@s/lib/games";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  return routing.locales.flatMap((locale) =>
    GAMES.map((game) => ({ locale, slug: game.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const game = getGame(slug);
  return createMetadata({
    title: game ? `${game.name} — ${t("signalTitle")}` : t("signalTitle"),
    description: game?.tagline ?? t("signalDescription"),
    path: `/${locale}/signal/play/${slug}`,
  });
}

export default async function SignalPlayPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ mode?: string; d?: string; seed?: string }>;
}): Promise<ReactNode> {
  const { locale, slug } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const game = getGame(slug);
  if (!game) notFound();

  return (
    <main
      id="main-content"
      className="relative flex flex-1 flex-col pt-[5.75rem]"
    >
      <SignalApp
        locale={locale}
        basePath={`/${locale}/signal`}
        slug={slug as GameSlug}
        initialMode={query.mode}
        initialDifficulty={query.d}
        initialSeed={query.seed}
      />
    </main>
  );
}
