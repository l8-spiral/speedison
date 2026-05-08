import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/contact/route";

vi.mock("@/lib/prisma", () => ({
  prisma: { contact: { create: vi.fn().mockResolvedValue({ id: 7 }) } },
}));
vi.mock("@/lib/mailer", () => ({
  sendContactEmail: vi.fn().mockResolvedValue({ ok: true }),
}));

function req(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://speedison.se",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("IP_HASH_SALT", "x");
  });

  it("returns 200 on a valid message", async () => {
    const res = await POST(
      req({ name: "Erik", email: "e@x.se", message: "Hej!", honeypot: "" })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("rejects missing message", async () => {
    const res = await POST(req({ name: "Erik", email: "e@x.se", message: "", honeypot: "" }));
    expect(res.status).toBe(400);
  });

  it("204 on filled honeypot", async () => {
    const res = await POST(req({ name: "x", email: "x@y.z", message: "hi", honeypot: "bot" }));
    expect(res.status).toBe(204);
  });

  it("rejects forbidden origin in production", async () => {
    const res = await POST(
      req({ name: "Erik", email: "e@x.se", message: "Hej!", honeypot: "" }, { origin: "https://evil.example" })
    );
    expect(res.status).toBe(403);
  });
});
