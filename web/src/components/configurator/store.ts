import { create } from "zustand";
import type { ServiceSlug } from "@/lib/pricing";

type Vehicle = { make: string; model: string; engine: string; year: number | null };
type Contact = { name: string; phone: string; email: string; message: string };

type State = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  vehicle: Vehicle;
  selectedServices: ServiceSlug[];
  contact: Contact;
  gdprConsent: boolean;
  setMake: (make: string) => void;
  setModel: (model: string) => void;
  setEngine: (engine: string, year: number | null) => void;
  addService: (slug: ServiceSlug) => void;
  setContact: (c: Partial<Contact>) => void;
  setGdpr: (v: boolean) => void;
  goToStep: (s: State["step"]) => void;
  preselectFromHotspot: (slug: ServiceSlug | "emissionsOff") => void;
  reset: () => void;
};

const EMPTY = {
  step: 1 as const,
  vehicle: { make: "", model: "", engine: "", year: null },
  contact: { name: "", phone: "", email: "", message: "" },
  selectedServices: [] as ServiceSlug[],
  gdprConsent: false,
};

export const useConfiguratorStore = create<State>((set) => ({
  ...EMPTY,
  setMake: (make) => set((s) => ({ vehicle: { ...s.vehicle, make }, step: make ? 2 : 1 })),
  setModel: (model) => set((s) => ({ vehicle: { ...s.vehicle, model }, step: model ? 3 : 2 })),
  setEngine: (engine, year) => set((s) => ({ vehicle: { ...s.vehicle, engine, year }, step: 4 })),
  addService: (slug) => set((s) => ({
    selectedServices: s.selectedServices.includes(slug)
      ? s.selectedServices.filter((x) => x !== slug)
      : [...s.selectedServices, slug],
  })),
  setContact: (c) => set((s) => ({ contact: { ...s.contact, ...c } })),
  setGdpr: (v) => set({ gdprConsent: v }),
  goToStep: (step) => set({ step }),
  preselectFromHotspot: (slug) => {
    if (slug === "emissionsOff") {
      set((s) => ({
        selectedServices: s.selectedServices.includes("egrOff")
          ? s.selectedServices
          : [...s.selectedServices, "egrOff"],
        step: 4,
      }));
      return;
    }
    set((s) => ({
      selectedServices: s.selectedServices.includes(slug)
        ? s.selectedServices
        : [...s.selectedServices, slug],
      step: 3,
    }));
  },
  reset: () => set({ ...EMPTY }),
}));
