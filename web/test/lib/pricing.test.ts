import { describe, it, expect } from "vitest";
import { SERVICES, getService } from "@/lib/pricing";

describe("pricing", () => {
  it("exposes all 8 service slugs", () => {
    const slugs = SERVICES.map((s) => s.slug).sort();
    expect(slugs).toEqual([
      "adblueOff",
      "dpfOff",
      "egrOff",
      "exhaust",
      "noxOff",
      "popsBangs",
      "stage1",
      "stage2",
    ]);
  });

  it("getService returns the right service by slug", () => {
    const s = getService("popsBangs");
    expect(s?.name).toBe("Pops & Bangs");
    expect(s?.shortName).toBe("Pops & Bangs");
    expect(s?.group).toBe("sound");
  });

  it("getService returns undefined for an unknown slug", () => {
    // @ts-expect-error — explicit invalid slug to verify the lookup is strict
    expect(getService("notAService")).toBeUndefined();
  });

  it("every service has a non-empty description", () => {
    for (const s of SERVICES) {
      expect(s.description.length).toBeGreaterThan(10);
    }
  });
});
