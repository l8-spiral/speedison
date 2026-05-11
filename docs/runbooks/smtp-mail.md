# Transactional mail via Misshosting SMTP

The `lib/mailer.ts` module sends lead-notification and contact mail by
SMTP through `info@speedison.se` — the mailbox already hosted by
Misshosting. No third-party transactional provider is used.

## What you need

Get these values from Misshosting (cPanel → Email Accounts → set up mail
client / "Connect devices") for the `info@speedison.se` mailbox:

| Value | Typical | Where to find it |
|---|---|---|
| Outgoing host | `mail.misshosting.se` (or your specific server) | Misshosting mail-client setup page |
| Outgoing port | `587` STARTTLS (recommended) or `465` SSL | Same page |
| Username | `info@speedison.se` | The mailbox address itself |
| Password | (the mailbox password) | The one you set when creating the mailbox |

## Set the env vars

In Railway → service → Variables (or `web/.env` for local dev):

```
SMTP_HOST=mail.misshosting.se
SMTP_PORT=587
SMTP_USER=info@speedison.se
SMTP_PASS=<the mailbox password>
MAIL_FROM="Speedison" <info@speedison.se>
MAIL_TO=info@speedison.se
```

`MAIL_FROM` and `MAIL_TO` are the same mailbox here — leads arrive in
the same inbox they're "from." The mailer sets `Reply-To` to the
customer's address, so hitting Reply replies to the customer, not to
yourself.

## SPF / DKIM

Misshosting publishes SPF and signs DKIM for their own mail-sending
infrastructure automatically. Because we're sending from
`info@speedison.se` *through* Misshosting's SMTP, those records cover us.

Verify they're in place:

```bash
dig speedison.se TXT +short | grep spf1
# expect something like: v=spf1 a mx include:misshosting.se ~all

dig default._domainkey.speedison.se TXT +short
# expect a long base64 DKIM key (Misshosting's default selector)
```

If either is missing, contact Misshosting support — they'll add the
records on the speedison.se zone for you.

A soft DMARC record helps further:

```
Type:  TXT
Host:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:info@speedison.se
```

`p=none` = report-only. Raise to `quarantine` or `reject` after 30 days
of clean reports.

## Smoke test

Local (after env vars are in `web/.env`):

```bash
cd web
node -e "
import('./src/lib/mailer.js').then(async ({ sendLeadEmail }) => {
  const r = await sendLeadEmail({
    ref: 'SP-TEST-LOCAL',
    regNumber: 'TEST 123',
    services: ['stage1'],
    contact: { name: 'Smoke', phone: '0701234567', email: 'devops@goppis.se' },
    description: 'Local SMTP smoke test',
  });
  console.log(r);
});
"
```

Should print `{ id: '<some-message-id>' }`. Check the inbox.

If you get an auth error: re-verify SMTP_USER (full address, not just
"info") and SMTP_PASS. Some shared hosts require an "app password"
rather than the login password.

## Production smoke test (after Railway deploy)

Submit a real test lead through the configurator at the live URL. Watch
Railway logs for any `leads.mail` console.error output. The mail should
arrive at info@speedison.se within ~30s.
