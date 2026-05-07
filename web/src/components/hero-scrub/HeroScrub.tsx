"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const ProgressCtx = createContext(0);
export const useHeroProgress = () => useContext(ProgressCtx);

function pickWidth(): 1920 | 1280 | 720 {
  if (typeof window === "undefined") return 1280;
  const w = window.innerWidth;
  if (w >= 1600) return 1920;
  if (w >= 900)  return 1280;
  return 720;
}

export function HeroScrub({ children }: { children?: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState<1920 | 1280 | 720>(1280);

  useEffect(() => { setWidth(pickWidth()); }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setProgress(0.5); return; }

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={stageRef}
      className="relative"
      style={{ height: "500vh" }}
      data-progress={progress}
    >
      <ProgressCtx.Provider value={progress}>
        <div
          ref={stickyRef}
          className="sticky top-0 h-screen w-full overflow-hidden bg-noir-900"
        >
          <FrameSequence progress={progress} width={width} />
          {children}
        </div>
      </ProgressCtx.Provider>
    </section>
  );
}
