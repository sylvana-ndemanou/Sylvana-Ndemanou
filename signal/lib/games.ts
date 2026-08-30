// @ts-nocheck
export type GameTrack = "bi" | "data" | "snowflake";

export type GameSlug =
  | "anomalie"
  | "graphique"
  | "entonnoir"
  | "memoire"
  | "bruit"
  | "schema"
  | "pipeline"
  | "jointure"
  | "grain"
  | "entrepot"
  | "elagage"
  | "voyage"
  | "clone"
  | "flux";

export type GameMeta = {
  slug: GameSlug;
  name: string;
  verb: string;
  tagline: string;
  how: string;
  accent: string;
  track: GameTrack;
};

export const TRACKS: {
  id: GameTrack;
  kicker: string;
  title: string;
  blurb: string;
}[] = [
  {
    id: "bi",
    kicker: "L’œil",
    title: "Intelligence d’affaires",
    blurb: "Lire un dashboard, juger un chiffre, mémoriser un slide.",
  },
  {
    id: "data",
    kicker: "Le socle",
    title: "Ingénierie & architecture",
    blurb: "Modèle, grain, pipeline, jointures — ce qui tient le dashboard debout.",
  },
  {
    id: "snowflake",
    kicker: "Le flocon",
    title: "Snowflake",
    blurb:
      "Warehouses, micro-partitions, Time Travel, clone zéro-copie, streams et tasks — la doc, mais avec les mains, l’oreille, et un score.",
  },
];

export const GAMES: GameMeta[] = [
  {
    slug: "anomalie",
    name: "Anomalie",
    verb: "Jouer anomalie",
    tagline: "Un chiffre n'appartient pas à l'histoire. Trouve-le.",
    how: "Cinq graphiques. Un point qui cloche à chaque fois. Touche la barre fautive — spike, chute, ou rupture de tendance.",
    accent: "oklch(0.7 0.18 32)",
    track: "bi",
  },
  {
    slug: "graphique",
    name: "Graphique",
    verb: "Jouer graphique",
    tagline: "La bonne question mérite le bon dessin.",
    how: "On te pose une question business. Choisis le type de graphique qui la rend lisible — pas joli, lisible.",
    accent: "oklch(0.9 0.19 122)",
    track: "bi",
  },
  {
    slug: "entonnoir",
    name: "Entonnoir",
    verb: "Jouer entonnoir",
    tagline: "Remets les étapes dans l'ordre. Le leak se montre tout seul.",
    how: "Des étapes mélangées, un parcours client. Tape-les dans le bon ordre. Tu verras ensuite où l'argent fuit.",
    accent: "oklch(0.8 0.14 75)",
    track: "bi",
  },
  {
    slug: "memoire",
    name: "Mémoire",
    verb: "Jouer mémoire",
    tagline: "Un tableau de bord, quelques secondes. Puis plus rien.",
    how: "Mémorise les KPI, les couleurs, le filtre. En Facile, une question. En Brutal, le slide se vide : tu le reconstruis tuile par tuile.",
    accent: "oklch(0.78 0.1 195)",
    track: "bi",
  },
  {
    slug: "bruit",
    name: "Bruit",
    verb: "Jouer bruit",
    tagline: "Le chiffre a bougé. Est-ce que ça veut dire quelque chose ?",
    how: "Une série, une zone marquée. Tendance, saison, rupture ou simple bruit ? L'œil BI, c'est ça.",
    accent: "oklch(0.7 0.08 280)",
    track: "bi",
  },
  {
    slug: "schema",
    name: "Schéma",
    verb: "Jouer schéma",
    tagline: "Étoile, 3NF, SCD, lakehouse. Le modèle avant le dashboard.",
    how: "Tu glisses un fait au centre, tu poses un ticket OLTP, tu versionnes Léa. Le modèle se construit, il ne se coche pas.",
    accent: "oklch(0.78 0.1 195)",
    track: "data",
  },
  {
    slug: "pipeline",
    name: "Pipeline",
    verb: "Jouer pipeline",
    tagline: "Remets les jobs dans l'ordre. Sinon le mart ment.",
    how: "Des étapes d'ingénierie dans le désordre. Reconstitue le flux : brut, propre, clé, test, publication.",
    accent: "oklch(0.8 0.14 75)",
    track: "data",
  },
  {
    slug: "jointure",
    name: "Jointure",
    verb: "Jouer jointure",
    tagline: "INNER, LEFT, FULL, ANTI. La question décide, pas l'habitude.",
    how: "Deux tables, une question métier. Choisis la jointure. Tu verras quelles lignes survivent.",
    accent: "oklch(0.7 0.08 280)",
    track: "data",
  },
  {
    slug: "grain",
    name: "Grain",
    verb: "Jouer grain",
    tagline: "Une ligne, ça représente quoi ? Mauvaise clé, mauvais KPI.",
    how: "On te montre une table. Trouve la clé, le grain, ou ce qui mélange deux mondes.",
    accent: "oklch(0.9 0.19 122)",
    track: "data",
  },
  {
    slug: "entrepot",
    name: "Entrepôt",
    verb: "Jouer entrepôt",
    tagline: "Le compute se paie à la seconde. Trop petit ça file, trop gros ça saigne.",
    how: "Un fader, des crédits qui cliquent. Tu dimensionnes le warehouse, tu le réveilles, tu le suspends. Snowflake facture 60 secondes minimum à chaque démarrage.",
    accent: "oklch(0.72 0.14 230)",
    track: "snowflake",
  },
  {
    slug: "elagage",
    name: "Élagage",
    verb: "Jouer élagage",
    tagline: "La requête ne lit pas la table. Elle lit des micro-partitions.",
    how: "Chaque tuile est une micro-partition (min/max). Tu n’écoutes que celles qui overlapent le filtre. Le silence, c’est du pruning.",
    accent: "oklch(0.78 0.16 85)",
    track: "snowflake",
  },
  {
    slug: "voyage",
    name: "Voyage",
    verb: "Jouer voyage",
    tagline: "AT, BEFORE, UNDROP. Puis Fail-safe, et c’est trop tard.",
    how: "Une bande, une tête de lecture. Tu rebobines dans la rétention (1 jour en Standard, jusqu’à 90 en Enterprise). Hors délai, plus de SELECT — seulement Fail-safe.",
    accent: "oklch(0.7 0.12 20)",
    track: "snowflake",
  },
  {
    slug: "clone",
    name: "Clone",
    verb: "Jouer clone",
    tagline: "Zéro copie : des pointeurs, pas des octets. Jusqu’au premier UPDATE.",
    how: "CLONE est instantané : même micro-partitions. CTAS recopie. Un DML sur le clone écrit de nouveaux fichiers — le stockage diverge alors seulement.",
    accent: "oklch(0.82 0.14 145)",
    track: "snowflake",
  },
  {
    slug: "flux",
    name: "Flux",
    verb: "Jouer flux",
    tagline: "Un stream est un signet. La task tape la mesure. Le SELECT ne consomme rien.",
    how: "Le métronome de la task, les inserts dans le stream. Tu n’avances l’offset que par un DML, et tu ne lances la task que si SYSTEM$STREAM_HAS_DATA.",
    accent: "oklch(0.68 0.16 310)",
    track: "snowflake",
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((game) => game.slug === slug);
}

export const ROUNDS = 5;
export const POINTS_PER_ROUND = 10;
export const MAX_SCORE = ROUNDS * POINTS_PER_ROUND;
