"use client";
import { useConfiguratorStore } from "./store";
import { SERVICES, formatPriceRange, getPriceRange } from "@/lib/pricing";

export function StepServices() {
  const selected = useConfiguratorStore((s) => s.selectedServices);
  const addService = useConfiguratorStore((s) => s.addService);
  const goTo = useConfiguratorStore((s) => s.goToStep);
  const range = getPriceRange(selected);

  return (
    <div>
      <button onClick={() => goTo(3)} className="text-stone-400 hover:text-copper-300 text-sm mb-4">
        ← Byt motor
      </button>
      <h3 className="text-3xl text-stone-100 mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Vilka tjänster vill du ha?
      </h3>
      <p className="text-stone-400 mb-8">Välj en eller flera. Du kan ändra senare.</p>

      <div className="grid md:grid-cols-2 gap-4">
        {SERVICES.map((s) => {
          const isOn = selected.includes(s.slug);
          return (
            <button
              key={s.slug}
              onClick={() => addService(s.slug)}
              className={`p-6 text-left border transition ${
                isOn ? "border-copper-300 bg-copper-300/10" : "border-noir-700 hover:border-copper-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xl text-stone-100" style={{ fontFamily: "var(--font-display)" }}>
                  {s.name}
                </span>
                <span className="text-xs text-copper-300 ml-3">
                  {formatPriceRange(s.priceFrom, s.priceTo)}
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">{s.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-noir-700 pt-6">
        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-stone-400">Uppskattat</div>
          <div className="text-copper-300 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            {formatPriceRange(range.from, range.to)}
          </div>
        </div>
        <button
          disabled={selected.length === 0}
          onClick={() => goTo(5)}
          className="px-6 py-3 border border-copper-300 text-copper-300 disabled:opacity-30 hover:bg-copper-300 hover:text-noir-900 transition tracking-[0.2em] uppercase"
        >
          Fortsätt
        </button>
      </div>
    </div>
  );
}
