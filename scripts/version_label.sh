#!/usr/bin/env bash
# The build's version label (Philip 5 Nov 2026): TOTAL.DAY.MONTH.YEAR.INDEX,
# UK date order, e.g. 3556.5.11.2026.0
#   TOTAL  releases since the start: commits on main up to this one
#   DAY.MONTH.YEAR  the UK date (Europe/London) of this commit
#   INDEX  this commit's place among that UK day's commits, from 0
# Worked out from git, so the same commit always gets the same label.
# Usage: version_label.sh [repo dir]   (prints the label, or nothing outside git)
set -eu
dir=${1:-$(cd "$(dirname "$0")/.." && pwd)}
git -C "$dir" rev-parse HEAD >/dev/null 2>&1 || exit 0
total=$(git -C "$dir" rev-list --count HEAD)
day=$(TZ=Europe/London git -C "$dir" log -1 --date=format-local:'%Y-%m-%d' --format=%cd HEAD)
label_date=$(TZ=Europe/London git -C "$dir" log -1 --date=format-local:'%-d.%-m.%Y' --format=%cd HEAD)
same=$(TZ=Europe/London git -C "$dir" log --date=format-local:'%Y-%m-%d' --format=%cd HEAD | grep -cx "$day" || true)
echo "${total}.${label_date}.$(( same - 1 ))"
