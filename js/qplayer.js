// One video player for the whole site (Philip 9 and 11 Nov 2026): play/pause,
// seek and fullscreen only, on a bar that fades through the Quickler logo's
// colours (css/qplayer.css). No volume control; volume is always at full,
// never muted. Markup: src/_includes/partials/video-player.njk. Every
// [data-qp] wrapper on the page is set up on load; the home video calls
// qPlayer() itself when its still is swapped for the video.
(function () {
    var SVG = {
        play: '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M1 0l13 8-13 8z" fill="currentColor"/></svg>',
        pause: '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><path d="M1 0h4v16H1zM9 0h4v16H9z" fill="currentColor"/></svg>',
        full: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }
    window.qPlayer = function (wrap) {
        var v = wrap && wrap.querySelector("video");
        if (!v || wrap.querySelector(".qp-bar")) return;
        v.controls = false;
        var bar = el("div", "qp-bar");
        var pp = el("button", "qp-btn", SVG.pause);
        pp.type = "button"; pp.setAttribute("aria-label", "Pause");
        var seek = el("input", "qp-seek");
        seek.type = "range"; seek.min = 0; seek.max = 1000; seek.value = 0; seek.step = 1;
        seek.setAttribute("aria-label", "Seek");
        var fs = el("button", "qp-btn", SVG.full);
        fs.type = "button"; fs.setAttribute("aria-label", "Fullscreen");
        bar.appendChild(pp); bar.appendChild(seek); bar.appendChild(fs);
        wrap.appendChild(bar);

        function full() { v.muted = false; v.volume = 1; }
        function paint() {
            seek.style.setProperty("--p", (seek.value / 10) + "%");
        }
        function sync() {
            var p = v.paused;
            pp.innerHTML = p ? SVG.play : SVG.pause;
            pp.setAttribute("aria-label", p ? "Play" : "Pause");
        }
        function toggle() { if (v.paused) { full(); v.play(); } else { v.pause(); } }
        full();
        v.addEventListener("play", function () { full(); sync(); });
        v.addEventListener("pause", sync);
        v.addEventListener("ended", sync);
        v.addEventListener("volumechange", function () { if (v.muted || v.volume !== 1) full(); });
        v.addEventListener("timeupdate", function () {
            if (v.duration && !seeking) { seek.value = Math.round(v.currentTime / v.duration * 1000); paint(); }
        });
        var seeking = false;
        seek.addEventListener("input", function () {
            seeking = true;
            if (v.duration) v.currentTime = seek.value / 1000 * v.duration;
            paint();
        });
        seek.addEventListener("change", function () { seeking = false; });
        pp.addEventListener("click", toggle);
        v.addEventListener("click", toggle);
        fs.addEventListener("click", function () {
            var d = document;
            if (d.fullscreenElement || d.webkitFullscreenElement) {
                (d.exitFullscreen || d.webkitExitFullscreen).call(d);
            } else if (wrap.requestFullscreen) { wrap.requestFullscreen(); }
            else if (wrap.webkitRequestFullscreen) { wrap.webkitRequestFullscreen(); }
            else if (v.webkitEnterFullscreen) { v.webkitEnterFullscreen(); }
        });
        // Space or K plays and pauses when the player itself has focus.
        wrap.addEventListener("keydown", function (e) {
            if (e.target === wrap && (e.key === " " || e.key === "k")) { e.preventDefault(); toggle(); }
        });
        sync(); paint();
    };
    // Only one video plays at a time.
    document.addEventListener("play", function (e) {
        var vids = document.querySelectorAll(".qp-wrap video");
        for (var i = 0; i < vids.length; i++) if (vids[i] !== e.target && !vids[i].paused) vids[i].pause();
    }, true);
    function boot() {
        var ws = document.querySelectorAll("[data-qp]");
        for (var i = 0; i < ws.length; i++) window.qPlayer(ws[i]);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
