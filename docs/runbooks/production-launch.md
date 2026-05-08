# Production launch

End-to-end checklist for going live with speedison.se on Railway.

## Pre-launch

All of these must pass.

- [ ] CI green on `main` (web-tests + lighthouse jobs).
- [ ] Manual QA pass complete on at least 3 devices
      (`docs/runbooks/manual-qa.md`).
- [ ] Resend domain verified
      (`docs/runbooks/resend-domain.md` → Status ✅ Verified).
- [ ] WordPress backup taken from Misshosting (full files + DB).

## Railway project setup (one-time)

### 1. Connect the repo

1. Log in at https://railway.app.
2. **New Project** → **Deploy from GitHub repo** → pick
   `l8-spiral/speedison`.
3. Railway detects Nixpacks; the build/start commands come from
   `railway.json` at the repo root.

### 2. Add MySQL plugin

1. Inside the Speedison project, click **Add Service** → **Database** →
   **MySQL**.
2. Wait for it to provision. Railway auto-creates `MYSQL_URL` for the
   plugin.

### 3. Set environment variables

In the **Speedison Next.js service** → **Variables**:

| Variable | How |
|---|---|
| `DATABASE_URL` | **Reference Variable** → MySQL plugin → `MYSQL_URL` |
| `RESEND_API_KEY` | Manual paste (from Resend dashboard) |
| `MAIL_FROM` | Manual: `Speedison <noreply@speedison.se>` |
| `MAIL_TO` | Manual: `info@speedison.se` |
| `IP_HASH_SALT` | Manual: run `openssl rand -hex 32` and paste |
| `NEXT_PUBLIC_APP_URL` | Manual: `https://speedison.se` |

### 4. First deploy

Push to `main` (or trigger a redeploy in Railway UI). Watch the build
logs:

- `npm ci` → installs deps
- `npx prisma generate` → generates client types
- `npx prisma migrate deploy` → applies migrations to MySQL
- `npm run build` → Next.js build

Then `npm run start` boots the standalone server. Healthcheck `/`
returns 200 → deployment Active.

### 5. Verify

Open the Railway-generated URL (`speedison-production.up.railway.app` or
similar). Walk through manual QA on it.

## Cutover

Run `docs/runbooks/dns-migration.md`. After DNS resolves to Railway:

1. **Smoke test** at https://speedison.se in incognito.
   - Hero loads.
   - Submit a real test lead through the configurator.
   - Verify email arrives at info@speedison.se via Resend.
   - Verify the `leads` row appears in Railway MySQL (Railway dashboard →
     MySQL → Data tab).

2. **Monitor for 24 h:**
   - Railway service logs (Deployments → Logs) — no error spikes.
   - Resend dashboard — deliverability rate stays > 95%.
   - `leads` table count — submissions arriving.

## Tag the release

```bash
git tag -a v1.0.0 -m "Speedison redesign — production launch"
git push --tags
```

## After 30 days

See `docs/runbooks/rollback-window.md`.
