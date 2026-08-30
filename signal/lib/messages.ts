// @ts-nocheck
import type { Difficulty } from "@s/lib/play";
import type { GameSlug, GameTrack } from "@s/lib/games";
import type { Locale } from "@s/lib/locale";

type GameCopy = {
  name: string;
  verb: string;
  tagline: string;
  how: string;
};

type TrackCopy = {
  kicker: string;
  title: string;
  blurb: string;
};

export type Messages = {
  bar: {
    nav: string;
    mute: string;
    unmute: string;
    sound: string;
    muted: string;
    home: string;
    projects: string;
    about: string;
    signal: string;
  };
  hub: {
    lede: string;
    principle: string;
    principleBody: string;
    played: (best: number, max: number) => string;
    idle: string;
    dustTitle: string;
    dustBody: string;
    dustCta: string;
    footerAuthor: string;
    footerScores: string;
  };
  shell: {
    games: string;
    start: string;
    next: string;
    score: string;
    replay: string;
    all: string;
    situation: string;
  };
  lobby: {
    solo: string;
    multi: string;
    daily: string;
    soloHint: string;
    multiHint: string;
    dailyHint: (day: string) => string;
    easy: string;
    hard: string;
    brutal: string;
    difficulty: string;
    diffHint: Record<Difficulty, string>;
    play: string;
    copyLink: string;
    copied: string;
    inviteTitle: string;
    inviteBody: string;
    room: string;
    back: string;
    rounds: (n: number) => string;
  };
  board: {
    title: string;
    submitted: (n: number) => string;
    empty: string;
    close: string;
    initials: string;
    open: string;
    post: string;
    posted: (name: string) => string;
    needInitials: string;
  };
  tracks: Record<GameTrack, TrackCopy>;
  games: Record<GameSlug, GameCopy>;
};

export const MESSAGES: Record<Locale, Messages> = {
  fr: {
    bar: {
      nav: "Navigation",
      mute: "Couper le son",
      unmute: "Activer le son",
      sound: "Son",
      muted: "Son coupé",
      home: "Accueil",
      projects: "Projets",
      about: "À propos",
      signal: "Signal",
    },
    hub: {
      lede: "Mini-jeux d’œil, de socle, et de Snowflake. Lire un dashboard, poser un grain, puis entendre un warehouse compter les crédits. Cinq manches. Score sur 50.",
      principle: "Le principe",
      principleBody:
        "Pas de cours. Une décision, un verdict, une leçon. L’œil métier, l’ingénierie, puis le flocon — parce qu’un KPI faux commence souvent par une clé mal posée, ou un warehouse trop gros.",
      played: (best, max) => `meilleur ${best}/${max}`,
      idle: "pas encore joué",
      dustTitle: "Le chiffre ne naît pas dans le dashboard.",
      dustBody:
        "Entre dans le cadre sombre. Des lucioles de signal s’accrochent au curseur. Sors : elles s’éteignent. Reviens : tout recommence à zéro.",
      dustCta: "Jouer le socle",
      footerAuthor: "Un projet personnel de",
      footerScores: "Les scores et le classement restent sur cet appareil. Aucun compte, aucun tracking.",
    },
    shell: {
      games: "Jeux",
      start: "Cinq manches. On y va.",
      next: "Manche suivante",
      score: "Voir le score",
      replay: "Rejouer",
      all: "Tous les jeux",
      situation: "Situation",
    },
    lobby: {
      solo: "Solo",
      multi: "À plusieurs",
      daily: "Aujourd’hui",
      soloHint: "Tes manches, ton rythme.",
      multiHint: "Même tirage, chacun de son côté.",
      dailyHint: (day) => `Les mêmes manches pour tout le monde · ${day}`,
      easy: "Facile",
      hard: "Costaud",
      brutal: "Brutal",
      difficulty: "Difficulté",
      diffHint: {
        easy: "Trois manches propres à Facile — pas celles de Costaud. Signal large, peu de leurres.",
        hard: "Cinq autres situations. Plus de leurres, moins de marge, et ça se resserre à chaque manche.",
        brutal: "Cinq manches encore différentes. Écart minuscule dès la première. Ensuite ça empire.",
      },
      play: "Jouer",
      copyLink: "Copier le lien",
      copied: "Lien copié",
      inviteTitle: "Lien de défi",
      inviteBody:
        "Tes amis ouvrent le même jeu, les mêmes manches, quand ils veulent. Pas de salon live — juste un tirage partagé.",
      room: "Code",
      back: "Retour",
      rounds: (n) => (n === 1 ? "1 manche" : `${n} manches`),
    },
    board: {
      title: "Classement",
      submitted: (n) =>
        n <= 1 ? `${n} score soumis.` : `${n.toLocaleString("fr-FR")} scores soumis.`,
      empty: "Personne n’a encore posé de score ici.",
      close: "Fermer",
      initials: "Tes initiales",
      open: "Classement",
      post: "Poser le score",
      posted: (name) => `Enregistré sous ${name}`,
      needInitials: "Trois lettres pour le tableau. Elles restent sur cet appareil.",
    },
    tracks: {
      bi: {
        kicker: "L’œil",
        title: "Intelligence d’affaires",
        blurb: "Lire un dashboard, juger un chiffre, mémoriser un slide.",
      },
      data: {
        kicker: "Le socle",
        title: "Ingénierie & architecture",
        blurb: "Modèle, grain, pipeline, jointures — ce qui tient le dashboard debout.",
      },
      snowflake: {
        kicker: "Le flocon",
        title: "Snowflake",
        blurb:
          "Warehouses, micro-partitions, Time Travel, clone zéro-copie, streams et tasks — la doc, mais avec les mains, l’oreille, et un score.",
      },
    },
    games: {
      anomalie: {
        name: "Anomalie",
        verb: "Jouer anomalie",
        tagline: "Un chiffre n'appartient pas à l'histoire. Trouve-le.",
        how: "Cinq graphiques. Un point qui cloche à chaque fois. Touche la barre fautive — spike, chute, ou rupture de tendance.",
      },
      graphique: {
        name: "Graphique",
        verb: "Jouer graphique",
        tagline: "La bonne question mérite le bon dessin.",
        how: "Les mêmes chiffres, quatre dessins. Tourne-les. Quand c’est lisible, tu valides.",
      },
      entonnoir: {
        name: "Entonnoir",
        verb: "Jouer entonnoir",
        tagline: "Empile le parcours. Le leak se montre tout seul.",
        how: "Tape les étapes : elles s’empilent, du plus large au plus étroit. Ensuite on verse — et on voit où ça fuit.",
      },
      memoire: {
        name: "Mémoire",
        verb: "Jouer mémoire",
        tagline: "Un tableau de bord, quelques secondes. Puis plus rien.",
        how: "Mémorise les KPI, les couleurs, le filtre. En Facile, une question. En Brutal, le slide se vide : tu le reconstruis tuile par tuile.",
      },
      bruit: {
        name: "Bruit",
        verb: "Jouer bruit",
        tagline: "Le chiffre a bougé. Est-ce que ça veut dire quelque chose ?",
        how: "Une série, une zone marquée. Tendance, saison, rupture ou simple bruit ? L'œil BI, c'est ça.",
      },
      schema: {
        name: "Schéma",
        verb: "Jouer schéma",
        tagline: "Étoile, 3NF, SCD, lakehouse. Le modèle avant le dashboard.",
        how: "Tu glisses le fait au centre, tu poses un ticket OLTP, tu versionnes Léa. Le modèle se construit, il ne se coche pas.",
      },
      pipeline: {
        name: "Pipeline",
        verb: "Jouer pipeline",
        tagline: "Remets les jobs dans l'ordre. Sinon le mart ment.",
        how: "Tape un job, puis un quai — il s’aimante. Un quai menteur, ça explose.",
      },
      jointure: {
        name: "Jointure",
        verb: "Jouer jointure",
        tagline: "INNER, LEFT, FULL, ANTI. La question décide, pas l'habitude.",
        how: "Deux tables, une question métier. Choisis la jointure. Tu verras quelles lignes survivent.",
      },
      grain: {
        name: "Grain",
        verb: "Jouer grain",
        tagline: "Une ligne, ça représente quoi ? Mauvaise clé, mauvais KPI.",
        how: "Tape les en-têtes : la table se plie sur ta clé. Une colonne poison, tu l’arraches.",
      },
      entrepot: {
        name: "Entrepôt",
        verb: "Jouer entrepôt",
        tagline: "Le compute se paie à la seconde. Trop petit ça file, trop gros ça saigne.",
        how: "Un fader, des crédits qui cliquent. Tu dimensionnes le warehouse, tu le réveilles, tu le suspends.",
      },
      elagage: {
        name: "Élagage",
        verb: "Jouer élagage",
        tagline: "La requête ne lit pas la table. Elle lit des micro-partitions.",
        how: "Chaque tuile est une micro-partition. Tu n’écoutes que celles qui overlapent le filtre.",
      },
      voyage: {
        name: "Voyage",
        verb: "Jouer voyage",
        tagline: "AT, BEFORE, UNDROP. Puis Fail-safe, et c’est trop tard.",
        how: "Une bande, une tête de lecture. Tu rebobines dans la rétention. Hors délai, plus de SELECT.",
      },
      clone: {
        name: "Clone",
        verb: "Jouer clone",
        tagline: "Zéro copie : des pointeurs, pas des octets. Jusqu’au premier UPDATE.",
        how: "CLONE, un tap. CTAS, tu maintiens. UPDATE, tu frappes le clone.",
      },
      flux: {
        name: "Flux",
        verb: "Jouer flux",
        tagline: "Un stream est un signet. La task tape la mesure. Le SELECT ne consomme rien.",
        how: "Le métronome de la task. Tu n’avances l’offset que par un DML.",
      },
    },
  },
  en: {
    bar: {
      nav: "Navigation",
      mute: "Mute",
      unmute: "Unmute",
      sound: "Sound",
      muted: "Muted",
      home: "Home",
      projects: "Projects",
      about: "About",
      signal: "Signal",
    },
    hub: {
      lede: "Mini-games for the BI eye, the data stack, and Snowflake. Read a dashboard, set a grain, then hear a warehouse tick credits. Five rounds. Score out of 50.",
      principle: "The idea",
      principleBody:
        "No lecture. A decision, a verdict, a lesson. The business eye, then engineering, then the flake — because a wrong KPI often starts with a bad key, or a warehouse that’s too large.",
      played: (best, max) => `best ${best}/${max}`,
      idle: "not played yet",
      dustTitle: "The number is not born in the dashboard.",
      dustBody:
        "Step into the dark frame. Signal fireflies cling to the cursor. Leave: they go out. Come back: it starts from zero.",
      dustCta: "Play the stack",
      footerAuthor: "A personal project by",
      footerScores: "Scores and the board stay on this device. No account, no tracking.",
    },
    shell: {
      games: "Games",
      start: "Five rounds. Let’s go.",
      next: "Next round",
      score: "See the score",
      replay: "Play again",
      all: "All games",
      situation: "Situation",
    },
    lobby: {
      solo: "Solo",
      multi: "With others",
      daily: "Today",
      soloHint: "Your rounds, your pace.",
      multiHint: "Same draw, each on their own time.",
      dailyHint: (day) => `The same rounds for everyone · ${day}`,
      easy: "Easy",
      hard: "Hard",
      brutal: "Brutal",
      difficulty: "Difficulty",
      diffHint: {
        easy: "Three Easy-only rounds — not the Hard set. Wide signal, few decoys.",
        hard: "Five different situations. More decoys, less slack, tighter each round.",
        brutal: "Five more unique rounds. Tiny gap from the first beat. Then it gets worse.",
      },
      play: "Play",
      copyLink: "Copy link",
      copied: "Link copied",
      inviteTitle: "Challenge link",
      inviteBody:
        "Friends open the same game, the same rounds, whenever they want. No live room — just a shared draw.",
      room: "Code",
      back: "Back",
      rounds: (n) => (n === 1 ? "1 round" : `${n} rounds`),
    },
    board: {
      title: "High scores",
      submitted: (n) => (n === 1 ? "1 score submitted." : `${n.toLocaleString("en-US")} scores submitted.`),
      empty: "No scores on this board yet.",
      close: "Close",
      initials: "Your initials",
      open: "High scores",
      post: "Post score",
      posted: (name) => `Saved as ${name}`,
      needInitials: "Three letters for the board. They stay on this device.",
    },
    tracks: {
      bi: {
        kicker: "The eye",
        title: "Business intelligence",
        blurb: "Read a dashboard, judge a number, remember a slide.",
      },
      data: {
        kicker: "The stack",
        title: "Engineering & architecture",
        blurb: "Model, grain, pipeline, joins — what keeps the dashboard standing.",
      },
      snowflake: {
        kicker: "The flake",
        title: "Snowflake",
        blurb:
          "Warehouses, micro-partitions, Time Travel, zero-copy clone, streams and tasks — the docs, but with your hands, your ear, and a score.",
      },
    },
    games: {
      anomalie: {
        name: "Anomaly",
        verb: "Play anomaly",
        tagline: "One number doesn’t belong in the story. Find it.",
        how: "Five charts. Something’s off each time. Tap the guilty bar — spike, drop, or a break in the trend.",
      },
      graphique: {
        name: "Chart",
        verb: "Play chart",
        tagline: "The right question deserves the right drawing.",
        how: "Same numbers, four drawings. Flip them. When it’s readable, lock it in.",
      },
      entonnoir: {
        name: "Funnel",
        verb: "Play funnel",
        tagline: "Stack the journey. The leak shows itself.",
        how: "Tap the steps: they stack, wide to narrow. Then pour — and watch where it leaks.",
      },
      memoire: {
        name: "Memory",
        verb: "Play memory",
        tagline: "A dashboard, a few seconds. Then nothing.",
        how: "Memorize the KPIs, the colors, the filter. Easy asks one question. Brutal empties the slide: you rebuild it tile by tile.",
      },
      bruit: {
        name: "Noise",
        verb: "Play noise",
        tagline: "The number moved. Does it mean anything?",
        how: "A series, a marked window. Trend, season, break, or just a twitch? That’s the BI eye.",
      },
      schema: {
        name: "Schema",
        verb: "Play schema",
        tagline: "Star, 3NF, SCD, lakehouse. The model before the dashboard.",
        how: "Slide the fact to the center, park a ticket on OLTP, version Léa. The model is built, not ticked.",
      },
      pipeline: {
        name: "Pipeline",
        verb: "Play pipeline",
        tagline: "Put the jobs in order. Or the mart lies.",
        how: "Tap a job, then a dock — it magnets on. A lying dock explodes.",
      },
      jointure: {
        name: "Join",
        verb: "Play join",
        tagline: "INNER, LEFT, FULL, ANTI. The question decides, not habit.",
        how: "Two tables, one business question. Pick the join. You’ll see which rows survive.",
      },
      grain: {
        name: "Grain",
        verb: "Play grain",
        tagline: "What does one row represent? Wrong key, wrong KPI.",
        how: "Tap the headers: the table folds on your key. A poison column, you tear it out.",
      },
      entrepot: {
        name: "Warehouse",
        verb: "Play warehouse",
        tagline: "Compute is billed by the second. Too small it queues, too big it bleeds.",
        how: "A fader, clicking credits. Size the warehouse, wake it, suspend it.",
      },
      elagage: {
        name: "Pruning",
        verb: "Play pruning",
        tagline: "The query doesn’t read the table. It reads micro-partitions.",
        how: "Each tile is a micro-partition. You only listen to the ones that overlap the filter.",
      },
      voyage: {
        name: "Travel",
        verb: "Play travel",
        tagline: "AT, BEFORE, UNDROP. Then Fail-safe, and it’s too late.",
        how: "A tape, a playhead. Rewind inside retention. Past that, no SELECT.",
      },
      clone: {
        name: "Clone",
        verb: "Play clone",
        tagline: "Zero copy: pointers, not bytes. Until the first UPDATE.",
        how: "CLONE, a tap. CTAS, you hold. UPDATE, you punch the clone.",
      },
      flux: {
        name: "Stream",
        verb: "Play stream",
        tagline: "A stream is a bookmark. The task hits the measure. SELECT consumes nothing.",
        how: "The task metronome. The offset only moves with a DML.",
      },
    },
  },
};
