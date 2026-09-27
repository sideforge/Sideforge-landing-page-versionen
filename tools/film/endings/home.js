/* Home — a dune field at the last light, seen from low over the sand; the camera drifts
   slowly forward. Raymarched heightfield, soft shadows, haze towards the sun. */
Hero.define("home", {
  tiles: [Hero.M.KRAFT, Hero.M.STEEL, Hero.M.BLACK, Hero.M.ROCK],
  center: [
    "float duneH(vec2 p){",
    "  vec2 q=p*.045;q+=vec2(fbm3(q*.5),fbm3(q*.5+7.))*1.2;",
    "  float a=q.x*.9+q.y*.35;",
    "  float f=fract(a);",
    "  float prof=f<.72?smoothstep(0.,.72,f):1.-smoothstep(.72,1.,f)*1.;",   // long windward slope, steep lee face
    "  prof=prof*prof*(3.-2.*prof);",
    "  float b=fbm3(q*.6+3.);",
    "  return 6.5*prof*(.55+.6*b)+2.*fbm3(q*1.7);",
    "}",
    "float march(vec3 ro,vec3 rd){float t=1.;for(int i=0;i<140;i++){vec3 p=ro+rd*t;float h=p.y-duneH(p.xz);if(h<.004*t)return t;if(t>900.)break;t+=max(h*.5,.02*t);}return -1.;}",
    "vec3 center(vec2 uv,float t){",
    "  vec3 ro=vec3(20.+t*1.2,12.,-40.+t*2.);ro.y=duneH(ro.xz)+9.;",
    "  vec3 fw=normalize(vec3(.35,-.06,1.)),rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);",
    "  vec3 rd=normalize(uv.x*rt+uv.y*up+1.6*fw);",
    "  vec3 L=normalize(vec3(.25,.07,1.));",
    "  float mu=max(dot(rd,L),0.);",
    "  vec3 sky=mix(vec3(.95,.58,.32),vec3(.14,.17,.32),smoothstep(-.02,.3,rd.y));",
    "  sky+=vec3(1.,.66,.36)*(pow(mu,12.)*.35+pow(mu,500.)*1.1);",
    "  float tt=march(ro,rd);",
    "  if(tt<0.)return sky*.9;",
    "  vec3 p=ro+rd*tt;float e=.08;",
    "  float h=duneH(p.xz);vec3 n=normalize(vec3(h-duneH(p.xz+vec2(e,0.)),e,h-duneH(p.xz+vec2(0.,e))));",
    "  float dif=clamp(dot(n,L),0.,1.);",
    "  float sh=1.;float st=.5;for(int i=0;i<24;i++){vec3 q=p+L*st;float d=q.y-duneH(q.xz);sh=min(sh,10.*d/st);st+=clamp(d,.4,6.);if(sh<.01)break;}",
    "  sh=clamp(sh,0.,1.);",
    "  float rip=.5+.5*sin(dot(p.xz,vec2(2.4,.9))+fbm3(p.xz*.3)*6.);",
    "  vec3 alb=vec3(.86,.55,.32)*(.9+.12*rip*smoothstep(80.,5.,tt));",
    "  vec3 c=alb*(vec3(1.,.72,.45)*2.*dif*sh+vec3(.28,.26,.38)*(.4+.4*n.y));",
    "  c+=vec3(1.,.6,.3)*pow(1.-max(dot(n,-rd),0.),4.)*.25*sh;",
    "  float fog=1.-exp(-tt*.004);",
    "  c=mix(c,mix(vec3(.95,.62,.4),sky,.5),fog);",
    "  return c*.9;",
    "}"
  ].join("\n")
});
