"use client";

import { useEffect, useRef } from "react";

type Ripple = { x: number; y: number; born: number; strength: number };

/** Decorative, hero-scoped water rings. No React updates on pointer movement. */
export function HeroRipples() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    if (!canvas || !cursor || !hero) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    let cleanup = () => {};

    function configure() {
      cleanup();
      cleanup = () => {};
      if (!fine.matches || reduced.matches || forced.matches) return;
      const surface = canvas!;
      const lens = cursor!;
      const region = hero!;
      const ctx = surface.getContext("2d");
      if (!ctx) return;
      const context = ctx;
      let width = 0;
      let height = 0;
      let frame = 0;
      let ripples: Ripple[] = [];
      let pointer: { x: number; y: number; interactive: boolean } | null = null;
      let previous: { x: number; y: number } | null = null;
      let lastRipple = -Infinity;

      const resize = () => {
        width = region.clientWidth;
        height = region.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        surface.width = Math.round(width * ratio);
        surface.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        reset();
      };
      function paint(now: number) {
        frame = 0;
        if (document.hidden) {
          reset();
          return;
        }
        if (pointer) {
          const rect = region.getBoundingClientRect();
          const x = pointer.x - rect.left;
          const y = pointer.y - rect.top;
          lens.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          lens.dataset.visible = "true";
          lens.dataset.interactive = String(pointer.interactive);
          const distance = previous
            ? Math.hypot(x - previous.x, y - previous.y)
            : 20;
          if (distance > 10 && now - lastRipple > 55) {
            ripples.push({
              x,
              y,
              born: now,
              strength: Math.min(distance / 45, 1),
            });
            if (ripples.length > 18) ripples.shift();
            lastRipple = now;
            previous = { x, y };
          }
          pointer = null;
        }
        context.clearRect(0, 0, width, height);
        ripples = ripples.filter((r) => now - r.born < 1150);
        for (const r of ripples) {
          const progress = (now - r.born) / 1150;
          const fade = Math.pow(1 - progress, 2) * (0.22 + r.strength * 0.17);
          const radius = 9 + (1 - Math.pow(1 - progress, 2)) * 95;
          // Adjacent dark/light rings read as a small refractive water edge.
          context.beginPath();
          context.arc(r.x, r.y + 1, radius + 2, 0, Math.PI * 2);
          context.lineWidth = 2;
          context.strokeStyle = `rgba(7, 20, 38, ${fade * 0.8})`;
          context.stroke();
          context.beginPath();
          context.arc(r.x, r.y, radius, 0, Math.PI * 2);
          context.lineWidth = 1.1;
          context.strokeStyle = `rgba(227, 248, 255, ${fade})`;
          context.stroke();
          context.beginPath();
          context.arc(r.x, r.y, radius * 0.64, 0, Math.PI * 2);
          context.lineWidth = 0.6;
          context.strokeStyle = `rgba(255, 255, 255, ${fade * 0.55})`;
          context.stroke();
        }
        if (ripples.length) frame = requestAnimationFrame(paint);
      }
      function move(event: PointerEvent) {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen")
          return;
        pointer = {
          x: event.clientX,
          y: event.clientY,
          interactive:
            event.target instanceof Element &&
            !!event.target.closest("a, button"),
        };
        if (!frame) frame = requestAnimationFrame(paint);
      }
      function leave() {
        pointer = null;
        previous = null;
        lens.dataset.visible = "false";
      }
      function reset() {
        cancelAnimationFrame(frame);
        frame = 0;
        ripples = [];
        lastRipple = -Infinity;
        leave();
        context.clearRect(0, 0, width, height);
      }
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(region);
      region.dataset.ripples = "enabled";
      region.addEventListener("pointermove", move, { passive: true });
      region.addEventListener("pointerleave", leave);
      window.addEventListener("scroll", reset, { passive: true });
      window.addEventListener("blur", reset);
      document.addEventListener("visibilitychange", reset);
      cleanup = () => {
        reset();
        observer.disconnect();
        delete region.dataset.ripples;
        region.removeEventListener("pointermove", move);
        region.removeEventListener("pointerleave", leave);
        window.removeEventListener("scroll", reset);
        window.removeEventListener("blur", reset);
        document.removeEventListener("visibilitychange", reset);
      };
    }
    configure();
    fine.addEventListener("change", configure);
    reduced.addEventListener("change", configure);
    forced.addEventListener("change", configure);
    return () => {
      cleanup();
      fine.removeEventListener("change", configure);
      reduced.removeEventListener("change", configure);
      forced.removeEventListener("change", configure);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="hero-ripples" aria-hidden="true" />
      <div ref={cursorRef} className="hero-cursor" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
