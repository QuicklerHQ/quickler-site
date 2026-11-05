/* The home page's real app windows and the demo Record (Philip 5 Nov 2026).
   Plain JS, no framework. Does only what the app does in each view:
   - voice note: play shows "What Quickler heard:" (the dot runs the note's length)
   - long bot message: Read more
   - photo: opens big with its caption; previous, next, close; arrows and Esc
   - "It keeps your place": the two steps of the walk
   - To do list: Copy
   Markup: src/_includes/partials/app-windows.njk. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dataEl = document.getElementById("aw-photo-data");
  var photos = [];
  try { photos = JSON.parse(dataEl ? dataEl.textContent : "[]"); } catch (e) { photos = []; }

  /* ---- voice notes ---- */
  function secs(t) { var p = String(t || "0:00").split(":"); return (+p[0]) * 60 + (+p[1] || 0); }
  document.querySelectorAll("[data-aw-voice]").forEach(function (v) {
    var btn = v.querySelector(".wa-vplay");
    var dot = v.querySelector(".wa-vdot");
    var bars = v.querySelectorAll(".wa-vbar");
    var heard = v.parentNode.querySelector(".aw-heard");
    var len = v.querySelector(".wa-vlen");
    var total = secs(v.getAttribute("data-dur"));
    var timer = null;
    function paint(f) {
      if (dot) dot.style.left = (f * 100) + "%";
      var on = Math.round(f * bars.length);
      bars.forEach(function (b, i) { b.classList.toggle("is-on", i < on); });
    }
    function stop(done) {
      clearInterval(timer); timer = null;
      v.classList.remove("is-playing");
      if (done) { paint(0); if (len) len.textContent = v.getAttribute("data-dur"); }
    }
    btn.addEventListener("click", function () {
      if (heard) { heard.hidden = false; btn.setAttribute("aria-expanded", "true"); }
      v.classList.add("is-heard");
      if (timer) { stop(false); return; }
      if (reduce || !total) { paint(1); return; }
      var start = Date.now();
      v.classList.add("is-playing");
      timer = setInterval(function () {
        var t = (Date.now() - start) / 1000;
        var f = Math.min(1, t / total);
        paint(f);
        if (len) { var s = Math.floor(Math.min(t, total)); len.textContent = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
        if (f >= 1) stop(true);
      }, 100);
    });
  });

  /* The end of the walk opens at the newest message, as WhatsApp does. */
  function toEnd() { document.querySelectorAll("[data-aw='done'] .aw-scroll").forEach(function (sc) { sc.scrollTop = sc.scrollHeight; }); }
  toEnd();
  window.addEventListener("load", toEnd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(toEnd);
  document.querySelectorAll("[data-aw='done'] .aw-scroll img").forEach(function (im) { im.addEventListener("load", toEnd); });

  /* ---- Read more ---- */
  document.querySelectorAll(".aw-more").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.previousElementSibling;
      if (t) t.classList.remove("aw-long");
      b.remove();
    });
  });

  /* ---- step through ---- */
  document.querySelectorAll("[data-aw='place']").forEach(function (w) {
    var btns = w.querySelectorAll("[data-aw-step]");
    var views = w.querySelectorAll("[data-aw-view]");
    var sc = w.querySelector(".aw-scroll");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var n = b.getAttribute("data-aw-step");
        btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        views.forEach(function (v) { v.hidden = v.getAttribute("data-aw-view") !== n; });
        if (sc) sc.scrollTop = 0;
      });
    });
  });

  /* ---- Copy the To do list ---- */
  document.querySelectorAll("[data-aw-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var card = b.closest(".aw-todo");
      var text = Array.prototype.map.call(card.querySelectorAll(".aw-todo-list li"), function (li) { return li.textContent.trim(); }).join("\n");
      function done() { var o = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = o; }, 1600); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        ta.remove(); done();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  });

  /* ---- photo viewer ---- */
  if (!photos.length) return;
  var lb = document.createElement("div");
  lb.className = "aw-lb";
  lb.hidden = true;
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo");
  lb.innerHTML =
    '<div class="aw-lb-in">' +
    '<picture><source type="image/webp"><img class="aw-lb-img" alt=""></picture>' +
    '<p class="aw-lb-cap"></p>' +
    '<button type="button" class="aw-lb-btn aw-lb-prev" aria-label="Previous photo"><svg width="12" height="20" viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="aw-lb-btn aw-lb-next" aria-label="Next photo"><svg width="12" height="20" viewBox="0 0 12 20"><path d="m2 2 8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="aw-lb-btn aw-lb-close" aria-label="Close photo"><svg width="16" height="16" viewBox="0 0 16 16"><path d="m2 2 12 12M14 2 2 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
    "</div>";
  document.body.appendChild(lb);
  var img = lb.querySelector(".aw-lb-img");
  var src = lb.querySelector("source");
  var cap = lb.querySelector(".aw-lb-cap");
  var cur = 0, opener = null;
  function show(i) {
    cur = (i + photos.length) % photos.length;
    var p = photos[cur];
    src.srcset = p.base + ".webp";
    img.src = p.base + ".jpg";
    img.alt = p.caption;
    cap.textContent = p.caption;
  }
  function open(n, from) {
    opener = from; show(n - 1);
    lb.hidden = false;
    document.documentElement.classList.add("aw-lb-on");
    lb.querySelector(".aw-lb-close").focus();
  }
  function close() {
    lb.hidden = true;
    document.documentElement.classList.remove("aw-lb-on");
    if (opener) opener.focus();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-aw-photo]");
    if (b) { e.preventDefault(); open(+b.getAttribute("data-aw-photo"), b); }
  });
  lb.querySelector(".aw-lb-prev").addEventListener("click", function () { show(cur - 1); });
  lb.querySelector(".aw-lb-next").addEventListener("click", function () { show(cur + 1); });
  lb.querySelector(".aw-lb-close").addEventListener("click", close);
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "Tab") {
      var f = lb.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
})();
