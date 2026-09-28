/* Launch hero: the film plays once; when it reaches its last image the title is set over it.
   A looping film (the `loop` attribute) is a backdrop: it keeps running and the title shows at once.
   With reduced motion (or if the video can't play) the last frame and the title show at once. */
(function () {
  "use strict";
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".lh").forEach(function (el) {
    var v = el.querySelector(".lh__video"), done = false;
    function set() { if (done) return; done = true; el.classList.add("is-set"); }
    if (!v || reduced) { if (v) { v.removeAttribute("autoplay"); v.pause(); } set(); return; }
    if (v.loop) { var q = v.play && v.play(); if (q && q.catch) q.catch(function () {}); set(); return; }   // a looping backdrop: the title stands from the start
    v.addEventListener("timeupdate", function () { if (v.duration && v.currentTime > v.duration - 1.2) set(); });
    v.addEventListener("ended", set);
    v.addEventListener("error", set, true);
    var p = v.play && v.play();
    if (p && p.catch) p.catch(set);                  // autoplay blocked: show the still and the title
    setTimeout(set, 14000);
  });
})();
