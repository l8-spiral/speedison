// HTML + plain-text bodies for transactional mail. Kept separate from
// mailer.ts so the SMTP transport is one concern and the rendering is
// another (and so the templates can be reused by future tests / preview
// tools without instantiating a transporter).
//
// Design constraints for HTML mail:
//   • Inline styles only — Gmail / Outlook strip <style> blocks.
//   • Layout via <table>, not flex/grid — same compatibility reason.
//   • Max width 600px on the outermost container.
//   • System font stack — no @import / no <link rel="stylesheet">.
//   • Brand palette: noir base #0a0a0f, copper accent #d4a574,
//     champagne text #f0e0c8 — matches the site theme.

import { getService } from "./pricing";
import type { ServiceSlug } from "./pricing";

// ----------------------------------------------------------------------
// Lead notification — sent on POST /api/leads success

export type LeadMail = {
  ref: string;
  regNumber: string;
  services: string[];
  contact: { name: string; phone: string; email: string };
  description?: string;
  receivedAt?: Date;
};

function fmtDateTime(d: Date): string {
  // YYYY-MM-DD HH:mm in Stockholm time, ASCII only so mail clients don't
  // mangle the encoding.
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function serviceLabels(slugs: string[]): string[] {
  return slugs.map((slug) => {
    const s = getService(slug as ServiceSlug);
    return s ? s.name : slug;
  });
}

export function leadSubject(lead: LeadMail): string {
  return `[${lead.ref}] Ny offertförfrågan – ${lead.regNumber}`;
}

export function leadText(lead: LeadMail): string {
  const services = serviceLabels(lead.services).join("\n  · ");
  const received = fmtDateTime(lead.receivedAt ?? new Date());
  const desc = (lead.description ?? "").trim();
  const descBlock = desc
    ? `\nBeskrivning från kund\n────────────────────\n${desc
        .split("\n")
        .map((l) => "  " + l)
        .join("\n")}\n`
    : "";

  return `Ny offertförfrågan
==================

Ärendenummer:   ${lead.ref}
Mottaget:       ${received}
Reg.nr:         ${lead.regNumber}

Kund
────
  Namn:    ${lead.contact.name}
  Telefon: ${lead.contact.phone}
  E-post:  ${lead.contact.email}

Önskade tjänster
────────────────
  · ${services}
${descBlock}
────────────────────────────────────────
Svara direkt på detta mejl så går svaret till kunden.
Skickat automatiskt från speedison.se.
`;
}

export function leadHtml(lead: LeadMail): string {
  const services = serviceLabels(lead.services);
  const received = fmtDateTime(lead.receivedAt ?? new Date());
  const desc = (lead.description ?? "").trim();
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const serviceRows = services
    .map(
      (name) => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #1a1a24;">
          <span style="color:#d4a574;font-weight:600;margin-right:10px;">·</span>
          <span style="color:#f0e0c8;font-size:15px;">${esc(name)}</span>
        </td>
      </tr>`
    )
    .join("");

  const descBlock = desc
    ? `
    <tr>
      <td style="padding:24px 32px 0;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#d4a574;margin-bottom:8px;">Beskrivning från kund</div>
        <div style="background:#0a0a0f;border-left:3px solid #d4a574;padding:14px 18px;color:#f0e0c8;font-size:15px;line-height:1.55;white-space:pre-wrap;">${esc(
          desc
        )}</div>
      </td>
    </tr>`
    : "";

  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(leadSubject(lead))}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="600" style="max-width:600px;width:100%;background:#14141c;border:1px solid #1a1a24;border-radius:6px;overflow:hidden;">
    <!-- header bar -->
    <tr>
      <td style="background:#0a0a0f;padding:18px 32px;border-bottom:1px solid #d4a574;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td>
              <div style="font-family:Georgia,serif;font-size:18px;letter-spacing:6px;color:#d4a574;text-transform:uppercase;">Speedison</div>
            </td>
            <td align="right">
              <div style="font-family:Consolas,'SF Mono',monospace;font-size:12px;color:#888;">${esc(
                lead.ref
              )}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- summary card -->
    <tr>
      <td style="padding:32px 32px 8px;">
        <div style="font-family:Georgia,serif;font-size:24px;color:#f0e0c8;line-height:1.2;">Ny offertförfrågan</div>
        <div style="font-size:13px;color:#888;margin-top:6px;">${esc(
          received
        )}</div>
      </td>
    </tr>

    <!-- reg.nr block -->
    <tr>
      <td style="padding:16px 32px 24px;">
        <div style="display:inline-block;background:#0a0a0f;border:1px solid #d4a574;color:#d4a574;font-family:Consolas,'SF Mono',monospace;font-size:18px;letter-spacing:3px;padding:10px 18px;border-radius:4px;">${esc(
          lead.regNumber
        )}</div>
      </td>
    </tr>

    <!-- customer -->
    <tr>
      <td style="padding:0 32px;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#d4a574;margin-bottom:12px;">Kund</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:12px;width:90px;">Namn</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;">${esc(
              lead.contact.name
            )}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:12px;">Telefon</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;"><a href="tel:${esc(
              lead.contact.phone.replace(/\s+/g, "")
            )}" style="color:#f0e0c8;text-decoration:none;">${esc(
              lead.contact.phone
            )}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:12px;">E-post</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;"><a href="mailto:${esc(
              lead.contact.email
            )}" style="color:#f0e0c8;text-decoration:none;">${esc(
              lead.contact.email
            )}</a></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- services -->
    <tr>
      <td style="padding:24px 32px 8px;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#d4a574;margin-bottom:8px;">Önskade tjänster</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${serviceRows}
        </table>
      </td>
    </tr>

    <!-- description (optional) -->
    ${descBlock}

    <!-- footer -->
    <tr>
      <td style="padding:32px 32px 28px;border-top:1px solid #1a1a24;margin-top:24px;">
        <div style="color:#888;font-size:12px;line-height:1.6;">
          Svara direkt på detta mejl så går svaret till kunden (Reply-To är satt).<br>
          Skickat automatiskt från <a href="https://speedison.se" style="color:#d4a574;text-decoration:none;">speedison.se</a>.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ----------------------------------------------------------------------
// Contact-form notification — sent on POST /api/contact success

export type ContactMail = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  receivedAt?: Date;
};

export function contactSubject(c: ContactMail): string {
  return `Nytt kontaktmeddelande – ${c.name}`;
}

export function contactText(c: ContactMail): string {
  const received = fmtDateTime(c.receivedAt ?? new Date());
  return `Nytt kontaktmeddelande
======================

Mottaget:  ${received}

Från
────
  Namn:    ${c.name}
  E-post:  ${c.email}${c.phone ? `\n  Telefon: ${c.phone}` : ""}

Meddelande
──────────
${c.message
  .split("\n")
  .map((l) => "  " + l)
  .join("\n")}

────────────────────────────────────────
Svara direkt på detta mejl så går svaret till kunden.
`;
}

export function contactHtml(c: ContactMail): string {
  const received = fmtDateTime(c.receivedAt ?? new Date());
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(contactSubject(c))}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="600" style="max-width:600px;width:100%;background:#14141c;border:1px solid #1a1a24;border-radius:6px;overflow:hidden;">
    <tr>
      <td style="background:#0a0a0f;padding:18px 32px;border-bottom:1px solid #d4a574;">
        <div style="font-family:Georgia,serif;font-size:18px;letter-spacing:6px;color:#d4a574;text-transform:uppercase;">Speedison</div>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 32px 8px;">
        <div style="font-family:Georgia,serif;font-size:24px;color:#f0e0c8;line-height:1.2;">Nytt kontaktmeddelande</div>
        <div style="font-size:13px;color:#888;margin-top:6px;">${esc(received)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px 0;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#d4a574;margin-bottom:12px;">Från</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:6px 0;color:#888;font-size:12px;width:90px;">Namn</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;">${esc(c.name)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#888;font-size:12px;">E-post</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;"><a href="mailto:${esc(
              c.email
            )}" style="color:#f0e0c8;text-decoration:none;">${esc(c.email)}</a></td>
          </tr>
          ${
            c.phone
              ? `<tr>
            <td style="padding:6px 0;color:#888;font-size:12px;">Telefon</td>
            <td style="padding:6px 0;color:#f0e0c8;font-size:15px;"><a href="tel:${esc(
              c.phone.replace(/\s+/g, "")
            )}" style="color:#f0e0c8;text-decoration:none;">${esc(c.phone)}</a></td>
          </tr>`
              : ""
          }
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 32px 8px;">
        <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#d4a574;margin-bottom:8px;">Meddelande</div>
        <div style="background:#0a0a0f;border-left:3px solid #d4a574;padding:14px 18px;color:#f0e0c8;font-size:15px;line-height:1.55;white-space:pre-wrap;">${esc(
          c.message
        )}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 32px 28px;border-top:1px solid #1a1a24;margin-top:24px;">
        <div style="color:#888;font-size:12px;line-height:1.6;">
          Svara direkt på detta mejl så går svaret till kunden (Reply-To är satt).<br>
          Skickat automatiskt från <a href="https://speedison.se" style="color:#d4a574;text-decoration:none;">speedison.se</a>.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
