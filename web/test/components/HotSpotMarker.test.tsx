import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { HotSpotMarker } from "@/components/hero-scrub/HotSpotMarker";

describe("HotSpotMarker", () => {
  it("renders with aria-label", () => {
    render(<HotSpotMarker x={50} y={50} label="Stage 1" service="stage1" visible={true} onActivate={() => {}} />);
    expect(screen.getByRole("button", { name: /Stage 1/ })).toBeInTheDocument();
  });

  it("hides when visible=false", () => {
    render(<HotSpotMarker x={50} y={50} label="X" service="stage1" visible={false} onActivate={() => {}} />);
    const btn = screen.getByRole("button", { name: /X/ });
    expect(btn).toHaveStyle({ opacity: "0" });
  });

  it("calls onActivate on click", async () => {
    const cb = vi.fn();
    render(<HotSpotMarker x={50} y={50} label="X" service="stage1" visible={true} onActivate={cb} />);
    await userEvent.click(screen.getByRole("button"));
    expect(cb).toHaveBeenCalledWith("stage1");
  });
});
