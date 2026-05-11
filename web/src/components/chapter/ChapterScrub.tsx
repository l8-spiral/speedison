"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "@/components/hero-scrub/FrameSequence";
import {
  getChapterSequence,
  type ChapterSlug,
  type ChapterAspect,
  type FrameWidth,
} from "@/lib/frames";
import type { ServiceSlug } from "@/lib/pricing";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function pickWidth(): FrameWidth {
  if (typeof window === "undefined") return 1280;
  const w = window.innerWidth;
  if (w >= 1600) return 1920;
  if (w >= 900) return 1280;
  return 720;
}

function pickAspect(): ChapterAspect {
  if (typeof window === "undefined") return "16x9";
  return window.matchMedia("(orientation: portrait)").matches ? "9x16" : "16x9";
}

type Props = {
  id: string;
  slug: ChapterSlug;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: readonly string[];
  serviceSlugs: readonly ServiceSlug[];
  align?: "left" | "right";
  /**
   * Static <ChapterScene> rendered when this viewport has no matching
   * chapter-aspect sequence (mobile + only desktop frames available, etc.)
   * or when prefers-reduced-motion is on.
   */
  fallback: ReactNode;
};

export function ChapterScrub(p: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [aspect, setAspect] = useState<ChapterAspect>("16x9");
  const [width, setWidth] = useState<FrameWidth>(1280);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAspect(pickAspect());
    setWidth(pickWidth());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);
  }, []);

  const config = ready ? getChapterSequence(p.slug, aspect) : undefined;

  useEffect(() => {
    if (reduced) return;
    if (!config) return;
    const stage = stageRef.current;
    if (!stage) return;

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => trigger.kill();
  }, [reduced, config]);

  // Before hydration completes, render the static fallback. Same behaviour as
  // when we have no matching aspect, so the layout doesn't shift on hydration.
  if (!ready) return <>{p.fallback}</>;
  if (reduced) return <>{p.fallback}</>;
  if (!config) return <>{p.fallback}</>;

  return (
    <section ref={stageRef} id={p.id} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-noir-900">
        <FrameSequence progress={progress} width={width} config={config} />

        {/* dark gradient — keeps text legible over the moving video */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            p.align === "right"
              ? "bg-gradient-to-l from-noir-900 via-noir-900/70 to-transparent"
              : "bg-gradient-to-r from-noir-900 via-noir-900/70 to-transparent"
          }`}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          className={`relative z-10 max-w-3xl px-6 md:px-12 flex flex-col justify-center h-full ${
            p.align === "right" ? "ml-auto pr-12 md:pr-24" : "pl-12 md:pl-24"
          }`}
        >
          <span className="text-xs tracking-[0.3em] uppercase text-copper-300">{p.eyebrow}</span>
          <h2
            className="text-4xl md:text-6xl text-stone-100 mt-2 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {p.title}
          </h2>
          <p className="mt-6 text-stone-400 text-lg leading-relaxed">{p.body}</p>
          {p.bullets && (
            <ul className="mt-6 space-y-2 text-stone-300">
              {p.bullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            <a
              href="#konfigurator"
              data-services={p.serviceSlugs.join(",")}
              className="inline-block px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition text-sm tracking-[0.2em] uppercase"
            >
              Begär offert
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
