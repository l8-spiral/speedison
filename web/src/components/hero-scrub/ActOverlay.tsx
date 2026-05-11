"use client";
import { actForProgress, ACT_RANGES, type Act } from "@/lib/frames";
import { HERO } from "@/lib/content";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroProgress } from "./HeroScrub";

function progressWithinAct(progress: number, act: Act): number {
  const range = ACT_RANGES[act];
  return Math.max(0, Math.min(1, (progress - range.from) / (range.to - range.from)));
}

export function ActOverlay() {
  const progress = useHeroProgress();
  const currentAct = actForProgress(progress);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        {currentAct === "I" && <ActI key="I" innerP={progressWithinAct(progress, "I")} />}
        {currentAct === "II" && <ActII key="II" innerP={progressWithinAct(progress, "II")} />}
        {currentAct === "III" && <ActIII key="III" innerP={progressWithinAct(progress, "III")} />}
      </AnimatePresence>
    </div>
  );
}

function ActI({ innerP }: { innerP: number }) {
  // Fade in 0–0.25, hold 0.25–0.85, fade out 0.85–1.0
  const fadeIn = Math.min(1, innerP / 0.25);
  const fadeOut = innerP > 0.85 ? Math.max(0, 1 - (innerP - 0.85) / 0.15) : 1;
  const opacity = fadeIn * fadeOut;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-24"
      style={{ opacity }}
      initial={{ x: -40 }} animate={{ x: 0 }}
      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
    >
      <h1 className="text-4xl md:text-6xl lg:text-7xl text-copper-100 font-light leading-[1.05] tracking-[0.02em]">
        {HERO.taglineLine1}
      </h1>
      <h1 className="text-4xl md:text-6xl lg:text-7xl text-copper-300 font-light leading-[1.05] tracking-[0.02em] italic mt-2">
        {HERO.taglineLine2}
      </h1>
      <p className="mt-8 max-w-lg text-stone-400 text-base md:text-lg leading-relaxed">
        {HERO.subHeadline}
      </p>
    </motion.div>
  );
}

function ActII({ innerP }: { innerP: number }) {
  const items = HERO.actII.items;
  const visibleCount = Math.min(items.length, Math.floor(innerP * (items.length + 1)));
  return (
    <motion.div
      className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-right"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <span className="text-xs tracking-[0.3em] uppercase text-copper-300 mb-2">
        {HERO.actII.label}
      </span>
      {items.map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: i < visibleCount ? 1 : 0, x: i < visibleCount ? 0 : 30 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Act III intentionally renders nothing — the hotspots layer handles
// interaction in the final scrub stage; the previous "Hovra över delarna"
// hint was removed per design.
function ActIII(_props: { innerP: number }) {
  return null;
}
