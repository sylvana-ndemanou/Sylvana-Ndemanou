// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DragBoard, Draggable, DropSlot } from "@s/components/drag-kit";
import { LockBar } from "@s/components/interact";
import { GameShell, Intro, Result, RoundHeader, Verdict } from "@s/components/game-shell";
import { Button } from "@s/components/ui/button";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { countAlong, takeDeck } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import { scoreLine } from "@s/lib/feedback";
import { play, unlockAudio } from "@s/lib/audio";
import { cn } from "@s/lib/utils";

type Round =
  | {
      tier: Difficulty;
      kind: "star";
      context: string;
      question: string;
      ok: string;
      miss: string;
    }
  | {
      tier: Difficulty;
      kind: "park";
      context: string;
      question: string;
      token: string;
      zones: { id: string; label: string; blurb: string }[];
      answer: string;
      ok: string;
      miss: string;
    }
  | {
      tier: Difficulty;
      kind: "scd";
      context: string;
      question: string;
      ok: string;
      miss: string;
    }
  | {
      tier: Difficulty;
      kind: "strip";
      context: string;
      question: string;
      columns: { name: string; junk: boolean }[];
      ok: string;
      miss: string;
    };

const ROUNDS_DATA: Round[] = [
  {
    tier: "easy",
    kind: "star",
    context: "Un petit dashboard CA. Date, magasin, produit autour d’un fait.",
    question: "Glisse les pièces. Le fait au centre, les dimensions autour.",
    ok: "L’étoile : un fait, des dimensions. Même en Facile, le CA ne vit pas dans dim_magasin.",
    miss: "Le CA vit dans le fait. Date, magasin, produit, client sont des dimensions.",
  },
  {
    tier: "easy",
    kind: "park",
    context: "La caisse encaissse. Où vit le ticket ?",
    question: "Glisse le ticket : écrire, ou lire ?",
    token: "ticket caisse",
    zones: [
      { id: "star", label: "Mart étoile", blurb: "pour lire" },
      { id: "oltp", label: "OLTP 3NF", blurb: "pour écrire" },
    ],
    answer: "oltp",
    ok: "On n’écrit pas le checkout dans un star schema. L’OLTP encaissse. L’OLAP lit.",
    miss: "Un mart n’encaisse pas. Le système source (OLTP) garantit les contraintes.",
  },
  {
    tier: "easy",
    kind: "scd",
    context: "Léa déménage. Les commandes de 2023 doivent rester Lyon.",
    question: "Touche la fiche. Tu vas voir ce que ça fait aux commandes passées.",
    ok: "Type 2 : nouvelle version. Écraser l’adresse réécrit le passé.",
    miss: "Type 1 réécrit Lyon en Nantes sur l’historique. Le CFO déteste ça.",
  },
  {
    tier: "hard",
    kind: "star",
    context: "Un dashboard CA quotidien. Dimensions : date, magasin, produit, client.",
    question: "Glisse les pièces. Le fait au centre, les dimensions autour.",
    ok: "L’étoile est faite pour ça : un fait au bon grain, des dimensions autour. Les jointures restent prévisibles.",
    miss: "Le CA vit dans le fait. Date, magasin, produit, client sont des dimensions. Les coller n’importe où, c’est un JSON fourre-tout.",
  },
  {
    tier: "hard",
    kind: "park",
    context: "Caisse magasin. Des milliers d’écritures à la minute, besoin d’intégrité.",
    question: "Glisse le ticket là où le système d’enregistrement doit vivre.",
    token: "ticket caisse",
    zones: [
      { id: "star", label: "Mart étoile", blurb: "pour lire" },
      { id: "oltp", label: "OLTP 3NF", blurb: "pour écrire" },
      { id: "gold", label: "Lakehouse Gold", blurb: "pour publier" },
      { id: "cube", label: "Cube MOLAP", blurb: "pour slicer" },
    ],
    answer: "oltp",
    ok: "On n’écrit pas le checkout dans un star schema. L’OLTP normalise pour ne pas corrompre. L’OLAP dénormalise pour lire.",
    miss: "Un mart n’encaisse pas. Le système source (3NF / OLTP) garantit les contraintes. Ensuite on réplique.",
  },
  {
    tier: "hard",
    kind: "scd",
    context: "Léa déménage. Les commandes de 2023 doivent rester « Lyon », 2024 « Nantes ».",
    question: "Touche la fiche. Tu vas voir ce que ça fait aux commandes passées.",
    ok: "Type 2 : nouvelle version, valid_from / valid_to. Le fait pointe la bonne ligne. L’historique reste honnête.",
    miss: "Écraser l’adresse (Type 1) réécrit le passé. Les commandes de Lyon deviennent Nantes. Le CFO déteste ça.",
  },
  {
    tier: "hard",
    kind: "park",
    context: "Medallion : Bronze brut, Silver conforme, Gold consommable.",
    question: "Glisse le mart « CA par magasin » sur la bonne couche.",
    token: "mart CA magasin",
    zones: [
      { id: "bronze", label: "Bronze", blurb: "atterrissage" },
      { id: "silver", label: "Silver", blurb: "conforme" },
      { id: "gold", label: "Gold", blurb: "contrat métier" },
      { id: "crm", label: "CRM", blurb: "opérationnel" },
    ],
    answer: "gold",
    ok: "Gold = contrats pour les métiers. Silver nettoie et aligne les clés. Bronze, on n’y touche qu’en forensic.",
    miss: "Un mart n’habite pas le Bronze. Bronze = atterrissage. Silver = conforme. Gold = ce que le dashboard a le droit de voir.",
  },
  {
    tier: "hard",
    kind: "strip",
    context: "Quelqu’un a collé des libellés dans fact_ventes.",
    question: "Arrache les colonnes qui n’ont rien à faire dans un fait.",
    columns: [
      { name: "date_id", junk: false },
      { name: "sku", junk: false },
      { name: "qty", junk: false },
      { name: "nom_client", junk: true },
      { name: "ville", junk: true },
      { name: "libellé_produit", junk: true },
    ],
    ok: "nom_client et ville appartiennent à dim_client. Les coller au fait fige un Type 1 sauvage et explose le volume.",
    miss: "Un fait porte des mesures et des clés. Les libellés, les villes, les noms : dimensions.",
  },
  {
    tier: "brutal",
    kind: "park",
    context: "CDC brut qui atterrit. Où le poser avant toute transformation ?",
    token: "topic Kafka commandes",
    question: "Glisse le flux. Le Bronze n’est pas un mart.",
    zones: [
      { id: "bronze", label: "Bronze", blurb: "atterrissage" },
      { id: "silver", label: "Silver", blurb: "conforme" },
      { id: "gold", label: "Gold", blurb: "contrat" },
      { id: "cube", label: "Cube", blurb: "slicer" },
    ],
    answer: "bronze",
    ok: "Le topic atterrit en Bronze, tel quel. Silver ensuite. Gold jamais en premier.",
    miss: "Un stream brut dans le Gold, c’est servir le désordre au métier.",
  },
  {
    tier: "brutal",
    kind: "strip",
    context: "Wide table « analytics_events » : 40 colonnes, dont du PII.",
    question: "Arrache tout ce qui n’est pas mesure ou clé. Le PII ne vit pas dans le fait.",
    columns: [
      { name: "event_id", junk: false },
      { name: "user_sk", junk: false },
      { name: "ts", junk: false },
      { name: "revenue", junk: false },
      { name: "email", junk: true },
      { name: "iban", junk: true },
      { name: "adresse", junk: true },
      { name: "device_name", junk: true },
    ],
    ok: "email, IBAN, adresse : dimensions (ou vault). Le fait garde des clés et des mesures.",
    miss: "Coller l’IBAN au fait, c’est une fuite et un Type 1. On arrache.",
  },
  {
    tier: "brutal",
    kind: "scd",
    context: "Léa change de segment (VIP) sans changer d’adresse. Les campagnes passées doivent rester « standard ».",
    question: "Même geste. Le segment est historisé, pas juste l’adresse.",
    ok: "Type 2 sur le segment aussi. Un attribut « qui change le reporting » se versionne.",
    miss: "Écraser VIP sur tout l’historique, les campagnes 2023 deviennent VIP. Faux.",
  },
  {
    tier: "brutal",
    kind: "park",
    context: "Un data scientist veut un feature store hors contrat BI.",
    token: "table features churn",
    question: "Où vit un feature store ? Pas dans le Gold dashboard.",
    zones: [
      { id: "gold", label: "Gold BI", blurb: "contrats dashboard" },
      { id: "silver", label: "Silver", blurb: "conforme" },
      { id: "ml", label: "Feature store", blurb: "ML" },
      { id: "oltp", label: "OLTP", blurb: "écriture" },
    ],
    answer: "ml",
    ok: "Les features ne sont pas un mart CA. Un contrat ML n’est pas un contrat BI. On ne les mélange pas.",
    miss: "Le Gold BI n’est pas un fourre-tout data science. Sinon le churn se retrouve dans le P&L.",
  },
  {
    tier: "brutal",
    kind: "star",
    context: "Le métier a collé le CA dans dim_produit « pour aller plus vite ».",
    question: "Remets l’étoile honnête. Le fait au centre, les dimensions autour.",
    ok: "Le CA n’habite pas une dimension. Deux grains collés, tu vas sommer un libellé. L’étoile refuse ça.",
    miss: "Un fait porte les mesures. Les dims portent les attributs. Les inverser, c’est un JSON fourre-tout.",
  },
];

const STAR_CHIPS = [
  { id: "date", role: "dim" as const },
  { id: "magasin", role: "dim" as const },
  { id: "produit", role: "dim" as const },
  { id: "client", role: "dim" as const },
  { id: "CA", role: "fact" as const },
];

const EXTRA_JUNK = ["email_client", "categorie_libelle", "pays"];

function scaleSchema(round: Round, difficulty: Difficulty, roundIndex: number, totalRounds: number): Round {
  if (round.tier) return round;
  if (round.kind === "park") {
    const n = Math.max(
      2,
      countAlong(difficulty, roundIndex, totalRounds, [2, 2], [3, 4], [round.zones.length, round.zones.length])
    );
    const keep = new Set<string>([round.answer]);
    for (const zone of round.zones) {
      if (keep.size >= n) break;
      keep.add(zone.id);
    }
    return { ...round, zones: round.zones.filter((zone) => keep.has(zone.id)) };
  }
  if (round.kind === "strip") {
    const junk = round.columns.filter((col) => col.junk);
    const keep = round.columns.filter((col) => !col.junk);
    const junkN = Math.max(
      1,
      countAlong(difficulty, roundIndex, totalRounds, [1, 1], [2, Math.min(3, junk.length)], [junk.length, junk.length])
    );
    const extraN = countAlong(difficulty, roundIndex, totalRounds, [0, 0], [1, 2], [EXTRA_JUNK.length, EXTRA_JUNK.length]);
    const extras = EXTRA_JUNK.slice(0, extraN).map((name) => ({ name, junk: true }));
    return { ...round, columns: [...keep, ...junk.slice(0, junkN), ...extras] };
  }
  return round;
}

export function SchemaGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, difficulty } = usePlaySession();
  const deck = useMemo(
    () => takeDeck(ROUNDS_DATA, difficulty).map((item, i) => scaleSchema(item, difficulty, i, total)),
    [difficulty, total]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);

  const round = deck[index];

  function lock(correct: boolean) {
    if (locked) return;
    setLocked(true);
    setOk(correct);
    setScore((s) => s + (correct ? POINTS_PER_ROUND : 0));
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setLocked(false);
    setOk(false);
  }

  if (phase === "intro") {
    return (
      <Intro
        title="Schéma"
        how="Tu glisses le fait au centre, tu poses un ticket sur l’OLTP, tu versionnes Léa. Le modèle se construit avec les mains."
        onStart={() => setPhase("play")}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        title="Schéma"
        score={score}
        max={maxScore}
        line={scoreLine(score, maxScore)}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setLocked(false);
          setOk(false);
        }}
      />
    );
  }

  return (
    <GameShell title="Schéma" round={index} total={total} score={score} maxScore={maxScore}>
      <RoundHeader context={round.context} question={round.question} />
      {round.kind === "star" ? <StarPlay locked={locked} onLock={lock} /> : null}
      {round.kind === "park" ? <ParkPlay round={round} locked={locked} onLock={lock} /> : null}
      {round.kind === "scd" ? <ScdPlay locked={locked} onLock={lock} /> : null}
      {round.kind === "strip" ? <StripPlay round={round} locked={locked} onLock={lock} /> : null}
      {locked ? (
        <Verdict
          tone={ok ? "ok" : "miss"}
          title={ok ? "Ça tient." : "Mauvais modèle."}
          lesson={ok ? round.ok : round.miss}
          onNext={next}
          nextLabel={index + 1 >= total ? "Voir le score" : "Manche suivante"}
        />
      ) : null}
    </GameShell>
  );
}

function StarPlay({ locked, onLock }: { locked: boolean; onLock: (ok: boolean) => void }) {
  const [slots, setSlots] = useState<Record<string, string | null>>({
    n: null,
    w: null,
    fact: null,
    e: null,
    s: null,
  });
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const placed = new Set(Object.values(slots).filter(Boolean));
  const tray = STAR_CHIPS.filter((c) => !placed.has(c.id));

  function zoneAt(x: number, y: number) {
    const hits = document.elementsFromPoint(x, y);
    for (const el of hits) {
      if (!(el instanceof Element)) continue;
      if (el.closest("[data-star-ghost]")) continue;
      const slot = el.closest("[data-star-slot]");
      if (slot) return slot.getAttribute("data-star-slot");
    }
    return null;
  }

  function place(piece: string, zone: string | null) {
    if (locked) {
      play("miss");
      return;
    }
    if (!zone) {
      play("miss");
      return;
    }
    if (zone === "tray") {
      const wasPlaced = Object.values(slots).includes(piece);
      setSlots((s) => {
        const next = { ...s };
        for (const k of Object.keys(next)) if (next[k] === piece) next[k] = null;
        return next;
      });
      play(wasPlaced ? "drop" : "lift");
      return;
    }
    const from = Object.keys(slots).find((k) => slots[k] === piece) ?? null;
    const occ = slots[zone] ?? null;
    const same = from === zone;
    setSlots((s) => {
      const next = { ...s };
      const src = Object.keys(next).find((k) => next[k] === piece) ?? null;
      const occupant = next[zone] ?? null;
      if (src) next[src] = null;
      next[zone] = piece;
      if (occupant && occupant !== piece && src) next[src] = occupant;
      return next;
    });
    if (same) {
      play("drop");
      return;
    }
    if (occ && occ !== piece) play("swap");
    else if (zone === "fact") play("dock");
    else play("drop");
  }

  function onPointerDown(piece: string, event: React.PointerEvent) {
    if (locked || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    unlockAudio();
    play("lift");
    setDrag({ id: piece, x: event.clientX, y: event.clientY });
    setOver(null);
  }

  const dragId = drag?.id ?? null;
  const placeRef = useRef(place);
  placeRef.current = place;

  useEffect(() => {
    if (!dragId) return;
    const piece = dragId;
    function move(event: PointerEvent) {
      setDrag((d) => (d ? { ...d, x: event.clientX, y: event.clientY } : d));
      setOver(zoneAt(event.clientX, event.clientY));
    }
    function up(event: PointerEvent) {
      const zone = zoneAt(event.clientX, event.clientY);
      placeRef.current(piece, zone);
      setDrag(null);
      setOver(null);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragId, locked]);

  const full = Object.values(slots).every(Boolean);
  const correct =
    slots.fact === "CA" &&
    slots.n !== "CA" &&
    slots.e !== "CA" &&
    slots.s !== "CA" &&
    slots.w !== "CA";

  function Piece({ id }: { id: string }) {
    const lifting = drag?.id === id;
    return (
      <div
        draggable={false}
        data-star-piece={id}
        onPointerDown={(event) => onPointerDown(id, event)}
        className={cn(
          "touch-none select-none rounded-xl border border-border bg-card px-3 py-2 font-mono text-sm shadow-sm",
          !locked && "cursor-grab active:cursor-grabbing",
          lifting && "pointer-events-none opacity-20"
        )}
      >
        {id}
      </div>
    );
  }

  function Slot({
    id,
    label,
    tone,
  }: {
    id: string;
    label: string;
    tone: "dim" | "fact";
  }) {
    const chip = slots[id];
    const hot = over === id && Boolean(drag);
    return (
      <div
        data-star-slot={id}
        className={cn(
          "flex min-h-[4.5rem] min-w-[6.5rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-3 py-2 transition",
          tone === "fact" && "border-primary/50 bg-primary/10",
          tone === "dim" && "border-chart-2/40 bg-chart-2/10",
          chip && "border-solid",
          hot && "border-primary bg-primary/25 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_35%,transparent)]"
        )}
      >
        <span className="pointer-events-none font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {chip ? <Piece id={chip} /> : <span className="pointer-events-none font-mono text-[10px] text-muted-foreground">dépose ici</span>}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-3 place-items-center gap-2">
        <span />
        <Slot id="n" label="dim" tone="dim" />
        <span />
        <Slot id="w" label="dim" tone="dim" />
        <Slot id="fact" label="fait" tone="fact" />
        <Slot id="e" label="dim" tone="dim" />
        <span />
        <Slot id="s" label="dim" tone="dim" />
        <span />
      </div>
      <div
        data-star-slot="tray"
        className={cn(
          "mt-4 flex min-h-[4.2rem] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/40 p-3",
          over === "tray" && drag && "border-primary bg-primary/10"
        )}
      >
        {tray.map((c) => (
          <Piece key={c.id} id={c.id} />
        ))}
        {tray.length === 0 ? (
          <span className="font-mono text-xs text-muted-foreground">Étoile complète — valide.</span>
        ) : (
          <span className="basis-full text-center font-mono text-[11px] text-muted-foreground">
            Attrape une pièce, glisse-la, dépose-la sur DIM ou FAIT.
          </span>
        )}
      </div>
      {drag
        ? createPortal(
            <div
              data-star-ghost="1"
              className="pointer-events-none fixed z-[90] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary bg-primary px-3 py-2 font-mono text-sm text-primary-foreground shadow-2xl"
              style={{ left: drag.x, top: drag.y }}
            >
              {drag.id}
            </div>,
            document.body
          )
        : null}
      <LockBar disabled={locked || !full} onLock={() => onLock(correct)} />
    </div>
  );
}

function ParkPlay({
  round,
  locked,
  onLock,
}: {
  round: Extract<Round, { kind: "park" }>;
  locked: boolean;
  onLock: (ok: boolean) => void;
}) {
  const [spot, setSpot] = useState<string | null>(null);

  function onDrop(piece: string, zone: string) {
    if (locked || piece !== "token") return;
    if (zone === "tray") {
      setSpot(null);
      return;
    }
    setSpot(zone);
  }

  return (
    <DragBoard onDrop={onDrop} disabled={locked} className="mt-6">
      <DropSlot zone="tray" className="mx-auto mb-4 flex min-h-14 w-full max-w-xs items-center justify-center px-2">
        {spot ? (
          <span className="px-4 py-2 font-mono text-xs text-muted-foreground">
            Glisse le jeton sur une autre couche
          </span>
        ) : (
          <Draggable id="token" disabled={locked}>
            <span className="inline-flex cursor-grab rounded-full border border-primary/40 bg-primary px-4 py-2 font-mono text-sm text-primary-foreground active:cursor-grabbing">
              {round.token}
            </span>
          </Draggable>
        )}
      </DropSlot>
      <div className="grid grid-cols-2 gap-2">
        {round.zones.map((z) => (
          <DropSlot
            key={z.id}
            zone={z.id}
            filled={spot === z.id}
            className={cn(
              "flex min-h-20 flex-col items-center justify-center gap-1 p-3",
              spot === z.id && "border-primary bg-primary/15"
            )}
          >
            <span className="pointer-events-none font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {z.blurb}
            </span>
            <span className="pointer-events-none font-heading text-lg leading-none">{z.label}</span>
            {spot === z.id ? (
              <Draggable id="token" disabled={locked}>
                <span className="mt-1 inline-flex cursor-grab rounded-full bg-primary px-3 py-1 font-mono text-[10px] text-primary-foreground">
                  {round.token}
                </span>
              </Draggable>
            ) : null}
          </DropSlot>
        ))}
      </div>
      <LockBar disabled={locked || !spot} onLock={() => onLock(spot === round.answer)} />
    </DragBoard>
  );
}

function ScdPlay({ locked, onLock }: { locked: boolean; onLock: (ok: boolean) => void }) {
  const [mode, setMode] = useState<"idle" | "t1" | "t2">("idle");
  const overwrite = mode === "t1";
  const versioned = mode === "t2";

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">dim_client</p>
          {mode === "idle" || overwrite ? (
            <p className="mt-2 font-heading text-2xl">Léa · {overwrite ? "Nantes" : "Lyon"}</p>
          ) : (
            <div className="mt-2 space-y-2 font-mono text-xs">
              <p className="rounded-lg bg-muted px-2 py-1">v1 Lyon · 2023</p>
              <p className="rounded-lg bg-primary/15 px-2 py-1 text-signal">v2 Nantes · 2024</p>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl border p-4",
            overwrite ? "border-anomaly bg-anomaly/10" : "border-border bg-card"
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">fait commandes 2023</p>
          <p className={cn("mt-2 font-heading text-2xl", overwrite && "text-anomaly")}>
            12 commandes · {overwrite ? "Nantes ?" : "Lyon"}
          </p>
          {overwrite ? (
            <p className="mt-1 text-xs text-anomaly">Le passé vient d’être réécrit.</p>
          ) : null}
          {versioned ? (
            <p className="mt-1 text-xs text-ok">Le fait pointe encore v1. L’histoire tient.</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={locked}
          className="h-auto rounded-2xl py-4"
          onClick={() => {
            setMode("t1");
            onLock(false);
          }}
        >
          Écraser l’adresse
        </Button>
        <Button
          variant="outline"
          disabled={locked}
          className="h-auto rounded-2xl py-4"
          onClick={() => {
            setMode("t2");
            onLock(true);
          }}
        >
          Nouvelle version
        </Button>
      </div>
    </div>
  );
}

function StripPlay({
  round,
  locked,
  onLock,
}: {
  round: Extract<Round, { kind: "strip" }>;
  locked: boolean;
  onLock: (ok: boolean) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const junk = round.columns.filter((c) => c.junk).map((c) => c.name);
  const correct =
    picked.length === junk.length && junk.every((n) => picked.includes(n));

  return (
    <div className="mt-6">
      <div className="flex flex-wrap justify-center gap-2">
        {round.columns.map((c) => {
          const on = picked.includes(c.name);
          return (
            <button
              key={c.name}
              type="button"
              disabled={locked}
              onClick={() =>
                setPicked((p) => (p.includes(c.name) ? p.filter((x) => x !== c.name) : [...p, c.name]))
              }
              className={cn(
                "rounded-xl border px-3 py-3 font-mono text-xs transition",
                on && !locked && "border-anomaly bg-anomaly/15 line-through",
                on && locked && c.junk && "border-ok bg-ok/15",
                on && locked && !c.junk && "border-anomaly bg-anomaly/15",
                !on && "border-border bg-card hover:border-primary/40"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Touche ce qui n’est pas une clé ni une mesure.</p>
      <LockBar disabled={locked || picked.length === 0} onLock={() => onLock(correct)} />
    </div>
  );
}
