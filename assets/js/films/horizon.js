/* Home — "Horizons".
   One horizon, five materials: amber glass, tooled leather, cut paper, painted board,
   and finally the atmosphere itself. Each scene is a big arc cresting the frame with the
   headline word sitting on it; scenes change with a torn-paper wipe. All procedural. */
(function () {
  var frag = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time;",
    "uniform float u_a; uniform float u_b; uniform float u_mix; uniform float u_la; uniform float u_lb;",
    "const float PI=3.14159265;",

    "float h21(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
    "vec2 h22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(0.1031,0.103,0.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}",
    "float vn(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);",
    "  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}",
    "float fbm(vec2 p){float a=0.0,b=0.5;for(int i=0;i<5;i++){a+=b*vn(p);p=mat2(1.6,-1.2,1.2,1.6)*p+7.1;b*=0.5;}return a;}",
    // paper tooth: fine isotropic grain plus faint fibres
    "float paper(vec2 p){return 0.6*vn(p*420.0)+0.4*vn(vec2(p.x*60.0,p.y*900.0)+vn(p*30.0)*3.0);}",
    "float box(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}",
    "vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}",

    // horizon geometry shared by all scenes: signed distance to a big disc and arc length
    "vec3 arcg(vec2 p,float crest,float R){vec2 c=vec2(0.0,crest-R);vec2 q=p-c;float d=length(q)-R;float s=atan(q.x,q.y)*R;return vec3(d,s,length(q));}",

    // 0 — amber glass
    "vec3 s0(vec2 p,float lt){",
    "  vec3 g=arcg(p,-0.07+lt*0.012,1.55);float d=g.x,s=g.y;",
    "  vec3 bg=mix(vec3(0.02,0.022,0.028),vec3(0.07,0.06,0.05),smoothstep(0.5,-0.2,p.y));",
    "  vec2 dc=floor(p*90.0+vec2(0.0,lt*0.8));vec2 dj=h22(dc);float dust=step(0.965,h21(dc))*smoothstep(0.35,0.0,length(fract(p*90.0+vec2(0.0,lt*0.8))-dj));",
    "  bg+=vec3(0.9,0.85,0.75)*dust*0.35;",
    "  float depth=-d;",
    "  vec3 am=mix(vec3(0.98,0.66,0.2),vec3(0.42,0.2,0.03),smoothstep(0.0,0.45,depth));",
    "  float caus=fbm(vec2(s*3.0,depth*22.0)+lt*0.12);am*=0.86+0.3*smoothstep(0.3,0.8,caus);am*=0.9+0.2*smoothstep(0.2,0.0,abs(fract(s*1.6+depth*3.0)-0.5));",
    "  am+=vec3(1.0,0.85,0.5)*exp(-depth*55.0)*0.35;",
    // bubbles in a band just inside the rim
    "  float band=0.075;vec3 col=am;",
    "  vec2 bp=vec2(s,depth);vec2 cell=floor(bp/0.03);",
    "  for(int j=0;j<2;j++){for(int i=-1;i<=1;i++){vec2 id=cell+vec2(float(i),float(j)-0.5);vec2 rj=h22(id);",
    "    vec2 ctr=(id+vec2(rj.x,0.5+0.5*rj.y))*0.03;float r=0.005+0.011*h21(id+3.1);",
    "    if(ctr.y<0.004||ctr.y>band*(0.4+0.6*h21(id+4.0))||h21(id+9.0)<0.45)continue;",
    "    float l=length(bp-ctr);float ring=smoothstep(0.0022,0.0,abs(l-r));float inside=smoothstep(r,r-0.002,l);",
    "    col=mix(col,col*1.25+0.05,inside*0.6);col=mix(col,vec3(0.25,0.12,0.02),ring*0.5);",
    "    col+=vec3(1.0,0.95,0.8)*smoothstep(r*0.35,0.0,length(bp-ctr-vec2(-r*0.35,-r*0.4)))*0.9;",
    "  }}",
    "  col+=vec3(1.0,0.93,0.75)*smoothstep(0.004,0.0,abs(d))*0.9;",
    "  float aa=1.5/u_res.y;",
    "  vec3 outc=bg+vec3(1.0,0.7,0.3)*exp(-max(d,0.0)*40.0)*0.08;",
    "  return mix(outc,col,smoothstep(aa,-aa,d));",
    "}",

    // 1 — kraft paper and tooled leather
    "vec3 s1(vec2 p,float lt){",
    "  vec3 g=arcg(p,-0.06+lt*0.01,1.7);float d=g.x,s=g.y;",
    "  vec3 bg=vec3(0.76,0.63,0.45)*(0.9+0.14*paper(p))*(0.94+0.08*fbm(p*4.0));",
    "  bg*=1.0-0.35*exp(-max(d-0.004,0.0)*60.0)*step(0.0,d);",
    "  float depth=-d;",
    "  float grain=fbm(p*38.0);float wr=abs(vn(p*22.0+fbm(p*9.0)*2.0)-0.5);",
    "  vec3 le=mix(vec3(0.64,0.36,0.15),vec3(0.84,0.53,0.25),grain);",
    "  le*=0.93+0.1*smoothstep(0.0,0.1,wr);",
    "  vec2 pc=floor(p*260.0);float pore=step(0.9,h21(pc))*smoothstep(0.45,0.1,length(fract(p*260.0)-h22(pc)));",
    "  le*=1.0-pore*0.35;",
    "  le*=0.8+0.2*smoothstep(0.0,0.02,depth);",
    "  le+=vec3(0.9,0.65,0.4)*smoothstep(0.01,0.003,abs(depth-0.009))*0.18;",
    // saddle stitching along the rim
    "  float sd=abs(depth-0.034);float sw=fract(s/0.024);",
    "  float st=smoothstep(0.0045,0.002,sd)*smoothstep(0.12,0.2,sw)*smoothstep(0.62,0.52,sw);",
    "  le=mix(le,vec3(0.2,0.1,0.05),st*0.9);",
    "  le=mix(le,le*0.7,smoothstep(0.009,0.004,sd)*(1.0-st)*0.35);",
    // embroidered threads
    "  float x=p.x;float yc=-0.06+lt*0.01;",
    "  float th1=abs(p.y-(yc+0.02+0.035*sin(x*34.0+1.0)*smoothstep(0.24,0.1,abs(x-0.08))));",
    "  float th2=abs(p.y-(yc-0.05+0.02*sin(x*22.0+lt)))+step(0.12,abs(x+0.17));",
    "  vec3 col=le;",
    "  vec3 outc=bg;",
    "  float aa=1.5/u_res.y;vec3 base=mix(outc,col,smoothstep(aa,-aa,d));",
    "  float t1=smoothstep(0.0032,0.0012,th1)*step(abs(x-0.08),0.16)*smoothstep(-0.01,0.02,p.y-yc+0.08);",
    "  base=mix(base,vec3(0.78,0.1,0.08)*(0.8+0.4*vn(p*300.0)),t1);",
    "  float t2=smoothstep(0.003,0.001,th2)*step(0.0,-d);",
    "  base=mix(base,vec3(0.2,0.38,0.24)*(0.8+0.4*vn(p*300.0)),t2);",
    "  return base;",
    "}",

    // 2 — cut paper collage on blue board
    "vec3 layer(vec3 c,vec3 col,float sd,float aa){c=mix(c,c*0.72,smoothstep(0.012,0.0,sd-0.004)*0.45);return mix(c,col,smoothstep(aa,-aa,sd));}",
    "vec3 s2(vec2 p,float lt){",
    "  float crest=-0.02+lt*0.01;",
    "  vec3 g=arcg(p,crest,1.9);float d=g.x+0.006*(vn(vec2(g.y*60.0,0.0))-0.5)+0.002*vn(vec2(g.y*300.0,1.0));",
    "  float pp=paper(p);",
    "  vec3 bg=vec3(0.95,0.92,0.84)*(0.93+0.09*pp);",
    "  bg*=1.0-0.18*exp(-max(d,0.0)*120.0)*step(0.0,d);",
    "  vec3 c=vec3(0.13,0.32,0.66)*(0.9+0.15*pp);",
    "  float aa=1.5/u_res.y;",
    "  vec2 o=vec2(0.0,crest);float dr=lt*0.004;p=(p-o)/1.75+o;aa/=1.75;",
    "  float e=0.004*(vn(p*90.0)-0.5);",
    "  c=layer(c,vec3(0.96,0.84,0.36),length(p-o-vec2(-0.06,-0.06+dr))-0.058+e,aa);",
    "  c=layer(c,vec3(0.8,0.19,0.13),box(rot(p-o-vec2(0.05,-0.13),0.2),vec2(0.024,0.12))+e,aa);",
    "  c=layer(c,vec3(0.27,0.58,0.41),length((p-o-vec2(0.19,-0.1-dr))*vec2(1.0,0.8))-0.07+0.012*(vn(p*14.0)-0.5)+e,aa);",
    "  c=layer(c,vec3(0.3,0.16,0.09),box(rot(p-o-vec2(-0.21,-0.16),-0.08),vec2(0.045,0.15))+e,aa);",
    "  c=layer(c,vec3(0.93,0.48,0.17),box(rot(p-o-vec2(0.32,-0.2+dr),-0.35),vec2(0.03,0.075))+e,aa);",
    "  c=layer(c,vec3(0.73,0.62,0.87),length((p-o-vec2(-0.1,-0.28))*vec2(1.0,2.0))-0.06+e,aa);",
    "  c=layer(c,vec3(0.98,0.97,0.93),box(rot(p-o-vec2(0.43,-0.12),0.05),vec2(0.05,0.085))+e,aa);",
    "  vec2 hp=rot(p-o-vec2(0.43,-0.12),0.05);float hatch=smoothstep(0.0016,0.0,abs(fract((hp.x+hp.y)*55.0)-0.5)/55.0)*step(box(hp,vec2(0.045,0.078)),0.0);",
    "  c=mix(c,vec3(0.25),hatch*0.7);",
    "  c=layer(c,vec3(0.12,0.1,0.09),length((p-o-vec2(-0.34,-0.08))*vec2(1.6,1.0))-0.04+e,aa);",
    "  vec3 col=mix(bg,c,smoothstep(aa,-aa,d));",
    "  col=mix(col,vec3(1.0),smoothstep(0.004,0.0,abs(d-0.002))*0.55);",
    "  return col;",
    "}",

    // 3 — painted board over banded sediment
    "vec3 s3(vec2 p,float lt){",
    "  vec3 g=arcg(p,-0.1+lt*0.012,2.4);float d=g.x;",
    "  float br=vn(vec2(p.x*3.0,p.y*70.0))*0.6+vn(vec2(p.x*9.0,p.y*200.0))*0.4;",
    "  vec3 bg=vec3(0.93,0.76,0.2)*(0.88+0.18*br)*(0.95+0.08*paper(p));",
    "  for(int i=0;i<7;i++){float fi=float(i);vec2 a=vec2(h21(vec2(fi,1.0))-0.5,h21(vec2(fi,2.0))*0.5)*vec2(1.6,1.0);",
    "    vec2 dir=normalize(vec2(1.0,h21(vec2(fi,3.0))*1.6-0.8));vec2 q=p-a;float along=dot(q,dir);float off=abs(dot(q,vec2(-dir.y,dir.x))+0.01*sin(along*40.0));",
    "    bg=mix(bg,vec3(0.45,0.36,0.14),smoothstep(0.0014,0.0,off)*step(abs(along),0.08+0.08*h21(vec2(fi,4.0)))*0.45);}",
    "  float chip=step(fbm(p*6.0+2.0),0.36)*step(p.x,-0.35);bg=mix(bg,vec3(0.95,0.93,0.88),chip);",
    "  float v=fbm(p*vec2(1.6,2.6)+vec2(0.0,lt*0.03))*7.0+p.y*42.0+sin(p.x*4.0)*0.6;",
    "  float band=smoothstep(0.3,0.42,fract(v))*smoothstep(0.99,0.9,fract(v));",
    "  vec3 st=mix(vec3(0.08,0.07,0.06),vec3(0.86,0.8,0.68),band)*(0.9+0.15*paper(p*0.7));",
    "  float spl=smoothstep(0.62,0.66,vn(p*28.0))*smoothstep(0.03,0.0,-d-0.02);st=mix(st,vec3(0.96),spl);",
    "  float aa=1.5/u_res.y;",
    "  vec3 col=mix(bg*(1.0-0.25*exp(-max(d,0.0)*90.0)*step(0.0,d)),st,smoothstep(aa,-aa,d));",
    "  col=mix(col,vec3(0.9,0.85,0.75),smoothstep(0.006,0.0,abs(d+0.003))*0.8);",
    "  return col;",
    "}",

    // 4 — the atmosphere: a dark planet and sunrise along its limb
    "vec3 s4(vec2 p,float lt){",
    "  vec3 g=arcg(p,-0.12+lt*0.008,2.2);float d=g.x;",
    "  float rise=smoothstep(0.0,3.2,lt);",
    "  vec3 sky=vec3(0.018,0.026,0.036)+vec3(0.04,0.07,0.1)*exp(-max(d,0.0)*6.0);",
    "  vec2 sc=floor(p*160.0);sky+=vec3(0.8)*step(0.992,h21(sc))*smoothstep(0.3,0.0,length(fract(p*160.0)-h22(sc)))*0.6*smoothstep(0.05,0.3,d);",
    "  float cx=exp(-p.x*p.x*3.2);",
    "  vec3 blue=vec3(0.22,0.46,0.74)*exp(-max(d,0.0)/0.05)*(0.35+0.65*cx);",
    "  vec3 teal=vec3(0.45,0.66,0.8)*exp(-max(d,0.0)/0.018)*0.6*cx;",
    "  vec3 orng=vec3(1.0,0.46,0.12)*exp(-abs(d)/0.006)*(0.25+1.3*cx*rise);",
    "  vec3 sun=vec3(1.0,0.85,0.6)*exp(-length(p-vec2(0.0,-0.12+lt*0.008+0.004))*mix(60.0,22.0,rise))*rise*cx;",
    "  vec3 col=sky+blue*(0.6+0.6*rise)+teal*rise+orng+sun;",
    "  vec3 ground=vec3(0.006,0.008,0.01)+vec3(0.25,0.1,0.03)*exp(d/0.02)*cx*rise;",
    "  float aa=1.5/u_res.y;",
    "  return mix(col,ground+orng*0.5,smoothstep(aa,-aa,d));",
    "}",

    "vec3 scene(float id,vec2 p,float lt){",
    "  if(id<0.5)return s0(p,lt);if(id<1.5)return s1(p,lt);if(id<2.5)return s2(p,lt);if(id<3.5)return s3(p,lt);return s4(p,lt);",
    "}",

    "void main(){",
    "  vec2 q=gl_FragCoord.xy/u_res;",
    "  vec2 p=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
    "  float asp=u_res.x/u_res.y;",
    // keep the arc composition when the frame is portrait
    "  p*=asp<1.0?1.25:1.0;",
    "  vec3 col=scene(u_a,p,u_la);",
    "  if(u_mix>0.0){",
    "    float edge=q.x+0.03*(vn(vec2(q.y*9.0,u_b))-0.5)+0.012*(vn(vec2(q.y*60.0,u_b*3.0))-0.5);",
    "    float front=1.0-u_mix*1.12;",
    "    float m=smoothstep(front-0.002,front+0.002,edge);",
    "    vec3 nb=scene(u_b,p,u_lb);",
    "    float lip=smoothstep(0.012,0.0,abs(edge-front))*step(front,edge);",
    "    col=mix(col,nb,m);",
    "    col=mix(col,vec3(0.97,0.95,0.9),lip*0.85);",
    "    col*=1.0-0.25*smoothstep(0.04,0.0,front-edge)*step(edge,front);",
    "  }",
    "  col*=0.72+0.28*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);",
    "  col+=(h21(gl_FragCoord.xy+fract(u_time*9.1)*311.0)-0.5)*0.04;",
    "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
    "}"
  ].join("\n");

  var SCENE = 4, WIPE = 0.6, N = 5;
  var words = [
    { word: "your next project", tone: "light" },
    { word: "your research", tone: "light" },
    { word: "your services", tone: "dark" },
    { word: "your team", tone: "light" },
    { word: "the whole workshop", tone: "light" }
  ];
  var chapters = words.map(function (w, i) {
    return { t: i === 0 ? 0 : i * SCENE - WIPE / 2, n: "0" + (i + 1), title: w.word, tone: w.tone };
  });

  window.Film.define("horizon", {
    frag: frag,
    duration: SCENE * N,
    start: 0.9,
    chapters: chapters,
    uniforms: function (t) {
      // scene i owns [i*S, (i+1)*S); the last W seconds of it are the wipe into scene i+1
      var i = Math.floor(t / SCENE) % N;
      var wipeStart = (i + 1) * SCENE - WIPE;
      var into = t - wipeStart;
      return {
        u_a: i,
        u_b: (i + 1) % N,
        u_mix: into > 0 ? into / WIPE : 0,
        u_la: t - i * SCENE + WIPE,
        u_lb: Math.max(0, into)
      };
    }
  });
})();
