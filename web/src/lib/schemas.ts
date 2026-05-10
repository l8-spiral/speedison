import { z } from "zod";

const SERVICE_SLUGS = [
  "stage1", "stage2", "popsBangs", "egrOff",
  "dpfOff", "adblueOff", "noxOff", "exhaust",
] as const;

export const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^[+\d\s\-()]+$/, "Ogiltigt telefonnummer")
  .refine((v) => v.replace(/\D/g, "").length >= 7, "För kort telefonnummer");

// Swedish reg plate: 6 chars typical, but allow 2–10 for foreign / personalised plates.
// Letters + digits only, optional internal space.
export const regNumberSchema = z
  .string()
  .trim()
  .min(2, "För kort registreringsnummer")
  .max(10, "För långt registreringsnummer")
  .regex(/^[A-Za-zÅÄÖåäö0-9 ]+$/, "Ogiltigt registreringsnummer");

export const contactInfoSchema = z.object({
  name: z.string().trim().min(2, "För kort namn").max(120),
  phone: phoneSchema,
  email: z.email("Ogiltig e-postadress").max(120),
  message: z.string().max(1000).optional().default(""),
});

export const LeadSchema = z.object({
  regNumber: regNumberSchema,
  services: z.array(z.enum(SERVICE_SLUGS)).min(1, "Välj minst en tjänst"),
  contact: z.object({
    name: z.string().trim().min(2, "För kort namn").max(120),
    phone: phoneSchema,
    email: z.email("Ogiltig e-postadress").max(120),
  }),
  description: z.string().trim().max(2000).optional().default(""),
  gdprConsent: z.literal(true, { error: "Du måste godkänna integritetspolicyn" }),
  honeypot: z.literal(""),
});

export type Lead = z.infer<typeof LeadSchema>;
