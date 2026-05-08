"use client";
import { useEffect, useRef } from "react";
import { useConfiguratorStore } from "./store";
import { ProgressBar } from "./ProgressBar";
import { StepMake } from "./StepMake";
import { StepModel } from "./StepModel";
import { StepEngine } from "./StepEngine";
import { StepServices } from "./StepServices";
import { StepContact } from "./StepContact";
import { track } from "@/lib/analytics";

export function Configurator() {
  const step = useConfiguratorStore((s) => s.step);
  const lastTrackedStep = useRef<number>(0);

  // Emit configurator_step once per step transition (skipping the initial mount).
  useEffect(() => {
    if (lastTrackedStep.current === 0) {
      lastTrackedStep.current = step;
      return;
    }
    if (step !== lastTrackedStep.current) {
      lastTrackedStep.current = step;
      track("configurator_step", { step });
    }
  }, [step]);

  return (
    <section id="konfigurator" className="bg-noir-950 py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <span className="text-xs tracking-[0.3em] uppercase text-copper-300">Få en offert</span>
        <h2 className="text-4xl md:text-6xl text-stone-100 mt-2 mb-12" style={{ fontFamily: "var(--font-display)" }}>
          Bygg din bil.
        </h2>
        <ProgressBar />
        {step === 1 && <StepMake />}
        {step === 2 && <StepModel />}
        {step === 3 && <StepEngine />}
        {step === 4 && <StepServices />}
        {step === 5 && <StepContact />}
      </div>
    </section>
  );
}
