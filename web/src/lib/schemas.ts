import { z } from "zod";

const SERVICE_SLUGS = [
  "stage1","stage2","popsBangs","egrOff","dpfOff","adblueOff","noxOff","exhaust"
] as const;

export const phoneSchema = z.string().trim().min(7).max(20)
  .regex(/^[+\d\s\-()]+$/, "Ogiltigt telefonnummer")
  .refine(v => v.replace(/\D/g, "").length >= 7, "För kort telefonnummer");

export const contactInfoSchema = z.object({
  name: z.string().trim().min(1, "Namn krävs").max(120),
  phone: phoneSchema,
  email: z.email("Ogiltig e-postadress").max(120),
  message: z.string().max(1000).optional().default(""),
});

export const vehicleSchema = z.object({
  make: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  engine: z.string().trim().max(200).optional().default(""),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
});

export const LeadSchema = z.object({
  vehicle: vehicleSchema,
  services: z.array(z.enum(SERVICE_SLUGS)).min(1, "Välj minst en tjänst"),
  contact: contactInfoSchema,
  gdprConsent: z.literal(true, { error: "Du måste godkänna integritetspolicyn" }),
  honeypot: z.literal(""),
});

export type Lead = z.infer<typeof LeadSchema>;
