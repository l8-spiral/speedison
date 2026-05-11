import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/mailer";
import { hashIp } from "@/lib/ratelimit";
import { isAllowedOrigin } from "@/lib/server-origin";
import { phoneSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const ContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(120),
  phone: phoneSchema.optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
  honeypot: z.literal(""),
});

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "unknown";
}

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ ok: false, error: "FORBIDDEN_ORIGIN" }, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 });
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    (raw as { honeypot?: unknown }).honeypot !== ""
  ) {
    return new Response(null, { status: 204 });
  }

  const parsed = ContactSchema.safeParse(raw);
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
  const c = parsed.data;
  const ipHash = hashIp(clientIp(req));

  try {
    await prisma.contact.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone || null,
        message: c.message,
        ipHash,
      },
    });
  } catch (e) {
    console.error("contact.insert", e);
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }

  void sendContactEmail({
    name: c.name,
    email: c.email,
    phone: c.phone || undefined,
    message: c.message,
  }).catch((e) => console.error("contact.mail", e));

  return NextResponse.json({ ok: true });
}
