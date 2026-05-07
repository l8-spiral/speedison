export type ServiceSlug =
  | "stage1" | "stage2" | "popsBangs" | "egrOff"
  | "dpfOff" | "adblueOff" | "noxOff" | "exhaust";

export type Service = {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  group: "tuning" | "sound" | "emissions" | "exhaust";
  priceFrom: number | null;     // null = quote-only
  priceTo: number | null;
  description: string;
};

export const SERVICES: readonly Service[] = [
  { slug: "stage1",    name: "Motoroptimering Stage 1", shortName: "Stage 1", group: "tuning",
    priceFrom: null, priceTo: null,
    description: "ECU-optimering steg 1: ökad effekt och vridmoment, mjukare gasrespons." },
  { slug: "stage2",    name: "Motoroptimering Stage 2", shortName: "Stage 2", group: "tuning",
    priceFrom: null, priceTo: null,
    description: "ECU-optimering steg 2: kombineras med fysiska modifieringar för maximal vinst." },
  { slug: "popsBangs", name: "Pops & Bangs",            shortName: "Pops & Bangs", group: "sound",
    priceFrom: 2995, priceTo: null,
    description: "Decel-pops och retardations-smällar i avgaserna." },
  { slug: "egrOff",    name: "EGR-OFF",                 shortName: "EGR", group: "emissions",
    priceFrom: 1995, priceTo: null,
    description: "EGR-funktion exkluderas i mjukvaran för att minska sotbildning." },
  { slug: "dpfOff",    name: "DPF-OFF",                 shortName: "DPF", group: "emissions",
    priceFrom: 2495, priceTo: null,
    description: "Partikelfilter-funktion deaktiveras." },
  { slug: "adblueOff", name: "AdBlue-OFF",              shortName: "AdBlue", group: "emissions",
    priceFrom: 4495, priceTo: null,
    description: "AdBlue-system exkluderas." },
  { slug: "noxOff",    name: "NOx-OFF",                 shortName: "NOx", group: "emissions",
    priceFrom: 1995, priceTo: null,
    description: "NOx-sensor exkluderas i mjukvaran." },
  { slug: "exhaust",   name: "Avgassystem-modifiering", shortName: "Avgassystem", group: "exhaust",
    priceFrom: null, priceTo: null,
    description: "Muffler delete eller ombygge av befintligt avgassystem." },
];

const BY_SLUG = new Map(SERVICES.map(s => [s.slug, s]));

export function getService(slug: ServiceSlug): Service | undefined {
  return BY_SLUG.get(slug);
}

export function formatSEK(amount: number): string {
  // toLocaleString('sv-SE') returns U+00A0 non-breaking spaces; replace with U+0020 regular spaces for stability
  return amount.toLocaleString("sv-SE").replace(/ /g, " ");
}

export function formatPriceRange(from: number | null, to: number | null): string {
  if (from === null && to === null) return "Begär offert";
  if (from !== null && to === null) return `Från ${formatSEK(from)} kr`;
  if (from !== null && to !== null) return `${formatSEK(from)} – ${formatSEK(to)} kr`;
  return "Begär offert";
}

export function getPriceRange(slugs: ServiceSlug[]): { from: number | null; to: number | null } {
  const selected = slugs.map(s => BY_SLUG.get(s)).filter(Boolean) as Service[];
  if (selected.length === 0) return { from: null, to: null };
  const fromSum = selected.reduce<number | null>(
    (acc, s) => (acc === null || s.priceFrom === null ? null : acc + s.priceFrom),
    0
  );
  const toSum = selected.reduce<number | null>(
    (acc, s) => (acc === null || s.priceTo === null ? null : acc + s.priceTo),
    0
  );
  return { from: fromSum, to: toSum };
}
