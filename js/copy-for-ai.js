/* Copy for AI chat (Philip 29 Oct 2026: "On all those support documents add a
 * copy for LLM button also").
 *
 * A button with [data-copy-for-ai] copies the help page as clean Markdown:
 * the title, headings and body text, with the page's address on top. The
 * nav, footer, cookie bar, buttons, forms and videos are left out, so it can
 * be pasted straight into an AI assistant. The button says "Copied" for two
 * seconds, then its own words again.
 */
(function () {
  'use strict';

  var SKIP = 'nav, footer, form, script, style, noscript, button, iframe, svg, img, ' +
    'video, .story-actions, .story-footer, .story-eyebrow, .help-nav, .yt-lite, ' +
    '.site-version, [data-copy-skip], [hidden], [aria-hidden="true"]';

  function clean(el) {
    return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function hasBlocks(el) {
    return !!el.querySelector('p, h1, h2, h3, h4, h5, h6, ul, ol, table, pre, div');
  }

  function walk(el, out) {
    for (var i = 0; i < el.children.length; i++) {
      var c = el.children[i];
      if (c.matches(SKIP)) continue;
      var tag = c.tagName;
      var t;
      if (/^H[1-6]$/.test(tag)) {
        t = clean(c);
        if (t) out.push(new Array(+tag[1] + 1).join('#') + ' ' + t);
      } else if (tag === 'P' || tag === 'BLOCKQUOTE') {
        t = clean(c);
        if (t) out.push((tag === 'BLOCKQUOTE' ? '> ' : '') + t);
      } else if (tag === 'UL' || tag === 'OL') {
        var lines = [];
        var n = 0;
        for (var j = 0; j < c.children.length; j++) {
          var li = c.children[j];
          if (li.tagName !== 'LI' || li.matches(SKIP)) continue;
          n += 1;
          var mark = tag === 'OL' ? n + '. ' : '- ';
          var parts = [];
          if (hasBlocks(li)) {
            walk(li, parts);
            parts = parts.map(function (p) { return p.replace(/^#+ /, ''); });
          } else {
            t = clean(li);
            if (t) parts.push(t);
          }
          if (!parts.length) continue;
          lines.push(mark + parts[0]);
          for (var k = 1; k < parts.length; k++) lines.push('   ' + parts[k]);
        }
        if (lines.length) out.push(lines.join('\n'));
      } else if (tag === 'PRE') {
        out.push('```\n' + (c.textContent || '').replace(/\s+$/, '') + '\n```');
      } else if (tag === 'TABLE') {
        var rows = [];
        c.querySelectorAll('tr').forEach(function (tr) {
          var cells = [];
          tr.querySelectorAll('th, td').forEach(function (td) { cells.push(clean(td)); });
          if (cells.join('')) rows.push('| ' + cells.join(' | ') + ' |');
        });
        if (rows.length) out.push(rows.join('\n'));
      } else {
        walk(c, out);
      }
    }
  }

  function pageText() {
    var root = document.querySelector('.help-body') || document.querySelector('main') || document.body;
    var out = [];
    walk(root, out);
    var url = location.origin + location.pathname;
    return out.join('\n\n').replace(/\n{3,}/g, '\n\n') + '\n\nSource: ' + url + '\n';
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error('copy failed')); }
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-copy-for-ai]');
    if (!btn) return;
    e.preventDefault();
    var label = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', label);
    copy(pageText()).then(function () {
      btn.textContent = 'Copied';
    }, function () {
      btn.textContent = 'Could not copy';
    }).then(function () {
      setTimeout(function () { btn.textContent = label; }, 2000);
    });
  });
})();
