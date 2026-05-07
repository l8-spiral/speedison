"use client";
import { HeroScrub, ActOverlay, HotSpotLayer, HeroStatic } from "@/components/hero-scrub";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StageChapter, PopsBangsChapter, EmissionsChapter, ExhaustChapter } from "@/components/chapter/chapters";
import { PortfolioGallery } from "@/components/ui/PortfolioGallery";
import { FAQ } from "@/components/ui/FAQ";

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

      <section id="tjanster">
        <StageChapter />
        <PopsBangsChapter />
        <EmissionsChapter />
        <ExhaustChapter />
      </section>

      <PortfolioGallery />
      <FAQ />
    </main>
  );
}
