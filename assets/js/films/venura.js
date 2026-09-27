/* Venura 6.5 — product film.
   Four short scenes, one per change, told the way the product shows them: UI cards on
   soft colour fields, a status pill, a moving camera.
   01 a long Code session reaches its context limit, summarises itself and carries on
   02 a plan ticks off with three well-chosen tool calls instead of nine
   03 a draft is read back against the task; two claims are backed, one is marked open
   04 a chart is read point by point into a table */
(function () {
  var S = window.S, F = window.Film;
  var DUR = 28, AT = [0, 7, 14, 21];

  function scene(stage, bg) {
    var sc = S.el("div", "sc-scene", stage);
    sc.style.background = bg;
    return sc;
  }

  F.define("venura", {
    duration: DUR,
    start: 0.6,
    width: 1600, height: 900,
    chapters: [
      { t: 0, n: "01", title: "Stays on task longer", text: "Long sessions keep their thread — when the history reaches the context limit it is summarised, and the work carries on." },
      { t: 7, n: "02", title: "Cleaner tool chains", text: "Fewer unnecessary calls, better choices between search, Python and files — and a plan that stays in view." },
      { t: 14, n: "03", title: "Its own review pass", text: "Before an answer goes out it is read back against the task. What can’t be backed up is marked open." },
      { t: 21, n: "04", title: "Images and figures", text: "Charts, screenshots and formulas, read precisely — for Science, where a figure is the answer." }
    ],
    build: function (stage) {
      var parts = [];

      /* ---------------------------------------------------------------- 01 */
      (function () {
        var sc = scene(stage, "#c8d5e5");
        var ht = S.halftone(sc, { blobs: [{ x: 820, y: 470, r: 560, ry: 0.7 }, { x: 1180, y: 300, r: 260 }], inner: [228, 128, 100], outer: [240, 190, 176], spacing: 12 });
        var w = S.el("div", "sc-world", sc);
        var steps = [
          ["Read", "auth/session.ts, auth/tokens.ts", "0:41"], ["Ran", "npm test auth — 38 passed", "1:02"], ["Edited", "auth/session.ts  +61 −40", "1:30"],
          ["Read", "api/users/*.ts (9 files)", "2:14"], ["Planned", "move 12 endpoints to signed tokens", "2:40"], ["Edited", "api/users/login.ts  +22 −8", "3:05"],
          ["Ran", "npm test api — 112 passed", "3:48"], ["Edited", "api/users/refresh.ts  +18 −11", "4:20"], ["Asked", "keep 30-day refresh window?", "4:52"],
          ["Edited", "api/orders/list.ts  +14 −6", "5:37"], ["Ran", "npm test — 211 passed", "6:10"], ["Edited", "api/orders/detail.ts  +9 −4", "6:55"],
          ["Read", "api/billing/*.ts (6 files)", "7:31"], ["Ran", "lint — clean", "8:02"]
        ];
        var card = S.el("div", "sc-card", w);
        Object.assign(card.style, { left: "400px", top: "95px", width: "800px", height: "710px" });
        card.innerHTML =
          '<div class="sc-bar"><span class="dots"><i></i><i></i><i></i></span>SideForge Code · migrate-auth<span class="sp"></span><span class="sc-tag sc-tag--clay">Venura 6.5</span></div>' +
          '<div style="display:flex;align-items:center;gap:18px;padding:18px 26px;border-bottom:1px solid #f0eee9;font-size:19px;color:#6b665f"><span>Context</span><div class="sc-meter" style="flex:1"><b class="m"></b></div><span class="pc sc-mono" style="width:60px;text-align:right">22%</span></div>' +
          '<div class="viewport" style="position:absolute;left:0;right:0;top:118px;bottom:0;overflow:hidden"><div class="list"></div><div class="sum"></div><div class="after"></div></div>';
        var list = card.querySelector(".list");
        steps.forEach(function (s) {
          S.el("div", "sc-row", list, '<span class="sc-check on" style="transform:scale(.8)"></span><b style="font-weight:600;width:84px">' + s[0] + '</b><span>' + s[1] + '</span><small>' + s[2] + '</small>');
        });
        var sum = card.querySelector(".sum");
        Object.assign(sum.style, { position: "absolute", left: "26px", right: "26px", top: "22px", padding: "26px 30px", background: "#f7f3ec", borderRadius: "16px", border: "1px solid #ece4d8" });
        sum.innerHTML = '<div style="display:flex;align-items:center;gap:12px;font-size:19px;color:#8a6d56;margin-bottom:14px"><span class="sc-tag sc-tag--clay">Summary</span>212 steps · 3 h 40 min</div>' +
          '<div class="sc-serif" style="font-size:29px;line-height:1.35;color:#2a2825">Plan: move every endpoint to signed tokens.<br>Done: 5 of 12 endpoints, all tests green.<br>Open: rate limit on <span class="sc-mono" style="font-size:24px">/refresh</span>.</div>';
        var after = card.querySelector(".after");
        Object.assign(after.style, { position: "absolute", left: 0, right: 0, top: "292px" });
        var a1 = S.el("div", "sc-row", after, '<span class="k1 sc-spin"></span><b style="font-weight:600;width:84px">Next</b><span>endpoint 6 of 12 · api/billing/session.ts</span><small>8:40</small>');
        var a2 = S.el("div", "sc-row", after, '<span class="sc-check on" style="transform:scale(.8)"></span><b style="font-weight:600;width:84px">Edited</b><span>api/billing/session.ts  +24 −9</span><small>9:12</small>');
        var a3 = S.el("div", "sc-row", after, '<span class="sc-check on" style="transform:scale(.8)"></span><b style="font-weight:600;width:84px">Ran</b><span>npm test billing — 46 passed</span><small>9:40</small>');
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "450px", marginLeft: "-190px" });
        pill.text("Summarising history…");
        var meter = card.querySelector(".m"), pc = card.querySelector(".pc");
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 800, y: 470, s: 0.94 }, { t: 3, x: 800, y: 520, s: 1.06 }, { t: 4.6, x: 800, y: 420, s: 1.14 }, { t: 7, x: 800, y: 460, s: 1.0 }]);
        parts.push(function (t) {
          ht(t); cam(t);
          var scroll = S.io(S.lin(t, 0.3, 3.1)) * 430;
          var collapse = S.io(S.lin(t, 3.7, 4.5));
          list.style.transform = "translateY(" + (-scroll - collapse * 120) + "px) scale(" + (1 - collapse * 0.08) + ")";
          list.style.opacity = (1 - collapse).toFixed(3);
          list.style.filter = "blur(" + (collapse * 6).toFixed(1) + "px)";
          var fill = t < 3.9 ? S.lerp(0.22, 0.97, S.io(S.lin(t, 0.2, 3.3))) : S.lerp(0.97, 0.18, S.io(S.lin(t, 3.9, 4.8)));
          meter.style.transform = "scaleX(" + fill.toFixed(3) + ")";
          meter.style.background = fill > 0.9 ? "#c4553a" : "#d97757";
          var ps = Math.round(fill * 100) + "%"; if (pc.__t !== ps) { pc.textContent = ps; pc.__t = ps; }
          S.show(sum, t, 4.2, 4.9, null, null, 30);
          S.show(a1, t, 5.0, 5.4); S.show(a2, t, 5.7, 6.1); S.show(a3, t, 6.2, 6.6);
          a1.firstChild.className = t > 5.7 ? "sc-check on" : "sc-spin";
          a1.firstChild.style.transform = t > 5.7 ? "scale(.8)" : "rotate(" + (t * 400 % 360) + "deg)";
          S.show(pill.el, t, 3.2, 3.6, 4.6, 5.0, 12);
          pill.tick(t);
        });
      })();

      /* ---------------------------------------------------------------- 02 */
      (function () {
        var sc = scene(stage, "#c3d8cf");
        var wv = S.waves(sc, { count: 5, amp: 110, color: "rgba(255,255,255,.5)", width: 2.4 });
        var w = S.el("div", "sc-world", sc);
        var plan = S.el("div", "sc-card", w);
        Object.assign(plan.style, { left: "170px", top: "170px", width: "560px", height: "560px", padding: "34px 36px" });
        var items = ["Find the 2024 grid tariff table", "Load it into Python", "Recompute the monthly totals", "Write the summary"];
        plan.innerHTML = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:26px"><span class="sc-serif" style="font-size:40px">Plan</span><span class="sc-tag" style="margin-left:auto">stays in view</span></div>' +
          items.map(function (s) { return '<div class="pi" style="display:flex;align-items:center;gap:18px;padding:20px 0;border-top:1px solid #f0eee9;font-size:25px"><span class="sc-check"></span><span>' + s + '</span></div>'; }).join("");
        var tools = S.el("div", "sc-card", w);
        Object.assign(tools.style, { left: "790px", top: "170px", width: "640px", height: "560px" });
        tools.innerHTML = '<div class="sc-bar">Tool calls<span class="sp"></span><span class="cnt sc-tag sc-tag--green sc-mono">9 → 3</span></div><div class="ghost" style="position:absolute;left:0;right:0;top:58px"></div><div class="real" style="position:absolute;left:0;right:0;top:58px"></div>';
        var ghost = tools.querySelector(".ghost"), real = tools.querySelector(".real");
        ["search", "search", "fetch page", "search", "python", "python", "files", "python", "files"].forEach(function (n) {
          S.el("div", "sc-row", ghost, '<span class="sc-ico" style="background:#d9d5ce"></span><span style="color:#9a958d">' + n + '</span>');
        });
        var rows = [
          ["#3b6fb6", "S", "Search", "“Swiss grid tariff 2024 csv”", "0.8 s"],
          ["#c9962e", "Py", "Python", "recompute monthly totals", "1.9 s"],
          ["#3f8a5f", "F", "Files", "write summary.md", "0.3 s"]
        ].map(function (r) {
          var e = S.el("div", "sc-row", real, '<span class="st sc-spin"></span><span class="sc-ico" style="background:' + r[0] + '">' + r[1] + '</span><b style="font-weight:600">' + r[2] + '</b><span style="color:#6b665f">' + r[3] + '</span><small>' + r[4] + '</small>');
          e.style.padding = "22px 26px"; e.style.fontSize = "23px";
          return e;
        });
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "770px", marginLeft: "-200px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 620, y: 450, s: 1.12 }, { t: 3.4, x: 900, y: 450, s: 1.08 }, { t: 7, x: 800, y: 450, s: 0.98 }]);
        var pis = plan.querySelectorAll(".pi .sc-check");
        var done = [1.9, 2.9, 3.9, 4.9];
        parts.push(function (t) {
          wv(t); cam(t);
          var g = S.io(S.lin(t, 0.6, 1.6));
          ghost.style.opacity = (0.8 * (1 - g)).toFixed(3);
          ghost.style.transform = "scaleY(" + (1 - g * 0.7) + ")";
          ghost.style.transformOrigin = "top";
          rows.forEach(function (r, i) {
            S.show(r, t, 1.2 + i * 1.0, 1.6 + i * 1.0);
            var st = r.firstChild, ok = t > 1.9 + i * 1.0 + (i === 1 ? 0.6 : 0);
            st.className = ok ? "sc-check on" : "sc-spin";
            st.style.transform = ok ? "" : "rotate(" + (t * 400 % 360) + "deg)";
          });
          for (var i = 0; i < pis.length; i++) pis[i].className = t > done[i] + (i >= 2 ? 0.6 : 0) ? "sc-check on" : "sc-check";
          pill.text(t < 5.4 ? "Choosing the right tool…" : "Plan complete · 3 calls");
          pill.tick(t, t < 5.4);
          S.show(pill.el, t, 0.4, 0.8, 6.4, 6.9, 12);
        });
      })();

      /* ---------------------------------------------------------------- 03 */
      (function () {
        var sc = scene(stage, "#e5dbcc");
        var ht = S.halftone(sc, { blobs: [{ x: 1250, y: 250, r: 420 }, { x: 300, y: 760, r: 360 }], inner: [214, 120, 84], outer: [236, 196, 170], spacing: 12 });
        var w = S.el("div", "sc-world", sc);
        var card = S.el("div", "sc-card", w);
        Object.assign(card.style, { left: "300px", top: "120px", width: "1000px", height: "660px" });
        card.innerHTML = '<div class="sc-bar">Draft answer<span class="sp"></span><span class="sc-tag">before it goes out</span></div>' +
          '<div class="body sc-serif" style="padding:40px 56px;font-size:40px;line-height:1.5;color:#2a2825">Grid fees in Zürich rose <span class="c1 sc-hl">8.4 % in 2024</span>, mostly from the new <span class="c2 sc-hl">network surcharge</span>. That makes the <span class="c3 sc-hl">winter quarter the most expensive</span> of the year.</div>' +
          '<div class="notes" style="position:absolute;left:56px;right:56px;bottom:36px;display:flex;gap:12px;flex-wrap:wrap"></div>' +
          '<div class="scan" style="position:absolute;left:0;right:0;height:3px;background:#d97757;box-shadow:0 0 24px 6px rgba(217,119,87,.35)"></div>';
        var notes = card.querySelector(".notes");
        var n1 = S.el("span", "sc-tag sc-tag--green", notes, "✓ 8.4 % — Python run #2");
        var n2 = S.el("span", "sc-tag sc-tag--green", notes, "✓ surcharge — tariff table, p. 14");
        var n3 = S.el("span", "sc-tag sc-tag--amber", notes, "Open — the data ends in October");
        var c = [card.querySelector(".c1"), card.querySelector(".c2"), card.querySelector(".c3")];
        var scan = card.querySelector(".scan");
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "40px", marginLeft: "-270px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 800, y: 460, s: 1.0 }, { t: 3.2, x: 800, y: 380, s: 1.08 }, { t: 4.6, x: 980, y: 420, s: 1.3 }, { t: 7, x: 800, y: 470, s: 1.02 }]);
        var hit = [1.5, 2.2, 3.1], col = ["#dcefe3", "#dcefe3", "#fbecc8"];
        parts.push(function (t) {
          ht(t); cam(t);
          var y = S.lerp(90, 420, S.io(S.lin(t, 0.9, 3.5)));
          scan.style.top = y + "px";
          scan.style.opacity = (S.lin(t, 0.8, 1.0) * (1 - S.lin(t, 3.4, 3.8))).toFixed(3);
          c.forEach(function (e, i) {
            var k = S.out(S.lin(t, hit[i], hit[i] + 0.4));
            e.style.background = k > 0 ? col[i] : "transparent";
            e.style.boxShadow = k > 0 ? "inset 0 -3px 0 " + (i < 2 ? "#6fb58a" : "#e0a93b") : "none";
          });
          S.show(n1, t, hit[0] + 0.3, hit[0] + 0.7); S.show(n2, t, hit[1] + 0.3, hit[1] + 0.7); S.show(n3, t, hit[2] + 0.3, hit[2] + 0.7);
          pill.text(t < 3.8 ? "Reading it back against the task…" : "2 claims backed · 1 marked open");
          pill.tick(t, t < 3.8);
          S.show(pill.el, t, 0.4, 0.8, 6.3, 6.8, 12);
        });
      })();

      /* ---------------------------------------------------------------- 04 */
      (function () {
        var sc = scene(stage, "#d2cfe4");
        var wv = S.waves(sc, { count: 4, amp: 140, color: "rgba(255,255,255,.55)", width: 2.4, speed: 0.12 });
        var w = S.el("div", "sc-world", sc);
        var chart = S.el("div", "sc-card", w);
        Object.assign(chart.style, { left: "140px", top: "150px", width: "820px", height: "600px" });
        var pts = [[0, 380], [3, 360], [6, 412], [9, 655], [12, 598], [15, 560], [18, 731], [21, 640], [24, 430]];
        var X = function (h) { return 90 + h / 24 * 650; }, Y = function (v) { return 500 - (v - 300) / 500 * 400; };
        var line = pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
        var grid = ""; for (var g = 0; g <= 4; g++) grid += '<line x1="90" x2="740" y1="' + (100 + g * 100) + '" y2="' + (100 + g * 100) + '" stroke="#ecebe6"/><text x="80" y="' + (106 + g * 100) + '" text-anchor="end" font-size="17" fill="#9a958d">' + (800 - g * 125) + '</text>';
        for (var h = 0; h <= 24; h += 6) grid += '<text x="' + X(h) + '" y="530" text-anchor="middle" font-size="17" fill="#9a958d">' + (h < 10 ? "0" : "") + h + ':00</text>';
        chart.innerHTML = '<div class="sc-bar">load-curve.png<span class="sp"></span><span class="sc-tag">screenshot</span></div>' +
          '<svg viewBox="0 0 820 542" style="width:820px;height:542px;font-family:Inter,sans-serif">' + grid +
          '<path d="' + line + '" fill="none" stroke="#3b6fb6" stroke-width="4" stroke-linejoin="round"/>' +
          '<path d="' + line + ' L 740 500 L 90 500 Z" fill="rgba(59,111,182,.08)"/>' +
          '<text x="100" y="60" font-size="22" font-weight="600" fill="#2a2825">Zürich grid load, 24 h (MW)</text>' +
          '<g class="pins"></g><line class="vx" y1="90" y2="500" stroke="#d97757" stroke-width="2" stroke-dasharray="6 6"/></svg>';
        var pins = chart.querySelector(".pins"), vx = chart.querySelector(".vx");
        var reads = [[6, 412], [9, 655], [12, 598], [18, 731]];
        var pinEls = reads.map(function (r) {
          var ns = "http://www.w3.org/2000/svg", c = document.createElementNS(ns, "circle");
          c.setAttribute("cx", X(r[0])); c.setAttribute("cy", Y(r[1])); c.setAttribute("r", 0);
          c.setAttribute("fill", "#fff"); c.setAttribute("stroke", "#d97757"); c.setAttribute("stroke-width", 4);
          pins.appendChild(c); return c;
        });
        var table = S.el("div", "sc-card", w);
        Object.assign(table.style, { left: "1010px", top: "210px", width: "450px", height: "480px" });
        table.innerHTML = '<div class="sc-bar">Read from figure</div><div class="rows"></div><div class="res sc-serif" style="position:absolute;left:28px;right:28px;bottom:26px;font-size:27px;line-height:1.3">Peak <b style="font-weight:500">731 MW</b> at 18:00<span class="sc-mono" style="font-size:18px;color:#8a857d;margin-left:10px">±5</span></div>';
        var rowsEl = table.querySelector(".rows");
        var trs = reads.map(function (r) {
          var e = S.el("div", "sc-row", rowsEl, '<span class="sc-mono">' + (r[0] < 10 ? "0" : "") + r[0] + ':00</span><small style="font-size:22px;color:#2a2825">' + r[1] + ' MW</small>');
          e.style.fontSize = "22px"; return e;
        });
        var res = table.querySelector(".res");
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "46px", marginLeft: "-180px" });
        pill.text("Reading the figure…");
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 560, y: 450, s: 1.18 }, { t: 3.6, x: 700, y: 450, s: 1.05 }, { t: 7, x: 800, y: 450, s: 0.98 }]);
        var tt = [1.0, 1.9, 2.8, 3.8];
        parts.push(function (t) {
          wv(t); cam(t);
          var h = S.lerp(3, 19, S.io(S.lin(t, 0.6, 4.2)));
          vx.setAttribute("x1", X(h)); vx.setAttribute("x2", X(h));
          vx.style.opacity = (S.lin(t, 0.5, 0.8) * (1 - S.lin(t, 4.3, 4.8))).toFixed(3);
          pinEls.forEach(function (p, i) { var k = S.out(S.lin(t, tt[i], tt[i] + 0.3)); p.setAttribute("r", (9 * k).toFixed(2)); });
          trs.forEach(function (r, i) { S.show(r, t, tt[i] + 0.15, tt[i] + 0.55, null, null, 14); });
          S.show(res, t, 4.6, 5.1);
          pill.tick(t, t < 4.6);
          S.show(pill.el, t, 0.4, 0.8, 4.6, 5.0, 12);
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
