#!/bin/bash
# Draft the commit subjects for a What's new entry. Prints; changes nothing.
# Usage: scripts/whatsnew_draft.sh ENGINE_FROM ENGINE_TO DASH_FROM DASH_TO
# (the commits prod ran before and after a promote; get them from the promote
# report or `ssh quickler-prod "cd /opt/quickler-reports && git rev-parse HEAD"`
# and the same in /opt/quickler-app). See docs/whats-new-runbook.md.
set -u
[ $# -eq 4 ] || { sed -n '2,6p' "$0"; exit 1; }
ENG=${ENGINE_REPO:-/home/claude/quickler-engine}
DASH=${DASH_REPO:-/home/claude/quickler-dashboard}
# Subjects that are almost never user-facing; dropped from the list.
SKIP='^[0-9a-f]+ (Canary|Playbook|Decision log|Lock |Seam|Health|render-check|Deploy|deploy|gitignore|Log rotation|Models:|Luna migration|Add PROMOTE|Goldens|Retention|Config drift|Test|test|Revert|Merge|Sim|sim|Refactor|refactor|Fix flaky|CI)'
show() { # repo from to label
  echo "=== $4 ($2..$3)"
  git -C "$1" log --no-merges --format='%h %s' "$2..$3" | grep -v -E "$SKIP" | cut -c1-200
}
show "$ENG" "$1" "$2" "Engine"
echo
show "$DASH" "$3" "$4" "Dashboard"
