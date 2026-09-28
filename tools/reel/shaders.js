/* SideForge Reel — GLSL. The scene shader draws the film grammar of the site (tools/film/):
   macro materials under a great curved horizon, landscapes that rise out of the dark, the mark
   in hammered copper, the mark pressed into paper. Then a light bloom and a finishing pass.
   Colours are display-referred like the films; nothing is sampled from footage. */
(function (root) {
  "use strict";

  var COMMON = `#version 300 es
precision highp float;
#define PI 3.14159265
float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 h22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}
float n1(float x){float i=floor(x);float f=fract(x);return mix(h11(i),h11(i+1.),f*f*(3.-2.*f));}
const mat2 M2=mat2(.8,-.6,.6,.8);
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.97;}
float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*n2(p);p=M2*p*2.03+1.7;a*=.5;}return s/.875;}
float ridged(vec2 p){float s=0.,a=.5,w=1.;for(int i=0;i<5;i++){float n=1.-abs(n2(p)*2.-1.);n*=n;s+=a*n*w;w=clamp(n*1.6,0.,1.);p=M2*p*2.07+3.1;a*=.5;}return s;}
vec4 vor(vec2 p){vec2 n=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 id=vec2(0.);
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 r=g+h22(n+g)-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=n+g;}else if(d<d2)d2=d;}return vec4(sqrt(d1),sqrt(d2),id);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float sdBox2(vec2 p,vec2 b){vec2 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,q.y),0.);}
mat3 cam(vec3 ro,vec3 ta,float roll){vec3 w=normalize(ta-ro),u=normalize(cross(w,vec3(sin(roll),cos(roll),0.))),v=cross(u,w);return mat3(u,v,w);}
`;

  var SCENE = COMMON + `
uniform vec2 uRes; uniform float uT,uL,uP,uE,uDur,uSeed,uRise; uniform int uScene,uAA;
uniform vec4 uA,uB,uC;
out vec4 o;
const vec3 DARK=vec3(.012,.012,.016);

// ------------------------------------------------------------------ the SideForge anvil as a distance field
// baked from the logo path in reel.js; logo units (the 300 px logo.png grid), world = 1.9 wide, y up
uniform sampler2D uLogo;uniform vec4 uLogoM; // x0, y0, texels per unit, texture size (w)
uniform float uLogoH;
const float LS=1.9/282.;
vec2 toLogo(vec2 p){return vec2(p.x/LS+148.,-p.y/LS+142.5);}
float logo2(vec2 p){
  vec2 l=toLogo(p);
  vec2 t=(l-uLogoM.xy)*uLogoM.z+.5;vec2 sz=vec2(uLogoM.w,uLogoH);
  vec2 tc=clamp(t,vec2(1.),sz-1.);
  float d=texture(uLogo,tc/sz).r;
  return d+length(t-tc)/uLogoM.z*LS;
}

// ================================================================== materials: height + colour, lit alike
float hIce(vec2 p){return fbm(p*2.)*.4+.25*(1.-abs(n2(p*5.)*2.-1.));}
float hFelt(vec2 p){return n2(p*40.)*.5+n2(vec2(p.x*90.,p.y*30.)+n2(p*8.)*4.)*.3+fbm3(p*3.)*.4;}
float hCopper(vec2 p){vec4 v=vor(p*9.);return -v.x*v.x*.7+.03*n2(p*80.);}
float hSlate(vec2 p){return fbm3(vec2(p.x*1.2,p.y*6.))*.6+.2*n2(p*30.);}
float hMud(vec2 p){vec4 v=vor(p*3.);float e=v.y-v.x;return smoothstep(0.,.12,e)*(.8+.4*smoothstep(.35,0.,e))+.05*n2(p*40.);}
float hMoss(vec2 p){return fbm(p*7.)*.55+.3*fbm3(p*38.)+.15*n2(p*120.);}
float hPaint(vec2 p){float a=fbm3(p*.8)*3.;vec2 d=vec2(cos(a),sin(a));float s=dot(p,vec2(-d.y,d.x));return ridged(vec2(s*14.,dot(p,d)*1.5))*.6+fbm3(p*2.)*.3;}
// guilloché: two families of wavy rosette lines cut into brass, as on an old banknote
float guil(vec2 p){p-=vec2(uSeed*3.7+.1,uSeed*1.9-.75);float r=length(p),a=atan(p.y,p.x);
  float l1=sin(r*190.+5.*sin(a*16.+r*9.)),l2=sin(r*190.-5.*sin(a*16.-r*9.)+1.7);
  return max(smoothstep(.34,.0,abs(l1)),smoothstep(.34,.0,abs(l2)));}
float hGuil(vec2 p){return -.35*guil(p)+.015*n2(p*90.);}
float wring(vec2 p){return fract(p.y*6.+fbm3(p*vec2(.45,2.))*2.6+.6*sin(p.x*.6));}
float hWood(vec2 p){float r=wring(p);return .12*smoothstep(0.,.25,r)*smoothstep(1.,.55,r)+.06*n2(vec2(p.x*5.,p.y*320.));}
float hIron(vec2 p){vec4 v=vor(p*2.6);float e=v.y-v.x;return smoothstep(0.,.07,e)*(.55+.45*fbm3(p*5.))+.08*n2(p*50.);}
float leaf(vec2 p){return smoothstep(.55,.59,fbm3(p*1.1)*.7+fbm3(p*3.+5.)*.3);}
float hGold(vec2 p){float leaf=leaf(p);vec4 v=vor(p*15.);return leaf*(.3-.14*smoothstep(.06,0.,v.y-v.x))+.01*n2(p*80.);}
float H(int id,vec2 p){
  if(id==0)return hIce(p);if(id==1)return hFelt(p);if(id==2)return hCopper(p);if(id==3)return .02*n2(p*80.);
  if(id==4)return hSlate(p);if(id==5)return hMud(p);if(id==6)return hMoss(p);if(id==7)return hPaint(p);
  if(id==8)return hGuil(p);if(id==9)return hWood(p);if(id==10)return .01*n2(p*120.);if(id==11)return hIron(p);return hGold(p);
}
vec3 marbled(vec2 p){ // ebru, the marbled endpaper of old books
  vec2 q=p*1.1;
  for(int i=0;i<3;i++)q+=.32*vec2(sin(q.y*2.1+1.3+float(i)),sin(q.x*1.7+2.+float(i)*1.3));
  q.x+=.05*sin(q.y*34.);
  float v=fract(q.x*1.2+q.y*.25);
  vec3 c=vec3(.92,.89,.82);
  c=mix(c,vec3(.14,.22,.46),smoothstep(.02,.05,v)*smoothstep(.3,.27,v));
  c=mix(c,vec3(.85,.47,.34),smoothstep(.36,.39,v)*smoothstep(.55,.52,v));
  c=mix(c,vec3(.83,.66,.32),smoothstep(.62,.65,v)*smoothstep(.75,.72,v));
  c=mix(c,vec3(.1,.09,.08),smoothstep(.012,.0,abs(v-.31))*.8);
  return c;
}
vec3 shade(int id,vec2 p,vec2 uv,float d){
  float e=.002;float h=H(id,p),hx=H(id,p+vec2(e,0.)),hy=H(id,p+vec2(0.,e));
  float bump=id==0?.5:id==1?.35:id==2?1.4:id==3?.2:id==4?.6:id==5?1.:id==6?.9:id==7?1.3:id==8?.8:id==9?.5:id==10?.15:id==11?.9:.7;
  vec3 n=normalize(vec3(-(hx-h)/e*bump*.02,-(hy-h)/e*bump*.02,1.));
  vec3 L=normalize(vec3(-.55,.62,.55));
  float dif=clamp(dot(n,L),0.,1.);
  vec3 Hh=normalize(L+vec3(0.,0.,1.));
  float shine=id==2?60.:id==4?90.:id==8?70.:id==12?80.:30.;
  float spec=pow(clamp(dot(n,Hh),0.,1.),shine);
  vec3 c;
  if(id==0){ // ice: blue depth, white fractures, trapped bubbles
    c=mix(vec3(.03,.1,.17),vec3(.5,.7,.82),smoothstep(.15,.85,fbm(p*1.1)))*(.55+.7*dif);
    c=mix(c,vec3(.85,.93,.97),smoothstep(.025,.0,abs(fbm3(p*2.2)-.5))*.45);
    vec4 v=vor(p*6.);float r=.1+.16*h12(v.zw);float has=step(.72,h12(v.zw+3.));
    float inb=smoothstep(r,r-.02,v.x)*has;
    c=mix(c,c*1.25+vec3(.05,.08,.1),inb*.6);
    c=mix(c,c*.55,smoothstep(.012,.0,abs(v.x-r))*has*.8);
    c+=vec3(.9,.95,1.)*inb*smoothstep(.5,.85,v.x/r)*.3;
    c+=vec3(.8,.9,1.)*spec*.6;
  }else if(id==1){ // felt with a running stitch along the horizon
    c=vec3(.13,.17,.34)*(.55+.7*dif)*(.85+.3*n2(p*70.));
    float band=smoothstep(.012,.0,abs(d-.07)),dash=step(.45,fract(uv.x*14.));
    float cyl=sqrt(max(0.,1.-pow((d-.07)/.012,2.)));
    c=mix(c,vec3(.95,.46,.16)*(.45+.75*cyl)+vec3(.3)*pow(cyl,8.),band*dash);
  }else if(id==2){ // hammered copper
    vec3 cu=vec3(.78,.42,.22);
    float env=smoothstep(.2,.9,n.y*.5+.5+.3*n.x);
    c=cu*(.12+.55*dif)+cu*env*.45+vec3(1.,.8,.55)*pow(clamp(dot(n,Hh),0.,1.),120.)*2.2;
    c=mix(c,c*vec3(.55,.75,.7),smoothstep(.62,.8,fbm(p*1.5))*.5);
  }else if(id==3){ // graphite: patches of hand hatching on paper
    vec3 pap=vec3(.93,.9,.84)*(.95+.06*n2(p*50.));
    float ang=floor(fbm3(p*1.3)*5.)*.9+.4;vec2 dir=vec2(cos(ang),sin(ang));
    float s=dot(p,vec2(-dir.y,dir.x))*46.+n2(p*9.)*1.2;float al=dot(p,dir);
    float line=smoothstep(.34,.08,abs(fract(s)-.5));
    float brk=step(.35,n2(vec2(floor(s),al*7.)));
    float mask=smoothstep(.42,.56,fbm3(p*1.8+3.)+d*.9);
    c=mix(pap,vec3(.19,.19,.22)+vec3(.3)*spec,line*brk*mask*(.55+.45*n2(p*30.))*.9);
    c=mix(c,vec3(.15,.15,.17),smoothstep(.005,.0,abs(d))*.85);
  }else if(id==4){ // wet slate with droplets
    c=vec3(.11,.13,.16)*(.4+.9*dif)+vec3(.55,.65,.75)*spec*.4;
    vec4 v=vor(p*4.);float r=.08+.2*h12(v.zw);float has=step(.45,h12(v.zw+7.));
    float inD=smoothstep(r,r-.015,v.x)*has;float k=clamp(v.x/r,0.,1.);
    c=mix(c,vec3(.2,.24,.3)*(.7+.6*k),inD);
    c=mix(c,vec3(.03,.035,.045),smoothstep(.02,.0,abs(v.x-r))*has*.7);
    c+=vec3(.85,.92,1.)*inD*smoothstep(.55,.9,k)*.35;
  }else if(id==5){ // cracked dry mud
    vec4 v=vor(p*3.);float ee=v.y-v.x;
    c=mix(vec3(.55,.4,.26),vec3(.72,.58,.4),h12(v.zw))*(.35+.85*dif);
    c=mix(c,vec3(.06,.04,.03),smoothstep(.05,.0,ee));
  }else if(id==6){ // moss
    c=mix(vec3(.08,.14,.03),vec3(.5,.62,.16),smoothstep(.25,.85,h))*(.25+.95*dif);
    c=mix(c,vec3(.6,.55,.2)*(.4+.6*dif),smoothstep(.72,.85,fbm3(p*3.))*.5);
  }else if(id==7){ // impasto oil paint
    float k=fbm3(p*.7+3.);
    vec3 pa=mix(vec3(.85,.62,.2),vec3(.16,.28,.62),smoothstep(.4,.6,k));
    pa=mix(pa,vec3(.94,.92,.86),smoothstep(.62,.7,fbm3(p*1.1+9.)));
    c=pa*(.35+.8*dif)+vec3(1.)*spec*.35;
  }else if(id==8){ // guilloché brass
    float g=guil(p);
    c=vec3(.74,.57,.3)*(.3+.75*dif)*(1.-.62*g)+vec3(1.,.9,.7)*spec*1.3*(1.-g);
    c*=.9+.2*n2(p*6.);
  }else if(id==9){ // planed oak
    float r=wring(p);
    c=mix(vec3(.34,.19,.09),vec3(.63,.43,.25),smoothstep(.12,.7,r))*(.55+.6*dif)*(.85+.3*n2(vec2(p.x*4.,p.y*220.)));
    c+=vec3(1.,.85,.7)*spec*.08;
  }else if(id==10){ // marbled paper
    c=marbled(p)*(.92+.1*dif)*(.97+.05*n2(p*300.));
  }else if(id==11){ // forged iron, still warm in the seams
    vec4 v=vor(p*2.6);float ee=v.y-v.x;
    c=vec3(.08,.074,.07)*(.3+.95*dif)*(.8+.4*fbm3(p*9.))+vec3(.6,.62,.66)*spec*.12;
    float hotk=smoothstep(.04,.0,ee)*(.55+.45*n2(p*4.+uL*.4));
    c+=vec3(1.,.4,.1)*hotk*.95+vec3(1.,.72,.4)*smoothstep(.012,.0,ee)*hotk*.6;
    c+=vec3(.5,.15,.03)*smoothstep(.16,.0,ee)*.12;
  }else{ // gold leaf laid on black lacquer
    float leaf=leaf(p);
    vec3 g=vec3(.93,.7,.3)*(.3+.75*dif)+vec3(1.,.92,.65)*spec*2.;
    vec3 lq=vec3(.014,.012,.012)+vec3(.5,.45,.4)*spec*.35;
    c=mix(lq,g,leaf);
  }
  return c;
}
vec3 above(bool light,vec2 uv){
  if(light)return vec3(.93,.9,.84)*(.95+.05*n2(uv*400.)+.02*n2(vec2(uv.x*600.,uv.y*20.)));
  vec3 c=DARK;
  vec2 g=floor(uv*180.);c+=vec3(.7,.75,.8)*step(.994,h12(g+uSeed))*smoothstep(.3,.0,length(fract(uv*180.)-h22(g)))*.5;
  return c;
}
vec3 sMat(vec2 uv){
  int id=int(uA.x+.5);
  bool light=id==3||id==7||id==10;
  float z=mix(uB.z,uB.w,uE);
  uv/=z;
  if(uC.x>.5)uv.y=-uv.y;
  float R=uA.w;vec2 c=vec2(0.,mix(uA.y,uA.z,uE)-R);
  float d=R-length(uv-c);
  vec2 p=uv*1.3+vec2(uB.x,uB.y)*uL+vec2(uSeed*3.7,uSeed*1.9);
  float aa=1.4/(uRes.y*z);
  vec3 top=above(light,uv),col=top;
  if(d>-.01){
    float blur=smoothstep(.12,.7,d)*(id==3?.35:1.)*uC.z;
    float r=.035*blur;
    vec3 m=shade(id,p,uv,d);
    if(r>.001){vec3 acc=m;for(int k=0;k<6;k++){float a=float(k)*1.047+uSeed;acc+=shade(id,p+vec2(cos(a),sin(a))*r,uv,d);}m=acc/7.;}
    m*=mix(1.,.72,min(blur,1.));
    if(!light)m+=vec3(1.,.82,.6)*exp(-d*90.)*.5*(.6+.4*n1(uv.x*30.+uSeed));   // backlit rim
    col=mix(top,m,smoothstep(-aa,aa,d));
  }
  return col;
}

// ================================================================== landscapes (the closing images of the site's films)
float duneH(vec2 p){
  vec2 q=p*.045;q+=vec2(fbm3(q*.5),fbm3(q*.5+7.))*1.2;
  float f=fract(q.x*.9+q.y*.35);
  float prof=f<.72?smoothstep(0.,.72,f):1.-smoothstep(.72,1.,f);
  prof=prof*prof*(3.-2.*prof);
  return 6.5*prof*(.55+.6*fbm3(q*.6+3.))+2.*fbm3(q*1.7);
}
vec3 sDunes(vec2 uv){
  float sp=uA.x,t=uL*sp+3.;
  vec3 ro=vec3(20.+t*1.2,0.,-40.+t*2.);ro.y=duneH(ro.xz)+(sp>2.?7.:9.);
  vec3 fw=normalize(vec3(.35,sp>2.?-.035:-.06,1.)),rt=normalize(cross(vec3(0,1,0),fw)),up=cross(fw,rt);
  vec3 rd=normalize(uv.x*rt+uv.y*up+1.5*fw);
  vec3 L=normalize(vec3(.4,.07,1.));
  float mu=max(dot(rd,L),0.);
  vec3 sky=mix(vec3(.95,.58,.32),vec3(.14,.17,.32),smoothstep(-.02,.3,rd.y));
  sky+=vec3(1.,.66,.36)*(pow(mu,12.)*.35+pow(mu,500.)*1.1);
  float tt=1.;bool hit=false;
  for(int i=0;i<140;i++){vec3 p=ro+rd*tt;float h=p.y-duneH(p.xz);if(h<.004*tt){hit=true;break;}if(tt>900.)break;tt+=max(h*.5,.02*tt);}
  if(!hit)return sky*.9;
  vec3 p=ro+rd*tt;float e=.08;
  float h=duneH(p.xz);vec3 n=normalize(vec3(h-duneH(p.xz+vec2(e,0.)),e,h-duneH(p.xz+vec2(0.,e))));
  float dif=clamp(dot(n,L),0.,1.);
  float sh=1.,st=.5;for(int i=0;i<24;i++){vec3 q=p+L*st;float d=q.y-duneH(q.xz);sh=min(sh,10.*d/st);st+=clamp(d,.4,6.);if(sh<.01)break;}
  sh=clamp(sh,0.,1.);
  float rip=.5+.5*sin(dot(p.xz,vec2(2.4,.9))+fbm3(p.xz*.3)*6.);
  vec3 alb=vec3(.86,.55,.32)*(.9+.12*rip*smoothstep(80.,5.,tt));
  vec3 c=alb*(vec3(1.,.72,.45)*2.*dif*sh+vec3(.28,.26,.38)*(.4+.4*n.y));
  c+=vec3(1.,.6,.3)*pow(1.-max(dot(n,-rd),0.),4.)*.25*sh;
  c=mix(c,mix(vec3(.95,.62,.4),sky,.5),1.-exp(-tt*.004));
  return c*.9;
}
vec3 sRidges(vec2 uv){
  float t=uL*uA.x;
  vec2 sp=vec2(-.06,.17);float d=length(uv-sp);
  vec3 sky=mix(vec3(.98,.82,.6),vec3(.42,.52,.68),smoothstep(0.,.5,uv.y));
  sky+=vec3(1.,.8,.55)*(exp(-d*3.5)*.35+exp(-d*18.)*.5)+vec3(1.,.97,.9)*smoothstep(.028,.022,d);
  vec3 col=sky,haze=vec3(.98,.8,.6);
  for(int i=0;i<6;i++){
    float fi=float(i),k=fi/5.;
    float x=uv.x*(1.+fi*.4)+fi*5.3+t*.03*(fi+1.);
    float prof=fbm3(vec2(x*1.2,fi*2.1))*.75+.25*(1.-abs(n2(vec2(x*3.2,fi+9.))*2.-1.));
    float h=.08-fi*.075-fi*fi*.006+(.08+.1*k)*(prof-.45);
    float aa=1.2/uRes.y,m=smoothstep(h+aa,h-aa,uv.y);
    if(m>0.){
      float dist=1.-k;
      vec3 base=mix(vec3(.08,.1,.12),vec3(.2,.2,.24),n2(vec2(x*8.,uv.y*20.)));
      vec3 c=mix(base,haze,1.-exp(-dist*2.6));
      c=mix(c,sky,.18*dist);
      float below=h-uv.y;
      c+=vec3(1.,.7,.4)*exp(-below*260.)*exp(-abs(uv.x-sp.x)*1.5)*(.08+.14*dist);
      c=mix(c,haze*.95,exp(-below*14.)*.18*dist);
      col=mix(col,c,m);
    }
  }
  return col;
}

// ================================================================== the mark in hammered copper
vec2 mapK(vec3 p){
  float rr=.018;
  vec2 l=toLogo(p.xy);
  float hz=.33-.13*smoothstep(140.,152.,l.y)*(1.-smoothstep(184.,189.,l.y))-.03*step(189.,l.y);
  hz=mix(hz,mix(.05,.19,smoothstep(7.,93.,l.x)),step(l.x,97.));   // the horn tapers to its point
  vec2 w=vec2(logo2(p.xy)+rr,abs(p.z)-hz+rr);
  float dk=min(max(w.x,w.y),0.)+length(max(w,0.))-rr;
  float df=p.y+.4885;
  return dk<df?vec2(dk,1.):vec2(df,2.);
}
vec3 envK(vec3 r){
  r.xz=rot(uL*.09)*r.xz;
  float az=atan(r.x,r.z);
  vec3 c=vec3(.012,.011,.012)+vec3(.05,.035,.028)*smoothstep(-.2,.8,r.y);
  c+=vec3(1.,.9,.78)*2.1*smoothstep(.4,.1,abs(az-1.))*smoothstep(1.,.35,abs(r.y-.1));
  c+=vec3(.62,.72,.9)*.8*smoothstep(.22,.05,abs(az+2.3))*smoothstep(.9,.3,abs(r.y));
  c+=vec3(.9,.85,.8)*.3*smoothstep(.7,.95,r.y);
  c+=vec3(1.,.88,.74)*2.6*smoothstep(.8,.15,abs(az+.2))*smoothstep(-.15,.45,r.y)*smoothstep(1.,.65,r.y);   // big soft key above the lens
  return c;
}
vec3 markShade(vec3 p,vec3 rd){
  vec2 e=vec2(.0008,-.0008);
  vec3 n=normalize(e.xyy*mapK(p+e.xyy).x+e.yyx*mapK(p+e.yyx).x+e.yxy*mapK(p+e.yxy).x+e.xxx*mapK(p+e.xxx).x);
  vec3 an=abs(n);
  vec2 q=(an.z>.7?p.xy:an.y>.7?p.xz:p.zy)*3.6+(n.z<-.7?7.:0.);float ee=.002,h=hCopper(q);
  vec2 g=vec2(hCopper(q+vec2(ee,0.))-h,hCopper(q+vec2(0.,ee))-h)/ee*(n.y>.7?-.005:-.011);
  vec3 pn=an.z>.7?vec3(g,0.):an.y>.7?vec3(g.x,0.,g.y):vec3(0.,g.y,g.x);
  n=normalize(n+pn);
  vec3 r=reflect(rd,n);
  float fr=pow(1.-max(dot(n,-rd),0.),5.);
  vec3 F0=vec3(.95,.58,.42);
  vec3 c=envK(r)*(F0+(1.-F0)*fr)+vec3(.78,.42,.22)*(.04+.16*max(dot(n,normalize(vec3(-.4,.7,.6))),0.));
  c=mix(c,c*vec3(.6,.78,.72),smoothstep(.64,.82,fbm(p.xy*2.))*.35);
  return c;
}
vec3 sMark(vec2 uv){
  float yw=mix(uA.x,uA.y,uE),dist=mix(uA.z,uA.w,uE),pt=mix(uB.x,uB.y,uE);
  vec3 ta=vec3(uC.x,uC.y,0.),ro=ta+dist*vec3(cos(pt)*sin(yw),sin(pt),cos(pt)*cos(yw));
  vec3 rd=cam(ro,ta,0.)*normalize(vec3(uv,uC.z));
  vec3 bg=DARK+vec3(.06,.035,.022)*exp(-length(uv-vec2(0.,.08))*3.2);
  float t=0.;vec2 h;
  for(int i=0;i<120;i++){h=mapK(ro+rd*t);if(h.x<.0004*t||t>30.)break;t+=h.x;}
  vec3 col=bg;
  if(t<30.){
    vec3 p=ro+rd*t;
    if(h.y<1.5)col=markShade(p,rd);
    else{
      vec3 r=vec3(rd.x,-rd.y,rd.z);float tr=.01;vec2 hr;
      for(int i=0;i<60;i++){hr=mapK(p+r*tr);if(hr.x<.001||tr>8.)break;tr+=hr.x;}
      float fr=.05+.45*pow(1.-max(-rd.y,0.),4.);
      vec3 rc=(tr<8.&&hr.y<1.5)?markShade(p+r*tr,r)*exp(-tr*1.8):vec3(0.);
      col=DARK+rc*fr;
      col=mix(col,bg,smoothstep(3.,9.,t));
    }
  }
  return col;
}

// ================================================================== the mark pressed into paper (the ink is on the type layer)
float press(vec2 uv,float sc){return -smoothstep(.0022,-.0012,logo2((uv-vec2(0.,.095))/sc)*sc);}
vec3 sEnd(vec2 uv){
  vec3 pap=vec3(.965,.955,.935)*(.975+.03*n2(uv*420.)+.015*n2(vec2(uv.x*900.,uv.y*25.))-.02*fbm3(uv*6.));
  pap*=.93+.07*smoothstep(1.1,0.,length(uv-vec2(-.12,.25)));
  float sc=.12061*(1.+.03*uL/5.);
  float land=smoothstep(.28,.45,uL);
  vec2 o=vec2(-.7,.7)*.0016;
  float s=press(uv+o,sc)-press(uv-o,sc);
  pap*=1.+s*.55*land;
  return pap;
}

vec3 scene(vec2 uv){
  if(uScene==0)return sMat(uv);if(uScene==1)return sMark(uv);if(uScene==2)return sDunes(uv);
  if(uScene==3)return sRidges(uv);if(uScene==4)return sEnd(uv);return above(false,uv);
}
void main(){
  vec3 acc=vec3(0.);
  for(int i=0;i<4;i++){
    if(i>=uAA)break;
    vec2 off=uAA==1?vec2(0.):vec2(i==0||i==2?.25:-.25,i<2?.25:-.25);
    acc+=scene(((gl_FragCoord.xy+off)-.5*uRes)/uRes.y);
  }
  vec3 col=acc/float(uAA);
  if(uRise>=0.){ // the image rises like a limb out of the dark
    vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
    float R=1.5,k=1.-pow(1.-clamp(uRise,0.,1.),3.),top=mix(-.62,.58,k);
    float d=R-length(uv-vec2(0.,top-R));
    col=mix(DARK,col,smoothstep(-.004,.08,d))+vec3(1.,.72,.45)*exp(-abs(d)*60.)*.35*(1.-smoothstep(.7,1.,uRise));
  }
  o=vec4(max(col,0.),1.);
}
`;

  var VERT = `#version 300 es
in vec2 p;out vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

  // bright pass: only what is really bright (the sun, speculars, hot seams) blooms
  var BRIGHT = `#version 300 es
precision highp float;in vec2 v;out vec4 o;
uniform sampler2D uS,uF;uniform float uZoom;uniform vec2 uShake;
void main(){
  vec2 uv=(v-.5)/uZoom+.5+uShake;
  vec3 c=texture(uS,uv).rgb+texture(uF,uv).rgb;
  float b=max(max(c.r,c.g),c.b);float k=clamp(b-.85,0.,1.);
  o=vec4(c*k*k/max(b,1e-4),1.);
}`;

  var BLUR = `#version 300 es
precision highp float;in vec2 v;out vec4 o;uniform sampler2D uS;uniform vec2 uDir;
void main(){
  vec3 c=texture(uS,v).rgb*.227;
  c+=(texture(uS,v+uDir*1.3846).rgb+texture(uS,v-uDir*1.3846).rgb)*.3162;
  c+=(texture(uS,v+uDir*3.2308).rgb+texture(uS,v-uDir*3.2308).rgb)*.0703;
  o=vec4(c,1.);
}`;

  var FINAL = COMMON + `
in vec2 v;out vec4 o;
uniform sampler2D uS,uB4,uB8,uF,uX;
uniform float uZoom,uRad,uCA,uFlash,uFade,uExp,uT,uGrain;uniform vec2 uShake,uDir;uniform vec3 uFlashC;uniform vec2 uRes;
vec3 src(vec2 uv){return texture(uS,uv).rgb+texture(uF,uv).rgb;}
vec3 shoulder(vec3 c){return mix(c,.82+.18*(1.-exp(-(c-.82)/.18)),step(.82,c));}
void main(){
  vec2 c0=v-.5;
  vec2 uv=c0/uZoom+.5+uShake;
  vec3 col=vec3(0.);
  if(uRad+length(uDir)>.0005){
    for(int i=0;i<16;i++){
      float k=(float(i)+h12(gl_FragCoord.xy+uT))/16.-.5;
      col+=src(uv+uDir*k-(uv-.5)*uRad*k);
    }
    col/=16.;
  }else{
    vec2 d=(uv-.5)*uCA;
    col=vec3(src(uv-d).r,src(uv).g,src(uv+d).b);
  }
  col+=texture(uB4,uv).rgb*.22+texture(uB8,uv).rgb*.3;
  col*=uExp;
  col=shoulder(col);
  // a light hand: warm the highlights a touch, keep the paper paper
  float l=dot(col,vec3(.2126,.7152,.0722));
  col=mix(col,col*vec3(1.02,1.,.97),smoothstep(.4,1.,l));
  vec2 q=v;col*=.82+.18*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.25);
  vec4 tx=texture(uX,v+uShake*.5);
  col=mix(col,tx.rgb,tx.a);
  col=mix(col,uFlashC,clamp(uFlash,0.,1.));
  col*=uFade;
  col+=(h12(gl_FragCoord.xy*1.37+fract(uT*7.31)*97.)-.5)*uGrain;
  o=vec4(clamp(col,0.,1.),1.);
}`;

  var SH = { SCENE: SCENE, VERT: VERT, BRIGHT: BRIGHT, BLUR: BLUR, FINAL: FINAL };
  if (typeof module !== "undefined" && module.exports) module.exports = SH; else root.SH = SH;
})(this);
