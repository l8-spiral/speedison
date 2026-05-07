"use client";
import { useEffect, useRef } from "react";

export function CursorSpotlight({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // mobile/touch
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const { x, y } = mouseRef.current;
      const grad = ctx.createRadialGradient(x, y, 100, x, y, 600);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.4, "rgba(0,0,0,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30"
    />
  );
}
