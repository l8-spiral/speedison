# Speedison Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic, scroll-driven Next.js site for speedison.se with a 15-second hero-scrub video story, an exploded-view hot-spot system, a 5-step lead-generating configurator, and a Prisma + MySQL backend — all deployed as a single Railway service.

**Architecture:** Next.js 15 App Router on Railway. Prisma ORM against a Railway-hosted MySQL plugin. Resend for transactional email. Same-origin Next.js route handlers for `/api/leads` and `/api/contact` (no separate backend deploy). WebP frame-sequence + GSAP ScrollTrigger drive the hero animation; canvas overlays add cursor-spotlight and parallax. State managed by Zustand; validation by Zod (shared client+server).

> **Architecture revision 2026-05-08:** Original plan was Vercel + Misshosting/PHP. Pivoted to single-platform Railway deploy. PHP/FTP/Misshosting backend dropped. Affected tasks: T9, T11, T31 (api client URL), T33–T35, T43, T44, T46. Spec also revised at top of `docs/superpowers/specs/2026-05-07-speedison-redesign-design.md`.
>
> **Stack version note 2026-05-08:** `create-next-app` pinned the project to **Next.js 16.2.6 + React 19.2.4 + Tailwind v4**. This plan was authored assuming Next.js 15 conventions. **Implementer subagents working in `web/` MUST consult `web/node_modules/next/dist/docs/` for any feature that may have changed (App Router routing, route handlers, `Metadata`/`Viewport` APIs, `next/image`, `next/font`, `next/headers`, error/loading/not-found special files, etc.) before writing code.** The `web/AGENTS.md` file already enforces this for in-tree agents. If a code sample in this plan conflicts with the installed Next.js docs, follow the installed docs and report the discrepancy back as DONE_WITH_CONCERNS.

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4, GSAP + ScrollTrigger, Lenis, Framer Motion, Howler.js, Canvas 2D, Zustand, Zod, Vitest, Playwright, axe-core, PHP 8 (PDO), MySQL.

**Spec reference:** `docs/superpowers/specs/2026-05-07-speedison-redesign-design.md`

---

## File Structure

```
speedison/
├── web/                                 Next.js app (Railway target)
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              root, fonts, theme
│   │   │   ├── page.tsx                hero + chapters + configurator
│   │   │   ├── konfigurator/page.tsx   standalone configurator route
│   │   │   ├── kontakt/page.tsx
│   │   │   ├── integritet/page.tsx     privacy policy
│   │   │   ├── tack/page.tsx           thank-you page
│   │   │   ├── icon.png                favicon (Next.js auto)
│   │   │   ├── opengraph-image.tsx     OG image generator
│   │   │   ├── sitemap.ts
│   │   │   ├── robots.ts
│   │   │   └── api/
│   │   │       ├── leads/route.ts      POST /api/leads (Next.js handler)
│   │   │       └── contact/route.ts    POST /api/contact
│   │   ├── components/
│   │   │   ├── hero-scrub/
│   │   │   │   ├── HeroScrub.tsx
│   │   │   │   ├── FrameSequence.tsx
│   │   │   │   ├── ActOverlay.tsx
│   │   │   │   └── HotSpotMarker.tsx
│   │   │   ├── effects/
│   │   │   │   ├── CursorSpotlight.tsx
│   │   │   │   └── ParallaxLayer.tsx
│   │   │   ├── chapter/
│   │   │   │   ├── ChapterScene.tsx
│   │   │   │   └── chapters.tsx        4 chapter components
│   │   │   ├── configurator/
│   │   │   │   ├── Configurator.tsx
│   │   │   │   ├── StepMake.tsx
│   │   │   │   ├── StepModel.tsx
│   │   │   │   ├── StepEngine.tsx
│   │   │   │   ├── StepServices.tsx
│   │   │   │   ├── StepContact.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── store.ts            Zustand
│   │   │   ├── ui/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── SoundToggle.tsx
│   │   │   │   ├── PortfolioGallery.tsx
│   │   │   │   ├── FAQ.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   └── lenis/
│   │   │       └── SmoothScroll.tsx
│   │   ├── lib/
│   │   │   ├── pricing.ts              services + prices + types
│   │   │   ├── content.ts              copy
│   │   │   ├── api.ts                  client fetch wrapper
│   │   │   ├── audio.ts                Howler instances
│   │   │   ├── frames.ts               frame-index math
│   │   │   ├── schemas.ts              Zod schemas (shared client + server)
│   │   │   ├── prisma.ts               PrismaClient singleton
│   │   │   ├── mailer.ts               Resend wrapper
│   │   │   ├── ratelimit.ts            IP-hash + DB-backed counter
│   │   │   └── server-origin.ts        origin allowlist for route handlers
│   │   └── styles/
│   │       └── globals.css             Tailwind directives + theme tokens
│   ├── prisma/
│   │   ├── schema.prisma               Lead + Contact models
│   │   └── migrations/                 generated migration history
│   └── public/
│       ├── frames/                     1920w/, 1280w/, 720w/ WebP sequences
│       ├── gallery/                    customer photos
│       ├── brand/
│       │   ├── logo.png
│       │   └── logo.svg
│       ├── favicon.ico
│       ├── apple-touch-icon.png
│       ├── audio/
│       │   ├── engine-rev.mp3
│       │   └── click-thunk.mp3
│       └── chapter-bg/                 atmos video clips for chapters
├── .github/
│   └── workflows/
│       └── ci.yml                      lint, test, lighthouse (deploy = Railway)
├── railway.json                        Railway build/deploy config (root)
├── scripts/
│   ├── extract-frames.sh               ffmpeg → WebP sequence
│   └── fetch-legacy-assets.sh          curl old site assets
├── docs/superpowers/specs/
└── docs/superpowers/plans/
```

---

## Milestones

| # | Name | Tasks | Outcome |
|---|---|---|---|
| 1 | Setup & infra | 1–11 | Empty Next.js scaffold builds and runs locally; CI green; Railway config in repo (deploy itself deferred) |
| 2 | Hero scrub | 12–22 | Scroll-driven hero with frames, overlays, hot-spots, effects, fallbacks |
| 3 | Pages & configurator | 23–37 | All sections + chapters + 5-step configurator (no backend yet) |
| 4 | Backend, launch | 38–49 | PHP API + MySQL, e-mail, polish, SEO, DNS-cutover ready |

---

## Milestone 1 — Setup & Infrastructure

### Task 1: Initialize repository

**Files:**
- Use existing remote: `https://github.com/l8-spiral/speedison.git`
- Create: `README.md`
- Create: `.gitignore`
- Create: `.editorconfig`

- [ ] **Step 1: Clone the empty repo into the project directory**

```bash
cd C:/Users/Lobos8/Projects
git clone https://github.com/l8-spiral/speedison.git speedison-tmp
mv speedison-tmp/.git SPEEDISON/
rm -rf speedison-tmp
cd SPEEDISON
git status
```

Expected: working tree shows the existing files (`.claude/`, `.superpowers/`, `docs/`, `scener/`) as untracked.

- [ ] **Step 2: Create `.gitignore`**

```
# deps
node_modules/
.pnp
.pnp.js

# build
.next/
out/
dist/
build/

# env
.env*.local
.env

# testing
coverage/
playwright-report/
test-results/

# os
.DS_Store
Thumbs.db

# editor
.vscode/
.idea/

# brainstorm artifacts (local only)
.superpowers/brainstorm/

# scener (large source videos, not committed)
scener/

# logs
*.log
```

- [ ] **Step 3: Create `.editorconfig`**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.php]
indent_size = 4
```

- [ ] **Step 4: Create minimal `README.md`**

```markdown
# Speedison

Cinematic redesign of speedison.se. Single-platform deploy on Railway: Next.js 15 + Prisma + MySQL + Resend.

## Structure

- `web/` — Next.js app (Railway target; includes API route handlers and Prisma)
- `scripts/` — build & deploy helpers
- `docs/superpowers/` — specs and plans

## Development

See `docs/superpowers/plans/2026-05-07-speedison-redesign.md`.
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore .editorconfig README.md docs/
git commit -m "chore: bootstrap repo with .gitignore, editorconfig, docs"
```

---

### Task 2: Scaffold Next.js project in `web/`

**Files:**
- Create: `web/` (via `create-next-app`)

- [ ] **Step 1: Run `create-next-app` with TypeScript + Tailwind + App Router**

```bash
cd C:/Users/Lobos8/Projects/SPEEDISON
npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint --use-npm
```

Answer interactive prompts: Yes to Turbopack if asked.

Expected: `web/` directory created with default Next.js scaffold.

- [ ] **Step 2: Verify dev server starts**

```bash
cd web
npm run dev
```

Expected: server runs on http://localhost:3000, default Next.js page renders.
Stop with Ctrl-C.

- [ ] **Step 3: Replace default `web/src/app/page.tsx` with placeholder**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-amber-200">
      <h1 className="text-2xl tracking-widest">SPEEDISON</h1>
    </main>
  );
}
```

- [ ] **Step 4: Update `web/src/app/layout.tsx` metadata**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speedison — Performance reimagined",
  description: "Optimering, Stage 1 & 2, Pops & Bangs, avgassystem för högpresterande bilar i Kungsängen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="antialiased bg-black text-stone-100">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add web/
git commit -m "feat(web): scaffold Next.js app with App Router + TS + Tailwind"
```

---

### Task 3: Configure Tailwind theme tokens (Luxe Performance × Cinematic Noir)

**Files:**
- Modify: `web/src/app/globals.css`
- Create: `web/src/styles/tokens.css`

- [ ] **Step 1: Create theme tokens in `web/src/styles/tokens.css`**

```css
/* Luxe Performance × Cinematic Noir */
@theme {
  --color-noir-950: #050508;
  --color-noir-900: #0a0a0f;
  --color-noir-800: #14141c;
  --color-noir-700: #1a1a24;
  --color-copper-50:  #f5e8d0;
  --color-copper-100: #f0e0c8;
  --color-copper-200: #e6c89c;
  --color-copper-300: #d4a574;
  --color-copper-400: #c9925a;
  --color-copper-500: #b67e44;
  --color-text-primary: #f0e0c8;
  --color-text-muted:   #888888;

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;

  --ease-cinematic: cubic-bezier(0.23, 1, 0.32, 1);
  --duration-slow: 900ms;
  --duration-mid: 600ms;
  --duration-fast: 300ms;
}
```

- [ ] **Step 2: Update `web/src/app/globals.css`**

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@layer base {
  html { color-scheme: dark; }
  body {
    background: var(--color-noir-900);
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }
  h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 300; letter-spacing: 0.02em; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0ms !important;
      transition-duration: 0ms !important;
    }
  }
}
```

- [ ] **Step 3: Add font loader in `web/src/app/layout.tsx`**

```tsx
import { Cormorant_Garamond, Inter } from "next/font/google";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["300","400"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-body" });

// in <html>:
<html lang="sv" className={`${display.variable} ${body.variable}`}>
```

- [ ] **Step 4: Visually verify**

```bash
cd web && npm run dev
```

Open http://localhost:3000. Background should be near-black; "SPEEDISON" text in champagne/copper.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/globals.css web/src/styles/ web/src/app/layout.tsx
git commit -m "feat(web): theme tokens + serif/sans font system"
```

---

### Task 4: Install scroll, animation, and audio dependencies

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Install runtime deps**

```bash
cd web
npm install gsap lenis framer-motion howler   # NOTE: previously @studio-freight/lenis, now renamed to plain `lenis`
npm install -D @types/howler
```

- [ ] **Step 2: Install state and validation**

```bash
npm install zustand zod
```

- [ ] **Step 3: Verify versions in `package.json`**

Open `web/package.json`. Confirm `dependencies` includes: `gsap`, `lenis`, `framer-motion`, `howler`, `zustand`, `zod`. `devDependencies` includes `@types/howler`.

- [ ] **Step 4: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore(web): add gsap, lenis, framer-motion, howler, zustand, zod"
```

---

### Task 5: Set up Vitest and React Testing Library

**Files:**
- Create: `web/vitest.config.ts`
- Create: `web/test/setup.ts`
- Modify: `web/package.json` (scripts)

- [ ] **Step 1: Install testing deps**

```bash
cd web
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    css: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

```bash
npm install -D @vitejs/plugin-react
```

- [ ] **Step 3: Create `web/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Add scripts to `web/package.json`**

In the `scripts` block, add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 5: Write a smoke test `web/test/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected: 1 test passes.

- [ ] **Step 7: Commit**

```bash
git add web/
git commit -m "test(web): set up vitest + testing-library + smoke test"
```

---

### Task 6: Create `lib/pricing.ts` with services, slugs, prices, types

**Files:**
- Create: `web/src/lib/pricing.ts`
- Create: `web/test/lib/pricing.test.ts`

- [ ] **Step 1: Write the failing test `web/test/lib/pricing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { SERVICES, getService, formatPriceRange, getPriceRange } from "@/lib/pricing";

describe("pricing", () => {
  it("exposes all 8 service slugs", () => {
    const slugs = SERVICES.map(s => s.slug).sort();
    expect(slugs).toEqual(
      ["adblueOff","dpfOff","egrOff","exhaust","noxOff","popsBangs","stage1","stage2"]
    );
  });

  it("getService returns the right service by slug", () => {
    const s = getService("popsBangs");
    expect(s?.name).toBe("Pops & Bangs");
    expect(s?.priceFrom).toBe(2995);
  });

  it("formatPriceRange formats SEK correctly", () => {
    expect(formatPriceRange(2995, null)).toBe("Från 2 995 kr");
    expect(formatPriceRange(8990, 14990)).toBe("8 990 – 14 990 kr");
    expect(formatPriceRange(null, null)).toBe("Begär offert");
  });

  it("getPriceRange computes a sum range across selected services", () => {
    const range = getPriceRange(["popsBangs", "egrOff"]);
    expect(range.from).toBe(2995 + 1995);
    expect(range.to).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
cd web && npm test
```

Expected: error "Cannot find module '@/lib/pricing'".

- [ ] **Step 3: Create `web/src/lib/pricing.ts`**

```ts
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
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npm test
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/pricing.ts web/test/lib/pricing.test.ts
git commit -m "feat(web): pricing service catalog + formatting helpers (TDD)"
```

---

### Task 7: Create `lib/schemas.ts` with Zod validation

**Files:**
- Create: `web/src/lib/schemas.ts`
- Create: `web/test/lib/schemas.test.ts`

- [ ] **Step 1: Write the failing test `web/test/lib/schemas.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { LeadSchema, contactInfoSchema } from "@/lib/schemas";

const validLead = {
  vehicle: { make: "Mercedes", model: "AMG A45", engine: "M139", year: 2022 },
  services: ["stage2", "popsBangs"],
  contact: { name: "Erik", phone: "+46701234567", email: "e@x.se", message: "" },
  gdprConsent: true,
  honeypot: ""
};

describe("LeadSchema", () => {
  it("accepts a valid lead", () => {
    const r = LeadSchema.safeParse(validLead);
    expect(r.success).toBe(true);
  });

  it("rejects missing services", () => {
    const r = LeadSchema.safeParse({ ...validLead, services: [] });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = LeadSchema.safeParse({ ...validLead, contact: { ...validLead.contact, email: "nope" } });
    expect(r.success).toBe(false);
  });

  it("rejects missing GDPR consent", () => {
    const r = LeadSchema.safeParse({ ...validLead, gdprConsent: false });
    expect(r.success).toBe(false);
  });

  it("rejects when honeypot is filled (bot)", () => {
    const r = LeadSchema.safeParse({ ...validLead, honeypot: "spam" });
    expect(r.success).toBe(false);
  });
});

describe("contactInfoSchema", () => {
  it("accepts a Swedish phone", () => {
    expect(contactInfoSchema.safeParse({ name:"E", phone:"070 123 45 67", email:"a@b.se" }).success).toBe(true);
  });
  it("rejects 5-digit phone", () => {
    expect(contactInfoSchema.safeParse({ name:"E", phone:"12345", email:"a@b.se" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
npm test
```

Expected: module not found.

- [ ] **Step 3: Create `web/src/lib/schemas.ts`**

```ts
import { z } from "zod";

const SERVICE_SLUGS = [
  "stage1","stage2","popsBangs","egrOff","dpfOff","adblueOff","noxOff","exhaust"
] as const;

export const phoneSchema = z.string().trim().min(7).max(20)
  .regex(/^[+\d\s\-()]+$/, "Ogiltigt telefonnummer")
  .refine(v => v.replace(/\D/g, "").length >= 7, "För kort telefonnummer");

export const contactInfoSchema = z.object({
  name: z.string().trim().min(2, "För kort namn").max(120),
  phone: phoneSchema,
  email: z.string().trim().email("Ogiltig e-postadress").max(120),
  message: z.string().max(1000).optional().default(""),
});

export const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  engine: z.string().trim().max(200).optional().default(""),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
});

export const LeadSchema = z.object({
  vehicle: vehicleSchema,
  services: z.array(z.enum(SERVICE_SLUGS)).min(1, "Välj minst en tjänst"),
  contact: contactInfoSchema,
  gdprConsent: z.literal(true, { errorMap: () => ({ message: "Du måste godkänna integritetspolicyn" }) }),
  honeypot: z.literal(""),
});

export type Lead = z.infer<typeof LeadSchema>;
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npm test
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/schemas.ts web/test/lib/schemas.test.ts
git commit -m "feat(web): Zod schemas for lead + validation (TDD)"
```

---

### Task 8: Create `lib/content.ts` with static copy

**Files:**
- Create: `web/src/lib/content.ts`

- [ ] **Step 1: Create `web/src/lib/content.ts`**

```ts
export const HERO = {
  taglineLine1: "Vi tämjer",
  taglineLine2: "maskinen.",
  subHeadline: "Stage-optimering, Pops & Bangs och avgassystem för högpresterande bilar.",
  ctaPrimary: "Konfigurera din bil",
  ctaSecondary: "Ring oss",
  actII: {
    label: "Vad vi gör",
    items: [
      "Stage 1 / Stage 2",
      "Pops & Bangs",
      "EGR / DPF / AdBlue / NOx",
      "Avgassystem",
    ],
  },
};

export const COMPANY = {
  name: "Speedison",
  address: "Mätarvägen 9A, 196 37 Kungsängen",
  phone: "08-33 33 46",
  phoneTel: "+46833334 6",
  email: "info@speedison.se",
  orgNr: "559402-4548",
  hours: [
    { days: "Mån–Fre", time: "10:00–18:00" },
    { days: "Lör",     time: "12:00–16:00" },
    { days: "Sön",     time: "Stängt" },
  ],
  social: {
    instagram: "https://www.instagram.com/speedison/",
    facebook:  "https://www.facebook.com/speedison/",
  },
};

export const FAQ_ITEMS = [
  { q: "Hur lång tid tar en Stage 1-optimering?",
    a: "I de flesta fall en arbetsdag — vi flashar ECU:n, kör dyno-pass och lämnar tillbaka samma dag." },
  { q: "Försvinner garantin?",
    a: "Originaltillverkarens nybilsgaranti kan påverkas av mjukvarumodifieringar. Vi går igenom risker innan vi börjar." },
  { q: "Kan jag återställa till original?",
    a: "Ja. Vi sparar alltid originalfilen så att vi kan återställa om du senare säljer bilen." },
  { q: "Hur betalar jag?",
    a: "Faktura, swish eller kortbetalning på plats efter avslutat arbete." },
];
```

- [ ] **Step 2: Commit**

```bash
git add web/src/lib/content.ts
git commit -m "feat(web): static copy in lib/content.ts"
```

---

### Task 9: CI workflow + Railway deploy config

> **Architecture revision (2026-05-08):** Hela stacken körs på Railway. Inga FTP-deploys behövs. CI-workflowen testar bara bygget; deploy görs av Railway när det är push till main (kopplas senare när vi går prod).

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `railway.json` (root) — buildkommando, healthcheck

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  web-tests:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npm test
      - run: npm run build
        env:
          # Build-time only; Prisma needs a placeholder to generate types
          DATABASE_URL: mysql://placeholder:placeholder@localhost:3306/placeholder
```

- [ ] **Step 2: Create `railway.json` at the repo root**

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd web && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build"
  },
  "deploy": {
    "startCommand": "cd web && npm run start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

Notes for the implementer:
- We use Nixpacks (Railway's default) which auto-detects the Node version. If we want to pin it, add `engines.node = "20.x"` in `web/package.json` later.
- `prisma migrate deploy` runs at build time so DB schema is up to date before the new container goes live. Safe — it never auto-resets data, only applies pending migrations.
- The healthcheck hits `/` (the homepage). On a brand-new deploy where the homepage is empty, this still returns 200, which is fine.

- [ ] **Step 3: Document required env vars in `README.md`**

Add a section to `README.md`:

```markdown
## Required Railway environment variables

Set in Railway project → Variables:

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Auto from MySQL plugin | Click "Reference" → MySQL → `MYSQL_URL` |
| `RESEND_API_KEY` | Resend dashboard | API key with send permission |
| `MAIL_FROM` | Manual | e.g. `Speedison <noreply@speedison.se>` |
| `MAIL_TO` | Manual | `info@speedison.se` |
| `IP_HASH_SALT` | Manual (random) | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Manual | `https://speedison.se` (production) |
```

- [ ] **Step 4: Commit**

```bash
git add .github/ railway.json README.md
git commit -m "ci: GitHub Actions test workflow + Railway build/deploy config"
```

---

### Task 10: Fetch legacy assets (logo, gallery, favicon)

**Files:**
- Create: `scripts/fetch-legacy-assets.sh`
- Create: `web/public/brand/logo.png`
- Create: `web/public/gallery/*.jpg`
- Create: `web/public/favicon.ico`

- [ ] **Step 1: Create `scripts/fetch-legacy-assets.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p web/public/brand web/public/gallery

BASE="https://speedison.se"

# Brand
curl -L -o web/public/brand/logo.png \
  "$BASE/wp-content/uploads/2022/11/background-1-e1669122540854.png"

# Try to download an existing favicon; if 404, fall back to logo (we generate later)
curl -L -f -o web/public/favicon.ico "$BASE/favicon.ico" \
  || cp web/public/brand/logo.png web/public/favicon.ico

# Gallery (customer cars)
declare -a IMAGES=(
  "2022/11/7E80BA69-5076-45A1-8C01-6A19FBC9321C-824x1030.jpg|exhaust-closeup.jpg"
  "2022/11/45DF84B7-6F6F-4657-BA1C-8972B5CD9BED-579x1030.jpg|c63s-stage2.jpg"
  "2022/11/75C497CB-39CB-4867-8610-7EDB7C553754-1030x1030.jpg|rs6-stage1-a.jpg"
  "2022/11/136C5433-1762-40F6-BA9A-058570E3C941-1012x1030.jpg|c63s-stage1.jpg"
  "2022/11/CC3CDA8D-3241-4F39-9619-21361034BABD-1030x1030.jpg|a35-stage1-pops.jpg"
  "2022/11/BD67C316-64AE-4505-9685-FD73B9A4DEBF-1030x1030.jpg|rs6-stage1-b.jpg"
)

for entry in "${IMAGES[@]}"; do
  src="${entry%%|*}"
  dst="${entry##*|}"
  curl -L -o "web/public/gallery/$dst" "$BASE/wp-content/uploads/$src"
done

echo "Done."
ls -la web/public/brand web/public/gallery
```

- [ ] **Step 2: Run the script**

```bash
chmod +x scripts/fetch-legacy-assets.sh
./scripts/fetch-legacy-assets.sh
```

Expected: files appear in `web/public/brand/` and `web/public/gallery/`.

- [ ] **Step 3: Verify each image opens** (manually inspect at least logo.png and one gallery image).

- [ ] **Step 4: Generate apple-touch-icon and Next.js icon from logo**

Use any image tool (Photoshop, GIMP, online resizer) to create:
- `web/public/apple-touch-icon.png` — 180×180
- `web/src/app/icon.png` — 512×512

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-legacy-assets.sh web/public/ web/src/app/icon.png
git commit -m "feat: fetch legacy logo, favicon, and gallery photos"
```

---

### Task 11: Next.js security headers + image config (Railway prep)

> **Architecture revision (2026-05-08):** Vercel ersatt med Railway. Railway-projektet skapas av användaren när vi är redo att gå live (deferred to prod phase). Det här tasket bara konfigurerar Next.js för Railway-runtime; inget externt anrop görs.

**Files:**
- Modify: `web/next.config.ts`

- [ ] **Step 1: Update `web/next.config.ts` with image config and security headers**

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Public CDN domains we serve images from. /public assets don't need entries here.
  },
  // Output mode: standalone makes the Railway container small and self-contained.
  output: "standalone",
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }];
  },
};
export default config;
```

Notes:
- `output: "standalone"` puts only what's needed for runtime in `.next/standalone/`. Smaller container = faster Railway cold-start. Combined with `npm run start`, this is the recommended config for Node-runtime hosts like Railway.

- [ ] **Step 2: Commit**

```bash
git add web/next.config.ts
git commit -m "chore(web): security headers + standalone output for Railway"
```

- [ ] **Step 3: Smoke-test the build locally**

```bash
cd web
npm run build
```

Expected: build succeeds. `.next/standalone/server.js` exists.

> **Deferred to prod phase (NOT now):** Creating the Railway project, adding the MySQL plugin, setting env vars, attaching the GitHub repo, and triggering the first deploy. The user will do this when we're ready to go live; the plan covers it in the prod-launch tasks.

---

## Milestone 2 — Hero scrub

### Task 12: Frame extraction script

**Files:**
- Create: `scripts/extract-frames.sh`
- Output (gitignored except a placeholder dir): `web/public/frames/{1920w,1280w,720w}/`

- [ ] **Step 1: Create the script**

```bash
#!/usr/bin/env bash
# Usage: ./scripts/extract-frames.sh <input-video.mp4>
# Produces 450 WebP frames in 3 widths.
set -euo pipefail

INPUT="${1:-}"
if [[ -z "$INPUT" ]]; then
  echo "Usage: $0 <input-video.mp4>"; exit 1
fi
if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg not found — install: https://ffmpeg.org/download.html"; exit 1
fi

OUT_BASE="web/public/frames"
rm -rf "$OUT_BASE"
mkdir -p "$OUT_BASE/1920w" "$OUT_BASE/1280w" "$OUT_BASE/720w"

# Force 30 fps and start frame numbering at 000
for size in "1920:1080:1920w" "1280:720:1280w" "720:405:720w"; do
  W="${size%%:*}"; rest="${size#*:}"
  H="${rest%%:*}"; DIR="${rest##*:}"
  ffmpeg -y -i "$INPUT" -vf "fps=30,scale=${W}:${H}:flags=lanczos" \
    -c:v libwebp -quality 80 -lossless 0 -pix_fmt yuv420p \
    "$OUT_BASE/$DIR/frame-%03d.webp"
done

echo "Frames written to $OUT_BASE"
ls "$OUT_BASE/1920w" | head -5
echo "Total 1920w frames: $(ls $OUT_BASE/1920w | wc -l)"
```

- [ ] **Step 2: Add a placeholder for empty `frames/` dirs (so Git keeps them)**

```bash
mkdir -p web/public/frames/1920w web/public/frames/1280w web/public/frames/720w
touch web/public/frames/1920w/.gitkeep
touch web/public/frames/1280w/.gitkeep
touch web/public/frames/720w/.gitkeep
```

- [ ] **Step 3: Test with the existing 15-sec video** (when ffmpeg is available)

```bash
chmod +x scripts/extract-frames.sh
./scripts/extract-frames.sh "scener/Car_Front_Side_Back_A_slow_zoom-out_reveals_a_man_with_short_dark_BIC5qrRE.mp4"
```

Expected: 450 frames in `1920w/`, 450 in `1280w/`, 450 in `720w/`.
If user provides a new video later, re-run with that path.

- [ ] **Step 4: Commit script + placeholders (frames themselves are NOT committed)**

Update `.gitignore`:

```
# extracted frames are large + regenerated from source
web/public/frames/*/frame-*.webp
```

```bash
git add .gitignore scripts/extract-frames.sh web/public/frames/
git commit -m "feat: ffmpeg frame-extraction script + placeholder dirs"
```

---

### Task 13: `lib/frames.ts` — frame-index math

**Files:**
- Create: `web/src/lib/frames.ts`
- Create: `web/test/lib/frames.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { TOTAL_FRAMES, ACT_RANGES, frameForProgress, actForProgress } from "@/lib/frames";

describe("frames", () => {
  it("has 450 total frames", () => { expect(TOTAL_FRAMES).toBe(450); });

  it("frameForProgress maps 0..1 to 0..449", () => {
    expect(frameForProgress(0)).toBe(0);
    expect(frameForProgress(1)).toBe(449);
    expect(frameForProgress(0.5)).toBe(225);
    expect(frameForProgress(2)).toBe(449);
    expect(frameForProgress(-1)).toBe(0);
  });

  it("ACT_RANGES partition the timeline 0–33–66–100 %", () => {
    expect(ACT_RANGES.I.from).toBe(0);
    expect(ACT_RANGES.III.to).toBe(1);
  });

  it("actForProgress returns I, II, III correctly", () => {
    expect(actForProgress(0.10)).toBe("I");
    expect(actForProgress(0.50)).toBe("II");
    expect(actForProgress(0.80)).toBe("III");
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
npm test
```

- [ ] **Step 3: Create `web/src/lib/frames.ts`**

```ts
export const TOTAL_FRAMES = 450; // 30 fps × 15 s

export const ACT_RANGES = {
  I:   { from: 0,    to: 1/3 },
  II:  { from: 1/3,  to: 2/3 },
  III: { from: 2/3,  to: 1   },
} as const;

export type Act = keyof typeof ACT_RANGES;

export function frameForProgress(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return TOTAL_FRAMES - 1;
  return Math.round(p * (TOTAL_FRAMES - 1));
}

export function actForProgress(p: number): Act {
  if (p < ACT_RANGES.I.to)  return "I";
  if (p < ACT_RANGES.II.to) return "II";
  return "III";
}

export function framePath(width: 1920 | 1280 | 720, frameIndex: number): string {
  const idx = String(frameIndex).padStart(3, "0");
  return `/frames/${width}w/frame-${idx}.webp`;
}
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/frames.ts web/test/lib/frames.test.ts
git commit -m "feat(web): frame-index math + act ranges (TDD)"
```

---

### Task 14: `<FrameSequence>` — canvas frame renderer

**Files:**
- Create: `web/src/components/hero-scrub/FrameSequence.tsx`
- Create: `web/test/components/FrameSequence.test.tsx`

- [ ] **Step 1: Write test (renders canvas, accepts progress prop)**

```tsx
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FrameSequence } from "@/components/hero-scrub/FrameSequence";

describe("FrameSequence", () => {
  it("renders a canvas with aria-hidden", () => {
    const { container } = render(<FrameSequence progress={0} width={720} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("preloads first 30 frames (eager)", () => {
    const { container } = render(<FrameSequence progress={0} width={720} />);
    const links = container.querySelectorAll("link[rel='preload'][as='image']");
    expect(links.length).toBe(30);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL** (`npm test`)

- [ ] **Step 3: Create `web/src/components/hero-scrub/FrameSequence.tsx`**

```tsx
"use client";
import { useEffect, useMemo, useRef } from "react";
import { TOTAL_FRAMES, frameForProgress, framePath } from "@/lib/frames";

type Props = {
  progress: number;            // 0..1, scroll-driven
  width: 1920 | 1280 | 720;
  className?: string;
};

const EAGER_COUNT = 30;

export function FrameSequence({ progress, width, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const lastDrawnRef = useRef<number>(-1);

  // Lazy-load all frames in the background after mount
  useEffect(() => {
    let cancelled = false;
    const queue = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);
    let inflight = 0;
    const MAX_PARALLEL = 6;

    const loadOne = (idx: number) => new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => { imagesRef.current.set(idx, img); resolve(); };
      img.onerror = () => resolve();
      img.src = framePath(width, idx);
    });

    async function pump() {
      while (queue.length && !cancelled) {
        if (inflight >= MAX_PARALLEL) {
          await new Promise(r => setTimeout(r, 16));
          continue;
        }
        const idx = queue.shift()!;
        inflight++;
        loadOne(idx).then(() => { inflight--; });
      }
    }
    pump();
    return () => { cancelled = true; };
  }, [width]);

  // Render current frame on progress change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const idx = frameForProgress(progress);
    if (idx === lastDrawnRef.current) return;

    let target = idx;
    let img = imagesRef.current.get(target);
    if (!img) {
      // Find nearest available
      for (let d = 1; d < TOTAL_FRAMES && !img; d++) {
        img = imagesRef.current.get(target - d) || imagesRef.current.get(target + d);
        if (img) target = imagesRef.current.get(target - d) ? target - d : target + d;
      }
    }
    if (!img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    lastDrawnRef.current = target;
  }, [progress]);

  const eagerLinks = useMemo(
    () => Array.from({ length: EAGER_COUNT }, (_, i) => framePath(width, i)),
    [width]
  );

  return (
    <>
      {/* Eager-load first frames so Akt I is instant */}
      {eagerLinks.map((href) => (
        <link key={href} rel="preload" as="image" href={href} />
      ))}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={className ?? "absolute inset-0 w-full h-full object-cover"}
      />
    </>
  );
}
```

Note: rendering `<link>` elements inside React works but they end up in `<body>`. For SEO/preload semantics, in production we'd hoist these to `<head>` via `next/script` or `useEffect` insertion. For tests we just check they render.

- [ ] **Step 4: Run tests, expect PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add web/src/components/hero-scrub/FrameSequence.tsx web/test/components/FrameSequence.test.tsx
git commit -m "feat(web): FrameSequence canvas component with progressive loading (TDD)"
```

---

### Task 15: `<HeroScrub>` container — scroll stage with GSAP ScrollTrigger

**Files:**
- Create: `web/src/components/hero-scrub/HeroScrub.tsx`
- Create: `web/src/components/hero-scrub/index.ts`

- [ ] **Step 1: Create `web/src/components/hero-scrub/HeroScrub.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "./FrameSequence";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

function pickWidth(): 1920 | 1280 | 720 {
  if (typeof window === "undefined") return 1280;
  const w = window.innerWidth;
  if (w >= 1600) return 1920;
  if (w >= 900)  return 1280;
  return 720;
}

export function HeroScrub({ children }: { children?: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState<1920 | 1280 | 720>(1280);

  useEffect(() => { setWidth(pickWidth()); }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setProgress(0.5); return; }

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => setProgress(self.progress),
    });
    return () => trigger.kill();
  }, []);

  return (
    <section
      ref={stageRef}
      className="relative"
      style={{ height: "500vh" }}
      data-progress={progress}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-noir-900"
      >
        <FrameSequence progress={progress} width={width} />
        {children /* CursorSpotlight + ParallaxLayer + ActOverlay slot */}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create barrel `web/src/components/hero-scrub/index.ts`**

```ts
export { HeroScrub } from "./HeroScrub";
export { FrameSequence } from "./FrameSequence";
```

- [ ] **Step 3: Add HeroScrub to `web/src/app/page.tsx`**

```tsx
import { HeroScrub } from "@/components/hero-scrub";

export default function Home() {
  return (
    <main>
      <HeroScrub />
      <section className="min-h-screen flex items-center justify-center bg-noir-900">
        <p className="text-copper-300">More to come…</p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Visual smoke test**

```bash
cd web && npm run dev
```

Open http://localhost:3000. Scroll. The 500vh hero stage should pin and progress should track scroll. Without frames extracted, canvas is empty — that's expected until Task 12 produces files.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/hero-scrub/ web/src/app/page.tsx
git commit -m "feat(web): HeroScrub container with GSAP ScrollTrigger"
```

---

### Task 16: `<ActOverlay>` — Akt I, II, III content layers

**Files:**
- Create: `web/src/components/hero-scrub/ActOverlay.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { actForProgress, ACT_RANGES, type Act } from "@/lib/frames";
import { HERO } from "@/lib/content";
import { motion, AnimatePresence } from "framer-motion";

function progressWithinAct(progress: number, act: Act): number {
  const range = ACT_RANGES[act];
  return Math.max(0, Math.min(1, (progress - range.from) / (range.to - range.from)));
}

export function ActOverlay({ progress }: { progress: number }) {
  const currentAct = actForProgress(progress);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        {currentAct === "I" && <ActI key="I" innerP={progressWithinAct(progress, "I")} />}
        {currentAct === "II" && <ActII key="II" innerP={progressWithinAct(progress, "II")} />}
        {currentAct === "III" && <ActIII key="III" innerP={progressWithinAct(progress, "III")} />}
      </AnimatePresence>
    </div>
  );
}

function ActI({ innerP }: { innerP: number }) {
  // Fade in 0–0.25, hold 0.25–0.85, fade out 0.85–1.0
  const fadeIn = Math.min(1, innerP / 0.25);
  const fadeOut = innerP > 0.85 ? Math.max(0, 1 - (innerP - 0.85) / 0.15) : 1;
  const opacity = fadeIn * fadeOut;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col justify-center pl-8 md:pl-24"
      style={{ opacity }}
      initial={{ x: -40 }} animate={{ x: 0 }}
      transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
    >
      <h1 className="text-5xl md:text-7xl text-copper-100 font-light leading-none">
        {HERO.taglineLine1}
      </h1>
      <h1 className="text-5xl md:text-7xl text-copper-300 font-light leading-none italic mt-2">
        {HERO.taglineLine2}
      </h1>
      <p className="mt-6 max-w-md text-stone-400 text-base md:text-lg">
        {HERO.subHeadline}
      </p>
    </motion.div>
  );
}

function ActII({ innerP }: { innerP: number }) {
  const items = HERO.actII.items;
  const visibleCount = Math.min(items.length, Math.floor(innerP * (items.length + 1)));
  return (
    <motion.div
      className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-right"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <span className="text-xs tracking-[0.3em] uppercase text-copper-300 mb-2">
        {HERO.actII.label}
      </span>
      {items.map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: i < visibleCount ? 1 : 0, x: i < visibleCount ? 0 : 30 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-2xl md:text-3xl text-stone-100 font-display"
        >
          {item}
        </motion.span>
      ))}
    </motion.div>
  );
}

function ActIII({ innerP }: { innerP: number }) {
  const showHotspots = innerP > 0.6;  // delegated to HotSpotMarker visibility
  return (
    <motion.div
      className="absolute inset-0 flex items-end justify-center pb-16"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <span className="text-xs tracking-[0.3em] uppercase text-copper-300">
        {showHotspots ? "Hovra över delarna" : "Anatomin avslöjas"}
      </span>
    </motion.div>
  );
}
```

- [ ] **Step 2: Wire into HeroScrub** in `page.tsx`:

```tsx
import { HeroScrub, ActOverlay } from "@/components/hero-scrub";

export default function Home() {
  return (
    <main>
      <HeroScrub>
        {/* progress is consumed via React context — see Step 3 */}
      </HeroScrub>
    </main>
  );
}
```

- [ ] **Step 3: Update `HeroScrub` to provide progress via context**

Modify `web/src/components/hero-scrub/HeroScrub.tsx` — add a context:

```tsx
import { createContext, useContext } from "react";
const ProgressCtx = createContext(0);
export const useHeroProgress = () => useContext(ProgressCtx);

// inside HeroScrub return JSX, wrap the sticky div:
<ProgressCtx.Provider value={progress}>
  <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden bg-noir-900">
    <FrameSequence progress={progress} width={width} />
    {children}
  </div>
</ProgressCtx.Provider>
```

Update `web/src/components/hero-scrub/index.ts`:
```ts
export { HeroScrub, useHeroProgress } from "./HeroScrub";
export { FrameSequence } from "./FrameSequence";
export { ActOverlay } from "./ActOverlay";
```

- [ ] **Step 4: Update `ActOverlay` to use the context** (remove `progress` prop, read via `useHeroProgress()`).

- [ ] **Step 5: Use it in `page.tsx`**

```tsx
<HeroScrub>
  <ActOverlay />
</HeroScrub>
```

- [ ] **Step 6: Visual smoke test** (`npm run dev`) — scroll through hero, verify Akt I tagline appears, then service-titles in Akt II, then Akt III subtitle.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/hero-scrub/
git commit -m "feat(web): ActOverlay with per-act animations + progress context"
```

---

### Task 17: `<HotSpotMarker>` — clickable parts on exploded view

**Files:**
- Create: `web/src/components/hero-scrub/HotSpotMarker.tsx`
- Create: `web/test/components/HotSpotMarker.test.tsx`

- [ ] **Step 1: Define hot-spot positions** in `web/src/lib/hotspots.ts`

```ts
import type { ServiceSlug } from "./pricing";

// Coordinates are percentages of the canvas. Confirm against final hero video.
export type HotSpotPosition = {
  id: string;
  service: ServiceSlug | "emissionsOff";   // "emissionsOff" maps to multi-select
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
```

- [ ] **Step 2: Write test for HotSpotMarker**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { HotSpotMarker } from "@/components/hero-scrub/HotSpotMarker";

describe("HotSpotMarker", () => {
  it("renders with aria-label", () => {
    render(<HotSpotMarker x={50} y={50} label="Stage 1" service="stage1" visible={true} onActivate={() => {}} />);
    expect(screen.getByRole("button", { name: /Stage 1/ })).toBeInTheDocument();
  });

  it("hides when visible=false", () => {
    render(<HotSpotMarker x={50} y={50} label="X" service="stage1" visible={false} onActivate={() => {}} />);
    const btn = screen.getByRole("button", { name: /X/ });
    expect(btn).toHaveStyle({ opacity: "0" });
  });

  it("calls onActivate on click", async () => {
    const cb = vi.fn();
    render(<HotSpotMarker x={50} y={50} label="X" service="stage1" visible={true} onActivate={cb} />);
    await userEvent.click(screen.getByRole("button"));
    expect(cb).toHaveBeenCalledWith("stage1");
  });
});
```

- [ ] **Step 3: Run test, expect FAIL** (`npm test`)

- [ ] **Step 4: Implement `HotSpotMarker.tsx`**

```tsx
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
```

- [ ] **Step 5: Run tests, expect PASS** (`npm test`)

- [ ] **Step 6: Render hot-spots inside HeroScrub** — create `web/src/components/hero-scrub/HotSpotLayer.tsx`:

```tsx
"use client";
import { useHeroProgress } from "./HeroScrub";
import { HotSpotMarker } from "./HotSpotMarker";
import { HOTSPOTS } from "@/lib/hotspots";
import { actForProgress, ACT_RANGES } from "@/lib/frames";

export function HotSpotLayer({ onActivate }: { onActivate: (service: string) => void }) {
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
            onActivate={(s) => onActivate(s)}
          />
        );
      })}
    </div>
  );
}
```

Export from `index.ts`:
```ts
export { HotSpotLayer } from "./HotSpotLayer";
```

- [ ] **Step 7: Wire into `page.tsx`** (handler is a stub for now — Task 31 hooks it into Zustand):

```tsx
<HeroScrub>
  <ActOverlay />
  <HotSpotLayer onActivate={(s) => console.log("hot-spot:", s)} />
</HeroScrub>
```

- [ ] **Step 8: Commit**

```bash
git add web/src/components/hero-scrub/ web/src/lib/hotspots.ts web/test/components/HotSpotMarker.test.tsx web/src/app/page.tsx
git commit -m "feat(web): HotSpotMarker + HotSpotLayer for Akt III (TDD)"
```

---

### Task 18: `<CursorSpotlight>` — full-viewport canvas radial light

**Files:**
- Create: `web/src/components/effects/CursorSpotlight.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef } from "react";

export function CursorSpotlight({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // mobile/touch
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const { x, y } = mouseRef.current;
      const grad = ctx.createRadialGradient(x, y, 100, x, y, 600);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.4, "rgba(0,0,0,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-30"
    />
  );
}
```

- [ ] **Step 2: Use inside HeroScrub or as page-level overlay** — add to `page.tsx`:

```tsx
import { CursorSpotlight } from "@/components/effects/CursorSpotlight";

<main>
  <CursorSpotlight />
  <HeroScrub>...</HeroScrub>
</main>
```

- [ ] **Step 3: Visual smoke test** (`npm run dev`) — move mouse, confirm soft spotlight follows.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/effects/CursorSpotlight.tsx web/src/app/page.tsx
git commit -m "feat(web): CursorSpotlight canvas overlay"
```

---

### Task 19: `<ParallaxLayer>` — particle dust floats over hero

**Files:**
- Create: `web/src/components/effects/ParallaxLayer.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";
import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; r: number; alpha: number; vy: number; phase: number };

export function ParallaxLayer({ count }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    const N = count ?? (isMobile ? 30 : 80);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    particlesRef.current = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.3,
      vy: -0.1 - Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    }));

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const t = performance.now() * 0.001;
      for (const p of particlesRef.current) {
        p.y += p.vy;
        p.x += Math.sin(t + p.phase) * 0.2;

        // Subtle cursor influence
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150) {
          p.x -= dx * 0.0008;
          p.y -= dy * 0.0008;
        }

        if (p.y < -10) { p.y = window.innerHeight + 10; p.x = Math.random() * window.innerWidth; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 232, 208, ${p.alpha})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}
```

- [ ] **Step 2: Use inside HeroScrub**

```tsx
<HeroScrub>
  <ParallaxLayer />
  <ActOverlay />
  <HotSpotLayer onActivate={...} />
</HeroScrub>
```

- [ ] **Step 3: Visual smoke test** (`npm run dev`).

- [ ] **Step 4: Commit**

```bash
git add web/src/components/effects/ParallaxLayer.tsx web/src/app/page.tsx
git commit -m "feat(web): ParallaxLayer dust particles in hero"
```

---

### Task 20: Lenis smooth scroll provider

**Files:**
- Create: `web/src/components/lenis/SmoothScroll.tsx`

- [ ] **Step 1: Create the provider**

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 2: Wrap layout**

`web/src/app/layout.tsx` — wrap children in `<SmoothScroll>`:

```tsx
import { SmoothScroll } from "@/components/lenis/SmoothScroll";

return (
  <html lang="sv" className={`${display.variable} ${body.variable}`}>
    <body className="antialiased bg-noir-900 text-stone-100">
      <SmoothScroll>{children}</SmoothScroll>
    </body>
  </html>
);
```

- [ ] **Step 3: Visual smoke test** — scroll feels smoother (less jerky).

- [ ] **Step 4: Commit**

```bash
git add web/src/components/lenis/ web/src/app/layout.tsx
git commit -m "feat(web): Lenis smooth scroll provider"
```

---

### Task 21: Reduced-motion fallback (full hero replacement)

**Files:**
- Modify: `web/src/components/hero-scrub/HeroScrub.tsx`
- Create: `web/src/components/hero-scrub/HeroStatic.tsx`

- [ ] **Step 1: Create static fallback `HeroStatic.tsx`**

```tsx
"use client";
import { HERO } from "@/lib/content";
import { framePath } from "@/lib/frames";

export function HeroStatic() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-noir-900">
      <img
        src={framePath(1280, 225)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-noir-900/80 via-noir-900/40 to-transparent" />
      <div className="relative z-10 flex flex-col justify-center h-full pl-8 md:pl-24">
        <h1 className="text-5xl md:text-7xl text-copper-100 font-light leading-none">{HERO.taglineLine1}</h1>
        <h1 className="text-5xl md:text-7xl text-copper-300 font-light leading-none italic mt-2">{HERO.taglineLine2}</h1>
        <p className="mt-6 max-w-md text-stone-400 text-base md:text-lg">{HERO.subHeadline}</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Branch in `HeroScrub`** — at the top of `HeroScrub`:

```tsx
const [reduced, setReduced] = useState(false);
useEffect(() => {
  setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}, []);
if (reduced) return <HeroStatic />;
```

- [ ] **Step 3: Manual test** — in browser dev tools, emulate `prefers-reduced-motion: reduce`. Refresh. Should see static hero only.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/hero-scrub/
git commit -m "feat(web): reduced-motion fallback for hero"
```

---

### Task 22: Error boundaries (root + hero)

**Files:**
- Create: `web/src/components/ui/ErrorBoundary.tsx`
- Create: `web/src/app/error.tsx`
- Create: `web/src/app/global-error.tsx`

- [ ] **Step 1: Next.js error route `web/src/app/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { COMPANY } from "@/lib/content";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-900 text-copper-100 px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl mb-4">Något gick fel.</h1>
        <p className="mb-6 text-stone-400">
          Ring oss på <a href={`tel:${COMPANY.phoneTel}`} className="text-copper-300 underline">{COMPANY.phone}</a>{" "}
          eller mejla <a href={`mailto:${COMPANY.email}`} className="text-copper-300 underline">{COMPANY.email}</a>.
        </p>
        <button onClick={reset} className="px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition">
          Försök igen
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Global error `web/src/app/global-error.tsx`** (covers layout crashes):

```tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="sv">
      <body style={{ background:"#0a0a0f", color:"#f0e0c8", padding:24, fontFamily:"sans-serif" }}>
        <h1>Något gick fel.</h1>
        <p>Ring 08-33 33 46 eller mejla info@speedison.se.</p>
        <button onClick={reset} style={{ marginTop:16 }}>Försök igen</button>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Generic React class boundary** for component-level fallbacks (used around hero):

```tsx
// web/src/components/ui/ErrorBoundary.tsx
"use client";
import { Component, type ReactNode } from "react";

type State = { hasError: boolean };
type Props = { fallback: ReactNode; children: ReactNode };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error("ErrorBoundary:", err); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}
```

- [ ] **Step 4: Wrap HeroScrub in page.tsx**:

```tsx
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { HeroStatic } from "@/components/hero-scrub/HeroStatic";

<ErrorBoundary fallback={<HeroStatic />}>
  <HeroScrub>...</HeroScrub>
</ErrorBoundary>
```

- [ ] **Step 5: Commit**

```bash
git add web/src/app/error.tsx web/src/app/global-error.tsx web/src/components/ui/ErrorBoundary.tsx web/src/app/page.tsx
git commit -m "feat(web): error boundaries (route + global + hero fallback)"
```

---

## Milestone 3 — Pages, Components, Configurator

### Task 23: `<Navbar>` — sticky header with logo

**Files:**
- Create: `web/src/components/ui/Navbar.tsx`

- [ ] **Step 1: Create Navbar**

```tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/content";

export function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        solid ? "bg-noir-900/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 py-4">
        <Link href="/" aria-label={COMPANY.name}>
          <Image src="/brand/logo.png" alt={COMPANY.name} width={160} height={36} priority />
        </Link>
        <ul className="hidden md:flex gap-8 text-sm tracking-[0.2em] uppercase text-stone-300">
          <li><a href="#tjanster" className="hover:text-copper-300">Tjänster</a></li>
          <li><a href="#galleri" className="hover:text-copper-300">Galleri</a></li>
          <li><a href="#konfigurator" className="hover:text-copper-300">Offert</a></li>
          <li><Link href="/kontakt" className="hover:text-copper-300">Kontakt</Link></li>
        </ul>
        <a
          href="#konfigurator"
          className="px-5 py-2 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition text-sm tracking-[0.2em] uppercase"
        >
          Konfigurera
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Add to layout** in `web/src/app/layout.tsx`:

```tsx
import { Navbar } from "@/components/ui/Navbar";

<body ...>
  <SmoothScroll>
    <Navbar />
    {children}
  </SmoothScroll>
</body>
```

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/Navbar.tsx web/src/app/layout.tsx
git commit -m "feat(web): Navbar with transparent→solid scroll behavior"
```

---

### Task 24: `<Footer>` — address, hours, social

**Files:**
- Create: `web/src/components/ui/Footer.tsx`

- [ ] **Step 1: Create Footer**

```tsx
import { COMPANY } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-noir-950 text-stone-400 py-16 px-6 md:px-12 border-t border-noir-800">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Besök oss</h3>
          <p className="leading-relaxed">{COMPANY.address}</p>
          <p className="mt-3">
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-copper-300">{COMPANY.phone}</a>
          </p>
          <p>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-copper-300">{COMPANY.email}</a>
          </p>
        </div>
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Öppettider</h3>
          <ul className="space-y-1">
            {COMPANY.hours.map(h => (
              <li key={h.days}>
                <span className="inline-block w-24">{h.days}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Följ oss</h3>
          <ul className="space-y-2">
            <li><a href={COMPANY.social.instagram} target="_blank" rel="noopener" className="hover:text-copper-300">Instagram</a></li>
            <li><a href={COMPANY.social.facebook} target="_blank" rel="noopener" className="hover:text-copper-300">Facebook</a></li>
          </ul>
          <p className="mt-8 text-xs text-stone-500">Org.nr {COMPANY.orgNr}</p>
          <p className="text-xs text-stone-500"><a href="/integritet" className="hover:text-copper-300">Integritetspolicy</a></p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add to layout**

```tsx
import { Footer } from "@/components/ui/Footer";

<body ...>
  <SmoothScroll>
    <Navbar />
    {children}
    <Footer />
  </SmoothScroll>
</body>
```

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/Footer.tsx web/src/app/layout.tsx
git commit -m "feat(web): Footer with address, hours, social"
```

---

### Task 25: `<SoundToggle>` and Howler audio singleton

**Files:**
- Create: `web/src/lib/audio.ts`
- Create: `web/src/components/ui/SoundToggle.tsx`

- [ ] **Step 1: Create `lib/audio.ts`**

```ts
import { Howl } from "howler";

let engine: Howl | null = null;
let click: Howl | null = null;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!engine) engine = new Howl({ src: ["/audio/engine-rev.mp3"], loop: true, volume: 0 });
  if (!click) click = new Howl({ src: ["/audio/click-thunk.mp3"], volume: 0.3 });
}

export function setMuted(muted: boolean) {
  initAudio();
  if (!engine) return;
  if (muted) {
    engine.volume(0);
  } else {
    if (!engine.playing()) engine.play();
    engine.fade(0, 0.2, 800);
  }
  localStorage.setItem("speedison-muted", muted ? "1" : "0");
}

export function playClick() {
  initAudio();
  if (localStorage.getItem("speedison-muted") === "1") return;
  click?.play();
}

export function getInitialMuted(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem("speedison-muted");
  return v === null ? true : v === "1";
}
```

- [ ] **Step 2: Create `<SoundToggle>` `web/src/components/ui/SoundToggle.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { setMuted, getInitialMuted } from "@/lib/audio";

export function SoundToggle() {
  const [muted, setLocal] = useState(true);

  useEffect(() => {
    const initial = getInitialMuted();
    setLocal(initial);
    setMuted(initial);
  }, []);

  function toggle() {
    const next = !muted;
    setLocal(next);
    setMuted(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Aktivera ljud" : "Stäng av ljud"}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border border-copper-300 bg-noir-900/80 backdrop-blur text-copper-300 flex items-center justify-center hover:bg-copper-300 hover:text-noir-900 transition"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
```

- [ ] **Step 3: Add placeholder audio files** (real files supplied by user later)

```bash
mkdir -p web/public/audio
# user supplies these — placeholder empty files for now
echo "" > web/public/audio/engine-rev.mp3
echo "" > web/public/audio/click-thunk.mp3
```

- [ ] **Step 4: Wire SoundToggle into layout**

```tsx
import { SoundToggle } from "@/components/ui/SoundToggle";

<body ...>
  <SmoothScroll>
    <Navbar />
    {children}
    <SoundToggle />
    <Footer />
  </SmoothScroll>
</body>
```

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/audio.ts web/src/components/ui/SoundToggle.tsx web/public/audio/ web/src/app/layout.tsx
git commit -m "feat(web): Howler audio + SoundToggle (default muted)"
```

---

### Task 26: `<ChapterScene>` base component + 4 chapters

**Files:**
- Create: `web/src/components/chapter/ChapterScene.tsx`
- Create: `web/src/components/chapter/chapters.tsx`

- [ ] **Step 1: Create base `ChapterScene`**

```tsx
"use client";
import { motion } from "framer-motion";
import { formatPriceRange } from "@/lib/pricing";
import type { ServiceSlug } from "@/lib/pricing";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: readonly string[];
  serviceSlugs: readonly ServiceSlug[];
  priceFrom: number | null;
  priceTo: number | null;
  videoSrc?: string;          // atmos bg
  align?: "left" | "right";
};

export function ChapterScene(p: Props) {
  return (
    <section
      id={p.id}
      className="relative min-h-screen flex items-center bg-noir-900 overflow-hidden"
    >
      {p.videoSrc && (
        <video
          src={p.videoSrc}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-noir-900 via-noir-900/70 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        className={`relative z-10 max-w-3xl px-6 md:px-12 ${p.align === "right" ? "ml-auto pr-12 md:pr-24" : "pl-12 md:pl-24"}`}
      >
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">{p.eyebrow}</span>
        <h2 className="font-display text-4xl md:text-6xl text-stone-100 mt-2 leading-tight">{p.title}</h2>
        <p className="mt-6 text-stone-400 text-lg leading-relaxed">{p.body}</p>
        {p.bullets && (
          <ul className="mt-6 space-y-2 text-stone-300">
            {p.bullets.map(b => <li key={b}>· {b}</li>)}
          </ul>
        )}
        <div className="mt-8 flex items-center gap-6">
          <span className="text-copper-300 font-display text-2xl">
            {formatPriceRange(p.priceFrom, p.priceTo)}
          </span>
          <a
            href="#konfigurator"
            data-services={p.serviceSlugs.join(",")}
            className="px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition text-sm tracking-[0.2em] uppercase"
          >
            Lägg till i offert
          </a>
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Create concrete chapters `chapters.tsx`**

```tsx
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
      serviceSlugs={["stage1","stage2"]}
      priceFrom={null} priceTo={null}
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
      priceFrom={2995} priceTo={null}
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
      serviceSlugs={["egrOff","dpfOff","adblueOff","noxOff"]}
      priceFrom={1995} priceTo={null}
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
      priceFrom={null} priceTo={null}
      align="right"
    />
  );
}
```

- [ ] **Step 3: Add to `page.tsx`**

```tsx
import { StageChapter, PopsBangsChapter, EmissionsChapter, ExhaustChapter } from "@/components/chapter/chapters";

<main>
  <CursorSpotlight />
  <ErrorBoundary fallback={<HeroStatic />}>
    <HeroScrub>...</HeroScrub>
  </ErrorBoundary>
  <section id="tjanster">
    <StageChapter />
    <PopsBangsChapter />
    <EmissionsChapter />
    <ExhaustChapter />
  </section>
</main>
```

- [ ] **Step 4: Commit**

```bash
git add web/src/components/chapter/ web/src/app/page.tsx
git commit -m "feat(web): chapter scenes with framer-motion reveals"
```

---

### Task 27: `<PortfolioGallery>` — masonry of customer photos

**Files:**
- Create: `web/src/components/ui/PortfolioGallery.tsx`

- [ ] **Step 1: Create gallery**

```tsx
import Image from "next/image";

const ITEMS = [
  { src: "/gallery/c63s-stage2.jpg",     alt: "Mercedes C63 S — Stage 2",        wide: false },
  { src: "/gallery/rs6-stage1-a.jpg",    alt: "Audi RS6 — Stage 1",              wide: true  },
  { src: "/gallery/c63s-stage1.jpg",     alt: "Mercedes C63 S — Stage 1",        wide: false },
  { src: "/gallery/a35-stage1-pops.jpg", alt: "Mercedes-AMG A35 — Stage 1 + Pops", wide: false },
  { src: "/gallery/exhaust-closeup.jpg", alt: "Avgassystem-närbild",             wide: true  },
  { src: "/gallery/rs6-stage1-b.jpg",    alt: "Audi RS6 — Stage 1",              wide: false },
];

export function PortfolioGallery() {
  return (
    <section id="galleri" className="py-32 px-6 md:px-12 bg-noir-950">
      <div className="max-w-6xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Gjort hos oss</span>
        <h2 className="font-display text-4xl md:text-6xl text-stone-100 mt-2 mb-12">Bilar i verkstaden</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ITEMS.map((it) => (
            <div key={it.src} className={`relative aspect-square overflow-hidden ${it.wide ? "md:col-span-2 md:aspect-[2/1]" : ""}`}>
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes="(min-width:1024px) 33vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page** (after chapters, before configurator placeholder).

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/PortfolioGallery.tsx web/src/app/page.tsx
git commit -m "feat(web): PortfolioGallery with customer photos"
```

---

### Task 28: `<FAQ>` — accordion

**Files:**
- Create: `web/src/components/ui/FAQ.tsx`

- [ ] **Step 1: Create accordion**

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQ_ITEMS } from "@/lib/content";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-32 px-6 md:px-12 bg-noir-900">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Frågor & svar</span>
        <h2 className="font-display text-4xl md:text-5xl text-stone-100 mt-2 mb-10">Vad du undrar.</h2>
        <ul className="divide-y divide-noir-700 border-y border-noir-700">
          {FAQ_ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <li key={it.q}>
                <button
                  className="w-full flex justify-between items-center py-6 text-left text-stone-100 hover:text-copper-300 transition"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-lg md:text-xl font-display">{it.q}</span>
                  <span className="text-copper-300">{isOpen ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-stone-400 leading-relaxed">{it.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to page** (above footer).

- [ ] **Step 3: Commit**

```bash
git add web/src/components/ui/FAQ.tsx web/src/app/page.tsx
git commit -m "feat(web): FAQ accordion"
```

---

### Task 29: Configurator Zustand store

**Files:**
- Create: `web/src/components/configurator/store.ts`
- Create: `web/test/components/configurator/store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useConfiguratorStore } from "@/components/configurator/store";

describe("configuratorStore", () => {
  beforeEach(() => useConfiguratorStore.getState().reset());

  it("starts at step 1 with empty state", () => {
    const s = useConfiguratorStore.getState();
    expect(s.step).toBe(1);
    expect(s.selectedServices).toEqual([]);
  });

  it("setMake advances to step 2", () => {
    useConfiguratorStore.getState().setMake("Mercedes");
    const s = useConfiguratorStore.getState();
    expect(s.selectedMake).toBe("Mercedes");
    expect(s.step).toBe(2);
  });

  it("addService toggles in selectedServices", () => {
    const a = useConfiguratorStore.getState();
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1"]);
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual([]);
  });

  it("preselectFromHotspot adds the service and jumps to step 3", () => {
    useConfiguratorStore.getState().preselectFromHotspot("popsBangs");
    const s = useConfiguratorStore.getState();
    expect(s.selectedServices).toEqual(["popsBangs"]);
    expect(s.step).toBe(3);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL** (`npm test`).

- [ ] **Step 3: Create store**

```ts
import { create } from "zustand";
import type { ServiceSlug } from "@/lib/pricing";

type Vehicle = { make: string; model: string; engine: string; year: number | null };
type Contact = { name: string; phone: string; email: string; message: string };

type State = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  vehicle: Vehicle;
  selectedServices: ServiceSlug[];
  contact: Contact;
  gdprConsent: boolean;
  setMake: (make: string) => void;
  setModel: (model: string) => void;
  setEngine: (engine: string, year: number | null) => void;
  addService: (slug: ServiceSlug) => void;
  setContact: (c: Partial<Contact>) => void;
  setGdpr: (v: boolean) => void;
  goToStep: (s: State["step"]) => void;
  preselectFromHotspot: (slug: ServiceSlug | "emissionsOff") => void;
  reset: () => void;
};

const EMPTY: Pick<State, "vehicle"|"contact"|"selectedServices"|"gdprConsent"|"step"> = {
  step: 1,
  vehicle: { make: "", model: "", engine: "", year: null },
  contact: { name: "", phone: "", email: "", message: "" },
  selectedServices: [],
  gdprConsent: false,
};

export const useConfiguratorStore = create<State>((set, get) => ({
  ...EMPTY,
  setMake: (make) => set(s => ({ vehicle: { ...s.vehicle, make }, step: make ? 2 : 1 })),
  setModel: (model) => set(s => ({ vehicle: { ...s.vehicle, model }, step: model ? 3 : 2 })),
  setEngine: (engine, year) => set(s => ({ vehicle: { ...s.vehicle, engine, year }, step: 4 })),
  addService: (slug) => set(s => ({
    selectedServices: s.selectedServices.includes(slug)
      ? s.selectedServices.filter(x => x !== slug)
      : [...s.selectedServices, slug],
  })),
  setContact: (c) => set(s => ({ contact: { ...s.contact, ...c } })),
  setGdpr: (v) => set({ gdprConsent: v }),
  goToStep: (step) => set({ step }),
  preselectFromHotspot: (slug) => {
    if (slug === "emissionsOff") {
      // EmissionsOff opens step 4 with EGR pre-toggled (representative)
      set(s => ({
        selectedServices: s.selectedServices.includes("egrOff")
          ? s.selectedServices : [...s.selectedServices, "egrOff"],
        step: 4,
      }));
      return;
    }
    set(s => ({
      selectedServices: s.selectedServices.includes(slug)
        ? s.selectedServices : [...s.selectedServices, slug],
      step: 3,
    }));
  },
  reset: () => set(EMPTY),
}));
```

- [ ] **Step 4: Run test, expect PASS.**

- [ ] **Step 5: Commit**

```bash
git add web/src/components/configurator/store.ts web/test/components/configurator/store.test.ts
git commit -m "feat(web): configurator Zustand store with hot-spot preselection (TDD)"
```

---

### Task 30: Configurator step components (5 steps + progress bar)

**Files:**
- Create: `web/src/components/configurator/ProgressBar.tsx`
- Create: `web/src/components/configurator/StepMake.tsx`
- Create: `web/src/components/configurator/StepModel.tsx`
- Create: `web/src/components/configurator/StepEngine.tsx`
- Create: `web/src/components/configurator/StepServices.tsx`
- Create: `web/src/components/configurator/StepContact.tsx`
- Create: `web/src/components/configurator/Configurator.tsx`

- [ ] **Step 1: Create `ProgressBar.tsx`**

```tsx
"use client";
import { useConfiguratorStore } from "./store";

const STEPS = ["Märke", "Modell", "Motor", "Tjänster", "Kontakt"];

export function ProgressBar() {
  const step = useConfiguratorStore(s => s.step);
  return (
    <div className="flex items-center justify-between mb-12">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                done ? "bg-copper-300 text-noir-900 border-copper-300"
                : active ? "border-copper-300 text-copper-300"
                : "border-noir-700 text-stone-500"
              }`}
            >{idx}</span>
            <span className={`mt-2 text-xs uppercase tracking-[0.2em] ${active || done ? "text-copper-300" : "text-stone-500"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `StepMake.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

const MAKES = ["Mercedes", "Audi", "BMW", "Volkswagen", "Volvo", "Porsche", "Ford", "Skoda"];

export function StepMake() {
  const setMake = useConfiguratorStore(s => s.setMake);
  const [other, setOther] = useState("");
  return (
    <div>
      <h3 className="font-display text-3xl text-stone-100 mb-8">Vilken bil har du?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MAKES.map(m => (
          <button
            key={m}
            onClick={() => setMake(m)}
            className="p-6 border border-noir-700 hover:border-copper-300 hover:text-copper-300 text-stone-200 transition tracking-[0.15em]"
          >
            {m}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Annat märke</label>
        <div className="flex gap-3">
          <input
            value={other}
            onChange={e => setOther(e.target.value)}
            className="flex-1 bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
            placeholder="t.ex. Tesla"
          />
          <button
            disabled={other.trim().length === 0}
            onClick={() => setMake(other.trim())}
            className="px-6 py-3 border border-copper-300 text-copper-300 disabled:opacity-30 hover:bg-copper-300 hover:text-noir-900 transition"
          >
            Fortsätt
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `StepModel.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

const MODELS_BY_MAKE: Record<string, string[]> = {
  Mercedes: ["AMG A35","AMG A45","AMG C43","AMG C63","AMG E63","AMG GT","CLA","C-Klass"],
  Audi: ["S3","RS3","S4","RS4","S5","RS5","S6","RS6","S7","RS7","S8","TT RS"],
  BMW: ["M2","M3","M4","M5","M8","X3 M","X5 M"],
  Volkswagen: ["Golf GTI","Golf R","Polo GTI","Arteon"],
  Volvo: ["S60","V60","V90","XC60","XC90"],
  Porsche: ["911","Cayenne","Macan","Panamera","718 Cayman"],
  Ford: ["Focus ST","Focus RS","Fiesta ST","Mustang"],
  Skoda: ["Octavia RS","Superb"],
};

export function StepModel() {
  const make = useConfiguratorStore(s => s.vehicle.make);
  const setModel = useConfiguratorStore(s => s.setModel);
  const goBack = useConfiguratorStore(s => s.goToStep);
  const [search, setSearch] = useState("");
  const list = (MODELS_BY_MAKE[make] ?? [])
    .filter(m => m.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <button onClick={() => goBack(1)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">← Byt märke</button>
      <h3 className="font-display text-3xl text-stone-100 mb-8">Modell ({make})</h3>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300 mb-6"
        placeholder="Sök modell..."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {list.map(m => (
          <button
            key={m}
            onClick={() => setModel(m)}
            className="p-4 border border-noir-700 hover:border-copper-300 hover:text-copper-300 text-stone-200 transition"
          >
            {m}
          </button>
        ))}
      </div>
      <div className="mt-8">
        <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Min modell saknas</label>
        <input
          onKeyDown={(e) => { if (e.key === "Enter") setModel((e.target as HTMLInputElement).value.trim()); }}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
          placeholder="Skriv modellnamnet och tryck Enter"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `StepEngine.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

export function StepEngine() {
  const setEngine = useConfiguratorStore(s => s.setEngine);
  const goBack = useConfiguratorStore(s => s.goToStep);
  const [engine, setE] = useState("");
  const [year, setY] = useState<string>("");

  const yNum = year ? parseInt(year, 10) : null;
  const valid = engine.trim().length > 0 && yNum !== null && yNum >= 1990 && yNum <= new Date().getFullYear() + 1;

  return (
    <div>
      <button onClick={() => goBack(2)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">← Byt modell</button>
      <h3 className="font-display text-3xl text-stone-100 mb-8">Motor och årsmodell</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Motorbeteckning</label>
          <input value={engine} onChange={e => setE(e.target.value)} placeholder="t.ex. M177 4.0 V8 Biturbo"
            className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Årsmodell</label>
          <input type="number" value={year} onChange={e => setY(e.target.value)} placeholder="t.ex. 2022"
            className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300" />
        </div>
        <button
          disabled={!valid}
          onClick={() => setEngine(engine.trim(), yNum)}
          className="px-6 py-3 border border-copper-300 text-copper-300 disabled:opacity-30 hover:bg-copper-300 hover:text-noir-900 transition tracking-[0.2em] uppercase"
        >
          Fortsätt
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `StepServices.tsx`**

```tsx
"use client";
import { useConfiguratorStore } from "./store";
import { SERVICES, formatPriceRange, getPriceRange } from "@/lib/pricing";

export function StepServices() {
  const selected = useConfiguratorStore(s => s.selectedServices);
  const addService = useConfiguratorStore(s => s.addService);
  const goTo = useConfiguratorStore(s => s.goToStep);
  const range = getPriceRange(selected);

  return (
    <div>
      <button onClick={() => goTo(3)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">← Byt motor</button>
      <h3 className="font-display text-3xl text-stone-100 mb-2">Vilka tjänster vill du ha?</h3>
      <p className="text-stone-400 mb-8">Välj en eller flera. Du kan ändra senare.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {SERVICES.map(s => {
          const isOn = selected.includes(s.slug);
          return (
            <button
              key={s.slug}
              onClick={() => addService(s.slug)}
              className={`p-6 text-left border transition ${
                isOn ? "border-copper-300 bg-copper-300/10" : "border-noir-700 hover:border-copper-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-display text-xl text-stone-100">{s.name}</span>
                <span className="text-xs text-copper-300 ml-3">{formatPriceRange(s.priceFrom, s.priceTo)}</span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">{s.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-noir-700 pt-6">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-stone-400">Uppskattat</div>
          <div className="text-copper-300 font-display text-2xl">{formatPriceRange(range.from, range.to)}</div>
        </div>
        <button
          disabled={selected.length === 0}
          onClick={() => goTo(5)}
          className="px-6 py-3 border border-copper-300 text-copper-300 disabled:opacity-30 hover:bg-copper-300 hover:text-noir-900 transition tracking-[0.2em] uppercase"
        >
          Fortsätt
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `StepContact.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";
import { LeadSchema } from "@/lib/schemas";
import { submitLead } from "@/lib/api";
import { getPriceRange, formatPriceRange, getService } from "@/lib/pricing";

export function StepContact() {
  const state = useConfiguratorStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);

  const range = getPriceRange(state.selectedServices);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      vehicle: state.vehicle,
      services: state.selectedServices,
      contact: { name, phone, email, message },
      gdprConsent: gdpr,
      honeypot,
    };
    const parsed = LeadSchema.safeParse(payload);
    if (!parsed.success) {
      const map: Record<string,string> = {};
      for (const issue of parsed.error.issues) {
        map[issue.path.join(".")] = issue.message;
      }
      setErrors(map);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const res = await submitLead(parsed.data);
      if (res.ok) {
        window.location.href = `/tack?ref=${encodeURIComponent(res.ref)}`;
      } else {
        setErrors({ _: "Det gick inte att skicka. Vänligen ring 08-33 33 46." });
      }
    } catch {
      setErrors({ _: "Det gick inte att nå servern. Ring 08-33 33 46 eller mejla info@speedison.se." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <button type="button" onClick={() => state.goToStep(4)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">← Byt tjänster</button>
      <h3 className="font-display text-3xl text-stone-100 mb-8">Hur når vi dig?</h3>

      <div className="bg-noir-800 p-6 mb-6 border border-noir-700">
        <div className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">Sammanfattning</div>
        <div className="text-stone-200">{state.vehicle.make} {state.vehicle.model}</div>
        <div className="text-stone-400 text-sm">{state.vehicle.engine}{state.vehicle.year ? ` (${state.vehicle.year})` : ""}</div>
        <ul className="mt-3 text-stone-300 text-sm">
          {state.selectedServices.map(s => <li key={s}>· {getService(s)?.name}</li>)}
        </ul>
        <div className="mt-3 text-copper-300 font-display text-xl">{formatPriceRange(range.from, range.to)}</div>
      </div>

      <div className="space-y-4">
        <Field label="Namn" value={name} onChange={setName} error={errors["contact.name"]} />
        <Field label="Telefon" value={phone} onChange={setPhone} error={errors["contact.phone"]} />
        <Field label="E-post" type="email" value={email} onChange={setEmail} error={errors["contact.email"]} />
        <Field label="Meddelande (valfritt)" value={message} onChange={setMessage} multiline />

        {/* honeypot */}
        <input value={honeypot} onChange={e => setHoneypot(e.target.value)} aria-hidden="true" tabIndex={-1}
               className="absolute -left-[9999px]" autoComplete="off" />

        <label className="flex items-start gap-3 text-sm text-stone-300">
          <input type="checkbox" checked={gdpr} onChange={e => setGdpr(e.target.checked)} className="mt-1" />
          <span>Jag har läst och godkänner <a href="/integritet" className="text-copper-300 underline">integritetspolicyn</a>.</span>
        </label>
        {errors.gdprConsent && <div className="text-red-400 text-xs">{errors.gdprConsent}</div>}
        {errors._ && <div className="text-red-400 text-sm">{errors._}</div>}

        <button type="submit" disabled={submitting}
          className="w-full md:w-auto px-8 py-4 bg-copper-300 text-noir-900 hover:bg-copper-200 disabled:opacity-50 transition tracking-[0.2em] uppercase">
          {submitting ? "Skickar..." : "Skicka offertförfrågan"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, error, type = "text", multiline }: {
  label: string; value: string; onChange: (s:string)=>void; error?: string; type?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300" />
      )}
      {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
    </div>
  );
}
```

- [ ] **Step 7: Create `Configurator.tsx`** (orchestrator)

```tsx
"use client";
import { useConfiguratorStore } from "./store";
import { ProgressBar } from "./ProgressBar";
import { StepMake } from "./StepMake";
import { StepModel } from "./StepModel";
import { StepEngine } from "./StepEngine";
import { StepServices } from "./StepServices";
import { StepContact } from "./StepContact";

export function Configurator() {
  const step = useConfiguratorStore(s => s.step);

  return (
    <section id="konfigurator" className="bg-noir-950 py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Få en offert</span>
        <h2 className="font-display text-4xl md:text-6xl text-stone-100 mt-2 mb-12">Bygg din bil.</h2>
        <ProgressBar />
        {step === 1 && <StepMake />}
        {step === 2 && <StepModel />}
        {step === 3 && <StepEngine />}
        {step === 4 && <StepServices />}
        {step === 5 && <StepContact />}
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Add to `page.tsx`** (after FAQ or chapters):

```tsx
import { Configurator } from "@/components/configurator/Configurator";

<Configurator />
```

- [ ] **Step 9: Wire hot-spot to configurator** in `page.tsx`:

```tsx
"use client";
import { useConfiguratorStore } from "@/components/configurator/store";

const preselect = useConfiguratorStore(s => s.preselectFromHotspot);

<HotSpotLayer onActivate={(s) => {
  preselect(s as any);
  document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });
}} />
```

(Page becomes a client component; or split into a small client wrapper. Simplest: mark `page.tsx` as `"use client"` for now.)

- [ ] **Step 10: Commit**

```bash
git add web/src/components/configurator/ web/src/app/page.tsx
git commit -m "feat(web): 5-step configurator with progress bar + hot-spot wiring"
```

---

### Task 31: API client `lib/api.ts` and thank-you page

**Files:**
- Create: `web/src/lib/api.ts`
- Create: `web/src/app/tack/page.tsx`

- [ ] **Step 1: Create API client**

```ts
// web/src/lib/api.ts
import type { Lead } from "./schemas";

// Same-origin: route handler lives at /api/leads in this Next.js app.
// No CORS, no NEXT_PUBLIC_API_BASE needed.
export type LeadOk = { ok: true; leadId: number; ref: string };
export type LeadErr = { ok: false; error: string; fields?: Record<string,string> };

export async function submitLead(payload: Lead, signal?: AbortSignal): Promise<LeadOk | LeadErr> {
  const res = await fetch(`/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "VALIDATION_FAILED", fields: data.fields };
    }
    return { ok: false, error: "SERVER_ERROR" };
  }
  return await res.json();
}
```

- [ ] **Step 2: Create thank-you page**

```tsx
// web/src/app/tack/page.tsx
import Link from "next/link";
import { COMPANY } from "@/lib/content";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function TackPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-noir-900 px-6">
      <div className="max-w-md text-center">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Tack!</span>
        <h1 className="font-display text-4xl md:text-5xl text-stone-100 mt-2 mb-6">Vi hör av oss inom 24 timmar.</h1>
        <p className="text-stone-400 mb-8">
          Behöver du nå oss snabbare? Ring{" "}
          <a href={`tel:${COMPANY.phoneTel}`} className="text-copper-300 underline">{COMPANY.phone}</a>.
        </p>
        {sp.ref && <p className="text-stone-500 text-sm mb-8">Ärendenummer: <span className="text-copper-300">{sp.ref}</span></p>}
        <Link href="/" className="px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition tracking-[0.2em] uppercase">Tillbaka till hem</Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/api.ts web/src/app/tack/
git commit -m "feat(web): API client + thank-you page"
```

---

### Task 32: Privacy policy page

**Files:**
- Create: `web/src/app/integritet/page.tsx`

- [ ] **Step 1: Create page**

```tsx
import { COMPANY } from "@/lib/content";

export const metadata = { title: "Integritetspolicy — Speedison" };

export default function IntegritetPage() {
  return (
    <main className="min-h-screen bg-noir-900 pt-32 pb-16 px-6 md:px-12">
      <article className="max-w-2xl mx-auto prose prose-invert prose-stone">
        <h1 className="font-display text-4xl text-stone-100">Integritetspolicy</h1>
        <p className="text-stone-400">
          {COMPANY.name} (org.nr {COMPANY.orgNr}, {COMPANY.address}) hanterar personuppgifter enligt GDPR.
        </p>
        <h2>Vilka uppgifter samlar vi in</h2>
        <p>När du skickar en offertförfrågan via vår konfigurator sparar vi: ditt namn, telefonnummer, e-postadress, fritextmeddelande, samt fordonsuppgifter (märke, modell, motor, årsmodell) och vilka tjänster du har valt.</p>
        <h2>Varför</h2>
        <p>Uppgifterna används enbart för att svara på din förfrågan, lämna offert och, om du accepterar, utföra arbetet. Vi delar inte dina uppgifter med tredje part.</p>
        <h2>Hur länge</h2>
        <p>Lead-data sparas i 24 månader och raderas därefter. Du kan begära radering tidigare genom att kontakta oss på <a href={`mailto:${COMPANY.email}`} className="text-copper-300">{COMPANY.email}</a>.</p>
        <h2>Säkerhet</h2>
        <p>Vi lagrar IP-adresser i hashad form (SHA-256) för spam- och skräppostskydd. Webbplatsen serveras alltid över HTTPS.</p>
        <h2>Cookies</h2>
        <p>Vi använder inte några spårnings-cookies. Webbplatsen sätter inga cookies utan ditt aktiva samtycke.</p>
        <h2>Kontakta oss</h2>
        <p>Frågor? <a href={`mailto:${COMPANY.email}`} className="text-copper-300">{COMPANY.email}</a> · {COMPANY.phone}</p>
      </article>
    </main>
  );
}
```

- [ ] **Step 2: Install Tailwind typography plugin** (used by `prose`):

```bash
cd web
npm install -D @tailwindcss/typography
```

In `web/src/app/globals.css` add `@plugin "@tailwindcss/typography";`.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/integritet/ web/package.json web/src/app/globals.css
git commit -m "feat(web): privacy policy page + tailwind typography plugin"
```

---

## Milestone 4 — Backend, polish, launch

### Task 33: Prisma + DB infrastructure

> **Architecture revision (2026-05-08):** Prisma + MySQL ersätter PHP/PDO. Schema bor i `web/prisma/schema.prisma`. Migrations versioneras i `web/prisma/migrations/`. Vid Railway-deploy körs `prisma migrate deploy` automatiskt (se T9).

**Files:**
- Create: `web/prisma/schema.prisma`
- Create: `web/prisma/migrations/<auto>/migration.sql` (genererad)
- Create: `web/src/lib/prisma.ts`
- Create: `web/src/lib/mailer.ts`
- Create: `web/src/lib/ratelimit.ts`
- Create: `web/src/lib/server-origin.ts`
- Create: `web/.env.example`
- Create: `web/test/lib/ratelimit.test.ts`
- Modify: `web/package.json` (Prisma + Resend)

- [ ] **Step 1: Install Prisma, Prisma client, and Resend**

```bash
cd web
npm install -D prisma
npm install @prisma/client resend
```

- [ ] **Step 2: Init Prisma scaffolding**

```bash
npx prisma init --datasource-provider mysql
```

This creates `prisma/schema.prisma` and `.env`. Replace BOTH with the versions in the next steps.

- [ ] **Step 3: Replace `web/prisma/schema.prisma` with the spec schema**

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

- [ ] **Step 4: Create `web/.env.example`** (committed) and update `web/.env` (gitignored, your local dev secrets)

`web/.env.example`:
```
# Local development. Copy to web/.env and fill in.
DATABASE_URL="mysql://root:password@localhost:3306/speedison_dev"
RESEND_API_KEY=
MAIL_FROM="Speedison <noreply@speedison.se>"
MAIL_TO="info@speedison.se"
IP_HASH_SALT="dev-only-salt-do-not-use-in-prod"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`web/.env` (your local copy, gitignored — fill with your actual local DB):
```
DATABASE_URL="mysql://root:yourpw@localhost:3306/speedison_dev"
RESEND_API_KEY=re_xxx_test_key
MAIL_FROM="Speedison <noreply@speedison.se>"
MAIL_TO="info@speedison.se"
IP_HASH_SALT="local-dev-salt-12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

If you don't have local MySQL: install Docker and run `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=speedison_dev -d mysql:8`. Or skip migration locally — Prisma `generate` works without a live DB; `migrate dev` requires one.

- [ ] **Step 5: Create the initial migration**

```bash
cd web
npx prisma migrate dev --name init
```

Expected: creates `prisma/migrations/<timestamp>_init/migration.sql` and applies it to the local DB. Prisma client is auto-generated.

If no local DB available: skip the apply step but still create migration files manually with `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/$(date +%Y%m%d%H%M%S)_init/migration.sql`. The implementer can decide; on Windows `date` formatting may differ.

- [ ] **Step 6: Create `web/src/lib/prisma.ts`** — singleton client (avoid hot-reload-storm in dev)

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 7: Create `web/src/lib/mailer.ts`** — Resend wrapper

```ts
import { Resend } from "resend";

let _resend: Resend | null = null;
function client(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

export type LeadEmailInput = {
  ref: string;
  vehicle: { make: string; model: string; engine?: string; year?: number | null };
  services: string[];
  contact: { name: string; phone: string; email: string; message?: string };
};

export async function sendLeadEmail(lead: LeadEmailInput): Promise<{ id: string } | { error: string }> {
  const to = process.env.MAIL_TO ?? "info@speedison.se";
  const from = process.env.MAIL_FROM ?? "Speedison <noreply@speedison.se>";

  const services = lead.services.join(", ");
  const yearStr = lead.vehicle.year ? ` (${lead.vehicle.year})` : "";

  const text =
`Märke:        ${lead.vehicle.make}
Modell:       ${lead.vehicle.model}
Motor:        ${lead.vehicle.engine ?? ""}${yearStr}
Tjänster:     ${services}

Kontakt:      ${lead.contact.name}
Telefon:      ${lead.contact.phone}
E-post:       ${lead.contact.email}

Meddelande:
> ${(lead.contact.message ?? "").split("\n").join("\n> ")}

Mottaget:     ${new Date().toISOString().replace("T", " ").slice(0, 16)}
Ärendenr:     ${lead.ref}
`;

  try {
    const result = await client().emails.send({
      from,
      to: [to],
      replyTo: lead.contact.email,
      subject: `[${lead.ref}] Ny offertförfrågan – ${lead.vehicle.make} ${lead.vehicle.model}`,
      text,
    });
    if (result.error) return { error: result.error.message ?? "send_failed" };
    return { id: result.data?.id ?? "unknown" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "send_threw" };
  }
}

export async function sendContactEmail(c: { name: string; email: string; phone?: string; message: string }) {
  const to = process.env.MAIL_TO ?? "info@speedison.se";
  const from = process.env.MAIL_FROM ?? "Speedison <noreply@speedison.se>";
  const text = `Från: ${c.name} <${c.email}>${c.phone ? ` · ${c.phone}` : ""}\n\n${c.message}`;
  try {
    await client().emails.send({
      from, to: [to], replyTo: c.email,
      subject: "Nytt kontaktmeddelande",
      text,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
```

- [ ] **Step 8: Create `web/src/lib/ratelimit.ts`** with a unit test (TDD)

Write the failing test first — `web/test/lib/ratelimit.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashIp } from "@/lib/ratelimit";

describe("hashIp", () => {
  beforeEach(() => {
    vi.stubEnv("IP_HASH_SALT", "test-salt-1234");
  });

  it("produces a 64-char hex string", () => {
    expect(hashIp("198.51.100.42")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(hashIp("198.51.100.42")).toBe(hashIp("198.51.100.42"));
  });

  it("differs with different salt", () => {
    const a = hashIp("198.51.100.42");
    vi.stubEnv("IP_HASH_SALT", "different-salt");
    const b = hashIp("198.51.100.42");
    expect(a).not.toBe(b);
  });

  it("trims whitespace and handles X-Forwarded-For chains", () => {
    expect(hashIp(" 198.51.100.42 , 10.0.0.1 ")).toBe(hashIp("198.51.100.42"));
  });
});
```

Run test (expect FAIL):
```bash
npm test
```

Implement `web/src/lib/ratelimit.ts`:

```ts
import { createHash } from "node:crypto";
import { prisma } from "./prisma";

export function hashIp(ipOrXff: string): string {
  const salt = process.env.IP_HASH_SALT ?? "DEV_FALLBACK_SALT";
  // Pick the first IP from a possible X-Forwarded-For chain
  const first = ipOrXff.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(salt + first).digest("hex");
}

export async function isRateLimited(
  ipHash: string,
  maxPerHour = 5
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.lead.count({
    where: { ipHash, createdAt: { gt: oneHourAgo } },
  });
  return count >= maxPerHour;
}
```

Run tests (expect PASS):
```bash
npm test
```

- [ ] **Step 9: Create `web/src/lib/server-origin.ts`** — origin allowlist for route handlers

```ts
const ALLOWED_ORIGINS = new Set([
  "https://speedison.se",
  "https://www.speedison.se",
  // Local development is allowed when NODE_ENV !== "production"
]);

export function isAllowedOrigin(origin: string | null): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin);
}
```

- [ ] **Step 10: Update `web/.gitignore`** to skip Prisma and env

Append to `web/.gitignore` (or create if missing — Next.js scaffold may already have one):

```
.env
.env.local
prisma/migrations/**/migration_lock.toml.bak
```

(`prisma/migrations/**/migration.sql` IS committed; only the working-state lock backups are not.)

- [ ] **Step 11: Commit**

```bash
git add web/prisma/ web/src/lib/prisma.ts web/src/lib/mailer.ts \
        web/src/lib/ratelimit.ts web/src/lib/server-origin.ts \
        web/test/lib/ratelimit.test.ts web/.env.example web/package.json \
        web/package-lock.json web/.gitignore
git commit -m "feat(web): Prisma schema + client singleton + Resend mailer + ratelimit (TDD)"
```

---

### Task 34: `/api/leads` Next.js route handler

> **Architecture revision (2026-05-08):** Ersätter `api/leads.php`. Same-origin route handler i Next.js. Type-safe end-to-end tack vare delade Zod-schemat från T7.

**Files:**
- Create: `web/src/app/api/leads/route.ts`
- Create: `web/test/api/leads.test.ts`

- [ ] **Step 1: Write a failing route-handler unit test**

`web/test/api/leads.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/leads/route";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 42, ref: "SP-2026-ABCDEF" }),
    },
  },
}));

// Mock mailer
vi.mock("@/lib/mailer", () => ({
  sendLeadEmail: vi.fn().mockResolvedValue({ id: "email-1" }),
}));

const validBody = {
  vehicle: { make: "Mercedes", model: "AMG A45", engine: "M139", year: 2022 },
  services: ["stage2", "popsBangs"],
  contact: { name: "Erik", phone: "+46701234567", email: "e@x.se", message: "" },
  gdprConsent: true,
  honeypot: "",
};

function makeRequest(body: unknown, opts: RequestInit = {}): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://speedison.se", ...(opts.headers as Record<string, string> ?? {}) },
    body: JSON.stringify(body),
    ...opts,
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("IP_HASH_SALT", "test-salt");
  });

  it("returns 200 with ref on a valid lead", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.ref).toMatch(/^SP-\d{4}-[a-f0-9]{6}$/i);
    expect(json.leadId).toBe(42);
  });

  it("rejects missing services with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, services: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("VALIDATION_FAILED");
  });

  it("silently 204s on filled honeypot", async () => {
    const res = await POST(makeRequest({ ...validBody, honeypot: "spam" }));
    expect(res.status).toBe(204);
  });

  it("rejects forbidden origin in production", async () => {
    const res = await POST(makeRequest(validBody, { headers: { origin: "https://evil.example" } }));
    expect(res.status).toBe(403);
  });

  it("rejects bad JSON", async () => {
    const req = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://speedison.se" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

Run (expect FAIL):
```bash
cd web && npm test
```

- [ ] **Step 2: Implement the route handler**

`web/src/app/api/leads/route.ts`:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadEmail } from "@/lib/mailer";
import { hashIp, isRateLimited } from "@/lib/ratelimit";
import { isAllowedOrigin } from "@/lib/server-origin";
import { LeadSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs"; // we use Prisma + Resend (Node-only)

const MAX_BODY_BYTES = 8192;

function makeRef(): string {
  const year = new Date().getFullYear();
  const random = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return `SP-${year}-${random.toUpperCase()}`;
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "unknown";
}

export async function POST(req: Request): Promise<Response> {
  // Origin check
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  // Body size guard
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  // Parse JSON
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  // Honeypot — silent 204 to confuse bots
  if (typeof raw === "object" && raw !== null && (raw as { honeypot?: unknown }).honeypot !== "") {
    return new Response(null, { status: 204 });
  }

  // Zod validation (shared schema with the client)
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", fields },
      { status: 400 }
    );
  }
  const lead = parsed.data;

  // Rate limit
  const ipHash = hashIp(clientIp(req));
  if (await isRateLimited(ipHash, 5)) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 });
  }

  // Insert
  const ref = makeRef();
  let created;
  try {
    created = await prisma.lead.create({
      data: {
        ref,
        make: lead.vehicle.make,
        model: lead.vehicle.model,
        engine: lead.vehicle.engine ?? null,
        year: lead.vehicle.year ?? null,
        services: lead.services as unknown as Prisma.InputJsonValue,
        name: lead.contact.name,
        phone: lead.contact.phone,
        email: lead.contact.email,
        message: lead.contact.message ?? null,
        ipHash,
      },
    });
  } catch (e) {
    console.error("leads.insert", e);
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  // Best-effort email — never fail the request because of this
  void sendLeadEmail({
    ref: created.ref,
    vehicle: lead.vehicle,
    services: lead.services,
    contact: lead.contact,
  }).catch((e) => console.error("leads.mail", e));

  return NextResponse.json({ ok: true, leadId: created.id, ref: created.ref });
}
```

Run tests (expect PASS):
```bash
npm test
```

- [ ] **Step 3: Commit**

```bash
git add web/src/app/api/leads/route.ts web/test/api/leads.test.ts
git commit -m "feat(web): POST /api/leads route handler with Prisma + Resend + Zod (TDD)"
```

> **Deferred to prod phase:** Pushing to Railway, the live `curl` smoke-test against `https://speedison.se/api/leads`, and verifying the email lands in info@speedison.se. The route handler is fully unit-tested locally; production verification happens at launch.

---

### Task 35: `/api/contact` Next.js route handler

> **Architecture revision (2026-05-08):** Mirror of `/api/leads` for the simpler contact form.

**Files:**
- Create: `web/src/app/api/contact/route.ts`
- Create: `web/test/api/contact.test.ts`

- [ ] **Step 1: Write failing test**

`web/test/api/contact.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/contact/route";

vi.mock("@/lib/prisma", () => ({
  prisma: { contact: { create: vi.fn().mockResolvedValue({ id: 7 }) } },
}));
vi.mock("@/lib/mailer", () => ({
  sendContactEmail: vi.fn().mockResolvedValue({ ok: true }),
}));

function req(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://speedison.se", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => { vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("IP_HASH_SALT","x"); });

  it("returns 200 on a valid message", async () => {
    const res = await POST(req({
      name: "Erik", email: "e@x.se", message: "Hej!", honeypot: "",
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("rejects missing message", async () => {
    const res = await POST(req({ name: "Erik", email: "e@x.se", message: "", honeypot: "" }));
    expect(res.status).toBe(400);
  });

  it("204 on filled honeypot", async () => {
    const res = await POST(req({ name: "x", email: "x@y.z", message: "hi", honeypot: "bot" }));
    expect(res.status).toBe(204);
  });
});
```

Run: `npm test` — expect FAIL.

- [ ] **Step 2: Implement**

`web/src/app/api/contact/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/mailer";
import { hashIp } from "@/lib/ratelimit";
import { isAllowedOrigin } from "@/lib/server-origin";
import { phoneSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(120),
  phone: phoneSchema.optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
  honeypot: z.literal(""),
});

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "unknown";
}

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  let raw: unknown;
  try { raw = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 }); }

  if (typeof raw === "object" && raw !== null && (raw as { honeypot?: unknown }).honeypot !== "") {
    return new Response(null, { status: 204 });
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    return NextResponse.json({ ok: false, error: "VALIDATION_FAILED", fields }, { status: 400 });
  }
  const c = parsed.data;
  const ipHash = hashIp(clientIp(req));

  try {
    await prisma.contact.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone || null,
        message: c.message,
        ipHash,
      },
    });
  } catch (e) {
    console.error("contact.insert", e);
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  void sendContactEmail({ name: c.name, email: c.email, phone: c.phone || undefined, message: c.message })
    .catch((e) => console.error("contact.mail", e));

  return NextResponse.json({ ok: true });
}
```

Run tests (expect PASS): `npm test`.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/api/contact/route.ts web/test/api/contact.test.ts
git commit -m "feat(web): POST /api/contact route handler with Prisma + Resend (TDD)"
```

---

### Task 36: Kontakt page (frontend)

**Files:**
- Create: `web/src/app/kontakt/page.tsx`

- [ ] **Step 1: Create page**

```tsx
import { COMPANY } from "@/lib/content";

export const metadata = { title: "Kontakt — Speedison" };

export default function KontaktPage() {
  return (
    <main className="min-h-screen bg-noir-900 pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Kontakt</span>
        <h1 className="font-display text-4xl md:text-6xl text-stone-100 mt-2 mb-12">Kom förbi.</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Adress</h3>
            <p className="leading-relaxed text-stone-300">{COMPANY.address}</p>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mt-8 mb-4">Telefon</h3>
            <p><a className="text-stone-100 hover:text-copper-300" href={`tel:${COMPANY.phoneTel}`}>{COMPANY.phone}</a></p>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mt-8 mb-4">E-post</h3>
            <p><a className="text-stone-100 hover:text-copper-300" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
          </div>
          <div>
            <h3 className="text-copper-300 text-xs tracking-[0.3em] uppercase mb-4">Öppettider</h3>
            <ul className="space-y-1 text-stone-300">
              {COMPANY.hours.map(h => <li key={h.days}><span className="inline-block w-24">{h.days}</span><span>{h.time}</span></li>)}
            </ul>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=17.7%2C59.47%2C17.78%2C59.49&layer=mapnik"
              className="mt-8 w-full h-64 border border-noir-700"
              loading="lazy"
              title="Karta"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/kontakt/
git commit -m "feat(web): kontakt page"
```

---

### Task 37: SEO — sitemap, robots, OG image, structured data

**Files:**
- Create: `web/src/app/sitemap.ts`
- Create: `web/src/app/robots.ts`
- Modify: `web/src/app/layout.tsx` (add JSON-LD)

- [ ] **Step 1: `web/src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://speedison.se";
  return [
    { url: `${base}/`,             changeFrequency: "monthly", priority: 1 },
    { url: `${base}/konfigurator`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/kontakt`,      changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/integritet`,   changeFrequency: "yearly",  priority: 0.2 },
  ];
}
```

- [ ] **Step 2: `web/src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/tack"] }],
    sitemap: "https://speedison.se/sitemap.xml",
  };
}
```

- [ ] **Step 3: Add JSON-LD `LocalBusiness` to root layout**

In `web/src/app/layout.tsx`, inside `<body>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "Speedison",
    "image": "https://speedison.se/brand/logo.png",
    "telephone": "+4683333346",
    "email": "info@speedison.se",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Mätarvägen 9A",
      "postalCode": "19637",
      "addressLocality": "Kungsängen",
      "addressCountry": "SE",
    },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "10:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "12:00", "closes": "16:00" },
    ],
    "url": "https://speedison.se",
  })}}
/>
```

- [ ] **Step 4: Commit**

```bash
git add web/src/app/sitemap.ts web/src/app/robots.ts web/src/app/layout.tsx
git commit -m "feat(web): sitemap, robots, LocalBusiness JSON-LD"
```

---

### Task 38: Open Graph image (per route)

**Files:**
- Create: `web/src/app/opengraph-image.tsx`

- [ ] **Step 1: Create dynamic OG image**

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Speedison — Performance reimagined";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function og() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        background: "#0a0a0f",
        color: "#f0e0c8",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "flex-start",
        padding: 96,
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ fontSize: 28, letterSpacing: 8, textTransform: "uppercase", color: "#d4a574" }}>Speedison</div>
        <div style={{ fontSize: 96, marginTop: 24, lineHeight: 1, fontWeight: 300 }}>Vi tämjer</div>
        <div style={{ fontSize: 96, fontStyle: "italic", lineHeight: 1, color: "#d4a574" }}>maskinen.</div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/opengraph-image.tsx
git commit -m "feat(web): dynamic OG image"
```

---

### Task 39: Playwright E2E happy-path

**Files:**
- Create: `web/playwright.config.ts`
- Create: `web/e2e/happy-path.spec.ts`

- [ ] **Step 1: Install Playwright**

```bash
cd web
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- [ ] **Step 3: `e2e/happy-path.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("user can open homepage and reach configurator", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Speedison/);

  // Navigate to configurator via CTA
  await page.click("a[href='#konfigurator']");
  await expect(page.getByText("Bygg din bil.")).toBeVisible();
});

test("configurator step 1 → step 2 transition", async ({ page }) => {
  await page.goto("/#konfigurator");
  await page.getByRole("button", { name: "Mercedes" }).click();
  await expect(page.getByText(/Modell \(Mercedes\)/)).toBeVisible();
});
```

- [ ] **Step 4: Add scripts to `web/package.json`**

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

- [ ] **Step 5: Run E2E**

```bash
npm run e2e
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add web/playwright.config.ts web/e2e/ web/package.json
git commit -m "test(web): Playwright happy-path E2E"
```

---

### Task 40: Accessibility tests (axe-core in Playwright)

**Files:**
- Create: `web/e2e/a11y.spec.ts`

- [ ] **Step 1: Install axe**

```bash
cd web
npm install -D @axe-core/playwright
```

- [ ] **Step 2: `e2e/a11y.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no critical a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
});

test("configurator section has no critical a11y violations", async ({ page }) => {
  await page.goto("/#konfigurator");
  const results = await new AxeBuilder({ page })
    .include("#konfigurator")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const critical = results.violations.filter(v => v.impact === "critical" || v.impact === "serious");
  expect(critical).toEqual([]);
});
```

- [ ] **Step 3: Run**

```bash
npm run e2e
```

Fix any critical/serious violations reported.

- [ ] **Step 4: Commit**

```bash
git add web/e2e/a11y.spec.ts web/package.json
git commit -m "test(web): axe-core a11y tests for homepage + configurator"
```

---

### Task 41: Lighthouse CI in GitHub Actions

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `web/lighthouserc.json`

- [ ] **Step 1: `web/lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/"],
      "startServerCommand": "npm run start",
      "numberOfRuns": 2,
      "settings": { "preset": "desktop" }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 2: Add Lighthouse job to `ci.yml`**

```yaml
  lighthouse:
    runs-on: ubuntu-latest
    needs: web-tests
    defaults: { run: { working-directory: ./web } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: web/package-lock.json }
      - run: npm ci
      - run: npm run build
      - run: npx -y @lhci/cli@0.13.x autorun
```

- [ ] **Step 3: Commit + verify in GitHub Actions**

```bash
git add web/lighthouserc.json .github/workflows/ci.yml
git commit -m "ci: lighthouse-ci with thresholds"
git push
```

---

### Task 42: 301 redirects (legacy → new)

**Files:**
- Modify: `web/next.config.ts`

- [ ] **Step 1: Add redirects**

```ts
async redirects() {
  return [
    { source: "/tjanster",       destination: "/#tjanster", permanent: true },
    { source: "/tjanster/:slug", destination: "/#tjanster", permanent: true },
    { source: "/om-oss",         destination: "/kontakt",   permanent: true },
    { source: "/bilar-i-lager",  destination: "/",          permanent: true },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add web/next.config.ts
git commit -m "feat(web): 301 redirects from legacy WordPress URLs"
```

---

### Task 43: DNS migration runbook

**Files:**
- Create: `docs/runbook-dns-migration.md`

- [ ] **Step 1: Write runbook**

```markdown
# DNS migration to Railway

## T-7 days
1. Take full backup of WordPress (files + DB) from Misshosting cPanel.
2. Verify Railway deploy is green; full QA pass on the Railway-generated URL (e.g. `speedison-production.up.railway.app`).
3. Confirm GDPR text approved by stakeholder.
4. Resend domain verification (SPF + DKIM + DMARC) is ✅ Verified — see Task 44.

## T-1 day
1. Lower TTL on speedison.se A-record at the current DNS host to 300 s.
2. Verify the lower TTL is live: `dig speedison.se` from a clean network.

## T-0 (cut-over day, ~10:00 SE)
1. In Railway → service → Settings → Networking → Public Networking → "Custom Domain" → add `speedison.se` and `www.speedison.se`. Railway shows the target hostname/IP for each.
2. Update DNS at the registrar:
   - `A` (or `CNAME` if Railway gives you one) `speedison.se` → Railway target
   - `CNAME` `www` → Railway target for www
3. Verify: `dig speedison.se` returns the Railway target within 5–10 min.
4. Confirm SSL provisioning in Railway (automatic, usually < 5 min).
5. Smoke test: open https://speedison.se in incognito → hero loads.
6. Submit a test lead → email arrives at info@speedison.se.

## T+1 day
1. Bump TTL back to 3600 s.
2. Update Search Console (re-submit sitemap).

## Rollback (if disaster)
1. Revert A/CNAME record back to original Misshosting target.
2. Wait 5–10 min for DNS to propagate.
3. Old WordPress site is intact (we kept it untouched at Misshosting).

## Email (MUST NOT BREAK)
- MX records remain at the current host (Misshosting or wherever info@speedison.se is delivered) → unchanged.
- Outbound notifications now go via Resend; SPF must include `_spf.resend.com` (see Task 44).
- DKIM record at `resend._domainkey.speedison.se` provides authentication.
- Test inbox by sending a mail to info@speedison.se after cutover.
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbook-dns-migration.md
git commit -m "docs: DNS migration runbook"
```

---

### Task 44: Resend domain verification (SPF + DKIM + DMARC)

> **Architecture revision (2026-05-08):** Resend skickar mejl, inte Misshosting. Vi måste verifiera `speedison.se` i Resend så att SPF/DKIM/DMARC är korrekt — annars hamnar offert-mejlen i spam.

**Files:**
- Modify: `docs/runbook-dns-migration.md` (add Resend domain verification section)

- [ ] **Step 1: Add domain in Resend dashboard**

In a browser:
1. Log in to https://resend.com
2. Domains → Add Domain → enter `speedison.se`
3. Region: EU (closest to users)
4. Resend shows you 3 DNS records to add: a TXT for SPF, a TXT for DKIM, and an optional MX or TXT for return-path. Copy them.

- [ ] **Step 2: Add the records at the domain registrar**

Where the `speedison.se` DNS lives today (likely Misshosting cPanel or .se-registrar):
- Add `TXT` record at `@` for SPF (something like `v=spf1 include:_spf.resend.com ~all` — use the exact value Resend gives)
- Add `TXT` record at `resend._domainkey` for DKIM (long base64 value Resend provides)
- Add the optional MX or TXT for return-path if Resend asks (improves deliverability)

If `speedison.se` already has an SPF record (from Misshosting), MERGE the includes — don't add a second SPF record. A domain may have only one. Combined example: `v=spf1 include:misshosting.se include:_spf.resend.com ~all`.

- [ ] **Step 3: Add DMARC record** (one-time, even soft policy helps deliverability)

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@speedison.se
```

`p=none` = report-only. After 30 days of clean reports, raise to `p=quarantine` and later `p=reject`.

- [ ] **Step 4: Verify in Resend**

In Resend dashboard, click "Verify". DNS propagation can take 5 min – 24 h. Status changes to ✅ Verified.

- [ ] **Step 5: Send a test email**

Use the production smoke test from T48 (after launch), or use Resend's "Send a test" button in the dashboard. Check Gmail/Outlook inbox AND spam folder. If spam: revisit DKIM record (often a copy-paste issue) and DMARC.

- [ ] **Step 6: Document and commit**

Append to `docs/runbook-dns-migration.md`:

```markdown
## Email deliverability

Sender: Resend (resend.com), region EU.
- SPF includes `_spf.resend.com`
- DKIM record at `resend._domainkey.speedison.se`
- DMARC at `_dmarc.speedison.se`, currently `p=none`

MX records (inbox for info@speedison.se) remain unchanged at the existing email host.
```

```bash
git add docs/runbook-dns-migration.md
git commit -m "docs: Resend domain verification + SPF/DKIM/DMARC steps"
```

---

### Task 45: Hero video swap (when user provides final video)

**Files:**
- Run: `scripts/extract-frames.sh <new-video.mp4>`

- [ ] **Step 1: Place final video in `scener/`**

User confirms which file is the final 15-second hero video (current candidate: `Car_Front_Side_Back_A_slow_zoom-out_reveals_a_man_with_short_dark_BIC5qrRE.mp4`, but a new one is being generated).

- [ ] **Step 2: Run extraction**

```bash
./scripts/extract-frames.sh scener/<final-video>.mp4
```

Confirm 450 frames in each of `1920w/`, `1280w/`, `720w/`.

- [ ] **Step 3: Verify locally**

```bash
cd web && npm run dev
```

Scroll the hero. Frames should scrub smoothly.

- [ ] **Step 4: Add a tracker file to keep frame dirs in repo state but not the frames**

Frames are NOT committed (gitignored — they're regenerated from the source video). For Railway deploys, the source video must be retrievable at build time. Two options:

**Option A (recommended): commit the final 15-sec video to the repo via Git LFS.** Set up Git LFS once, track `*.mp4` under `scener/`, and Railway's checkout will include the file. Then the prebuild script can extract frames at build time.

**Option B: host the video on Cloudflare R2 / S3 / a public URL** and download in prebuild. Adds an env var and a curl step.

For Option A, in `web/package.json` `scripts`, add:
```json
"prebuild": "test -f public/frames/720w/frame-001.webp || (cd .. && bash scripts/extract-frames.sh scener/final.mp4)"
```

For Option B, the prebuild becomes:
```json
"prebuild": "test -f public/frames/720w/frame-001.webp || (mkdir -p ../scener && curl -L -o ../scener/final.mp4 \"$VIDEO_SOURCE_URL\" && cd .. && bash scripts/extract-frames.sh scener/final.mp4)"
```
Then add `VIDEO_SOURCE_URL` to Railway env vars.

Note: Railway's Nixpacks builder includes `ffmpeg` in many language preset images, but if the build fails because `ffmpeg` is missing, add a Nixpacks override (`nixpacks.toml`) that installs it. The implementer should verify this when running the first Railway build.

- [ ] **Step 5: Confirm hot-spot pixel coordinates** in `web/src/lib/hotspots.ts` against the actual final frame ~440. Adjust `x`/`y` percentages.

- [ ] **Step 6: Commit (frames excluded by .gitignore)**

```bash
git add web/src/lib/hotspots.ts
git commit -m "feat(web): align hot-spots to final hero video frame"
```

---

### Task 46: Lightweight in-app analytics (no third-party)

> **Architecture revision (2026-05-08):** Vercel Analytics fungerar inte på Railway. Vi skippar tredjepartsanalytics i v1 (cost + cookie-fritt). Istället loggar vi ett par viktiga events client-side mot vår egen `/api/analytics` endpoint som bara skriver till en `events`-tabell. Tunt och kostnadsfritt.
>
> Alternativt: lägg till Plausible-script (~$9/mån cloud) eller Umami (self-hosted Railway-service, +1 service på Hobby). Båda är cookie-free. Båda kan plockas upp senare; ingen kod-ändring behövs nu utöver att lägga till ett script-tag i `layout.tsx`.

**Files (om vi väljer "egen tabell"-lösningen):**
- Modify: `web/prisma/schema.prisma` — add `Event` model
- Create: `web/src/app/api/events/route.ts`
- Create: `web/src/lib/analytics.ts`

- [ ] **Step 1: Decide approach** (in conversation, not in code)

Rekommendation för v1: **skippa analytics helt**. Lead-räkning sker via SQL-fråga mot `Lead`-tabellen ("hur många leads de senaste 30 dagarna?"). Det är vad ägaren faktiskt vill veta. Site-traffic-mätning kan vänta tills sajten är live och behöver det.

Om beslutet ändras senare:

- [ ] **Step 2 (om vi kör egen tabell):** Add `Event` model

```prisma
model Event {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now()) @map("created_at")
  name      String   @db.VarChar(60)
  props     Json?
  ipHash    String   @db.VarChar(64) @map("ip_hash")

  @@index([name, createdAt])
  @@map("events")
}
```

Run `npx prisma migrate dev --name add_events`.

- [ ] **Step 3 (om vi kör egen tabell):** Create `web/src/app/api/events/route.ts` — small POST handler that inserts an Event with hashed IP, no PII.

- [ ] **Step 4 (om vi kör egen tabell):** Create `web/src/lib/analytics.ts` with a `track(name, props)` function that does `fetch("/api/events", { method: "POST", body: JSON.stringify({name, props}) })` (debounced, fire-and-forget).

- [ ] **Step 5 (om vi kör egen tabell):** Fire events at key points:
  - `HeroScrub`: when `progress > 0.99` once → `track("hero_completed")`
  - `HotSpotLayer`: on activate → `track("hotspot_clicked", { service })`
  - `Configurator`: on step change → `track("configurator_step", { step })`
  - `StepContact`: on submit success/fail → `track("lead_submitted" | "lead_failed")`

- [ ] **Step 6: Commit (whichever path was chosen)**

```bash
git add web/
git commit -m "feat(web): in-app analytics (or no-op for v1)"
```

**Default action for v1: do nothing. Skip this task entirely and revisit when there's a real question to answer.**

---

### Task 47: Manual QA pass

**Files:** none (checklist)

- [ ] **Step 1: Run on iPhone Safari (real device)**
  - Hero scrubs without jank
  - Hot-spots clickable in Akt III
  - Configurator works
  - Sound toggle does not auto-play
  - Reduced-motion respected

- [ ] **Step 2: Run on Android Chrome (real device)**
  - Same checks

- [ ] **Step 3: Desktop matrix**
  - Chrome 120+: all features
  - Firefox 120+: all features
  - Safari 17+: all features

- [ ] **Step 4: Network throttling test (DevTools → Slow 3G)**
  - Eager frames load fast enough that hero is usable within 3 s
  - Lazy frames stream in over time
  - No layout shifts

- [ ] **Step 5: Lighthouse mobile run on production preview**
  - Performance ≥ 85
  - Accessibility ≥ 90
  - Best practices ≥ 90
  - SEO ≥ 90

- [ ] **Step 6: Document any issues** — create issues in GitHub for follow-up.

---

### Task 48: Production launch

**Files:** none (operational)

- [ ] **Step 1: Confirm CI is green** (web-tests, lighthouse). Confirm Railway last-deploy is ✅ Deployed and healthcheck is healthy.

- [ ] **Step 2: Run DNS migration runbook** (`docs/runbook-dns-migration.md`).

- [ ] **Step 3: Smoke test post-cutover**

Open https://speedison.se in a clean browser. Submit a real test lead. Verify the email arrives at info@speedison.se via Resend. Verify lead appears in the `leads` table on the Railway MySQL plugin (Railway dashboard → MySQL → Data tab).

- [ ] **Step 4: Monitor for 24 h**

Check Railway service logs (Deployments → Logs) for errors, Resend dashboard for email deliverability rate, and the `leads` table count for inflow.

- [ ] **Step 5: Tag the release**

```bash
git tag -a v1.0.0 -m "Speedison redesign — production launch"
git push --tags
```

---

### Task 49: Post-launch — keep old WordPress for 30 days

**Files:** none

- [ ] **Step 1: Document rollback path**

In `docs/runbook-dns-migration.md` confirm the WordPress install at Misshosting's original location is untouched. Note its directory path and DB name as escape hatch. The Railway service stays running in parallel; the rollback is purely a DNS change.

- [ ] **Step 2: Calendar reminder**

Set reminder for `2026-06-07` (T+30 days from launch) to review whether to archive the old WordPress site. Until then, leave it alone.

- [ ] **Step 3: Final commit**

```bash
git commit --allow-empty -m "chore: 30-day rollback window begins"
git push
```

---

## Self-Review

Walking through the spec section-by-section against the plan:

| Spec section | Covered by | Notes |
|---|---|---|
| §1 Översikt & syfte | implicit (project goals) | — |
| §2 Mål & framgångskriterier | T41 (Lighthouse), T40 (a11y), T46 (analytics events) | LCP target enforced via CI |
| §3 Målgrupp | content (T8) | — |
| §4 Varumärke & ton | T3 (theme tokens) | — |
| §5 Storytelling-koncept | T13–T17 (frames, acts, hot-spots) | — |
| §6 Arkitektur & stack | T1–T11 | — |
| §7 Komponentträd | T15 (HeroScrub), T18–T20 (effects), T23–T26 (chrome+chapters), T29–T30 (configurator) | — |
| §8 State & dataflöde | T29 (store), T31 (api client), T34 (DB) | — |
| §9 Animationer & scroll | T13–T21 | — |
| §10 Konfigurator & lead-flöde | T29, T30, T34 | — |
| §11 Felhantering | T22 (boundaries), T34 (validation), T31 (api errors), T21 (reduced-motion) | — |
| §12 Testning | T5 (vitest), T6/T7/T13/T17/T29 (unit), T39 (E2E), T40 (a11y), T41 (Lighthouse) | — |
| §13 Performance-budget | T41 (CI gates) | — |
| §14 Tidslinje | Milestones 1–4 | — |
| §15 Migration | T43 (runbook), T49 (rollback) | — |
| §16 SEO | T37 (sitemap/robots/JSON-LD), T38 (OG) | — |
| §17 GDPR & mätning | T32 (privacy), T46 (analytics), ratelimit/honeypot in T33–T34 | — |
| §18 Risker & mitigation | covered by tests + runbook | — |
| Bilaga A v2 | not implemented (intentional, post-v1) | — |
| Bilaga B priser | T6 (pricing.ts) | TBD prices represented as `null` (=> "Begär offert") |
| Bilaga C hot-spots | T17 (initial), T45 (refinement against final video) | — |
| Bilaga D assets | T10 (legacy assets), T25 (audio placeholders) | Audio files supplied later by user |
| Öppna punkter 1 (Stage1/Stage2/Avgas priser) | T6 modeled as `null`, easy to fill | — |
| Öppna punkter 2 (final video) | T45 | — |
| Öppna punkter 3 (other 3 video clips for chapters) | T26 leaves `videoSrc` optional; chapters render without bg until supplied | — |
| Öppna punkter 4 (Misshosting mail SPF/DKIM) | T44 | — |
| Öppna punkter 5 (Stage1 vs Stage2 split) | T6 keeps separate slugs; T30 StepServices renders both | Decision locked: separate cards |
| Öppna punkter 6 (social links) | T8 (content.ts) | already populated, kund verifierar |
| Öppna punkter 7 (privacy policy text) | T32 | first draft included; legal review out-of-scope |

Placeholder scan: searched the plan for "TBD" / "TODO" / "fill in" — none found in plan text. (Spec retains TBDs which are intentional.)

Type/method consistency: `useConfiguratorStore` actions consistent across T29 and T30. `submitLead` signature in T31 matches its consumer in T30 StepContact. `framePath()` in T13 matches its consumer in T14 and T21. `HOTSPOTS` array shape in T17 matches consumer in T17 HotSpotLayer.

Plan is complete.
