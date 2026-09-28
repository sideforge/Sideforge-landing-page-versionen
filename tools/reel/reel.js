/* SideForge Reel — plays the timeline frame by frame: scene shader → light bloom → finish,
   with dust and the words drawn on 2D canvases and laid over the image.
   window.renderAt(t) draws the frame at t seconds; render.js screenshots it. */
(function () {
  "use strict";
  var TL = window.TL, SH = window.SH;
  var Q = new URLSearchParams(location.search);
  var K = +(Q.get("k") || 1);                       // output scale: 1 = 1080×1920
  var W = Math.round(TL.W * K), H = Math.round(TL.H * K);
  var SS = +(Q.get("ss") || 1);                     // scene resolution (words, logo and grain are always full size)
  var SW = Math.round(W * SS), SHt = Math.round(H * SS);

  var cv = document.getElementById("gl");
  cv.width = W; cv.height = H; cv.style.width = W + "px"; cv.style.height = H + "px";
  var gl = cv.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false });
  gl.getExtension("EXT_color_buffer_float"); gl.getExtension("OES_texture_float_linear");
  var fxc = document.createElement("canvas"); fxc.width = W; fxc.height = H;
  var txc = document.createElement("canvas"); txc.width = W; txc.height = H;
  var fx = fxc.getContext("2d", { willReadFrequently: true }), tx = txc.getContext("2d", { willReadFrequently: true });

  // ------------------------------------------------------------------ GL plumbing
  function prog(fs) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, SH.VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
    return { p: p, u: u };
  }
  function tex(w, h, hdr) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    if (hdr) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function target(w, h) {
    var t = tex(w, h, true), f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  }
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  var P = { bright: prog(SH.BRIGHT), blur: prog(SH.BLUR), fin: prog(SH.FINAL) }, SCENES = {};
  function sceneProg(s) {
    var mat = s.scene === TL.SCENES.MAT ? s.a[0] : 0, key = s.scene + ":" + mat;
    if (!SCENES[key]) SCENES[key] = prog(SH.SCENE.replace("precision highp float;", "precision highp float;\n#define SCENE_ID " + s.scene + "\n#define MATID " + mat));
    return SCENES[key];
  }
  var RT = { scene: target(SW, SHt), b4: target(W >> 2, H >> 2), b4t: target(W >> 2, H >> 2), b8: target(W >> 3, H >> 3), b8t: target(W >> 3, H >> 3) };
  var T_FX = tex(W, H, false), T_TX = tex(W, H, false);

  // ------------------------------------------------------------------ the logo: the SideForge anvil (sideforge.ch/logo.png, traced)
  var ANVIL = ["M7 86 L93 86 L93 134 L48 134 Q14 130 7 86 Z",
               "M107 71 L285 71 Q289 71 289 75 L289 94 A81 86 0 0 0 208 180 L208 188 L249 188 Q253 188 253 192 L253 211 Q253 215 249 215 L93 215 Q89 215 89 211 L89 192 Q89 188 93 188 L134 188 L134 166 Q133 151 118 150 Q104 149 103 144 L103 75 Q103 71 107 71 Z"];
  var ANVIL_P = new Path2D(ANVIL.join(" ")), LOGO_RED = "#f84e45";
  // bake a signed distance field of it (world units, 1.9 wide) for the 3D anvil and the paper impression
  var LX0 = -20, LY0 = 40, TPU = 2, LW = 680, LH = 420;
  var T_LOGO = (function () {
    var segs = [];
    ANVIL.forEach(function (d) {
      var pe = document.createElementNS("http://www.w3.org/2000/svg", "path"); pe.setAttribute("d", d);
      var L = pe.getTotalLength(), n = Math.ceil(L / 1.5), prev = null;
      for (var i = 0; i <= n; i++) { var q = pe.getPointAtLength(L * i / n); if (prev) segs.push([prev.x, prev.y, q.x, q.y]); prev = q; }
    });
    var c = document.createElement("canvas"); c.width = LW; c.height = LH;
    var x = c.getContext("2d"); x.setTransform(TPU, 0, 0, TPU, -LX0 * TPU, -LY0 * TPU); x.fillStyle = "#000"; x.fill(ANVIL_P);
    var alpha = x.getImageData(0, 0, LW, LH).data, S = 1.9 / 282, out = new Float32Array(LW * LH);
    for (var j = 0; j < LH; j++) for (var i = 0; i < LW; i++) {
      var px = LX0 + i / TPU, py = LY0 + j / TPU, best = 1e9;
      for (var k = 0; k < segs.length; k++) {
        var g = segs[k], ex = g[2] - g[0], ey = g[3] - g[1], wx = px - g[0], wy = py - g[1];
        var h = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey + 1e-9)));
        var dx = wx - ex * h, dy = wy - ey * h, dd = dx * dx + dy * dy; if (dd < best) best = dd;
      }
      var inside = alpha[(j * LW + i) * 4 + 3] > 127;
      out[j * LW + i] = Math.sqrt(best) * S * (inside ? -1 : 1);   // row j = logo y: sampled as-is, no flip
    }
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, LW, LH, 0, gl.RED, gl.FLOAT, out);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  })();

  function pass(pr, rt, set) {
    gl.useProgram(pr.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, rt ? rt.f : null);
    gl.viewport(0, 0, rt ? rt.w : W, rt ? rt.h : H);
    set(pr.u); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function bindT(u, name, unit, t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(u[name], unit); }
  function blur(src, tmp, dx, dy) {
    pass(P.blur, tmp, function (u) { bindT(u, "uS", 0, src.t); gl.uniform2f(u.uDir, dx / src.w, 0); });
    pass(P.blur, src, function (u) { bindT(u, "uS", 0, tmp.t); gl.uniform2f(u.uDir, 0, dy / src.h); });
  }
  function upload(t, c) {
    gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  // ------------------------------------------------------------------ time
  var B = TL.B, shots = TL.shots;
  function shotAt(t) { for (var i = shots.length - 1; i >= 0; i--) if (t >= shots[i].t0 - 1e-6) return shots[i]; return shots[0]; }
  function localTime(s, x) {
    if (s.spd === "punch") return x * .5 + .42 * (1 - Math.exp(-x * 6));
    if (s.spd === "slow") return x * .15;
    return x;
  }
  function ease(s, p) {
    p = clamp01(p);
    if (s.ease === "expo") return p >= 1 ? 1 : (1 - Math.pow(2, -9 * p)) / (1 - Math.pow(2, -9));
    if (s.ease === "hook") return p * p * (3 - 2 * p) * .35 + (1 - Math.pow(1 - p, 4)) * .65;
    if (s.ease === "inout") return p * p * (3 - 2 * p);
    if (s.ease === "lin") return p;
    return 1 - Math.pow(1 - p, 3);
  }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function eOut(x) { x = clamp01(x); return 1 - Math.pow(1 - x, 3); }

  // ------------------------------------------------------------------ dust in the light, soft out-of-focus lights
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function drawFx(s, lt) {
    fx.globalCompositeOperation = "lighter";
    s.fx.forEach(function (spec, j) {
      var a = spec.split(":"), kind = a[0], r = rng(s.i * 977 + j * 131 + 7), N = +a[1];
      for (var m = 0; m < N; m++) {
        var X, Y, R, al, c;
        if (kind === "dust") {
          var x0 = r(), ph = r(), spd = .004 + r() * .012, sz = (.7 + r() * 1.5) * K;
          Y = (1.05 - ((ph + lt * spd) % 1) * 1.1) * H;
          X = (x0 + .02 * Math.sin(lt * (.3 + r() * .5) + ph * 20)) * W;
          R = sz; al = .14 * (.6 + .4 * Math.sin(lt * (1 + r() * 2) + ph * 40)); c = "255,238,220";
        } else {
          X = (r() + (r() - .5) * .01 * lt) * W; Y = (r() - .006 * lt) * H;
          R = (30 + r() * 70) * K; al = .025 + r() * .05; c = r() > .6 ? "255,214,170" : "255,170,110";
        }
        var g = fx.createRadialGradient(X, Y, kind === "dust" ? 0 : R * .75, X, Y, R * (kind === "dust" ? 2.5 : 1));
        g.addColorStop(0, "rgba(" + c + "," + al.toFixed(3) + ")"); g.addColorStop(1, "rgba(" + c + ",0)");
        fx.fillStyle = g; fx.beginPath(); fx.arc(X, Y, R * (kind === "dust" ? 2.5 : 1), 0, Math.PI * 2); fx.fill();
      }
    });
    fx.globalCompositeOperation = "source-over";
  }

  // ------------------------------------------------------------------ words
  var SERIF = "Newsreader", MONO = "JetBrains Mono";
  function font(ctx, w, px, fam) { ctx.font = w + " " + px.toFixed(1) + "px \"" + (fam || SERIF) + "\""; }
  var WORD_PX = 0;
  function wordPx() {
    if (!WORD_PX) { font(tx, 500, 100); tx.letterSpacing = "4px"; WORD_PX = Math.min(150 * K, 100 * 900 * K / tx.measureText("EVERYTHING.").width); }
    return WORD_PX;
  }
  // a word stands on the horizon of its shot, and rides it as the camera pushes in
  function drawWord(s, E, zoom) {
    var z = s.b[2] + (s.b[3] - s.b[2]) * E, arc = s.a[1] + (s.a[2] - s.a[1]) * E;
    var y = H / 2 - arc * z * H * zoom;
    var px = wordPx() * (1 + .04 * E) * Math.min(1, .6 + .4 * z) * zoom;
    font(tx, 500, px); tx.letterSpacing = (px * .04).toFixed(1) + "px";
    tx.textAlign = "center"; tx.textBaseline = "alphabetic";
    tx.fillStyle = s.light ? "#1c1a17" : "#f3ede2";
    tx.shadowColor = s.light ? "rgba(0,0,0,0)" : "rgba(0,0,0,.25)"; tx.shadowBlur = 18 * K;
    tx.fillText(s.word, W / 2 + px * .02, y - px * .16);
    tx.shadowBlur = 0;
  }
  function drawForge(T, t) {
    var out = clamp01((t - (T.t1 - .5)) / .5), px = 86 * K, lh = px * 1.18, y0 = .735 * H;
    font(tx, 500, px); tx.letterSpacing = (px * .04).toFixed(1) + "px"; tx.textAlign = "left";
    var lines = [[0, 1], [2, 3]];
    lines.forEach(function (ln, li) {
      var words = ln.map(function (i) { return T.words[i]; }), gap = px * .32;
      var ws = words.map(function (w) { return tx.measureText(w).width; });
      var x = W / 2 - (ws[0] + gap + ws[1]) / 2;
      ln.forEach(function (i, k) {
        var a = eOut((t - T.at[i]) / .35);
        if (a > 0) {
          tx.fillStyle = "rgba(243,237,226," + (a * (1 - out)).toFixed(3) + ")";
          tx.fillText(T.words[i], x, y0 + li * lh + (1 - a) * 10 * K);
        }
        x += ws[k] + gap;
      });
    });
  }
  function drawEnd(T, t) {
    var x = t - T.t0;
    var land = 1 + .22 * Math.pow(1 - clamp01(x / .3), 3);          // the stamp comes down
    var sc = 440 / 282 * K * (1 + .03 * x / 5) * land;
    tx.save();
    tx.globalAlpha = clamp01(x / .08) * .97;
    tx.translate(W / 2 - 148 * sc, .405 * H - 142.5 * sc); tx.scale(sc, sc);
    tx.fillStyle = LOGO_RED; tx.fill(ANVIL_P);
    tx.restore();
    var k = eOut((x - .35) / .9);
    font(tx, 500, 118 * K); tx.letterSpacing = ((.06 + .05 * (1 - k)) * 118 * K).toFixed(1) + "px"; tx.textAlign = "center";
    tx.fillStyle = "rgba(28,26,23," + k.toFixed(3) + ")";
    tx.fillText("SIDEFORGE", W / 2 + .03 * 118 * K, .587 * H);
    var k2 = eOut((x - .85) / .7);
    font(tx, 500, 34 * K, MONO); tx.letterSpacing = (11 * K).toFixed(1) + "px";
    tx.fillStyle = "rgba(92,86,79," + k2.toFixed(3) + ")";
    tx.fillText("BUILT DIFFERENT.", W / 2 + 5.5 * K, .632 * H + (1 - k2) * 8 * K);
    tx.letterSpacing = "0px";
  }
  function drawText(t, s, E, zoom) {
    tx.save();
    if (s.word) drawWord(s, E, zoom);
    TL.TEXT.forEach(function (T) {
      if (t < T.t0 || t >= T.t1) return;
      if (T.kind === "forge") drawForge(T, t); else drawEnd(T, t);
    });
    tx.restore();
  }

  // ------------------------------------------------------------------ camera feel: a push on the cut, a knock on the hits
  function wob(x) { return Math.sin(x * 1.7) * .5 + Math.sin(x * 3.1 + 1.3) * .3 + Math.sin(x * 7.3 + 4.1) * .2; }
  function post(t, s, x) {
    var o = { zoom: 1, rad: 0, dir: [0, 0], shake: [0, 0], flash: 0, flashC: [1, .97, .92], ca: .0008, fade: 1 };
    var pz = s.punch - 1;
    o.zoom = 1 + pz * Math.pow(1 - clamp01(x / .4), 3);
    o.rad = pz * Math.pow(1 - clamp01(x / .2), 2) * .6;
    var imp = 0;
    TL.IMPACTS.forEach(function (I) {
      var d = t - I[0]; if (d < 0 || d > 2) return;
      imp += I[1] * Math.exp(-d * 7);
      var fl = I[2] === "word" ? 0 : I[2] === "final" ? .5 : I[0] === 0 ? 0 : .35;
      o.flash = Math.max(o.flash, fl * I[1] * Math.exp(-d * 16));
    });
    o.shake = [wob(t * 30) * imp * .005, wob(t * 33 + 5) * imp * .004];
    o.ca += imp * .003;
    var rem = s.t0 + s.dur - t;
    if (s.whip && rem < .1) { var w = Math.pow((.1 - rem) / .1, 2) * .12; o.dir = [s.whip[0] * w, s.whip[1] * w]; }
    var prev = shots[s.i - 1];
    if (prev && prev.whip && x < .1) { var w2 = Math.pow(1 - x / .1, 2) * .12; o.dir = [prev.whip[0] * w2, prev.whip[1] * w2]; }
    if (s.fadeOut) o.fade = 1 - clamp01((t - s.fadeOut[0]) / (s.fadeOut[1] - s.fadeOut[0]));
    return o;
  }

  // ------------------------------------------------------------------ one frame
  window.renderAt = function (t) {
    var s = shotAt(t), x = t - s.t0, p = x / s.dur, E = ease(s, p);
    var lt = localTime(s, x);
    var o = post(t, s, x);
    pass(sceneProg(s), RT.scene, function (u) {
      gl.uniform2f(u.uRes, SW, SHt); gl.uniform1f(u.uT, t); gl.uniform1f(u.uL, lt); gl.uniform1f(u.uP, p);
      gl.uniform1f(u.uE, E); gl.uniform1f(u.uDur, s.dur); gl.uniform1f(u.uSeed, (s.i * 7.31) % 13);
      gl.uniform1f(u.uRise, s.rise ? x / s.rise : -1);
      gl.uniform1i(u.uAA, s.scene === TL.SCENES.MARK ? 2 : 1);
      gl.uniform4fv(u.uA, s.a); gl.uniform4fv(u.uB, s.b); gl.uniform4fv(u.uC, s.c);
      bindT(u, "uLogo", 0, T_LOGO); gl.uniform4f(u.uLogoM, LX0, LY0, TPU, LW); gl.uniform1f(u.uLogoH, LH);
    });
    var T0 = performance.now(); if (window.PROF) { var q = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, q); window.PROF.scene = performance.now() - window.PROF.t; }
    fx.clearRect(0, 0, W, H); drawFx(s, lt);
    tx.clearRect(0, 0, W, H); drawText(t, s, E, o.zoom);
    upload(T_FX, fxc); upload(T_TX, txc);
    if (window.PROF) { var q2 = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, q2); window.PROF.canv = performance.now() - T0; }
    pass(P.bright, RT.b4, function (u) {
      bindT(u, "uS", 0, RT.scene.t); bindT(u, "uF", 1, T_FX);
      gl.uniform1f(u.uZoom, o.zoom); gl.uniform2f(u.uShake, o.shake[0], o.shake[1]);
    });
    blur(RT.b4, RT.b4t, 1, 1); blur(RT.b4, RT.b4t, 2, 2);
    pass(P.blur, RT.b8, function (u) { bindT(u, "uS", 0, RT.b4.t); gl.uniform2f(u.uDir, 0, 0); });
    blur(RT.b8, RT.b8t, 1.5, 1.5); blur(RT.b8, RT.b8t, 3, 3);
    if (window.PROF) { var q3 = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, q3); window.PROF.bloom = performance.now() - window.PROF.t; }
    pass(P.fin, null, function (u) {
      bindT(u, "uS", 0, RT.scene.t); bindT(u, "uB4", 1, RT.b4.t); bindT(u, "uB8", 2, RT.b8.t);
      bindT(u, "uF", 3, T_FX); bindT(u, "uX", 4, T_TX);
      gl.uniform1f(u.uZoom, o.zoom); gl.uniform1f(u.uRad, o.rad); gl.uniform2f(u.uDir, o.dir[0], o.dir[1]);
      gl.uniform2f(u.uShake, o.shake[0], o.shake[1]); gl.uniform1f(u.uCA, o.ca); gl.uniform1f(u.uFlash, o.flash);
      gl.uniform3f(u.uFlashC, o.flashC[0], o.flashC[1], o.flashC[2]); gl.uniform1f(u.uFade, o.fade);
      gl.uniform1f(u.uExp, 1.0); gl.uniform1f(u.uT, t); gl.uniform1f(u.uGrain, .05); gl.uniform2f(u.uRes, W, H);
    });
    gl.finish();
    if (window.PROF) { var px = new Uint8Array(4); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); window.PROF.fin = performance.now() - window.PROF.t; }
    return s.i;
  };

  Promise.all([document.fonts.load("500 100px Newsreader"), document.fonts.load("500 27px \"JetBrains Mono\"")])
    .then(function () { window.renderAt(0); window.ready = true; });
})();
