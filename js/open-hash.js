/* A link to a question opens it in front of you (Philip 5 Nov 2026 20:42):
   page.html#some-question finds that question, opens its card (and any card
   around it), scrolls it into the middle of the screen and marks it briefly. */
(function () {
  function show() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    for (var p = el; p; p = p.parentElement) { if (p.tagName === "DETAILS") p.open = true; }
    setTimeout(function () {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.add("hash-lit");
      setTimeout(function () { el.classList.remove("hash-lit"); }, 2400);
    }, 60);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
  addEventListener("hashchange", show);
})();
