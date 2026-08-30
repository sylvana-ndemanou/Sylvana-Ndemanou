"use client";

import { Suspense } from "react";
import { AnomalieGame } from "@/components/games/anomalie-game";
import { GraphiqueGame } from "@/components/games/graphique-game";
import { EntonnoirGame } from "@/components/games/entonnoir-game";
import { MemoireGame } from "@/components/games/memoire-game";
import { BruitGame } from "@/components/games/bruit-game";
import { SchemaGame } from "@/components/games/schema-game";
import { PipelineGame } from "@/components/games/pipeline-game";
import { JointureGame } from "@/components/games/jointure-game";
import { GrainGame } from "@/components/games/grain-game";
import { EntrepotGame } from "@/components/games/entrepot-game";
import { ElagageGame } from "@/components/games/elagage-game";
import { VoyageGame } from "@/components/games/voyage-game";
import { CloneGame } from "@/components/games/clone-game";
import { FluxGame } from "@/components/games/flux-game";
import { PlaySessionRoot } from "@/components/play-session";
import { recordScore } from "@/lib/scores";
import type { GameSlug } from "@/lib/games";

export function GamePlayer({ slug }: { slug: GameSlug }) {
  return (
    <Suspense>
      <PlaySessionRoot slug={slug}>
        <GameSwitch slug={slug} />
      </PlaySessionRoot>
    </Suspense>
  );
}

function GameSwitch({ slug }: { slug: GameSlug }) {
  function handleFinish(score: number) {
    recordScore(slug, score);
  }

  switch (slug) {
    case "anomalie":
      return <AnomalieGame onFinish={handleFinish} />;
    case "graphique":
      return <GraphiqueGame onFinish={handleFinish} />;
    case "entonnoir":
      return <EntonnoirGame onFinish={handleFinish} />;
    case "memoire":
      return <MemoireGame onFinish={handleFinish} />;
    case "bruit":
      return <BruitGame onFinish={handleFinish} />;
    case "schema":
      return <SchemaGame onFinish={handleFinish} />;
    case "pipeline":
      return <PipelineGame onFinish={handleFinish} />;
    case "jointure":
      return <JointureGame onFinish={handleFinish} />;
    case "grain":
      return <GrainGame onFinish={handleFinish} />;
    case "entrepot":
      return <EntrepotGame onFinish={handleFinish} />;
    case "elagage":
      return <ElagageGame onFinish={handleFinish} />;
    case "voyage":
      return <VoyageGame onFinish={handleFinish} />;
    case "clone":
      return <CloneGame onFinish={handleFinish} />;
    case "flux":
      return <FluxGame onFinish={handleFinish} />;
  }
}
