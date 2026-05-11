# DNS migration to Railway

How to cut over `speedison.se` from the existing WordPress install at
Misshosting to the new Next.js app on Railway, without breaking email or
producing a 404 on stable backlinks.

## Pre-cutover prerequisites

- [ ] Railway project deployed and healthy at its `*.up.railway.app` URL.
      Open it in incognito; hero loads, configurator advances, lead-submit
      e-mail arrives at `info@speedison.se` via Resend.
- [ ] Resend domain verification ✅ Verified (see
      `docs/runbooks/resend-domain.md`).
- [ ] Current speedison.se DNS access confirmed (Misshosting cPanel or
      registrar login).
- [ ] WordPress backup taken from Misshosting cPanel: full files + DB.
      Stash them somewhere outside Misshosting (S3, local disk, whatever).
      This is the rollback escape hatch.
- [ ] Stakeholder has approved the new staging URL after a 3–5 day review.

## T-1 day

1. Reduce TTL on the `speedison.se` A record at the registrar to **300 s**
   (5 min). The change won't be visible to most resolvers for an hour or
   two — that's why we do it the day before.
2. Verify low TTL is live from a clean network:

   ```bash
   dig speedison.se | grep -E "ANSWER|;; ->>HEADER"
   ```

   Should show `ttl=300` (or thereabouts) on the A record.

## T-0 (cutover day, ~10:00 SE)

1. **In Railway** → service → Settings → Networking → Public Networking →
   "Custom Domain" → add `speedison.se` and `www.speedison.se`. Railway
   shows the target hostname/IP for each.
2. **At the DNS registrar:**
   - `A` record `speedison.se` → Railway target (or `CNAME` if Railway gave
     you a CNAME target).
   - `CNAME` `www` → Railway target for www.
   - **Do NOT touch MX records.** Inbound mail (info@speedison.se) keeps
     flowing wherever it goes today.
3. Verify DNS propagation:

   ```bash
   dig speedison.se +short
   dig www.speedison.se +short
   ```

   Should resolve to the Railway target within 5–10 min on a clean network.
   On a network with cached resolvers it can take longer; check a different
   network if you're worried.
4. Confirm SSL provisioning in Railway UI (status changes to ✅ Active,
   automatic Let's Encrypt cert; usually < 5 min after DNS resolves).
5. **Smoke test:** open https://speedison.se in incognito.
   - Hero scrubs.
   - Click a hot-spot → configurator opens at the right step.
   - Walk through the configurator → submit a real test lead.
   - Verify e-mail arrives at info@speedison.se.
   - Check the `leads` table on Railway MySQL: row exists.

## T+1 day

1. Bump TTL back to 3600 s (1 h).
2. **Google Search Console:** re-submit the new sitemap
   (`https://speedison.se/sitemap.xml`) and confirm crawl is clean.

## Rollback (if something breaks)

The old WordPress is still running at Misshosting (we did not remove it).
DNS rollback:

1. At the registrar: revert `speedison.se` A record back to the original
   Misshosting target. Same for `www`.
2. Wait 5–10 min for DNS to propagate (TTL is still low at this point).
3. Smoke test: old site is back.

The Railway service stays running in parallel; we're just changing where
the public domain points.

## Email keeps working — must not break

- MX records are unchanged. Inbound mail to info@speedison.se keeps
  flowing to the Misshosting mailbox.
- Outbound transactional mail (lead notifications) is sent BY the same
  Misshosting mailbox via SMTP — `lib/mailer.ts` uses nodemailer with
  the SMTP_HOST / SMTP_USER / SMTP_PASS env vars set in Railway. SPF and
  DKIM are already published by Misshosting on this domain (see
  `docs/runbooks/smtp-mail.md`).
- Test inbox after cutover: submit a real lead → mail should arrive at
  info@speedison.se within ~30 s.
