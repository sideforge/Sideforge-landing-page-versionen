/* Home — "Workshop".
   Five crafts behind five words, each a small procedural world seen up close:
   a cyanotype drawing that draws itself, a microscope's bright field, a city at night
   from above, a loom weaving many threads into one cloth, and cooling metal in a forge.
   The headline word sits in the middle; scenes change through an iris. */
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
    "vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}",
    "float ln(float d,float w){return smoothstep(w,0.0,d);}",
    // progress of a stroke drawn around a circle, starting at angle a0
    "float drawn(vec2 p,float a0,float pr){float a=fract((atan(p.y,p.x)-a0)/(2.0*PI));return step(a,pr);}",

    // 0 — cyanotype: a drawing exposes itself on Prussian-blue paper
    "vec3 s0(vec2 p,float lt){",
    "  p=rot(p*(1.0-0.025*lt),0.04*lt-0.1);",
    "  float g=fbm(p*3.0),gr=vn(p*500.0);",
    "  vec3 col=mix(vec3(0.05,0.17,0.36),vec3(0.1,0.28,0.52),g)*(0.9+0.14*gr);",
    "  col*=0.85+0.25*smoothstep(0.9,0.2,length(p));",
    "  float w=1.6/u_res.y;vec3 ink=vec3(0.9,0.94,1.0);float a=0.0;",
    "  vec2 gp=abs(fract(p*10.0)-0.5)/10.0;a=max(a,ln(min(gp.x,gp.y),w*0.8)*0.12);",
    "  float pr=clamp(lt/2.6,0.0,1.0);",
    "  float r=length(p);",
    "  a=max(a,ln(abs(r-0.36),w*1.2)*drawn(p,1.6,pr));",
    "  float th=atan(p.y,p.x);float tooth=0.29+0.022*smoothstep(0.35,0.4,abs(fract(th*18.0/(2.0*PI))-0.5));",
    "  a=max(a,ln(abs(r-tooth),w)*drawn(p,-0.4,clamp(pr*1.3-0.15,0.0,1.0)));",
    "  a=max(a,ln(abs(r-0.12),w)*drawn(p,0.8,clamp(pr*1.6-0.4,0.0,1.0)));",
    "  a=max(a,ln(abs(r-0.045),w)*step(0.5,pr));",
    "  for(int k=0;k<6;k++){vec2 c=rot(vec2(0.205,0.0),float(k)*PI/3.0+0.3);a=max(a,ln(abs(length(p-c)-0.03),w)*step(0.3+0.08*float(k),pr));}",
    "  float crs=min(abs(p.x),abs(p.y));a=max(a,ln(crs,w*0.8)*step(max(abs(p.x),abs(p.y)),0.44)*0.55*step(0.15,pr));",
    "  float dy=abs(p.y+0.44);float dx=step(abs(p.x),0.36*smoothstep(0.55,1.0,pr));a=max(a,ln(dy,w)*dx*0.8);",
    "  a=max(a,ln(abs(abs(p.x)-0.36),w)*step(abs(p.y+0.44),0.02)*step(0.9,pr));",
    "  col=mix(col,ink,a*(0.85+0.15*gr));",
    "  col+=ink*0.08*ln(abs(r-0.36),w*6.0)*drawn(p,1.6,pr);",
    "  return col;",
    "}",

    // 1 — microscope: stained cells drifting in the bright field
    "vec3 s1(vec2 p,float lt){",
    "  float R=0.47;float rr=length(p);",
    "  vec3 col=mix(vec3(0.97,0.93,0.84),vec3(0.9,0.84,0.7),smoothstep(0.0,R,rr));",
    "  col*=0.96+0.06*fbm(p*14.0);",
    "  float foc=0.004+0.003*(0.5+0.5*sin(lt*1.3));",
    "  for(int i=0;i<9;i++){",
    "    float fi=float(i);vec2 h=h22(vec2(fi,4.0));",
    "    vec2 c=(h-0.5)*vec2(0.8,0.7)+vec2(sin(lt*0.3+fi),cos(lt*0.25+fi*1.7))*0.02;",
    "    vec2 q=rot(p-c,fi*1.3+lt*0.05*(h.x-0.5));",
    "    float el=fi<1.5?3.6:1.0+0.5*h.y;",
    "    vec2 sz=vec2(0.05+0.035*h21(vec2(fi,9.0)));sz.x*=el;",
    "    float d=length(q/sz)-1.0;d*=min(sz.x,sz.y);",
    "    d+=0.004*(vn(q*80.0+fi)-0.5);",
    "    float inside=smoothstep(foc,-foc,d);",
    "    vec3 cyto=fi<1.5?vec3(0.78,0.74,0.5):mix(vec3(0.72,0.84,0.62),vec3(0.86,0.72,0.8),h.y);",
    "    col=mix(col,col*cyto*1.05,inside*0.8);",
    "    col=mix(col,vec3(0.4,0.34,0.26),smoothstep(foc*2.2,0.0,abs(d+0.003))*0.32);",
    "    if(fi<1.5){float st=smoothstep(0.35,0.5,abs(fract(q.x*90.0)-0.5));col=mix(col,col*0.8,st*inside*0.6);}",
    "    else{vec2 nq=q-vec2(0.01,0.005)*h;float nd=length(nq/(sz*0.34))-1.0;col=mix(col,vec3(0.45,0.3,0.55),smoothstep(0.1,-0.1,nd)*0.7*inside);",
    "      col=mix(col,col*0.85,step(0.8,vn(q*160.0))*inside*0.5);}",
    "  }",
    "  float field=smoothstep(R,R-0.012,rr);",
    "  vec3 rim=vec3(0.5,0.3,0.12)*smoothstep(0.02,0.0,abs(rr-R+0.004));",
    "  return col*field+rim*0.5+vec3(0.012,0.01,0.008)*(1.0-field);",
    "}",

    // 2 — a city at night from above: street grid, a river, traffic
    "vec3 s2(vec2 p,float lt){",
    "  p=rot(p,0.32+lt*0.018)*(1.0-0.03*lt);",
    "  vec3 col=vec3(0.012,0.016,0.024);",
    "  float rv=p.y-0.18*sin(p.x*3.0+0.6)-0.1;float river=smoothstep(0.035,0.03,abs(rv));",
    "  vec2 g=p*7.0;vec2 f=fract(g)-0.5;vec2 id=floor(g);",
    "  float street=min(abs(f.x),abs(f.y));",
    "  float avn=abs(fract(dot(p,normalize(vec2(1.0,0.55)))*0.55)-0.5)/0.55*7.0;",
    "  street=min(street,avn);",
    "  vec2 bid=floor(p*42.0);vec2 bf=fract(p*42.0);",
    "  float win=step(0.5+0.42*smoothstep(0.05,0.75,length(p)),h21(bid))*smoothstep(0.35,0.1,length(bf-0.5))*(0.5+0.5*h21(bid+3.0));",
    "  win*=step(0.07,street)*(1.0-river);",
    "  col+=vec3(1.0,0.78,0.5)*win*0.55;",
    "  float bx=mix(0.18,1.0,step(0.72,h21(vec2(id.x,21.0)))),by=mix(0.18,1.0,step(0.72,h21(vec2(id.y,22.0))));",
    "  float bv=abs(f.x)<abs(f.y)?bx:by;if(street==avn)bv=1.0;",
    "  float sl=smoothstep(0.03,0.0,street)*(1.0-river);",
    "  col+=vec3(0.95,0.55,0.22)*(sl*0.42*bv+exp(-street*14.0)*0.07*bv)*(1.0-river);",
    "  vec2 lamp=fract(g*4.0);float lp=smoothstep(0.18,0.0,length(vec2(min(abs(f.x),abs(f.y)),min(abs(lamp.x-0.5),abs(lamp.y-0.5))/4.0)));",
    "  col+=vec3(1.0,0.72,0.4)*lp*sl*0.6;",
    "  float tr=0.0;",
    "  float sx=fract(g.x*0.5*1.0+h21(vec2(id.y,1.0))+lt*0.22*(h21(vec2(id.y,2.0))>0.5?1.0:-1.0));",
    "  tr+=smoothstep(0.06,0.0,abs(f.y))*smoothstep(0.035,0.0,abs(fract(g.x*0.5+h21(vec2(id.y,5.0))+lt*0.25)-0.5));",
    "  tr+=smoothstep(0.06,0.0,abs(f.x))*smoothstep(0.035,0.0,abs(fract(g.y*0.5+h21(vec2(id.x,6.0))-lt*0.2)-0.5));",
    "  col+=mix(vec3(1.0,0.95,0.85),vec3(1.0,0.25,0.15),step(0.5,h21(id)))*tr*(1.0-river)*0.9;",
    "  col=mix(col,vec3(0.012,0.022,0.04)+vec3(0.95,0.65,0.35)*0.12*smoothstep(0.6,0.9,vn(vec2(p.x*30.0,rv*400.0)+lt)),river);",
    "  col+=vec3(0.9,0.55,0.25)*0.05*exp(-length(p)*1.6);",
    "  return col+sx*0.0;",
    "}",

    // 3 — the loom: many coloured warp threads, one weft laying across them
    "vec3 thread(float u,vec3 c,float fib){float cyl=sqrt(max(0.0,1.0-(2.0*u-1.0)*(2.0*u-1.0)));return c*(0.35+0.75*cyl)*(0.88+0.2*fib)+vec3(0.08)*pow(cyl,12.0);}",
    "vec3 s3(vec2 p,float lt){",
    "  p=p*(1.0-0.02*lt)+vec2(0.0,lt*0.012);",
    "  vec2 q=p*22.0;float i=floor(q.x),j=floor(q.y);vec2 f=fract(q);",
    "  float pick=h21(vec2(i,3.0));",
    "  vec3 warpc=pick<0.2?vec3(0.72,0.5,0.18):pick<0.4?vec3(0.16,0.22,0.42):pick<0.6?vec3(0.6,0.22,0.14):pick<0.8?vec3(0.85,0.8,0.68):vec3(0.34,0.4,0.2);",
    "  vec3 weftc=mod(floor(j/5.0),2.0)<1.0?vec3(0.86,0.82,0.72):vec3(0.2,0.24,0.38);",
    "  float fibW=vn(vec2(f.x*6.0,q.y*30.0)),fibF=vn(vec2(q.x*30.0,f.y*6.0));",
    "  float front=-0.62+lt*0.2;",
    "  vec3 bg=vec3(0.03,0.025,0.02);",
    "  float wgap=smoothstep(0.08,0.14,f.x)*smoothstep(0.92,0.86,f.x);",
    "  vec3 warp=thread(f.x,warpc,fibW);",
    "  vec3 col;",
    "  if(p.y>front){",
    "    col=mix(bg,warp*0.85,wgap);",
    "  }else{",
    "    float over=mod(i+j,4.0)<2.0?1.0:0.0;",
    "    vec3 weft=thread(f.y,weftc,fibF);",
    "    float wf=smoothstep(0.06,0.12,f.y)*smoothstep(0.94,0.88,f.y);",
    "    col=over>0.5?mix(weft*wf,warp,wgap):mix(warp*wgap,weft,wf);",
    "    col*=0.8+0.2*smoothstep(0.0,0.5,min(min(f.x,1.0-f.x),min(f.y,1.0-f.y))*4.0);",
    "  }",
    "  float beat=smoothstep(0.03,0.0,abs(p.y-front));col+=vec3(0.95,0.8,0.55)*beat*0.25;",
    "  return col;",
    "}",

    // 4 — the forge: a plate of cooling metal, cracks still glowing, sparks rising
    "vec2 vor(vec2 p){vec2 n=floor(p),f=fract(p);float d1=8.0,d2=8.0;",
    "  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=h22(n+g);vec2 r=g+o-f;float d=dot(r,r);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}",
    "  return vec2(sqrt(d1),sqrt(d2));}",
    "vec3 s4(vec2 p,float lt){",
    "  p*=1.0-0.02*lt;",
    "  vec2 v=vor(p*7.0+vec2(0.0,lt*0.05));float e=v.y-v.x;",
    "  float heat=exp(-dot(p,p)*2.2)*(0.75+0.25*sin(lt*0.8));",
    "  heat*=0.8+0.4*fbm(p*5.0+lt*0.1);",
    "  vec3 crust=vec3(0.05,0.035,0.03)*(0.7+0.6*fbm(p*20.0));",
    "  float crack=smoothstep(0.09,0.0,e);",
    "  float glow=crack*heat*1.6+heat*0.35*smoothstep(0.35,0.0,e);",
    "  vec3 hot=mix(vec3(0.6,0.08,0.02),vec3(1.0,0.55,0.12),smoothstep(0.2,0.8,glow));hot=mix(hot,vec3(1.0,0.92,0.7),smoothstep(0.9,1.6,glow));",
    "  vec3 col=crust+hot*glow;",
    "  for(int k=0;k<24;k++){float fk=float(k);vec2 h=h22(vec2(fk,7.0));",
    "    float y=fract(h.y+lt*(0.12+0.18*h.x))*1.3-0.55;float x=(h.x-0.5)*0.7+0.04*sin(lt*2.0+fk);",
    "    vec2 d=p-vec2(x,y);d.y*=0.3;float s=smoothstep(0.007,0.0,length(d))*smoothstep(0.75,0.1,y);",
    "    col+=vec3(1.0,0.7,0.3)*s*2.0;}",
    "  return col;",
    "}",

    "vec3 scene(float id,vec2 p,float lt){",
    "  if(id<0.5)return s0(p,lt);if(id<1.5)return s1(p,lt);if(id<2.5)return s2(p,lt);if(id<3.5)return s3(p,lt);return s4(p,lt);",
    "}",

    "void main(){",
    "  vec2 q=gl_FragCoord.xy/u_res;",
    "  vec2 p=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
    "  if(u_res.x<u_res.y)p*=1.3;",
    "  vec3 col=scene(u_a,p,u_la);",
    "  if(u_mix>0.0){",
    "    float r=u_mix*u_mix*(3.0-2.0*u_mix)*1.25;float d=length(p);",
    "    vec3 nb=scene(u_b,p,u_lb);",
    "    col=mix(col,nb,smoothstep(r+0.003,r-0.003,d));",
    "    col+=vec3(1.0,0.96,0.9)*smoothstep(0.006,0.0,abs(d-r))*0.5*(1.0-u_mix);",
    "  }",
    "  col*=0.74+0.26*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);",
    "  col+=(h21(gl_FragCoord.xy+fract(u_time*9.1)*311.0)-0.5)*0.035;",
    "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
    "}"
  ].join("\n");

  var SCENE = 4, WIPE = 0.9, N = 5;
  var words = [
    { word: "your next project", tone: "light" },
    { word: "your research", tone: "dark" },
    { word: "your services", tone: "light" },
    { word: "your team", tone: "light" },
    { word: "the whole workshop", tone: "light" }
  ];

  window.Film.define("workshop", {
    frag: frag,
    duration: SCENE * N,
    start: 1.4,
    chapters: words.map(function (w, i) {
      return { t: i === 0 ? 0 : i * SCENE - WIPE / 2, n: "0" + (i + 1), title: w.word, tone: w.tone };
    }),
    uniforms: function (t) {
      // scene i owns [i*S, (i+1)*S); the last W seconds of it are the iris into scene i+1
      var i = Math.floor(t / SCENE) % N;
      var into = t - ((i + 1) * SCENE - WIPE);
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
