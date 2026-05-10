import { ChapterScene } from "./ChapterScene";

export function StageChapter() {
  return (
    <ChapterScene
      id="stage"
      eyebrow="Kapitel I"
      title="Stage 1 & Stage 2"
      body="Vi optimerar styrenheten för märkbart mer effekt och vridmoment, mjukare gasrespons och en motor som plötsligt känns vaken. Stage 2 kombineras med fysiska modifieringar för maximal vinst."
      bullets={[
        "+30 till +100 hk beroende på modell",
        "Bättre bränsleekonomi vid normal körning",
        "Originalfilen sparas — alltid återställbart",
      ]}
      serviceSlugs={["stage1", "stage2"]}
      align="left"
    />
  );
}

export function PopsBangsChapter() {
  return (
    <ChapterScene
      id="pops"
      eyebrow="Kapitel II"
      title="Pops & Bangs"
      body="Decel-pops och retardations-smällar kalibreras i mjukvaran för att ge ljudet du vill ha utan att skada motorn. Vi väljer karaktär: lågmält muller eller fyrverkeri."
      bullets={[
        "Karaktär anpassas till bil och smak",
        "Påverkar inte garantin på avgassystemet",
      ]}
      serviceSlugs={["popsBangs"]}
      align="right"
    />
  );
}

export function EmissionsChapter() {
  return (
    <ChapterScene
      id="emissions"
      eyebrow="Kapitel III"
      title="EGR · DPF · AdBlue · NOx"
      body="Mjukvaruanpassningar för att exkludera utsläppskomponenter — där det är lagligt och lämpligt. Vi går igenom konsekvenser och garantipåverkan innan vi börjar."
      serviceSlugs={["egrOff", "dpfOff", "adblueOff", "noxOff"]}
      align="left"
    />
  );
}

export function ExhaustChapter() {
  return (
    <ChapterScene
      id="avgas"
      eyebrow="Kapitel IV"
      title="Avgassystem"
      body="Muffler delete eller specialtillverkat ombygge av befintligt avgassystem. Bättre flöde, bättre ljud och en silhuett som matchar resten av bilen."
      serviceSlugs={["exhaust"]}
      align="right"
    />
  );
}
