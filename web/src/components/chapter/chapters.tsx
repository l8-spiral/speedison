import { ChapterScene } from "./ChapterScene";
import { ChapterScrub } from "./ChapterScrub";

// Each chapter renders <ChapterScrub> by default. ChapterScrub falls back to
// the equivalent <ChapterScene> (static text on dark) when:
//   - this chapter's video doesn't exist for the viewer's aspect (e.g. mobile
//     visiting before 9:16 clips are generated), OR
//   - prefers-reduced-motion is on.

const STAGE = {
  id: "stage",
  eyebrow: "Kapitel I",
  title: "Stage 1 & Stage 2",
  body: "Vi optimerar styrenheten för märkbart mer effekt och vridmoment, mjukare gasrespons och en motor som plötsligt känns vaken. Stage 2 kombineras med fysiska modifieringar för maximal vinst.",
  bullets: [
    "+30 till +100 hk beroende på modell",
    "Bättre bränsleekonomi vid normal körning",
    "Originalfilen sparas — alltid återställbart",
  ],
  serviceSlugs: ["stage1", "stage2"] as const,
  align: "left" as const,
};

const POPS = {
  id: "pops",
  eyebrow: "Kapitel II",
  title: "Pops & Bangs",
  body: "Decel-pops och retardations-smällar kalibreras i mjukvaran för att ge ljudet du vill ha utan att skada motorn. Vi väljer karaktär: lågmält muller eller fyrverkeri.",
  bullets: [
    "Karaktär anpassas till bil och smak",
    "Påverkar inte garantin på avgassystemet",
  ],
  serviceSlugs: ["popsBangs"] as const,
  align: "right" as const,
};

const EMISSIONS = {
  id: "emissions",
  eyebrow: "Kapitel III",
  title: "EGR · DPF · AdBlue · NOx",
  body: "Mjukvaruanpassningar för att exkludera utsläppskomponenter — där det är lagligt och lämpligt. Vi går igenom konsekvenser och garantipåverkan innan vi börjar.",
  serviceSlugs: ["egrOff", "dpfOff", "adblueOff", "noxOff"] as const,
  align: "left" as const,
};

const EXHAUST = {
  id: "avgas",
  eyebrow: "Kapitel IV",
  title: "Avgassystem",
  body: "Muffler delete eller specialtillverkat ombygge av befintligt avgassystem. Bättre flöde, bättre ljud och en silhuett som matchar resten av bilen.",
  serviceSlugs: ["exhaust"] as const,
  align: "right" as const,
};

export function StageChapter() {
  return <ChapterScrub slug="stage" {...STAGE} fallback={<ChapterScene {...STAGE} />} />;
}

export function PopsBangsChapter() {
  return <ChapterScrub slug="pops" {...POPS} fallback={<ChapterScene {...POPS} />} />;
}

export function EmissionsChapter() {
  return (
    <ChapterScrub slug="emissions" {...EMISSIONS} fallback={<ChapterScene {...EMISSIONS} />} />
  );
}

export function ExhaustChapter() {
  return <ChapterScrub slug="exhaust" {...EXHAUST} fallback={<ChapterScene {...EXHAUST} />} />;
}
