"use client";
import { useHeroProgress } from "./HeroScrub";
import { HotSpotMarker } from "./HotSpotMarker";
import { HOTSPOTS } from "@/lib/hotspots";
import { actForProgress, ACT_RANGES } from "@/lib/frames";
import type { ServiceSlug } from "@/lib/pricing";

type Activatable = ServiceSlug | "emissionsOff";

export function HotSpotLayer({ onActivate }: { onActivate: (service: Activatable) => void }) {
  const progress = useHeroProgress();
  const inActIII = actForProgress(progress) === "III";
  const innerP = inActIII ? (progress - ACT_RANGES.III.from) / (ACT_RANGES.III.to - ACT_RANGES.III.from) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {HOTSPOTS.map((h, i) => {
        const visible = inActIII && innerP > 0.6 + i * 0.05;
        return (
          <HotSpotMarker
            key={h.id}
            x={h.x} y={h.y}
            label={h.label}
            service={h.service}
            visible={visible}
            onActivate={onActivate}
          />
        );
      })}
    </div>
  );
}
