import type { ReactNode } from "react";

// A short "what / how / time / result" panel that sits between two
// scroll-scrubbed chapters. Its job is two-fold: it gives the visitor a
// structured summary of the service in question (the scroll-scrub video is
// emotional; this panel is informational), and it visually breaks the
// transition between two videos so the cut between sticky scroll-stages
// reads as deliberate rather than as a glitch.
//
// Theme break: noir-950 background (one shade deeper than the chapter
// scrubs which sit on noir-900), with a copper hairline on top that
// echoes the brand accent and signals "new chapter starts here."

export type PresentationItem = { label: string; value: string };

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  items: PresentationItem[];
  /** Optional small icon/glyph or anything else to anchor the eye. */
  accent?: ReactNode;
};

export function ChapterPresentation({ eyebrow, title, intro, items, accent }: Props) {
  return (
    <section className="relative bg-noir-950 py-20 md:py-28 px-6 md:px-12">
      {/* hairline + copper marker — the "color break" */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper-300/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-copper-300" />

      <div className="max-w-5xl mx-auto">
        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-4">
            {accent}
            <span className="text-xs tracking-[0.3em] uppercase text-copper-300">
              {eyebrow}
            </span>
          </div>
          <h3
            className="text-3xl md:text-5xl text-stone-100 mt-3 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <p className="mt-6 text-stone-400 text-base md:text-lg max-w-3xl leading-relaxed">
            {intro}
          </p>
        </header>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-noir-800">
          {items.map((it) => (
            <div key={it.label} className="bg-noir-950 p-6 md:p-8">
              <dt className="text-xs tracking-[0.25em] uppercase text-copper-300/80">
                {it.label}
              </dt>
              <dd className="mt-3 text-stone-200 text-sm md:text-base leading-relaxed">
                {it.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
