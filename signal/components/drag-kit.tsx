"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { play } from "@/lib/audio";
import { cn } from "@/lib/utils";

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function placeInSlots(slots: (string | null)[], piece: string, index: number) {
  const next = [...slots];
  const from = next.indexOf(piece);
  const occ = next[index];
  if (from >= 0) next[from] = null;
  next[index] = piece;
  if (occ && occ !== piece && from >= 0) next[from] = occ;
  return next;
}

type DragCtx = {
  dragging: string | null;
  over: string | null;
  begin: (id: string, label: string, event: React.PointerEvent) => void;
};

const Ctx = createContext<DragCtx | null>(null);

export function DragBoard({
  children,
  onDrop,
  disabled,
  className,
}: {
  children: ReactNode;
  onDrop: (piece: string, zone: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [over, setOver] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const begin = useCallback(
    (id: string, text: string, event: React.PointerEvent) => {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      setDragging(id);
      setLabel(text);
      setPos({ x: event.clientX, y: event.clientY });
      play("hover");
    },
    [disabled]
  );

  useEffect(() => {
    if (!dragging) return;
    function zoneAt(x: number, y: number) {
      const hits = document.elementsFromPoint(x, y);
      for (const el of hits) {
        if (!(el instanceof Element)) continue;
        const zone = el.closest("[data-drop]")?.getAttribute("data-drop");
        if (zone) return zone;
      }
      return null;
    }
    function move(event: PointerEvent) {
      setPos({ x: event.clientX, y: event.clientY });
      setOver(zoneAt(event.clientX, event.clientY) ?? null);
    }
    function up(event: PointerEvent) {
      const zone = zoneAt(event.clientX, event.clientY);
      const piece = dragging;
      setDragging(null);
      setOver(null);
      if (piece && zone && !disabled) {
        play("drop");
        onDrop(piece, zone);
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, disabled, onDrop]);

  const value = useMemo(() => ({ dragging, over, begin }), [dragging, over, begin]);

  return (
    <Ctx.Provider value={value}>
      <div className={cn(dragging && "select-none", className)}>{children}</div>
      {ready && dragging
        ? createPortal(
            <div
              className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-primary bg-primary px-3 py-2 font-mono text-xs text-primary-foreground shadow-xl"
              style={{ left: pos.x, top: pos.y }}
            >
              {label}
            </div>,
            document.body
          )
        : null}
    </Ctx.Provider>
  );
}

function useDrag() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("DragBoard missing");
  return ctx;
}

export function Draggable({
  id,
  label,
  disabled,
  className,
  children,
}: {
  id: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { begin, dragging } = useDrag();
  return (
    <div
      data-piece={id}
      className={cn(
        "touch-none select-none",
        !disabled && "cursor-grab active:cursor-grabbing",
        dragging === id && "pointer-events-none opacity-30",
        className
      )}
      onPointerDown={(event) => {
        if (disabled) return;
        const text =
          label || event.currentTarget.textContent?.replace(/\s+/g, " ").trim() || id;
        begin(id, text, event);
      }}
    >
      {children ?? label}
    </div>
  );
}

export function DropSlot({
  id,
  zone,
  filled,
  className,
  children,
  label,
  style,
}: {
  id?: string;
  zone?: string;
  filled?: boolean;
  className?: string;
  children?: ReactNode;
  label?: string;
  style?: CSSProperties;
}) {
  const dropId = id ?? zone ?? "";
  const { over, dragging } = useDrag();
  const hot = over === dropId && Boolean(dragging);
  return (
    <div
      data-drop={dropId}
      style={style}
      className={cn(
        "min-h-14 rounded-2xl border border-dashed border-border transition",
        filled && "border-solid",
        hot && "border-solid border-primary bg-primary/15 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_25%,transparent)]",
        className
      )}
    >
      {children ?? (
        <p className="px-3 py-4 text-center text-xs text-muted-foreground">{label ?? "Dépose ici"}</p>
      )}
    </div>
  );
}

export function Brick({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "brick-pop rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
