"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

const MODELS_BY_MAKE: Record<string, string[]> = {
  Mercedes: ["AMG A35", "AMG A45", "AMG C43", "AMG C63", "AMG E63", "AMG GT", "CLA", "C-Klass"],
  Audi: ["S3", "RS3", "S4", "RS4", "S5", "RS5", "S6", "RS6", "S7", "RS7", "S8", "TT RS"],
  BMW: ["M2", "M3", "M4", "M5", "M8", "X3 M", "X5 M"],
  Volkswagen: ["Golf GTI", "Golf R", "Polo GTI", "Arteon"],
  Volvo: ["S60", "V60", "V90", "XC60", "XC90"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "718 Cayman"],
  Ford: ["Focus ST", "Focus RS", "Fiesta ST", "Mustang"],
  Skoda: ["Octavia RS", "Superb"],
};

export function StepModel() {
  const make = useConfiguratorStore((s) => s.vehicle.make);
  const setModel = useConfiguratorStore((s) => s.setModel);
  const goBack = useConfiguratorStore((s) => s.goToStep);
  const [search, setSearch] = useState("");
  const list = (MODELS_BY_MAKE[make] ?? []).filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <button onClick={() => goBack(1)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">
        ← Byt märke
      </button>
      <h3 className="text-3xl text-stone-100 mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Modell ({make})
      </h3>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300 mb-6"
        placeholder="Sök modell..."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {list.map((m) => (
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
        <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
          Min modell saknas
        </label>
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) setModel(v);
            }
          }}
          className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
          placeholder="Skriv modellnamnet och tryck Enter"
        />
      </div>
    </div>
  );
}
