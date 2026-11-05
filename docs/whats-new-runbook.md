# What's new runbook

Page: `src/new.njk`. Data: `src/_data/whatsnew.json`, newest first. Each entry has
`date` (ISO), `dateText`, `title` (short, plain) and `items` (3 to 6 plain lines).
Two-line entries are fine for a one-fix hotfix.

## At every prod release (promote or hotfix)

1. Find the two points per repo: what prod ran before and what it runs now.
   `ssh quickler-prod "cd /opt/quickler-reports && git reflog --date=iso -n 20"`
   and the same in `/opt/quickler-app` give every move with its time (UTC; the
   page uses UK dates). The reflog is the ground truth; a branch label is not.
2. `scripts/whatsnew_draft.sh ENG_FROM ENG_TO DASH_FROM DASH_TO` lists commit
   subjects per repo with obvious internal ones filtered out. It only prints.
3. Keep only what a person using Quickler would notice. Leave out tests,
   refactors, sims, tooling, logging, monitors, model or vendor swaps, security
   hardening with nothing visible. When unsure it was user-facing, leave it out.
4. Write 3 to 6 plain lines. British English, no em dashes, no emojis, never
   "engineer" (say "person"). Product words: Record, Check, Fault, To do list.
   No customer or real person names. No lab or internal names. Nothing invented:
   each line must trace to a commit.
5. Add the entry to the JSON, bump `version` in `src/_data/site.json`, build
   (`npx @11ty/eleventy --quiet`), look at /new/, commit, `git pull --rebase`, push.

## Rules learnt

- A rolled-back promote is not a release. 30 Sep 2026 was rolled back at
  20:57 and its changes shipped on 5 Oct, so they sit under 5 Oct.
- Several moves in one day (a promote and a hotfix) can be one entry or two;
  two is clearer when the hotfix is a different subject.
- Prod history before 19 Aug 2026 is a stream of small pulls, not promotes, and
  is not on the page.
