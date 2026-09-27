/* Venura 6.5 — "Relief".
   An alpine massif in daylight, rendered live: a raymarched heightfield (ridged + eroded
   noise, a pyramidal summit, a glacial valley with a river and lakes), snow by altitude and
   slope, soft shadows and blue aerial perspective. In the last shot a survey line passes
   over the ground and leaves Swiss-map contour lines behind it.
   Four shots, one per capability. Camera paths are computed here; the shader is stateless. */
(function () {
  var frag = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time;",
    "uniform vec3 u_ro; uniform vec3 u_ta; uniform vec3 u_sun;",
    "uniform float u_scan; uniform float u_fade; uniform float u_focal;",
    "const float WL=-5.4;",

    "float hash(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}",
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

    "float base(vec2 p,int oct){",
    "  vec2 x=p*0.022;float a=0.0,b=1.0;vec2 d=vec2(0.0);",
    "  for(int i=0;i<9;i++){if(i>=oct)break;vec3 n=noised(x);d+=n.yz;a+=b*n.x/(1.0+dot(d,d));b*=0.5;x=M2*x*2.03;}",
    "  return a;",
    "}",
    // ridged multifractal: sharp crests, the look of folded limestone and granite
    "float ridged(vec2 p,int oct){",
    "  vec2 x=p*0.017;float a=0.0,b=0.55,w=1.0;",
    "  for(int i=0;i<8;i++){if(i>=oct)break;float n=1.0-abs(vn(x));n*=n;a+=b*n*w;w=clamp(n*1.8,0.0,1.0);b*=0.5;x=M2*x*2.07+3.1;}",
    "  return a;",
    "}",
    "float chanX(float z){return 36.0+11.0*sin(z*0.035)+5.0*sin(z*0.09+1.3);}",
    "float H(vec2 p,int oct){",
    "  float c=abs(p.x-chanX(p.y));",
    "  float d=length(p);",
    "  float h=base(p,oct)*3.5;",
    "  h+=ridged(p,oct)*26.0*smoothstep(10.0,60.0,c)*(0.55+0.45*smoothstep(0.0,40.0,d));",
    "  float ang=atan(p.y,p.x);float fac=1.0+0.13*cos(4.0*ang+0.7)+0.05*cos(7.0*ang)+0.08*vn(vec2(ang*3.0,d*0.08));",
    "  float pk=pow(max(0.0,1.0-d*fac/36.0),1.65);h+=pk*(40.0+22.0*ridged(p*2.3+7.0,oct));",   // the summit, with its own ridges
    "  h-=7.0*exp(-c*c/300.0);",                      // glacial trough
    "  h-=1.4*exp(-c*c/7.0);",                        // river bed
    "  return h;",
    "}",
    "float march(vec3 ro,vec3 rd,float tmax){",
    "  float t=0.2;",
    "  for(int i=0;i<230;i++){",
    "    vec3 p=ro+rd*t;float h=p.y-max(H(p.xz,5),WL);",
    "    if(h<0.0012*t||t>tmax)break;",
    "    if(p.y>90.0&&rd.y>0.0){t=tmax+1.0;break;}",
    "    t+=max(0.4*h,0.004*t);",
    "  }",
    "  return t;",
    "}",
    "vec3 nrm(vec2 p,float e,int oct){float h=H(p,oct);return normalize(vec3(h-H(p+vec2(e,0.0),oct),e,h-H(p+vec2(0.0,e),oct)));}",
    "float shadow(vec3 ro,vec3 rd){",
    "  float r=1.0,t=0.6;",
    "  for(int i=0;i<34;i++){vec3 p=ro+rd*t;float h=p.y-H(p.xz,4);r=min(r,10.0*h/t);t+=clamp(h,0.5,8.0);if(r<0.02||t>180.0)break;}",
    "  return clamp(r,0.0,1.0);",
    "}",
    "vec3 sky(vec3 rd){",
    "  vec3 c=mix(vec3(0.74,0.82,0.9),vec3(0.3,0.5,0.78),smoothstep(-0.02,0.45,rd.y));",
    "  float s=max(dot(rd,u_sun),0.0);",
    "  c+=vec3(1.0,0.86,0.66)*(pow(s,8.0)*0.18+pow(s,300.0)*0.8);",
    "  return c;",
    "}",

    "void main(){",
    "  vec2 q=gl_FragCoord.xy/u_res;",
    "  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
    "  vec3 ro=u_ro;ro.y=max(ro.y,H(ro.xz,4)+4.0);",
    "  vec3 ww=normalize(u_ta-ro);vec3 uu=normalize(cross(ww,vec3(0.0,1.0,0.0)));vec3 vv=cross(uu,ww);",
    "  vec3 rd=normalize(uv.x*uu+uv.y*vv+u_focal*ww);",
    "  vec3 col=sky(rd);",
    "  float tmax=620.0;",
    "  float t=march(ro,rd,tmax);",
    "  if(t<tmax){",
    "    vec3 p=ro+rd*t;",
    "    int oct=8;if(t>110.0)oct=6;if(t>280.0)oct=5;",
    "    float th=H(p.xz,oct);",
    "    bool water=th<WL+0.02;",
    "    vec3 n=water?vec3(0.0,1.0,0.0):nrm(p.xz,0.015+0.0016*t,oct);",
    "    float dif=clamp(dot(n,u_sun),0.0,1.0);",
    "    float sh=dif>0.0?shadow(p+n*0.2,u_sun):0.0;",
    "    float amb=0.55+0.45*n.y;",
    // materials: rock, alpine meadow, snow; water is glacial turquoise
    "    float r1=vn(p.xz*0.35),r2=vn(p.xz*1.7);",
    "    vec3 rock=mix(vec3(0.34,0.32,0.30),vec3(0.46,0.42,0.37),0.5+0.5*r1)*(0.85+0.2*r2);",
    "    float flt=smoothstep(0.62,0.86,n.y);",
    "    vec3 grass=mix(vec3(0.20,0.27,0.11),vec3(0.33,0.36,0.17),0.5+0.5*r1);",
    "    vec3 alb=mix(rock,grass,flt*smoothstep(15.0,5.0,th+3.0*r1));",
    "    float snow=smoothstep(12.0,17.0,th+5.0*r1+2.0*r2)*smoothstep(0.42,0.66,n.y+0.1*r2);",
    "    alb=mix(alb,vec3(0.93,0.95,0.98),snow);",
    "    vec3 lin=vec3(1.0,0.93,0.82)*2.1*dif*mix(0.12,1.0,sh)+vec3(0.42,0.55,0.75)*0.55*amb;",
    "    vec3 g=alb*lin;",
    "    if(water){",
    "      float fr=0.04+0.96*pow(1.0-max(-rd.y,0.0),5.0);",
    "      float rp=vn(p.xz*0.9+vec2(0.0,u_time*0.4))*0.5+vn(p.xz*2.3-u_time*0.3)*0.25;",
    "      vec3 wc=vec3(0.05,0.3,0.34)*(0.85+0.15*rp);",
    "      g=mix(wc*(0.6+0.8*dif),sky(reflect(rd,vec3(0.0,1.0,0.0))),fr*0.8);",
    "    }",
    // survey: behind the line the ground is read — Swiss-map contours every 4 m, index every 20 m
    "    float read=smoothstep(u_scan+1.5,u_scan-1.5,p.z)*step(u_scan,1000.0);",
    "    float aa=0.02+t*0.0012;",
    "    float ct=abs(fract(th/4.0+0.5)-0.5)*4.0;float ci=abs(fract(th/20.0+0.5)-0.5)*20.0;",
    "    float cl=smoothstep(aa*1.6,0.0,ct)*0.55+smoothstep(aa*2.4,0.0,ci)*0.45;",
    "    vec3 cc=snow>0.5?vec3(0.25,0.45,0.75):vec3(0.55,0.33,0.16);",
    "    if(!water)g=mix(g,cc,0.85*cl*read);",
    "    g+=vec3(0.95,0.35,0.2)*exp(-abs(p.z-u_scan)*1.3)*step(u_scan,1000.0)*0.9;",
    // aerial perspective
    "    float fog=1.0-exp(-t*0.0031);",
    "    col=mix(g,vec3(0.7,0.79,0.9),fog*0.92);",
    "  }",
    "  col=1.0-exp(-col*1.25);",
    "  col=pow(col,vec3(0.9));",
    "  col*=0.72+0.28*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.2);",
    "  col+=(hash(gl_FragCoord.xy+fract(u_time*7.13)*431.0)-0.5)*0.03;",
    "  col=mix(col,vec3(0.97,0.965,0.955),u_fade);",
    "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
    "}"
  ].join("\n");

  var F = window.Film;
  function cx(z) { return 36 + 11 * Math.sin(z * 0.035) + 5 * Math.sin(z * 0.09 + 1.3); }
  var L = F.lerp;
  var sun = (function () { var v = [-0.62, 0.52, 0.58], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; })();

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
        ro = [L(-60, -40, p), 34, L(-230, -140, p)];
        ta = [L(-8, -2, p), 22, L(0, 6, p)];
      } else if (t < 16) {
        p = (t - 8) / 8;
        var z = L(-175, -85, p);
        ro = [cx(z) - 10, 16, z];
        ta = [cx(z + 50), -2, z + 50];
      } else if (t < 24) {
        p = (t - 16) / 8;
        var a = L(-2.5, -0.6, p), r = L(84, 72, p);
        ro = [Math.sin(a) * r, 44, Math.cos(a) * r];
        ta = [0, 22, 0];
      } else {
        p = (t - 24) / 8;
        ro = [L(-38, -24, p), L(104, 94, p), L(-120, -102, p)];
        ta = [L(4, 8, p), 4, L(-10, 0, p)];
        scan = L(-130, 110, F.ease(Math.min(1, p * 1.12)));
      }
      return {
        u_ro: ro, u_ta: ta, u_sun: sun, u_scan: scan, u_focal: 1.55,
        u_fade: F.cut(t, [0, 8, 16, 24, 32], 0.38)
      };
    }
  });
})();
