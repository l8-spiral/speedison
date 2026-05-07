# Speedison

Cinematic redesign of speedison.se. Next.js 15 frontend on Vercel + PHP/MySQL API on Misshosting.

## Structure

- `web/` — Next.js app (Vercel target)
- `api/` — PHP endpoints (Misshosting via FTP)
- `scripts/` — build & deploy helpers
- `docs/superpowers/` — specs and plans

## Development

See `docs/superpowers/plans/2026-05-07-speedison-redesign.md`.

## Required GitHub Secrets (when pushing later)

For `deploy-api.yml`:
- `FTP_HOST` — Misshosting FTP hostname
- `FTP_USER` — Misshosting FTP username
- `FTP_PASSWORD` — Misshosting FTP password

Set at: Repo → Settings → Secrets and variables → Actions.
