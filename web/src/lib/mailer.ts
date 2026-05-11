import nodemailer, { type Transporter } from "nodemailer";
import { getService } from "./pricing";

// SMTP-based transactional mailer. We deliver via the Misshosting mailbox
// info@speedison.se, which already has its own SPF/DKIM configured by the
// hosting provider — no third-party (e.g. Resend) is in the loop.
//
// Required env vars:
//   SMTP_HOST   — Misshosting's outgoing host (e.g. "mail.misshosting.se")
//   SMTP_PORT   — 587 (STARTTLS, recommended) or 465 (implicit TLS)
//   SMTP_USER   — full address, "info@speedison.se"
//   SMTP_PASS   — the mailbox password
//   MAIL_FROM   — display string, e.g. '"Speedison" <info@speedison.se>'
//   MAIL_TO     — destination for lead notifications (info@speedison.se)
//
// Optional:
//   SMTP_SECURE — "true" forces TLS even on non-465 ports. Default is
//                 derived from SMTP_PORT (465 → secure, else STARTTLS).

let _transporter: Transporter | null = null;

function transporter(): Transporter {
  if (_transporter) return _transporter;
  const host = process.env.SMTP_HOST;
  const portStr = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_HOST, SMTP_USER and SMTP_PASS must be set (see web/.env.example)"
    );
  }
  const port = Number(portStr ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;
  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return _transporter;
}

function fromAddress(): string {
  return (
    process.env.MAIL_FROM ?? '"Speedison" <info@speedison.se>'
  );
}

function toAddress(): string {
  return process.env.MAIL_TO ?? "info@speedison.se";
}

export type LeadEmailInput = {
  ref: string;
  regNumber: string;
  services: string[];
  contact: { name: string; phone: string; email: string };
  description?: string;
};

export async function sendLeadEmail(
  lead: LeadEmailInput
): Promise<{ id: string } | { error: string }> {
  const serviceNames = lead.services
    .map(
      (slug) =>
        getService(slug as Parameters<typeof getService>[0])?.name ?? slug
    )
    .join(", ");
  const descriptionLines = (lead.description ?? "").trim();
  const descriptionBlock = descriptionLines
    ? `Beskrivning:\n> ${descriptionLines.split("\n").join("\n> ")}\n\n`
    : "";

  const text = `Reg.nr:       ${lead.regNumber}
Tjänster:     ${serviceNames}

Kontakt:      ${lead.contact.name}
Telefon:      ${lead.contact.phone}
E-post:       ${lead.contact.email}

${descriptionBlock}Mottaget:     ${new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 16)}
Ärendenr:     ${lead.ref}
`;

  try {
    const info = await transporter().sendMail({
      from: fromAddress(),
      to: toAddress(),
      replyTo: lead.contact.email,
      subject: `[${lead.ref}] Ny offertförfrågan – ${lead.regNumber}`,
      text,
    });
    return { id: info.messageId ?? "unknown" };
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
  const text = `Från: ${c.name} <${c.email}>${
    c.phone ? ` · ${c.phone}` : ""
  }\n\n${c.message}`;
  try {
    await transporter().sendMail({
      from: fromAddress(),
      to: toAddress(),
      replyTo: c.email,
      subject: "Nytt kontaktmeddelande",
      text,
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
