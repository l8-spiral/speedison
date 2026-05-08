import { Resend } from "resend";

let _resend: Resend | null = null;
function client(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

export type LeadEmailInput = {
  ref: string;
  vehicle: { make: string; model: string; engine?: string; year?: number | null };
  services: string[];
  contact: { name: string; phone: string; email: string; message?: string };
};

export async function sendLeadEmail(
  lead: LeadEmailInput
): Promise<{ id: string } | { error: string }> {
  const to = process.env.MAIL_TO ?? "info@speedison.se";
  const from = process.env.MAIL_FROM ?? "Speedison <noreply@speedison.se>";

  const services = lead.services.join(", ");
  const yearStr = lead.vehicle.year ? ` (${lead.vehicle.year})` : "";
  const messageLines = (lead.contact.message ?? "").split("\n").join("\n> ");

  const text = `Märke:        ${lead.vehicle.make}
Modell:       ${lead.vehicle.model}
Motor:        ${lead.vehicle.engine ?? ""}${yearStr}
Tjänster:     ${services}

Kontakt:      ${lead.contact.name}
Telefon:      ${lead.contact.phone}
E-post:       ${lead.contact.email}

Meddelande:
> ${messageLines}

Mottaget:     ${new Date().toISOString().replace("T", " ").slice(0, 16)}
Ärendenr:     ${lead.ref}
`;

  try {
    const result = await client().emails.send({
      from,
      to: [to],
      replyTo: lead.contact.email,
      subject: `[${lead.ref}] Ny offertförfrågan – ${lead.vehicle.make} ${lead.vehicle.model}`,
      text,
    });
    if (result.error) return { error: result.error.message ?? "send_failed" };
    return { id: result.data?.id ?? "unknown" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "send_threw" };
  }
}

export async function sendContactEmail(c: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<{ ok: boolean }> {
  const to = process.env.MAIL_TO ?? "info@speedison.se";
  const from = process.env.MAIL_FROM ?? "Speedison <noreply@speedison.se>";
  const text = `Från: ${c.name} <${c.email}>${c.phone ? ` · ${c.phone}` : ""}\n\n${c.message}`;
  try {
    await client().emails.send({
      from,
      to: [to],
      replyTo: c.email,
      subject: "Nytt kontaktmeddelande",
      text,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
