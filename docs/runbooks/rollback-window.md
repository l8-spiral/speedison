# 30-day rollback window

For 30 days after the launch in `docs/runbooks/production-launch.md`,
the old WordPress install at Misshosting stays up and untouched. This
document tracks that window and the eventual cleanup.

## Rollback (during the 30-day window)

If something goes wrong on the new site that we can't fix quickly:

1. At the registrar: revert `speedison.se` A record back to the original
   Misshosting target. Same for `www`.
2. Wait 5–10 min for DNS to propagate.
3. The old WordPress site is back. (We never touched it.)
4. The Railway service stays running in parallel; we're just changing
   where the public domain points. Fix forward, then re-cut.

## Cleanup (T+30 days)

Once the new site has been live and trouble-free for 30 days:

1. **Final backup of WordPress.** Take a fresh full-site + DB backup
   from Misshosting cPanel. Store somewhere outside Misshosting.
2. **Decide WordPress fate:**
   - **Decommission** — delete the WordPress install at Misshosting,
     cancel the hosting contract if not used for anything else.
   - **Archive** — leave it dormant on Misshosting under a non-public
     subdomain (e.g. `legacy.speedison.se`) that the new DNS doesn't
     touch. Cheaper insurance than deletion.
3. **Update this runbook with the date and decision.**

## Tracking

| Field | Value |
|---|---|
| Production launch date | (to fill at launch) |
| Rollback window ends | (launch date + 30 days) |
| WordPress decommissioned/archived | (date + decision) |
