# Speedison.se — Redesign Design Document

**Datum:** 2026-05-07 (rev. 2026-05-08 — Railway pivot)
**Status:** Utkast för granskning
**Repo:** https://github.com/l8-spiral/speedison.git
**Domän:** speedison.se
**Nuvarande:** WordPress hostad på Misshosting

> **2026-05-08 ARKITEKTURREVISION:** Vi har bytt från hybrid-stack (Vercel frontend + Misshosting PHP/MySQL backend) till **enhetlig Railway-deploy** (Next.js + Prisma + MySQL i ett separat Railway-projekt) plus **Resend** för transaktionsmejl. PHP-backenden, GitHub Actions FTP-deploy, och Misshosting som backend-värd är borttagna. Misshosting används endast för domänregistrering/DNS och eventuellt MX för inkommande e-post (oförändrat). Berörda sektioner: §6, §10, §15, §17. Plan-uppgifter berörda: T9, T11, T33–T35, T43–T44.

---

## 1. Översikt och syfte

Speedison driver en garage- och optimeringsverkstad i Kungsängen för bilar. Den nuvarande sidan är en standard WordPress-sajt som inte gör företaget rättvisa visuellt. Den nya sidan ska:

- Bygga varumärket genom en filmisk, scroll-driven storytelling-upplevelse som ger en omedelbar wow-känsla
- Generera kvalificerade offertförfrågningar via en multi-stegs konfigurator som mappar bilmodell × tjänst → uppskattat prisspann

Bilförsäljning och lackering exkluderas från den nya sidan.

## 2. Mål och framgångskriterier

| Mål | Mätvärde |
|---|---|
| Wow-faktor | Besökare scrollar genom hela hero-sekvensen (mätt som event `hero_completed`) |
| Lead-konvertering | Lead/besökare-ratio över 2 % efter 30 dagar |
| Prestanda | Lighthouse mobil ≥ 90 på alla 4 kategorier; LCP < 2,5 s på 4G |
| Tillgänglighet | WCAG 2.1 AA på huvudsidan och konfiguratorn (axe-core utan brott) |
| Tid till live | 4 veckor från projektstart |

## 3. Målgrupp

Primär: Bilentusiaster 25–40 år som äger högpresterande bilar (Mercedes-AMG, Audi RS, BMW M, VW Golf R-klass). De vill ha mer effekt, dramatiskt ljud (Pops & Bangs) och anpassningar utan kompromiss. Sekundärt: yrkesförare som behöver emissions-mods, men dessa lockas av samma estetik.

## 4. Varumärke och ton

**A+D — Luxe Performance × Cinematic Noir.**

- Färger: Djupt svart (#0a0a0f), varma koppar/champagne-accenter (#d4a574), dovt off-white text (#f0e0c8). Ingen renvit.
- Typografi: Serif-displayfont för rubriker (Georgia eller Cormorant Garamond), sans-serif (Inter) för brödtext.
- Tempo: Lugnt, slow-motion. Övergångar i 600–900 ms easings, inte snabba. Filmiska andningspauser mellan akter.
- Referenser: Jesko Jets (parallax + premium), Drive (filmen, varma highlights), Porsche Design.

## 5. Storytelling-koncept (hero-scrub)

Hero-scrubbas på en 15-sekunders AI-genererad video som scrubbas i takt med scroll. Tre akter:

| Tid | Akt | Händelse | Overlay |
|---|---|---|---|
| 0–5 s | I — Ankomst | Bilen parkeras utanför, garageporten öppnas | Tagline + sub-headline + sticky CTA |
| 5–10 s | II — Verkstaden | Bilen parkeras vid lyften | 4 tjänste-titlar fadar in i sekvens |
| 10–15 s | III — Anatomin | Bilen lyfts, delar exploderar | 5 hot-spots på delarna, accent-linjer ritas |

Efter hero släpper sticky-scrollen. Varje tjänste-kapitel får sin egen fullskärmssektion med atmos-bakgrundsvideo (loopande, dämpad). Kapitel-sektionerna leder till portföljgalleri, FAQ, och slutligen konfigurator-CTA.

## 6. Arkitektur och stack

Allt — frontend, API, databas — körs i ett **separat Railway-projekt** (egen instance, egen MySQL-plugin). Mejlnotifikationer via **Resend**. Inga separata Vercel-, Misshosting- eller PHP-deploys.

### Repostruktur

```
speedison/
├── web/                              Next.js (Node-runtime, deployt till Railway)
│   ├── src/app/
│   │   ├── page.tsx                  hero-scrub + storytelling
│   │   ├── konfigurator/
│   │   ├── kontakt/
│   │   ├── tack/
│   │   ├── integritet/
│   │   └── api/
│   │       ├── leads/route.ts        POST /api/leads (Next.js route handler)
│   │       └── contact/route.ts      POST /api/contact
│   ├── src/components/
│   │   ├── hero-scrub/
│   │   ├── effects/                  cursor-spotlight, parallax, particles
│   │   ├── chapter/
│   │   ├── configurator/
│   │   └── ui/                       21st.dev-wrappers
│   ├── src/lib/
│   │   ├── pricing.ts                tjänster + prisspann (hårdkodat)
│   │   ├── content.ts
│   │   ├── api.ts                    klient
│   │   ├── prisma.ts                 PrismaClient singleton
│   │   ├── mailer.ts                 Resend-wrapper
│   │   └── ratelimit.ts              IP-hash + lead-räknare
│   ├── prisma/
│   │   ├── schema.prisma             Lead + Contact + IpRate models
│   │   └── migrations/               Prisma migrate-historik
│   └── public/
│       ├── frames/                   WebP-sekvens (~450 frames × 3 upplösningar)
│       └── gallery/                  kundbils-foton
├── docs/superpowers/specs/
├── scripts/
│   ├── extract-frames.sh             ffmpeg: video → WebP-sekvens
│   └── fetch-legacy-assets.sh        curl gamla sajten
├── railway.json                      Railway build/deploy-konfig (root-cmd, healthcheck)
└── .github/workflows/
    └── ci.yml                        lint, test, lighthouse (deploy görs av Railway, inte Actions)
```

### Frontend-stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- GSAP + ScrollTrigger för scroll-tied frame-scrubbing och timeline-animationer
- Lenis för smooth scroll
- Framer Motion för micro-interaktioner
- Canvas 2D (ren, ingen Three.js i v1) för cursor-spotlight och parallax-particles
- 21st.dev-komponenter via deras MCP för navbar, footer, knappar, formulärfält, modals, accordions
- Howler.js för ljudtoggle
- Zod för klient- och server-validering (samma schema delas mellan klient och route handler)
- Zustand för global state (configurator, audio)

### Backend-stack

- **Next.js Route Handlers** (Node.js-runtime) för `/api/leads` och `/api/contact`
- **Prisma ORM** för typad DB-åtkomst + automatiska migrations
- **MySQL** som Railway-plugin i samma projekt (privat nätverk → ingen extern exponering)
- **Resend** för transaktionsmejl (e-postnotis till `info@speedison.se` vid varje lead)
- IP-hashning + rate-limit i samma DB (en `IpRate`-tabell hanterad av Prisma)
- Rate-limit: max 5 leads/timme per IP-hash; honeypot-fält tystar bots
- All validering sker både i klienten (Zod) och servern (samma Zod-schema importeras)

### Deploy-flöde

- **Repo:** En Railway-service kopplad till `l8-spiral/speedison` GitHub-repo
- **Build:** Railway kör `npm install && npx prisma migrate deploy && npm run build` på push till `main`
- **Run:** Railway kör `npm run start` på en Node-instance, healthcheck mot `/`
- **DB-migrations:** Körs automatiskt vid deploy via `prisma migrate deploy` (ingen manuell SQL)
- **Domän:** `speedison.se` A-record + `www` CNAME → Railway custom domain. SSL automatiskt.
- **Mejl in (info@speedison.se MX):** Oförändrat — kvarstår där det är idag (Misshosting eller annan)
- **Mejl ut (notifikationer):** Resend skickar från `noreply@speedison.se` (kräver SPF + DKIM-DNS-records hos domän-leverantören)

### Miljövariabler (Railway-projekt)

| Variabel | Källa | Beskrivning |
|---|---|---|
| `DATABASE_URL` | Auto-injicerad av Railway MySQL-plugin | Privat connection-string mellan services |
| `RESEND_API_KEY` | Manuell (Resend-dashboard) | API-nyckel för transaktionsmejl |
| `MAIL_FROM` | Manuell | T.ex. `Speedison <noreply@speedison.se>` |
| `MAIL_TO` | Manuell | `info@speedison.se` |
| `IP_HASH_SALT` | Manuell, säker random | Salt för SHA-256-hashning av IP-adresser |
| `NEXT_PUBLIC_APP_URL` | Manuell | `https://speedison.se` (för OG/canonical) |

### Designprinciper

- En enda Node-process serverar både statiska frontend-rutter och API-route-handlers — samma origin → noll CORS-komplexitet.
- `prefers-reduced-motion` respekteras: frame-scrub byts mot statisk hero-bild, alla overlays visas omedelbart.
- Mobile fallback: 720w frame-bundle, ingen parallax, ingen cursor-spotlight, ingen ljud-autoplay.
- A11y baseline: alla CTA tab-nåbara, hot-spots har aria-labels och keyboard-aktivering.
- Type-safety end-to-end: Prisma-genererade typer + Zod-schema + TypeScript hela vägen.

## 7. Komponentträd

```
<RootLayout>
 ├─ <Navbar/>                       transparent → solid på scroll
 ├─ <SoundToggle/>                  sticky ikon, högra hörnet
 ├─ <CursorSpotlight/>              canvas, full-viewport overlay
 │
 ├─ <HeroScrub>                     500vh sticky scroll-stage
 │   ├─ <FrameSequence/>            WebP-frames + scroll-driven currentFrame
 │   ├─ <ParallaxLayer/>            rök/dust-particles ovanpå
 │   ├─ <ActOverlay act="I"/>
 │   ├─ <ActOverlay act="II"/>
 │   └─ <HotSpotMarker/> × 5        på sista bildrutan
 │
 ├─ <ChapterScene service="stage"/>      Stage 1 + Stage 2 (slås ihop)
 ├─ <ChapterScene service="popsBangs"/>
 ├─ <ChapterScene service="emissionsOff"/>  EGR + DPF + AdBlue + NOx
 ├─ <ChapterScene service="exhaust"/>
 │
 ├─ <PortfolioGallery/>             kundbils-foton (C63s, RS6, A35)
 │
 ├─ <Configurator/>                 5-stegs flöde
 │   ├─ Step 1: Märke
 │   ├─ Step 2: Modell
 │   ├─ Step 3: Motor / årsmodell
 │   ├─ Step 4: Tjänster (multi-select)
 │   └─ Step 5: Kontakt + submit
 │
 ├─ <FAQ/>                          21st.dev accordion
 └─ <Footer/>                       adress, öppettider, social
```

## 8. State och dataflöde

### Global state (Zustand)

```ts
configuratorStore: {
  step: 1..5,
  selectedMake?: string,
  selectedModel?: string,
  selectedEngine?: { motor: string, year: number },
  selectedServices: ServiceSlug[],
  contactInfo: { name, phone, email, message }
}

audioStore: {
  muted: boolean   // persistas i localStorage
}
```

### Statiskt innehåll

`src/lib/pricing.ts` (hårdkodad TS) bundlas in i komponenterna direkt. Vid pris-ändringar redigeras filen, push, Vercel deployar om automatiskt.

### Hot-spot → Konfigurator (interaktion)

```
HotSpotMarker (klick på "motor")
  → configuratorStore.addService('stage1')
  → smooth-scroll till <Configurator>
  → hoppar till Step 3 (Motor) med pre-ifyllt
```

### Lead-submit (slutet av konfigurator)

```
Step 5 submit
  → POST /api/leads { vehicle, services, contact, gdprConsent, honeypot }
  → [Next.js route handler] Zod-valideras → Prisma INSERT → Resend.emails.send(info@speedison.se) → return { ok, leadId, ref }
  → Tack-skärm med ärendenummer
```

### Prisma-schema (`web/prisma/schema.prisma`)

Prisma genererar typade klienter och hanterar migrations automatiskt vid Railway-deploy (`prisma migrate deploy` körs som build-steg). Mapping till MySQL nedan.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Lead {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now()) @map("created_at")
  ref        String     @unique @db.VarChar(20)
  make       String     @db.VarChar(50)
  model      String     @db.VarChar(100)
  engine     String?    @db.VarChar(200)
  year       Int?       @db.SmallInt
  services   Json
  name       String     @db.VarChar(120)
  phone      String     @db.VarChar(40)
  email      String     @db.VarChar(120)
  message    String?    @db.Text
  ipHash     String     @db.VarChar(64) @map("ip_hash")
  status     LeadStatus @default(NEW)

  @@index([ipHash, createdAt])
  @@map("leads")
}

enum LeadStatus {
  NEW
  CONTACTED
  QUOTED
  DONE
  LOST

  @@map("status")
}

model Contact {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now()) @map("created_at")
  name      String   @db.VarChar(120)
  email     String   @db.VarChar(120)
  phone     String?  @db.VarChar(40)
  message   String   @db.Text
  ipHash    String   @db.VarChar(64) @map("ip_hash")

  @@map("contacts")
}
```

Migrations skapas med `npx prisma migrate dev --name <namn>` lokalt, commitas under `prisma/migrations/`, och appliceras automatiskt vid Railway-deploy.

## 9. Animationer och scroll-mekanik

### Frame-sequence

- Källa: 15 s video @ 30 fps → ffmpeg extraherar 450 frames → WebP kvalitet 80
- Tre upplösningsbundles: `1920w/`, `1280w/`, `720w/` (mobil)
- Filstorlek per bundle: ~25–35 MB i 1920w, ~12 MB i 720w
- Progressiv förhandsladdning: första 30 frames eager (priority="high"), övriga lazy med IntersectionObserver
- Canvas ritar aktuell frame; scroll-position → frame-index via GSAP ScrollTrigger

### Scroll-stage-layout

```
[hero-scroll-stage]
height: 500vh
position: relative

  └─ <div class="sticky" style="height:100vh; top:0">
        <canvas/>          scrub-renderar aktuell frame
        <ParallaxLayer/>   rör sig något snabbare än canvas (depth)
        <ActOverlay/>      syns/försvinner per scroll-progress
     </div>
```

### Akt-mappning

| Scroll-progress | Frame-range | Akt | Overlays |
|---|---|---|---|
| 0–33 % | 0–150 | I | Tagline + sub-headline + sticky CTA |
| 33–66 % | 150–300 | II | 4 service-titlar fade-in i sekvens |
| 66–100 % | 300–450 | III | Hot-spots fade-in vid 90 %, accent-linjer ritas |

### Per-akt detaljer

**Akt I:** Tagline `y: 40 → 0`, `opacity: 0 → 1`, clip-path reveal från vänster. Sub-headline staggers 200 ms efter. CTA-knapp har subtil koppar-glow puls.

**Akt II:** 4 service-titlar i högerkolumnen, var 8:e frame slidear in en ny från höger. Varje titel: liten ikon + namn + "från X kr".

**Akt III:** Vid frame 420 (sek 14) pulsar hot-spot-prickar in en i taget (delay 100 ms × index). SVG-linjer ritas från varje hot-spot till en label utanför bilen (stroke-dashoffset-animation). Labels: serif, koppar, dyker upp efter sin linje är klar.

### Cursor-spotlight

Full-viewport canvas, position fixed, pointer-events:none. requestAnimationFrame ritar radiell gradient runt mus-position. Innerradie 200 px (transparent center), ytter 600 px → svart. Mörkar resten av sidan svagt. Reagerar bara över hero-stage, fadar ut vid 100 % scroll. Mobil: stängs av (touch ger inte cursor).

### ParallaxLayer

Andra canvas ovanpå frame-canvas. 80 partiklar (mobil: 30) — små vita prickar med varierande opacity. Drift uppåt + lateral oscillation (sin-wave). Reagerar på cursor: partiklar inom 150 px påverkas av musrörelse. Endast på desktop över hero.

### Transitions hero → chapters

Efter scroll-stage (500 vh) släpper sticky → vanlig flow. Smooth visual handoff: nedersta 100 vh av hero har gradient-overlay (svart → genomskinligt). Chapter ärver mörka bakgrunden.

### Chapter-bakgrunder

Varje `<ChapterScene>` har `<video autoplay loop muted playsinline>` som bakgrund med 70 % opacitet och mörk gradient ovanpå för läsbarhet. Källor: de tre kortare AI-klippen + ev. nya som genereras.

### Sound design

Howler.js, två spår:
- `engineRev.mp3` (subtilt, loop) — slår på vid Akt I, fadar ner vid Akt III
- `clickThunk.mp3` — på UI-knappar och hot-spots

Default muted (auto-play policy). Användaren ser glödande "🔊" i högra hörnet → klick togglar. Val sparas i localStorage.

### `prefers-reduced-motion` fallback

Hela frame-scrub byts mot statisk hero-bild (frame ~225). Akt-overlays visas alla samtidigt utan animation. Hot-spots fortfarande klickbara. Ingen parallax, ingen cursor-spotlight, ingen ljud-autoplay.

## 10. Konfigurator och lead-flöde

### Steg-för-steg

| Steg | Innehåll |
|---|---|
| 1 | Märke — grid med 8–10 logo-kort + "Annat märke" fri text |
| 2 | Modell — filtrerad lista per märke + sökfält + "Min modell saknas" fri text |
| 3 | Motor / årsmodell — text-fält "M177 4.0 V8 Biturbo" + year picker |
| 4 | Tjänster — 5 kort, multi-select. Hot-spot-koppling pre-ifyller här. |
| 5 | Kontakt + sammanfattning — namn, telefon, e-post (krävs); meddelande (valfritt); GDPR-checkbox (krävs); submit |
| 6 | Tack-skärm — "Vi hör av oss inom 24 timmar" + ärendenummer + telefon |

### Validering

| Fält | Klient (Zod) | Server (PHP) |
|---|---|---|
| Namn | min 2 tecken | min 2, max 120 |
| Telefon | regex svensk + intl | regex + längd 7–15 |
| E-post | format-valid | filter_var FILTER_VALIDATE_EMAIL |
| Meddelande | max 1000 | max 2000 |
| Tjänster | minst 1 | array, whitelist mot kända slugs |
| Märke / modell | minst 1 tecken | sanitize, max 100 |

Errorvisning under varje fält i realtid (debounced 300 ms).

### API-kontrakt

```ts
// POST /api/leads
// Request
{
  vehicle: { make, model, engine, year },
  services: ServiceSlug[],
  contact: { name, phone, email, message },
  gdprConsent: true,
  honeypot: ""
}

// Response (success)
{ ok: true, leadId: 1234, ref: "SP-2026-1234" }

// Response (validation error)
{ ok: false, error: "VALIDATION_FAILED", fields: { email: "Ogiltig e-post" } }
```

### E-post till info@speedison.se

```
Ämne: [SP-2026-1234] Ny offertförfrågan – Mercedes AMG A45

Märke:        Mercedes
Modell:       AMG A45
Motor:        M139 (2022)
Tjänster:     Stage 2, Pops & Bangs (uppskattat: 8 990 – 14 990 kr)

Kontakt:      Erik Andersson
Telefon:      +46 70 123 45 67
E-post:       erik@example.com

Meddelande:
> Hej, vill boka tid för Stage 2 + Pops & Bangs på min A45.

Mottaget:     2026-05-07 14:32
IP-hash:      abc123...
```

### Säkerhet

- Same-origin: route handlers serveras från samma domän som klienten → noll CORS-yta. Origin-check i route handler avvisar fetches från andra origins.
- Prisma + parameteriserade frågor → ingen SQL-injection
- All input sanitiseras via Zod-schema; output går via React (auto-escapad)
- Honeypot-fält: ifyllt → tystas bort som spam
- Rate-limit: max 5 leads/timme per IP-hash (lagras i samma DB)
- HTTPS automatisk via Railways custom-domain-SSL

## 11. Felhantering

| Lager | Beteende vid fel |
|---|---|
| React Error Boundary (root) | "Något gick fel — ring 08-33 33 46" |
| Hero Error Boundary | Statisk hero-bild + chapters fortsätter funka |
| Frame-loading timeout (3 s) | ScrollTrigger pausas, statisk frame visas |
| Canvas inte stöds | Statisk hero-bild med textoverlay |
| API network error | "Det går inte att nå servern. Vänligen ring 08-33 33 46" + behåller fält ifyllda |
| API 4xx | Fältspecifika fel under varje fält |
| API 5xx | Samma fallback som network error + `?fallback=true`-flagga |
| Railway-instans nere | Hela sajten är då nere. Mitigeras av Railways healthcheck + automatisk restart; fallback-CTA i e-post-template "ring oss". |
| Resend nere eller throttlad | Lead INSERT lyckas ändå. E-post markeras `mail_sent=false` (framtida fält) eller loggas; admin notifieras manuellt. |

Lead-data sparas i `sessionStorage` så sidladdning inte tappar inmatning.

## 12. Testning

| Lager | Verktyg | Vad |
|---|---|---|
| Unit | Vitest | pricing, validators, frame-index-mappning |
| Integration | Vitest + Testing Library | configurator state-övergångar, hot-spot → store |
| E2E happy path | Playwright | scrolla hero, klicka hot-spot, genomför 5 steg, submit |
| API route handlers | Vitest med mockad Prisma + Resend | validering, rate-limit, mail-sändning, error paths |
| Performance | Lighthouse CI i GitHub Actions | LCP, CLS, TBT, score ≥ 90 |
| Tillgänglighet | axe-core via Playwright | WCAG 2.1 AA på huvudsidan + konfigurator |
| Visuell regression | Hoppas i v1 | Lägga till Chromatic/Percy senare om behov uppstår |
| Manuell smoke | Inför varje deploy | iPhone Safari, Android Chrome, desktop Chrome/Firefox/Safari |

## 13. Performance-budget

- LCP < 2,5 s på 4G mobil
- JS-bundle initial < 200 kB gzip (Next.js code-splitting + dynamic imports för GSAP/Lenis)
- Frames totalt ≤ 35 MB i 1920w-bundle, ≤ 12 MB i 720w
- Lighthouse score ≥ 90 mobil i alla 4 kategorier

## 14. Tidslinje

```
v1  ─── Setup & infra (1 v) ──────────────
        ├─ Repo init (l8-spiral/speedison) + Next.js scaffold
        ├─ DNS-plan klar (inte aktiverad)
        ├─ Railway-projekt + MySQL-plugin + env vars
        └─ Tailwind + 21st.dev MCP + Lenis + GSAP installerat

v2  ─── Hero-scrub + storytelling (1 v) ──
        ├─ ffmpeg → frame-extraktion (när nya videon klar)
        ├─ <FrameSequence/> + canvas-rendering
        ├─ <ParallaxLayer/> + <CursorSpotlight/>
        ├─ Akt I/II/III overlays + GSAP-timeline
        └─ Hot-spot-system + tooltips

v3  ─── Sidor & komponenter (1 v) ────────
        ├─ <ChapterScene/> × 4 + atmos-bakgrunder
        ├─ <Configurator/> 5-stegs flöde
        ├─ <PortfolioGallery/> med hämtade kundbilar
        ├─ <Navbar/>, <Footer/>, <FAQ/>
        └─ Reduced-motion + mobile fallbacks

v4  ─── Backend, polish & launch (1 v) ───
        ├─ Prisma schema + migrations + DB-anslutning till Railway-MySQL
        ├─ Next.js API routes (/api/leads, /api/contact) + Resend
        ├─ Rate-limit + honeypot + Zod på server
        ├─ Lighthouse CI + axe-core fixar
        ├─ Stage på Railway-preview → kund granskar
        ├─ DNS-flytt: speedison.se → Vercel A-record
        └─ MX kvar hos Misshosting
```

## 15. Migration från befintlig sajt

1. Backup av nuvarande WordPress (full DB + filer) tas innan något händer
2. Bygg nya sajten på Railway-genererad preview-URL (t.ex. `speedison-production.up.railway.app`) eller staging-subdomän
3. Kund granskar staging i 3–5 dagar
4. Switchdag: peka `speedison.se` (A) + `www` (CNAME) på Railways custom-domain-target. TTL sänks 24 h innan
5. SSL aktiveras automatiskt av Railway
6. Gamla WordPress-installationen lämnas orörd hos Misshosting i 30 dagar (rollback-möjlighet)
7. 301-redirects från gamla URLer (`/tjanster`, `/kontakt`) till nya ankarpunkter
8. **MX-records (inkommande mejl) ändras inte** — info@speedison.se fortsätter levereras dit det går idag (Misshosting eller annan)

## 16. SEO och metadata

- `<title>` och `<meta description>` per route
- Open Graph + Twitter Card (delningsbild = hero-frame)
- `sitemap.xml` autogenererad av Next.js
- `robots.txt` tillåter allt utom `/api/`
- Strukturerad data: `LocalBusiness`-schema (Speedison som auto-verkstad i Kungsängen, adress Mätarvägen 9A 19637 Kungsängen, telefon 08-33 33 46, öppettider Mån–Fre 10–18 Lör 12–16)

## 17. GDPR och mätning

- Ingen tracking-cookie utan samtycke
- **Mätning v1:** Inga externa analytics. Vi loggar bara serverside-events (lead-submission, contact-submission) i DB-tabellerna. Detta räcker för att svara på "hur många leads kommer in i veckan".
- **Mätning v2 (framtid):** Lägg till privacy-first analytics som Plausible (~$9/mån cloud) eller Umami (self-hostat på samma Railway-projekt, gratis-resurs-overhead) när det blir aktuellt.
- IP-hashning i lead-tabellen — legitimt intresse (rate-limit, spam-skydd)
- Cookie-banner endast om vi senare lägger på Google Analytics eller Meta Pixel
- Privacy policy-sida: kort och rak (data sparas 24 mån, raderas på begäran)

## 18. Risker och mitigation

| Risk | Mitigation |
|---|---|
| Frame-sequence laddar långsamt på 3G | Aggressiv lazy + 720w mobile bundle + statisk fallback |
| Railway-deploy misslyckas | Auto-rollback till föregående deploy. Healthcheck-fail blockar release. |
| Lead-mejl fastnar i spam | Resend-domänverifiering: SPF + DKIM + DMARC sätts upp hos domän-leverantör innan första mejl skickas |
| Resend free tier (3k/mån) tar slut | Vid hög volym uppgradera till Resend Pro ($20/mån för 50k mejl). Lead-INSERT i DB blir aldrig blockerad. |
| Hobby-budget slut p.g.a. resursanvändning | Railway varnar inom plan-konsolen. Plan B: skala ner befintligt projekt eller uppgradera till Pro ($20/mån, $20 inkluderat). |
| Konfigurator för komplex för mobilanvändare | Steg-för-steg är lättare än långt formulär. Progressbar visar att slutet finns. |
| Användaren hatar nya designen | Stage-period med kund-feedback INNAN switchdag |

---

## Bilaga A — Framtida v2 "Maximal Showcase"

Kan plockas upp efter v1 är live. Lager läggs på utan att riva ner befintlig arkitektur.

1. Three.js-particle-system — gnistor och rök som reagerar på avgasrörens flammor i Pops & Bangs-kapitlet
2. Procedural WebGL-shaders för chapter-bakgrunder (animerade dyno-grafer som ritas i realtid, kretskort som lyser i takt med ljud)
3. Värmevågs-shader över avgasrören (heat-haze distortion)
4. 3D-tilt på galleri-bilderna (cursor-driven, fysik-baserad trögmotstånd)
5. Realtidssynkat motorljud kopplat till hero-scroll-position (ljudet stiger med varv)
6. Scrollspy-navigation med animerade ikoner som "växlar växel" när nya kapitel når viewport-toppen

Estimat: ~2 veckors tillägg.

---

## Bilaga B — Tjänster och prisreferens

Hämtat från speedison.se 2026-05-07. Hårdkodas i `src/lib/pricing.ts`.

| Tjänst | Slug | Pris (från) | Beskrivning |
|---|---|---|---|
| Stage 1 | `stage1` | TBD (kund kompletterar) | ECU-optimering steg 1 |
| Stage 2 | `stage2` | TBD (kund kompletterar) | ECU-optimering steg 2 |
| Pops & Bangs | `popsBangs` | 2 995 kr | Deceleration sound optimization |
| EGR-OFF | `egrOff` | 1 995 kr | Mjukvaruanpassning, EGR exkluderas |
| DPF-OFF | `dpfOff` | 2 495 kr | DPF-borttagning |
| AdBlue-OFF | `adblueOff` | 4 495 kr | AdBlue exkluderas |
| NOx-OFF | `noxOff` | 1 995 kr | NOx-sensor exkluderas |
| Avgassystem-mod | `exhaust` | TBD (kund kompletterar) | Muffler delete eller ombygge |

I konfiguratorn slås EGR + DPF + AdBlue + NOx ihop till ett samlat kort "Emissions OFF" med multi-select av delar.

## Bilaga C — Hot-spot-mappning (preliminär)

Konfirmeras när nya videon är klar och frame ~420 är kontrollerad.

| Position på exploded view | Service-slug | Konfigurator-koppling |
|---|---|---|
| Motorhuv / motorrum | `stage1` (eller `stage2`) | Step 3 + addService |
| Avgasrör (bakre) | `popsBangs` | Step 4 + addService |
| Avgassystem (under) | `exhaust` | Step 4 + addService |
| Katalysator / EGR-block | `emissionsOff` (samlad) | Step 4 + addService |
| Reserv (bromsok eller fälg) | — eller länk till FAQ | — |

## Bilaga D — Befintliga assets att hämta från nuvarande sajt

Hämtas från speedison.se i v1-setup och placeras i Next.js-projektets `public/`-struktur. Hämtning sker en gång manuellt via `wget` eller `curl`; assets versioneras i Git.

### Brand-assets (krävs i v1)

| Asset | Källa | Destination |
|---|---|---|
| Logotyp (originalformat) | `https://speedison.se/wp-content/uploads/2022/11/background-1-e1669122540854.png` (utan `-300x132`-suffix för full upplösning) | `web/public/brand/logo.png` |
| Favicon | `https://speedison.se/favicon.ico` (om finns) eller härledd från logotypen | `web/public/favicon.ico` + `web/app/icon.png` (Next.js auto) |
| Apple touch icon | Härleds från logotypen (180×180 PNG) | `web/public/apple-touch-icon.png` |

Loggan används i navbar (light variant på mörk bakgrund) och footer. Vid behov skapas en SVG-version för crisp rendering på alla skärmar — original-PNG bevaras alltid.

### Kundbilder för portfolio-galleri

Laddas ner till `web/public/gallery/` innan launch.

- C63s stage 1 (`136C5433-1762-40F6-BA9A-058570E3C941-1012x1030.jpg`)
- C63s stage 2 (`45DF84B7-6F6F-4657-BA1C-8972B5CD9BED-579x1030.jpg`)
- RS6 stage 1 #1 (`75C497CB-39CB-4867-8610-7EDB7C553754-1030x1030.jpg`)
- RS6 stage 1 #2 (`BD67C316-64AE-4505-9685-FD73B9A4DEBF-1030x1030.jpg`)
- A35 stage 1 + pops (`CC3CDA8D-3241-4F39-9619-21361034BABD-1030x1030.jpg`)
- Sport avgassystem-närbild (`7E80BA69-5076-45A1-8C01-6A19FBC9321C-824x1030.jpg`)
- Pops & Bangs-illustration (`pixie_1669081224798-300x169.png`)

Bilderna konverteras till WebP/AVIF i Next.js `<Image>`-komponenten vid build.

## Öppna punkter (måste kompletteras innan/under implementation)

1. **Stage 1, Stage 2, Avgassystem** priser — finns inte på nuvarande sajt. Kund kompletterar
2. **Slutgiltig hero-video** — kund genererar ny version med bättre bakgrund. Påverkar frame-extraktion och hot-spot-pixelkoordinater
3. **Andra 3 video-klippen (5 sek var)** — bekräftades vara alternativa scener av huvudvideon. Bekräfta vilka som ska användas som chapter-atmos-bakgrund (eller om nya genereras)
4. **Misshosting e-post** — `mail()` eller SMTP? SPF/DKIM-status? Bekräftas under v4
5. **Stage 1 vs Stage 2** i konfigurator — som två olika tjänster eller ett kort med radio-val? Bekräftas i implementation
6. **Sociala media** — länkar till Instagram/Facebook bekräftas i footer
7. **Privacy policy-text** — författas separat (kund eller skribent)
