"use client";
import type { ServiceSlug } from "@/lib/pricing";

type Props = {
  x: number; y: number; label: string;
  service: ServiceSlug | "emissionsOff";
  visible: boolean;
  onActivate: (service: ServiceSlug | "emissionsOff") => void;
};

export function HotSpotMarker({ x, y, label, service, visible, onActivate }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onActivate(service)}
      className="absolute pointer-events-auto"
      style={{
        left: `${x}%`, top: `${y}%`,
        transform: "translate(-50%, -50%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      <span className="block w-4 h-4 rounded-full bg-copper-300 shadow-[0_0_24px_rgba(212,165,116,0.8)] animate-pulse" />
      <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs tracking-[0.2em] uppercase text-copper-200 bg-noir-900/80 px-3 py-1 rounded">
        {label}
      </span>
    </button>
  );
}
