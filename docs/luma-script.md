# Luma Dream Machine — chapter clips (chained workflow, trial-friendly)

This is the canonical script for generating the four desktop (and later
the four mobile) chapter clips with **hard chaining**: each chapter's
last frame becomes the next chapter's start frame, so the whole site
feels like one continuous cinematic camera.

## How the chain works

```
hero ends here
   ↓
reference-frame-520.png  ──[chapter-stage prompt]──→ chapter-stage-16x9.mp4
                                                          ↓ (last frame)
                                            after-stage-16x9.png
                                                          ↓
                            [chapter-pops prompt]──→ chapter-pops-16x9.mp4
                                                          ↓ (last frame)
                                            after-pops-16x9.png
                                                          ↓
                            [chapter-emissions prompt]──→ chapter-emissions-16x9.mp4
                                                          ↓ (last frame)
                                            after-emissions-16x9.png
                                                          ↓
                            [chapter-exhaust prompt]──→ chapter-exhaust-16x9.mp4
                                                          ↓
                                              (end of chain — final chapter)
```

Every chapter prompt is written to **start from a wide low-angle view of
the lifted car and end on a similar wide view**, so each handoff frame
is visually consistent. The "subject" of each chapter (ECU, exhaust tips,
catalytic converter, exhaust line) appears in the middle of the clip.

## Per-clip 5-second arc

```
0.0 – 2.0s    Camera moves from the wide start view INTO the chapter's part
2.0 – 3.0s    HOLD on the part at peak focus (glow / flames / detail)
3.0 – 5.0s    Camera RETREATS smoothly back to a wide neutral view
```

The "reading hold" on the part — where users pause to read the chapter
text — is handled on the scroll side, not in the video. We stretch the
sticky scroll-stage so the user can stop anywhere during the arc.

## Per-clip workflow

After each generation, you drop the MP4 in `scener/`. Then:

```bash
# I run on my end — extracts the last frame as a PNG
cd web && node scripts/extract-last-frame.mjs scener/<filename>.mp4

# Output goes to scener/_chain/after-<chapter>-16x9.png
# I then tell you: "upload that PNG to Luma + paste prompt N+1"
```

You upload that PNG as start frame in Luma and paste the next chapter's
prompt. Loop until all four chapters done.

## Trial budget

ray-flash-2 on trial ≈ 1 credit per 5-sec clip. 4 chapter clips = 4
credits. Plus you've already used 1 credit on the first attempt; we
regenerate clip 1 with the new chain-aware prompt = 1 more credit.
**Total: ~5 credits for the desktop chain.** Out of 30 trial credits.

---

## 1/4 — STAGE (regenerate — current version doesn't end on a wide handoff)

```
Title:         chapter-stage-16x9
Aspect:        16:9
Start frame:   scener/reference-frame-520.png
Filename:      chapter-stage-16x9.mp4
```

**Prompt:**

```
A 5-second cinematic camera arc for image-to-video generation. The
opening frame matches the start image exactly: a wide low-angle 3/4
front-right view of a lifted matte black performance sports car with
exploded parts visible around it in a dark workshop.

ARC, broken into three phases:

  Phase 1 (0.0–2.0s) — Camera dollies slowly forward and tightens on the
  open engine bay area on the right side of the car. By the end of phase
  1 the frame is close on the ECU module — a black rectangular electronic
  control unit. Camera motion is smooth and slow, no shake.

  Phase 2 (2.0–3.0s) — Hold the close-up of the ECU module. The ECU's
  circuit board surface emits a soft amber data glow during this phase.
  Subject does not move; camera holds still or near-still.

  Phase 3 (3.0–5.0s) — Camera pulls back smoothly, retreating along the
  same path it came in on. The final frame should compositionally match
  the opening frame: a wide low-angle 3/4 front-right view of the lifted
  car with exploded parts. This wide end-frame is critical — it becomes
  the start frame of the next chapter.

COMPOSITION (throughout the shot): the car body occupies the RIGHT THIRD
of a 16:9 widescreen frame; the LEFT TWO-THIRDS remain pitch black with
subtle volumetric haze and fine dust particles drifting through narrow
light beams.

LIGHTING: warm copper and amber rim lighting from above, deep shadows
below.

STYLE: premium automotive commercial cinematography, slow-motion 24fps
motion blur, hyper-realistic photographic quality.

CONSTRAINTS: only the camera moves — the car and exploded parts stay
completely still. Do not include people, hands, mechanics, tools, lifts
visible in the frame, text, captions, watermarks, logos, hood ornaments,
license plates, or any UI overlays.
```

---

## 2/4 — POPS & BANGS

```
Title:         chapter-pops-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-stage-16x9.png  ← from previous clip
Filename:      chapter-pops-16x9.mp4
```

**Prompt:**

```
A 5-second cinematic camera arc for image-to-video generation. The
opening frame matches the start image exactly: a wide low-angle 3/4
view of a lifted matte black performance sports car with exploded parts
in a dark workshop.

ARC, broken into three phases:

  Phase 1 (0.0–2.0s) — Camera moves smoothly around to the rear-side of
  the car and tightens on the twin chrome exhaust tips. The exhaust tips
  settle into the LEFT THIRD of the 16:9 widescreen frame. Camera motion
  is smooth and slow, no shake.

  Phase 2 (2.0–3.0s) — Hold the close-up on the twin exhaust tips. During
  this phase, bright orange and yellow flames burst rhythmically from
  both exhaust pipes in two slow pulses. Fine sparks and glowing embers
  fly outward into pitch black background. Heat-haze distortion shimmers
  around the metal exhaust tips.

  Phase 3 (3.0–5.0s) — Camera pulls back smoothly, retreating to a wide
  low-angle view of the lifted car from a rear-side perspective. The
  final frame should compositionally match a wide neutral view of the
  lifted car similar to the opening composition. This wide end-frame is
  critical — it becomes the start frame of the next chapter.

COMPOSITION: during phase 2 the exhaust tips occupy the LEFT THIRD of
the frame; the RIGHT TWO-THIRDS remain pitch black with only a faint
warm glow from the flames. At the wide rest points (start and end), the
car body fills the lower portion of the frame in a wide neutral angle.

LIGHTING: warm copper rim lighting from above during the wide views;
high-contrast chiaroscuro lighting during the close-up; titanium-blue
heat tint patina on the metal exhaust tips.

STYLE: premium automotive cinematography, hyper-detailed, shallow depth
of field, slow-motion 24fps motion blur, hyper-realistic photographic
quality.

CONSTRAINTS: the car body stays completely still throughout. Only the
camera moves; only the flames are active during phase 2. Do not include
people, hands, mechanics, tools, lifts visible in the frame, text,
captions, watermarks, logos, license plates, or UI overlays.
```

---

## 3/4 — EMISSIONS

```
Title:         chapter-emissions-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-pops-16x9.png  ← from previous clip
Filename:      chapter-emissions-16x9.mp4
```

**Prompt:**

```
A 5-second cinematic camera arc for image-to-video generation. The
opening frame matches the start image exactly: a wide low-angle view of
a lifted matte black performance sports car with exploded parts in a
dark workshop.

ARC, broken into three phases:

  Phase 1 (0.0–2.0s) — Camera tilts downward and dollies in under the
  lifted car, settling on a low 3/4 angle looking up at the underbody.
  The catalytic converter — a polished cylindrical metal canister
  mounted in the exhaust line — moves into the RIGHT THIRD of the
  16:9 widescreen frame. Other emissions hardware (EGR valve, DPF
  housing, exhaust piping) is visible around it. Camera motion is smooth
  and slow, no shake.

  Phase 2 (2.0–3.0s) — Hold the close-up on the catalytic converter
  housing. During this phase the housing emits a subtle warm amber glow.
  Subject does not move; camera holds still or near-still.

  Phase 3 (3.0–5.0s) — Camera pulls back smoothly, retreating from under
  the car back to a wide low-angle view of the lifted car. The final
  frame should compositionally match a wide neutral view of the lifted
  car similar to the opening composition. This wide end-frame is
  critical — it becomes the start frame of the next chapter.

COMPOSITION: during phase 2 the catalytic converter occupies the RIGHT
THIRD of the frame; the LEFT TWO-THIRDS remain pitch black with subtle
haze. At the wide rest points (start and end), the car body sits in a
wide neutral angle.

LIGHTING: warm amber rim lighting from below highlights the underbody
metal components during phase 2; warm copper rim lighting from above
during the wide views; deep shadows throughout.

STYLE: industrial workshop precision aesthetic, premium automotive
engineering cinematography, shallow depth of field, slow-motion 24fps
motion blur, hyper-realistic photographic quality.

CONSTRAINTS: the car body stays completely still throughout. Only the
camera moves. Do not include people, hands, mechanics, tools, lifts
visible in the frame, text, captions, watermarks, logos, license plates,
or UI overlays.
```

---

## 4/4 — AVGASSYSTEM (exhaust)

```
Title:         chapter-exhaust-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-emissions-16x9.png  ← from previous clip
Filename:      chapter-exhaust-16x9.mp4
```

**Prompt:**

```
A 5-second cinematic camera arc for image-to-video generation. The
opening frame matches the start image exactly: a wide low-angle view of
a lifted matte black performance sports car with exploded parts in a
dark workshop.

ARC, broken into three phases:

  Phase 1 (0.0–2.0s) — Camera repositions to a low side angle and begins
  a slow lateral tracking shot along the underside exhaust line. The
  full exhaust system comes into view — twin chrome exhaust tips at the
  rear, polished mid-pipe and catback piping running forward toward the
  manifold. The car body and exhaust line occupy the LEFT THIRD of the
  16:9 widescreen frame, running horizontally across the upper portion
  of that left third. Camera tracks horizontally from right to left.

  Phase 2 (2.0–3.0s) — Hold the lateral track mid-way along the exhaust
  line at slowest speed. Polished titanium-blue heat tint on the metal
  pipes is most visible during this phase. Subject does not move; camera
  continues its slow lateral movement.

  Phase 3 (3.0–5.0s) — Camera pulls back smoothly and slightly elevates,
  retreating to a wide low-angle side view of the lifted car. The final
  frame should compositionally match a wide neutral side view of the
  lifted car. This is the final chapter so there is no next chapter to
  hand off to, but the end-frame should still feel like a clean resting
  state for the section.

COMPOSITION: throughout the lateral tracking phases (1 and 2), the
exhaust line stays in the LEFT THIRD running horizontally; the RIGHT
TWO-THIRDS remain pitch black with subtle haze. At the end (phase 3),
the full lifted car is visible in a wide neutral side angle.

LIGHTING: polished titanium-blue heat tint on the metal pipes during
the close phases; warm copper rim lighting from above throughout; deep
shadows below.

STYLE: premium automotive engineering close-up, shallow depth of field,
slow-motion 24fps motion blur, hyper-realistic photographic quality.

CONSTRAINTS: the car body stays completely still throughout. Only the
camera tracks laterally and then pulls back. Do not include people,
hands, mechanics, tools, lifts visible in the frame, text, captions,
watermarks, logos, license plates, or UI overlays.
```

---

## After the chain is complete

You'll have four chained desktop clips in `scener/`:
- `chapter-stage-16x9.mp4` (regenerated)
- `chapter-pops-16x9.mp4`
- `chapter-emissions-16x9.mp4`
- `chapter-exhaust-16x9.mp4`

Plus four handoff frames in `scener/_chain/` (debug/verification artifacts).

Then I:

1. Extract WebP frame-sequences per chapter (1920w, 1280w, 720w).
2. Build `<ChapterScrub>` — sticky scroll-stage per chapter with frame
   canvas + GSAP ScrollTrigger.
3. Map scroll so the user can pause anywhere; the "reading hold" is when
   the user stops scrolling at phase 2.
4. CSS crossfades between sticky stages so the cuts feel like motion.
5. Wire into the page in chapter order.
6. Tests + commit + push.

**Mobile (9:16) is a separate chain** that we do after desktop is
verified working in the browser. Same 4 prompts but vertical, starting
from `reference-frame-520.png` (or a vertically-cropped version).

## Hero mobile

The hero mobile clip (9:16 vertical version of intro+park+explode) is a
**standalone**, not chained — it doesn't feed into the chapter chain.
Optional. Skip for trial budget conservation; we'll center-crop the
existing `AlmostPerfektFull.mp4` as a mobile-hero fallback for now.
