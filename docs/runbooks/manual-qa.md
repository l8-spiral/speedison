# Manual QA checklist

Run this before every production deploy. Automated tests catch many
issues; this catches the ones that need a human eye on a real device.

## Devices

Test the same flow on at least three devices. If the matrix is bigger,
the more, the better.

- [ ] **iPhone Safari** (real device, latest iOS)
- [ ] **Android Chrome** (real device)
- [ ] **Desktop Chrome 120+** (Windows or Mac)
- [ ] **Desktop Firefox 120+**
- [ ] **Desktop Safari 17+** (Mac only)

## Per-device flow

### Hero
- [ ] Hero scrubs smoothly when scrolling. No jank, no skipped frames.
- [ ] Tagline (Akt I) fades in/out around the right scroll positions.
- [ ] Service titles (Akt II) appear one by one.
- [ ] Hot-spots fade in during Akt III.
- [ ] Click a hot-spot → smooth-scrolls to the configurator.

### Effects
- [ ] Cursor spotlight follows the mouse on desktop. Off on mobile.
- [ ] Particles drift on desktop. Off when `prefers-reduced-motion` is
      enabled.
- [ ] Lenis smooth scroll feels right (not too sticky, not too loose).

### Reduced motion
- [ ] Enable `prefers-reduced-motion` in OS settings (or DevTools render
      emulation). Refresh.
- [ ] Hero shows a static frame, not the scrub.
- [ ] No animations.
- [ ] Hot-spots are NOT shown (we use the static fallback for reduced
      motion).

### Sound
- [ ] Sound toggle (🔇 / 🔊) is visible in lower-right corner.
- [ ] Default state is muted.
- [ ] Click → switches to 🔊 and a low rumble starts (very subtle).
- [ ] Click again → silent.
- [ ] Refresh page → state is preserved (localStorage).

### Configurator
- [ ] Step 1: pick "Mercedes" → step 2 opens with Mercedes models.
- [ ] Step 2: pick "AMG A45" → step 3 opens.
- [ ] Step 3: enter "M139" + 2022 → "Fortsätt" enables → step 4 opens.
- [ ] Step 4: pick at least one service. Multi-select works (toggle on/off).
- [ ] Estimated price shows the sum or "Begär offert" if any selected
      service has no price.
- [ ] Step 5: form fields validate inline (red error under each).
- [ ] GDPR-checkbox required.
- [ ] Submit → goes to /tack with ärendenummer.

### Email
- [ ] After submit, info@speedison.se receives a mail within 30 sec.
- [ ] Mail subject contains the ref ("[SP-2026-XXXXXX] Ny offertförfrågan
      – Mercedes AMG A45").
- [ ] Reply-To matches the email the user submitted.

### Sub-pages
- [ ] /kontakt loads, OSM map renders.
- [ ] /integritet loads with proper typography.
- [ ] /tack works without a `?ref=` parameter (no error, just no
      ärendenummer line).

### Network throttling
In DevTools, set network to "Slow 3G". Reload home page.
- [ ] First contentful paint within 3 sec.
- [ ] Hero is usable within 5 sec (eager-loaded frames).
- [ ] Lazy frames stream in over time, no layout shift.

### Performance
Run Lighthouse on the production preview URL.
- [ ] Performance ≥ 85
- [ ] Accessibility ≥ 90
- [ ] Best practices ≥ 90
- [ ] SEO ≥ 90

## After QA

If anything fails, file a GitHub issue with the device/browser, the
specific check that failed, and a screen recording or screenshot.

If everything passes, proceed to `docs/runbooks/dns-migration.md`.
