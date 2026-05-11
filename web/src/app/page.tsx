"use client";
import { HeroScrub, ActOverlay, HotSpotLayer, HeroStatic } from "@/components/hero-scrub";
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";
import { ParallaxLayer } from "@/components/effects/ParallaxLayer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { StageChapter, PopsBangsChapter, EmissionsChapter, ExhaustChapter } from "@/components/chapter/chapters";
import {
  StagePresentation,
  PopsPresentation,
  EmissionsPresentation,
  ExhaustPresentation,
} from "@/components/chapter/presentations";
import { FAQ } from "@/components/ui/FAQ";
import { Configurator } from "@/components/configurator/Configurator";
import { useConfiguratorStore } from "@/components/configurator/store";
import { track } from "@/lib/analytics";

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
              track("hotspot_clicked", { service: s });
              preselect(s);
              document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </HeroScrub>
      </ErrorBoundary>

      <section id="tjanster">
        <StagePresentation />
        <StageChapter />
        <PopsPresentation />
        <PopsBangsChapter />
        <EmissionsPresentation />
        <EmissionsChapter />
        <ExhaustPresentation />
        <ExhaustChapter />
      </section>

      <Configurator />
      <FAQ />
    </main>
  );
}
