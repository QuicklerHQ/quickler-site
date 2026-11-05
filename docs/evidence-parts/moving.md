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
