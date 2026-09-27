/* Sintulus 6 — "A day in orbit".
   A planet seen from low and high orbit: single-scattering atmosphere (Rayleigh + Mie),
   procedural continents, clouds, ocean glint, night lights, and a survey grid and route
   network drawn on the surface. Units are kilometres. Four shots, one per capability. */
(function () {
  var frag = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time;",
    "uniform vec3 u_ro; uniform vec3 u_ta; uniform vec3 u_sun; uniform vec3 u_moon;",
    "uniform float u_rot; uniform float u_grid; uniform float u_net; uniform float u_exp;",
    "uniform float u_fade; uniform float u_focal;",
    "const float R=6360.0; const float RA=6470.0; const float HR=9.0; const float HM=1.4;",
    "const vec3 BR=vec3(5.8e-3,13.5e-3,33.1e-3); const float BM=21e-3;",
    "const float PI=3.14159265; const float SI=20.0;",

    "float hash1(float n){return fract(sin(n)*43758.5453123);}",
    "float hash3(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}",
    "float n3(vec3 x){vec3 i=floor(x);vec3 f=fract(x);f=f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),",
    "             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}",
    "float fbm(vec3 p){float a=0.0,b=0.5;for(int i=0;i<6;i++){a+=b*n3(p);p=p*2.02+vec3(1.7,9.2,3.1);b*=0.5;}return a;}",

    "vec2 sph(vec3 ro,vec3 rd,float r){float b=dot(ro,rd);float c=dot(ro,ro)-r*r;float h=b*b-c;if(h<0.0)return vec2(1e9,-1e9);h=sqrt(h);return vec2(-b-h,-b+h);}",
    "mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.0,s,0.0,1.0,0.0,-s,0.0,c);}",
    "mat3 rotX(float a){float c=cos(a),s=sin(a);return mat3(1.0,0.0,0.0,0.0,c,s,0.0,-s,c);}",

    // single scattering along the view ray, with planet shadow on the light rays
    "vec3 scatter(vec3 ro,vec3 rd,float tmax,out vec3 trans){",
    "  trans=vec3(1.0);",
    "  vec2 a=sph(ro,rd,RA);if(a.x>a.y||a.y<0.0)return vec3(0.0);",
    "  float t0=max(a.x,0.0),t1=min(a.y,tmax);float ds=(t1-t0)/14.0;",
    "  float oR=0.0,oM=0.0;vec3 sR=vec3(0.0),sM=vec3(0.0);",
    "  for(int i=0;i<14;i++){",
    "    vec3 p=ro+rd*(t0+ds*(float(i)+0.5));float h=length(p)-R;",
    "    float hr=exp(-h/HR)*ds,hm=exp(-h/HM)*ds;oR+=hr;oM+=hm;",
    "    vec2 l=sph(p,u_sun,RA);float dl=l.y/5.0;float lR=0.0,lM=0.0;bool lit=true;",
    "    for(int j=0;j<5;j++){vec3 q=p+u_sun*(dl*(float(j)+0.5));float hl=length(q)-R;if(hl<0.0){lit=false;break;}lR+=exp(-hl/HR)*dl;lM+=exp(-hl/HM)*dl;}",
    "    if(lit){vec3 at=exp(-(BR*(oR+lR)+BM*1.1*(oM+lM)));sR+=at*hr;sM+=at*hm;}",
    "  }",
    "  float mu=dot(rd,u_sun);float g=0.76;",
    "  float pR=3.0/(16.0*PI)*(1.0+mu*mu);",
    "  float pM=3.0/(8.0*PI)*((1.0-g*g)*(1.0+mu*mu))/((2.0+g*g)*pow(1.0+g*g-2.0*g*mu,1.5));",
    "  trans=exp(-(BR*oR+BM*1.1*oM));",
    "  return SI*(sR*BR*pR+sM*BM*pM);",
    "}",

    // great-circle arc between a and b, returns line intensity with a travelling pulse
    "float arc(vec3 q,vec3 a,vec3 b,float w,float sp){",
    "  vec3 N=normalize(cross(a,b));float d=abs(dot(q,N));",
    "  if(dot(cross(a,q),N)<0.0||dot(cross(q,b),N)<0.0)return 0.0;",
    "  float len=acos(clamp(dot(a,b),-1.0,1.0));float s=acos(clamp(dot(a,q),-1.0,1.0))/len;",
    "  float pulse=exp(-pow((fract(s-u_time*sp)-0.5)*9.0,2.0));",
    "  return smoothstep(w,0.0,d)*(0.45+1.2*pulse);",
    "}",
    "vec3 ll(float la,float lo){la=radians(la);lo=radians(lo);return vec3(cos(la)*cos(lo),sin(la),cos(la)*sin(lo));}",

    "vec3 surface(vec3 p,vec3 rd,float t,float px){",
    "  vec3 n=normalize(p);vec3 q=rotY(u_rot)*(rotX(0.95)*n);",
    "  float c=fbm(q*1.7+vec3(0.0,0.0,4.0))+0.05*n3(q*48.0)+0.025*n3(q*130.0);",
    "  float land=smoothstep(0.515,0.535,c);",
    "  float relief=fbm(q*9.0)*0.7+n3(q*38.0)*0.2+n3(q*110.0)*0.1;",
    "  vec3 lc=mix(vec3(0.07,0.055,0.03),vec3(0.17,0.125,0.065),relief);",
    "  lc=mix(lc,vec3(0.035,0.055,0.025),smoothstep(0.45,0.7,fbm(q*4.0+2.0))*0.8);",
    "  vec3 oc=mix(vec3(0.006,0.02,0.05),vec3(0.02,0.06,0.10),smoothstep(0.43,0.515,c));",
    "  vec3 alb=mix(oc,lc,land);",
    "  float ice=smoothstep(0.93,0.97,abs(q.y)+0.12*(relief-0.5));alb=mix(alb,vec3(0.32,0.34,0.36),ice);",
    "  vec3 cq=rotY(u_time*0.004)*q;",
    "  float cl=fbm(cq*3.2+vec3(fbm(cq*1.5)*1.6));",
    "  cl=smoothstep(0.47,0.72,cl);",
    "  float mu=dot(n,u_sun);float dif=max(mu,0.0);",
    "  vec3 sunc=exp(-(BR*HR+BM*HM*1.1)*1.3/max(mu+0.06,0.02));",
    "  vec3 col=alb*dif*sunc*SI;",
    "  vec3 h=normalize(u_sun-rd);float nh=max(dot(n,h),0.0);float spec=(pow(nh,900.0)*0.9+pow(nh,60.0)*0.04)*(1.0-land)*(1.0-cl);",
    "  col+=sunc*spec*dif*SI;",
    "  col=mix(col,vec3(0.78)*dif*sunc*SI,cl*0.9);",
    "  float night=smoothstep(0.06,-0.12,mu);",
    "  vec3 cc=floor(q*900.0);float city=step(0.93,hash3(cc))*hash3(cc+7.0)*smoothstep(0.55,0.8,n3(q*14.0))*land*(1.0-ice)*(1.0-cl*0.85);",
    "  col+=vec3(1.0,0.62,0.28)*city*night*min(2.0,0.4/max(px*900.0,0.2));",
    // survey grid: lines every 15 degrees; px is the angular pixel size on the surface
    "  float lat=asin(clamp(q.y,-1.0,1.0));float lon=atan(q.z,q.x);float st=PI/12.0;",
    "  float gl=min(abs(fract(lat/st+0.5)-0.5)*st,abs(fract(lon/st+0.5)-0.5)*st*cos(lat));",
    "  float grid=smoothstep(px*1.6,px*0.3,gl)*u_grid;",
    "  col=mix(col,vec3(1.0,0.93,0.8)*(0.6+SI*0.35*dif),grid*0.5);",
    // route network between clusters
    "  float w=px*1.3+0.0009;float net=0.0;",
    "  vec3 A=ll(35.0,-150.0),B=ll(20.0,-112.0),C=ll(-10.0,-132.0),D=ll(4.0,-94.0),E=ll(46.0,-116.0),G=ll(-26.0,-104.0),K=ll(10.0,-166.0);",
    "  net+=arc(n,A,B,w,0.22)+arc(n,B,D,w,0.18)+arc(n,D,G,w,0.25)+arc(n,G,C,w,0.2)+arc(n,C,A,w,0.16);",
    "  net+=arc(n,B,E,w,0.21)+arc(n,C,K,w,0.14)+arc(n,K,A,w,0.19)+arc(n,E,A,w,0.23)+arc(n,C,B,w,0.17);",
    "  vec3 nodes=vec3(0.0);float nd=0.0;",
    "  nd+=smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,A),-1.0,1.0)))+smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,B),-1.0,1.0)))+smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,C),-1.0,1.0)));",
    "  nd+=smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,D),-1.0,1.0)))+smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,E),-1.0,1.0)))+smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,G),-1.0,1.0)))+smoothstep(w*4.0,w*1.5,acos(clamp(dot(n,K),-1.0,1.0)));",
    "  net+=nd*1.2;",
    "  col+=vec3(0.95,0.5,0.32)*net*u_net*(0.8+1.8*night);",
    "  return col;",
    "}",

    "vec3 stars(vec3 rd){",
    "  vec3 c=vec3(0.0);",
    "  for(int k=0;k<2;k++){float s=k==0?260.0:620.0;vec3 p=rd*s;vec3 i=floor(p);vec3 f=fract(p)-0.5;",
    "    float h=hash3(i+float(k)*31.0);if(h>0.965){float b=(h-0.965)/0.035;vec3 o=vec3(hash3(i+1.3),hash3(i+2.7),hash3(i+5.1))-0.5;",
    "      c+=mix(vec3(1.0,0.85,0.7),vec3(0.75,0.85,1.0),hash3(i+9.0))*b*b*smoothstep(0.22,0.0,length(f-o*0.5))*(k==0?1.2:0.6);}}",
    "  return c*0.9;",
    "}",

    "void main(){",
    "  vec2 q=gl_FragCoord.xy/u_res;",
    "  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;",
    "  vec3 ro=u_ro;",
    "  vec3 ww=normalize(u_ta-ro);vec3 uu=normalize(cross(ww,vec3(0.0,1.0,0.0)));vec3 vv=cross(uu,ww);",
    "  vec3 rd=normalize(uv.x*uu+uv.y*vv+u_focal*ww);",
    "  float pxa=1.0/(u_res.y*u_focal);",
    "  vec2 hp=sph(ro,rd,R);",
    "  vec3 mc=u_moon;float MR=520.0;vec2 hm=sph(ro-mc,rd,MR);",
    "  float tmax=1e9;vec3 col=vec3(0.0);bool planet=hp.x>0.0&&hp.x<hp.y;",
    "  bool moon=hm.x>0.0&&hm.x<hm.y&&(!planet||hm.x<hp.x);",
    "  if(moon){",
    "    vec3 p=ro+rd*hm.x;vec3 n=normalize(p-mc);",
    "    float cr=fbm(n*6.0)*0.6+fbm(n*22.0)*0.4;",
    "    float dif=max(dot(n,u_sun),0.0);",
    "    col=vec3(0.26,0.25,0.235)*(0.55+0.6*cr)*dif*SI;tmax=hm.x;",
    "  }else if(planet){",
    "    tmax=hp.x;vec3 p=ro+rd*hp.x;",
    "    col=surface(p,rd,hp.x,hp.x*pxa/R);",
    "  }else{",
    "    col=stars(rd);",
    "    float mu=dot(rd,u_sun);",
    "    col+=vec3(1.0,0.96,0.9)*(smoothstep(0.99988,0.99995,mu)*400.0+pow(max(mu,0.0),4000.0)*30.0+pow(max(mu,0.0),300.0)*1.2);",
    "  }",
    "  vec3 tr;vec3 sc=scatter(ro,rd,tmax,tr);",
    "  col=col*tr+sc*(planet&&!moon?0.75:1.0);",
    "  float mu=dot(rd,u_sun);",
    "  col+=vec3(1.0,0.8,0.55)*pow(max(mu,0.0),40.0)*0.06*tr;",
    // filmic tone map, vignette, grain
    "  col=1.0-exp(-col*u_exp);",
    "  col=pow(col,vec3(0.4545));",
    "  col*=0.62+0.38*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.22);",
    "  col+=(hash3(vec3(gl_FragCoord.xy,fract(u_time)*97.0))-0.5)*0.035;",
    "  col=mix(col,vec3(0.0),u_fade);",
    "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
    "}"
  ].join("\n");

  var F = window.Film, L = F.lerp, R = 6360;
  function nrm(v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; }
  function rad(d) { return d * Math.PI / 180; }

  F.define("sintulus", {
    frag: frag,
    duration: 32,
    start: 4.2,
    chapters: [
      { t: 0, n: "01", title: "Work that runs for hours", text: "Hand it over in the morning, sign it off in the evening. Runs continue when the window is closed." },
      { t: 8, n: "02", title: "Research with evidence", text: "Numbers come from the source and from real Python, never from memory. Every figure carries its provenance." },
      { t: 16, n: "03", title: "Code across the whole project", text: "Changes across many files with a plan, checkpoints and tests — not single suggestions to piece together." },
      { t: 24, n: "04", title: "Spatial understanding", text: "Molecules, structures and scenes in 3D — rotatable in the browser, not a flat picture." }
    ],
    uniforms: function (t) {
      var ro, ta, sun, grid = 0, net = 0, ex = 0.35, rot = 0.6 + t * 0.012, moon = [1e6, 0, 0], p;
      if (t < 8) {
        // low orbit, looking at the limb while the sun comes up behind it
        p = t / 8;
        var alt = 420, dip = rad(L(12.5, 13.5, p));
        ro = [0, R + alt, 0];
        ta = [0, R + alt - Math.sin(dip) * 1000, Math.cos(dip) * 1000];
        var e = rad(L(-24.5, -17.5, F.ease(p)));
        sun = nrm([0.16, Math.sin(e), Math.cos(e)]);
        ex = L(0.9, 0.42, p);
      } else if (t < 16) {
        p = (t - 8) / 8;
        ro = [L(-1600, 1400, p), R + 2400, -2600];
        ta = [L(-500, 500, p), R - 500, 1200];
        sun = nrm([-0.55, 0.72, 0.25]);
        grid = F.ease(Math.min(1, p * 1.6));
        rot = 0.9 + t * 0.01;
        ex = 0.3;
      } else if (t < 24) {
        p = (t - 16) / 8;
        var d = L(15500, 25500, F.ease(p));
        var dir = nrm([-0.28, 0.32, -1]);
        ro = [dir[0] * d, dir[1] * d, dir[2] * d];
        ta = [0, 0, 0];
        sun = nrm([1, 0.18, 0.1]);
        net = F.ease(Math.min(1, p * 1.4));
        ex = 0.34;
      } else {
        p = (t - 24) / 8;
        var a = L(-0.55, 0.45, p), dist = 23000;
        ro = [Math.sin(a) * dist, 5200, -Math.cos(a) * dist];
        ta = [0, 0, 0];
        sun = nrm([-0.7, 0.3, -0.62]);
        moon = [4200, 3000, -11500];
        grid = 0.55;
        net = 0.5;
        ex = 0.28;
      }
      return {
        u_ro: ro, u_ta: ta, u_sun: sun, u_moon: moon, u_rot: rot,
        u_grid: grid, u_net: net, u_exp: ex, u_focal: 1.55,
        u_fade: F.cut(t, [0, 8, 16, 24, 32], 0.4)
      };
    }
  });
})();
