import { describe, it, expect, beforeEach } from "vitest";
import { useConfiguratorStore } from "@/components/configurator/store";

describe("configuratorStore", () => {
  beforeEach(() => useConfiguratorStore.getState().reset());

  it("starts at step 1 with empty state", () => {
    const s = useConfiguratorStore.getState();
    expect(s.step).toBe(1);
    expect(s.selectedServices).toEqual([]);
  });

  it("setMake advances to step 2", () => {
    useConfiguratorStore.getState().setMake("Mercedes");
    const s = useConfiguratorStore.getState();
    expect(s.vehicle.make).toBe("Mercedes");
    expect(s.step).toBe(2);
  });

  it("addService toggles in selectedServices", () => {
    const a = useConfiguratorStore.getState();
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1"]);
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual([]);
  });

  it("preselectFromHotspot adds the service and jumps to step 3", () => {
    useConfiguratorStore.getState().preselectFromHotspot("popsBangs");
    const s = useConfiguratorStore.getState();
    expect(s.selectedServices).toEqual(["popsBangs"]);
    expect(s.step).toBe(3);
  });

  it("preselectFromHotspot 'emissionsOff' adds egrOff and jumps to step 4", () => {
    useConfiguratorStore.getState().preselectFromHotspot("emissionsOff");
    const s = useConfiguratorStore.getState();
    expect(s.selectedServices).toContain("egrOff");
    expect(s.step).toBe(4);
  });
});
