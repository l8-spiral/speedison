# Speedison

Cinematic redesign of speedison.se. Single-platform deploy on Railway:
Next.js 16 + Prisma + MySQL + Resend (transactional mail).

## Structure

- `web/` — Next.js app (Railway target; includes API route handlers and Prisma)
- `scripts/` — build & deploy helpers (frame extraction, legacy asset fetch)
- `docs/superpowers/` — specs and plans
- `railway.json` — Railway build/deploy config (root)
- `.github/workflows/ci.yml` — CI (lint, test, build); deploy is handled by Railway, not Actions

## Development

```bash
cd web
npm install
cp .env.example .env   # fill in DATABASE_URL etc.
npm run dev            # http://localhost:3000
npm test               # vitest
npm run build          # production build
```

See `docs/superpowers/plans/2026-05-07-speedison-redesign.md` for the full
implementation plan.

## Required Railway environment variables

Set in Railway project → Variables when going to production:

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Auto from MySQL plugin | Reference the plugin's `MYSQL_URL` |
| `RESEND_API_KEY` | Resend dashboard | API key with send permission |
| `MAIL_FROM` | Manual | e.g. `Speedison <noreply@speedison.se>` |
| `MAIL_TO` | Manual | `info@speedison.se` |
| `IP_HASH_SALT` | Manual (random) | Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Manual | `https://speedison.se` (production) |
