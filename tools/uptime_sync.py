#!/usr/bin/env python3
"""Copy the server's UptimeRobot summary into the site, and commit only when a
shown figure changes (2-decimal %, Working now). Run hourly by cron
(Philip 5 Nov 2026). Never makes up a figure: if the source is missing or a
number is absent, nothing is written."""
import json, subprocess, sys, pathlib

SRC = pathlib.Path('/home/claude/philip-context/ops/uptime/data/uptimerobot-summary.json')
SITE = pathlib.Path(__file__).resolve().parent.parent
DEST = SITE / 'src/_data/uptime.json'
BRANCH = sys.argv[1] if len(sys.argv) > 1 else 'status-page'
PARTS = [  # monitor name -> what the page calls it
    ('app.quickler.co/healthz', 'The app and report links',
     'app.quickler.co: the dashboard, every Record and every shared report link'),
    ('reports.quickler.co/health', 'WhatsApp and Telegram recording',
     'The service that answers on site and writes the Record'),
]
# Each span shows only once the monitors are that old (Philip 5 Nov 2026: "when we get to 3 months add
# that, 6 months, 1 year, 2 years, 4 years"). (key, label, days needed)
SPANS = [('24h', '24 hours', 1), ('7d', '7 days', 7), ('30d', '30 days', 30), ('90d', '3 months', 90),
         ('6m', '6 months', 182), ('1y', '1 year', 365), ('2y', '2 years', 730), ('4y', '4 years', 1461)]
HOLD = {'6m'}  # waiting on Philip (Q37): the 3 to 18 Aug 2026 app monitor outage sits inside 6 months

def build():
    src = json.loads(SRC.read_text())
    mons = {m['name']: m for m in src['monitors']}
    parts = []
    for key, name, what in PARTS:
        m = mons[key]
        age = (src['updated'] - m['since']) / 86400
        nums = [{'label': l, 'pct': f"{float(m[k]):.2f}"} for k, l, need in SPANS
                if m.get(k) is not None and age >= need and k not in HOLD]
        parts.append({'name': name, 'what': what, 'up_now': bool(m['up_now']), 'nums': nums})
    return {'source': src.get('source', 'UptimeRobot'), 'updated': src['updated'], 'parts': parts}

def shown(d):
    return [(p['up_now'], [n['pct'] for n in p['nums']]) for p in d['parts']]

def main():
    new = build()
    old = json.loads(DEST.read_text()) if DEST.exists() else None
    if old and shown(old) == shown(new):
        return
    def git(*a):
        return subprocess.run(['git', '-C', str(SITE), *a], check=True, capture_output=True, text=True)
    git('fetch', '-q', 'origin', BRANCH)
    git('merge', '--ff-only', '-q', f'origin/{BRANCH}')
    DEST.write_text(json.dumps(new, indent=1) + '\n')
    git('add', str(DEST))
    git('commit', '-q', '-m', 'Status page: UptimeRobot figures changed (hourly copy)')
    git('push', '-q', 'origin', f'HEAD:{BRANCH}')

if __name__ == '__main__':
    main()
