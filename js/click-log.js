// Cold email click log (Philip Q316/Q321, 19 Nov 2026). Sends utm_term, utm_content and the page path once,
// only for links from Quickler emails (utm_source=email). No cookies, nothing stored on the device, no IP kept.
// Explained in the privacy policy. Log: t.quickler.co (Cloudflare), deleted after 90 days.
(function () {
  try {
    var q = new URLSearchParams(location.search), t = q.get('utm_term');
    if (!t || q.get('utm_source') !== 'email' || !navigator.sendBeacon) return;
    navigator.sendBeacon('https://t.quickler.co/c', new Blob([JSON.stringify({
      t: t, c: q.get('utm_content') || '', p: location.pathname
    })], { type: 'text/plain' }));
  } catch (e) {}
})();
