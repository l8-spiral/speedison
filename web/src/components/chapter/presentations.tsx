import { ChapterPresentation } from "./ChapterPresentation";

// One presentation panel per chapter. Sits between the previous scroll-stage
// and the chapter's own scroll-stage. Sourced text — keep it tight, this is
// a transition page, not the chapter content itself.

export function StagePresentation() {
  return (
    <ChapterPresentation
      eyebrow="Innan — Kapitel I"
      title="Vad är Stage-optimering?"
      intro="Stage 1 och Stage 2 är ECU-anpassningar som låser upp den effekt och vridmoment biltillverkaren lämnat på bordet. Stage 1 görs i mjukvara; Stage 2 kombineras med hårdvara — luftfilter, downpipe eller intercooler — för större vinst."
      items={[
        {
          label: "Vad vi gör",
          value:
            "Vi flashar din styrenhet med en kalibrerad fil anpassad efter motor, bränsle och körprofil. Originalfilen sparas alltid.",
        },
        {
          label: "Process",
          value:
            "Logg-körning före och efter, dyno-test (vid Stage 2), avstämning i steg tills kurvan är ren från under- till övervarv.",
        },
        {
          label: "Tidsåtgång",
          value:
            "Stage 1: 2–4 timmar med bilen kvar i verkstaden. Stage 2: en arbetsdag.",
        },
        {
          label: "Resultat",
          value:
            "+30 till +100 hk beroende på modell. Mjukare gasrespons, snabbare igångdragning, ofta lägre förbrukning vid normal körning.",
        },
      ]}
      serviceSlugs={["stage1", "stage2"]}
    />
  );
}

export function PopsPresentation() {
  return (
    <ChapterPresentation
      eyebrow="Innan — Kapitel II"
      title="Vad är Pops & Bangs?"
      intro="Decel-pops och retardations-smällar är karakteristiska smällar som kommer från avgasröret vid gasretardation. Vi kalibrerar effekten i ECU:n så ljudet blir det du vill ha — utan att riskera motor eller katalysator."
      items={[
        {
          label: "Vad vi gör",
          value:
            "Mjukvarujustering av insprutning och tändtidpunkt under retardation, så små mängder bränsle förbränns i avgassystemet.",
        },
        {
          label: "Process",
          value:
            "Vi pratar igenom karaktär (subtilt muller eller fyrverkeri), justerar, lyssnar, finjusterar tills det matchar.",
        },
        {
          label: "Tidsåtgång",
          value: "1–2 timmar inklusive provkörning och avstämning.",
        },
        {
          label: "Resultat",
          value:
            "Personlighet i avgasljudet. Påverkar inte motorns hälsa när det är rätt gjort — vi håller smällarna inom säkra parametrar.",
        },
      ]}
      serviceSlugs={["popsBangs"]}
    />
  );
}

export function EmissionsPresentation() {
  return (
    <ChapterPresentation
      eyebrow="Innan — Kapitel III"
      title="EGR · DPF · AdBlue · NOx"
      intro="Mjukvaruanpassningar för att exkludera utsläppskomponenter där det är lagligt och tekniskt motiverat. Vi går alltid igenom konsekvenser, garantipåverkan och miljö innan vi börjar — det här är inte en automatisk åtgärd, det är ett samtal."
      items={[
        {
          label: "Vad vi gör",
          value:
            "Vi exkluderar funktionen i ECU:n så bilen inte längre styr eller kontrollerar den valda komponenten — utan att felkoder uppstår.",
        },
        {
          label: "Process",
          value:
            "Genomgång av lagligt sammanhang (banbil, exportbil, etc.), val av vilka system som ska bort, mjukvaruändring, testkörning.",
        },
        {
          label: "Tidsåtgång",
          value:
            "1–3 timmar beroende på vilka system som ska bort. Mer komplexa märken (vissa Mercedes/Audi) kan ta längre.",
        },
        {
          label: "Resultat",
          value:
            "Inga fellampor från de borttagna systemen. Ofta lägre förbrukning och längre livslängd på dyrare komponenter.",
        },
      ]}
      serviceSlugs={["egrOff", "dpfOff", "adblueOff", "noxOff"]}
    />
  );
}

export function ExhaustPresentation() {
  return (
    <ChapterPresentation
      eyebrow="Innan — Kapitel IV"
      title="Custom-byggt avgassystem"
      intro="Specialtillverkat avgassystem från muffler delete till komplett catback. Ändrad karaktär, bättre flöde, ofta märkbar effektökning — och en silhuett som matchar resten av bilen."
      items={[
        {
          label: "Vad vi gör",
          value:
            "Designar, böjer, svetsar och installerar nytt avgassystem med valda komponenter (mid-pipe, ljuddämpare, ändrör).",
        },
        {
          label: "Process",
          value:
            "Konsultation om karaktär och budget, mätning på bilen, design, tillverkning i rostfritt eller titan, installation och avstämning.",
        },
        {
          label: "Tidsåtgång",
          value:
            "1–2 arbetsdagar för en komplett catback-installation; muffler delete på halv dag.",
        },
        {
          label: "Resultat",
          value:
            "Djupare ljud, bättre flöde, +5–15 hk i de flesta fall, viktreduktion och en synlig uppgradering bakifrån.",
        },
      ]}
      serviceSlugs={["exhaust"]}
    />
  );
}
