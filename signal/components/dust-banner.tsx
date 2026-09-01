// @ts-nocheck
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { play } from "@s/lib/audio";
import { cn } from "@s/lib/utils";

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  lime: boolean;
  spin: number;
};

const MAX = 90;

export function DustBanner({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const host: HTMLDivElement = wrap;
    const surface: HTMLCanvasElement = canvas;
    const gfx = surface.getContext("2d", { alpha: true });
    if (!gfx) return;
    const drawCtx: CanvasRenderingContext2D = gfx;

    const motes: Mote[] = [];
    const trail: { x: number; y: number }[] = [];
    const pointer = { x: 0, y: 0, inside: false };
    const size = { w: 1, h: 1 };
    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;
    let grainAcc = 0;

    function resize() {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = rect.width;
      size.h = rect.height;
      surface.width = Math.max(1, Math.floor(rect.width * dpr));
      surface.height = Math.max(1, Math.floor(rect.height * dpr));
      surface.style.width = `${rect.width}px`;
      surface.style.height = `${rect.height}px`;
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(nearX: number, nearY: number) {
      if (motes.length >= MAX) return;
      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 40;
      motes.push({
        x: nearX + Math.cos(angle) * dist,
        y: nearY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        r: 1.1 + Math.random() * 1.8,
        lime: Math.random() < 0.28,
        spin: Math.random() * Math.PI * 2,
      });
    }

    function step(dt: number) {
      if (!pointer.inside) return;
      spawnAcc += dt;
      while (spawnAcc > 55 && motes.length < MAX) {
        spawnAcc -= 55;
        spawn(pointer.x, pointer.y);
      }
      for (const m of motes) {
        const dx = pointer.x - m.x;
        const dy = pointer.y - m.y;
        const d2 = dx * dx + dy * dy + 40;
        const pull = 1800 / d2;
        m.spin += dt * 0.004;
        m.vx += (dx * pull + Math.cos(m.spin) * 28) * dt * 0.001;
        m.vy += (dy * pull + Math.sin(m.spin) * 28) * dt * 0.001;
        m.vx *= 0.96;
        m.vy *= 0.96;
        m.x += m.vx * dt * 0.016;
        m.y += m.vy * dt * 0.016;
        if (m.x < 6) m.vx = Math.abs(m.vx);
        if (m.x > size.w - 6) m.vx = -Math.abs(m.vx);
        if (m.y < 6) m.vy = Math.abs(m.vy);
        if (m.y > size.h - 6) m.vy = -Math.abs(m.vy);
      }
      trail.push({ x: pointer.x, y: pointer.y });
      if (trail.length > 48) trail.shift();
      grainAcc += dt;
      if (grainAcc > 420) {
        grainAcc = 0;
        play("grain");
      }
    }

    function draw() {
      drawCtx.clearRect(0, 0, size.w, size.h);
      if (trail.length > 1) {
        drawCtx.beginPath();
        drawCtx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i += 1) drawCtx.lineTo(trail[i].x, trail[i].y);
        drawCtx.strokeStyle = "oklch(0.9 0.19 122 / 28%)";
        drawCtx.lineWidth = 1.2;
        drawCtx.stroke();
      }
      for (let i = 0; i < motes.length; i += 1) {
        const m = motes[i];
        for (let j = i + 1; j < motes.length; j += 1) {
          const n = motes[j];
          const dx = m.x - n.x;
          const dy = m.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 42) {
            drawCtx.strokeStyle = `oklch(0.9 0.19 122 / ${((1 - dist / 42) * 0.22).toFixed(3)})`;
            drawCtx.lineWidth = 0.7;
            drawCtx.beginPath();
            drawCtx.moveTo(m.x, m.y);
            drawCtx.lineTo(n.x, n.y);
            drawCtx.stroke();
          }
        }
      }
      for (const m of motes) {
        drawCtx.beginPath();
        drawCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        drawCtx.fillStyle = m.lime ? "oklch(0.9 0.19 122 / 88%)" : "oklch(0.95 0.02 95 / 80%)";
        drawCtx.fill();
      }
    }

    function loop(now: number) {
      const dt = Math.min(40, now - last);
      last = now;
      step(dt);
      draw();
      raf = window.requestAnimationFrame(loop);
    }

    function localPoint(event: PointerEvent) {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    }

    function enter(event: PointerEvent) {
      localPoint(event);
      pointer.inside = true;
      spawnAcc = 0;
      for (let i = 0; i < 10; i += 1) spawn(pointer.x, pointer.y);
      play("grain");
    }

    function move(event: PointerEvent) {
      if (!pointer.inside) return;
      localPoint(event);
    }

    function leave() {
      pointer.inside = false;
      motes.length = 0;
      trail.length = 0;
      spawnAcc = 0;
      grainAcc = 0;
      drawCtx.clearRect(0, 0, size.w, size.h);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    raf = window.requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn("relative overflow-hidden", className)}>
      {children}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" aria-hidden />
    </div>
  );
}
