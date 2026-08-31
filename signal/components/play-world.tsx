// @ts-nocheck
"use client";

import type { GameSlug } from "@s/lib/games";

/** Decorative, non-interactive atmosphere behind each playfield. */
export function PlayWorld({ slug }: { slug: GameSlug }) {
  return (
    <div className="play-world" aria-hidden>
      {slug === "voyage" ? <VoyageSky /> : null}
      {slug === "anomalie" ? <DashGlow /> : null}
      {slug === "graphique" ? <StudioGrid /> : null}
      {slug === "entonnoir" ? <Pour /> : null}
      {slug === "memoire" ? <Projector /> : null}
      {slug === "bruit" ? <Scope /> : null}
      {slug === "schema" ? <Constellation /> : null}
      {slug === "pipeline" ? <Belt /> : null}
      {slug === "jointure" ? <Worlds /> : null}
      {slug === "grain" ? <Mill /> : null}
      {slug === "entrepot" ? <Cluster /> : null}
      {slug === "elagage" ? <Aisles /> : null}
      {slug === "clone" ? <Pointers /> : null}
      {slug === "flux" ? <Ripple /> : null}
    </div>
  );
}

function VoyageSky() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="640" height="220" fill="url(#vsky)" />
      <g fill="currentColor" opacity="0.22">
        <rect x="40" y="90" width="28" height="70" rx="2" />
        <rect x="78" y="70" width="36" height="90" rx="2" />
        <rect x="124" y="100" width="22" height="60" rx="2" />
        <rect x="420" y="80" width="40" height="80" rx="2" />
        <rect x="470" y="58" width="26" height="102" rx="2" />
        <rect x="508" y="96" width="48" height="64" rx="2" />
        <rect x="568" y="74" width="22" height="86" rx="2" />
      </g>
    </svg>
  );
}

function DashGlow() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="none">
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          className={i === 8 ? "world-outlier" : undefined}
          x={36 + i * 48}
          y={i === 8 ? 28 : 70 + (i % 3) * 8}
          width="28"
          height={i === 8 ? 140 : 90 - (i % 4) * 10}
          rx="6"
          fill="currentColor"
          opacity={i === 8 ? 0.28 : 0.08}
        />
      ))}
    </svg>
  );
}

function StudioGrid() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="none">
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.12">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={20 + i * 22} x2="640" y2={20 + i * 22} />
        ))}
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`v${i}`} x1={20 + i * 38} y1="0" x2={20 + i * 38} y2="200" />
        ))}
      </g>
      <polyline
        points="40,150 90,132 140,138 190,110 240,118 290,86 340,92 390,70 440,78 490,54 540,62 590,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        opacity="0.22"
      />
    </svg>
  );
}

function Pour() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 240" preserveAspectRatio="xMidYMid slice">
      <ellipse cx="320" cy="48" rx="180" ry="28" fill="currentColor" opacity="0.1" />
      <ellipse cx="320" cy="92" rx="140" ry="24" fill="currentColor" opacity="0.12" />
      <ellipse cx="320" cy="132" rx="96" ry="20" fill="currentColor" opacity="0.16" />
      <ellipse cx="320" cy="168" rx="58" ry="16" fill="currentColor" opacity="0.2" />
      <g className="world-drip" fill="currentColor">
        <circle cx="248" cy="70" r="4" opacity="0.35" />
        <circle cx="390" cy="108" r="3.5" opacity="0.3" />
        <circle cx="300" cy="150" r="3" opacity="0.4" />
      </g>
    </svg>
  );
}

function Projector() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 220" preserveAspectRatio="none">
      <polygon points="180,20 460,20 560,200 80,200" fill="currentColor" opacity="0.07" />
      <rect x="220" y="36" width="200" height="110" rx="10" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

function Scope() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="none">
      <g stroke="currentColor" strokeWidth="0.5" opacity="0.1">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1="0" y1={24 + i * 22} x2="640" y2={24 + i * 22} />
        ))}
      </g>
      <path
        d="M0 110 C 40 110, 60 40, 100 40 S 160 170, 200 170 S 260 70, 300 70 S 360 150, 400 150 S 460 50, 500 50 S 560 130, 640 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.22"
      />
    </svg>
  );
}

function Constellation() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.16">
        <line x1="320" y1="110" x2="180" y2="48" />
        <line x1="320" y1="110" x2="460" y2="48" />
        <line x1="320" y1="110" x2="150" y2="168" />
        <line x1="320" y1="110" x2="490" y2="168" />
      </g>
      <circle cx="320" cy="110" r="18" fill="currentColor" opacity="0.22" />
      <circle cx="180" cy="48" r="10" fill="currentColor" opacity="0.16" />
      <circle cx="460" cy="48" r="10" fill="currentColor" opacity="0.16" />
      <circle cx="150" cy="168" r="10" fill="currentColor" opacity="0.16" />
      <circle cx="490" cy="168" r="10" fill="currentColor" opacity="0.16" />
    </svg>
  );
}

function Belt() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 160" preserveAspectRatio="none">
      <rect x="20" y="70" width="600" height="18" rx="9" fill="currentColor" opacity="0.1" />
      <g className="world-belt" fill="currentColor" opacity="0.18">
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={28 + i * 60} y="74" width="22" height="10" rx="2" />
        ))}
      </g>
    </svg>
  );
}

function Worlds() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice">
      <circle cx="250" cy="100" r="72" fill="currentColor" opacity="0.08" />
      <circle cx="390" cy="100" r="72" fill="currentColor" opacity="0.14" />
    </svg>
  );
}

function Mill() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice">
      <polygon points="320,24 390,80 250,80" fill="currentColor" opacity="0.12" />
      <rect x="270" y="80" width="100" height="90" rx="8" fill="currentColor" opacity="0.1" />
      <g className="world-mill" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2">
        <circle cx="320" cy="124" r="22" />
        <line x1="320" y1="102" x2="320" y2="146" />
        <line x1="298" y1="124" x2="342" y2="124" />
      </g>
    </svg>
  );
}

function Cluster() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          className="world-wh"
          x={80 + (i % 4) * 120}
          y={40 + Math.floor(i / 4) * 70}
          width="88"
          height="52"
          rx="10"
          fill="currentColor"
          opacity="0.1"
        />
      ))}
    </svg>
  );
}

function Aisles() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 200" preserveAspectRatio="none">
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} fill="currentColor" opacity={i === 2 ? 0.22 : 0.08}>
          <rect x={40 + i * 100} y="36" width="70" height="128" rx="8" />
          <rect x={52 + i * 100} y="50" width="46" height="8" rx="2" opacity="0.5" />
          <rect x={52 + i * 100} y="68" width="46" height="8" rx="2" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

function Pointers() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 180" preserveAspectRatio="xMidYMid slice">
      <rect x="90" y="40" width="140" height="90" rx="10" fill="currentColor" opacity="0.12" />
      <rect x="410" y="40" width="140" height="90" rx="10" fill="currentColor" opacity="0.08" />
      <path d="M240 85 H400" stroke="currentColor" strokeWidth="2" opacity="0.25" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  );
}

function Ripple() {
  return (
    <svg className="play-world-svg" viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
      <g className="world-ripple" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="320" cy="110" r="28" opacity="0.28" />
        <circle cx="320" cy="110" r="56" opacity="0.16" />
        <circle cx="320" cy="110" r="88" opacity="0.1" />
      </g>
    </svg>
  );
}
