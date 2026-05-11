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
Start frame:   scener/reference-frame-520-right.png   ← pre-shifted: car already in right third
Filename:      chapter-stage-16x9.mp4
```

> **Why a pre-shifted reference?** The previous attempt produced a centered
> composition because the input frame (frame-520) had the car centered. We
> now feed Luma an image where the car is already positioned in the right
> third of the canvas with the left two-thirds pitch black, so it cannot
> default to centering the subject — the composition is baked into the
> input. The prompt below reinforces this rule at every phase.

**Prompt:**

```
A single five-second cinematic shot for image-to-video generation. Do
not generate multiple clips or variations — one output only.

The very first frame of the output must match the input image exactly:
a matte black 5-door station wagon (estate body style, kombi silhouette,
long roofline, rear hatchback) lifted on a workshop hoist with exploded
parts visible around it, positioned in the RIGHT THIRD of a 16:9
widescreen frame. The LEFT TWO-THIRDS of the frame is solid pitch black,
empty. The vehicle is a station wagon — not a coupe, not a sedan.

Across the five seconds, the camera performs one continuous flowing
motion. It begins at the wide opening composition. Over the first two
seconds the camera dollies slowly forward and tightens on the open
engine bay area on the right side of the wagon, ending on a close view
of the ECU module — a black rectangular electronic control unit with a
visible heat-sink or circuit-board surface. The middle second of the
shot holds steady on this ECU close-up: the circuit board surface emits
a soft amber data glow. Over the final two seconds the camera retreats
smoothly back along the same path, returning to the wide opening
composition by the last frame. The final frame must compositionally
match the opening frame: lifted wagon with exploded parts in the RIGHT
THIRD, LEFT TWO-THIRDS pitch black — a clean wide neutral view, not a
close-up, ready to chain into the next chapter.

Strict composition rules that apply to every frame of the shot:
  • The wagon body stays in the RIGHT THIRD of the frame throughout.
  • The LEFT TWO-THIRDS of the frame is solid pitch black empty space.
  • The wagon is NEVER centered horizontally. Never.
  • When the camera tightens on the ECU, the ECU appears in the RIGHT
    HALF of the frame; the LEFT HALF remains pitch black.
  • The very last frame is a wide neutral view matching the opening
    frame, NOT a close-up, NOT centered.
  • The wagon's body silhouette is preserved throughout — long
    roofline, hatchback, station-wagon proportions. Do not morph the
    silhouette toward a coupe or sedan.

Lighting: warm copper and amber rim lighting from above hits the wagon
body and ECU; deep shadows below. The LEFT TWO-THIRDS of the frame has
no light source — it stays solid pitch black throughout.

Style: premium automotive commercial cinematography, slow-motion 24fps
motion blur, hyper-realistic photographic quality.

Constraints: only the camera moves. The wagon and exploded parts stay
completely still on the right side of the frame. Do not include people,
hands, mechanics, tools, lifts visible in the frame, text, captions,
watermarks, logos, hood ornaments, license plates, or UI overlays. Do
not move the wagon. Do not rotate the wagon. Do not change the wagon's
position from right-third to centered. Do not generate multiple
variations of the shot — one output only.
```

---

## 2/4 — POPS & BANGS

```
Title:         chapter-pops-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-stage-16x9.png   ← chain handoff from stage
Filename:      chapter-pops-16x9.mp4
```

> **Generate ONE clip only.** Earlier prompts using numbered "Phase 1 /
> Phase 2 / Phase 3" structure caused Luma to produce three separate
> outputs. This prompt describes the camera motion as one flowing arc.
>
> **Car body type:** the subject is a **matte black 5-door station
> wagon / estate / kombi** with a long roofline and rear hatchback. It is
> NOT a coupe. It is NOT a sedan. Keep the wagon silhouette.

**Prompt:**

```
A single five-second cinematic shot for image-to-video generation. Do
not generate multiple clips or variations — one output only.

The very first frame of the output must match the input image: a matte
black 5-door station wagon (estate body style, kombi silhouette, long
roofline, rear hatchback) lifted on a workshop hoist with exploded
parts visible around it, in a dark workshop, viewed in a wide low-angle
3/4 perspective. The vehicle is a station wagon — not a coupe, not a
sedan.

Across the five seconds, the camera performs one continuous flowing arc.
It begins at the wide opening composition. Over the first two seconds
the camera glides smoothly around to a rear-side angle and tightens on
the twin chrome exhaust tips at the back of the wagon, positioning those
exhaust tips in the LEFT THIRD of the 16:9 widescreen frame. The middle
second of the shot holds steady on this close-up: bright orange and
yellow flames burst rhythmically from both exhaust pipes in two slow
pulses, with fine sparks and glowing embers flying outward into pitch
black background, and heat-haze distortion shimmering around the metal.
Over the final two seconds the camera pulls back smoothly, retreating
to a wide low-angle view of the lifted station wagon from a rear-side
perspective. The final frame must be a clean wide neutral view of the
full wagon on the lift — not a close-up, not centered tightly on any
single part — so it can serve as the start frame of the next chapter.

Strict composition rules that apply to every frame of the shot:
  • At the close-up moment, the exhaust tips sit in the LEFT THIRD of
    the frame; the RIGHT TWO-THIRDS remain pitch black with only a faint
    warm glow drifting from the flames.
  • The final frame and the opening frame compositionally rhyme: both
    are wide neutral views of the lifted wagon, not tight close-ups.
  • The wagon's body silhouette is preserved throughout — long
    roofline, hatchback, station-wagon proportions. Do not morph the
    silhouette toward a coupe or sedan.

Lighting: warm copper rim lighting from above during the wide views;
high-contrast chiaroscuro lighting during the close-up; polished
titanium-blue heat tint patina on the metal exhaust tips.

Style: premium automotive cinematography, hyper-detailed, shallow depth
of field, slow-motion 24fps motion blur, hyper-realistic photographic
quality.

Constraints: the wagon body stays completely still throughout; only the
camera moves; only the flames are active during the middle close-up
moment. Do not include people, hands, mechanics, tools, lifts visible
in the frame, text, captions, watermarks, logos, license plates, or UI
overlays. Do not generate multiple variations of the shot — one output
only.
```

---

## 3/4 — EMISSIONS

```
Title:         chapter-emissions-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-pops-16x9.png   ← chain handoff from pops
Filename:      chapter-emissions-16x9.mp4
```

> **Generate ONE clip only.** Single output, no variations.
>
> **Car body type:** matte black 5-door station wagon (estate, kombi
> silhouette, long roofline, rear hatchback). Not a coupe, not a sedan.
>
> **Holistic shot, not detail-only.** Earlier prompts over-emphasised the
> close-up moment and Luma reacted by skipping the wide opening entirely
> and cutting straight to the close-up. This prompt spends as much
> description on the OPENING WIDE FRAME and the CLOSING WIDE FRAME as on
> the close-up, so Luma keeps the full arc instead of jumping to the
> middle.

**Prompt:**

```
A single five-second cinematic continuous shot for image-to-video
generation. Do not generate multiple clips or variations — one output
only. The shot is one unbroken camera move — no cuts, no jump-cuts, no
transitions, the same camera throughout.

OPENING FRAME (this is what the output starts on, and it must look
exactly like the input image):
A wide low-angle view of a matte black 5-door station wagon (estate
body style, kombi silhouette, long roofline, rear hatchback) lifted
high on a workshop hoist with its wheels removed and brake assemblies
and exhaust components splayed out beneath it in a dark workshop. The
camera is approximately three to four meters away from the wagon at a
low side angle, looking slightly upward toward the lifted underbody.
The wagon is clearly recognisable as a station wagon — long roof, four
side windows, rear hatch — not a coupe, not a sedan. The wagon
silhouette occupies the upper-right portion of the 16:9 widescreen
frame; the left portion of the frame is pitch black workshop space.
This wide composition is established and held for the very first
fraction of a second so the viewer can see the whole wagon before any
camera motion begins.

CAMERA ARC (continuous, no cuts):
From this opening wide view, the camera glides smoothly forward and
downward in one continuous motion, advancing under the lifted wagon
and tilting upward to look up at the underbody. As the camera arrives,
it tightens on the catalytic converter — a polished cylindrical metal
canister mounted in the exhaust line — and positions it in the RIGHT
THIRD of the frame. Other emissions hardware (EGR valve, DPF housing,
exhaust piping) is visible around it. Roughly mid-shot, the camera
holds briefly on the catalytic converter while its housing emits a
subtle warm amber glow. Then the camera reverses its motion, pulling
back smoothly along the same path it came in on, retreating from under
the wagon and lifting back to the wide low-angle side view.

CLOSING FRAME (the very last frame of the output, equally important as
the opening frame):
A wide low-angle view of the lifted matte black 5-door station wagon,
compositionally rhyming with the opening frame: full wagon visible on
the lift, exploded parts around it, dark workshop background. This is
a clean wide neutral view — not a close-up, not tight on any single
part. It is the handoff for the next chapter.

Composition rules that apply to every frame:
  • The wagon body silhouette is preserved throughout — long roofline,
    hatchback, station-wagon proportions. Do not morph the silhouette
    toward a coupe or sedan.
  • At the close-up moment, the catalytic converter sits in the RIGHT
    THIRD of the frame; the LEFT TWO-THIRDS remain pitch black with
    subtle haze.
  • The opening frame and the closing frame are both wide views of the
    full wagon, not close-ups. Do not cut directly to the close-up at
    the start; do not end on a close-up.

Lighting: warm copper rim lighting from above during the wide views;
warm amber rim lighting from below highlights the underbody metal
components during the close-up phase; deep shadows throughout.

Style: industrial workshop precision aesthetic, premium automotive
engineering cinematography, shallow depth of field, slow-motion 24fps
motion blur, hyper-realistic photographic quality.

Constraints: the wagon body stays completely still throughout. Only the
camera moves. The motion is a single continuous arc with no cuts. Do
not include people, hands, mechanics, tools, lifts visible in the
frame, text, captions, watermarks, logos, license plates, or UI
overlays. Do not generate multiple variations of the shot — one output
only.
```

---

## 4/4 — AVGASSYSTEM (exhaust)

```
Title:         chapter-exhaust-16x9
Aspect:        16:9
Start frame:   scener/_chain/after-emissions-16x9.png   ← chain handoff from emissions
Filename:      chapter-exhaust-16x9.mp4
```

> **Generate ONE clip only.** Single output, no variations.
>
> **Car body type:** matte black 5-door station wagon (estate, kombi
> silhouette, long roofline, rear hatchback). Not a coupe, not a sedan.

**Prompt:**

```
A single five-second cinematic shot for image-to-video generation. Do
not generate multiple clips or variations — one output only.

The very first frame of the output must match the input image: a matte
black 5-door station wagon (estate body style, kombi silhouette, long
roofline, rear hatchback) lifted on a workshop hoist with exploded
parts visible around it, in a dark workshop, viewed in a wide low-angle
perspective. The vehicle is a station wagon — not a coupe, not a sedan.

Across the five seconds, the camera performs one continuous flowing
motion. It begins at the wide opening composition. Over the first two
seconds the camera repositions to a low side angle and begins a slow
lateral tracking shot along the underside exhaust line — twin chrome
exhaust tips at the rear, polished mid-pipe and catback piping running
forward toward the manifold. The wagon body and exhaust line occupy the
LEFT THIRD of the 16:9 widescreen frame, running horizontally across the
upper portion of that left third; the camera tracks horizontally from
right to left along this exhaust line. The middle second holds the
lateral track at its slowest speed mid-way along the exhaust line, where
the polished titanium-blue heat tint patina on the metal pipes is most
visible. Over the final two seconds the camera pulls back smoothly and
slightly elevates, retreating to a wide low-angle side view of the
lifted wagon. This is the final chapter so there is no next chapter to
hand off to, but the end-frame should still be a clean wide neutral
side view of the full wagon, a calm resting state.

Strict composition rules that apply to every frame of the shot:
  • At the lateral tracking moment, the exhaust line stays in the LEFT
    THIRD of the frame running horizontally; the RIGHT TWO-THIRDS remain
    pitch black with subtle haze.
  • The final frame is a wide neutral side view of the lifted wagon, not
    a close-up, not centered tightly on any single part.
  • The wagon's body silhouette is preserved throughout — long
    roofline, hatchback, station-wagon proportions. Do not morph the
    silhouette toward a coupe or sedan.

Lighting: polished titanium-blue heat tint on the metal pipes during
the close lateral track; warm copper rim lighting from above throughout;
deep shadows below.

Style: premium automotive engineering close-up, shallow depth of field,
slow-motion 24fps motion blur, hyper-realistic photographic quality.

Constraints: the wagon body stays completely still throughout. Only the
camera tracks laterally and then pulls back. Do not include people,
hands, mechanics, tools, lifts visible in the frame, text, captions,
watermarks, logos, license plates, or UI overlays. Do not generate
multiple variations of the shot — one output only.
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
