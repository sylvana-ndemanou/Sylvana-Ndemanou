// @ts-nocheck
import { notFound } from "next/navigation";
import { GamePlayer } from "@s/components/game-player";
import { GAMES, getGame, type GameSlug } from "@s/lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Signal" };
  return {
    title: `${game.name} — Signal`,
    description: game.tagline,
  };
}

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string; d?: string; seed?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const game = getGame(slug);
  if (!game) notFound();
  return (
    <GamePlayer
      slug={slug as GameSlug}
      initialMode={query.mode ?? null}
      initialDifficulty={query.d ?? null}
      initialSeed={query.seed ?? null}
    />
  );
}
