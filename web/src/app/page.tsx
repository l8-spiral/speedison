"use client";
import { HeroScrub, ActOverlay, HotSpotLayer, HeroStatic } from "@/components/hero-scrub";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StageChapter, PopsBangsChapter, EmissionsChapter, ExhaustChapter } from "@/components/chapter/chapters";
import { PortfolioGallery } from "@/components/ui/PortfolioGallery";
import { FAQ } from "@/components/ui/FAQ";
import { Configurator } from "@/components/configurator/Configurator";
import { useConfiguratorStore } from "@/components/configurator/store";

export default function Home() {
  const preselect = useConfiguratorStore((s) => s.preselectFromHotspot);
  return (
    <main>
      <CursorSpotlight />
      <ErrorBoundary fallback={<HeroStatic />}>
        <HeroScrub>
          <ParallaxLayer />
          <ActOverlay />
          <HotSpotLayer
            onActivate={(s) => {
              preselect(s);
              document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </HeroScrub>
      </ErrorBoundary>

      <section id="tjanster">
        <StageChapter />
        <PopsBangsChapter />
        <EmissionsChapter />
        <ExhaustChapter />
      </section>

      <PortfolioGallery />
      <Configurator />
      <FAQ />
    </main>
  );
}
