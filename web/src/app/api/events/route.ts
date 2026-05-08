import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashIp } from "@/lib/ratelimit";
import { isAllowedOrigin } from "@/lib/server-origin";

export const runtime = "nodejs";

const KNOWN_EVENTS = [
  "hero_completed",
  "hotspot_clicked",
  "configurator_step",
  "lead_submitted",
  "lead_failed",
] as const;

const EventSchema = z.object({
  name: z.enum(KNOWN_EVENTS),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for") ?? "unknown";
}

export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return new Response(null, { status: 403 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const parsed = EventSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));

  try {
    await prisma.event.create({
      data: {
        name: parsed.data.name,
        props: (parsed.data.props ?? null) as unknown as Prisma.InputJsonValue,
        ipHash,
      },
    });
  } catch (e) {
    console.error("event.insert", e);
    // Analytics insert failures must never break the user experience.
    return new Response(null, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
