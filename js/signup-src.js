// Tag every sign-up link with where it was clicked (Philip 20 Nov 2026 08:29: "every single different sign-up link is
// different so that we can track where people are signing in"). Adds src (page path), cta (button text + position on
// the page) and any utm_* on the current URL. Nothing stored on the device. The app saves these with the new account.
(function () {
  try {
    var here = new URLSearchParams(location.search), n = 0;
    var links = document.querySelectorAll('a[href^="https://app.quickler.co/signup"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i], u = new URL(a.href);
      n += 1;
      var text = (a.getAttribute('data-cta') || a.textContent || 'link').trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
      if (!u.searchParams.has('src')) u.searchParams.set('src', location.pathname.slice(0, 120));
      if (!u.searchParams.has('cta')) u.searchParams.set('cta', text + '-' + n);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        var v = here.get(k); if (v && !u.searchParams.has(k)) u.searchParams.set(k, v.slice(0, 80));
      });
      a.href = u.toString();
    }
  } catch (e) {}
})();
