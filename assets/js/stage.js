/* Stage — small helpers for product films made of HTML: UI cards that move on soft
   colour fields, halftone clouds, fine wave lines, status pills, a cursor and a camera.
   Everything is a pure function of time t, so any frame can be rendered on its own
   (the player seeks, loops and captures without drift). */
(function () {
  "use strict";

  function el(tag, cls, parent, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lin(t, a, b) { return clamp((t - a) / (b - a)); }
  function io(x) { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function out(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function outExpo(x) { x = clamp(x); return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
  function lerp(a, b, x) { return a + (b - a) * x; }
  function mix(a, b, x) { return a.map(function (v, i) { return v + (b[i] - v) * x; }); }

  /* appear between a and b (and optionally leave between c and d) with a small rise */
  function show(e, t, a, b, c, d, dy) {
    dy = dy == null ? 18 : dy;
    var i = out(lin(t, a, b)), o = c != null ? 1 - io(lin(t, c, d)) : 1;
    var v = i * o;
    e.style.opacity = v.toFixed(3);
    e.style.transform = "translateY(" + ((1 - i) * dy).toFixed(2) + "px)";
    e.style.visibility = v <= 0.001 ? "hidden" : "visible";
    return v;
  }
  function typed(e, text, t, a, b) {
    var n = Math.round(text.length * lin(t, a, b));
    var s = text.slice(0, n);
    if (e.__t !== s) { e.textContent = s; e.__t = s; }
    return n;
  }
  function num(e, from, to, t, a, b, fmt) {
    var v = lerp(from, to, io(lin(t, a, b)));
    var s = fmt ? fmt(v) : String(Math.round(v));
    if (e.__t !== s) { e.textContent = s; e.__t = s; }
  }

  /* a halftone cloud: a grid of dots whose size follows a few drifting soft blobs */
  function halftone(parent, o) {
    var W = o.w || 1600, H = o.h || 900, sp = o.spacing || 12;
    var c = el("canvas", "sc-halftone", parent);
    var dpr = 1.5;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + "px"; c.style.height = H + "px";
    var g = c.getContext("2d");
    var A = o.inner || [236, 150, 120], B = o.outer || [244, 196, 178];
    return function (t) {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var blobs = o.blobs.map(function (b, i) {
        return { x: b.x + (b.dx || 30) * Math.sin(t * (b.s || 0.25) + i * 1.7), y: b.y + (b.dy || 20) * Math.cos(t * (b.s || 0.25) * 0.8 + i), r: b.r * (1 + 0.05 * Math.sin(t * 0.6 + i)) };
      });
      for (var y = sp / 2; y < H; y += sp) {
        for (var x = sp / 2; x < W; x += sp) {
          var d = 0;
          for (var k = 0; k < blobs.length; k++) {
            var b = blobs[k], dx = (x - b.x) / b.r, dy2 = (y - b.y) / (b.r * (b.ry || 0.8));
            d += Math.exp(-(dx * dx + dy2 * dy2) * 2.2);
          }
          d = Math.min(1, d * (o.gain || 1.1));
          if (d < 0.06) continue;
          var r = sp * 0.46 * Math.sqrt(d);
          var col = mix(B, A, d);
          g.fillStyle = "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + "," + (0.35 + 0.65 * d).toFixed(3) + ")";
          g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
        }
      }
    };
  }

  /* fine wave lines drifting slowly */
  function waves(parent, o) {
    var W = o.w || 1600, H = o.h || 900, n = o.count || 5;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "sc-waves");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    parent.appendChild(svg);
    var paths = [];
    for (var i = 0; i < n; i++) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", o.color || "rgba(255,255,255,.55)");
      p.setAttribute("stroke-width", o.width || 2.2);
      svg.appendChild(p);
      paths.push(p);
    }
    return function (t) {
      for (var i = 0; i < n; i++) {
        var y0 = H * (i + 0.5) / n, amp = (o.amp || 120) * (0.7 + 0.3 * Math.sin(i * 1.3)), ph = t * (o.speed || 0.15) + i * 0.9;
        var d = "M -50 " + y0.toFixed(1);
        for (var x = -50; x <= W + 50; x += 40) {
          var y = y0 + amp * Math.sin(x / W * 3.2 + ph) * Math.cos(x / W * 1.1 - ph * 0.6 + i);
          d += " L " + x + " " + y.toFixed(1);
        }
        paths[i].setAttribute("d", d);
      }
    };
  }

  /* the SideForge mark, drawn with three strokes; `busy` makes it re-draw itself in a loop */
  var MARK = '<svg class="sc-mark" viewBox="0 0 92 48" fill="none"><path d="M90 6 L17 6 Q6 6 6 15 Q6 24 17 24 L90 24" stroke="currentColor" stroke-width="11" pathLength="1"/><path d="M40 24 Q51 24 51 33 Q51 42 40 42 L6 42" stroke="currentColor" stroke-width="11" pathLength="1"/><path d="M66 6 L66 47.5" stroke="currentColor" stroke-width="11" pathLength="1"/></svg>';
  function markBusy(svg, t) {
    var ps = svg.querySelectorAll("path");
    for (var i = 0; i < ps.length; i++) {
      var ph = (t * 1.3 - i * 0.28) % 1;
      if (ph < 0) ph += 1;
      ps[i].style.opacity = (0.28 + 0.72 * Math.pow(0.5 + 0.5 * Math.cos(ph * 6.2832), 2)).toFixed(3);
    }
  }
  function markStill(svg) {
    var ps = svg.querySelectorAll("path");
    for (var i = 0; i < ps.length; i++) ps[i].style.opacity = "1";
  }

  /* a status pill: mark + label with a light sweeping across it */
  function pill(parent, cls) {
    var e = el("div", "sc-pill " + (cls || ""), parent, MARK + '<span class="sc-pill__tx"></span>');
    var tx = e.querySelector(".sc-pill__tx"), mk = e.querySelector(".sc-mark");
    return {
      el: e,
      text: function (s) { if (tx.__t !== s) { tx.textContent = s; tx.__t = s; } },
      tick: function (t, busy) {
        tx.style.backgroundPosition = (100 - ((t * 60) % 200)).toFixed(1) + "% 0";
        if (busy === false) markStill(mk); else markBusy(mk, t);
      }
    };
  }

  /* a cursor that glides between waypoints [{t,x,y,down}] */
  function cursor(parent) {
    var e = el("div", "sc-cursor", parent, '<svg viewBox="0 0 28 28"><path d="M5 3 L5 22 L10 17.5 L13.6 25 L17 23.5 L13.5 16 L20.5 16 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>');
    return function (t, keys) {
      var k = 0;
      while (k < keys.length - 1 && t >= keys[k + 1].t) k++;
      var A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
      var x = io(B.t > A.t ? lin(t, A.t + (A.hold || 0), B.t) : 1);
      var px = lerp(A.x, B.x, x), py = lerp(A.y, B.y, x);
      var press = 0;
      keys.forEach(function (kk) { if (kk.click != null) { var d = Math.abs(t - kk.click); if (d < 0.16) press = Math.max(press, 1 - d / 0.16); } });
      e.style.transform = "translate(" + px.toFixed(1) + "px," + py.toFixed(1) + "px) scale(" + (1 - 0.14 * press).toFixed(3) + ")";
      var vis = keys[0].t <= t ? 1 : 0;
      e.style.opacity = keys.vis ? keys.vis(t) : vis;
    };
  }

  /* camera: a world of W×H is framed by keys [{t, x, y, s}] — (x, y) is the point in the centre */
  function camera(world, W, H, keys) {
    return function (t) {
      var k = 0;
      while (k < keys.length - 1 && t >= keys[k + 1].t) k++;
      var A = keys[k], B = keys[Math.min(k + 1, keys.length - 1)];
      var x = B.t > A.t ? io(lin(t, A.t, B.t)) : 1;
      if (t < keys[0].t) x = 0;
      var s = Math.exp(lerp(Math.log(A.s), Math.log(B.s), x));
      var cx = lerp(A.x, B.x, x), cy = lerp(A.y, B.y, x);
      world.style.transform = "translate(" + (W / 2 - cx * s).toFixed(2) + "px," + (H / 2 - cy * s).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
    };
  }

  /* one scene per chapter: returns the local time and how visible the scene is (cross-fade) */
  function scenes(list, fade) {
    fade = fade || 0.45;
    return function (t, dur) {
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var a = list[i], b = i + 1 < list.length ? list[i + 1] : dur;
        var v = 0, lt = t - a;
        if (t >= a - fade && t < b + fade) {
          v = Math.min(clamp((t - (a - fade)) / fade), clamp((b + fade - t) / fade));
          if (i === 0 && t < fade) v = 1;
          if (i === list.length - 1 && t > dur - fade) v = 1;
        }
        out.push({ v: v, t: lt });
      }
      return out;
    };
  }

  window.S = {
    el: el, clamp: clamp, lin: lin, io: io, out: out, outExpo: outExpo, lerp: lerp, mix: mix,
    show: show, typed: typed, num: num, halftone: halftone, waves: waves, pill: pill,
    cursor: cursor, camera: camera, scenes: scenes, MARK: MARK, markBusy: markBusy, markStill: markStill
  };
})();
