"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

const MAKES = ["Mercedes", "Audi", "BMW", "Volkswagen", "Volvo", "Porsche", "Ford", "Skoda"];

export function StepMake() {
  const setMake = useConfiguratorStore((s) => s.setMake);
  const [other, setOther] = useState("");
  return (
    <div>
      <h3 className="text-3xl text-stone-100 mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Vilken bil har du?
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MAKES.map((m) => (
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
        <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
          Annat märke
        </label>
        <div className="flex gap-3">
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
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
