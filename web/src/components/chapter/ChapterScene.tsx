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
  videoSrc?: string;
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
        <h2 className="text-4xl md:text-6xl text-stone-100 mt-2 leading-tight" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h2>
        <p className="mt-6 text-stone-400 text-lg leading-relaxed">{p.body}</p>
        {p.bullets && (
          <ul className="mt-6 space-y-2 text-stone-300">
            {p.bullets.map(b => <li key={b}>· {b}</li>)}
          </ul>
        )}
        <div className="mt-8 flex items-center gap-6">
          <span className="text-copper-300 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
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
