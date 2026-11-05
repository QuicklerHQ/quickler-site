# Evidence for the four unlinked pages (5 Nov 2026)

Pages: /your-data/, /pages/security.html, /press/, /moving-to-quickler/. All noindex and unlinked except the security page, which keeps its footer link. Prod checked: app server in Hetzner hel1 (Helsinki, Finland), from the server's own metadata, 5 Nov 2026 20:07. The DPIA still says Germany.

Later edits by the job chat: side labels removed so headings do not squeeze on phones; /your-data/ backups now 7 days point in time plus a monthly copy kept 12 months (from prod litestream.yml and monthly_to_b2.py, see security part), 'encrypted' copy and 'every Record approved' removed (unproven; auto-file exists), 'Download all data' label made generic.

# Evidence: /your-data/ (5 Nov 2026)

## Claims on the page
- Subscription GBP 75 per phone number a month: src/_data / press.njk facts; memory pricing rule.
- No adverts inside Quickler, no selling data: QUICKLER-DPIA.md s4 "not sold or used for unrelated purposes"; no ad code in dashboard templates (record templates suppress analytics block). "No ads" is limited to inside the product because the marketing site runs Google Ads conversion measurement (privacy.njk, js/cookie-consent.js:5-11).
- Anthropic and OpenAI read messages, transcripts, photos, documents: src/pages/privacy.njk (sub-processor list, Anthropic and OpenAI entries); engine src/lib/llm_client.py, models.py (openai: models and claude under CLAUDE_FIRST; prod env CLAUDE_FIRST=1). Models are mixed (Claude Haiku for several tasks, OpenAI gpt models for others), so the page does not say "Haiku".
- Voice notes: ElevenLabs Scribe primary, OpenAI whisper-1 fallback: engine src/lib/transcription.py:1-6, 296, 311-342. (DPIA s5 says Groq; it is stale, Groq not in privacy page.)
- Human approves every Record: DPIA s1 step 4 and s7 R6.
- Anthropic training: https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training ("By default, we will not use your inputs or outputs from our commercial products").
- Anthropic retention 30 days: https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
- OpenAI: https://developers.openai.com/api/docs/guides/your-data (not used for training; abuse logs up to 30 days; audio/transcriptions: not used for training, retention None).
- Other companies: privacy.njk sub-processor list (Hetzner, Twilio, Meta, Cloudflare, Resend, Sentry, Backblaze, GoCardless, map/weather). Cloudflare and Sentry wording is from privacy.njk.
- Hetzner Finland, Backblaze encrypted replica, backups 30 days: privacy.njk. (DPIA says Germany; privacy page, updated 24 Oct, says servers in Finland; used the later one.)
- HTTPS in transit, no encryption at rest claim: DPIA s7 R3, s8 (gap still open in the DPIA).
- No images/tracking in welcome and Record-ready emails: dashboard src/lib/welcome_email.py:7, tests test_welcome_email_from_philip_2026_10_29.py:60, test_no_email_carries_the_quickler_logo_2026_10_30.py; engine test_record_ready_email_names_quickler_2026_10_31.py:27.
- Site analytics consent: js/cookie-consent.js:14-26, 47-60 (consent default denied, cookieless GA, anonymize_ip, Clarity on consent); privacy.njk "How data is used"/Clarity entry (not on Record pages, history pages, share links).
- August incident: philip-context/breach-log.md entry 2026-08-24 (about 53 hours, no real data, fix, template block).
- Export formats exist on prod: dashboard src/lib/data_export_scope.py:1-17 (Report.pdf, Web page.html, Spreadsheet.xlsx, .csv, Written report.docx where switched on, Photos, Documents, WhatsApp messages.txt); routes/data_export.py:77 (/dashboard/data-export); confirmed present in quickler-app-app-1 on prod (/app/routes/data_export.py, /app/lib/data_export_scope.py).
- Retention 3 years, backups 30 days, erasure on request, contacts removal keeps reports, share link 365 days: privacy.njk "How long data is kept"; prod engine env SESSION_RETENTION_DAYS=1095 (checked 5 Nov).
- DPA, ICO ZC124993: privacy.njk; /pages/dpa.html exists in _site.

## HEY claims Quickler cannot make
- "We never see your data": staff and sub-processors can; reports are shared by link.
- Only data needed, no third parties: we use ~25 sub-processors.
- No tracking at all / no analytics: site uses Google measurement and Ads conversion, Clarity after consent.
- Privacy labels comparison: not prepared.
- Encryption at rest: DPIA R3 still open.
- Own infrastructure only: Hetzner, Cloudflare, Backblaze, GitHub Pages.

## Gaps for Philip
1. ElevenLabs primary STT: training and retention terms not verified (their docs returned 403). Page says so honestly. DPIA still says Groq, needs updating.
2. Encryption at rest (DPIA R3) still open.
3. Resend open/click tracking setting not verified; page only claims two named emails. Check the Resend domain setting and extend the claim.
4. Share link life: security.njk card says 30 days, privacy.njk says 365 days. Page uses 365; one is wrong.
5. Who at Quickler can see Records (admin access) is not documented; left out.
6. DPIA Hetzner location (Germany) vs privacy (Finland).
7. "Haiku": engine now mixes OpenAI gpt models and Claude Haiku; page names no model.
8. Download all data: label taken from code docstring; confirm the dashboard button wording.

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

## /press/ (src/pages/press.njk)

Claims and evidence
- One line, short, longer descriptions: same wording as src/pages/about.njk:115 and the home page (WhatsApp voice note, text or photo; say done; check, change any word, send).
- "Built in Scotland for ... care homes, nurseries, cleaning and facilities teams": src/pages/about.njk:72, :81 (sector labels).
- "One customer's write-up got 63% to 90% shorter, 1 to 2 hours to 12 to 22 minutes": same measured figure already used on src/pages/jotform-alternative-uk.njk:60, mitti-alternative-uk.njk:60, fluix-alternative-uk.njk:60. Customer not named.
- Quickler Ltd, SC882439, incorporated 16 March 2026, Philip Ross sole director: memory reference-ref-business-and-market.md:11; src/pages/about.njk:115.
- ICO ZC124993: memory reference-ref-business-and-market.md:13 (ICO confirmation email 17 Apr 2026, public register).
- GBP 75 per phone number a month, 14-day trial, no card to start: src/pages/5s-workplace-audit-app-uk.njk:111 and the pricing page; Philip 28 Oct and 5 Nov 2026 (memory project-sales-pricing.md).
- Logos: assets/logos/quickler-logo.svg, quickler-logo-white.svg; zip assets/press/quickler-logos.zip holds those two SVGs plus logo-gradient-1x1.png, logo-navy-1x1.png, logo-onwhite-1x1.png (unzip -l).
- Screenshots: assets/ad-images/report-pass-1.91x1.png, report-issues-1.91x1.png (anonymised, test IDs, per assets/ad-images/README.md); assets/photos/app/todo.jpg and done.jpg (from Philip's 2 Nov demo walk, share link blurred: commits b6bae45, 19e2209).
- Founder text: src/pages/about.njk:43, :51; memory user-f23-philip-ross.md:17 (Strathclyde).
- Contact hello@quickler.co: Cloudflare Email Routing has an explicit hello@ rule (checked 5 Nov 2026 20:10). There is no press@ rule; a catch-all forwards other addresses, so press@ would arrive, but it is not set up on purpose, so the page uses hello@.

HEY press claims we cannot make
- Customer counts, revenue, funding, team size, years trading: none published or provable yet.
- Press coverage and quotes from the press: none.
- Named customer quotes: not allowed (no customer names).

Missing facts (left out)
- Registered office address (not checked for publication).
- A founder headshot made for press (founder-barn.jpg used).
- A product video for press.

# Evidence: /moving-to-quickler/ (5 Nov 2026)

Prod today: dashboard 717e1156 (promote 3 Nov 12:30), engine 01ca28d8 (philip-context/claude-memory/project-promote-2026-11-03.md). Paths below are in /home/claude/quickler-dashboard at 717e1156 (`git show 717e1156:PATH`); line numbers are at that commit.

## Claims, with where they are true
- Describe a Check in words / paste a form: src/templates/onboarding/inputs.html:176 (placeholder "Tell us about the check. Paste your form, notes or an old report, or add files.").
- Photos and scans, PDF, Word, Excel etc, up to 10 files, over 100 MB email us: src/templates/_chat_box.html:34-36 (reader_takes); inputs.html:78. Images read by vision: src/lib/source_extractors/image.py:20-23, __init__.py:113.
- Questions shown and editable before use: src/routes/workflow_inputs.py:199 (questions page).
- Duplicate a Check, copy opens ready to edit: src/routes/workflow_inputs.py:385-404; inputs.html:42-47.
- Own report (upload a finished report, each Record fills it): src/routes/own_report.py:1-12, 94; src/templates/workflow/own_report_source.html:40-44 ("A Word file (.docx) keeps your layout best", photo/scan words only); src/lib/own_report/any_doc.py:61-62. Without it, our design, PDF or Word: own_report_source.html:40.
- More finished reports teach wording: own_report.py:134; own_report_source.html:120.
- Record PDF and Word: workflow_record_exports.py:455; record_word.py:154. CSV/Excel of a Check: workflow_record_exports.py:110, 704.
- Download all data zip (Settings): src/routes/data_export.py:1-14, 77; src/lib/data_export.py:238-246.
- Record: To do list, Faults, edit any word: memory feedback-rules-record-and-outputs / press page /press/.
- WhatsApp, no app: site pages (src/pages/press.njk).

## Left off the page (not on prod)
- 14-day trial: dashboard main 0862e8e3 (5 Nov, lib/trial_plan.py) is NOT on prod or the lab build (lab 62acfc24, 4 Nov). Prod signup is the freemium plan: src/routes/auth.py:482. Note: src/index.njk and other pages already say "14 days free"; that is ahead of prod.
- Copy CSV button (8f37ee82), later own-report fidelity fixes (many commits after 717e1156): lab only. Philip 28 Oct: prod needs lab own_report code for good fidelity (project-outputs-template-creator-state.md).

## SafetyCulture/Mitti
No claims made about their features. Memory notes only (project-sales-competitors.md): renamed Mitti Aug 2026. The page says "use what your current app lets you export", with no statement about what any app exports.

## HEY claims Quickler cannot make (page: https://www.hey.com/moving-from-gmail/)
- "Import your contacts" (vCard): no people, site or client import. The paste-list route /dashboard/engineers/bulk exists (dashboard_people.py:521) but its screen is parked (src/_parked/paste-list-add-people/README.md).
- "Forward everything and keep working": there is no forwarding or dual-running link between systems.
- "Contacts do not need to update their address": the people on the job must be added by name and phone.
- "Import all old email": no import of old Records.
- HEY's "Try HEY free" claim: our trial is not on prod.

## Gaps: where switching is not easy yet (for Philip)
1. No import of people (name/phone list). Each is added one by one (bulk screen parked).
2. No import of sites/clients; they only appear from walks.
3. No import of old Records or paper history, from any source.
4. Own report layout fidelity on prod is behind lab; real forms may need a tidy.
5. 14-day trial not on prod; site already promises it (index.njk:43, 258, 268).
6. Another app's own template file is not read directly; the page tells people to export PDF or Word (not tested by me for every app).
