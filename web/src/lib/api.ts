import type { Lead } from "./schemas";

// Same-origin route handler at /api/leads (Railway). No CORS, no NEXT_PUBLIC_API_BASE.
export type LeadOk = { ok: true; leadId: number; ref: string };
export type LeadErr = { ok: false; error: string; fields?: Record<string, string> };

export async function submitLead(payload: Lead, signal?: AbortSignal): Promise<LeadOk | LeadErr> {
  const res = await fetch(`/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "VALIDATION_FAILED", fields: data.fields };
    }
    return { ok: false, error: "SERVER_ERROR" };
  }
  return await res.json();
}
