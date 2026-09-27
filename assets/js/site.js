/* Page behaviour shared by all pages: nav, reveals, scroll-spy, theme, film mounting. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");

  /* theme — per-viewer convenience only */
  try {
    var saved = localStorage.getItem("sf-theme");
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (e) {}
  document.querySelectorAll(".theme button").forEach(function (b) {
    var v = b.getAttribute("data-v");
    var cur = root.getAttribute("data-theme") || "auto";
    b.setAttribute("aria-pressed", String(v === cur));
    b.addEventListener("click", function () {
      if (v === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", v);
      try { v === "auto" ? localStorage.removeItem("sf-theme") : localStorage.setItem("sf-theme", v); } catch (e) {}
      document.querySelectorAll(".theme button").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
  });

  /* nav */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var burger = nav.querySelector(".nav__burger");
    if (burger) burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  /* line drawings: measure paths so they can draw themselves in */
  document.querySelectorAll("[data-draw]").forEach(function (p) {
    try { p.style.setProperty("--len", Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  /* reveals */
  var rv = document.querySelectorAll(".rv, .cap, .road, .tool");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        if (e.target.classList.contains("road")) {
          var line = e.target.querySelector(".road__line");
          if (line) line.style.setProperty("--prog", line.getAttribute("data-prog"));
        }
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* scroll-spy for the article side nav */
  var side = document.querySelectorAll(".article__side a");
  if (side.length && "IntersectionObserver" in window) {
    var map = {};
    side.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        side.forEach(function (a) { a.classList.remove("is-on"); });
        var a = map[e.target.id];
        if (a) a.classList.add("is-on");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* statements that light up word by word as they scroll through the viewport */
  var stm = [].slice.call(document.querySelectorAll("[data-words]"));
  stm.forEach(function (el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="wd">' + w + "</span>"; }).join(" ");
  });
  if (stm.length) {
    var paint = function () {
      var vh = window.innerHeight;
      stm.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        var ws = el.children, n = ws.length;
        for (var i = 0; i < n; i++) {
          var k = Math.min(1, Math.max(0, p * (n + 6) - i) / 6);
          ws[i].style.setProperty("--o", (0.14 + 0.86 * k).toFixed(3));
        }
      });
    };
    paint();
    window.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
  }

  /* films */
  if (window.Film) document.querySelectorAll("[data-film]").forEach(function (el) { Film.mount(el); });

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
