/* Brand films — rendered offline, played on the pages as video.
   The grammar: macro shots of real materials, each cut through by a great curved horizon
   with darkness (or paper) above it; one word of a sentence sits on the horizon; hard cuts
   every beat; at the end a large image rises and the page title is set over it.
   Everything is procedural. Open tools/film/film.html?f=home&capture and call
   window.renderAt(t) per frame (see tools/film/README.md). */
(function () {
  "use strict";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uT; uniform float uShot; uniform float uLocal; uniform float uArc;",
    "uniform float uEnd; uniform float uEndK; uniform float uSeed; uniform float uFade;",
    "float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}",
    "float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
    "vec2 h22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}",
    "float n2(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}",
    "float n1(float x){float i=floor(x);float f=fract(x);return mix(h11(i),h11(i+1.),f*f*(3.-2.*f));}",
    "const mat2 M2=mat2(.8,-.6,.6,.8);",
    "float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.97;}",
    "float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.875;}",
    "float ridged(vec2 p){float s=0.,a=.5,w=1.;for(int i=0;i<5;i++){float n=1.-abs(n2(p)*2.-1.);n*=n;s+=a*n*w;w=clamp(n*1.6,0.,1.);p=M2*p*2.07+3.1;a*=.5;}return s;}",
    // voronoi: x = distance to nearest, y = to second, zw = id of nearest
    "vec4 vor(vec2 p){vec2 n=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 id=vec2(0.);for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 r=g+h22(n+g)-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;id=n+g;}else if(d<d2)d2=d;}return vec4(sqrt(d1),sqrt(d2),id);}",
    "vec3 L0=normalize(vec3(-.55,.62,.55));",

    // ---------------------------------------------------------------- materials: height + albedo, lit alike
    "float hIce(vec2 p){return fbm(p*2.)*.4+.25*(1.-abs(n2(p*5.)*2.-1.));}",
    "float hFelt(vec2 p){return n2(p*40.)*.5+n2(vec2(p.x*90.,p.y*30.)+n2(p*8.)*4.)*.3+fbm3(p*3.)*.4;}",
    "float hCopper(vec2 p){vec4 v=vor(p*9.);return -v.x*v.x*.7+.03*n2(p*80.);}",
    "float hGraph(vec2 p){return .02*n2(p*80.);}",
    "float hSlate(vec2 p){return fbm3(vec2(p.x*1.2,p.y*6.))*.6+.2*n2(p*30.);}",
    "float hMud(vec2 p){vec4 v=vor(p*3.);float e=v.y-v.x;return smoothstep(0.,.12,e)*(.8+.4*smoothstep(.35,0.,e))+.05*n2(p*40.);}",
    "float hMoss(vec2 p){return fbm(p*7.)*.55+.3*fbm3(p*38.)+.15*n2(p*120.);}",
    "float hPaint(vec2 p){float a=fbm3(p*.8)*3.;vec2 d=vec2(cos(a),sin(a));float s=dot(p,vec2(-d.y,d.x));return ridged(vec2(s*14.,dot(p,d)*1.5))*.6+fbm3(p*2.)*.3;}",
    "float H(float id,vec2 p){",
    "  if(id<.5)return hIce(p);if(id<1.5)return hFelt(p);if(id<2.5)return hCopper(p);if(id<3.5)return hGraph(p);",
    "  if(id<4.5)return hSlate(p);if(id<5.5)return hMud(p);if(id<6.5)return hMoss(p);return hPaint(p);",
    "}",
    "vec3 shade(float id,vec2 p,vec2 uv,float d){",
    "  float e=.002;float h=H(id,p),hx=H(id,p+vec2(e,0.)),hy=H(id,p+vec2(0.,e));",
    "  float bump=id<.5?.5:id<1.5?.35:id<2.5?1.4:id<3.5?.2:id<4.5?.6:id<5.5?1.:id<6.5?.9:1.3;",
    "  vec3 n=normalize(vec3(-(hx-h)/e*bump*.02,-(hy-h)/e*bump*.02,1.));",
    "  float dif=clamp(dot(n,L0),0.,1.);",
    "  vec3 V=vec3(0.,0.,1.),Hh=normalize(L0+V);float spec=pow(clamp(dot(n,Hh),0.,1.),id<2.5&&id>1.5?60.:id<4.5&&id>3.5?90.:30.);",
    "  vec3 c;",
    "  if(id<.5){",   // ice: blue depth, soft white fractures, a few trapped bubbles
    "    c=mix(vec3(.03,.1,.17),vec3(.5,.7,.82),smoothstep(.15,.85,fbm(p*1.1)))*(.55+.7*dif);",
    "    float fr=smoothstep(.025,.0,abs(fbm3(p*2.2)-.5));c=mix(c,vec3(.85,.93,.97),fr*.45);",
    "    vec4 v=vor(p*6.);float r=.1+.16*h12(v.zw);float has=step(.72,h12(v.zw+3.));",
    "    vec2 q=(fract(p*6.)-.5);",
    "    float inb=smoothstep(r,r-.02,v.x)*has;",
    "    c=mix(c,c*1.25+vec3(.05,.08,.1),inb*.6);",
    "    c=mix(c,c*.55,smoothstep(.012,.0,abs(v.x-r))*has*.8);",
    "    c+=vec3(1.)*inb*smoothstep(.035,.0,v.x-r*.0-.0)*0.;",
    "    c+=vec3(1.)*has*smoothstep(.03,.0,length(vec2(v.x)-r*.45))*0.;",
    "    c+=vec3(.8,.9,1.)*spec*.6;",
    "  }else if(id<1.5){",   // felt with a running stitch along the horizon
    "    c=vec3(.13,.17,.34)*(.55+.7*dif)*(.85+.3*n2(p*70.));",
    "    float band=smoothstep(.012,.0,abs(d-.07));float dash=step(.45,fract(uv.x*9.));",
    "    float th=band*dash;float cyl=sqrt(max(0.,1.-pow((d-.07)/.012,2.)));",
    "    c=mix(c,vec3(.95,.46,.16)*(.45+.75*cyl)+vec3(.3)*pow(cyl,8.),th);",
    "    float hole=smoothstep(.01,.0,length(vec2(fract(uv.x*9.)-.45,(d-.07)*6.)*vec2(1.,1.)))*.0;c*=1.-hole;",
    "  }else if(id<2.5){",   // hammered copper
    "    vec3 cu=vec3(.78,.42,.22);",
    "    float env=smoothstep(.2,.9,n.y*.5+.5+.3*n.x);",
    "    c=cu*(.12+.55*dif)+cu*env*.45+vec3(1.,.8,.55)*pow(clamp(dot(n,Hh),0.,1.),120.)*2.2;",
    "    c=mix(c,c*vec3(.55,.75,.7),smoothstep(.62,.8,fbm(p*1.5))*.5);",
    "  }else if(id<3.5){",   // graphite: patches of hand hatching on paper
    "    vec3 pap=vec3(.93,.9,.84)*(.95+.06*n2(p*50.));",
    "    float ang=floor(fbm3(p*1.3)*5.)*.9+.4;vec2 dir=vec2(cos(ang),sin(ang));",
    "    float s=dot(p,vec2(-dir.y,dir.x))*46.+n2(p*9.)*1.2;float al=dot(p,dir);",
    "    float line=smoothstep(.34,.08,abs(fract(s)-.5));",
    "    float brk=step(.35,n2(vec2(floor(s),al*7.)));",
    "    float mask=smoothstep(.42,.56,fbm3(p*1.8+3.)+d*.9);",
    "    float g=line*brk*mask*(.55+.45*n2(p*30.));",
    "    c=mix(pap,vec3(.19,.19,.22)+vec3(.3)*spec,g*.9);",
    "    c=mix(c,vec3(.15,.15,.17),smoothstep(.005,.0,abs(d))*.85);",
    "  }else if(id<4.5){",   // wet slate with droplets that act as small lenses
    "    c=vec3(.11,.13,.16)*(.4+.9*dif)+vec3(.55,.65,.75)*spec*.4;",
    "    vec4 v=vor(p*4.);float r=.08+.2*h12(v.zw);float has=step(.45,h12(v.zw+7.));",
    "    float inD=smoothstep(r,r-.015,v.x)*has;",
    "    float k=clamp(v.x/r,0.,1.);",
    "    vec3 drop=vec3(.2,.24,.3)*(.7+.6*k)+vec3(.9,.95,1.)*pow(1.-k,10.)*.0;",
    "    c=mix(c,drop,inD);",
    "    c=mix(c,vec3(.03,.035,.045),smoothstep(.02,.0,abs(v.x-r))*has*.7);",
    "    c+=vec3(1.)*inD*smoothstep(.2,.0,k)*.0;",
    "    c+=vec3(.85,.92,1.)*inD*smoothstep(.55,.9,k)*.35;",
    "  }else if(id<5.5){",   // cracked dry mud
    "    vec4 v=vor(p*3.);float e=v.y-v.x;",
    "    c=mix(vec3(.55,.4,.26),vec3(.72,.58,.4),h12(v.zw))*(.35+.85*dif);",
    "    c=mix(c,vec3(.06,.04,.03),smoothstep(.05,.0,e));",
    "  }else if(id<6.5){",   // moss, with spore stalks standing on the horizon
    "    c=mix(vec3(.08,.14,.03),vec3(.5,.62,.16),smoothstep(.25,.85,H(id,p)))*(.25+.95*dif);c=mix(c,vec3(.6,.55,.2)*(.4+.6*dif),smoothstep(.72,.85,fbm3(p*3.))*.5);",
    "  }else{",   // impasto oil paint
    "    float k=fbm3(p*.7+3.);",
    "    vec3 pa=mix(vec3(.85,.62,.2),vec3(.16,.28,.62),smoothstep(.4,.6,k));pa=mix(pa,vec3(.94,.92,.86),smoothstep(.62,.7,fbm3(p*1.1+9.)));",
    "    c=pa*(.35+.8*dif)+vec3(1.)*spec*.35;",
    "  }",
    "  return c;",
    "}",
    "vec3 above(float id,vec2 uv){",
    "  if(id>2.5&&id<3.5)return vec3(.93,.9,.84)*(.95+.05*n2(uv*400.));",
    "  if(id>6.5)return vec3(.9,.87,.8)*(.94+.06*n2(uv*300.)+.04*n2(vec2(uv.x*600.,uv.y*20.)));",
    "  vec3 c=vec3(.012,.012,.016);",
    "  vec2 g=floor(uv*180.);c+=vec3(.7,.75,.8)*step(.994,h12(g+uSeed))*smoothstep(.3,.0,length(fract(uv*180.)-h22(g)))*.5;",   // dust in the light
    "  return c;",
    "}",
    "vec3 shot(float id,vec2 uv){",
    "  float k=uLocal;",
    "  uv*=1./(1.+.05*k);uv+=vec2(.01*k,.004*k)*(h11(uSeed)-.5);",
    "  float R=1.8+.8*h11(uSeed*3.);vec2 c=vec2((h11(uSeed*7.)-.5)*.3,uArc-R);",
    "  float d=R-length(uv-c);",
    "  vec2 p=uv*(id<2.5&&id>1.5?1.2:1.)+vec2(uSeed*3.7,uSeed*1.9);",
    "  float aa=1.4/uRes.y;",
    "  vec3 top=above(id,uv);",
    "  vec3 col=top;",
    "  if(d>-.01){",
    "    float blur=smoothstep(.12,.7,d)*(id>2.5&&id<3.5?.35:1.);",
    "    float r=.035*blur;",
    "    vec3 m=shade(id,p*1.3,uv,d);",
    "    if(r>.001){vec3 acc=m;for(int k=0;k<6;k++){float a=float(k)*1.047+uSeed;acc+=shade(id,p*1.3+vec2(cos(a),sin(a))*r,uv,d);}m=acc/7.;}",
    "    m*=mix(1.,.72,blur);",
    // backlit rim along the horizon
    "    bool light=(id>2.5&&id<3.5)||id>6.5;",
    "    if(!light)m+=vec3(1.,.82,.6)*exp(-d*90.)*.5*(.6+.4*n1(uv.x*30.));",
    "    col=mix(top,m,smoothstep(-aa,aa,d));",
    "  }",
    "  if(id>5.5&&id<6.5){",   // moss sporophytes silhouetted on the horizon
    "    float x=uv.x*60.;float i=floor(x);float f=fract(x)-.5;",
    "    float ht=(.03+.06*h11(i))*step(.35,h11(i+3.));float base=R-length(vec2(uv.x,0.)-vec2(c.x,0.))*0.+0.;",
    "    float yb=c.y+sqrt(max(0.,R*R-(uv.x-c.x)*(uv.x-c.x)));",
    "    float y=uv.y-yb;float lean=f+y*(h11(i+5.)-.5)*3.;",
    "    float stalk=smoothstep(.06,.0,abs(lean))*step(0.,y)*step(y,ht);",
    "    float cap=smoothstep(.2,.1,length(vec2(lean,(y-ht)*18.)));",
    "    col=mix(col,vec3(.35,.18,.08)+vec3(1.,.7,.4)*.3,max(stalk*.9,cap));",
    "  }",
    "  return col;",
    "}",
    "vec3 ending(vec2 uv,float t);",
    "void main(){",
    "  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;",
    "  vec3 col;",
    "  if(uEnd>.5){",
    "    col=ending(uv,uLocal);",
    // the image rises like a limb out of the dark
    "    float R=3.2;float top=mix(-.75,.62,1.-pow(1.-clamp(uEndK,0.,1.),3.));",
    "    float d=R-length(uv-vec2(0.,top-R));",
    "    float m=smoothstep(-.04,.1,d);",
    "    col=mix(vec3(.01),col,m)+vec3(1.,.72,.45)*exp(-abs(d)*60.)*.35*(1.-smoothstep(.7,1.,uEndK));",
    "  }else if(uShot<-.5){col=vec3(.008);}",
    "  else col=shot(uShot,uv);",
    "  vec2 q=gl_FragCoord.xy/uRes;col*=.82+.18*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.25);",
    "  col+=(h12(gl_FragCoord.xy+fract(uT*7.)*97.)-.5)*.05;",
    "  col*=uFade;",
    "  gl_FragColor=vec4(clamp(col,0.,1.),1.);",
    "}"
  ].join("\n");

  // the closing images (the same ones the pages used as heroes, rendered offline here)
  var ENDINGS = {};
  window.Hero = { M: {}, define: function (n, d) { ENDINGS[n] = d.center.replace("vec3 center(vec2 uv,float t)", "vec3 ending(vec2 uv,float t)"); } };

  var M = { ICE: 0, FELT: 1, COPPER: 2, GRAPHITE: 3, SLATE: 4, MUD: 5, MOSS: 6, PAINT: 7 };
  var LIGHT = { 3: 1, 7: 1 };
  var FILMS = {
    home: { end: "home", shots: [[M.COPPER, "Everything"], [M.FELT, "for your"], [M.PAINT, "next"], [M.GRAPHITE, "project."]] },
    venura: { end: "venura", shots: [[M.ICE, "Think"], [M.MUD, "deeper,"], [M.MOSS, "stay"], [M.SLATE, "longer."]] },
    // Sintulus is only the deep water: no shots, no rise, a seamless loop of `loop` seconds
    sintulus: { end: "sintulus", shots: [], loop: 12 },
    // the SideAI film ends on the lake, which tools/film/lake.html renders and the render script appends
    ai: { end: null, shots: [[M.PAINT, "A day,"], [M.MOSS, "in sixty"], [M.GRAPHITE, "seconds."]] }
  };
  var BEAT = 0.92, LEAD = 0.3, GAP = 0.28, END = 4.6, XFADE = 2;

  function Film(name) {
    var f = FILMS[name];
    this.f = f;
    this.dur = f.loop || LEAD + f.shots.length * BEAT + GAP + (f.end ? END : 0);
    var cv = document.querySelector("canvas");
    var gl = cv.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG + "\n" + (f.end ? ENDINGS[f.end] : "vec3 ending(vec2 uv,float t){return vec3(0.);}")));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.gl = gl; this.pr = pr; this.cv = cv;
    this.word = document.querySelector(".word");
  }
  Film.prototype.u = function (n) { return this.gl.getUniformLocation(this.pr, n); };
  Film.prototype.render = function (t) {
    var gl = this.gl, f = this.f, n = f.shots.length;
    gl.viewport(0, 0, this.cv.width, this.cv.height);
    gl.uniform2f(this.u("uRes"), this.cv.width, this.cv.height);
    if (f.loop) return this.loop(t);
    gl.uniform1f(this.u("uT"), t);
    var shot = -1, local = 0, end = 0, endK = 0, word = "", seed = 0, arc = 0.05;
    var s = (t - LEAD) / BEAT;
    if (t >= LEAD && s < n) { var i = Math.floor(s); shot = f.shots[i][0]; word = f.shots[i][1]; local = s - i; seed = i * 1.37 + name2seed(f.end || "ai"); arc = [0.02, -0.04, 0.06, -0.01][i % 4]; }
    var te = t - (LEAD + n * BEAT + GAP);
    if (te >= 0 && f.end) { end = 1; local = te + 3.0; endK = Math.min(1, te / 2.6); }
    gl.uniform1f(this.u("uShot"), shot);
    gl.uniform1f(this.u("uLocal"), local);
    gl.uniform1f(this.u("uEnd"), end);
    gl.uniform1f(this.u("uEndK"), endK);
    gl.uniform1f(this.u("uSeed"), seed);
    gl.uniform1f(this.u("uArc"), arc);
    gl.uniform1f(this.u("uFade"), Math.min(1, t / 0.2) * Math.min(1, (this.dur - t) / 0.01 + 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.finish();
    var w = this.word;
    if (w.textContent !== word) w.textContent = word;
    var light = shot >= 0 && LIGHT[shot];
    w.style.color = light ? "#1c1a17" : "#f3ede2";
    // the word sits on the horizon, drifting with the slow push-in
    var H = this.cv.clientHeight;
    w.style.top = (H * (0.5 - arc) - H * 0.012 * local) + "px";
    w.style.transform = "translate(-50%, -100%) scale(" + (1 + 0.035 * local).toFixed(4) + ")";
  };
  // a loop is the closing image alone, already risen; the XFADE seconds past its end are
  // blended over its first frames, so the jump from the last frame back to 0 is invisible
  Film.prototype.loop = function (t) {
    var gl = this.gl, L = this.f.loop, self = this;
    function draw(s) { gl.uniform1f(self.u("uT"), s); gl.uniform1f(self.u("uLocal"), s + 3.0); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    gl.uniform1f(this.u("uEnd"), 1);
    gl.uniform1f(this.u("uEndK"), 1);
    gl.uniform1f(this.u("uFade"), 1);
    gl.disable(gl.BLEND);
    if (t < XFADE) {
      draw(t + L);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
      var k = t / XFADE; gl.blendColor(0, 0, 0, k * k * (3 - 2 * k));
    }
    draw(t);
    gl.disable(gl.BLEND);
    gl.finish();
    this.word.textContent = "";
  };
  function name2seed(n) { return n.length * 3.1; }

  window.startFilm = function (name) {
    var film = new Film(name);
    window.renderAt = function (t) { film.render(t); };
    window.filmDuration = film.dur;
    film.render(0);
    return film;
  };
})();
