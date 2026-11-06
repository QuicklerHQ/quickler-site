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
      else if (Math.abs(e.deltaY) > 2 && !box._hinted) { box._hinted = true; hint(box, "Double click or tap to scroll inside"); }
    }, { passive: false });
    var last = 0;
    box.addEventListener("touchend", function () {
      var now = Date.now();
      if (now - last < 320) { box.classList.add("aw-active"); box.classList.remove("aw-locked"); hint(box, "Scrolling inside. Click or tap outside to stop"); }
      last = now;
    });
    box.addEventListener("touchmove", function () { if (!box.classList.contains("aw-active")) hint(box, "Double click or tap to scroll inside"); }, { passive: true });
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

/* Hovering a scrollable window says how to scroll it (Philip 5 Nov 2026 16:07). */
(function () {
  var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
  document.querySelectorAll(".aw-scroll").forEach(function (box) {
    var host = box.parentNode;
    var tip = document.createElement("div"); tip.className = "aw-hover-hint"; tip.setAttribute("aria-hidden", "true");
    tip.textContent = "Double click or tap to scroll inside";
    host.appendChild(tip);
    box.addEventListener("mouseenter", function () { if (!box.classList.contains("aw-active")) tip.classList.add("is-on"); });
    box.addEventListener("mouseleave", function () { tip.classList.remove("is-on"); });
    box.addEventListener("wheel", function (e) { if (e.ctrlKey) tip.classList.remove("is-on"); }, { passive: true });
  });
})();

/* Live prod windows: Ctrl held lets the mouse into them; a double tap on a
   phone does the same until you tap outside (Philip 5 Nov 2026 16:47). */
(function () {
  var touch = window.matchMedia && window.matchMedia("(hover: none)").matches;
  document.querySelectorAll(".aw-live-wrap .aw-hover-hint").forEach(function (h) { h.textContent = "Double click or tap to use it"; });
  addEventListener("keydown", function (e) { if (e.key === "Control") document.documentElement.classList.add("aw-ctrl"); });
  addEventListener("keyup", function (e) { if (e.key === "Control") document.documentElement.classList.remove("aw-ctrl"); });
  addEventListener("blur", function () { document.documentElement.classList.remove("aw-ctrl"); });
  document.querySelectorAll(".aw-live-wrap").forEach(function (w) {
    var last = 0;
    w.addEventListener("touchend", function () { var n = Date.now(); if (n - last < 320) w.classList.add("is-on"); last = n; });
  });
  document.addEventListener("touchstart", function (e) { document.querySelectorAll(".aw-live-wrap.is-on").forEach(function (w) { if (!w.contains(e.target)) w.classList.remove("is-on"); }); }, { passive: true });
})();

/* The how-to-use hint stays up until someone actually uses the window
   (Philip 5 Nov 2026 17:59): holding Ctrl or double tapping hides it; letting
   go of Ctrl, tapping away, or scrolling the window out of view and back brings
   it back, with a pop. */
(function () {
  var root = document.documentElement;
  var tips = Array.prototype.slice.call(document.querySelectorAll(".aw-hover-hint"));
  function inUse(host) {
    return root.classList.contains("aw-ctrl") || host.classList.contains("is-on") || !!host.querySelector(".aw-scroll.aw-active");
  }
  function pop(tip) { tip.classList.remove("is-flash"); void tip.offsetWidth; tip.classList.add("is-flash"); }
  function update(tip) {
    var host = tip.parentNode, show = !inUse(host) && tip._seen;
    if (show && !tip.classList.contains("aw-hint-show")) { tip.classList.add("aw-hint-show"); pop(tip); }
    else if (!show && (tip.classList.contains("aw-hint-show") || tip.classList.contains("is-flash"))) tip.classList.remove("aw-hint-show", "is-flash");
  }
  function all() { tips.forEach(update); }
  tips.forEach(function (tip) {
    tip.addEventListener("animationend", function () { tip.classList.remove("is-flash"); });
    if ("MutationObserver" in window) new MutationObserver(function () { update(tip); }).observe(tip.parentNode, { attributes: true, subtree: true, attributeFilter: ["class"] });
  });
  if ("MutationObserver" in window) new MutationObserver(all).observe(root, { attributes: true, attributeFilter: ["class"] });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var tip = en.target.querySelector(":scope > .aw-hover-hint");
        if (!tip) return;
        tip._seen = en.isIntersecting;
        update(tip);
      });
    }, { threshold: 0.4 });
    tips.forEach(function (tip) { io.observe(tip.parentNode); });
  } else { tips.forEach(function (tip) { tip._seen = true; update(tip); }); }
})();

/* Double click for everyone (Philip 6 Nov 2026 08:31): Samsung Internet on a
   phone said "hold Ctrl", so the hint no longer guesses the device. A double
   click (or double tap) opens a window for use on any device; a click or tap
   outside lets go. Ctrl still works quietly for those who know it. */
(function () {
  function on(box) { box.classList.add("aw-active"); box.classList.remove("aw-locked"); }
  document.querySelectorAll(".aw-scroll").forEach(function (box) {
    box.addEventListener("dblclick", function (e) { e.preventDefault(); on(box); });
  });
  document.querySelectorAll(".aw-live-wrap").forEach(function (w) {
    w.addEventListener("dblclick", function () { w.classList.add("is-on"); });
  });
  document.addEventListener("mousedown", function (e) {
    document.querySelectorAll(".aw-scroll.aw-active").forEach(function (box) { if (!box.contains(e.target)) { box.classList.remove("aw-active"); box.classList.add("aw-locked"); } });
    document.querySelectorAll(".aw-live-wrap.is-on").forEach(function (w) { if (!w.contains(e.target)) w.classList.remove("is-on"); });
  });
})();
