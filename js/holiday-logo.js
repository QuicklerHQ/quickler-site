/* Holiday logo: on set days the top-left nav logo is swapped for a
 * dressed-up one (Philip 2026-10-09). ONLY the top-left logo changes.
 * Hovering it says what the day is; clicking still goes home.
 *
 * Same table and rules as the dashboard (quickler-dashboard
 * src/lib/holiday_logo.py). Change both together.
 * - Dates are fixed, or fixed by a rule (Easter and the days hung off it).
 * - When two days fall together, the MORE IMPORTANT one shows; on a tie,
 *   the earlier row.
 * - The date is the UK date (Europe/London).
 * - Preview any day with ?logo-date=YYYY-MM-DD.
 */
(function () {
  function D(y, m, d) { return new Date(Date.UTC(y, m - 1, d)); }
  function add(dt, n) { return new Date(dt.getTime() + n * 86400000); }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    var l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var n = h + l - 7 * m + 114;
    return D(y, Math.floor(n / 31), (n % 31) + 1);
  }
  // n-th weekday (Mon=0 .. Sun=6) of a month, n from 1
  function nth(y, mo, wd, n) {
    var first = D(y, mo, 1), fw = (first.getUTCDay() + 6) % 7;
    return add(first, ((wd - fw + 7) % 7) + 7 * (n - 1));
  }
  function leap(y) { return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0); }
  function on(d, imp) { return [[d, d, imp]]; }
  function span(a, b, imp) { return [[a, b, imp]]; }
  var DAYS = [
    ["new-year", "Hogmanay and New Year", function (y) { return span(D(y, 12, 31), D(y + 1, 1, 2), 8); }],
    ["burns-night", "Burns Night", function (y) { return on(D(y, 1, 25), 7); }],
    ["pancake-day", "Pancake Day", function (y) { return on(add(easter(y), -47), 6); }],
    ["valentines-day", "Valentine's Day", function (y) { return on(D(y, 2, 14), 6.5); }],
    ["patrick-hamilton", "Patrick Hamilton", function (y) { return on(leap(y) ? D(y, 2, 29) : D(y, 2, 28), 4); }],
    ["st-davids-day", "St David's Day", function (y) { return on(D(y, 3, 1), 7); }],
    ["first-day-of-spring", "First week of spring", function (y) { return span(D(y, 3, 1), D(y, 3, 7), 2); }],
    ["mothers-day", "Mothering Sunday", function (y) { return on(add(easter(y), -21), 7.5); }],
    ["st-patricks-day", "St Patrick's Day", function (y) { return on(D(y, 3, 17), 6); }],
    ["david-livingstone", "David Livingstone", function (y) { return on(D(y, 3, 19), 4); }],
    ["world-water-day", "World Water Day", function (y) { return on(D(y, 3, 22), 4); }],
    ["covid-lockdown", "First Covid lockdown", function (y) { return on(D(y, 3, 23), 5); }],
    ["slave-trade-act", "Slave Trade Act", function (y) { return on(D(y, 3, 25), 6); }],
    ["easter", "Easter", function (y) { return span(add(easter(y), -2), add(easter(y), 1), 9); }],
    ["global-asbestos-awareness-week", "Global Asbestos Awareness Week", function (y) { return span(D(y, 4, 1), D(y, 4, 7), 3); }],
    ["tartan-day", "Tartan Day", function (y) { return on(D(y, 4, 6), 5); }],
    ["dietrich-bonhoeffer", "Dietrich Bonhoeffer", function (y) { return on(D(y, 4, 9), 5); }],
    ["st-georges-day", "St George's Day", function (y) { return on(D(y, 4, 23), 7); }],
    ["world-health-and-safety-day", "World Day for Safety and Health at Work", function (y) { return on(D(y, 4, 28), 5); }],
    ["union-1707", "Union of the Parliaments", function (y) { return on(D(y, 5, 1), 4); }],
    ["king-james-bible", "King James Bible", function (y) { return on(D(y, 5, 2), 5); }],
    ["ve-day", "VE Day", function (y) { return on(D(y, 5, 8), 7); }],
    ["robert-murray-mcheyne", "Robert Murray M'Cheyne", function (y) { return on(D(y, 5, 21), 4); }],
    ["first-day-of-summer", "First week of summer", function (y) { return span(D(y, 6, 1), D(y, 6, 7), 2); }],
    ["magna-carta", "Magna Carta", function (y) { return on(D(y, 6, 15), 5); }],
    ["battle-of-waterloo", "Battle of Waterloo", function (y) { return on(D(y, 6, 18), 5); }],
    ["fathers-day", "Father's Day", function (y) { return on(nth(y, 6, 6, 3), 6); }],
    ["bannockburn", "Battle of Bannockburn", function (y) { return on(D(y, 6, 24), 5); }],
    ["battle-of-the-somme", "First day of the Somme", function (y) { return on(D(y, 7, 1), 6); }],
    ["action-mesothelioma-day", "Action Mesothelioma Day", function (y) { return on(nth(y, 7, 4, 1), 5); }],
    ["independence-day", "Independence Day (US)", function (y) { return on(D(y, 7, 4), 3); }],
    ["eric-liddell", "Eric Liddell", function (y) { return on(D(y, 7, 11), 5); }],
    ["vj-day", "VJ Day", function (y) { return on(D(y, 8, 15), 6); }],
    ["world-ev-day", "World EV Day", function (y) { return on(D(y, 9, 9), 4); }],
    ["battle-of-britain-day", "Battle of Britain Day", function (y) { return on(D(y, 9, 15), 5); }],
    ["william-tyndale", "William Tyndale", function (y) { return on(D(y, 10, 6), 5); }],
    ["battle-of-hastings", "Battle of Hastings", function (y) { return on(D(y, 10, 14), 5); }],
    ["trafalgar-day", "Trafalgar Day", function (y) { return on(D(y, 10, 21), 5); }],
    ["halloween", "Halloween and Reformation Day", function (y) { return span(D(y, 10, 24), D(y, 10, 30), 4).concat(on(D(y, 10, 31), 7)); }],
    ["remembrance", "Remembrance", function (y) { return span(D(y, 11, 1), D(y, 11, 11), 4).concat(on(nth(y, 11, 6, 2), 10), on(D(y, 11, 11), 10)); }],
    ["bonfire-night", "Bonfire Night", function (y) { return on(D(y, 11, 5), 6); }],
    ["st-andrews-day", "St Andrew's Day", function (y) { return on(D(y, 11, 30), 8); }],
    ["westminster-confession", "Westminster Confession", function (y) { return on(D(y, 12, 4), 4); }],
    ["christmas", "Christmas", function (y) { return span(D(y, 12, 1), D(y, 12, 30), 3).concat(span(D(y, 12, 24), D(y, 12, 26), 10)); }]
  ];
  function holidayFor(day) {
    var best = null, y = day.getUTCFullYear();
    DAYS.forEach(function (row, order) {
      [y - 1, y].forEach(function (yy) {
        row[2](yy).forEach(function (w) {
          if (w[0] <= day && day <= w[1]) {
            if (!best || w[2] > best[0] || (w[2] === best[0] && order < best[1])) best = [w[2], order, row];
          }
        });
      });
    });
    return best ? best[2] : null;
  }
  if (typeof module !== "undefined" && module.exports) { module.exports = { holidayFor: holidayFor, D: D }; return; }
  function ukToday() {
    var q = /[?&]logo-date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (q) return D(+q[1], +q[2], +q[3]);
    try {
      var p = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric" })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return D(+p.year, +p.month, +p.day);
    } catch (e) {
      var n = new Date();
      return D(n.getFullYear(), n.getMonth() + 1, n.getDate());
    }
  }
  var row = holidayFor(ukToday());
  if (!row) return;
  var img = document.querySelector("nav .nav-name img");
  if (!img) return;
  img.src = "/assets/logos/holiday/" + row[0] + ".svg";
  img.title = row[1];
  // The holiday picture holds the word plus its extras in a wider box
  // (viewBox -62 -32 W 228 against the plain logo's 0 0 850 200; each
  // picture's W ends 14 units past its own drawing). Scale it
  // so the letters are the plain logo's size and sit where its letters sit;
  // the extras spill outside the box and nothing else on the page moves.
  img.style.transform = "scale(1.14)";
  // On the coloured bar the logo sits in a white pill as tall as the bar,
  // filling its left end, and the bar gets a thin white edge so the two
  // read as one piece (Philip 2026-10-09). The pill reaches the bar's edges
  // by taking back the bar's own padding in CSS, so it follows the bar as it
  // shrinks on scroll and on small screens.
  var nav = img.closest("nav"), a = img.closest("a");
  if (!nav || !a) return;
  // Inset from the bar's edge, as the WhatsApp pill is, so a rim of the
  // bar's colour shows round it.
  var INSET = 4;
  var css = document.createElement("style");
  css.textContent =
    "nav.nav-holiday{border:1px solid rgba(255,255,255,.55) !important}" +
    "nav.nav-holiday.nav-scrolled{border-width:0 0 1px 0 !important}" +
    // The pill is inset a fixed 4px from the bar's inner edge, top and
    // bottom, in EVERY state. Negative margins used to cancel the bar's own
    // padding, but that padding animates over 0.25s on scroll and the margins
    // were only recomputed afterwards, so mid-shrink the pill stood taller
    // than the bar (Philip 2026-10-14: "when you scroll the logo looks
    // funny"). Insets need no maths and no listener, so they cannot lag.
    // The pill wraps the logo and nothing else (Philip 2026-10-14: "the pill
    // just snaps around the size of the logo"). Its gaps are set from the
    // logo's own height in fit(), so width and height shrink by the same
    // factor and the shape holds in every state. It used to stretch to the
    // bar's height and reach for the bar's left end, which tied its width to
    // the bar's padding: that padding grows to 64px when the bar goes edge to
    // edge, holding the pill 40px wider than its height called for, so it
    // stretched from a pill into a lozenge as it got shorter.
    "nav.nav-holiday .nav-name{border-radius:999px;align-self:center;" +
    "margin:0;transition:padding 0.25s ease;" +
    "background:rgba(255,255,255,.95);box-shadow:0 4px 14px rgba(26,82,208,.24)}";
  document.head.appendChild(css);
  nav.classList.add("nav-holiday");
  function fit() {
    var h = img.offsetHeight || 38, k = h / 228;
    var vbw = img.naturalHeight ? 228 * img.naturalWidth / img.naturalHeight : 1054;
    var ox = 504.86 * k;  // the point the scale keeps fixed: the letters' own origin
    img.style.transformOrigin = ox + "px 114.29%";
    // the drawing's right edge after scaling, past the picture's own box
    var spill = ox + 1.14 * ((vbw - 14) * k - ox) - vbw * k;
    // Every gap is a fraction of the logo's own height, so all four shrink by
    // the same factor the logo does and the pill keeps its shape. The
    // fractions are the approved 9 October look measured back: a 42px logo
    // sat in a 66.7px pill (12.35px above and below, 0.294) with a 14px gap
    // to its left (0.333). The right also carries the drawing's own spill,
    // which scales with the logo as well.
    // The vertical gap is the same fraction of the logo's height as the side
    // ones, so the pill shrinks by one factor in both directions. A negative
    // margin of the same size keeps that growth out of the layout: without it
    // the pill's padding stacks on the bar's own and the bar swells from 77px
    // to 92px, shifting every nav item on every page. The pill is not
    // stretched to the bar's height, so it cannot overhang mid-transition.
    var v = Math.round(0.294 * h);
    a.style.paddingTop = a.style.paddingBottom = v + "px";
    a.style.marginTop = a.style.marginBottom = -v + "px";
    a.style.paddingLeft = Math.round(h / 3) + "px";
    a.style.paddingRight = Math.max(6, Math.round(spill + 0.3 * h)) + "px";
  }
  fit();
  window.addEventListener("resize", fit);
  window.addEventListener("scroll", function () { requestAnimationFrame(fit); }, { passive: true });
  img.addEventListener("load", fit);
  nav.addEventListener("transitionend", fit);
})();
