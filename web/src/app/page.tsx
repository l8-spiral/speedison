"use client";
import { HeroScrub, ActOverlay, HotSpotLayer } from "@/components/hero-scrub";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";

export default function Home() {
  return (
    <main>
      <CursorSpotlight />
      <HeroScrub>
        <ActOverlay />
        <HotSpotLayer onActivate={(s) => { console.log("hot-spot:", s); }} />
      </HeroScrub>
      <section className="min-h-screen flex items-center justify-center bg-noir-900">
        <p className="text-copper-300">More to come…</p>
      </section>
    </main>
  );
}
