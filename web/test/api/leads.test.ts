import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/leads/route";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 42, ref: "SP-2026-ABCDEF" }),
    },
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendLeadEmail: vi.fn().mockResolvedValue({ id: "email-1" }),
}));

const validBody = {
  vehicle: { make: "Mercedes", model: "AMG A45", engine: "M139", year: 2022 },
  services: ["stage2", "popsBangs"],
  contact: { name: "Erik", phone: "+46701234567", email: "e@x.se", message: "" },
  gdprConsent: true,
  honeypot: "",
};

function makeRequest(body: unknown, opts: RequestInit = {}): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://speedison.se",
      ...((opts.headers as Record<string, string>) ?? {}),
    },
    body: JSON.stringify(body),
    ...opts,
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("IP_HASH_SALT", "test-salt");
  });

  it("returns 200 with ref on a valid lead", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.ref).toMatch(/^SP-\d{4}-[A-F0-9]{6}$/i);
    expect(json.leadId).toBe(42);
  });

  it("rejects missing services with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, services: [] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe("VALIDATION_FAILED");
  });

  it("silently 204s on filled honeypot", async () => {
    const res = await POST(makeRequest({ ...validBody, honeypot: "spam" }));
    expect(res.status).toBe(204);
  });

  it("rejects forbidden origin in production", async () => {
    const res = await POST(makeRequest(validBody, { headers: { origin: "https://evil.example" } }));
    expect(res.status).toBe(403);
  });

  it("rejects bad JSON", async () => {
    const req = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://speedison.se" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
