import type { ServiceSlug } from "./pricing";

// Hot-spot positions on the exploded-view frame at the end of the hero scroll.
// Coordinates are percentages of the canvas: x=0 is left edge, y=0 is top.
//
// IMPORTANT: these values have NOT been measured against the actual hero
// video. They are reasonable starting positions for a 5-spot exploded car
// (engine bay center, exhaust rear-right, underbody center-bottom, emissions
// stack mid-left, ECU above engine). The real video shows the car lifted on
// the workshop hoist with parts splaying outward — refine by:
//
//   1. cd web && node scripts/extract-frames.mjs scener/<video>.mp4
//   2. open web/public/frames/1280w/frame-440.webp (or any frame near the
//      end of Akt III — see ACT_RANGES.III in lib/frames.ts)
//   3. visually identify each part listed below and update x/y
//   4. test in dev: npm run dev → scroll to bottom of hero → hover spots
//
// Track this in T45 (Hero video swap) when the final video lands.
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
