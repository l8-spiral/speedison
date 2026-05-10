import { create } from "zustand";
import type { ServiceSlug } from "@/lib/pricing";

// Slim store: just the multi-select state for the offert form. Hot-spot
// clicks pre-select a service and trigger a smooth-scroll to the form,
// where the user fills in the rest.

type State = {
  selectedServices: ServiceSlug[];
  addService: (slug: ServiceSlug) => void;
  setServices: (slugs: ServiceSlug[]) => void;
  preselectFromHotspot: (slug: ServiceSlug | "emissionsOff") => void;
  reset: () => void;
};

export const useConfiguratorStore = create<State>((set) => ({
  selectedServices: [],
  addService: (slug) =>
    set((s) => ({
      selectedServices: s.selectedServices.includes(slug)
        ? s.selectedServices.filter((x) => x !== slug)
        : [...s.selectedServices, slug],
    })),
  setServices: (slugs) => set({ selectedServices: slugs }),
  preselectFromHotspot: (slug) => {
    if (slug === "emissionsOff") {
      set((s) => ({
        selectedServices: s.selectedServices.includes("egrOff")
          ? s.selectedServices
          : [...s.selectedServices, "egrOff"],
      }));
      return;
    }
    set((s) => ({
      selectedServices: s.selectedServices.includes(slug)
        ? s.selectedServices
        : [...s.selectedServices, slug],
    }));
  },
  reset: () => set({ selectedServices: [] }),
}));
