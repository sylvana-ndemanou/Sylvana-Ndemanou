// @ts-nocheck
import type { GameSlug } from "@s/lib/games";
import type { Locale } from "@s/lib/locale";

export type RoundNarration = {
  context?: string;
  question?: string;
  ok?: string;
  miss?: string;
  title?: string;
  name?: string;
  lesson?: string;
  steps?: string[];
  events?: { label?: string; rows?: string }[];
  zones?: { id: string; label: string; blurb: string }[];
  leftName?: string;
  rightName?: string;
  token?: string;
};

type Punch = { ok: string; miss: string; mid?: string };

export type PlayUi = {
  punch: Record<GameSlug, Punch>;
  punchMid: { almost: string; grain: string };
  briefContinue: string;
  briefHint: string;
  lockHead: string;
  execute: string;
  keepLens: string;
  sealRead: string;
  readable: string;
  pour: string;
  runPacket: string;
  yank: string;
  lockGrain: string;
  scan: string;
  sealSize: string;
  unit: (unit: string) => string;
  compareBars: string;
  anomalieQ: { spike: string; dip: string; break: string; intruder: string };
  charts: Record<string, string>;
  joins: { inner: string; left: string; full: string; anti: string };
  noise: { tendance: string; saison: string; bruit: string; rupture: string };
  noiseHint: { tendance: string; saison: string; bruit: string; rupture: string };
  voyage: {
    band: string;
    actions: Record<string, { label: string; hint: string }>;
    head: (i: number, n: number) => string;
    rewind: string;
    ticket: string;
  };
  clone: {
    prod: string;
    target: string;
    pointers: string;
    bytes: string;
    delta: string;
    tap: string;
    hold: (s: number) => string;
    punch: string;
  };
  flux: {
    dml: string;
    select: string;
    hold: string;
    empty: string;
    hasData: string;
    parent: string;
    child: string;
    bpm: string;
  };
  memoire: {
    filter: string;
    qFilter: string;
    qRed: string;
    qBest: string;
    qCa: string;
    qConv: string;
    qRebuild: string;
    look: (s: number) => string;
    rebuildHint: string;
  };
  grain: {
    tapKey: string;
    unique: (n: number) => string;
    crush: (c: number, u: number) => string;
    yanked: string;
    poison: (sum: number, doubled: boolean) => string;
  };
  elagage: {
    question: string;
    scanN: (scan: number, pruned: number, pct: number) => string;
    part: (i: number) => string;
  };
  entrepot: {
    credits: (n: number) => string;
    minBill: string;
    resume: string;
    suspend: string;
  };
  funnelQ: string;
  funnelFloors: (n: number) => string;
  pipelineQ: string;
  pipelineHeld: (job: string) => string;
  conveyor: string;
  memoireLook: string;
  memoireClosed: string;
  dropHere: string;
  shelfN: (n: number) => string;
  looseSteps: string;
  funnelFull: string;
  partialN: (k: number, n: number) => string;
  packetRunning: string;
  dock: string;
  jobPile: string;
  joinResult: (name: string, n: number) => string;
  joinHint: string;
  joinOut: (n: number) => string;
  bruitQ: string;
  bruitLayer: (name: string) => string;
  bruitDrag: (n: number) => string;
  grainFold: (n: number, keys: string) => string;
  virtualWh: string;
  creditsSpent: (n: string, running: boolean) => string;
  schemaDim: string;
  schemaFact: string;
  starFull: string;
  starHint: string;
  schemaChips: Record<string, string>;
  scdDim: string;
  scdFact: string;
  scdRewrite: string;
  scdHold: string;
  scdOverwrite: string;
  scdVersion: string;
  lockSlide: string;
  decoys: string[];
  stripHint: string;
  boomDock: (n: number) => string;
  jobEmpty: string;
};

const punchFr: Record<GameSlug, Punch> = {
  anomalie: { ok: "Vu.", miss: "À côté." },
  graphique: { ok: "Lisible.", miss: "Mauvais dessin." },
  entonnoir: { ok: "Le leak est nu.", miss: "Mauvais étage.", mid: "Presque l’ordre." },
  memoire: { ok: "Ancré.", miss: "Le slide a gagné." },
  bruit: { ok: "Lecture nette.", miss: "Mauvaise couche." },
  schema: { ok: "Ça tient.", miss: "Mauvais modèle." },
  pipeline: { ok: "Le mart est vrai.", miss: "Le quai a menti.", mid: "Presque l’ordre." },
  jointure: { ok: "La bonne lentille.", miss: "Mauvais Venn." },
  grain: { ok: "Bon grain.", miss: "Grain faux.", mid: "Presque le grain." },
  entrepot: { ok: "Compute juste.", miss: "Mauvais wattage." },
  elagage: { ok: "Pruning net.", miss: "Trop (ou trop peu) lu." },
  voyage: { ok: "Le passé tient.", miss: "Mauvais instant." },
  clone: { ok: "Pointeurs justes.", miss: "Mauvaise copie." },
  flux: { ok: "Offset avancé.", miss: "Mauvais temps." },
};

const punchEn: Record<GameSlug, Punch> = {
  anomalie: { ok: "Spotted.", miss: "Wrong bar." },
  graphique: { ok: "Readable.", miss: "Wrong chart." },
  entonnoir: { ok: "The leak is naked.", miss: "Wrong shelf.", mid: "Almost the order." },
  memoire: { ok: "Anchored.", miss: "The slide won." },
  bruit: { ok: "Clean read.", miss: "Wrong overlay." },
  schema: { ok: "It holds.", miss: "Wrong model." },
  pipeline: { ok: "The mart is honest.", miss: "A dock lied.", mid: "Almost the order." },
  jointure: { ok: "Right lens.", miss: "Wrong Venn." },
  grain: { ok: "Right grain.", miss: "Wrong grain.", mid: "Almost the grain." },
  entrepot: { ok: "Right compute.", miss: "Wrong wattage." },
  elagage: { ok: "Clean prune.", miss: "Too much (or too little) scanned." },
  voyage: { ok: "The past holds.", miss: "Wrong instant." },
  clone: { ok: "Pointers right.", miss: "Wrong copy." },
  flux: { ok: "Offset advanced.", miss: "Wrong beat." },
};

export const PLAY_UI: Record<Locale, PlayUi> = {
  fr: {
    punch: punchFr,
    punchMid: { almost: "Presque.", grain: "Presque le grain." },
    briefContinue: "Toucher pour jouer",
    briefHint: "Lis d’abord. Le visuel vient ensuite.",
    lockHead: "Place d’abord la tête",
    execute: "Exécuter",
    keepLens: "Garder cette lentille",
    sealRead: "Sceller cette lecture",
    readable: "C’est lisible",
    pour: "Verser le trafic",
    runPacket: "Lancer le paquet",
    yank: "Verrouiller l’arrachement",
    lockGrain: "Verrouiller le grain",
    scan: "Lancer le scan",
    sealSize: "Sceller la taille",
    unit: (unit) => `Unité : ${unit}. Touche une barre.`,
    compareBars: "Compare barre à barre.",
    anomalieQ: {
      spike: "Où est le pic ?",
      dip: "Où est le creux ?",
      break: "Où la série change-t-elle de régime ?",
      intruder: "Où est l’intrus ?",
    },
    charts: {
      line: "Courbe",
      bar: "Barres",
      pie: "Camembert",
      area: "Aires",
      scatter: "Nuage",
      stack: "Empilé",
    },
    joins: {
      inner: "l’intersection",
      left: "tout à gauche",
      full: "personne perdu",
      anti: "sans match",
    },
    noise: { tendance: "Tendance", saison: "Saison", bruit: "Bruit", rupture: "Rupture" },
    noiseHint: {
      tendance: "une pente qui tient",
      saison: "ça revient",
      bruit: "une dent",
      rupture: "le palier change",
    },
    voyage: {
      band: "Ligne · Time Travel",
      actions: {
        at: { label: "SELECT / CLONE AT", hint: "lire ce timestamp" },
        undrop: { label: "UNDROP", hint: "objet dropped" },
        failsafe: { label: "Fail-safe", hint: "plus d’accès SQL" },
        now: { label: "Pas de Time Travel", hint: "rétention 0" },
      },
      head: (i, n) => `Tête de lecture · arrêt ${i + 1}/${n}`,
      rewind: "Glisse le tram. AT lit l’arrêt où tu t’arrêtes.",
      ticket: "Ticket",
    },
    clone: {
      prod: "prod_ventes",
      target: "cible",
      pointers: "clone · pointeurs · +0 To",
      bytes: "ctas · octets · copie pleine",
      delta: "clone + delta · µ-parts neuves",
      tap: "tap · zéro copie · retape pour valider",
      hold: (s) => `maintiens ${s}s · octets`,
      punch: "frappe · nouveaux µ-part",
    },
    flux: {
      dml: "MERGE / INSERT SELECT",
      select: "SELECT FROM stream",
      hold: "Ne rien lancer",
      empty: "stream vide · HAS_DATA = false",
      hasData: "HAS_DATA = true",
      parent: "parent",
      child: "enfant prêt",
      bpm: "BPM task",
    },
    memoire: {
      filter: "Filtre",
      qFilter: "Quel filtre était actif ?",
      qRed: "Quel indicateur était dans le rouge ?",
      qBest: "Qui progressait le plus ?",
      qCa: "Quel était le CA affiché ?",
      qConv: "Conversion : c’était lequel ?",
      qRebuild: "Le slide est fermé. Remets chaque tuile à sa place, et le filtre.",
      look: (s) => `${s} s pour ancrer`,
      rebuildHint: "Repose les tuiles. Le filtre d’abord.",
    },
    grain: {
      tapKey: "Tape une colonne-clé. La table te montrera ce qui fusionne.",
      unique: (n) => `${n} lignes uniques — rien ne s’écrase.`,
      crush: (c, u) =>
        `${c} ligne${c > 1 ? "s" : ""} écrasée${c > 1 ? "s" : ""} · ${u} grain${u > 1 ? "s" : ""} restant${u > 1 ? "s" : ""}.`,
      yanked: "Colonne poison arrachée. Le SUM redevient honnête.",
      poison: (sum, doubled) => `SUM poison = ${sum}${doubled ? " — ça double." : ""}`,
    },
    elagage: {
      question: "Touche les micro-partitions à scanner. Le silence, c’est du pruning.",
      scanN: (scan, pruned, pct) => `${scan} scan · ${pruned} pruned · ${pct}% silence`,
      part: (i) => `μ-part ${i + 1}`,
    },
    entrepot: {
      credits: (n) => `${n} crédit${n > 1 ? "s" : ""} / heure`,
      minBill: "Minimum de facturation (secondes)",
      resume: "RESUME",
      suspend: "SUSPEND",
    },
    funnelQ: "Empile le parcours. Le goulot se montre après.",
    funnelFloors: (n) => `${n} étages · large → étroit`,
    pipelineQ: "Monte la ligne. Ensuite on fait courir un paquet.",
    pipelineHeld: (job) => `Quai pour « ${job} » ?`,
    conveyor: "Convoyeur",
    memoireLook: "grave-le",
    memoireClosed: "Le slide est fermé. Reconstruis-le.",
    dropHere: "dépose ici",
    shelfN: (n) => `étage ${n}`,
    looseSteps: "Étapes en vrac",
    funnelFull: "Entonnoir plein — verse.",
    partialN: (k, n) => `${k}/${n} étages justes.`,
    packetRunning: "Le paquet court…",
    dock: "quai",
    jobPile: "Tas de jobs",
    joinResult: (name, n) => `résultat · ${name} · ${n} ligne${n > 1 ? "s" : ""}`,
    joinHint: "glisse une lentille",
    joinOut: (n) => `${n} ligne${n > 1 ? "s" : ""}`,
    bruitQ: "Glisse un calque. Qu’est-ce que c’est, la zone marquée ?",
    bruitLayer: (name) => `calque · ${name}`,
    bruitDrag: (n) => `glisse un calque · ${n} points`,
    grainFold: (n, keys) => `${n} lignes → 1 sur ${keys}`,
    virtualWh: "Entrepôt virtuel",
    creditsSpent: (n, running) => `Crédits · ${n}${running ? " · RUNNING" : " · SUSPENDED"}`,
    schemaDim: "dim",
    schemaFact: "fait",
    starFull: "Étoile complète — valide.",
    starHint: "Attrape une pièce, glisse-la, dépose-la sur DIM ou FAIT.",
    schemaChips: {
      date: "date",
      magasin: "magasin",
      produit: "produit",
      client: "client",
      CA: "CA",
    },
    scdDim: "dim_client",
    scdFact: "fait commandes 2023",
    scdRewrite: "Le passé vient d’être réécrit.",
    scdHold: "Le fait pointe encore v1. L’histoire tient.",
    scdOverwrite: "Écraser l’adresse",
    scdVersion: "Nouvelle version",
    lockSlide: "Verrouiller le slide",
    decoys: ["Cohorte S12", "iOS 18+", "VIP 90j", "B2B Nord", "Retours 14j", "Affiliés"],
    stripHint: "Touche ce qui n’est pas une clé ni une mesure.",
    boomDock: (n) => `Explosion au quai ${n}.`,
    jobEmpty: "Tas vide — lance le run.",
  },
  en: {
    punch: punchEn,
    punchMid: { almost: "Almost.", grain: "Almost the grain." },
    briefContinue: "Tap to play",
    briefHint: "Read first. The board comes after.",
    lockHead: "Park the head first",
    execute: "Run it",
    keepLens: "Keep this lens",
    sealRead: "Seal this read",
    readable: "It’s readable",
    pour: "Pour the traffic",
    runPacket: "Send the packet",
    yank: "Lock the yank",
    lockGrain: "Lock the grain",
    scan: "Run the scan",
    sealSize: "Seal the size",
    unit: (unit) => `Unit: ${unit}. Tap a bar.`,
    compareBars: "Compare bar to bar.",
    anomalieQ: {
      spike: "Where is the spike?",
      dip: "Where is the dip?",
      break: "Where does the series change regime?",
      intruder: "Where is the odd one out?",
    },
    charts: {
      line: "Line",
      bar: "Bars",
      pie: "Pie",
      area: "Area",
      scatter: "Scatter",
      stack: "Stacked",
    },
    joins: {
      inner: "the intersection",
      left: "keep the left",
      full: "lose nobody",
      anti: "no match",
    },
    noise: { tendance: "Trend", saison: "Season", bruit: "Noise", rupture: "Break" },
    noiseHint: {
      tendance: "a slope that holds",
      saison: "it comes back",
      bruit: "a blip",
      rupture: "the level shifts",
    },
    voyage: {
      band: "Line · Time Travel",
      actions: {
        at: { label: "SELECT / CLONE AT", hint: "read this timestamp" },
        undrop: { label: "UNDROP", hint: "dropped object" },
        failsafe: { label: "Fail-safe", hint: "no SQL access" },
        now: { label: "No Time Travel", hint: "retention 0" },
      },
      head: (i, n) => `Playhead · stop ${i + 1}/${n}`,
      rewind: "Slide the tram. AT reads the stop you park on.",
      ticket: "Ticket",
    },
    clone: {
      prod: "prod_sales",
      target: "target",
      pointers: "clone · pointers · +0 TB",
      bytes: "ctas · bytes · full copy",
      delta: "clone + delta · new µ-parts",
      tap: "tap · zero-copy · tap again to lock",
      hold: (s) => `hold ${s}s · bytes`,
      punch: "punch · new µ-parts",
    },
    flux: {
      dml: "MERGE / INSERT SELECT",
      select: "SELECT FROM stream",
      hold: "Launch nothing",
      empty: "empty stream · HAS_DATA = false",
      hasData: "HAS_DATA = true",
      parent: "parent",
      child: "child ready",
      bpm: "Task BPM",
    },
    memoire: {
      filter: "Filter",
      qFilter: "Which filter was on?",
      qRed: "Which KPI was in the red?",
      qBest: "Which one rose the most?",
      qCa: "What revenue was on screen?",
      qConv: "Conversion: which value was it?",
      qRebuild: "The slide is gone. Put every tile back, and the filter.",
      look: (s) => `${s} s to lock it in`,
      rebuildHint: "Rebuild the tiles. Filter first.",
    },
    grain: {
      tapKey: "Tap a key column. The table shows what would collapse.",
      unique: (n) => `${n} unique rows — nothing collapses.`,
      crush: (c, u) => `${c} row${c > 1 ? "s" : ""} crushed · ${u} grain${u > 1 ? "s" : ""} left.`,
      yanked: "Poison column yanked. The SUM is honest again.",
      poison: (sum, doubled) => `Poison SUM = ${sum}${doubled ? " — it doubles." : ""}`,
    },
    elagage: {
      question: "Tap the micro-partitions to scan. Silence is pruning.",
      scanN: (scan, pruned, pct) => `${scan} scan · ${pruned} pruned · ${pct}% silence`,
      part: (i) => `μ-part ${i + 1}`,
    },
    entrepot: {
      credits: (n) => `${n} credit${n > 1 ? "s" : ""} / hour`,
      minBill: "Minimum billing (seconds)",
      resume: "RESUME",
      suspend: "SUSPEND",
    },
    funnelQ: "Stack the journey. The bottleneck shows after.",
    funnelFloors: (n) => `${n} shelves · wide → narrow`,
    pipelineQ: "Build the line. Then we run a packet through.",
    pipelineHeld: (job) => `Dock for “${job}”?`,
    conveyor: "Conveyor",
    memoireLook: "lock it in",
    memoireClosed: "The slide is closed. Rebuild it.",
    dropHere: "drop here",
    shelfN: (n) => `shelf ${n}`,
    looseSteps: "Loose steps",
    funnelFull: "Funnel full — pour.",
    partialN: (k, n) => `${k}/${n} shelves right.`,
    packetRunning: "Packet running…",
    dock: "dock",
    jobPile: "Job pile",
    joinResult: (name, n) => `result · ${name} · ${n} row${n > 1 ? "s" : ""}`,
    joinHint: "drop a lens",
    joinOut: (n) => `${n} row${n > 1 ? "s" : ""}`,
    bruitQ: "Drop a layer. What is the marked zone?",
    bruitLayer: (name) => `layer · ${name}`,
    bruitDrag: (n) => `drop a layer · ${n} points`,
    grainFold: (n, keys) => `${n} rows → 1 on ${keys}`,
    virtualWh: "Virtual warehouse",
    creditsSpent: (n, running) => `Credits · ${n}${running ? " · RUNNING" : " · SUSPENDED"}`,
    schemaDim: "dim",
    schemaFact: "fact",
    starFull: "Star complete — lock it.",
    starHint: "Grab a piece, drag it, drop it on DIM or FACT.",
    schemaChips: {
      date: "date",
      magasin: "store",
      produit: "product",
      client: "customer",
      CA: "revenue",
    },
    scdDim: "dim_customer",
    scdFact: "fact orders 2023",
    scdRewrite: "The past just got rewritten.",
    scdHold: "The fact still points at v1. History holds.",
    scdOverwrite: "Overwrite the address",
    scdVersion: "New version",
    lockSlide: "Lock the slide",
    decoys: ["Cohort S12", "iOS 18+", "VIP 90d", "B2B North", "Returns 14d", "Affiliates"],
    stripHint: "Tap what is neither a key nor a measure.",
    boomDock: (n) => `Boom at dock ${n}.`,
    jobEmpty: "Pile empty — run it.",
  },
};

const n = (
  context: string,
  question: string,
  ok: string,
  miss: string,
  extra: Partial<RoundNarration> = {}
): RoundNarration => ({ context, question, ok, miss, ...extra });

const EN: Record<string, Record<string, RoundNarration>> = {
  anomalie: {
    "ca-shop": n(
      "Weekly revenue — online shop",
      "",
      "A spike that leaves the pack is the first reflex: you point, you don’t celebrate yet.",
      "The bar that’s too high isn’t “a good week”. It’s the odd one. Always that one."
    ),
    "conv-landing": n(
      "Conversion rate — landing",
      "",
      "The hole is visible. A broken page, a dead pixel, a form that no longer submits.",
      "The dip is not the average. It’s the week the funnel snapped."
    ),
    tickets: n(
      "Support tickets — single queue",
      "",
      "Volume doubles at once. A product incident, or an email that went out too early.",
      "When everything is flat except one bar, that isn’t “a bit more activity”. That’s the incident."
    ),
    "ca-market": n(
      "Weekly revenue — marketplace",
      "",
      "Isolated spike. Before celebrating, check tracking, an unplanned promo, or one huge client.",
      "A spike isn’t a win until you’ve ruled out a bot, double counting, or a one-shot B2B order."
    ),
    "conv-funnel": n(
      "Conversion rate — 4-step funnel",
      "",
      "A sharp drop in a stable series is often a funnel bug, not a market collapse.",
      "Here the dip speaks. Conversion that plunges one week = form, pixel, or a page that broke."
    ),
    "panier-mix": n(
      "Average basket — channel mix",
      "",
      "Average basket dropped. Product mix, a discount too wide, or a low-ticket channel taking over.",
      "The smallest isn’t always the most interesting — except when it breaks the trend. That one."
    ),
    nps: n(
      "NPS — monthly waves",
      "",
      "An NPS that jumps at once is often a tiny sample, or a very visible incident.",
      "That wasn’t the trend: one wave off-norm. You don’t rebuild culture for a blip."
    ),
    "dau-app": n(
      "Active users — app",
      "",
      "This isn’t noise: the series changed regime. Tracking, KPI definition, or a real usage shift.",
      "A level break isn’t a season. Look for what changed in the measure — or in the product."
    ),
    marge: n(
      "Gross margin — mixed SKUs",
      "",
      "The dip is tiny. Often a low-margin SKU took the volume, not “the market”.",
      "Brutal: the odd one hides in the noise. The smallest gap, if it breaks the slope, is the signal."
    ),
    "sessions-track": n(
      "Sessions — after a tracking rewrite",
      "",
      "The level moved a few points. In BI, a pixel change can read as “growth”.",
      "This isn’t a season. The series changed worlds — often the definition, not the customers."
    ),
    "delay-3pl": n(
      "Delivery delay — 3PL",
      "",
      "One extra day, once. Strike, warehouse, or a B2B batch. Not a new policy.",
      "The spike is too discreet to jump out. On Hard you saw it; here you compare bar to bar."
    ),
    "open-rate": n(
      "Open rate — 18 sends",
      "",
      "One send a bit lower. Subject too long, or a tired segment. Not an “engagement collapse”.",
      "Without the other sends, this dip looks like noise. It was the odd one."
    ),
    "ca-daily": n(
      "Daily revenue — 14 days",
      "",
      "Mid-series, the average slides. A standing promo, or a channel settling in. Date the change.",
      "A soft break isn’t a spike. Find the day the slope changed, not the tallest bar."
    ),
  },
  graphique: {
    "ca-months": n(
      "A film, not a photo. The tool has to tell time.",
      "Is revenue rising, month after month?",
      "The line is built for this. A pie over six months is six slices with no story.",
      "For a path over time, you want a line. A pie compares shares, not a journey."
    ),
    region: n(
      "Four bars, a ranking. No time.",
      "Which region weighs the most, this quarter?",
      "Bars: the biggest reads in a second. Four lines, nobody compares.",
      "A ranking at time T is bars. Lines tell time."
    ),
    "mix-3": n(
      "Few slices, one snapshot. The pie is allowed to exist.",
      "How does revenue split across 3 products — this year?",
      "Three slices, one photo: the pie is readable. Past five, you stop.",
      "Here the pie is allowed. Lines have nothing to say about a snapshot."
    ),
    "ca-12": n(
      "Flip the tools. You’ll see which one tells the slope — and which hides it.",
      "How did revenue move over 12 months?",
      "The line shows time. A 12-month pie is a visual crime: more slices, less story.",
      "For a path, you want a line (or bars ordered in time). A pie compares shares, not a journey."
    ),
    "region-q": n(
      "Four regions. A photo, not a film. Change tool.",
      "Which region weighs most in revenue this quarter?",
      "Bars: the ranking reads in a second. Four lines, nobody compares heights.",
      "A ranking at time T is bars. Lines tell time, not relative weight."
    ),
    "cac-mix": n(
      "Ads / affiliate / organic mix. Spin it. The mix must stay visible.",
      "What is acquisition cost made of, month after month?",
      "Stacked: you see the total and the mix. Twelve pies is a PowerPoint, not analysis.",
      "Composition over time = stack. A pie freezes a month. A single line hides the mix."
    ),
    "basket-nps": n(
      "Each point is a customer. Look for a cloud, not a total.",
      "Does average basket rise with satisfaction?",
      "The scatter is the only honest one here. Correlation isn’t causation — but at least you see a cloud, or soup.",
      "Two continuous variables: a scatter. Bars aggregate too early and invent a relationship."
    ),
    cash: n(
      "Not just the slope: the area counts. It’s a reserve, not a ranking.",
      "Cash on hand, month after month — we want the volume under the curve.",
      "Area insists on visual cumulative. A bar compares months; area tells the reserve.",
      "A bar ranks. An area shows what accumulates. Here we wanted volume under the curve."
    ),
    "cac-ltv": n(
      "Two continuous metrics. No time, no shares. The trap is the line.",
      "CAC vs LTV, by cohort. Is there even a link?",
      "A scatter. Joining the points in time would invent a story the cohorts don’t have.",
      "A line orders a time that doesn’t exist here. Two axes, individuals: scatter."
    ),
    "mix-evo": n(
      "The total moves, the mix too. One drawing has to carry both.",
      "Paid / CRM / organic mix — and the total’s path, together.",
      "Stacked: mix + total. A single area drowns the channels. A pie kills time.",
      "A single area hides who is pushing. A pie freezes a month. Here, stacking is the contract."
    ),
    "sku-11": n(
      "Too many slices. The pie will lie — even if it’s “a photo”.",
      "Shares of 11 SKU categories, this month only.",
      "Eleven slices: sorted bars. The pie becomes an unreadable wheel. The five-slice rule still holds.",
      "“Time T” does not give the pie infinite rights. Past five slices, you go to bars."
    ),
    ice: n(
      "Each day is a point. Connecting them tells a serial.",
      "Temperature vs ice-cream sales, 40 days. A relationship, or soup?",
      "Scatter. A line would impose an order (the calendar) that isn’t the question.",
      "The question isn’t “how it moved in time”, it’s “is it linked”. Scatter."
    ),
    pipeline: n(
      "A ranking of stages, not an animated funnel. The business order is already on the axis.",
      "Sales pipeline: how many in each stage, today.",
      "Bars: stock per stage. A pie hides absolute volumes.",
      "A pie gives shares. A pipeline is read in heads, not percentages."
    ),
  },
  entonnoir: {
    boutique: {
      name: "Simple shop",
      steps: ["Visit", "Cart", "Purchase"],
      lesson: "Three shelves. The leak is visit → cart — not “at checkout” by magic.",
    },
    newsletter: {
      name: "Newsletter",
      steps: ["Send", "Open", "Click"],
      lesson: "Opening isn’t clicking. The real bottleneck is often the click, not the subject.",
    },
    app: {
      name: "App onboarding",
      steps: ["Install", "Account", "First use"],
      lesson: "Install tells the store. First use tells the product.",
    },
    ecom: {
      name: "E-commerce",
      steps: ["Visit", "Product page", "Cart", "Payment", "Purchase"],
      lesson: "The biggest leak isn’t always the last. Here payment holds — product → cart is bleeding.",
    },
    saas: {
      name: "B2B SaaS",
      steps: ["Visit", "Trial", "Activation", "Paid", "90-day retention"],
      lesson: "A trial without activation is vanity. The real bottleneck is often the aha, not the pricing page.",
    },
    lead: {
      name: "Lead gen",
      steps: ["Impression", "Click", "Form", "MQL", "SQL"],
      lesson: "Multiplying rates drops fast. A strong CTR with rotten MQLs is media bought for nothing.",
    },
    mobile: {
      name: "Mobile app",
      steps: ["Install", "Onboarding", "D+1", "D+7", "In-app purchase"],
      lesson: "D+7 retention tells the product. Install tells the store. You don’t fix both with the same lever.",
    },
    retail: {
      name: "Omni retail",
      steps: ["Store traffic", "Try-on", "Checkout", "Ticket", "14-day return"],
      lesson: "A low return rate isn’t a win if nobody reaches the till. Read the funnel with the flow.",
    },
    plg: {
      name: "PLG + sales-assist",
      steps: ["Visit", "Signup", "Activation", "PQL", "Demo", "Won"],
      lesson: "PQL is not MQL. Demo before activation is selling before the aha. PLG reads product first.",
    },
    market: {
      name: "Two-sided marketplace",
      steps: ["Buyer visit", "Search", "Listing", "Offer", "Payment", "Delivery", "Review"],
      lesson: "Two sides, one funnel. The offer (seller) isn’t the listing (buyer). Mix them, the leak goes opaque.",
    },
    abm: {
      name: "Enterprise ABM",
      steps: ["Target account", "Engagement", "MQL", "SAL", "SQL", "Proposal", "Close"],
      lesson: "MQL ≠ SAL ≠ SQL. Three acronyms, three owners. Stack them out of order and reporting lies.",
    },
    viral: {
      name: "Viral growth loop",
      steps: ["Invite", "Invitee signup", "Activation", "Next invite"],
      lesson: "A loop isn’t a linear tunnel. Causal order: without activation, the next invite is spam.",
    },
    support: {
      name: "Support → expansion",
      steps: ["Ticket", "Resolved", "CSAT", "Upsell", "Renew"],
      lesson: "Upsell before CSAT is selling into an open wound. A support funnel isn’t an acquisition funnel.",
    },
  },
  bruit: {
    visites: n(
      "Visits, 12 weeks — it clearly climbs",
      "",
      "The slope has been there from the start. A good month isn’t a trend. A slope that holds, is.",
      "This isn’t an isolated spike: it’s been rising since week 1."
    ),
    noel: n(
      "Monthly revenue — Christmas returns",
      "",
      "December comes back every year. Compare to N-1, not last month.",
      "A spike that repeats at the same moment isn’t a break. It’s a calendar."
    ),
    dent: n(
      "Open rate — one blip, then nothing",
      "",
      "A spike, then back. With no lasting cause, it’s noise.",
      "A single tooth is not a trend. Wait to see if it holds."
    ),
    org: n(
      "Organic visits, 24 weeks",
      "",
      "The slope was there before the zone. A good month isn’t a trend. A slope that holds, is.",
      "Not an isolated spike: the series climbs from the start. Trend = a direction that survives a noisy week."
    ),
    ca3y: n(
      "Monthly revenue, 3 years",
      "",
      "November–December return every year. Compare to N-1, not last month.",
      "A spike that repeats at the same moment isn’t a break. It’s a calendar. YoY, not MoM."
    ),
    open: n(
      "Email open rate, 20 sends",
      "",
      "A spike, then back to the mean. No cause: noise. You don’t rebuild strategy for a bubble.",
      "One tooth sticking out isn’t a trend. Wait to see if it holds."
    ),
    delay: n(
      "Delivery delay, 18 weeks",
      "",
      "The level changed and it stays. New 3PL, a strike, or a KPI definition.",
      "This isn’t noise anymore: the series doesn’t come back. When the mean changes worlds, that’s a break."
    ),
    nps: n(
      "NPS, 16 waves",
      "",
      "An NPS that plunges one wave then returns is often a tiny sample. Not a culture break.",
      "Look after the hole: it resumes. A break settles in. Here, it’s a blip."
    ),
    paid: n(
      "Paid sessions, 28 days — a weak slope under the noise",
      "",
      "Under daily noise, it still climbs. Brutal: the slope is real, tiny.",
      "The teeth are more visible than the slope. Zoom out: the direction holds."
    ),
    summer: n(
      "Tickets, 36 months — a quiet summer, not a crisis",
      "",
      "July–August return. A summer dip isn’t a process break.",
      "It repeats every year in the same place. Season, not incident."
    ),
    jeudi: n(
      "Average basket, 22 weeks — one rotten Thursday",
      "",
      "Minus €3 one week, then the mean. Not a new mix. Noise.",
      "The gap is too small and too short for a break. A blip, you pass."
    ),
    checkout: n(
      "Conversion, 20 weeks — new checkout, +0.4 pt level",
      "",
      "The level moved by almost nothing, and it stays. That’s a break, not a blip.",
      "Brutal: the step is tiny. If it doesn’t come back, it isn’t noise anymore."
    ),
    dau: n(
      "DAU, 30 days — weekend vs weekday, not a trend",
      "",
      "The weekend returns every 7 teeth. Not a usage drop. A calendar.",
      "A weekly rhythm is short seasonality. Not a trend, not a break."
    ),
  },
  voyage: {
    "lea-easy": n(
      "Léa lives in Lyon. At 10:00 an UPDATE puts her in Nantes. The 09:00 report must still say Lyon.",
      "Rewind before the UPDATE, then read.",
      "AT pins 09:00. You reread Lyon. Time Travel isn’t a backup: it’s the version from before the DML.",
      "If the head is after 10:00, you read Nantes.",
      {
        events: [
          { label: "09:00 Lyon", rows: "Léa · Lyon" },
          { label: "10:00 Nantes", rows: "Léa · Nantes" },
          { label: "Now", rows: "Léa · Nantes" },
        ],
      }
    ),
    "drop-easy": n(
      "Someone DROP’d the table two hours ago. Retention: 1 day.",
      "Which command brings the table back?",
      "UNDROP restores a dropped object while it is still in retention.",
      "CREATE TABLE doesn’t bring history back. UNDROP does.",
      {
        events: [{ label: "Table ok" }, { label: "DROP 09:00" }, { label: "11:00" }],
      }
    ),
    "fail-easy": n(
      "DROP 9 days ago. Retention 1 day, Fail-safe 7 days. We’re too far.",
      "Can you still UNDROP?",
      "Day +9, Fail-safe is over. No SELECT, no UNDROP. Too late.",
      "Time Travel ≠ infinite archive. Day +9 is gone.",
      {
        events: [{ label: "D0 DROP" }, { label: "D1 TT ends" }, { label: "D9 gone" }],
      }
    ),
    lea: n(
      "Léa moves from Lyon to Nantes at 10:00. Orders from 09:00 must stay Lyon.",
      "Park the head BEFORE the UPDATE, then SELECT AT.",
      "AT | BEFORE pins a timestamp, an OFFSET, or a STATEMENT. SELECT AT (TIMESTAMP => '09:00') rereads Lyon. The current schema still applies.",
      "If the head is after 10:00, you read Nantes. Time Travel isn’t a backup: it’s the immutable micro-partitions from before the DML.",
      {
        events: [
          { label: "09:00 CREATE", rows: "Léa · Lyon" },
          { label: "10:00 UPDATE Nantes", rows: "Léa · Nantes" },
          { label: "11:00 now", rows: "Léa · Nantes" },
        ],
      }
    ),
    drop: n(
      "Someone DROP TABLE fact_sales two hours ago. Standard retention: 1 day.",
      "The table is in Time Travel. Which command brings it back?",
      "UNDROP TABLE restores a dropped object while it is in the retention window. Standard = 1 day (24 h), automatic.",
      "CREATE TABLE doesn’t bring history back. UNDROP is Time Travel’s SQL for dropped objects.",
      {
        events: [
          { label: "yesterday 18:00 table ok" },
          { label: "today 09:00 DROP" },
          { label: "11:00 now" },
        ],
      }
    ),
    fail: n(
      "Retention 1 day. We are day +9. The dropped table is no longer in Time Travel.",
      "Where are the bytes? And can you UNDROP?",
      "After retention, permanent data enters Fail-safe (7 days). No SELECT, no UNDROP, no CLONE. Snowflake Support only — best effort, not a business tool.",
      "Day +9, Fail-safe is over. It isn’t recoverable. Time Travel ≠ infinite archive.",
      {
        events: [
          { label: "D0 DROP" },
          { label: "D1 Time Travel ends" },
          { label: "D2–D8 Fail-safe" },
          { label: "D9 gone" },
        ],
      }
    ),
    "zero-tt": n(
      "Enterprise: you can raise DATA_RETENTION_TIME_IN_DAYS up to 90. Transient: max 1 day.",
      "For a disposable mart, you want 0 days of Time Travel. What happens?",
      "0 days turns Time Travel off on the object. DROP and it’s gone — no UNDROP. Snowflake advises against 0 if you care about recovering a drop.",
      "0 is not “shorter Fail-safe”. It cuts AT/BEFORE/UNDROP. Transients have no Fail-safe anyway.",
      {
        events: [
          { label: "permanent 90d" },
          { label: "transient 1d" },
          { label: "0 days = off" },
        ],
      }
    ),
    "clone-at": n(
      "Historical CLONE: CREATE TABLE dev CLONE prod AT (TIMESTAMP => …).",
      "The head is on 09:00. Which action clones at that instant?",
      "CREATE … CLONE accepts AT | BEFORE, like SELECT. With no clause, the clone is CURRENT_TIMESTAMP. With AT, you duplicate a past — still zero-copy on those micro-partitions.",
      "UNDROP restores a dropped object; it doesn’t clone a living past. CLONE AT is travel + a logical copy.",
      {
        events: [
          { label: "09:00 prod v1" },
          { label: "12:00 prod v2" },
          { label: "15:00 now" },
        ],
      }
    ),
    transient: n(
      "Transient table dropped 3 days ago. No Fail-safe on transient.",
      "UNDROP? Fail-safe? Or simply too late?",
      "Transient: no Fail-safe. After retention, it’s over. UNDROP will not work. This is not “Fail-safe, call support”.",
      "Fail-safe does not exist on transient. Day +3, the object is gone.",
      {
        events: [
          { label: "D0 DROP transient" },
          { label: "D1 TT ends (max 1d)" },
          { label: "D3 — no Fail-safe" },
        ],
      }
    ),
    truncate: n(
      "TRUNCATE 20 minutes ago. The table still exists.",
      "This is not a DROP. Which action rereads the rows?",
      "TRUNCATE is metadata DML. Time Travel AT before the truncate rereads the rows. UNDROP does not apply: the object isn’t dropped.",
      "UNDROP is for DROP. Here the table is there, empty. AT, not UNDROP.",
      {
        events: [
          { label: "09:00 1 M rows" },
          { label: "09:40 TRUNCATE" },
          { label: "10:00 now" },
        ],
      }
    ),
    "ent-90": n(
      "Enterprise 90d. DROP day −40. Still in Time Travel.",
      "The table is dropped but inside the window. Which command?",
      "90 days of Enterprise: day −40 is still UNDROP. Fail-safe is after retention.",
      "It isn’t too late. 90-day retention, UNDROP works. Fail-safe would be later, and without SQL.",
      {
        events: [
          { label: "D−40 DROP" },
          { label: "D−20 still TT" },
          { label: "D0 now" },
        ],
      }
    ),
    "clone-drop": n(
      "CLONE AT from before a DROP. The source table no longer exists “now”.",
      "The head is on v1, before the DROP. Which action?",
      "CLONE AT (before DROP) recreates an object from Time Travel. UNDROP would restore the dropped object under its name. Here we want the historical clone.",
      "UNDROP restores the dropped name. CLONE AT copies a past, possibly under another name.",
      {
        events: [
          { label: "v1 alive" },
          { label: "DROP" },
          { label: "now (dropped)" },
        ],
      }
    ),
    "zero-drop": n(
      "Retention 0 on a mart. Accidental DROP 4 minutes ago.",
      "Zero Time Travel. What’s left?",
      "0 days = no UNDROP, no AT. Permanent without TT still has Fail-safe — but not in SQL. The business move here is “no Time Travel”.",
      "UNDROP needs retention. At 0, it’s over for you.",
      {
        events: [{ label: "retention 0" }, { label: "DROP" }, { label: "+4 min" }],
      }
    ),
  },
};

function joinEn(
  id: string,
  context: string,
  question: string,
  ok: string,
  miss: string,
  leftName: string,
  rightName: string
) {
  EN.jointure = EN.jointure || {};
  EN.jointure[id] = n(context, question, ok, miss, { leftName, rightName });
}

joinEn(
  "inner-known",
  "Orders + customers. We only want orders with a known customer.",
  "INNER or LEFT? Try. Who disappears?",
  "INNER: the order without a customer disappears. That’s intended if the business says “known customers”.",
  "LEFT keeps the orphan. INNER drops it. Here we wanted the intersection.",
  "orders",
  "customers"
);
joinEn(
  "left-all",
  "Every customer, even with no order.",
  "Marc bought nothing. Should he stay?",
  "LEFT from customers: Marc stays. INNER erases him and you think you have one customer.",
  "INNER makes Marc vanish. For a customer list, LEFT.",
  "customers",
  "orders"
);
joinEn(
  "anti-orphan",
  "Find the order without a customer — just the problem.",
  "Which lens keeps only the orphan?",
  "ANTI: only those that don’t match. That’s the quality test.",
  "LEFT mixes the good and the dirty. ANTI keeps only the dirty.",
  "orders",
  "customers"
);
joinEn(
  "inner-ca",
  "We want revenue from orders tied to a known customer.",
  "Try the lenses. Who disappears?",
  "INNER: order 99 disappears. Intended if the business says “known customers”. Otherwise you just hid €80.",
  "Order 99 has no customer. INNER drops it. LEFT keeps it. ANTI keeps only it.",
  "orders",
  "customers"
);
joinEn(
  "left-clients",
  "List every customer, even those with no order this month.",
  "Starting from customers: who must stay on screen?",
  "LEFT from customers keeps Marc. INNER would hide him and you’d think you have one client.",
  "INNER deletes quiet customers. For a CRM list, LEFT (or FULL if you also want orphan orders).",
  "customers",
  "orders"
);
joinEn(
  "anti-quality",
  "Quality: find orphan orders, with no customer.",
  "Which lens keeps only the problem?",
  "ANTI (or NOT EXISTS): only non-matches. That’s a quality test, not a revenue report.",
  "LEFT mixes good and dirty. ANTI keeps only the dirty. That’s what you wanted.",
  "orders",
  "customers"
);
joinEn(
  "anti-catalog",
  "Catalog: products never sold this quarter.",
  "ANTI from products toward sales.",
  "A product ANTI join against sales: never ordered. LEFT would keep them with empty € — noisier.",
  "INNER would hide them. To find “never sold”, ANTI (or LEFT … WHERE right IS NULL).",
  "products",
  "sales"
);
joinEn(
  "full-promo",
  "Two promo-code lists: CRM and e-commerce. We don’t want to lose anyone.",
  "Which lens keeps both sides?",
  "FULL OUTER: codes that exist only in CRM, only in e-com, and both. Nobody lost.",
  "INNER keeps only the intersection. LEFT keeps one side. FULL is the reconciling join.",
  "crm",
  "ecom"
);
joinEn(
  "anti-badge",
  "Employees vs badges: who never badged this month, for security.",
  "ANTI from employees toward events.",
  "People with no badge event: ANTI. INNER would keep only those who badged — the opposite.",
  "LEFT + IS NULL is the same idea as ANTI. Don’t INNER a security gap.",
  "employees",
  "badges"
);
joinEn(
  "full-invoices",
  "Invoices vs payments: gaps on both sides, to reconcile.",
  "FULL: unpaid invoices and unmatched payments.",
  "FULL OUTER is the reconciling join. You see both orphans. INNER would hide the problem.",
  "LEFT shows one gap. FULL shows both. That’s the close.",
  "invoices",
  "payments"
);
joinEn(
  "left-cohort",
  "Cohorts: signup users vs first_purchase. Activation rate.",
  "Keep every signup. Purchases may be empty.",
  "LEFT from signups: non-buyers stay with ∅. INNER would compute activation on buyers only — vanity.",
  "INNER on “who bought” inflates activation. LEFT keeps the denominator.",
  "signups",
  "purchases"
);
joinEn(
  "full-sku",
  "Web SKU vs ERP SKU: mismatches on both sides, for a data contract.",
  "FULL: web without ERP, ERP without web.",
  "A data contract wants both gaps. FULL OUTER. INNER is the happy path, not the test.",
  "ANTI would show one side only. FULL is the contract.",
  "web",
  "erp"
);
joinEn(
  "anti-gdpr",
  "Consented emails vs CRM. GDPR: who is in the CRM without consent.",
  "ANTI from CRM toward consent.",
  "CRM ANTI consent = contacts without a legal basis. That’s the GDPR scrape, not a campaign list.",
  "INNER would keep the consented. Here we hunt the opposite.",
  "crm",
  "consent"
);

EN.pipeline = {
  batch: {
    name: "Daily batch",
    steps: ["Extract", "Load", "Publish"],
    lesson: "You don’t expose before you’ve loaded. Extract → land → publish. Order is the job.",
  },
  partner: {
    name: "Partner file",
    steps: ["Ingest", "Validate", "Aggregate"],
    lesson: "You don’t aggregate a dirty file. Quarantine first, totals after.",
  },
  mart: {
    name: "Simple mart",
    steps: ["Raw", "Clean", "Mart"],
    lesson: "Bronze, Silver, Gold — same idea in three words. The dashboard only reads the mart.",
  },
  medallion: {
    name: "Retail medallion",
    steps: ["Land in Bronze", "Conform in Silver", "Surrogate keys", "Gold mart", "Expose to BI"],
    lesson: "Don’t put an unstable business key in Gold. Raw, then conformed, then keys, then the dashboard contract.",
  },
  elt: {
    name: "Daily ELT",
    steps: ["Extract the source", "Load the raw", "Transform", "Assertion tests", "Publish the mart"],
    lesson: "Load before transform (ELT): the raw stays recoverable. Test before publish: a green mart, not a “see you Monday” mart.",
  },
  cdc: {
    name: "Order CDC",
    steps: ["Capture the logs", "Deduplicate by key", "Merge SCD2", "Rebuild the fact", "Refresh the BI cache"],
    lesson: "CDC arrives out of order. Dedup, then version, then the fact. Refreshing BI first is serving panic.",
  },
  migration: {
    name: "Schema migration",
    steps: ["Freeze the contract", "Historical backfill", "Double run", "Cutover", "Watch 48h"],
    lesson: "Without backfill, YoY is a lie. Without a double run, cutover is a jump. Engineering is well-ordered boredom.",
  },
  files: {
    name: "Partner files",
    steps: ["Ingest as-is", "Validate the schema", "Reject dirty rows", "Map IDs", "Business aggregates"],
    lesson: "Don’t aggregate a dirty file. Quarantine first. Otherwise the partner sends nulls, and revenue starts dancing.",
  },
  late: {
    name: "Late-arriving fact",
    steps: ["Ingest event", "Wait for the dim", "Park orphan", "Reconcile", "Publish the fact", "SLA alert"],
    lesson: "A fact too early, without a dimension, pollutes the mart. Park, reconcile, publish. Not the reverse.",
  },
  scd2: {
    name: "SCD2 + CDC in conflict",
    steps: ["Order the commits", "Close the version", "Open the next", "Point the fact", "Rebuild snapshot", "Uniqueness test"],
    lesson: "Two updates the same day: commit order decides history. Test uniqueness after, not before.",
  },
  contract: {
    name: "Contract-first API",
    steps: ["Freeze the JSON schema", "Consumer stub", "Backfill", "Shadow traffic", "Cutover", "Remove the stub"],
    lesson: "Contract before bytes. Shadow before cutover. Remove the stub last — or you serve two truths.",
  },
  pii: {
    name: "PII quarantine",
    steps: ["Encrypted ingest", "Tokenizer", "Vault", "Mart without PII", "Just-in-time access", "Audit log"],
    lesson: "The mart never sees the identifying raw. Vault, then contract. Reverse it and GDPR leaks into BI.",
  },
  hybrid: {
    name: "Hybrid streaming + batch",
    steps: ["5-min micro-batch", "Hourly compaction", "Exactly-once", "Watermark", "Late data replay", "Unified view"],
    lesson: "Streaming without compaction is tiny files. Replay lates after the watermark, or the KPI jumps.",
  },
};

EN.clone = {
  sandbox: n(
    "Devs want a prod sandbox, now. No extra storage bill.",
    "One tap. Not a copy. Which operation?",
    "CLONE plants pointers. Instant. Storage doesn’t move until someone writes.",
    "CTAS recopies bytes. For an internal sandbox, that’s CLONE."
  ),
  export: n(
    "The accountant doesn’t have Snowflake. They want an export, a real file.",
    "Here you want bytes. Hold until the end.",
    "CTAS materializes. A clone would stay tied to source micro-partitions — useless outside the account.",
    "A clone is not a file. For a dump, you copy."
  ),
  dml: n(
    "The clone exists. Someone UPDATEs 1% of its rows.",
    "Did storage move? Punch the clone.",
    "UPDATE writes new files for touched rows. Only the delta is billed.",
    "Snowflake doesn’t rewrite the whole table. DML = new micro-partitions."
  ),
  "sandbox-hard": n(
    "Devs want a copy of prod_sales to test, now, without doubling storage.",
    "Which operation? Tap, hold, or punch.",
    "CREATE TABLE … CLONE plants new metadata pointers at the same micro-partitions. Instant. Storage moves only when the clone diverges.",
    "CTAS recopies bytes: slow, expensive, and you lose zero-copy. CLONE is the flake’s Git branch."
  ),
  "export-hard": n(
    "A partner outside Snowflake needs an independent physical export.",
    "Here you want real files, not pointers.",
    "CTAS (or COPY INTO) materializes. The clone would stay tied to source micro-partitions — perfect internally, useless for a dump.",
    "A clone is not a file. For an export, you copy. For an internal sandbox, you clone."
  ),
  "dml-hard": n(
    "Clone created. An intern UPDATEs 1% of rows on the clone.",
    "What happens on the storage side?",
    "Micro-partitions are immutable. UPDATE writes new files for touched rows. Only the delta is billed. The rest stays shared.",
    "Snowflake doesn’t rewrite the whole table. DML = new micro-partitions + metadata. That’s why the clone stays cheap after a small UPDATE."
  ),
  clustering: n(
    "Table with a clustering key. You clone.",
    "The clustering key is copied. Automatic clustering?",
    "The clone inherits the clustering key, but automatic clustering is suspended on the new table. You must RESUME it explicitly (cloning docs).",
    "This isn’t a CTAS. CLONE copies the definition, not the running auto-cluster. Otherwise you’d pay clustering twice without knowing."
  ),
  "2to": n(
    "2 TB table. Devs want a sandbox today, with no extra storage line.",
    "Which operation keeps the storage bill flat?",
    "After CLONE you still pay ~2 TB, not 4. Files are shared until DML rewrites micro-partitions on the clone.",
    "CTAS duplicates 2 TB. The clone is the same cloud storage seen twice through metadata."
  ),
  transient: n(
    "CLONE of a transient table. Time Travel on the clone?",
    "The operation is a CLONE. The trap is what you inherit.",
    "CLONE copies the type. Transient stays transient: short retention, no Fail-safe. It isn’t a CTAS that would “fix” it to permanent.",
    "CTAS would create a new table (often permanent if you ask). Here we clone — we inherit transient."
  ),
  vendor: n(
    "Devs want an independent copy for a vendor with no account access.",
    "Zero-copy is useless outside the account. Which operation?",
    "Outside the account, pointers don’t travel. CTAS or COPY INTO. A clone is not an export.",
    "CLONE stays in the account. A vendor doesn’t inherit your micro-partitions."
  ),
  diverge: n(
    "After CLONE, a DELETE of 40% of rows on the clone, then a massive INSERT.",
    "Storage diverged. Which gesture did that?",
    "DELETE + INSERT = new micro-partitions. Zero-copy is over on the touched part. That’s DML, not a second CLONE.",
    "This is no longer a “free” clone. Each DML writes. CTAS would have recopied everything from the start."
  ),
  "clone-at": n(
    "CLONE AT (TIMESTAMP => yesterday 09:00) of an 800 GB table.",
    "Still zero-copy, even in the past?",
    "CLONE AT reuses that version’s micro-partitions. Still zero-copy. It isn’t a historical CTAS.",
    "Time Travel + CLONE is not an export. Pointers aim at yesterday’s files."
  ),
  swap: n(
    "SWAP a clone table onto prod after a backfill. The backfill rewrote everything.",
    "The backfill was which gesture?",
    "A backfill is DML (or an INSERT). The clone diverged. SWAP exchanges names, not zero-copy magic.",
    "SWAP isn’t CTAS. What cost money was the backfill DML."
  ),
};

EN.entrepot = {
  count: n(
    "SELECT COUNT(*) FROM dim_store. An X-Small is enough.",
    "Stay small. Bigger doesn’t go faster — it doubles the bill.",
    "X-Small = 1 credit/hour. Counting stores doesn’t need an XL.",
    "An XL for a COUNT is throwing credits."
  ),
  join: n(
    "Heavy join, billions of rows. It crawls on Small.",
    "Scale up. Big queries want compute.",
    "Size is credits per hour, doubled each step. A heavy join wants Medium/Large, not XS.",
    "Leaving it on XS is queueing. Jumping to 2XL is paying 32× for a maybe."
  ),
  min60: n(
    "You RESUME, you stop 8 seconds later.",
    "What did you just pay? Type the minimum.",
    "Each resume bills 60 seconds minimum, even if you suspend at 8s. Snowflake warehouses have a 60-second minimum.",
    "8 seconds still costs 60. That’s why auto-suspend + resume yoyo is expensive."
  ),
  "count-hard": n(
    "SELECT COUNT(*) FROM dim_store. An X-Small warehouse is enough.",
    "Stay small. Bigger doesn’t scan faster here — it doubles the bill.",
    "X-Small = 1 credit/hour. Each size doubles. Counting stores doesn’t need an XL.",
    "An XL for a COUNT is 16 credits/hour to count shops. Credits are compute, not a status symbol."
  ),
  "join-hard": n(
    "Heavy join, ~2 billion rows, analytic window. It crawls on Small.",
    "Scale up. Large queries want compute — not a 2XL “just in case”.",
    "A heavy join wants Medium/Large. Snowflake scales compute independently from storage. Bigger warehouse = more parallel servers.",
    "Leaving it on XS is queueing. Jumping to 2XL is paying 32× for a maybe. The window is the point."
  ),
  copy: n(
    "COPY INTO of 12 files of 8 MB. Not thousands.",
    "Stay modest. Load parallelism follows file count.",
    "A handful of small files: XS/S is enough. Snowflake parallelizes by file, not by warehouse swagger.",
    "A Large for 12 files is idle credits. More files would justify more size."
  ),
  "min60-hard": n(
    "You just RESUME. You stop 8 seconds later.",
    "What did you just pay? The minimum.",
    "Each resume bills 60 seconds minimum, even if you suspend at 8s. That’s why a warehouse that yoyos all day costs a fortune.",
    "8 seconds still costs 60. Auto-suspend is a gift only if you stop waking it for nothing."
  ),
  queue: n(
    "Queries stack. The queue swells. This isn’t one slow query: it’s concurrency.",
    "Don’t just go huge. Multi-cluster (or a step up) for the queue.",
    "Concurrency = more clusters or a size that absorbs the queue. A 2XL for one user is the wrong lever.",
    "A single oversized warehouse doesn’t invent extra queues. Multi-cluster Standard/Enterprise does."
  ),
  search: n(
    "Search optimization + point lookup. Warehouse already XS. Scaling does nothing.",
    "Stay at the smallest. The service is elsewhere.",
    "The lookup is paid by Search Optimization, not by a 2XL. Larger is not faster here.",
    "Moving the fader pays compute for a service you already turned on."
  ),
  files: n(
    "500,000 tiny files. Load. Snowflake parallelizes by file.",
    "Here a Medium/Large helps. Not an XS, not a 6XL.",
    "Lots of files: more load threads. Medium/Large. A 2XL is no longer linearly useful.",
    "XS under-parallelizes. 2XL overcharges. The window is narrow."
  ),
  bi: n(
    "BI dashboard, 40 users, short queries. Queue, not one slow query.",
    "Size for reasonable concurrency — not a 2XL “just in case”.",
    "Short queries + concurrency: multi-cluster or an S/M. A 2XL wastes idle.",
    "A 2XL for short BI is 16× an XS’s credits for result cache."
  ),
  snowpark: n(
    "Snowpark Python UDF, large frame, one session. It swaps on Small.",
    "Scale for warehouse memory, not for the queue.",
    "Snowpark likes warehouse RAM. Large/XL. 2XL only if you’re truly out of memory — here XL is enough.",
    "XS/S will OOM. 2XL is luxury. The window is L–XL."
  ),
  yoyo: n(
    "Auto-suspend 1 s. You relight every 20 s all day.",
    "The 60 s minimum kills you. Size: small, but mostly stop resuming.",
    "Each resume = 60 s. Twenty relights/hour = you pay XS as if it were always on. Stay small, lengthen auto-suspend.",
    "Moving the fader up makes the bill worse. The real lever is stopping the resume yoyo."
  ),
};

EN.elagage = {
  "dec-25": n(
    "Four tiles. Filter on a late-December date.",
    "",
    "The 25th only exists in 21–31. November and early December drop. That’s pruning.",
    "November doesn’t overlap the 25th. Only the 21–31 tile stays."
  ),
  sud: n(
    "Filter region South. Two South tiles, two North.",
    "",
    "South = the two South tiles. North is out of range. Column pruning is enough.",
    "North doesn’t contain South. You scan p1 and p3."
  ),
  december: n(
    "All of December.",
    "",
    "December: two tiles. November drops.",
    "November doesn’t intersect December."
  ),
  "date-hard": n(
    "Sales table, 8 micro-partitions. Filter on a date.",
    "",
    "Metadata min/max: only partitions whose range overlaps 2024-12-25 are scanned. The rest are pruned — they never hit storage.",
    "You scanned tiles whose date range doesn’t overlap. Pruning is an overlap test, not “it might be in there”."
  ),
  region: n(
    "Same table, region filter.",
    "",
    "Clustering (or a well-sorted ingest) on region lets the rest prune. A filter on a clustered column is the textbook case.",
    "Without overlap on region, those tiles stay mute. That’s the point of a clustering key."
  ),
  between: n(
    "A wide BETWEEN. Lots of overlap.",
    "",
    "A wide range overlaps more partitions. Pruning still drops the ones completely outside. Selectivity of the filter = how much you save.",
    "BETWEEN isn’t “scan everything”. Only tiles whose min/max intersect the window."
  ),
  subquery: n(
    "Predicate with a subquery. Snowflake doesn’t prune on that.",
    "",
    "A subquery (or a non-deterministic function) blocks pruning. Rewrite as a join or a literal if you want silence.",
    "You treated it like a simple date. The expression made every tile “maybe”."
  ),
  depth: n(
    "Clustering depth: ranges overlap too much.",
    "",
    "If every partition’s min/max covers almost the whole table, pruning dies. Recluster, or the filter becomes a full scan.",
    "Overlapping ranges = almost no prune. Depth is a health metric, not a decoration."
  ),
  expr: n(
    "Filter on an expression: DATE_TRUNC('week', date) = …",
    "",
    "A function on the column hides min/max. Rewrite the predicate on the raw column (range of the week) if you want pruning.",
    "DATE_TRUNC on the left kills prune. Prefer date >= week_start AND date < week_end."
  ),
  or: n(
    "OR across two columns. Pruning gets shy.",
    "",
    "OR (date = … OR region = …) often scans the union of both. Two filters, almost two scans. AND prunes; OR widens.",
    "You scanned as if it were AND. OR keeps a tile if either predicate might match."
  ),
  "cluster-region": n(
    "Clustering key on region, filter on date. Date min/max are wide.",
    "",
    "You clustered the wrong column for this query. Date filter barely prunes. Cluster on what you filter.",
    "A clustering key isn’t magic on every WHERE. Align it with the selective predicate."
  ),
  inlist: n(
    "IN list of 3 dates, tight partitions.",
    "",
    "Three literals: three overlap tests. Tight tiles prune hard. That’s a good ingest.",
    "IN isn’t “scan all”. Each value is an overlap. Tiles outside all three stay mute."
  ),
  cast: n(
    "CAST(date AS string) = '2024-12-25'. Another expression.",
    "",
    "Casting the column blinds metadata. Compare date to a date, not to a string.",
    "The string looks like a date. For the pruner, it’s an expression. All tiles stay “maybe”."
  ),
};

EN.grain = {
  client: n(
    "One row = one customer.",
    "Which column identifies the customer?",
    "client_id is the grain. Name and city are attributes — they don’t make the row unique.",
    "If you key on city, two customers in Lyon collapse."
  ),
  daystore: n(
    "Sales by day, one store.",
    "The grain of the fact?",
    "date × store. Adding product would be another grain (line). Mixing them, the SUM lies.",
    "A fact has one declared grain. Here: the day at the store, not the SKU."
  ),
  sessions: n(
    "Web sessions.",
    "What makes a session unique?",
    "session_id. user_id repeats. Date isn’t a grain, it’s a dimension.",
    "Keying on user crushes all of their sessions into one."
  ),
  lines: n(
    "E-commerce order lines.",
    "One row = one line, not the order.",
    "order_id + sku (or line_id). order_id alone crushes the lines and doubles revenue if you SUM a copied total.",
    "The order isn’t the grain of a line table. That’s the classic poison."
  ),
  stock: n(
    "Stock snapshot, one shot a night.",
    "Which keys?",
    "date × sku × warehouse. Forget the warehouse, two sites collapse.",
    "A snapshot without its date becomes a “current stock” that lies tomorrow."
  ),
  "ca-month": n(
    "You’re asked for a mart “revenue by customer by month”.",
    "Which grain?",
    "customer_id × month. Adding the order would be another mart. One grain, one table.",
    "If you keep order_id, you’re not at month grain. You’d have to SUM again, and someone will forget."
  ),
  poison: n(
    "Someone pasted the order total onto every product line.",
    "Yank the poison column before the SUM.",
    "A total copied on each line explodes when you SUM. Yank it; keep qty × price, or a separate order table.",
    "If you leave the total, two SKUs = 2× the order. That’s the grain bug that makes CFOs shout."
  ),
  conv: n(
    "Web sessions for a conversion rate.",
    "Don’t mix pages and sessions.",
    "session_id. A pageview table at session grain is already an aggregate. Mixing them, conversion becomes “pages / pages”.",
    "Conversion = orders / sessions, not / pageviews. Wrong grain, vanity rate."
  ),
  seats: n(
    "Subscription: one contract, several seats, one invoice month.",
    "What is the grain of the bill?",
    "contract_id × month. Seats are an attribute (or a child table). Keying on seat duplicates MRR.",
    "Seat-level billing without care double-counts the contract."
  ),
  events: n(
    "Pageviews + orders pasted into one “events” table.",
    "Two grains in one table. Which key is honest for conversion?",
    "You can’t. Split: pageviews vs orders. A mixed events table has no grain — every KPI becomes a filter accident.",
    "If you pick one key, you crush the other event type. Two facts, two tables."
  ),
  "conv-store": n(
    "Store conversion × day × channel.",
    "Three keys, one rate.",
    "store × date × channel. Drop channel, paid and organic collapse and the rate lies.",
    "A rate is a grain plus a numerator and denominator at that same grain."
  ),
  scd2: n(
    "SCD2 customer: Léa has two address versions.",
    "Which key keeps both versions?",
    "client_id × valid_from (or a surrogate). client_id alone crushes history — Type 1 by accident.",
    "SCD2 without a version key is SCD1. Past orders would all show Nantes."
  ),
  "panier-poison": n(
    "Average basket: order revenue was pasted on every SKU of the ticket.",
    "Yank the poison before you average.",
    "Average basket is at order grain. A copied total on each SKU multiplies the ticket. Yank, or aggregate the order first.",
    "Leave it and a 3-SKU ticket counts triple. Same bug as the line total."
  ),
};

EN.schema = {
  star: n(
    "A small revenue dashboard. Date, store, product around a fact.",
    "Slide the pieces. The fact in the center, dimensions around.",
    "The star: one fact, dimensions. Even on Easy, revenue doesn’t live in dim_store.",
    "Revenue lives in the fact. Date, store, product, customer are dimensions."
  ),
  park: n(
    "The till rings up. Where does the ticket live?",
    "Slide the ticket: write, or read?",
    "You don’t write checkout into a star schema. OLTP rings up. OLAP reads.",
    "A mart doesn’t take payment. The source system (OLTP) guarantees constraints."
  ),
  scd: n(
    "Léa moves. 2023 orders must stay Lyon.",
    "Tap the card. You’ll see what it does to past orders.",
    "Type 2: a new version. Overwriting the address rewrites the past.",
    "Type 1 rewrites Lyon into Nantes on history. The CFO hates that."
  ),
  "star-hard": n(
    "A daily revenue dashboard. Dimensions: date, store, product, customer.",
    "Slide the pieces. The fact in the center, dimensions around.",
    "The star is built for this: a fact at the right grain, dimensions around. Joins stay predictable.",
    "Revenue lives in the fact. Date, store, product, customer are dimensions. Pasting them anywhere is a junk-drawer JSON."
  ),
  "park-oltp": n(
    "Store till. Thousands of writes a minute, need integrity.",
    "Slide the ticket where the system of record must live.",
    "You don’t write checkout into a star schema. OLTP normalizes so nothing corrupts. OLAP denormalizes to read.",
    "A mart doesn’t take payment. The source system (3NF / OLTP) guarantees constraints. Then you replicate.",
    {
      token: "till ticket",
      zones: [
        { id: "star", label: "Star mart", blurb: "to read" },
        { id: "oltp", label: "OLTP 3NF", blurb: "to write" },
        { id: "gold", label: "Lakehouse Gold", blurb: "to publish" },
        { id: "cube", label: "MOLAP cube", blurb: "to slice" },
      ],
    }
  ),
  "scd-hard": n(
    "Léa moves. 2023 orders must stay “Lyon”, 2024 “Nantes”.",
    "Tap the card. You’ll see what it does to past orders.",
    "Type 2: new version, valid_from / valid_to. The fact points at the right row. History stays honest.",
    "Overwriting the address (Type 1) rewrites the past. Lyon orders become Nantes. The CFO hates that."
  ),
  gold: n(
    "Medallion: Bronze raw, Silver conformed, Gold consumable.",
    "Slide the “revenue by store” mart onto the right layer.",
    "Gold = contracts for the business. Silver cleans and aligns keys. Bronze, you only touch in forensics.",
    "A mart doesn’t live in Bronze. Bronze = landing. Silver = conformed. Gold = what the dashboard is allowed to see.",
    {
      token: "store revenue mart",
      zones: [
        { id: "bronze", label: "Bronze", blurb: "landing" },
        { id: "silver", label: "Silver", blurb: "conformed" },
        { id: "gold", label: "Gold", blurb: "business contract" },
        { id: "crm", label: "CRM", blurb: "operational" },
      ],
    }
  ),
  strip: n(
    "Someone pasted labels into fact_sales.",
    "Yank the columns that don’t belong in a fact.",
    "customer_name and city belong in dim_customer. Pasting them on the fact freezes a wild Type 1 and explodes volume.",
    "A fact carries measures and keys. Labels, cities, names: dimensions."
  ),
  bronze: n(
    "Raw CDC landing. Where to put it before any transform?",
    "Slide the stream. Bronze is not a mart.",
    "Bronze = as landed. No business grain yet. Silver after, Gold for the contract.",
    "Parking Kafka in Gold is publishing noise.",
    {
      token: "orders Kafka topic",
      zones: [
        { id: "bronze", label: "Bronze", blurb: "landing" },
        { id: "silver", label: "Silver", blurb: "conformed" },
        { id: "gold", label: "Gold", blurb: "business contract" },
        { id: "bi", label: "BI tool", blurb: "to consume" },
      ],
    }
  ),
  pii: n(
    "Wide table “analytics_events”: 40 columns, including PII.",
    "Yank what must not feed the mart.",
    "PII doesn’t belong in the consumption fact. Vault / tokenize, then the mart. Otherwise GDPR in the dashboard.",
    "A feature store can have PII under contract. A BI Gold mart cannot."
  ),
  "scd-segment": n(
    "Léa changes segment (VIP) without changing address. Past campaigns must stay “standard”.",
    "Tap. It’s still Type 2 — another attribute.",
    "Type 2 on segment: a new version. Past campaigns keep the old segment. Type 1 would rewrite targeting history.",
    "Overwriting VIP onto the past makes old campaigns look like they targeted VIPs. They didn’t."
  ),
  "feature-store": n(
    "A data scientist wants a feature store outside the BI contract.",
    "Where does that live? Not in Gold BI.",
    "A feature store is a contract for models, not for dashboards. Don’t park it in Gold BI or every KPI becomes a training column.",
    "Gold BI is the business contract. ML features have another owner, another SLA."
  ),
  "fact-in-dim": n(
    "The business pasted revenue into dim_product “to go faster”.",
    "Yank. A dimension doesn’t carry a fact.",
    "Revenue in a dimension is a grain crime. dim_product would need a date, and it would stop being a dimension.",
    "If you leave it, every product join duplicates revenue. Facts in facts, attributes in dimensions."
  ),
};

EN.flux = {
  hasdata: n(
    "The stream has INSERTs. Task: WHEN SYSTEM$STREAM_HAS_DATA.",
    "Tap DML on the beat, only if there are rows.",
    "HAS_DATA avoids empty runs. A stream is a bookmark, not another table.",
    "Tapping empty is a warehouse waking up for nothing."
  ),
  empty: n(
    "Nobody wrote. The stream is quiet.",
    "The beat runs. You must NOT consume.",
    "No source DML = no change records. Launching the task pays 60 s for an empty MERGE.",
    "You tapped. STREAM_HAS_DATA() was there to skip."
  ),
  select: n(
    "The stream has rows. You SELECT * FROM s.",
    "The offset doesn’t advance. Tap DML to actually consume.",
    "A SELECT doesn’t advance the offset. You need DML that reads the stream.",
    "SELECT is a preview. The bookmark only moves in a DML transaction."
  ),
  "hasdata-hard": n(
    "CREATE STREAM s ON TABLE raw. INSERTs arrive. Task: WHEN SYSTEM$STREAM_HAS_DATA.",
    "Tap on the beat, only if the stream has rows.",
    "The task fires on a CRON, but STREAM_HAS_DATA avoids empty runs. A stream is a bookmark (offset), not another table.",
    "Tapping empty wakes a warehouse for nothing. HAS_DATA = the bookmark has CDC behind it."
  ),
  "empty-hard": n(
    "Nobody wrote to raw. The stream is quiet.",
    "The beat runs. You must NOT consume.",
    "No source DML = no change records. Running the task anyway pays the warehouse’s 60 s minimum for an empty MERGE.",
    "You tapped. Snowflake could have skipped with WHEN SYSTEM$STREAM_HAS_DATA(). That’s what it’s for."
  ),
  "select-hard": n(
    "The stream has rows. You SELECT * FROM s.",
    "Does the offset advance? Tap DML to actually consume, not SELECT.",
    "Querying a stream alone does not advance its offset. You need DML (INSERT…SELECT, MERGE, CTAS). Several SELECTs can read the same changes.",
    "SELECT is a preview. The bookmark only moves in a DML transaction that reads the stream."
  ),
  burst: n(
    "CDC burst. You must swallow it at once — one MERGE, one beat.",
    "One tap on the measure, stream full. That’s transactional consume.",
    "A stream returns the minimal set of changes from the offset to the current version. One MERGE lands them and advances the bookmark at once.",
    "Off-beat or empty stream: you nibble badly. CDC is transactional consume, not pecking."
  ),
  child: n(
    "Child task after the parent task. The graph has a rhythm: parent, then child.",
    "Let the parent beat pass (auto), tap only the child beat after the flash.",
    "Task graphs chain. The child starts after the parent succeeds. Not an isolated CRON — a two-beat measure.",
    "Tapping too early launches the child before the parent committed. Snowflake waits on the dependency."
  ),
  append: n(
    "APPEND_ONLY stream. UPDATEs arrive on the source table.",
    "UPDATEs are not in append-only. Swallow only if there are real inserts.",
    "APPEND_ONLY ignores update/delete. HAS_DATA can stay false. Tapping is an empty run.",
    "You consumed a stream with nothing to say. APPEND_ONLY ≠ standard."
  ),
  two: n(
    "Two tasks read the same stream. The first already MERGED.",
    "The offset moved. The second must NOT tap again.",
    "One stream, one offset. Two consumers, you need two streams. The second tap rereads empty.",
    "You replayed an already advanced bookmark. A stream is not a Kafka queue with consumer groups."
  ),
  stale: n(
    "SHOW STREAMS: stale after 14 days without consume. The stream slept.",
    "It has “old” rows. Recreate / reset the offset, not SELECT.",
    "A stale stream is recreated. SELECT doesn’t fix it. DML (or recreate) to resume a healthy offset.",
    "SELECT on stale, you read anything. Recreate, then DML."
  ),
  "parent-fail": n(
    "Task graph: parent fails, child must not start. The parent beat blinks red.",
    "Swallow the child only if the parent committed — here, no.",
    "Graph dependency. Parent in error = child skip. Tapping the child serves a half-built mart.",
    "The child flash does not allow it. The parent didn’t commit."
  ),
  merge: n(
    "MERGE … WHEN MATCHED. Stream full, tight beat. One tap on the measure.",
    "Transactional consume, on the beat.",
    "One MERGE reads the stream, writes, advances the offset. That’s the contract. Off-beat, you split the set.",
    "Missed the beat or SELECT: the bookmark doesn’t move the way you think."
  ),
};

EN.memoire = {
  filter: { question: "Which filter was on?", lesson: "The filter is written large. On Easy, you anchor that first — the rest of the dashboard comes after." },
  red: { question: "Which KPI was in the red?", lesson: "You memorize what goes wrong first. In committee, that’s often the only number they’ll ask again." },
  best: { question: "Which one rose the most?", lesson: "The green pill is the signal. Note it before the slide closes." },
  ca: { question: "What revenue was on screen?", lesson: "Order of magnitude matters more than the cent. If you’re off by a zero, the rest of the dashboard is decoration." },
  filter2: { question: "Which filter was on?", lesson: "A KPI without a filter is an average that lies. Grain and segment are half the truth." },
  best2: { question: "Which one rose the most?", lesson: "An isolated rise isn’t a strategy. Note it, then ask: volume, mix, or price?" },
  red2: { question: "Which KPI was in the red?", lesson: "You memorize what goes wrong first. In committee, that’s often the only number they’ll ask again." },
  conv: { question: "Conversion: which value was it?", lesson: "Rates look alike. That’s why you anchor an order of magnitude before talking +0.2 points." },
  rebuild: { question: "The slide is gone. Put every tile back, and the filter.", lesson: "Brutal: you rebuild the slide. Filter first — without a segment, six tiles are an average that lies." },
};

export const PLAY_ROUNDS: Record<Locale, Partial<Record<GameSlug, Record<string, RoundNarration>>>> = {
  fr: {},
  en: EN,
};
