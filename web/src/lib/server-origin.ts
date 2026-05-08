// Allowlist for cross-origin POSTs to /api/* route handlers.
// In production we serve from a single origin (Railway custom domain) so
// CSRF risk is low — the Origin header check rejects bot traffic that
// forges API calls from elsewhere.

const ALLOWED_ORIGINS = new Set([
  "https://speedison.se",
  "https://www.speedison.se",
]);

export function isAllowedOrigin(origin: string | null): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (!origin) return false;
  return ALLOWED_ORIGINS.has(origin);
}
