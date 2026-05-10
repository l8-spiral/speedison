import { describe, it, expect, beforeEach } from "vitest";
import { useConfiguratorStore } from "@/components/configurator/store";

describe("configuratorStore", () => {
  beforeEach(() => useConfiguratorStore.getState().reset());

  it("starts with no services selected", () => {
    expect(useConfiguratorStore.getState().selectedServices).toEqual([]);
  });

  it("addService toggles in selectedServices", () => {
    const a = useConfiguratorStore.getState();
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1"]);
    a.addService("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual([]);
  });

  it("setServices replaces the whole list", () => {
    useConfiguratorStore.getState().setServices(["stage1", "popsBangs"]);
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1", "popsBangs"]);
  });

  it("preselectFromHotspot adds the service without removing existing ones", () => {
    useConfiguratorStore.getState().addService("stage1");
    useConfiguratorStore.getState().preselectFromHotspot("popsBangs");
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1", "popsBangs"]);
  });

  it("preselectFromHotspot 'emissionsOff' adds egrOff as the representative slug", () => {
    useConfiguratorStore.getState().preselectFromHotspot("emissionsOff");
    expect(useConfiguratorStore.getState().selectedServices).toContain("egrOff");
  });

  it("preselectFromHotspot is a no-op if the service is already selected", () => {
    useConfiguratorStore.getState().addService("stage1");
    useConfiguratorStore.getState().preselectFromHotspot("stage1");
    expect(useConfiguratorStore.getState().selectedServices).toEqual(["stage1"]);
  });
});
