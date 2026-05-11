"use client";
import { useEffect, useMemo, useRef } from "react";
import {
  HERO_SEQUENCE,
  frameForProgress,
  type FrameSequenceConfig,
  type FrameWidth,
} from "@/lib/frames";

type Props = {
  progress: number; // 0..1, scroll-driven
  width: FrameWidth;
  /** Defaults to HERO_SEQUENCE for backwards compat with the existing hero. */
  config?: FrameSequenceConfig;
  className?: string;
};

const EAGER_COUNT = 30;

export function FrameSequence({ progress, width, config = HERO_SEQUENCE, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const lastDrawnRef = useRef<number>(-1);
  const { totalFrames, pathFor } = config;

  // Wipe the cache and last-drawn marker whenever the config changes — otherwise
  // a chapter mounting after the hero would reuse hero frames.
  useEffect(() => {
    imagesRef.current = new Map();
    lastDrawnRef.current = -1;
  }, [config, width]);

  // Lazy-load all frames in the background after mount
  useEffect(() => {
    let cancelled = false;
    const queue = Array.from({ length: totalFrames }, (_, i) => i);
    let inflight = 0;
    const MAX_PARALLEL = 6;

    const loadOne = (idx: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          imagesRef.current.set(idx, img);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = pathFor(width, idx);
      });

    async function pump() {
      while (queue.length && !cancelled) {
        if (inflight >= MAX_PARALLEL) {
          await new Promise((r) => setTimeout(r, 16));
          continue;
        }
        const idx = queue.shift()!;
        inflight++;
        loadOne(idx).then(() => {
          inflight--;
        });
      }
    }
    pump();
    return () => {
      cancelled = true;
    };
  }, [width, totalFrames, pathFor]);

  // Render current frame on progress change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const idx = frameForProgress(progress, totalFrames);
    if (idx === lastDrawnRef.current) return;

    let target = idx;
    let img = imagesRef.current.get(target);
    if (!img) {
      // Find nearest available
      for (let d = 1; d < totalFrames && !img; d++) {
        const before = imagesRef.current.get(target - d);
        const after = imagesRef.current.get(target + d);
        img = before || after;
        if (img) target = before ? target - d : target + d;
      }
    }
    if (!img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    lastDrawnRef.current = target;
  }, [progress, totalFrames]);

  const eagerLinks = useMemo(
    () => Array.from({ length: Math.min(EAGER_COUNT, totalFrames) }, (_, i) => pathFor(width, i)),
    [width, totalFrames, pathFor]
  );

  return (
    <>
      {eagerLinks.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className ?? "absolute inset-0 w-full h-full object-cover"}
      />
    </>
  );
}
