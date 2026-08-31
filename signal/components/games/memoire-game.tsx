// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { GameShell, Intro, PlayStage, QuestionBeat, Result, Verdict, useBriefRound } from "@s/components/game-shell";
import { LockBar } from "@s/components/interact";
import { Button } from "@s/components/ui/button";
import { play } from "@s/lib/audio";
import { POINTS_PER_ROUND } from "@s/lib/games";
import { usePlaySession } from "@s/components/play-session";
import { usePlay } from "@s/lib/play-text";
import { along, awardPartial, lookSecondsAt, optionCapAt } from "@s/lib/play";
import type { Difficulty } from "@s/lib/play";
import type { Locale } from "@s/lib/locale";
import { PLAY_ROUNDS, PLAY_UI } from "@s/lib/play-copy";
import { useI18n } from "@s/lib/i18n";
import { roundTone } from "@s/lib/feedback";
import { cn } from "@s/lib/utils";

type Dash = {
  kpis: { label: string; value: string; delta: number }[];
  filter: string;
  question: string;
  options: string[];
  answer: string;
  lesson: string;
  reconstruct?: boolean;
};

function fmt(n: number, kind: "€" | "%" | "k" | "n", locale: Locale = "fr") {
  const loc = locale === "en" ? "en-US" : "fr-FR";
  if (kind === "€") return locale === "en" ? `€${n.toLocaleString(loc)}` : `${n.toLocaleString(loc)} €`;
  if (kind === "%") return `${n.toFixed(1)} %`;
  if (kind === "k") return `${n.toFixed(1)} k`;
  return n.toLocaleString(loc);
}

function makeDashboards(count: number, rng: () => number, difficulty: Difficulty, locale: Locale = "fr"): Dash[] {
  const pack = PLAY_ROUNDS[locale]?.memoire ?? {};
  const easyFilters = locale === "en" ? ["France", "Mobile", "Retail"] : ["France", "Mobile", "Retail"];
  const hardFilters =
    locale === "en"
      ? ["EU", "New customer", "Subscribers", "SEA", "App"]
      : ["UE", "Nouveau client", "Abonnés", "SEA", "App"];
  const brutalFilters =
    locale === "en"
      ? ["Cohort W12", "iOS 18+", "VIP 90d", "B2B North", "14-day returns", "Affiliates"]
      : ["Cohorte S12", "iOS 18+", "VIP 90j", "B2B Nord", "Retours 14j", "Affiliés"];
  const filters =
    difficulty === "easy" ? easyFilters : difficulty === "hard" ? hardFilters : brutalFilters;

  return Array.from({ length: count }).map((_, round) => {
    const cap = optionCapAt(difficulty, 4, round, count);
    const filter = filters[round % filters.length];
    const ca = difficulty === "brutal" ? 128400 + round * 2300 + Math.round(rng() * 900) : 120000 + round * 17000 + Math.round(rng() * 8000);
    const conv = difficulty === "brutal" ? 2.42 + round * 0.08 + rng() * 0.06 : 1.8 + round * 0.3 + rng() * 0.4;
    const panier = 42 + round * 6 + Math.round(rng() * 9);
    const nps = 18 + round * 4 + Math.round(rng() * 8);
    const sessions = 8.4 + round * 0.6 + rng() * 1.2;
    const bounce = 38 + round * 1.1 + rng() * 6;
    const deltas = [
      Math.round((rng() - 0.35) * 24),
      Math.round((rng() - 0.4) * 18),
      Math.round((rng() - 0.45) * 16),
      Math.round((rng() - 0.3) * 20),
      Math.round((rng() - 0.38) * 14),
      Math.round((rng() - 0.42) * 12),
    ];
    const redAt = round % 4;
    deltas[redAt] = -Math.abs(deltas[redAt] || 8) - 7;
    const kpisAll = [
      { label: locale === "en" ? "Revenue" : "CA", value: fmt(ca, "€", locale), delta: deltas[0] },
      { label: "Conversion", value: fmt(conv, "%", locale), delta: deltas[1] },
      { label: locale === "en" ? "Avg. basket" : "Panier moyen", value: fmt(panier, "€", locale), delta: deltas[2] },
      { label: "NPS", value: String(nps), delta: deltas[3] },
      { label: "Sessions", value: fmt(sessions, "k", locale), delta: deltas[4] },
      { label: "Bounce", value: fmt(bounce, "%", locale), delta: deltas[5] },
    ];
    const kpiCount = Math.round(along(difficulty, round, count, [3, 3], [4, 5], [6, 6]));
    const kpis = kpisAll.slice(0, kpiCount);
    const worst = kpis.reduce((a, b) => (a.delta < b.delta ? a : b));
    const best = kpis.reduce((a, b) => (a.delta > b.delta ? a : b));
    const caGap = Math.round(along(difficulty, round, count, [42000, 28000], [9000, 4500], [1400, 600]));
    const convGap = along(difficulty, round, count, [1.8, 1.2], [0.45, 0.22], [0.1, 0.05]);

    const ui = PLAY_UI[locale];
    const easyKinds: Array<() => Dash> = [
      () => ({
        kpis,
        filter,
        question: pack.filter?.question ?? ui.memoire.qFilter,
        options: shuffleUnique([filter, ...filters.filter((f) => f !== filter)]).slice(0, cap),
        answer: filter,
        lesson: pack.filter?.lesson ?? "Le filtre est écrit en grand. En Facile, on ancre ça d’abord — le reste du dashboard vient après.",
      }),
      () => ({
        kpis,
        filter,
        question: pack.red?.question ?? ui.memoire.qRed,
        options: shuffleUnique([worst.label, ...kpis.filter((k) => k.label !== worst.label).map((k) => k.label)]).slice(0, cap),
        answer: worst.label,
        lesson: pack.red?.lesson ?? "On mémorise d'abord ce qui va mal. En comité, c'est souvent le seul chiffre qu'on te redemandera.",
      }),
      () => ({
        kpis,
        filter,
        question: pack.best?.question ?? ui.memoire.qBest,
        options: shuffleUnique([best.label, ...kpis.filter((k) => k.label !== best.label).map((k) => k.label)]).slice(0, cap),
        answer: best.label,
        lesson: pack.best?.lesson ?? "La pastille verte, c’est le signal. Note-la avant que le slide se ferme.",
      }),
    ];

    const hardKinds: Array<() => Dash> = [
      () => ({
        kpis,
        filter,
        question: pack.ca?.question ?? ui.memoire.qCa,
        options: shuffleUnique([
          kpis[0].value,
          fmt(ca + caGap, "€", locale),
          fmt(ca - Math.round(caGap * 0.7), "€", locale),
          fmt(Math.round(ca * 1.08), "€", locale),
        ]).slice(0, cap),
        answer: kpis[0].value,
        lesson: pack.ca?.lesson ?? "L'ordre de grandeur compte plus que le centime. Si tu te trompes d'un zéro, le reste du dashboard est décoratif.",
      }),
      () => ({
        kpis,
        filter,
        question: pack.filter2?.question ?? ui.memoire.qFilter,
        options: shuffleUnique([filter, ...hardFilters.filter((f) => f !== filter), "France"]).slice(0, cap),
        answer: filter,
        lesson: pack.filter2?.lesson ?? "Un KPI sans filtre, c'est une moyenne qui ment. Le grain et le segment, c'est la moitié de la vérité.",
      }),
      () => ({
        kpis,
        filter,
        question: pack.best2?.question ?? ui.memoire.qBest,
        options: shuffleUnique([best.label, ...kpis.filter((k) => k.label !== best.label).map((k) => k.label)]).slice(0, cap),
        answer: best.label,
        lesson: pack.best2?.lesson ?? "Une hausse isolée n'est pas une stratégie. Note-la, puis demande : volume, mix, ou prix ?",
      }),
      () => ({
        kpis,
        filter,
        question: pack.red?.question ?? ui.memoire.qRed,
        options: shuffleUnique([worst.label, ...kpis.filter((k) => k.label !== worst.label).map((k) => k.label)]).slice(0, cap),
        answer: worst.label,
        lesson: pack.red?.lesson ?? "On mémorise d'abord ce qui va mal. En comité, c'est souvent le seul chiffre qu'on te redemandera.",
      }),
      () => ({
        kpis,
        filter,
        question: pack.conv?.question ?? ui.memoire.qConv,
        options: shuffleUnique([
          kpis[1]?.value ?? fmt(conv, "%", locale),
          fmt(conv + convGap, "%", locale),
          fmt(Math.max(0.4, conv - convGap * 0.75), "%", locale),
          fmt(conv + convGap * 1.4, "%", locale),
        ]).slice(0, cap),
        answer: kpis[1]?.value ?? fmt(conv, "%", locale),
        lesson: pack.conv?.lesson ?? "Les taux se ressemblent. D'où l'intérêt d'ancrer un ordre de grandeur avant de parler de +0,2 point.",
      }),
    ];

    const brutalLessons =
      locale === "en"
        ? [
            "Brutal: you rebuild the slide. Filter first — without a segment, six tiles are an average that lies.",
            "Every tile has a place. Swapping revenue and conversion already lies to the committee.",
            "The red KPI has coordinates. Put it elsewhere and you memorized “something’s wrong”, not the dashboard.",
            "Amounts look alike. Anchor the tile, not the “around 130k” vibe.",
            "Six tiles, one filter. One miss, and on Brutal it doesn’t count.",
          ]
        : [
            "Brutal : tu reconstruis le slide. Le filtre d’abord — sans segment, les six tuiles sont une moyenne qui ment.",
            "Chaque tuile a une place. Échanger CA et conversion, c’est déjà mentir au comité.",
            "Le rouge a une coordonnée. Si tu le poses ailleurs, tu as mémorisé « un truc va mal », pas le dashboard.",
            "Les montants se ressemblent. Ancre la tuile, pas l’ambiance « autour de 130k ».",
            "Six tuiles, un filtre. Une seule erreur, et en Brutal ça ne compte pas.",
          ];

    const brutalKinds: Array<() => Dash> = [
      () => ({
        kpis,
        filter,
        question: pack.rebuild?.question ?? ui.memoire.qRebuild,
        options: [],
        answer: "",
        reconstruct: true,
        lesson: brutalLessons[round % brutalLessons.length],
      }),
    ];

    const kinds = difficulty === "easy" ? easyKinds : difficulty === "hard" ? hardKinds : brutalKinds;
    return kinds[round % kinds.length]();
  });
}

function shuffleUnique(items: string[]) {
  const copy = [...new Set(items)];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function DashboardPreview({ dash, blurred }: { dash: Dash; blurred?: boolean }) {
  const { locale } = useI18n();
  const filterLabel = PLAY_UI[locale].memoire.filter;
  return (
    <div className={cn("space-y-3", blurred && "pointer-events-none select-none blur-md")}>
      <p className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
          <span className="pulse-dot size-1.5 rounded-full bg-primary" />
          {filterLabel} · {dash.filter}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-3">
        {dash.kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={cn(
              "kpi-flash rounded-2xl border border-border bg-card p-4",
              kpi.delta < 0 && "ring-1 ring-anomaly/30"
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 font-heading text-2xl sm:text-3xl">{kpi.value}</p>
            <div className="mt-2 flex items-center gap-2">
              <p className={cn("font-mono text-sm", kpi.delta >= 0 ? "text-ok" : "text-anomaly")}>
                {kpi.delta >= 0 ? "+" : ""}
                {kpi.delta} %
              </p>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
                <span
                  className={cn("block h-full rounded-full", kpi.delta >= 0 ? "bg-ok" : "bg-anomaly")}
                  style={{ width: `${Math.min(100, Math.abs(kpi.delta) * 3)}%` }}
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemoireGame({ onFinish }: { onFinish: (score: number) => void }) {
  const { rounds: total, maxScore, rng, difficulty } = usePlaySession();
  const playI18n = usePlay("memoire");
  const rounds = useMemo(
    () => makeDashboards(total, rng, difficulty, playI18n.locale),
    [difficulty, rng, total, playI18n.locale]
  );
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState<"flash" | "ask" | "verdict">("flash");
  const look = lookSecondsAt(difficulty, index, total);
  const [left, setLeft] = useState(look);
  const [picked, setPicked] = useState<string | null>(null);
  const [placements, setPlacements] = useState<(string | null)[]>([]);
  const [filterPick, setFilterPick] = useState<string | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [points, setPoints] = useState(0);

  const { brief, go } = useBriefRound(index, phase === "play");
  const round = playI18n.overlay(rounds[index]);
  const reconstructing = Boolean(round?.reconstruct);
  const correct = reconstructing ? points === POINTS_PER_ROUND : picked === round?.answer;
  const idleLabels = round
    ? round.kpis.map((k) => k.label).filter((label) => !placements.includes(label))
    : [];
  const filterPool = useMemo(() => {
    if (!round?.reconstruct) return [];
    const decoys = playI18n.ui.decoys.filter((item) => item !== round.filter);
    const pickedDecoys = shuffleUnique(decoys).slice(0, 3);
    return shuffleUnique([round.filter, ...pickedDecoys]);
  }, [index, round?.filter, round?.reconstruct]);

  useEffect(() => {
    if (phase !== "play" || mode !== "flash" || brief) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const remaining = Math.max(0, look - Math.floor((Date.now() - started) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(tick);
        setMode("ask");
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [phase, mode, index, look, brief]);

  useEffect(() => {
    if (mode !== "ask" || !round?.reconstruct) return;
    setPlacements(Array(round.kpis.length).fill(null));
    setFilterPick(null);
    setHeld(null);
    setPoints(0);
  }, [mode, index, round?.reconstruct, round?.kpis.length]);

  function choose(opt: string) {
    if (mode !== "ask") return;
    setPicked(opt);
    setMode("verdict");
    setScore((s) => s + (opt === round.answer ? POINTS_PER_ROUND : 0));
  }

  function holdChip(label: string) {
    if (mode !== "ask") return;
    play("lift");
    setHeld((prev) => (prev === label ? null : label));
  }

  function placeTile(i: number) {
    if (mode !== "ask") return;
    const occupant = placements[i];
    if (held) {
      play("drop");
      setPlacements((prev) => {
        const next = [...prev];
        const from = next.indexOf(held);
        if (from >= 0) next[from] = occupant;
        next[i] = held;
        return next;
      });
      setHeld(null);
      return;
    }
    if (occupant) {
      play("lift");
      setPlacements((prev) => {
        const next = [...prev];
        next[i] = null;
        return next;
      });
      setHeld(occupant);
    }
  }

  function pickFilter(value: string) {
    if (mode !== "ask") return;
    play("tap");
    setFilterPick(value);
  }

  function lockReconstruct() {
    if (mode !== "ask" || !round) return;
    const hits =
      placements.filter((p, i) => p === round.kpis[i].label).length + (filterPick === round.filter ? 1 : 0);
    const gained = awardPartial(hits, round.kpis.length + 1, difficulty);
    setPoints(gained);
    setScore((s) => s + gained);
    setMode("verdict");
    play(gained === POINTS_PER_ROUND ? "ok" : "miss");
  }

  function next() {
    if (index + 1 >= total) {
      setPhase("done");
      onFinish(score);
      return;
    }
    setIndex((v) => v + 1);
    setMode("flash");
    setPicked(null);
    setPlacements([]);
    setFilterPick(null);
    setHeld(null);
    setPoints(0);
  }

  if (phase === "intro") {
    return (
      <Intro
        slug="memoire"
        onStart={() => {
          setLeft(look);
          setPhase("play");
        }}
      />
    );
  }

  if (phase === "done") {
    return (
      <Result
        slug="memoire"
        score={score}
        max={maxScore}
        onReplay={() => {
          setPhase("intro");
          setIndex(0);
          setScore(0);
          setMode("flash");
          setLeft(look);
          setPicked(null);
          setPlacements([]);
          setFilterPick(null);
          setHeld(null);
          setPoints(0);
        }}
      />
    );
  }

  if (brief) {
    return (
      <GameShell slug="memoire" round={index} total={total} score={score} maxScore={maxScore}>
        <QuestionBeat context={round.filter} question={round.question} onGo={go} />
      </GameShell>
    );
  }

  return (
    <GameShell slug="memoire" round={index} total={total} score={score} maxScore={maxScore} briefContext={round.filter} briefQuestion={round.question}>
      <PlayStage slug="memoire" className="mt-2">
      {mode === "flash" ? (
        <>
          <p
            className={cn(
              "text-center font-heading text-4xl tabular-nums tracking-tight sm:text-5xl",
              left <= 3 ? "look-urgent" : "text-primary"
            )}
          >
            {left}
            <span className="ml-1 font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">s</span>
          </p>
          <p className="mt-1 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {playI18n.ui.memoireLook}
          </p>
          <div className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-foreground/10">
            <span
              key={index}
              className="look-tick block h-full rounded-full bg-primary"
              style={{ animationDuration: `${look}s` }}
            />
          </div>
          <div className="mt-5">
            <DashboardPreview dash={round} />
          </div>
        </>
      ) : reconstructing ? (
        <>
          <p className="text-center text-sm text-muted-foreground">{playI18n.ui.memoireClosed}</p>
          <h2 className="mt-2 text-center font-heading text-2xl sm:text-3xl">{round.question}</h2>
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{playI18n.ui.memoire.filter}</span>
              {filterPool.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={mode !== "ask"}
                  onClick={() => pickFilter(item)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-xs",
                    filterPick === item ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground",
                    mode === "verdict" && item === round.filter && "border-ok bg-ok/15 text-foreground",
                    mode === "verdict" && filterPick === item && item !== round.filter && "border-anomaly bg-anomaly/10"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {round.kpis.map((kpi, i) => {
                const placed = placements[i];
                const right = placed === kpi.label;
                return (
                  <button
                    key={kpi.label}
                    type="button"
                    disabled={mode !== "ask"}
                    onClick={() => placeTile(i)}
                    className={cn(
                      "min-h-[5.5rem] rounded-2xl border border-border bg-card p-4 text-left transition",
                      held && "ring-1 ring-primary/40",
                      mode === "verdict" && right && "border-ok bg-ok/10",
                      mode === "verdict" && placed && !right && "border-anomaly bg-anomaly/10"
                    )}
                  >
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {placed ?? "—"}
                    </p>
                    <p className="mt-1 font-heading text-xl text-muted-foreground/40">···</p>
                  </button>
                );
              })}
            </div>
            {mode === "ask" ? (
              <div className="flex flex-wrap justify-center gap-2">
                {idleLabels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => holdChip(label)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm",
                      held === label ? "border-primary bg-primary/15" : "border-border bg-card"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          {mode === "verdict" ? (
            <Verdict
              tone={roundTone(points)}
              title={correct ? playI18n.punch(true) : playI18n.punch(false)}
              lesson={round.lesson}
              onNext={next}
              isLast={index + 1 >= total}
            />
          ) : (
            <LockBar
              disabled={placements.some((p) => !p) || !filterPick}
              onLock={lockReconstruct}
              label={playI18n.ui.lockSlide}
            />
          )}
        </>
      ) : (
        <>
          <p className="text-center text-sm text-muted-foreground">{playI18n.ui.memoireClosed}</p>
          <h2 className="mt-2 text-center font-heading text-2xl sm:text-3xl">{round.question}</h2>
          <div className="mt-4">
            <DashboardPreview dash={round} blurred />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {round.options.map((opt) => {
              const isPick = picked === opt;
              const isAnswer = mode === "verdict" && opt === round.answer;
              const isWrong = mode === "verdict" && isPick && !isAnswer;
              return (
                <Button
                  key={opt}
                  variant="outline"
                  className={cn(
                    "h-12",
                    isAnswer && "border-ok bg-ok/15",
                    isWrong && "border-anomaly bg-anomaly/10"
                  )}
                  disabled={mode !== "ask"}
                  onClick={() => choose(opt)}
                >
                  {opt}
                </Button>
              );
            })}
          </div>
          {mode === "verdict" ? (
            <Verdict
              tone={correct ? "ok" : "miss"}
              title={correct ? playI18n.punch(true) : playI18n.punch(false)}
              lesson={round.lesson}
              onNext={next}
              isLast={index + 1 >= total}
            />
          ) : null}
        </>
      )}
      </PlayStage>
    </GameShell>
  );
}
