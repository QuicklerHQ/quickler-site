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

/* Scrolling inside a window (Philip 5 Nov 2026 14:17): the page scrolls past
   the windows as normal. On a computer, hold Ctrl and scroll to move inside a
   window; on a phone, double tap a window to scroll inside it (tap outside to
   let go). A short hint says so when someone tries. */
(function () {
  var boxes = document.querySelectorAll(".aw-scroll");
  if (!boxes.length) return;
  var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
  function hint(box, text) {
    var h = box.parentNode.querySelector(".aw-hint");
    if (!h) { h = document.createElement("div"); h.className = "aw-hint"; h.setAttribute("aria-hidden", "true"); box.parentNode.appendChild(h); }
    h.textContent = text; h.classList.add("is-on");
    clearTimeout(h._t); h._t = setTimeout(function () { h.classList.remove("is-on"); }, 1400);
  }
  boxes.forEach(function (box) {
    box.classList.add("aw-locked");
    box.addEventListener("wheel", function (e) {
      if (box.classList.contains("aw-active")) return;
      if (e.ctrlKey) { e.preventDefault(); box.scrollTop += e.deltaY; box.scrollLeft += e.deltaX; }
      else if (Math.abs(e.deltaY) > 2 && !box._hinted) { box._hinted = true; hint(box, "Hold Ctrl and scroll to move inside"); }
    }, { passive: false });
    var last = 0;
    box.addEventListener("touchend", function () {
      var now = Date.now();
      if (now - last < 320) { box.classList.add("aw-active"); box.classList.remove("aw-locked"); hint(box, "Scrolling inside. Tap outside to stop"); }
      last = now;
    });
    box.addEventListener("touchmove", function () { if (!box.classList.contains("aw-active")) hint(box, "Double tap to scroll inside"); }, { passive: true });
  });
  document.addEventListener("touchstart", function (e) {
    boxes.forEach(function (box) { if (!box.contains(e.target) && box.classList.contains("aw-active")) { box.classList.remove("aw-active"); box.classList.add("aw-locked"); } });
  }, { passive: true });
})();

/* The real report windows open at the part being talked about (Philip 5 Nov 2026 15:32). */
(function () {
  document.querySelectorAll(".aw-report").forEach(function (box) {
    var img = box.querySelector("img");
    function go() { box.scrollTop = (+box.getAttribute("data-aw-y")) * (img.clientWidth / 780) - 12; }
    if (img.complete) go(); else img.addEventListener("load", go);
    img.loading = "eager";
    window.addEventListener("resize", go);
  });
})();

/* A big, always-visible scroll bar on the right of each window (Philip 5 Nov
   2026 15:47), so it is obvious there is more inside. Drag it or click the
   track to move; the page itself still scrolls past normally. */
(function () {
  document.querySelectorAll(".aw-scroll").forEach(function (box) {
    var host = box.parentNode;
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    var track = document.createElement("div"); track.className = "aw-sb"; track.setAttribute("aria-hidden", "true");
    var thumb = document.createElement("div"); thumb.className = "aw-sb-thumb"; track.appendChild(thumb); host.appendChild(track);
    function place() {
      var r = box.getBoundingClientRect(), hr = host.getBoundingClientRect();
      track.style.top = (r.top - hr.top + 8) + "px"; track.style.height = (r.height - 16) + "px";
      var max = box.scrollHeight - box.clientHeight;
      track.style.display = max > 4 ? "" : "none";
      var th = Math.max(48, track.clientHeight * box.clientHeight / box.scrollHeight);
      thumb.style.height = th + "px";
      thumb.style.transform = "translateY(" + (max ? (track.clientHeight - th) * box.scrollTop / max : 0) + "px)";
    }
    box.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    var imgs = box.querySelectorAll("img"); imgs.forEach(function (i) { i.addEventListener("load", place); });
    setTimeout(place, 50); setTimeout(place, 800); setTimeout(place, 2500);
    var drag = null;
    function at(y) { var max = box.scrollHeight - box.clientHeight, th = thumb.offsetHeight; box.scrollTop = Math.max(0, Math.min(max, (y - th / 2) / (track.clientHeight - th) * max)); }
    thumb.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); drag = { y: e.clientY, st: box.scrollTop }; thumb.setPointerCapture(e.pointerId); });
    thumb.addEventListener("pointermove", function (e) { if (!drag) return; var max = box.scrollHeight - box.clientHeight, room = track.clientHeight - thumb.offsetHeight; box.scrollTop = drag.st + (e.clientY - drag.y) * max / room; });
    thumb.addEventListener("pointerup", function () { drag = null; });
    track.addEventListener("pointerdown", function (e) { if (e.target === track) at(e.clientY - track.getBoundingClientRect().top); });
  });
})();

/* The real report windows: the app's own controls work (Philip 5 Nov 2026 15:47):
   Copy buttons copy, To do items jump to their question, photos open, the
   location opens a map, the share and download buttons go to the real report. */
(function () {
  document.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest("[data-aw-copytext]");
    if (c) {
      e.preventDefault();
      var t = c.getAttribute("data-aw-copytext");
      if (navigator.clipboard) navigator.clipboard.writeText(t);
      c.classList.add("aw-hs-done"); setTimeout(function () { c.classList.remove("aw-hs-done"); }, 1200);
      return;
    }
    var g = e.target.closest && e.target.closest("[data-aw-goto]");
    if (g) {
      e.preventDefault();
      var box = g.closest(".aw-report"), img = box.querySelector("img");
      box.scrollTo({ top: (+g.getAttribute("data-aw-goto")) * (img.clientWidth / 780) - 12, behavior: "smooth" });
    }
  });
})();

/* Download in the real report window opens the app's own menu: PDF, CSV,
   Excel file, Web page (Philip 5 Nov 2026 15:55). */
document.addEventListener("click", function (e) {
  var b = e.target.closest && e.target.closest(".aw-dl-btn");
  document.querySelectorAll(".aw-dl-menu").forEach(function (m) { if (!b || m.parentNode !== b.parentNode) { m.hidden = true; } });
  if (b) { e.preventDefault(); var m = b.nextElementSibling; m.hidden = !m.hidden; b.setAttribute("aria-expanded", String(!m.hidden)); }
});
