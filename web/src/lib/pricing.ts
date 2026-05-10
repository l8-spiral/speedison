export type ServiceSlug =
  | "stage1" | "stage2" | "popsBangs" | "egrOff"
  | "dpfOff" | "adblueOff" | "noxOff" | "exhaust";

export type Service = {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  group: "tuning" | "sound" | "emissions" | "exhaust";
  description: string;
};

// All pricing is per individual quote. The site shows information; the
// workshop sets the actual price after seeing the car.
export const SERVICES: readonly Service[] = [
  {
    slug: "stage1",
    name: "Motoroptimering Stage 1",
    shortName: "Stage 1",
    group: "tuning",
    description: "ECU-optimering steg 1: ökad effekt och vridmoment, mjukare gasrespons.",
  },
  {
    slug: "stage2",
    name: "Motoroptimering Stage 2",
    shortName: "Stage 2",
    group: "tuning",
    description: "ECU-optimering steg 2: kombineras med fysiska modifieringar för maximal vinst.",
  },
  {
    slug: "popsBangs",
    name: "Pops & Bangs",
    shortName: "Pops & Bangs",
    group: "sound",
    description: "Decel-pops och retardations-smällar i avgaserna.",
  },
  {
    slug: "egrOff",
    name: "EGR-OFF",
    shortName: "EGR",
    group: "emissions",
    description: "EGR-funktion exkluderas i mjukvaran för att minska sotbildning.",
  },
  {
    slug: "dpfOff",
    name: "DPF-OFF",
    shortName: "DPF",
    group: "emissions",
    description: "Partikelfilter-funktion deaktiveras.",
  },
  {
    slug: "adblueOff",
    name: "AdBlue-OFF",
    shortName: "AdBlue",
    group: "emissions",
    description: "AdBlue-system exkluderas.",
  },
  {
    slug: "noxOff",
    name: "NOx-OFF",
    shortName: "NOx",
    group: "emissions",
    description: "NOx-sensor exkluderas i mjukvaran.",
  },
  {
    slug: "exhaust",
    name: "Avgassystem-modifiering",
    shortName: "Avgassystem",
    group: "exhaust",
    description: "Muffler delete eller ombygge av befintligt avgassystem.",
  },
];

const BY_SLUG = new Map(SERVICES.map((s) => [s.slug, s]));

export function getService(slug: ServiceSlug): Service | undefined {
  return BY_SLUG.get(slug);
}
