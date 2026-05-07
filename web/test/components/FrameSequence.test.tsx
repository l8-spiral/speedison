import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { FrameSequence } from "@/components/hero-scrub/FrameSequence";

describe("FrameSequence", () => {
  beforeEach(() => {
    // React 19 hoists <link rel="preload"> into <head>; clear between tests
    document.head.querySelectorAll("link[rel='preload'][as='image']").forEach(n => n.remove());
  });

  it("renders a canvas with aria-hidden", () => {
    const { container } = render(<FrameSequence progress={0} width={720} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });

  it("preloads first 30 frames (eager)", () => {
    render(<FrameSequence progress={0} width={720} />);
    // Note: React 19 hoists rel="preload" link tags to <head> regardless of where rendered.
    // Query the document, not the render container.
    const links = document.querySelectorAll("link[rel='preload'][as='image']");
    expect(links.length).toBe(30);
  });
});
