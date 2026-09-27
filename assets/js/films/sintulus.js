/* Sintulus 6 — product film.
   01 a run that lasts the working day: the clock runs from 08:12 to 17:40, a decision is
      asked for once, the rest happens with the window closed
   02 dots settle into a figure, and every part of it carries its provenance
   03 one change across the whole project: files, checkpoints, tests
   04 a molecule assembles from a cloud of points and turns in 3D */
(function () {
  var S = window.S, F = window.Film;
  var DUR = 28, AT = [0, 7, 14, 21];

  function scene(stage, bg) { var sc = S.el("div", "sc-scene", stage); sc.style.background = bg; return sc; }
  function hhmm(m) { var h = Math.floor(m / 60), mm = Math.floor(m % 60); return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function rnd(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  F.define("sintulus", {
    duration: DUR,
    start: 0.6,
    width: 1600, height: 900,
    chapters: [
      { t: 0, n: "01", title: "Work that runs for hours", text: "Hand it over in the morning, sign it off in the evening. Runs keep going with the window closed and check back when they need you." },
      { t: 7, n: "02", title: "Research with evidence", text: "Numbers come from the source and from real Python, never from memory. Every figure carries its provenance." },
      { t: 14, n: "03", title: "Code across the whole project", text: "Changes across many files with a plan, checkpoints and tests — not single suggestions to piece together." },
      { t: 21, n: "04", title: "Spatial understanding", text: "Molecules, structures and scenes in 3D — rotatable in the browser, not a flat picture." }
    ],
    build: function (stage) {
      var parts = [];

      /* ---------------------------------------------------------------- 01 */
      (function () {
        var sc = scene(stage, "#c8d5e5");
        var ht = S.halftone(sc, { blobs: [{ x: 360, y: 700, r: 420 }, { x: 1300, y: 200, r: 380 }], inner: [228, 128, 100], outer: [240, 190, 176] });
        var w = S.el("div", "sc-world", sc);
        var card = S.el("div", "sc-card", w);
        Object.assign(card.style, { left: "260px", top: "140px", width: "960px", height: "620px" });
        card.innerHTML =
          '<div class="sc-bar">Run · Move billing to francs<span class="sp"></span><span class="sc-tag sc-tag--clay">Sintulus 6</span></div>' +
          '<div style="display:flex;align-items:baseline;gap:22px;padding:34px 44px 10px"><span class="clock sc-serif" style="font-size:92px;letter-spacing:-.02em">08:12</span><span class="state" style="font-size:22px;color:#6b665f">running</span></div>' +
          '<div style="position:relative;margin:24px 44px 0;height:120px"><div class="sc-meter" style="position:absolute;left:0;right:0;top:40px;height:12px"><b class="fill"></b></div><div class="ticks"></div><div class="marks"></div></div>' +
          '<div class="feed" style="position:absolute;left:0;right:0;bottom:0"></div>';
        var ticks = card.querySelector(".ticks"), marks = card.querySelector(".marks");
        for (var h = 8; h <= 18; h += 2) S.el("span", "sc-mono", ticks, (h < 10 ? "0" : "") + h + ":00").setAttribute("style", "position:absolute;top:70px;left:" + ((h - 8) / 10 * 100) + "%;transform:translateX(-50%);font-size:17px;color:#9a958d");
        var ms = [["Plan", 8.4], ["Checkpoint 1", 10.3], ["Checkpoint 2", 13.1], ["Tests", 15.6], ["Review", 17.2]].map(function (m) {
          var e = S.el("div", "", marks);
          e.setAttribute("style", "position:absolute;top:0;left:" + ((m[1] - 8) / 10 * 100) + "%;transform:translateX(-50%);text-align:center");
          e.innerHTML = '<div style="font-size:16px;color:#6b665f;white-space:nowrap;margin-bottom:8px">' + m[0] + '</div><div style="width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid #d97757;margin:0 auto"></div>';
          return [e, m[1]];
        });
        var feed = card.querySelector(".feed");
        var f1 = S.el("div", "sc-row", feed, '<span class="sc-ico" style="background:#2a2d3a">◐</span><span>Window closed — the run carries on in the background</span><small>09:05</small>');
        var f2 = S.el("div", "sc-row", feed, '<span class="sc-check on"></span><span>Checkpoint 2 · 38 files changed, 211 tests green</span><small>13:10</small>');
        var toast = S.el("div", "sc-card", w);
        Object.assign(toast.style, { left: "1010px", top: "250px", width: "480px", padding: "28px 30px" });
        toast.innerHTML = '<div style="display:flex;align-items:center;gap:12px;font-size:19px;color:#946214;margin-bottom:12px"><span class="sc-tag sc-tag--amber">Needs a decision</span>11:47</div>' +
          '<div class="sc-serif" style="font-size:30px;line-height:1.3;margin-bottom:22px">Keep the old rounding for invoices issued before 2025?</div>' +
          '<div style="display:flex;gap:12px"><span class="keep" style="padding:12px 22px;border-radius:10px;background:#1d1c1a;color:#fff;font-size:21px;font-weight:500">Keep</span><span style="padding:12px 22px;border-radius:10px;border:1px solid #d9d5ce;font-size:21px">Change</span></div>';
        var keep = toast.querySelector(".keep");
        var cur = S.cursor(w);
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "800px", marginLeft: "-210px" });
        var clock = card.querySelector(".clock"), state = card.querySelector(".state"), fill = card.querySelector(".fill");
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 740, y: 430, s: 1.1 }, { t: 3.0, x: 900, y: 420, s: 1.02 }, { t: 4.4, x: 1150, y: 400, s: 1.12 }, { t: 7, x: 800, y: 450, s: 0.98 }]);
        var curKeys = [{ t: 3.2, x: 1500, y: 700 }, { t: 3.9, x: 1080, y: 500, click: 4.0 }, { t: 4.6, x: 1080, y: 500 }, { t: 5.4, x: 1560, y: 840 }];
        curKeys.vis = function (t) { return S.lin(t, 3.2, 3.4) * (1 - S.lin(t, 5.0, 5.4)); };
        parts.push(function (t) {
          ht(t); cam(t);
          var p = S.io(S.lin(t, 0.4, 5.8));
          var mins = S.lerp(8 * 60 + 12, 17 * 60 + 40, p);
          var s = hhmm(mins); if (clock.__t !== s) { clock.textContent = s; clock.__t = s; }
          fill.style.transform = "scaleX(" + ((mins / 60 - 8) / 10).toFixed(4) + ")";
          ms.forEach(function (m) { var k = S.out(S.lin(mins / 60, m[1] - 0.15, m[1] + 0.2)); m[0].style.opacity = k.toFixed(3); m[0].style.transform = "translateX(-50%) scale(" + (0.7 + 0.3 * k) + ")"; });
          S.show(f1, t, 1.0, 1.4); S.show(f2, t, 2.6, 3.0);
          f1.style.transform += " translateY(-" + (S.io(S.lin(t, 2.6, 3.0)) * 0) + "px)";
          S.show(toast, t, 3.0, 3.5, 4.3, 4.8, 40);
          keep.style.background = t > 4.0 ? "#2f7a4d" : "#1d1c1a";
          cur(t, curKeys);
          var done = t > 5.8;
          var st = done ? "ready for sign-off" : (t > 3.0 && t < 4.1 ? "waiting for you" : "running");
          if (state.__t !== st) { state.textContent = st; state.__t = st; state.style.color = done ? "#2f7a4d" : (st === "waiting for you" ? "#946214" : "#6b665f"); }
          pill.text(done ? "Done — ready for sign-off" : "Working through the plan…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.3, 0.7, 6.4, 6.9, 12);
        });
      })();

      /* ---------------------------------------------------------------- 02 */
      (function () {
        var sc = scene(stage, "#ece6db");
        var ht = S.halftone(sc, { blobs: [{ x: 1350, y: 720, r: 380 }, { x: 180, y: 160, r: 300 }], inner: [214, 120, 84], outer: [236, 206, 186] });
        var w = S.el("div", "sc-world", sc);
        var card = S.el("div", "sc-card sc-card--cream", w);
        Object.assign(card.style, { left: "250px", top: "110px", width: "1100px", height: "680px" });
        card.innerHTML = '<div style="padding:34px 44px 0"><div class="sc-serif" style="font-size:40px">Melting point vs. chain length</div><div style="font-size:20px;color:#8a857d;margin-top:6px">n-alkanes, C5–C40</div></div>' +
          '<canvas class="cv" style="position:absolute;left:0;top:120px"></canvas><div class="sc-chips"></div>';
        var cv = card.querySelector(".cv"); var dpr = 1.5; cv.width = 1100 * dpr; cv.height = 560 * dpr; cv.style.width = "1100px"; cv.style.height = "560px";
        var g = cv.getContext("2d");
        var N = 72, pts = [];
        for (var i = 0; i < N; i++) {
          var n = 5 + i * 35 / (N - 1);
          var mp = 136 * Math.log(n) / Math.log(40) * 1.0 + (rnd(i) - 0.5) * 9;
          pts.push({ tx: 110 + (n - 5) / 35 * 860, ty: 470 - (mp - 20) / 130 * 380, sx: rnd(i + 99) * 1100, sy: rnd(i + 199) * 560, d: rnd(i + 7) * 0.8 });
        }
        var chips = card.querySelector(".sc-chips");
        function chip(txt, cls, x, y) { var e = S.el("span", "sc-tag " + cls, chips, txt); e.style.position = "absolute"; e.style.left = x + "px"; e.style.top = y + "px"; e.style.fontSize = "19px"; e.style.boxShadow = "0 10px 24px -12px rgba(0,0,0,.25)"; return e; }
        var c1 = chip("Source · PubChem, 72 compounds", "sc-tag--blue", 150, 170);
        var c2 = chip("Fit · Python 3.12 · numpy 2.1 · run #14", "sc-tag--green", 610, 250);
        var c3 = chip("r² = 0.97", "", 900, 520);
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "40px", marginLeft: "-200px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 800, y: 470, s: 0.98 }, { t: 3.5, x: 760, y: 440, s: 1.1 }, { t: 7, x: 800, y: 450, s: 1.0 }]);
        parts.push(function (t) {
          ht(t); cam(t);
          g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, 1100, 560);
          var ax = S.out(S.lin(t, 0.2, 0.8));
          g.strokeStyle = "rgba(60,55,50," + (0.35 * ax) + ")"; g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(110, 60); g.lineTo(110, 470); g.lineTo(980, 470); g.stroke();
          g.fillStyle = "rgba(120,115,108," + ax + ")"; g.font = "17px Inter, system-ui, sans-serif"; g.textAlign = "center";
          for (var c = 5; c <= 40; c += 5) g.fillText("C" + c, 110 + (c - 5) / 35 * 860, 500);
          g.textAlign = "right"; for (var v = 25; v <= 150; v += 25) g.fillText(v + " °C", 98, 470 - (v - 20) / 130 * 380 + 6);
          pts.forEach(function (p) {
            var k = S.io(S.lin(t, 0.5 + p.d, 2.2 + p.d));
            var x = S.lerp(p.sx, p.tx, k), y = S.lerp(p.sy, p.ty, k);
            g.fillStyle = k < 1 ? "rgba(217,119,87," + (0.35 + 0.65 * k) + ")" : "#3b6fb6";
            g.beginPath(); g.arc(x, y, S.lerp(3, 6, k), 0, 6.2832); g.fill();
          });
          var lk = S.io(S.lin(t, 3.0, 4.0));
          if (lk > 0) {
            g.strokeStyle = "#d97757"; g.lineWidth = 4; g.beginPath();
            for (var j = 0; j <= 100 * lk; j++) { var nn = 5 + j / 100 * 35, mp = 136 * Math.log(nn) / Math.log(40); var X = 110 + (nn - 5) / 35 * 860, Y = 470 - (mp - 20) / 130 * 380; if (j) g.lineTo(X, Y); else g.moveTo(X, Y); }
            g.stroke();
          }
          S.show(c1, t, 2.4, 2.8); S.show(c2, t, 4.0, 4.4); S.show(c3, t, 4.7, 5.1);
          var done = t > 5.0;
          pill.text(done ? "Every figure has a source" : "Computing in Python…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.3, 0.7, 6.4, 6.9, 12);
        });
      })();

      /* ---------------------------------------------------------------- 03 */
      (function () {
        var sc = scene(stage, "#c3d8cf");
        var wv = S.waves(sc, { count: 5, amp: 120, color: "rgba(255,255,255,.5)", width: 2.4 });
        var w = S.el("div", "sc-world", sc);
        var tree = S.el("div", "sc-card", w);
        Object.assign(tree.style, { left: "150px", top: "110px", width: "660px", height: "680px" });
        var files = [["billing/", 0, null], ["currency.ts", 1, "+48 −12"], ["invoice.ts", 1, "+31 −19"], ["rounding.ts", 1, "+22 −4"], ["api/", 0, null], ["invoices.ts", 1, "+14 −9"], ["payouts.ts", 1, "+9 −3"], ["web/", 0, null], ["InvoiceTable.tsx", 1, "+26 −21"], ["PriceLabel.tsx", 1, "+11 −6"], ["migrations/", 0, null], ["2026_09_chf.sql", 1, "+40 −0"]];
        tree.innerHTML = '<div class="sc-bar">Project · sideforge-billing<span class="sp"></span><span class="cps sc-mono" style="font-size:18px;color:#8a857d"></span></div><div class="fl" style="padding:10px 0"></div>';
        var fl = tree.querySelector(".fl");
        var fileRows = files.map(function (f) {
          var e = S.el("div", "", fl, (f[1] ? '<span style="width:26px"></span>' : '') + '<span class="sc-mono" style="font-size:21px;' + (f[1] ? "" : "color:#8a857d") + '">' + f[0] + '</span>' + (f[2] ? '<span class="d sc-tag sc-tag--green sc-mono" style="margin-left:auto;font-size:16px">' + f[2] + '</span>' : ''));
          e.setAttribute("style", "display:flex;align-items:center;gap:8px;padding:9px 30px;" + (f[1] ? "" : "margin-top:6px"));
          return e;
        });
        var tests = S.el("div", "sc-card", w);
        Object.assign(tests.style, { left: "870px", top: "200px", width: "580px", height: "500px" });
        tests.innerHTML = '<div class="sc-bar">Tests<span class="sp"></span><span class="tc sc-mono" style="font-size:19px">0 / 142</span></div>' +
          '<div style="padding:26px 28px 8px"><div class="sc-meter" style="height:14px"><b class="tf" style="background:#2f7a4d"></b></div></div><div class="tr"></div>' +
          '<div class="cp" style="position:absolute;left:28px;right:28px;bottom:28px;display:flex;gap:10px;align-items:center;font-size:20px;color:#4a4742"></div>';
        var tr = tests.querySelector(".tr");
        var suites = [["billing", 46], ["invoices", 38], ["api", 58]].map(function (s) { return S.el("div", "sc-row", tr, '<span class="sc-check on"></span><span>' + s[0] + '</span><small>' + s[1] + ' passed</small>'); });
        var cp = tests.querySelector(".cp");
        cp.innerHTML = '<span>Checkpoints</span>' + [0, 1, 2].map(function () { return '<i style="width:18px;height:18px;border-radius:50%;border:3px solid #d97757;display:inline-block"></i>'; }).join("") + '<span class="cpl" style="margin-left:auto"></span>';
        var cpd = cp.querySelectorAll("i"), cpl = cp.querySelector(".cpl");
        var tf = tests.querySelector(".tf"), tc = tests.querySelector(".tc");
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "810px", marginLeft: "-180px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 520, y: 430, s: 1.14 }, { t: 3.2, x: 700, y: 450, s: 1.02 }, { t: 5.2, x: 1120, y: 450, s: 1.12 }, { t: 7, x: 800, y: 450, s: 0.98 }]);
        var diffs = tree.querySelectorAll(".d");
        parts.push(function (t) {
          wv(t); cam(t);
          for (var i = 0; i < diffs.length; i++) { var k = S.out(S.lin(t, 0.5 + i * 0.3, 0.8 + i * 0.3)); diffs[i].style.opacity = k.toFixed(3); diffs[i].style.transform = "scale(" + (0.8 + 0.2 * k) + ")"; }
          fileRows.forEach(function (r, i) { var hot = t > 0.5 + i * 0.25 && t < 0.9 + i * 0.25; r.style.background = hot ? "#fbf1ec" : "transparent"; });
          var tp = S.io(S.lin(t, 2.8, 5.0));
          tf.style.transform = "scaleX(" + tp.toFixed(3) + ")";
          S.num(tc, 0, 142, t, 2.8, 5.0, function (v) { return Math.round(v) + " / 142"; });
          suites.forEach(function (s, i) { S.show(s, t, 3.3 + i * 0.55, 3.7 + i * 0.55); });
          [1.8, 3.4, 5.2].forEach(function (a, i) { cpd[i].style.background = t > a ? "#d97757" : "transparent"; });
          var lb = t > 5.2 ? "3 saved" : (t > 3.4 ? "2 saved" : (t > 1.8 ? "1 saved" : "")); if (cpl.__t !== lb) { cpl.textContent = lb; cpl.__t = lb; }
          var done = t > 5.2;
          pill.text(done ? "All green · checkpoint 3 saved" : (t < 2.8 ? "Changing 8 files…" : "Running tests…"));
          pill.tick(t, !done);
          S.show(pill.el, t, 0.3, 0.7, 6.4, 6.9, 12);
        });
      })();

      /* ---------------------------------------------------------------- 04 */
      (function () {
        var sc = scene(stage, "#d2cfe4");
        var wv = S.waves(sc, { count: 4, amp: 150, color: "rgba(255,255,255,.55)", width: 2.4, speed: 0.12 });
        var w = S.el("div", "sc-world", sc);
        var card = S.el("div", "sc-card sc-card--cream", w);
        Object.assign(card.style, { left: "230px", top: "100px", width: "1140px", height: "700px" });
        card.innerHTML = '<div style="padding:34px 44px 0;display:flex;align-items:baseline;gap:18px"><span class="sc-serif" style="font-size:40px">Caffeine</span><span style="font-size:22px;color:#8a857d">C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub> · rotatable</span></div>' +
          '<canvas class="cv" style="position:absolute;left:0;top:90px"></canvas>' +
          '<div style="position:absolute;left:44px;bottom:32px;display:flex;gap:10px"><span class="sc-tag"><i style="width:14px;height:14px;border-radius:50%;background:#55534f;display:inline-block"></i>C</span><span class="sc-tag"><i style="width:14px;height:14px;border-radius:50%;background:#4a6fd1;display:inline-block"></i>N</span><span class="sc-tag"><i style="width:14px;height:14px;border-radius:50%;background:#d6554a;display:inline-block"></i>O</span><span class="sc-tag"><i style="width:14px;height:14px;border-radius:50%;background:#e9e6de;border:1px solid #cfcac1;display:inline-block"></i>H</span></div>';
        var cv = card.querySelector(".cv"); var dpr = 1.5; cv.width = 1140 * dpr; cv.height = 610 * dpr; cv.style.width = "1140px"; cv.style.height = "610px";
        var g = cv.getContext("2d");
        // caffeine, laid out flat with its methyl hydrogens above and below the ring plane
        var A = [
          ["N", 0, 1.4, 0], ["C", 1.21, 0.7, 0], ["N", 1.21, -0.7, 0], ["C", 0, -1.4, 0], ["C", -1.21, -0.7, 0], ["C", -1.21, 0.7, 0],
          ["N", -0.35, -2.72, 0], ["C", -1.62, -2.95, 0], ["N", -2.28, -1.78, 0],
          ["O", 2.3, 1.35, 0], ["O", -2.3, 1.35, 0], ["C", 0, 2.88, 0], ["C", 2.45, -1.42, 0], ["C", -3.7, -1.55, 0], ["H", -2.1, -3.9, 0],
          ["H", 0.95, 3.3, 0.35], ["H", -0.55, 3.25, 0.8], ["H", -0.45, 3.25, -0.85],
          ["H", 3.25, -0.75, 0.3], ["H", 2.55, -2.05, 0.85], ["H", 2.55, -1.95, -0.9],
          ["H", -4.25, -2.45, 0.2], ["H", -3.95, -0.95, 0.85], ["H", -3.95, -1.0, -0.9]
        ];
        var B = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [6, 7], [7, 8], [8, 4], [1, 9], [5, 10], [0, 11], [2, 12], [8, 13], [7, 14], [11, 15], [11, 16], [11, 17], [12, 18], [12, 19], [12, 20], [13, 21], [13, 22], [13, 23]];
        var COL = { C: "#55534f", N: "#4a6fd1", O: "#d6554a", H: "#ebe8e1" }, RAD = { C: 0.42, N: 0.42, O: 0.44, H: 0.27 };
        var cloud = []; for (var i = 0; i < 260; i++) cloud.push([rnd(i) * 2 - 1, rnd(i + 50) * 2 - 1, rnd(i + 90) * 2 - 1]);
        var cur = S.cursor(w);
        var curKeys = [{ t: 3.6, x: 1180, y: 700 }, { t: 4.1, x: 900, y: 460, hold: 0 }, { t: 5.3, x: 640, y: 470 }, { t: 5.8, x: 640, y: 470 }, { t: 6.5, x: 1500, y: 820 }];
        curKeys.vis = function (t) { return S.lin(t, 3.6, 3.8) * (1 - S.lin(t, 6.1, 6.5)); };
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "38px", marginLeft: "-200px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 800, y: 470, s: 1.12 }, { t: 7, x: 800, y: 450, s: 1.0 }]);
        parts.push(function (t) {
          wv(t); cam(t);
          g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, 1140, 610);
          var drag = S.io(S.lin(t, 4.1, 5.3));
          var ang = t * 0.45 + drag * 2.2, tilt = 0.35 + 0.15 * Math.sin(t * 0.4);
          var ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
          var sc2 = 78, cx = 570, cy = 300;
          function P(x, y, z) {
            var X = x * ca + z * sa, Z = -x * sa + z * ca;
            var Y = y * ct - Z * st; Z = y * st + Z * ct;
            var f = 9 / (9 + Z);
            return [cx + X * sc2 * f, cy - Y * sc2 * f, Z, f];
          }
          var build = S.io(S.lin(t, 0.4, 2.4));
          // the cloud of points condensing
          var ck = 1 - S.io(S.lin(t, 0.8, 2.6));
          if (ck > 0) {
            g.fillStyle = "rgba(217,119,87," + (0.8 * ck) + ")";
            cloud.forEach(function (c, i) {
              var a = A[i % A.length], r = 4.6 * ck + 0.2;
              var p = P(S.lerp(a[1], c[0] * r, ck), S.lerp(a[2], c[1] * r, ck), S.lerp(a[3], c[2] * r, ck));
              g.beginPath(); g.arc(p[0], p[1], 3.2 * p[3], 0, 6.2832); g.fill();
            });
          }
          var bk = S.io(S.lin(t, 1.8, 2.8));
          var proj = A.map(function (a) { return P(a[1], a[2], a[3]); });
          if (bk > 0) {
            B.slice().sort(function (a, b) { return (proj[b[0]][2] + proj[b[1]][2]) - (proj[a[0]][2] + proj[a[1]][2]); }).forEach(function (b) {
              var p = proj[b[0]], q = proj[b[1]];
              g.strokeStyle = "rgba(120,114,106," + (0.9 * bk) + ")"; g.lineWidth = 9 * (p[3] + q[3]) / 2;
              g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(S.lerp(p[0], q[0], bk), S.lerp(p[1], q[1], bk)); g.stroke();
            });
          }
          var ak = S.out(S.lin(t, 1.6, 2.8));
          if (ak > 0) {
            A.map(function (a, i) { return [a, proj[i]]; }).sort(function (a, b) { return b[1][2] - a[1][2]; }).forEach(function (e) {
              var a = e[0], p = e[1], r = RAD[a[0]] * sc2 * p[3] * ak;
              var gr = g.createRadialGradient(p[0] - r * 0.35, p[1] - r * 0.4, r * 0.1, p[0], p[1], r);
              gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.25, COL[a[0]]); gr.addColorStop(1, "rgba(0,0,0,0.55)");
              g.fillStyle = COL[a[0]]; g.beginPath(); g.arc(p[0], p[1], r, 0, 6.2832); g.fill();
              g.globalAlpha = 0.55; g.fillStyle = gr; g.fill(); g.globalAlpha = 1;
            });
          }
          cur(t, curKeys);
          var done = t > 3.4;
          pill.text(done ? "Drag to rotate" : "Building the structure…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.3, 0.7, 6.4, 6.9, 12);
          return build;
        });
      })();

      var cuts = S.scenes(AT, 0.4);
      var scs = stage.querySelectorAll(".sc-scene");
      return function (t) {
        var st = cuts(t, DUR);
        for (var i = 0; i < parts.length; i++) {
          var v = st[i].v;
          scs[i].style.opacity = v.toFixed(3);
          scs[i].style.visibility = v > 0 ? "visible" : "hidden";
          if (v > 0) parts[i](Math.max(0, Math.min(7.4, st[i].t)));
        }
      };
    }
  });
})();
