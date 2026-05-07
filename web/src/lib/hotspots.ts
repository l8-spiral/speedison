import type { ServiceSlug } from "./pricing";

// Coordinates are percentages of the canvas. Confirm against final hero video later (T45).
export type HotSpotPosition = {
  id: string;
  service: ServiceSlug | "emissionsOff";   // "emissionsOff" maps to multi-select in configurator
  x: number; // 0..100 (% from left)
  y: number; // 0..100 (% from top)
  label: string;
};

export const HOTSPOTS: HotSpotPosition[] = [
  { id: "engine",    service: "stage1",       x: 50, y: 38, label: "Stage 1 / Stage 2" },
  { id: "exhaust",   service: "popsBangs",    x: 75, y: 65, label: "Pops & Bangs" },
  { id: "underbody", service: "exhaust",      x: 50, y: 75, label: "Avgassystem" },
  { id: "emissions", service: "emissionsOff", x: 35, y: 60, label: "EGR/DPF/AdBlue/NOx" },
  { id: "ecu",       service: "stage2",       x: 60, y: 35, label: "ECU-flash" },
];
