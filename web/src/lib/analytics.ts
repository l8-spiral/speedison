// Fire-and-forget analytics client. Posts to /api/events. Network failures
// are swallowed — analytics must never break the page.

type EventName =
  | "hero_completed"
  | "hotspot_clicked"
  | "configurator_step"
  | "lead_submitted"
  | "lead_failed";

type EventProps = Record<string, string | number | boolean>;

export function track(name: EventName, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}
