/* Launch hero — a collage of material photographs around a window onto one large image.
   Intro: black → the tiles are laid down one by one → "Introducing" → the window opens to
   (almost) full width, the materials stay as narrow strips at the edges → the title is set.
   Afterwards the image keeps moving slowly. Everything is procedural (one fragment shader);
   each page supplies its own centre image and its own four materials.

   Markup:
     <section class="lh" data-hero="venura"> <canvas class="lh__gl"></canvas> … overlay … </section>
   Register:
     Hero.define("venura", { center: "vec3 center(vec2 uv, float t){…}", tiles: [lt, lb, rt, rb] })
   Capture: ?capture → window.__hero.renderAt(t) */
(function () {
  "use strict";
  var defs = {};
  var capture = /[?&]capture\b/.test(location.search);
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var COMMON = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uTime; uniform float uFade;",
    "uniform vec4 uRect[5]; uniform float uReveal[5]; uniform float uMat[4];",
    "float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}",
    "float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
    "vec2 h22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}",
    "float n2(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}",
    "float n1(float x){float i=floor(x);float f=fract(x);return mix(h11(i),h11(i+1.),f*f*(3.-2.*f));}",
    "const mat2 M2=mat2(.8,-.6,.6,.8);",
    "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.97;}",
    "float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.875;}",
    "float ridged(vec2 p){float s=0.,a=.5,w=1.;for(int i=0;i<5;i++){float n=1.-abs(n2(p)*2.-1.);n*=n;s+=a*n*w;w=clamp(n*1.6,0.,1.);p=M2*p*2.07+3.1;a*=.5;}return s;}",
    "vec2 vor(vec2 p){vec2 n=floor(p),f=fract(p);float d1=8.,d2=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 r=g+h22(n+g)-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return vec2(sqrt(d1),sqrt(d2));}",
    "float grain(vec2 p){return h12(floor(p)+fract(uTime*7.)*97.)-.5;}",

    // ---------------------------------------------------------------- materials
    // every material is shot like a photo: a light from the upper left, fine grain, lens falloff
    "vec3 mBlack(vec2 p){float s=n2(p*.9)*.5+n2(p*3.1)*.5;return vec3(.035,.032,.03)*(.8+.5*s)+vec3(.05)*step(.985,h12(floor(p*.5)));}",
    "vec3 mYellow(vec2 p){",
    "  vec3 c=vec3(.95,.73,.13);",
    "  float mot=fbm(p*.004);c*=.9+.16*mot;",
    "  float fib=n2(vec2(p.x*.02,p.y*.35))*.6+n2(p*.3)*.4;c*=.95+.07*fib;",
    "  float crease=smoothstep(2.5,0.,abs(p.x*.34+p.y*.94-520.-40.*n1(p.y*.01)));c*=1.-.12*crease;",
    "  c+=vec3(.08,.06,0.)*smoothstep(1.5,0.,abs(p.x*.34+p.y*.94-523.))*.8;",
    "  for(int i=0;i<4;i++){float fi=float(i);vec2 a=vec2(h11(fi*3.1)*300.,h11(fi*7.7)*900.);vec2 d=normalize(vec2(h11(fi)-.5,1.));float along=dot(p-a,d);float off=abs(dot(p-a,vec2(-d.y,d.x))+3.*sin(along*.05));",
    "    c=mix(c,vec3(.32,.24,.1),smoothstep(1.4,.2,off)*step(abs(along),40.+80.*h11(fi+2.))*.7);}",
    "  float tape=step(abs(p.y-140.),26.)*smoothstep(0.,6.,p.x-30.);c=mix(c,c*1.06+vec3(.05),tape*.45);",
    "  return c;",
    "}",
    "float hSand(vec2 p){vec2 q=p*.01;q+=vec2(fbm3(q*.6),fbm3(q*.6+5.))*1.4;float r=sin(q.y*8.+q.x*1.1+fbm3(q*2.)*2.5);return r*.5+.5+.15*n2(p*.2);}",
    "vec3 mSand(vec2 p){",
    "  float e=1.5;float h=hSand(p),hx=hSand(p+vec2(e,0.)),hy=hSand(p+vec2(0.,e));",
    "  vec3 n=normalize(vec3(-(hx-h)*9.,-(hy-h)*9.,1.));",
    "  float l=clamp(dot(n,normalize(vec3(-.6,-.7,.45))),0.,1.);",
    "  vec3 c=vec3(.78,.7,.58)*(.18+1.05*l);",
    "  c*=.9+.18*n2(p*1.1)+.06*(h12(floor(p))-.5);",
    "  return c;",
    "}",
    "float hRock(vec2 p){float x=p.x*.028+fbm3(vec2(p.y*.004,p.x*.008))*2.4;return ridged(vec2(x,p.y*.005))+.08*n2(p*.3);}",
    "vec3 mRock(vec2 p){",
    "  float e=1.5;float h=hRock(p),hx=hRock(p+vec2(e,0.)),hy=hRock(p+vec2(0.,e));",
    "  vec3 n=normalize(vec3(-(hx-h)*14.,-(hy-h)*14.,1.));",
    "  float l=clamp(dot(n,normalize(vec3(-.7,-.5,.5))),0.,1.);",
    "  vec3 alb=mix(vec3(.55,.16,.07),vec3(.86,.38,.15),smoothstep(.2,.9,h));",
    "  vec3 c=alb*(.15+1.1*l)*mix(.35,1.,smoothstep(.05,.35,h));",
    "  float top=smoothstep(.3,.0,p.y/uRes.y-.03*n1(p.x*.05));",
    "  float crust=smoothstep(.45,.7,n2(p*.18))*top;c=mix(c,vec3(.93,.86,.7)*(.5+.6*l),crust);",
    "  return c;",
    "}",
    "vec3 mKraft(vec2 p){",
    "  vec3 c=vec3(.66,.5,.33)*(.88+.18*fbm(p*.006));",
    "  c*=.94+.1*n2(vec2(p.x*.03,p.y*.5));",
    "  c=mix(c,c*.7,step(.992,h12(floor(p*.3))));",
    "  float line=smoothstep(1.2,.2,abs(mod(p.y+8.*n1(p.x*.01),64.)-32.));c=mix(c,vec3(.25,.2,.15),line*.35*step(.3,n1(p.x*.02+floor(p.y/64.))));",
    "  return c;",
    "}",
    "vec3 mSteel(vec2 p){",
    "  float b=n2(vec2(p.x*.004,p.y*1.4))*.6+n2(vec2(p.x*.02,p.y*3.))*.4;",
    "  vec3 c=vec3(.52,.54,.56)*(.8+.35*b);",
    "  c+=vec3(.25)*exp(-pow((p.x/uRes.x*4.-p.y/uRes.y*1.2-.4)*2.2,2.));",
    "  return c;",
    "}",
    "vec3 mTopo(vec2 p){",
    "  vec3 c=vec3(.93,.91,.85)*(.95+.06*fbm(p*.01));",
    "  float h=fbm(p*.0025)*18.;float l=abs(fract(h)-.5);",
    "  c=mix(c,vec3(.62,.42,.25),smoothstep(.06,.0,l)*.7);",
    "  float big=abs(fract(h/5.)-.5);c=mix(c,vec3(.5,.32,.18),smoothstep(.02,.0,big)*.6);",
    "  c=mix(c,vec3(.55,.7,.82),smoothstep(.42,.38,fbm(p*.002+3.))*.5);",
    "  return c;",
    "}",
    "vec3 mGranite(vec2 p){",
    "  float t=n2(p*.07)*.6+n2(p*.19)*.4;",
    "  vec3 c=mix(vec3(.8,.78,.75),vec3(.45,.43,.43),smoothstep(.35,.6,t));",
    "  float bl=smoothstep(.62,.7,n2(p*.23+7.));c=mix(c,vec3(.1,.1,.11),bl);",
    "  float pk=smoothstep(.7,.78,n2(p*.13+3.));c=mix(c,vec3(.76,.6,.54),pk*.8);",
    "  c*=.88+.2*n2(p*1.3);c+=vec3(.15)*step(.985,h12(floor(p*.7)));",
    "  return c;",
    "}",
    "vec3 mGraph(vec2 p){",
    "  vec3 c=vec3(.95,.95,.92)*(.96+.05*fbm(p*.01));",
    "  vec2 g=abs(fract(p/24.)-.5)*24.;c=mix(c,vec3(.55,.7,.72),smoothstep(1.,0.,min(g.x,g.y))*.5);",
    "  vec2 G=abs(fract(p/120.)-.5)*120.;c=mix(c,vec3(.4,.58,.62),smoothstep(1.2,0.,min(G.x,G.y))*.6);",
    "  float ink=smoothstep(2.,.5,abs(p.y-uRes.y*.55+120.*sin(p.x*.012)+40.*sin(p.x*.041)));c=mix(c,vec3(.12,.16,.35),ink*.8);",
    "  return c;",
    "}",
    "vec3 mPatina(vec2 p){",
    "  float f=fbm(p*.006),g=fbm(p*.02+4.);",
    "  vec3 cu=vec3(.5,.3,.18)*(.75+.4*n2(p*.2));",
    "  vec3 pa=mix(vec3(.32,.5,.46),vec3(.55,.68,.62),g);",
    "  vec3 c=mix(cu,pa,smoothstep(.45,.62,f+.2*g));",
    "  c*=.82+.3*n2(p*.9)+.08*n2(p*3.);",
    "  return c;",
    "}",
    "vec3 mIce(vec2 p){",
    "  vec2 v=vor(p*.02);float cr=v.y-v.x;",
    "  vec3 c=mix(vec3(.55,.68,.8),vec3(.88,.93,.97),fbm(p*.01));",
    "  c=mix(vec3(.96,.98,1.),c,smoothstep(0.,.06,cr));",
    "  c+=vec3(.9)*step(.996,h12(floor(p*.4)));",
    "  return c;",
    "}",
    "vec3 material(float id,vec2 p){",
    "  if(id<.5)return mBlack(p);if(id<1.5)return mYellow(p);if(id<2.5)return mSand(p);if(id<3.5)return mRock(p);",
    "  if(id<4.5)return mKraft(p);if(id<5.5)return mSteel(p);if(id<6.5)return mTopo(p);if(id<7.5)return mGranite(p);",
    "  if(id<8.5)return mGraph(p);if(id<9.5)return mPatina(p);return mIce(p);",
    "}",
    "vec3 center(vec2 uv,float t);",

    "void main(){",
    "  vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y);",   // pixels, y down
    "  vec3 col=mBlack(p);",
    "  for(int i=0;i<5;i++){",
    "    vec4 r=uRect[i];",
    "    if(p.x<r.x||p.x>=r.z||p.y<r.y||p.y>=r.w)continue;",
    "    float rv=uReveal[i];",
    "    float edge=r.y+(r.w-r.y)*rv+6.*(n1(p.x*.08+float(i)*9.)-.5);",
    "    if(p.y>edge)continue;",
    "    vec3 c;",
    "    if(i==2){",
    "      vec2 uv=(p-.5*uRes)/uRes.y;uv.y=-uv.y;",
    "      c=center(uv,uTime);",
    "    }else{",
    "      float id=i==0?uMat[0]:i==1?uMat[1]:i==3?uMat[2]:uMat[3];",
    "      c=material(id,p+vec2(float(i)*137.,float(i)*71.));",
    "      vec2 q=(p-r.xy)/(r.zw-r.xy);",
    "      c*=.82+.18*smoothstep(0.,.35,q.x)*smoothstep(1.,.65,q.x)*smoothstep(0.,.2,q.y)+.1;",   // light falloff per photo
    "    }",
    "    float sh=min(min(p.x-r.x,r.z-p.x),min(p.y-r.y,edge-p.y));",
    "    c*=.72+.28*smoothstep(0.,5.,sh);",                   // tiles sit on the black board
    "    col=c;",
    "  }",
    "  col+=grain(gl_FragCoord.xy)*.045;",
    "  col*=uFade;",
    "  gl_FragColor=vec4(clamp(col,0.,1.),1.);",
    "}"
  ].join("\n");

  function S(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }
  function E(x) { x = Math.min(1, Math.max(0, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lin(t, a, b) { return Math.min(1, Math.max(0, (t - a) / (b - a))); }

  /* the choreography: returns tile rects (px), reveals, fade, and the text states */
  function timeline(t, W, H, mobile) {
    var open = E(lin(t, 3.4, 4.8));
    var lw = lerp(mobile ? .2 : .27, mobile ? .035 : .024, open) * W;
    var rw = lerp(mobile ? .2 : .23, mobile ? .035 : .032, open) * W;
    var cx0 = lw, cx1 = W - rw;
    var ls = lerp(.52, .46, open) * H, rs = lerp(.38, .42, open) * H;
    var rects = [
      [0, 0, lw, ls], [0, ls, lw, H], [cx0, 0, cx1, H], [cx1, 0, W, rs], [cx1, rs, W, H]
    ];
    var order = [0.7, 1.35, 1.0, 0.95, 1.2];
    var rev = order.map(function (a) { return E(lin(t, a, a + .55)); });
    return {
      rects: rects, reveal: rev,
      fade: S(lin(t, .15, .7)),
      intro: S(lin(t, 1.7, 2.2)) * (1 - S(lin(t, 3.2, 3.6))),
      title: S(lin(t, 4.3, 5.0)),
      meta: S(lin(t, 4.8, 5.5))
    };
  }

  function Hero(el, def) {
    this.el = el; this.def = def;
    this.canvas = el.querySelector(".lh__gl");
    this.t = capture ? 8 : (reduced ? 8 : 0);
    this.scale = 1;
    this.last = 0; this.frames = [];
    var gl = this.canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, preserveDrawingBuffer: capture });
    if (!gl) { el.classList.add("lh--static"); this.apply(timeline(99, 1, 1, false)); return; }
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
    var vs = sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}");
    var fs = sh(gl.FRAGMENT_SHADER, COMMON + "\n" + def.center);
    if (!vs || !fs) { el.classList.add("lh--static"); return; }
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.gl = gl; this.pr = pr;
    this.u = {};
    var self = this;
    ["uRes", "uTime", "uFade", "uRect", "uReveal", "uMat"].forEach(function (n) { self.u[n] = gl.getUniformLocation(pr, n); });
    gl.uniform1fv(this.u.uMat, def.tiles);
    this.loop = this.loop.bind(this);
    this.visible = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { self.visible = es[0].isIntersecting; self.last = 0; }).observe(el);
    if (!capture) requestAnimationFrame(this.loop);
  }
  Hero.prototype.apply = function (s) {
    var el = this.el;
    el.style.setProperty("--lh-intro", s.intro.toFixed(3));
    el.style.setProperty("--lh-title", s.title.toFixed(3));
    el.style.setProperty("--lh-meta", s.meta.toFixed(3));
    el.classList.toggle("is-set", s.title > .5);
  };
  Hero.prototype.draw = function () {
    var gl = this.gl, r = this.el.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, capture ? 1 : 1.5) * this.scale;
    var W = Math.max(2, Math.round(r.width * dpr)), H = Math.max(2, Math.round(r.height * dpr));
    if (this.canvas.width !== W || this.canvas.height !== H) { this.canvas.width = W; this.canvas.height = H; }
    gl.viewport(0, 0, W, H);
    var s = timeline(this.t, W, H, r.width < 720);
    var flat = [], rv = [];
    s.rects.forEach(function (q) { flat.push(q[0], q[1], q[2], q[3]); });
    gl.uniform2f(this.u.uRes, W, H);
    gl.uniform1f(this.u.uTime, this.t);
    gl.uniform1f(this.u.uFade, s.fade);
    gl.uniform4fv(this.u.uRect, flat);
    gl.uniform1fv(this.u.uReveal, s.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.apply(s);
  };
  Hero.prototype.loop = function (now) {
    requestAnimationFrame(this.loop);
    var dt = this.last ? Math.min(now - this.last, 100) : 16;
    this.last = now;
    if (!this.visible || document.hidden) return;
    if (!reduced) this.t += dt / 1000;
    this.frames.push(dt);
    if (this.frames.length > 30) {
      var avg = this.frames.reduce(function (a, b) { return a + b; }, 0) / this.frames.length; this.frames.length = 0;
      if (avg > 26 && this.scale > .5) this.scale *= .85; else if (avg < 15 && this.scale < 1) this.scale = Math.min(1, this.scale * 1.08);
    }
    this.draw();
  };

  window.Hero = {
    define: function (n, d) { defs[n] = d; },
    mount: function (el) {
      var d = defs[el.getAttribute("data-hero")]; if (!d) return;
      var h = new Hero(el, d);
      if (capture && h.gl) window.__hero = { renderAt: function (t) { h.t = t; h.draw(); h.gl.finish(); } };
      return h;
    },
    // material ids
    M: { BLACK: 0, YELLOW: 1, SAND: 2, ROCK: 3, KRAFT: 4, STEEL: 5, TOPO: 6, GRANITE: 7, GRAPH: 8, PATINA: 9, ICE: 10 }
  };
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-hero]").forEach(function (el) { window.Hero.mount(el); });
  });
})();
