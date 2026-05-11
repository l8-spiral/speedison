"use client";
import { useConfiguratorStore } from "@/components/configurator/store";
import type { ServiceSlug } from "@/lib/pricing";

// Used at the bottom of every chapter (presentation panel AND scroll-stage
// fallback). One click should do two things:
//   1. Pre-select the chapter's services in the configurator store.
//   2. Smooth-scroll to the configurator section.

type Props = {
  serviceSlugs: readonly ServiceSlug[];
  /** Replace existing selection instead of merging — useful when the user
   *  clicks from one chapter to another. Default: merge (additive). */
  replace?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function RequestQuoteButton({
  serviceSlugs,
  replace = false,
  className,
  children,
}: Props) {
  const setServices = useConfiguratorStore((s) => s.setServices);
  const selected = useConfiguratorStore((s) => s.selectedServices);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    const next = replace
      ? Array.from(new Set(serviceSlugs))
      : Array.from(new Set([...selected, ...serviceSlugs]));
    setServices(next as ServiceSlug[]);
    document.getElementById("konfigurator")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <a
      href="#konfigurator"
      onClick={onClick}
      data-services={serviceSlugs.join(",")}
      className={
        className ??
        "inline-block px-6 py-3 border border-copper-300 text-copper-300 hover:bg-copper-300 hover:text-noir-900 transition text-sm tracking-[0.2em] uppercase"
      }
    >
      {children ?? "Begär offert"}
    </a>
  );
}
