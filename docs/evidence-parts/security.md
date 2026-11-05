## /pages/security.html (src/pages/security.njk)

Claims and evidence (checked 5 Nov 2026)
- Hetzner, EU: src/pages/privacy.njk:78 (Hetzner Online GmbH, Germany; servers in Finland); philip-context/QUICKLER-DPIA.md:62,71.
- AI does not train on Records, 3-year deletion: kept from the previous page; privacy.njk:106; prod engine env SESSION_RETENTION_DAYS=1095 (docker exec env, quickler-reports-app-1 or app, 5 Nov).
- Full edit history: kept from the previous page (not re-verified).
- HTTPS / TLS 1.3: curl -sv https://app.quickler.co gave "TLSv1.3 / TLS_AES_256_GCM_SHA384", Let's Encrypt cert.
- No encryption at rest: QUICKLER-DPIA.md:82 ("GAP: no encryption at rest"), :97-108 (not to be claimed). lsblk on prod shows plain ext4. Page says "not yet".
- Backups: /etc/litestream.yml on prod (sync-interval 60s, retention 168h, Backblaze S3); /opt/backups/backup.sh nightly 03:15 (cron), find -mtime +3 -delete; monthly_to_b2.py cron 05:00 on the 1st, log lines "locked until 2027-11-01" (/opt/backups/monthly.log); media_to_b2.py cron 03:40 nightly (media.log 5 Nov 03:42); memory project-lab-security-and-backups.md (Prod backups).
- Restore test: prod crontab line "0 4 1 * *" litestream restore then sqlite3 PRAGMA integrity_check; /tmp/restore-test-result.txt dated 1 Nov 2026 04:01 contains "ok". Tests the dashboard database (quickler_app.db) only.
- SSH keys only: sshd -T on prod: passwordauthentication no, permitrootlogin without-password; fail2ban active.
- Promote gate: philip-context/infra/promote-by-word.md (word in Telegram, or word plus RFC 6238 code; one-use codes; 5 wrong codes in an hour lock; automatic rollback; DB copy first; claude user cannot make a ticket, table "Who can do what"). Prod has /usr/local/bin/quickler-gate-ssh; prod-promote.path and .timer active on the server.
- Sentry: DSN set in both prod containers (checked, value not read); engine src/app.py:13; dashboard src/lib/sentry_init.py; privacy.njk:93.
- Uptime: src/status/index.njk (UptimeRobot, every 5 minutes); crons probe.py, uptimerobot.py, uptime_sync.py.
- Own reviews: memory project-lab-security-and-backups.md (audit 22 Oct, second sweep 24 Oct, third 26 Oct; ranked list philip-context/projects/security-todo.md). Weekly quiet-reboot.timer on prod, log /var/log/quiet-reboot.log (1 Nov "no reboot needed").
- Breach: philip-context/breach-log.md; breach-plan; customer-terms.njk:133-134 (S1.8, 72 hours); QUICKLER-DPIA.md:86,116.
- Vulnerability contact hello@quickler.co: Cloudflare Email Routing has an explicit hello@ rule and NO security@ rule (a catch-all forwards other addresses, so security@ would arrive, but it was not set up on purpose).

HEY security claims we cannot make and why
- Two-factor for all customers (TOTP, hardware keys): not evidenced for Quickler sign-in.
- Encryption at rest and at work: DPIA says no encryption at rest.
- Employee access limited, justified and audited weekly by a separate group: one-director company; no audit trail of staff access.
- External audits, bug bounty, CASA Tier 2: none done.
- Technical whitepaper: none.

Left out on purpose
- "A security review every week": the Saturday cron exists (crontab, 21:00 Sat) and the dead-man switch lists it (ops/jobs.py:41), but no dated output or check-in exists yet; first run due Sat 7 Nov. Add once a report appears.
- Share links expire "after 30 days" (old page, dashboard db/share_tokens.py) versus privacy.njk:106 "365 days": conflict, claim removed.
- Firm separation check and photo location stripping: not verified, removed.
- Privacy.njk says backups kept 30 days; litestream.yml says 7 days (168h). Page uses 7 days (the config). Privacy page needs fixing.

Gaps for Philip
- Enable disk encryption (LUKS or Hetzner encrypted volume) so the page can claim it.
- Decide on a real security@quickler.co rule, then switch the contact.
- prod /root/.ssh/authorized_keys holds 2 keys; memory notes an unknown root key. Confirm both are yours before the page says "the founder holds that access".
- Reconcile share-link expiry (30 vs 365 days) and backup retention (7 vs 30 days) in the privacy page.
- Confirm the promote gate is fully installed on prod (install-promote-gate.sh).
