# Production launch

End-to-end checklist for going live with speedison.se on Railway.

## Pre-launch

All of these must pass.

- [ ] CI green on `main` (web-tests + lighthouse jobs).
- [ ] Manual QA pass complete on at least 3 devices
      (`docs/runbooks/manual-qa.md`).
- [ ] SMTP credentials in hand for info@speedison.se
      (`docs/runbooks/smtp-mail.md`).
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
| `SMTP_HOST` | Manual: typically `mail.misshosting.se` |
| `SMTP_PORT` | Manual: `587` (STARTTLS) or `465` (SSL) |
| `SMTP_USER` | Manual: `info@speedison.se` |
| `SMTP_PASS` | Manual: the info@speedison.se mailbox password |
| `MAIL_FROM` | Manual: `"Speedison" <info@speedison.se>` |
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
   - Verify email arrives at info@speedison.se (sent via Misshosting SMTP).
   - Verify the `leads` row appears in Railway MySQL (Railway dashboard →
     MySQL → Data tab).

2. **Monitor for 24 h:**
   - Railway service logs (Deployments → Logs) — no error spikes; in
     particular look for `leads.mail` lines indicating SMTP failures.
   - `leads` table count — submissions arriving.
   - Optional: check the info@speedison.se Sent folder via Misshosting
     webmail to confirm outbound mail is flowing.

## Tag the release

```bash
git tag -a v1.0.0 -m "Speedison redesign — production launch"
git push --tags
```

## After 30 days

See `docs/runbooks/rollback-window.md`.
