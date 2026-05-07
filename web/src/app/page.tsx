"use client";
import { HeroScrub, ActOverlay, HotSpotLayer, HeroStatic } from "@/components/hero-scrub";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function Home() {
  return (
    <main>
      <CursorSpotlight />
      <ErrorBoundary fallback={<HeroStatic />}>
        <HeroScrub>
          <ParallaxLayer />
          <ActOverlay />
          <HotSpotLayer onActivate={(s) => { console.log("hot-spot:", s); }} />
        </HeroScrub>
      </ErrorBoundary>
      <section className="min-h-screen flex items-center justify-center bg-noir-900">
        <p className="text-copper-300">More to come…</p>
      </section>
    </main>
  );
}
