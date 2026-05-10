import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendLeadEmail } from "@/lib/mailer";
import { hashIp, isRateLimited } from "@/lib/ratelimit";
import { isAllowedOrigin } from "@/lib/server-origin";
import { LeadSchema } from "@/lib/schemas";

export const runtime = "nodejs"; // Prisma + Resend require Node, not Edge

const MAX_BODY_BYTES = 8192;

function makeRef(): string {
  const year = new Date().getFullYear();
  const random = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `SP-${year}-${random.toUpperCase()}`;
}

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "unknown";
}

export async function POST(req: Request): Promise<Response> {
  // Same-origin guard
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  // Body size cap
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  // Parse JSON
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  // Honeypot — silent 204 to confuse bots
  if (
    typeof raw === "object" &&
    raw !== null &&
    (raw as { honeypot?: unknown }).honeypot !== ""
  ) {
    return new Response(null, { status: 204 });
  }

  // Schema validation (shared with the client)
  const parsed = LeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "VALIDATION_FAILED", fields },
      { status: 400 }
    );
  }
  const lead = parsed.data;

  // Per-IP rate limit
  const ipHash = hashIp(clientIp(req));
  if (await isRateLimited(ipHash, 5)) {
    return NextResponse.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 });
  }

  // Insert
  const ref = makeRef();
  let created;
  try {
    created = await prisma.lead.create({
      data: {
        ref,
        regNumber: lead.regNumber,
        services: lead.services as unknown as Prisma.InputJsonValue,
        name: lead.contact.name,
        phone: lead.contact.phone,
        email: lead.contact.email,
        description: lead.description || null,
        ipHash,
      },
    });
  } catch (e) {
    console.error("leads.insert", e);
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  // Best-effort email — never fail the request because of this
  void sendLeadEmail({
    ref: created.ref,
    regNumber: lead.regNumber,
    services: lead.services,
    contact: lead.contact,
    description: lead.description,
  }).catch((e) => console.error("leads.mail", e));

  return NextResponse.json({ ok: true, leadId: created.id, ref: created.ref });
}
