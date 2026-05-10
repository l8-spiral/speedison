import { describe, it, expect } from "vitest";
import { LeadSchema, contactInfoSchema, regNumberSchema } from "@/lib/schemas";

const validLead = {
  regNumber: "ABC123",
  services: ["stage2", "popsBangs"],
  contact: { name: "Erik", phone: "+46701234567", email: "e@x.se" },
  description: "",
  gdprConsent: true,
  honeypot: "",
};

describe("LeadSchema", () => {
  it("accepts a valid lead", () => {
    const r = LeadSchema.safeParse(validLead);
    expect(r.success).toBe(true);
  });

  it("rejects missing services", () => {
    const r = LeadSchema.safeParse({ ...validLead, services: [] });
    expect(r.success).toBe(false);
  });

  it("rejects missing reg number", () => {
    const r = LeadSchema.safeParse({ ...validLead, regNumber: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = LeadSchema.safeParse({
      ...validLead,
      contact: { ...validLead.contact, email: "nope" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects missing GDPR consent", () => {
    const r = LeadSchema.safeParse({ ...validLead, gdprConsent: false });
    expect(r.success).toBe(false);
  });

  it("rejects when honeypot is filled (bot)", () => {
    const r = LeadSchema.safeParse({ ...validLead, honeypot: "spam" });
    expect(r.success).toBe(false);
  });

  it("accepts a description up to 2000 chars", () => {
    const desc = "x".repeat(2000);
    const r = LeadSchema.safeParse({ ...validLead, description: desc });
    expect(r.success).toBe(true);
  });
});

describe("regNumberSchema", () => {
  it("accepts a Swedish plate like ABC123", () => {
    expect(regNumberSchema.safeParse("ABC123").success).toBe(true);
  });
  it("accepts a plate with internal space", () => {
    expect(regNumberSchema.safeParse("ABC 123").success).toBe(true);
  });
  it("rejects a plate with special chars", () => {
    expect(regNumberSchema.safeParse("ABC-123!").success).toBe(false);
  });
  it("rejects an empty plate", () => {
    expect(regNumberSchema.safeParse("").success).toBe(false);
  });
});

describe("contactInfoSchema", () => {
  it("accepts a Swedish phone", () => {
    expect(
      contactInfoSchema.safeParse({ name: "Er", phone: "070 123 45 67", email: "a@b.se" }).success
    ).toBe(true);
  });
  it("rejects 5-digit phone", () => {
    expect(
      contactInfoSchema.safeParse({ name: "Er", phone: "12345", email: "a@b.se" }).success
    ).toBe(false);
  });
});
