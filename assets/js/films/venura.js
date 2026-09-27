/* Venura 6.5 — "Survey".
   A radar-mapped flight over a volcanic plain, rendered live: a raymarched heightfield
   (eroded fbm + shield volcano + lava channel), soft shadows, amber haze, sepia grade.
   Four shots, one per capability. Camera paths are computed here; the shader is stateless. */
(function () {
  var frag = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time;",
    "uniform vec3 u_ro; uniform vec3 u_ta; uniform vec3 u_sun;",
    "uniform float u_scan; uniform float u_fade; uniform float u_focal;",

    "float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
    // value noise with analytic derivatives, range [-1,1]
    "vec3 noised(vec2 x){",
    "  vec2 i=floor(x);vec2 f=fract(x);",
    "  vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);",
    "  vec2 du=30.0*f*f*(f*(f-2.0)+1.0);",
    "  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));",
    "  float k1=b-a,k2=c-a,k4=a-b-c+d;",
    "  return vec3(-1.0+2.0*(a+k1*u.x+k2*u.y+k4*u.x*u.y),2.0*du*vec2(k1+k4*u.y,k2+k4*u.x));",
    "}",
    "float vn(vec2 x){return noised(x).x;}",
    "const mat2 M2=mat2(0.8,-0.6,0.6,0.8);",

    // eroded fbm: derivative damping gives believable ridges and smooth basins
    "float base(vec2 p,int oct){",
    "  vec2 x=p*0.026;float a=0.0,b=1.0;vec2 d=vec2(0.0);",
    "  for(int i=0;i<9;i++){if(i>=oct)break;vec3 n=noised(x);d+=n.yz;a+=b*n.x/(1.0+dot(d,d));b*=0.5;x=M2*x*2.03;}",
    "  return a;",
    "}",
    "float chanX(float z){return 34.0+10.0*sin(z*0.04)+4.0*sin(z*0.11+1.3);}",
    "float H(vec2 p,int oct){",
    "  float d=length(p);",
    "  float h=base(p,oct)*5.5*(1.0-0.55*exp(-d*d/900.0));",
    "  h+=17.0*exp(-d*d/1100.0);",               // shield volcano
    "  h-=5.5*smoothstep(7.5,1.5,d);",           // caldera
    "  h+=1.6*exp(-(d-7.0)*(d-7.0)/2.2);",       // caldera rim
    "  vec2 q=p-vec2(-130.0,210.0);float d2=length(q);",
    "  h+=26.0*exp(-d2*d2/4200.0);",             // older shield on the horizon
    "  float c=abs(p.x-chanX(p.y));",
    "  h-=2.0*exp(-c*c/14.0);",                  // lava channel
    "  h+=0.45*exp(-(c-4.6)*(c-4.6)/1.4);",      // levees
    "  return h;",
    "}",
    // radial flow lobes on the flanks (relief for shading only)
    "float flows(vec2 p){",
    "  float d=length(p);float ang=atan(p.y,p.x);",
    "  float w=vn(p*0.05)*2.2+vn(p*0.17)*0.7;",
    "  float s=0.5+0.5*sin(ang*30.0+w*4.0);",
    "  s=s*s*(0.35+0.65*(0.5+0.5*vn(p*0.11+3.0)));",
    "  return s*exp(-d*d/1500.0)*smoothstep(8.0,17.0,d);",
    "}",
    "float Hd(vec2 p,int oct){return H(p,oct)+0.3*flows(p)+0.12*vn(p*1.3)*step(6.5,float(oct));}",

    "float march(vec3 ro,vec3 rd,float tmax){",
    "  float t=0.2;",
    "  for(int i=0;i<220;i++){",
    "    vec3 p=ro+rd*t;float h=p.y-H(p.xz,5);",
    "    if(h<0.0012*t||t>tmax)break;",
    "    if(p.y>70.0&&rd.y>0.0){t=tmax+1.0;break;}",
    "    t+=max(0.42*h,0.004*t);",
    "  }",
    "  return t;",
    "}",
    "vec3 nrm(vec2 p,float e,int oct){float h=Hd(p,oct);return normalize(vec3(h-Hd(p+vec2(e,0.0),oct),e,h-Hd(p+vec2(0.0,e),oct)));}",
    "float shadow(vec3 ro,vec3 rd){",
    "  float r=1.0,t=0.6;",
    "  for(int i=0;i<30;i++){vec3 p=ro+rd*t;float h=p.y-H(p.xz,4);r=min(r,9.0*h/t);t+=clamp(h,0.4,7.0);if(r<0.02||t>140.0)break;}",
    "  return clamp(r,0.0,1.0);",
    "}",

    // radar brightness: rough young lava bright, smooth plains dark, fractures bright
    "float albedo(vec2 p,float detail){",
    "  float d=length(p);",
    "  float fl=flows(p);",
    "  float flank=exp(-d*d/1500.0)*smoothstep(3.0,9.0,d);",
    "  float lava=flank*(0.42+0.6*fl);",
    "  float cal=smoothstep(7.0,4.0,d)*0.18;",
    "  float mott=0.5+0.35*vn(p*0.045)+0.2*vn(p*0.17)+0.1*vn(p*0.6)*detail;",
    "  float plains=0.16+0.11*mott;",
    "  float l1=abs(vn(p*0.042+vec2(7.3,1.1)));",
    "  float l2=abs(vn(M2*p*0.105+vec2(3.1,9.7)));",
    "  float l3=abs(vn(p*0.31+vec2(1.7,4.2)));",
    "  float cracks=smoothstep(0.022,0.0,l1)*0.34+smoothstep(0.018,0.0,l2)*0.22+smoothstep(0.035,0.0,l3)*0.12*detail;",
    "  float c=abs(p.x-chanX(p.y));",
    "  float chan=-0.08*exp(-c*c/10.0)+0.22*exp(-(c-4.6)*(c-4.6)/1.6);",
    "  vec2 q=p-vec2(-130.0,210.0);float old=exp(-dot(q,q)/5200.0)*(0.3+0.2*vn(p*0.09));",
    "  return clamp(plains+lava+cracks*(1.0-flank*0.7)+cal+chan+old,0.04,1.25);",
    "}",
    "vec3 grade(float x){",
    "  x=clamp(x,0.0,1.5);",
    "  vec3 c=mix(vec3(0.085,0.072,0.058),vec3(0.40,0.35,0.275),smoothstep(0.0,0.34,x));",
    "  c=mix(c,vec3(0.78,0.70,0.545),smoothstep(0.28,0.72,x));",
    "  return mix(c,vec3(1.0,0.955,0.84),smoothstep(0.66,1.2,x));",
    "}",

    "void main(){",
    "  vec2 q=gl_FragCoord.xy/u_res;",
    "  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
    "  vec3 ro=u_ro;ro.y=max(ro.y,H(ro.xz,4)+3.0);",
    "  vec3 ww=normalize(u_ta-ro);vec3 uu=normalize(cross(ww,vec3(0.0,1.0,0.0)));vec3 vv=cross(uu,ww);",
    "  vec3 rd=normalize(uv.x*uu+uv.y*vv+u_focal*ww);",
    "  vec3 haze=vec3(0.87,0.765,0.585);",
    "  vec3 col=mix(haze,vec3(0.80,0.645,0.41),smoothstep(-0.02,0.32,rd.y));",
    "  float tmax=520.0;",
    "  float t=march(ro,rd,tmax);",
    "  if(t<tmax){",
    "    vec3 p=ro+rd*t;",
    "    int oct=8;if(t>90.0)oct=6;if(t>240.0)oct=5;",
    "    vec3 n=nrm(p.xz,0.015+0.0016*t,oct);",
    // the survey swath: unresolved ground ahead of the scan line is coarse raw data
    "    float res=smoothstep(u_scan+1.5,u_scan-1.5,p.z);",
    "    float detail=mix(0.0,1.0,res)*clamp(1.0-t/200.0,0.0,1.0);",
    "    float raw=mix(albedo(p.xz,0.0),0.26,0.6);",
    "    vec2 gq=abs(fract(p.xz/9.0)-0.5)*9.0;",
    "    raw+=0.16*smoothstep(0.09+t*0.0009,0.0,min(gq.x,gq.y));",
    "    float alb=mix(raw,albedo(p.xz,detail),res);",
    "    vec3 nn=normalize(mix(nrm(p.xz,2.5,4),n,res));",
    "    float dif=clamp(dot(nn,u_sun),0.0,1.0);",
    "    float sh=dif>0.0?shadow(p+nn*0.15,u_sun):0.0;",
    "    float amb=0.5+0.5*nn.y;",
    "    float lum=alb*(0.36*amb+1.12*dif*mix(0.25,1.0,sh));",
    "    vec3 g=grade(lum*1.3);",
    "    float glow=exp(-abs(p.z-u_scan)*0.9)*step(u_scan,1000.0);",
    "    g+=vec3(1.0,0.9,0.68)*glow*0.55;",
    "    float fog=1.0-exp(-t*0.0052);",
    "    col=mix(g,haze,pow(fog,1.25));",
    "  }",
    // lens: vignette, gentle halation, grain
    "  col*=0.5+0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.2);",
    "  col=mix(col,col*col*1.25,0.12);",
    "  col+=(hash(gl_FragCoord.xy+fract(u_time*7.13)*431.0)-0.5)*0.05;",
    "  col=mix(col,vec3(0.075,0.066,0.055),u_fade);",
    "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
    "}"
  ].join("\n");

  var F = window.Film;
  function cx(z) { return 34 + 10 * Math.sin(z * 0.04) + 4 * Math.sin(z * 0.11 + 1.3); }
  var L = F.lerp;
  var sun = (function () { var v = [-0.74, 0.44, 0.36], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();

  F.define("venura", {
    frag: frag,
    duration: 32,
    start: 1.2,
    chapters: [
      { t: 0, n: "01", title: "Stays on task longer", text: "Long sessions keep their thread — even when the history reaches the context limit and gets summarised." },
      { t: 8, n: "02", title: "Cleaner tool chains", text: "Fewer unnecessary calls, better choices between search, Python and files — and a plan that stays in view." },
      { t: 16, n: "03", title: "Its own review pass", text: "Before an answer goes out, it is read back against the task. What can't be backed up is marked open." },
      { t: 24, n: "04", title: "Images and figures", text: "Charts, screenshots and formulas, read precisely — for Science, where a figure is the answer." }
    ],
    uniforms: function (t) {
      var ro, ta, scan = 1e5, p;
      if (t < 8) {
        p = t / 8;
        ro = [L(-46, -30, p), 10.5, L(-200, -112, p)];
        ta = [L(-9, -3, p), 4, L(0, 8, p)];
      } else if (t < 16) {
        p = (t - 8) / 8;
        var z = L(-165, -70, p);
        ro = [cx(z) - 12, 17, z];
        ta = [cx(z + 46), 2, z + 46];
      } else if (t < 24) {
        p = (t - 16) / 8;
        var a = L(-2.45, -0.55, p), r = L(54, 44, p);
        ro = [Math.sin(a) * r, 22, Math.cos(a) * r];
        ta = [0, 5, 0];
      } else {
        p = (t - 24) / 8;
        ro = [L(-30, -18, p), L(64, 55, p), L(-98, -82, p)];
        ta = [L(4, 8, p), 0, L(-12, 0, p)];
        scan = L(-120, 95, F.ease(Math.min(1, p * 1.12)));
      }
      return {
        u_ro: ro, u_ta: ta, u_sun: sun, u_scan: scan, u_focal: 1.55,
        u_fade: F.cut(t, [0, 8, 16, 24, 32], 0.38)
      };
    }
  });
})();
