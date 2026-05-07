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
        <h2 className="text-4xl md:text-5xl text-stone-100 mt-2 mb-10" style={{ fontFamily: "var(--font-display)" }}>Vad du undrar.</h2>
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
                  <span className="text-lg md:text-xl" style={{ fontFamily: "var(--font-display)" }}>{it.q}</span>
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
