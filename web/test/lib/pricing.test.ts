import { describe, it, expect } from "vitest";
import { SERVICES, getService, formatPriceRange, getPriceRange } from "@/lib/pricing";

describe("pricing", () => {
  it("exposes all 8 service slugs", () => {
    const slugs = SERVICES.map(s => s.slug).sort();
    expect(slugs).toEqual(
      ["adblueOff","dpfOff","egrOff","exhaust","noxOff","popsBangs","stage1","stage2"]
    );
  });

  it("getService returns the right service by slug", () => {
    const s = getService("popsBangs");
    expect(s?.name).toBe("Pops & Bangs");
    expect(s?.priceFrom).toBe(2995);
  });

  it("formatPriceRange formats SEK correctly", () => {
    expect(formatPriceRange(2995, null)).toBe("Från 2 995 kr");
    expect(formatPriceRange(8990, 14990)).toBe("8 990 – 14 990 kr");
    expect(formatPriceRange(null, null)).toBe("Begär offert");
  });

  it("getPriceRange computes a sum range across selected services", () => {
    const range = getPriceRange(["popsBangs", "egrOff"]);
    expect(range.from).toBe(2995 + 1995);
    expect(range.to).toBeNull();
  });
});
