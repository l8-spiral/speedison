import { createHash } from "node:crypto";
import { prisma } from "./prisma";

// Hash the client IP so we never store the raw address in DB. Salt is rotated
// out-of-band; rotation invalidates the rate-limit history (acceptable — the
// limits are short-lived). Strips X-Forwarded-For chains down to the first
// element so chained reverse proxies don't break determinism.
export function hashIp(ipOrXff: string): string {
  const salt = process.env.IP_HASH_SALT ?? "DEV_FALLBACK_SALT";
  const first = ipOrXff.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(salt + first).digest("hex");
}

export async function isRateLimited(
  ipHash: string,
  maxPerHour = 5
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.lead.count({
    where: { ipHash, createdAt: { gt: oneHourAgo } },
  });
  return count >= maxPerHour;
}
