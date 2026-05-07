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
        <h2 className="text-4xl md:text-6xl text-stone-100 mt-2 mb-12" style={{ fontFamily: "var(--font-display)" }}>Bilar i verkstaden</h2>
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
