/* Film — a tiny real-time WebGL player for full-screen fragment shaders.
   Each film is one shader plus a timeline: chapters, camera and uniforms are computed
   here in JS per frame, so the shader stays a pure function of (pixel, time, uniforms).

   Markup:
     <figure class="film" data-film="venura"> <img class="film__poster"> <canvas></canvas> ... </figure>
   Register:
     Film.define("venura", { frag, duration, chapters:[{t, n, title, text}], uniforms(t) })
   Capture (for rendering MP4s headless):
     ?capture  → preserveDrawingBuffer, fixed size, window.__film.renderAt(t) */
(function () {
  "use strict";

  var defs = {};
  var capture = /[?&]capture\b/.test(location.search);
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function Player(el, def) {
    this.el = el;
    this.def = def;
    this.canvas = el.querySelector("canvas");
    this.t = def.start || 0;
    this.playing = !reduced;
    this.visible = true;
    // phones and small machines start lower; adapt() raises it again if frames stay fast
    var coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
    this.scale = coarse || (navigator.hardwareConcurrency || 8) <= 4 ? 0.7 : 1;
    this.frames = [];
    this.last = 0;
    this.chapter = -1;
    this.onChapter = null;
    if (!this.init()) {
      el.classList.add("film--fallback");
      return;
    }
    this.ui();
    this.observe();
    el.classList.toggle("is-paused", !this.playing);
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  Player.prototype.init = function () {
    var opts = { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false,
                 preserveDrawingBuffer: capture, powerPreference: "high-performance" };
    var gl = this.canvas.getContext("webgl", opts) || this.canvas.getContext("experimental-webgl", opts);
    if (!gl) return false;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, this.def.frag);
    if (!vs || !fs) return false;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.gl = gl;
    this.prog = prog;
    this.loc = {};
    return true;
  };

  Player.prototype.u = function (name) {
    if (!(name in this.loc)) this.loc[name] = this.gl.getUniformLocation(this.prog, name);
    return this.loc[name];
  };

  Player.prototype.resize = function () {
    var r = this.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, capture ? 1 : 1.5);
    var w = Math.max(2, Math.round(r.width * dpr * this.scale));
    var h = Math.max(2, Math.round(r.height * dpr * this.scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.gl.viewport(0, 0, w, h);
  };

  Player.prototype.draw = function () {
    var gl = this.gl, t = this.t, def = this.def;
    this.resize();
    gl.uniform2f(this.u("u_res"), this.canvas.width, this.canvas.height);
    gl.uniform1f(this.u("u_time"), t);
    var extra = def.uniforms ? def.uniforms(t, this.canvas.width / this.canvas.height) : {};
    for (var k in extra) {
      var v = extra[k], l = this.u(k);
      if (l === null) continue;
      if (typeof v === "number") gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else if (v.length === 4) gl.uniform4fv(l, v);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.syncUI();
    if (!this.el.classList.contains("is-live")) this.el.classList.add("is-live");
  };

  /* keep frame time under ~24ms by trading resolution; never go below 45% */
  Player.prototype.adapt = function (dt) {
    if (capture) return;
    this.frames.push(dt);
    if (this.frames.length < 20) return;
    var avg = this.frames.reduce(function (a, b) { return a + b; }, 0) / this.frames.length;
    this.frames.length = 0;
    if (avg > 24 && this.scale > 0.45) this.scale = Math.max(0.45, this.scale * 0.85);
    else if (avg < 15 && this.scale < 1) this.scale = Math.min(1, this.scale * 1.1);
  };

  Player.prototype.loop = function (now) {
    requestAnimationFrame(this.loop);
    if (capture) return;
    var dt = this.last ? Math.min(now - this.last, 100) : 16;
    this.last = now;
    if (!this.visible) return;
    if (this.playing) {
      this.t = (this.t + dt / 1000) % this.def.duration;
      this.adapt(dt);
      this.draw();
    } else if (!this.drawnOnce) {
      this.draw();
    }
    this.drawnOnce = true;
  };

  Player.prototype.seek = function (t) {
    this.t = ((t % this.def.duration) + this.def.duration) % this.def.duration;
    this.draw();
  };

  Player.prototype.toggle = function (force) {
    this.playing = typeof force === "boolean" ? force : !this.playing;
    this.el.classList.toggle("is-paused", !this.playing);
    var b = this.el.querySelector(".film__play");
    if (b) b.setAttribute("aria-label", this.playing ? "Pause film" : "Play film");
  };

  Player.prototype.chapterAt = function (t) {
    var ch = this.def.chapters || [], i = 0;
    for (var k = 0; k < ch.length; k++) if (t >= ch[k].t) i = k;
    return i;
  };

  Player.prototype.ui = function () {
    var self = this, ch = this.def.chapters || [];
    var play = this.el.querySelector(".film__play");
    if (play) play.addEventListener("click", function () { self.toggle(); });
    var list = this.el.querySelector(".film__chapters");
    if (list) {
      list.innerHTML = "";
      ch.forEach(function (c, i) {
        var b = document.createElement("button");
        b.className = "film__ch";
        b.type = "button";
        b.innerHTML = "<i><b></b></i><span>" + c.n + " " + c.title + "</span>";
        b.setAttribute("aria-label", "Chapter " + (i + 1) + ": " + c.title);
        b.addEventListener("click", function () { self.seek(c.t + 0.001); self.toggle(true); });
        list.appendChild(b);
      });
      this.bars = [].slice.call(list.querySelectorAll(".film__ch"));
    }
    this.cap = this.el.querySelector(".film__caption");
  };

  Player.prototype.syncUI = function () {
    var ch = this.def.chapters || [];
    if (!ch.length) return;
    var i = this.chapterAt(this.t);
    var start = ch[i].t, end = i + 1 < ch.length ? ch[i + 1].t : this.def.duration;
    var p = (this.t - start) / (end - start);
    if (this.bars) this.bars.forEach(function (b, k) {
      b.firstChild.firstChild.style.transform = "scaleX(" + (k < i ? 1 : k === i ? p : 0) + ")";
      b.classList.toggle("is-on", k === i);
    });
    if (i !== this.chapter) {
      this.chapter = i;
      var c = ch[i], cap = this.cap, self = this;
      if (cap && c.title) {
        cap.classList.add("is-swap");
        clearTimeout(this._sw);
        this._sw = setTimeout(function () {
          cap.querySelector(".n").textContent = c.n + " / " + String(ch.length).padStart(2, "0");
          cap.querySelector(".t").textContent = c.title;
          cap.querySelector(".s").textContent = c.text || "";
          cap.classList.remove("is-swap");
        }, capture ? 0 : 380);
      }
      if (self.onChapter) self.onChapter(i, c);
      this.el.dispatchEvent(new CustomEvent("chapter", { detail: { index: i, chapter: c } }));
    }
  };

  Player.prototype.observe = function () {
    var self = this;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        self.last = 0;
      }, { rootMargin: "80px" }).observe(this.el);
    }
    document.addEventListener("visibilitychange", function () { self.last = 0; });
    window.addEventListener("resize", function () { if (!self.playing) self.draw(); });
  };

  var Film = {
    define: function (name, def) { defs[name] = def; },
    mount: function (el) {
      var def = defs[el.getAttribute("data-film")];
      if (!def) return null;
      var p = new Player(el, def);
      el.__player = p;
      if (capture) window.__film = { player: p, renderAt: function (t) { p.t = t; p.draw(); p.gl.finish(); } };
      return p;
    },
    // shared helpers for timelines
    ease: function (x) { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    mix3: function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; },
    /* fade to/from black-ish around chapter cuts: 0 = clear, 1 = covered */
    cut: function (t, cuts, w) {
      var f = 0;
      for (var i = 0; i < cuts.length; i++) {
        var d = Math.abs(t - cuts[i]);
        if (d < w) f = Math.max(f, 1 - d / w);
      }
      return f * f * (3 - 2 * f);
    },
    capture: capture,
    reduced: reduced
  };

  window.Film = Film;
})();
