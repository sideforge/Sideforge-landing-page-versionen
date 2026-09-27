/* Home — product film, in step with the headline "Everything for …".
   01 your next project  — Forge IDE writes a page while the live preview builds it
   02 your research      — Science loads four databases and computes with them
   03 your services      — one command opens an encrypted tunnel; the shop goes live
   04 your team          — people join a workspace; everything lands on one invoice
   05 the whole workshop — the tools gather around one mark */
(function () {
  var S = window.S, F = window.Film;
  var L = 4.4, N = 5, DUR = L * N, AT = [0, L, 2 * L, 3 * L, 4 * L];

  var LOCK = '<svg viewBox="0 0 16 16" style="width:1em;height:1em;color:#4a4742"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function scene(stage, bg) { var sc = S.el("div", "sc-scene", stage); sc.style.background = bg; return sc; }
  function spinOrCheck(e, t, on) { e.className = on ? "sc-check on" : "sc-spin"; e.style.transform = on ? "" : "rotate(" + (t * 400 % 360) + "deg)"; }

  F.define("home", {
    duration: DUR,
    start: 0.5,
    width: 1600, height: 900,
    chapters: [
      { t: 0, n: "01", title: "your next project" },
      { t: L, n: "02", title: "your research" },
      { t: 2 * L, n: "03", title: "your services" },
      { t: 3 * L, n: "04", title: "your team" },
      { t: 4 * L, n: "05", title: "the whole workshop" }
    ],
    build: function (stage) {
      var parts = [];

      /* ---------------------------------------------------------------- 01 */
      (function () {
        var sc = scene(stage, "#c8d5e5");
        var ht = S.halftone(sc, { blobs: [{ x: 1320, y: 760, r: 420 }, { x: 260, y: 140, r: 320 }], inner: [228, 128, 100], outer: [240, 190, 176] });
        var w = S.el("div", "sc-world", sc);
        var ide = S.el("div", "sc-card", w);
        Object.assign(ide.style, { left: "150px", top: "110px", width: "1300px", height: "680px" });
        ide.innerHTML = '<div class="sc-bar"><span class="dots"><i></i><i></i><i></i></span>Forge IDE · bakery-site<span class="sp"></span><span class="sc-tag sc-tag--green">● Live preview</span></div>' +
          '<div class="code sc-mono" style="position:absolute;left:0;top:58px;bottom:0;width:560px;background:#fbfaf7;border-right:1px solid #ecebe6;padding:28px 30px;font-size:19px;line-height:1.75;white-space:pre;color:#4a4742"></div>' +
          '<div class="pv" style="position:absolute;left:560px;right:0;top:58px;bottom:0;padding:24px 34px"></div>';
        var code = ide.querySelector(".code");
        var src = [
          ['<span style="color:#a4492c">export default</span> <span style="color:#36598f">function</span> Home() {', "export default function Home() {"],
          ['  <span style="color:#36598f">return</span> (', "  return ("],
          ['    &lt;<span style="color:#2f7a4d">Hero</span> title=<span style="color:#946214">"Brot &amp; Butter"</span> /&gt;', '    <Hero title="Brot & Butter" />'],
          ['    &lt;<span style="color:#2f7a4d">Products</span> items={bakes} /&gt;', "    <Products items={bakes} />"],
          ['    &lt;<span style="color:#2f7a4d">Order</span> pickup=<span style="color:#946214">"Zürich"</span> /&gt;', '    <Order pickup="Zürich" />'],
          ["  );", "  );"], ["}", "}"]
        ];
        var lines = src.map(function () { return S.el("div", "", code); });
        var pv = ide.querySelector(".pv");
        pv.innerHTML = '<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:10px;background:#f2f0ea;font-size:18px;color:#6b665f;margin-bottom:26px"><span>' + LOCK + '</span>bakery.sideforge.ch</div>' +
          '<div class="b1" style="display:flex;justify-content:space-between;font-size:18px;color:#8a857d;margin-bottom:34px"><b style="color:#2a2825">Brot &amp; Butter</b><span>Bakes · Order · Visit</span></div>' +
          '<div class="b2 sc-serif" style="font-size:58px;line-height:1.02;letter-spacing:-.02em;margin-bottom:14px">Baked at four,<br>gone by noon.</div>' +
          '<div class="b3" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#1d1c1a;color:#fff;font-size:18px;margin-bottom:30px">Order for pickup</div>' +
          '<div class="b4" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px"></div>';
        var b4 = pv.querySelector(".b4");
        var prods = [["#e8c9a0", "Sourdough"], ["#d9a36e", "Zopf"], ["#f1dfc8", "Gipfeli"]].map(function (p) {
          return S.el("div", "", b4, '<div style="height:120px;border-radius:12px;background:' + p[0] + '"></div><div style="font-size:17px;margin-top:10px">' + p[1] + '</div>');
        });
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "816px", marginLeft: "-200px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 520, y: 400, s: 1.18 }, { t: 2.2, x: 900, y: 440, s: 1.05 }, { t: 4.4, x: 800, y: 450, s: 0.98 }]);
        parts.push(function (t) {
          ht(t); cam(t);
          var total = src.reduce(function (a, s) { return a + s[1].length; }, 0);
          var shown = Math.round(total * S.lin(t, 0.1, 2.4)), acc = 0;
          lines.forEach(function (ln, i) {
            var plain = src[i][1], n = Math.max(0, Math.min(plain.length, shown - acc)); acc += plain.length;
            var key = n + "";
            if (ln.__k !== key) { ln.__k = key; ln.innerHTML = n >= plain.length ? src[i][0] : plain.slice(0, n).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
          });
          S.show(pv.querySelector(".b1"), t, 0.8, 1.1); S.show(pv.querySelector(".b2"), t, 1.1, 1.5); S.show(pv.querySelector(".b3"), t, 1.5, 1.8);
          prods.forEach(function (p, i) { S.show(p, t, 1.9 + i * 0.2, 2.3 + i * 0.2, null, null, 24); });
          var done = t > 2.8;
          pill.text(done ? "Live at bakery.sideforge.ch" : "Building preview…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.2, 0.5, 3.9, 4.3, 12);
        });
      })();

      /* ---------------------------------------------------------------- 02 */
      (function () {
        var sc = scene(stage, "#ece6db");
        var ht = S.halftone(sc, { blobs: [{ x: 250, y: 720, r: 380 }, { x: 1380, y: 170, r: 330 }], inner: [214, 120, 84], outer: [236, 206, 186] });
        var w = S.el("div", "sc-world", sc);
        var dbs = S.el("div", "sc-card", w);
        Object.assign(dbs.style, { left: "180px", top: "180px", width: "520px", height: "540px" });
        dbs.innerHTML = '<div class="sc-bar">SideForge Science · sources</div><div class="l"></div>';
        var rows = [["#36598f", "PDB", "214 structures"], ["#2f7a4d", "UniProt", "1 832 entries"], ["#946214", "ChEMBL", "9 410 assays"], ["#a4492c", "PubChem", "72 compounds"]].map(function (d) {
          var e = S.el("div", "sc-row", dbs.querySelector(".l"), '<span class="sc-spin"></span><span class="sc-ico" style="background:' + d[0] + '">' + d[1][0] + '</span><b style="font-weight:600">' + d[1] + '</b><small>' + d[2] + '</small>');
          e.style.padding = "24px 28px"; return e;
        });
        var res = S.el("div", "sc-card sc-card--cream", w);
        Object.assign(res.style, { left: "760px", top: "140px", width: "660px", height: "620px", padding: "34px 40px" });
        res.innerHTML = '<div class="sc-serif" style="font-size:38px;margin-bottom:6px">Binding affinity by target</div><div style="font-size:19px;color:#8a857d;margin-bottom:26px">median pIC50 · computed in Python</div><div class="bars"></div><div class="src" style="position:absolute;left:40px;bottom:30px;display:flex;gap:10px"><span class="sc-tag sc-tag--blue">ChEMBL 34</span><span class="sc-tag sc-tag--green">Python 3.12 · run #3</span></div>';
        var bars = [["EGFR", 0.86], ["BRAF", 0.71], ["KRAS", 0.52], ["ALK", 0.64]].map(function (b) {
          var e = S.el("div", "", res.querySelector(".bars"), '<div style="display:flex;justify-content:space-between;font-size:20px;margin-bottom:8px"><span class="sc-mono">' + b[0] + '</span><span class="v sc-mono" style="color:#8a857d"></span></div><div class="sc-meter" style="height:16px;margin-bottom:22px"><b style="background:#3b6fb6"></b></div>');
          return [e, b[1]];
        });
        var src = res.querySelector(".src");
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "40px", marginLeft: "-210px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 460, y: 450, s: 1.16 }, { t: 2.0, x: 820, y: 450, s: 1.02 }, { t: 4.4, x: 1000, y: 450, s: 1.1 }]);
        parts.push(function (t) {
          ht(t); cam(t);
          rows.forEach(function (r, i) { S.show(r, t, 0.1 + i * 0.25, 0.4 + i * 0.25); spinOrCheck(r.firstChild, t, t > 0.7 + i * 0.35); });
          bars.forEach(function (b, i) {
            var k = S.io(S.lin(t, 1.9 + i * 0.2, 2.8 + i * 0.2));
            b[0].querySelector("b").style.transform = "scaleX(" + (b[1] * k).toFixed(3) + ")";
            S.num(b[0].querySelector(".v"), 0, b[1] * 10, t, 1.9 + i * 0.2, 2.8 + i * 0.2, function (v) { return v.toFixed(1); });
          });
          S.show(src, t, 3.0, 3.3);
          var done = t > 3.0;
          pill.text(done ? "Computed · every number sourced" : "Loading four databases…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.2, 0.5, 3.9, 4.3, 12);
        });
      })();

      /* ---------------------------------------------------------------- 03 */
      (function () {
        var sc = scene(stage, "#c3d8cf");
        var wv = S.waves(sc, { count: 5, amp: 120, color: "rgba(255,255,255,.5)", width: 2.4 });
        var w = S.el("div", "sc-world", sc);
        var term = S.el("div", "sc-card", w);
        Object.assign(term.style, { left: "140px", top: "230px", width: "600px", height: "420px", background: "#1f1e1c", color: "#e9e5dd" });
        term.innerHTML = '<div class="sc-bar" style="border-color:#34322e;color:#a8a39c"><span class="dots"><i style="background:#4a4742"></i><i style="background:#4a4742"></i><i style="background:#4a4742"></i></span>Terminal</div><div class="sc-mono" style="padding:28px 30px;font-size:22px;line-height:1.9"><div><span style="color:#d97757">$</span> <span class="cmd"></span></div><div class="o1" style="color:#8fc7a2">✓ tunnel open on :3000</div><div class="o2">→ https://shop.sideforge.ch</div><div class="o3" style="color:#a8a39c">TLS 1.3 · AES-256-GCM</div></div>';
        var cmd = term.querySelector(".cmd");
        var br = S.el("div", "sc-card", w);
        Object.assign(br.style, { left: "900px", top: "150px", width: "560px", height: "600px" });
        br.innerHTML = '<div class="sc-bar"><span class="dots"><i></i><i></i><i></i></span><span style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;background:#f2f0ea;font-size:17px">' + LOCK + ' shop.sideforge.ch</span></div>' +
          '<div class="pg" style="padding:30px"><div class="sc-serif" style="font-size:42px;margin-bottom:22px">Ceramics, made in Bern</div><div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px"></div></div>';
        var cells = ["#d9c7b3", "#b9c8c2", "#e4d2c0", "#c7c1d6"].map(function (c) { return S.el("div", "", br.querySelector(".grid"), '<div style="height:150px;border-radius:12px;background:' + c + '"></div>'); });
        var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 1600 900"); svg.setAttribute("style", "position:absolute;left:0;top:0;width:1600px;height:900px");
        w.insertBefore(svg, w.firstChild);
        var path = document.createElementNS(ns, "path"); path.setAttribute("d", "M 740 440 C 800 440, 840 440, 900 440"); path.setAttribute("stroke", "#fff"); path.setAttribute("stroke-width", "4"); path.setAttribute("stroke-dasharray", "10 10"); path.setAttribute("fill", "none"); svg.appendChild(path);
        var dots = [0, 1, 2].map(function () { var c = document.createElementNS(ns, "circle"); c.setAttribute("r", 9); c.setAttribute("fill", "#d97757"); c.setAttribute("cy", 440); svg.appendChild(c); return c; });
        var lock = S.el("div", "sc-abs", w, '<div style="width:64px;height:64px;border-radius:50%;background:#fff;display:grid;place-items:center;font-size:28px;box-shadow:0 12px 30px -12px rgba(0,0,0,.3)">' + LOCK + '</div>');
        Object.assign(lock.style, { left: "788px", top: "408px" });
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "790px", marginLeft: "-210px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 440, y: 440, s: 1.2 }, { t: 2.0, x: 800, y: 450, s: 1.02 }, { t: 4.4, x: 1100, y: 450, s: 1.08 }]);
        parts.push(function (t) {
          wv(t); cam(t);
          S.typed(cmd, "sideforge port 3000", t, 0.1, 1.0);
          S.show(term.querySelector(".o1"), t, 1.1, 1.3, null, null, 6); S.show(term.querySelector(".o2"), t, 1.3, 1.5, null, null, 6); S.show(term.querySelector(".o3"), t, 1.5, 1.7, null, null, 6);
          var live = S.lin(t, 1.4, 1.8);
          path.style.opacity = live; lock.style.opacity = live;
          lock.style.transform = "scale(" + (0.7 + 0.3 * S.out(live)) + ")";
          dots.forEach(function (d, i) { var u = ((t * 0.9 + i / 3) % 1); d.setAttribute("cx", 740 + u * 160); d.style.opacity = live * Math.sin(u * Math.PI); });
          S.show(br, t, 1.6, 2.0, null, null, 30);
          cells.forEach(function (c, i) { S.show(c, t, 2.1 + i * 0.15, 2.4 + i * 0.15, null, null, 16); });
          var done = t > 2.0;
          pill.text(done ? "Live · encrypted end to end" : "Opening tunnel…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.2, 0.5, 3.9, 4.3, 12);
        });
      })();

      /* ---------------------------------------------------------------- 04 */
      (function () {
        var sc = scene(stage, "#e5dbcc");
        var ht = S.halftone(sc, { blobs: [{ x: 1300, y: 740, r: 420 }, { x: 220, y: 200, r: 300 }], inner: [214, 120, 84], outer: [236, 196, 170] });
        var w = S.el("div", "sc-world", sc);
        var ws = S.el("div", "sc-card", w);
        Object.assign(ws.style, { left: "170px", top: "150px", width: "620px", height: "600px" });
        ws.innerHTML = '<div class="sc-bar">Team · Werkstatt AG<span class="sp"></span><span class="sc-tag">5 members</span></div><div class="av" style="display:flex;gap:-10px;padding:30px 30px 10px"></div><div class="pj"></div>';
        var av = ws.querySelector(".av");
        var ppl = [["LK", "#d97757"], ["MR", "#3b6fb6"], ["AY", "#2f7a4d"], ["JS", "#946214"], ["NB", "#7a5aa6"]].map(function (p, i) {
          var e = S.el("div", "", av, p[0]);
          e.setAttribute("style", "width:78px;height:78px;border-radius:50%;background:" + p[1] + ";color:#fff;display:grid;place-items:center;font-size:24px;font-weight:600;border:4px solid #fff;margin-left:" + (i ? "-14px" : "0"));
          return e;
        });
        var pj = ws.querySelector(".pj");
        var projs = [["Forge", "shop-frontend"], ["Science", "pricing-study"], ["Cloud", "archive-2026"], ["Ports", "staging tunnel"]].map(function (p) {
          return S.el("div", "sc-row", pj, '<span class="sc-tag">' + p[0] + '</span><span>' + p[1] + '</span><small>shared</small>');
        });
        var inv = S.el("div", "sc-card sc-card--cream", w);
        Object.assign(inv.style, { left: "850px", top: "120px", width: "580px", height: "660px", padding: "34px 40px" });
        var items = [["SideForge Cloud", "48.00"], ["SideAI", "92.00"], ["Port Client", "12.00"], ["Spaces", "34.00"]];
        inv.innerHTML = '<div style="font-size:19px;color:#8a857d">Invoice · October 2026</div><div class="sc-serif" style="font-size:44px;margin:6px 0 26px">One bill</div>' +
          items.map(function (i) { return '<div class="it" style="display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid #ebe5da;font-size:22px"><span>' + i[0] + '</span><span class="sc-mono">CHF ' + i[1] + '</span></div>'; }).join("") +
          '<div class="tot" style="display:flex;justify-content:space-between;padding:20px 0 0;font-size:26px;font-weight:600"><span>Total</span><span class="sc-mono">CHF 186.00</span></div>' +
          '<div class="rf sc-tag sc-tag--green" style="margin-top:22px;font-size:19px">10 % to rainforest &amp; ocean · CHF 18.60</div>';
        var its = inv.querySelectorAll(".it");
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "810px", marginLeft: "-190px" });
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 480, y: 420, s: 1.16 }, { t: 2.0, x: 800, y: 450, s: 1.0 }, { t: 4.4, x: 1130, y: 450, s: 1.1 }]);
        parts.push(function (t) {
          ht(t); cam(t);
          ppl.forEach(function (p, i) { var k = S.out(S.lin(t, 0.2 + i * 0.22, 0.5 + i * 0.22)); p.style.opacity = k; p.style.transform = "scale(" + (0.6 + 0.4 * k) + ")"; });
          projs.forEach(function (p, i) { S.show(p, t, 1.0 + i * 0.15, 1.3 + i * 0.15); });
          for (var i = 0; i < its.length; i++) S.show(its[i], t, 1.8 + i * 0.2, 2.1 + i * 0.2, null, null, 10);
          S.show(inv.querySelector(".tot"), t, 2.7, 3.0); S.show(inv.querySelector(".rf"), t, 3.0, 3.3);
          var done = t > 2.7;
          pill.text(done ? "One login · one bill" : "Inviting the team…");
          pill.tick(t, !done);
          S.show(pill.el, t, 0.2, 0.5, 3.9, 4.3, 12);
        });
      })();

      /* ---------------------------------------------------------------- 05 */
      (function () {
        var sc = scene(stage, "#d2cfe4");
        var wv = S.waves(sc, { count: 4, amp: 150, color: "rgba(255,255,255,.55)", width: 2.4, speed: 0.12 });
        var w = S.el("div", "sc-world", sc);
        var core = S.el("div", "sc-card", w);
        Object.assign(core.style, { left: "700px", top: "350px", width: "200px", height: "200px", borderRadius: "44px", display: "grid", placeItems: "center" });
        core.innerHTML = S.MARK.replace('class="sc-mark"', 'class="sc-mark" style="width:120px;height:64px"');
        var names = [["SideAI", "#d97757"], ["Forge IDE", "#1d1c1a"], ["Science", "#2f7a4d"], ["Quantum", "#7a5aa6"], ["Port Client", "#3b6fb6"], ["Cloud", "#946214"], ["Spaces", "#a4492c"], ["Auth", "#4a4742"]];
        var tiles = names.map(function (n, i) {
          var e = S.el("div", "sc-card", w, '<span class="sc-ico" style="background:' + n[1] + ';width:40px;height:40px;border-radius:11px">' + n[0][0] + '</span><span style="font-size:24px;font-weight:500">' + n[0] + '</span>');
          Object.assign(e.style, { display: "flex", alignItems: "center", gap: "14px", padding: "18px 24px", borderRadius: "18px", left: "0", top: "0", whiteSpace: "nowrap" });
          var a = i / names.length * Math.PI * 2 - Math.PI / 2;
          return { e: e, x: 800 + Math.cos(a) * 470 - 110, y: 450 + Math.sin(a) * 300 - 38, sx: 800 + Math.cos(a) * 1100, sy: 450 + Math.sin(a) * 800 };
        });
        var pill = S.pill(sc);
        Object.assign(pill.el.style, { left: "50%", top: "800px", marginLeft: "-190px" });
        pill.text("Everything in one place");
        var cam = S.camera(w, 1600, 900, [{ t: 0, x: 800, y: 450, s: 1.25 }, { t: 3.0, x: 800, y: 450, s: 0.98 }, { t: 4.4, x: 800, y: 450, s: 0.96 }]);
        parts.push(function (t) {
          wv(t); cam(t);
          var ck = S.out(S.lin(t, 0.0, 0.6));
          core.style.transform = "scale(" + (0.8 + 0.2 * ck) + ")"; core.style.opacity = ck;
          S.markBusy(core.querySelector(".sc-mark"), t);
          tiles.forEach(function (tl, i) {
            var k = S.io(S.lin(t, 0.4 + i * 0.12, 1.5 + i * 0.12));
            tl.e.style.transform = "translate(" + S.lerp(tl.sx, tl.x, k).toFixed(1) + "px," + S.lerp(tl.sy, tl.y, k).toFixed(1) + "px)";
            tl.e.style.opacity = S.lin(t, 0.4 + i * 0.12, 0.8 + i * 0.12);
          });
          pill.tick(t, false);
          S.show(pill.el, t, 2.2, 2.6, 4.0, 4.4, 12);
        });
      })();

      var cuts = S.scenes(AT, 0.35);
      var scs = stage.querySelectorAll(".sc-scene");
      return function (t) {
        var st = cuts(t, DUR);
        for (var i = 0; i < parts.length; i++) {
          var v = st[i].v;
          scs[i].style.opacity = v.toFixed(3);
          scs[i].style.visibility = v > 0 ? "visible" : "hidden";
          if (v > 0) parts[i](Math.max(0, Math.min(L + 0.4, st[i].t)));
        }
      };
    }
  });
})();
