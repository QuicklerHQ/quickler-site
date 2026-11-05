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
