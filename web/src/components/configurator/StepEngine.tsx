"use client";
import { useState } from "react";
import { useConfiguratorStore } from "./store";

export function StepEngine() {
  const setEngine = useConfiguratorStore((s) => s.setEngine);
  const goBack = useConfiguratorStore((s) => s.goToStep);
  const [engine, setE] = useState("");
  const [year, setY] = useState<string>("");

  const yNum = year ? parseInt(year, 10) : null;
  const valid =
    engine.trim().length > 0 &&
    yNum !== null &&
    yNum >= 1990 &&
    yNum <= new Date().getFullYear() + 1;

  return (
    <div>
      <button onClick={() => goBack(2)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">
        ← Byt modell
      </button>
      <h3 className="text-3xl text-stone-100 mb-8" style={{ fontFamily: "var(--font-display)" }}>
        Motor och årsmodell
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
            Motorbeteckning
          </label>
          <input
            value={engine}
            onChange={(e) => setE(e.target.value)}
            placeholder="t.ex. M177 4.0 V8 Biturbo"
            className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
            Årsmodell
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setY(e.target.value)}
            placeholder="t.ex. 2022"
            className="w-full bg-noir-800 border border-noir-700 px-4 py-3 text-stone-100 focus:outline-none focus:border-copper-300"
          />
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
