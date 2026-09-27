/* Sintulus 6 — looking up from deep water: light shafts through the surface, the bright
   window above, particles drifting in the column. */
Hero.define("sintulus", {
  tiles: [Hero.M.GRAPH, Hero.M.PATINA, Hero.M.BLACK, Hero.M.SAND],
  center: [
    "vec3 center(vec2 uv,float t){",
    "  vec2 src=vec2(.08,.95);",
    "  vec3 deep=vec3(.005,.03,.06),mid=vec3(.02,.2,.3),top=vec3(.25,.62,.72);",
    "  vec3 col=mix(deep,mid,smoothstep(-.6,.25,uv.y));col=mix(col,top,smoothstep(.15,.55,uv.y));",
    "  vec2 d=uv-src;float ang=atan(d.x,-d.y);float r=length(d);",
    "  float rays=fbm3(vec2(ang*9.,t*.08))*.6+fbm3(vec2(ang*23.,t*.12+4.))*.4;",
    "  rays=pow(smoothstep(.45,.85,rays),1.6)*smoothstep(1.7,.3,r)*smoothstep(.7,.0,abs(ang));",
    "  col+=vec3(.55,.85,.9)*rays*.55;",
    "  float surf=smoothstep(.36,.5,uv.y);",
    "  vec2 sq=uv*vec2(5.,14.)+vec2(t*.05,0.);float ca=abs(sin(fbm3(sq)*9.+t*.4))*.5+abs(sin(fbm3(sq*1.7+3.)*7.-t*.3))*.5;",
    "  col=mix(col,vec3(.75,.95,.98)*(.55+.6*pow(1.-ca,3.)),surf*.8);",
    "  col+=vec3(1.)*exp(-length((uv-vec2(.08,.52))*vec2(1.,2.5))*6.)*.35;",
    "  for(int i=0;i<2;i++){vec2 g=uv*(18.+float(i)*14.)+vec2(0.,t*(.15+.1*float(i)));vec2 id=floor(g);vec2 f=fract(g)-.5-(h22(id)-.5)*.7;",
    "    float p=step(.9,h12(id+float(i)*7.))*smoothstep(.06,.0,length(f));col+=vec3(.6,.85,.9)*p*.35*(1.-float(i)*.4);}",
    "  col*=1.-.35*smoothstep(.3,1.1,length(uv*vec2(.8,1.)));",
    "  return col;",
    "}"
  ].join("\n")
});
