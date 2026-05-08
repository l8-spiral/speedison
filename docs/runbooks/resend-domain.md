# Resend domain verification

How to verify `speedison.se` in Resend so transactional mail (lead
notifications) lands in inboxes, not spam folders.

## What we're setting up

- **SPF** — tells receiving servers that Resend is authorised to send on
  behalf of speedison.se.
- **DKIM** — cryptographic signature on outgoing messages.
- **DMARC** — tells receivers what to do if a message fails SPF/DKIM
  (initially: "report only").

These three together push deliverability from ~80% to ~99% for typical
inboxes (Gmail, Outlook, Apple Mail, etc).

## Steps

### 1. Add the domain in Resend

1. Log in at https://resend.com.
2. **Domains → Add Domain** → enter `speedison.se`.
3. Region: **EU** (closest to users; matters for some compliance setups).
4. Resend shows three DNS records to add: a TXT for SPF, a TXT for DKIM,
   and an optional MX or TXT for return-path. Copy them. Keep that browser
   tab open.

### 2. Add the records at the registrar

Where `speedison.se` DNS lives today (Misshosting cPanel or .se-registrar).

- **TXT** record at `@` for SPF — value as Resend dictated, typically:

  ```
  v=spf1 include:_spf.resend.com ~all
  ```

  > **MERGE if there's already an SPF record.** A domain may have only one
  > SPF TXT record. If Misshosting added one earlier (e.g.
  > `v=spf1 include:misshosting.se ~all`), combine the includes:
  >
  > ```
  > v=spf1 include:misshosting.se include:_spf.resend.com ~all
  > ```

- **TXT** record at `resend._domainkey` for DKIM — long base64 value
  Resend provides, copy-pasted exactly.

- **MX or TXT** at `send` (or wherever Resend says) for return-path — only
  if Resend asks. Improves deliverability but isn't strictly required.

### 3. Add a DMARC record (one-time, even soft policy helps)

```
Type:  TXT
Host:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@speedison.se
```

`p=none` = report-only. After 30 days of clean reports, raise to
`p=quarantine`, and later `p=reject`. Don't set anything stricter than
`p=none` until you've seen the reports.

### 4. Verify in Resend

In Resend dashboard, click "Verify". DNS propagation can take 5 min – 24
h. Status changes to ✅ Verified.

### 5. Send a real test

In Resend dashboard, "Send a test" button → check Gmail/Outlook inbox AND
spam folder. If spam: revisit DKIM record (often a copy-paste truncation
issue) and DMARC.

Or, after the Railway service is up, submit a real test lead through the
configurator → e-mail should land at info@speedison.se inbox.

## When it's set up

The repo's environment variables in Railway use:

- `RESEND_API_KEY` — your Resend API key with send permission
- `MAIL_FROM` — `Speedison <noreply@speedison.se>`
- `MAIL_TO` — `info@speedison.se`

Verify those are set in Railway → Variables before going to production.
