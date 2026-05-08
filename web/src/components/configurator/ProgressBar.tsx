"use client";
import { useConfiguratorStore } from "./store";

const STEPS = ["Märke", "Modell", "Motor", "Tjänster", "Kontakt"];

export function ProgressBar() {
  const step = useConfiguratorStore((s) => s.step);
  return (
    <div className="flex items-center justify-between mb-12">
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const active = step === idx;
        const done = step > idx;
        return (
          <div key={label} className="flex-1 flex flex-col items-center">
            <span
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                done
                  ? "bg-copper-300 text-noir-900 border-copper-300"
                  : active
                  ? "border-copper-300 text-copper-300"
                  : "border-noir-700 text-stone-500"
              }`}
            >
              {idx}
            </span>
            <span
              className={`mt-2 text-xs uppercase tracking-[0.2em] ${
                active || done ? "text-copper-300" : "text-stone-500"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
