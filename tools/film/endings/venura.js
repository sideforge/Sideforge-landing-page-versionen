/* Venura 6.5 — ridge after ridge of mountains receding into morning haze, telephoto. */
Hero.define("venura", {
  tiles: [Hero.M.TOPO, Hero.M.GRANITE, Hero.M.BLACK, Hero.M.ICE],
  center: [
    "vec3 center(vec2 uv,float t){",
    "  vec2 sp=vec2(-.3,.14);float d=length(uv-sp);",
    "  vec3 sky=mix(vec3(.98,.82,.6),vec3(.42,.52,.68),smoothstep(0.,.5,uv.y));",
    "  sky+=vec3(1.,.8,.55)*(exp(-d*3.5)*.35+exp(-d*18.)*.5)+vec3(1.,.97,.9)*smoothstep(.028,.022,d);",
    "  vec3 col=sky;",
    "  vec3 haze=vec3(.98,.8,.6);",
    "  for(int i=0;i<6;i++){",
    "    float fi=float(i),k=fi/5.;",
    "    float x=uv.x*(1.+fi*.4)+fi*5.3+t*.004*(fi+1.);",
    "    float prof=fbm3(vec2(x*1.2,fi*2.1))*.75+.25*(1.-abs(n2(vec2(x*3.2,fi+9.))*2.-1.));",
    "    float h=.08-fi*.075-fi*fi*.006+(.08+.1*k)*(prof-.45);",
    "    float aa=1.2/uRes.y;float m=smoothstep(h+aa,h-aa,uv.y);",
    "    if(m>0.){",
    "      float dist=1.-k;",
    "      vec3 base=mix(vec3(.08,.1,.12),vec3(.2,.2,.24),n2(vec2(x*8.,uv.y*20.)));",
    "      vec3 c=mix(base,haze,1.-exp(-dist*2.6));",
    "      c=mix(c,sky,.18*dist);",
    "      float below=h-uv.y;",
    "      c+=vec3(1.,.7,.4)*exp(-below*260.)*exp(-abs(uv.x-sp.x)*1.5)*(.08+.14*dist);",   // rim light on each crest
    "      c=mix(c,haze*.95,smoothstep(.06,0.,below-.0)*.0+exp(-below*14.)*.18*dist);",
    "      col=mix(col,c,m);",
    "    }",
    "  }",
    "  return col;",
    "}"
  ].join("\n")
});
