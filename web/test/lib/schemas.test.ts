import { describe, it, expect } from "vitest";
import { LeadSchema, contactInfoSchema } from "@/lib/schemas";

const validLead = {
  vehicle: { make: "Mercedes", model: "AMG A45", engine: "M139", year: 2022 },
  services: ["stage2", "popsBangs"],
  contact: { name: "Erik", phone: "+46701234567", email: "e@x.se", message: "" },
  gdprConsent: true,
  honeypot: ""
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

  it("rejects invalid email", () => {
    const r = LeadSchema.safeParse({ ...validLead, contact: { ...validLead.contact, email: "nope" } });
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
});

describe("contactInfoSchema", () => {
  it("accepts a Swedish phone", () => {
    expect(contactInfoSchema.safeParse({ name:"Er", phone:"070 123 45 67", email:"a@b.se" }).success).toBe(true);
  });
  it("rejects 5-digit phone", () => {
    expect(contactInfoSchema.safeParse({ name:"Er", phone:"12345", email:"a@b.se" }).success).toBe(false);
  });
});
