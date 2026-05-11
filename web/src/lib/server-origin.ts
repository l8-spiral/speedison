// Origin guard for cross-origin POSTs to /api/* route handlers.
//
// Strategy: allow same-origin (Origin header host matches the request's
// Host header) plus an explicit allowlist for the canonical production
// domains. Same-origin handles every deploy URL automatically — Railway
// temp domain (*.up.railway.app), preview deploys, custom domain — without
// requiring an env var update for each one. The explicit list still
// catches legitimate cross-origin requests, e.g. www → apex redirects
// where the browser may include the original Origin.

const ALLOWED_ORIGINS = new Set([
  "https://speedison.se",
  "https://www.speedison.se",
]);

export function isAllowedOrigin(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.get("origin");
  if (!origin) return false;

  const host = req.headers.get("host");
  if (host) {
    try {
      if (new URL(origin).host === host) return true;
    } catch {
      // Malformed Origin — fall through to allowlist check
    }
  }

  return ALLOWED_ORIGINS.has(origin);
}
