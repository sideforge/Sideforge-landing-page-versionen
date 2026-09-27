/* SideAI hero — "lakeScene" as a launch collage.
   Drop-in replacement for the fragment shader of the hero on /en/ai: same uniforms,
   palettes, 60 s day and composition. The lake is rendered in 3D (terrain, reflecting
   water, clouds, mist, moon and stars) and seen through a window in a collage of material
   photographs — yellow paper, slate, black card, moss. During the intro (uIntro 0 → 1)
   the tiles are laid down and the window opens almost to full width; the materials stay
   as narrow strips at the edges. */
window.LAKE_REALISTIC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define TAU 6.28318530718
#define LOOP 60.0
varying vec2 vUv;
uniform vec2 uRes;
uniform float uAspect;
uniform float uLoop;
uniform float uIntro;
uniform vec2 uPointer;
uniform vec3 uSkyTop;
uniform vec3 uSkyHor;
uniform vec3 uSunCol;
uniform vec3 uCloud;
uniform vec3 uFar;
uniform vec3 uSnowLit;
uniform vec3 uSnowShade;
uniform vec3 uMid;
uniform vec3 uHills;
uniform vec3 uShore;
uniform vec3 uFog;
uniform vec4 uSun;
uniform vec4 uMoon;
uniform vec4 uMisc;
uniform vec4 uLife;

const float FOCAL = 1.7;
const float CAMH = 1.0;

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
// value noise with derivatives, range [-1, 1]
vec3 nd(vec2 x) {
  vec2 i = floor(x); vec2 f = fract(x);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a = hash12(i), b = hash12(i + vec2(1.0, 0.0)), c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
  float k1 = b - a, k2 = c - a, k4 = a - b - c + d;
  return vec3(-1.0 + 2.0 * (a + k1 * u.x + k2 * u.y + k4 * u.x * u.y), 2.0 * du * vec2(k1 + k4 * u.y, k2 + k4 * u.x));
}
const mat2 M2 = mat2(0.8, -0.6, 0.6, 0.8);
// eroded fbm: ridges stay sharp, valleys smooth
float efbm(vec2 p, int oct) {
  float a = 0.0, b = 1.0; vec2 d = vec2(0.0);
  for (int i = 0; i < 9; i++) { if (i >= oct) break; vec3 n = nd(p); d += n.yz; a += b * n.x / (1.0 + dot(d, d)); b *= 0.5; p = M2 * p * 2.03; }
  return a;
}
float ridged(vec2 p, int oct) {
  float a = 0.0, b = 0.55, w = 1.0;
  for (int i = 0; i < 8; i++) { if (i >= oct) break; float n = 1.0 - abs(nd(p).x); n *= n; a += b * n * w; w = clamp(n * 1.8, 0.0, 1.0); b *= 0.5; p = M2 * p * 2.07 + 3.1; }
  return a;
}
float fbm4(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * n2(p); p = M2 * p * 2.02 + 1.7; a *= 0.5; } return s / 0.9375; }
float wave(float turns, float phase) { return sin(TAU * turns * uLoop / LOOP + phase); }
float segment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

// ---------------------------------------------------------------- terrain (units ~10 m)
// The scene is laid out from the original composition: each layer's skyline is the painted
// one, converted to a real height at that layer's distance, then given depth and relief.
float n1(float x) { float i = floor(x); float f = fract(x); float u = f * f * (3.0 - 2.0 * f); return mix(hash11(i), hash11(i + 1.0), u); }
float crest(float x) { float s = 0.0, a = 0.55, f = 1.0; for (int i = 0; i < 5; i++) { float v = n1(x * f + float(i) * 17.3); v = 1.0 - abs(v * 2.0 - 1.0); s += a * v * v; f *= 2.13; a *= 0.46; } return s; }
float soft(float x) { float s = 0.0, a = 0.5, f = 1.0; for (int i = 0; i < 4; i++) { s += a * n1(x * f + float(i) * 5.1); f *= 2.0; a *= 0.5; } return s; }
const float PITCH = 0.17467;               // atan(0.30 / FOCAL): the horizon sits at y = -0.30
float hAt(float z, float ys) { return CAMH + z * tan(PITCH + atan(ys / FOCAL)); }
float xsOf(float x, float z) { return FOCAL * x / max(z, 0.5); }
float sideOf(float xs, float a, float b) { return smoothstep(a, b, abs(xs) / (uAspect * 0.5)); }
const float ZF = 430.0;                    // the range
const float ZM = 175.0;                    // the ridge across the far end
// a valley: the lake between two wooded slopes, closed by a ridge, the range behind
const float HW = 10.0;                     // half-width of the lake
float H(vec2 p, int oct) {
  float x = p.x, z = p.y, ax = abs(x);
  float n = efbm(p * 0.05, oct);
  // the range: skyline from the original, faces falling towards us, ribbed with gullies
  float xsF = xsOf(x, ZF);
  float yF = -0.235 + mix(0.13, 0.30, sideOf(xsF, 0.05, 0.75)) * crest(xsF * 1.35 + 3.0);
  float cF = hAt(ZF, yF);
  float r = ridged(vec2(x * 0.011, z * 0.016) + vec2(0.0, 1.0), oct);
  float face = smoothstep(ZF - 140.0, ZF - 10.0, z + 50.0 * (r - 0.5));
  float far = (cF * (0.7 + 0.3 * r) + 2.0 * n) * face - 2.0 * (1.0 - face);
  // the ridge across the far end: soft wooded humps
  float xsM = xsOf(x, ZM);
  float yM = -0.262 + mix(0.07, 0.15, sideOf(xsM, 0.10, 0.90)) * soft(xsM * 2.2 + 11.0);
  float fm = smoothstep(ZM - 45.0, ZM, z);
  float mid = (hAt(ZM, yM) * (0.85 + 0.15 * efbm(p * 0.05 + 3.0, oct))) * fm - 2.0 * (1.0 - fm);
  // the valley sides: slopes rising from the shore, a wooded crest along the top
  float shoreX = HW + 2.5 * nd(vec2(z * 0.04, 3.0)).x;
  float crestH = 8.5 + 3.0 * n + 2.0 * nd(vec2(z * 0.02, 7.0)).x;
  float slope = (ax - shoreX) * (0.3 + 0.08 * n);
  float valley = min(slope, crestH + 1.5 * efbm(p * 0.02 + 7.0, oct) + 0.08 * max(0.0, slope - crestH)) + 0.6 * n;
  float trees = 0.3 * n2(p * 2.2) + 0.18 * n2(p * 5.1 + 9.0);
  valley += trees * smoothstep(-0.5, 1.0, valley);
  valley = mix(valley, -2.0, smoothstep(ZM - 10.0, ZM + 30.0, z));
  // the shore we stand on
  float xs = xsOf(x, z);
  float yS = -0.465 + 0.035 * soft(xs * 4.0 + 5.0) + 0.06 * pow(abs(xs) / (uAspect * 0.5), 3.0);
  float shore = -2.0 + 0.0 * yS;
  return max(max(far, mid), max(valley, shore));
}
float march(vec3 ro, vec3 rd, float tmax) {
  float t = 2.0;
  for (int i = 0; i < 200; i++) {
    vec3 p = ro + rd * t; float h = p.y - H(p.xz, 5);
    if (h < 0.0015 * t) return t;
    if (t > tmax) return 1e9;
    t += max(0.45 * h, 0.006 * t);
  }
  return t;  // ran out of steps while skimming a crest: treat as a hit
}
vec3 normalH(vec2 p, float e, int oct) {
  float h = H(p, oct);
  return normalize(vec3(h - H(p + vec2(e, 0.0), oct), e, h - H(p + vec2(0.0, e), oct)));
}
float softShadow(vec3 ro, vec3 rd) {
  float r = 1.0, t = 0.2;
  for (int i = 0; i < 28; i++) { vec3 p = ro + rd * t; float h = p.y - H(p.xz, 4); r = min(r, 12.0 * h / t); t += clamp(h, 0.3, 12.0); if (r < 0.02 || t > 250.0) break; }
  return clamp(r, 0.0, 1.0);
}

// ---------------------------------------------------------------- camera, sun, moon
vec3 camRay(vec2 s) {
  float pitch = atan(0.30 / FOCAL);
  vec3 f = vec3(0.0, sin(pitch), cos(pitch));
  vec3 u = vec3(0.0, cos(pitch), -sin(pitch));
  return normalize(s.x * vec3(1.0, 0.0, 0.0) + s.y * u + FOCAL * f);
}
vec3 sunRay() { return camRay(vec2(uSun.x * uAspect, uSun.y) + uPointer * 0.006); }
vec3 moonRay() { return camRay(vec2(uMoon.x * uAspect, uMoon.y) + uPointer * 0.006); }
float daylight() { return uSun.w * smoothstep(-0.26, -0.06, uSun.y); }
float lowSun() { return 1.0 - smoothstep(-0.1, 0.2, uSun.y); }
// light comes from the sun's side but higher than its screen position, so faces model well
vec3 lightDir() {
  vec3 s = mix(moonRay(), sunRay(), step(0.5, uSun.w));
  return normalize(vec3(s.x * 1.4, max(s.y, -0.02) * 1.6 + 0.16, s.z * 0.55));
}
vec3 lightCol() {
  vec3 day = uSunCol * 1.2 * mix(vec3(1.0), vec3(1.12, 0.86, 0.66), lowSun() * 0.6);
  return mix(vec3(0.5, 0.58, 0.85) * 0.28 * uMoon.w, day, daylight());
}

// ---------------------------------------------------------------- sky
vec3 skyGrad(vec3 rd) {
  vec3 col = mix(uSkyHor, uSkyTop, pow(smoothstep(-0.02, 0.42, rd.y), 0.8));
  float mu = max(dot(rd, sunRay()), 0.0);
  col += uSunCol * uSun.w * (pow(mu, 8.0) * 0.06 + pow(mu, 60.0) * 0.12 + pow(mu, 600.0) * 0.3) * mix(1.0, 1.4, lowSun());
  col += vec3(0.7, 0.78, 1.0) * pow(max(dot(rd, moonRay()), 0.0), 200.0) * 0.1 * uMoon.w;
  return col;
}
float cloudRaw(vec2 q) { float s = 0.0, a = 0.5; for (int i = 0; i < 6; i++) { s += a * n2(q); q = M2 * q * 2.05 + 3.3; a *= 0.5; } return s / 0.984; }
float cloudField(vec2 q) {
  float f = uLoop / LOOP;
  vec2 dr = vec2(4.0, 0.8);
  return mix(cloudRaw(q + dr * f), cloudRaw(q + dr * (f - 1.0)), f);
}
vec3 sky(vec3 rd, bool bodies) {
  vec3 col = skyGrad(rd);
  if (bodies) {
    if (uMisc.x > 0.01) {
      vec2 sp = rd.xy / max(rd.z, 0.2) * 90.0;
      vec2 id = floor(sp); vec2 h = hash22(id);
      float st = step(0.93, h.x) * (1.0 - smoothstep(0.05, 0.3, length(fract(sp) - hash22(id + 3.0))));
      float tw = 0.65 + 0.35 * wave(floor(6.0 + h.y * 20.0), h.x * 60.0);
      col += vec3(0.95, 0.95, 1.0) * st * tw * uMisc.x * smoothstep(0.02, 0.2, rd.y) * mix(0.4, 1.0, h.y);
      float band = exp(-pow((rd.y - 0.3 + rd.x * 0.4) * 6.0, 2.0)) * fbm4(rd.xy * vec2(6.0, 14.0));
      col += vec3(0.7, 0.76, 1.0) * band * 0.07 * uMisc.x;
    }
    // sun disc, limb darkened
    float R = uSun.z * 0.62 / FOCAL;
    float a = acos(clamp(dot(rd, sunRay()), -1.0, 1.0)) / R;
    if (uSun.w > 0.001 && a < 1.2) col = mix(col, mix(uSunCol, vec3(1.0, 0.99, 0.96), 0.6) * (0.85 + 0.15 * sqrt(max(0.0, 1.0 - a * a))) * 1.2, (1.0 - smoothstep(0.94, 1.0, a)) * uSun.w);
    // moon: a lit crescent with maria and earthshine
    vec3 m = moonRay(); float MR = uMoon.z * 0.75 / FOCAL;
    vec3 rr = normalize(cross(vec3(0.0, 1.0, 0.0), m)); vec3 uu = cross(m, rr);
    vec2 d = vec2(-dot(rd - m, rr), dot(rd - m, uu)) / MR;
    float r = length(d);
    if (uMoon.w > 0.001 && r < 1.1 && dot(rd, m) > 0.0) {
      vec3 n = vec3(d, sqrt(max(0.0, 1.0 - r * r)));
      float lit = smoothstep(-0.06, 0.1, dot(n, normalize(vec3(-0.8, 0.2, -0.56))));
      float mar = smoothstep(0.45, 0.7, fbm4(d * 2.2 + 3.0));
      vec3 face = vec3(0.95, 0.94, 0.9) * (1.0 - 0.22 * mar) * lit + mix(uSkyTop, vec3(0.3, 0.34, 0.48), 0.3) * (1.0 - lit);
      col = mix(col, face, (1.0 - smoothstep(0.94, 1.0, r)) * uMoon.w);
    }
  }
  // cloud deck 70 units up, in perspective
  if (rd.y > 0.01 && uMisc.w > 0.01) {
    float t = (70.0 - CAMH) / rd.y;
    vec2 q = rd.xz * t * 0.03;
    float cover = mix(0.72, 0.6, uMisc.w);
    float dns = cloudField(q);
    float m = smoothstep(cover, cover + 0.07, dns) * smoothstep(0.03, 0.12, rd.y);
    if (m > 0.0) {
      vec3 L = lightDir();
      float dl = cloudField(q + L.xz * 0.05);
      float lit = clamp(0.6 + (dns - dl) * 7.0, 0.0, 1.0);
      float thick = smoothstep(cover, cover + 0.3, dns);
      vec3 shade = mix(uCloud * 0.62, uSkyTop, 0.3);
      vec3 c = mix(shade, uCloud * 1.06 + lightCol() * 0.06, lit * (1.0 - thick * 0.45));
      c += uSunCol * uSun.w * (1.0 - thick) * pow(max(dot(rd, sunRay()), 0.0), 12.0) * 0.8;
      float far = smoothstep(900.0, 3500.0, t);
      c = mix(c, skyGrad(rd), far);
      col = mix(col, c, m * uMisc.w * (1.0 - far * 0.6));
    }
  }
  return col;
}

// ---------------------------------------------------------------- terrain shading
// real materials; the hour's palette only colours the light and the sky around them
const vec3 FOREST = vec3(0.045, 0.075, 0.05);
const vec3 MEADOW = vec3(0.11, 0.14, 0.06);
const vec3 ROCK = vec3(0.30, 0.29, 0.28);
const vec3 SNOW = vec3(0.92, 0.94, 0.97);
const vec3 BANK = vec3(0.12, 0.11, 0.09);
vec3 shadeTerrain(vec3 p, vec3 rd, float t) {
  int oct = 8; if (t > 60.0) oct = 7; if (t > 250.0) oct = 6;
  vec3 n = normalH(p.xz, 0.004 + 0.0012 * t, oct);
  vec3 L = lightDir();
  float dif = clamp(dot(n, L), 0.0, 1.0);
  float sh = dif > 0.0 ? softShadow(p + n * 0.05, L) : 0.0;
  float z = p.z;
  float r1 = nd(p.xz * 0.9).x, r2 = nd(p.xz * 4.0).x;
  float onRange = smoothstep(ZF - 170.0, ZF - 110.0, z);
  vec3 alb;
  if (onRange > 0.5) {
    float xsF = xsOf(p.x, ZF);
    float cF = hAt(ZF, -0.235 + mix(0.13, 0.30, sideOf(xsF, 0.05, 0.75)) * crest(xsF * 1.35 + 3.0));
    float rel = p.y / max(cF, 1.0);
    vec3 rock = ROCK * (0.75 + 0.35 * (0.5 + 0.5 * r1)) * (0.9 + 0.15 * r2);
    float low = 1.0 - smoothstep(0.2, 0.32, rel + 0.05 * r1);
    rock = mix(rock, FOREST * 1.3, low * smoothstep(0.3, 0.6, n.y));
    float snow = smoothstep(0.5, 0.6, rel + 0.12 * r1 + 0.06 * r2 + (n.y - 0.6) * 0.4);
    alb = mix(rock, SNOW, snow);
  } else {
    // spruce forest, with lighter crowns where the canopy catches light, meadows on gentle ground
    float canopy = 0.5 + 0.5 * nd(p.xz * 7.0).x;
    alb = FOREST * (0.7 + 0.7 * canopy * canopy);
    alb = mix(alb, MEADOW, smoothstep(0.9, 0.97, n.y) * (1.0 - smoothstep(0.5, 2.0, p.y)) * 0.6);
    float bank = 1.0 - smoothstep(0.02, 0.3, p.y);
    alb = mix(alb, BANK, bank);
    float near = 1.0 - smoothstep(6.0, 10.0, z);
    float stones = smoothstep(0.35, 0.7, nd(p.xz * 5.0).x);
    vec3 bankC = mix(MEADOW * 0.7, BANK * 0.9, stones) * (0.8 + 0.4 * (0.5 + 0.5 * nd(p.xz * 14.0).x));
    alb = mix(alb, bankC, near);
  }
  vec3 sunL = lightCol() * 2.2;
  vec3 skyL = mix(uSkyHor, uSkyTop, 0.6) * (0.55 + 0.45 * n.y) * 0.9;
  vec3 col = alb * (skyL + sunL * dif * mix(0.12, 1.0, sh));
  col += sunL * 0.05 * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * daylight();
  if (uLife.z > 0.01 && z > ZM - 40.0 && z < ZM + 5.0 && p.y < 1.4) {
    vec2 g = p.xz * vec2(0.8, 0.3);
    float li = step(0.84, hash12(floor(g))) * (1.0 - smoothstep(0.06, 0.28, length(fract(g) - 0.5)));
    col += vec3(1.0, 0.72, 0.4) * li * uLife.z * 1.6;
  }
  return col;
}
vec3 aerial(vec3 col, vec3 rd, float t) {
  float f = 1.0 - exp(-t * 0.0019);
  vec3 haze = mix(uSkyHor, uFog, 0.35) + uSunCol * pow(max(dot(rd, sunRay()), 0.0), 8.0) * 0.18 * uSun.w;
  return mix(col, haze, f);
}
// low mist over the far end of the lake, breathing with the loop
vec3 mist(vec3 col, vec3 rd, float t) {
  if (rd.y > 0.02) return col;
  vec3 p = vec3(0.0, CAMH, 0.0) + rd * t;
  float band = exp(-max(p.y, 0.0) * 6.0) * smoothstep(60.0, 160.0, t) * smoothstep(0.0, -0.01, rd.y);
  float fm = fbm4(vec2(p.x * 0.05 + 0.4 * wave(1.0, 0.0), p.z * 0.02));
  return mix(col, uFog + lightCol() * 0.04, band * (0.35 + 0.65 * fm) * uMisc.y * 0.9);
}
vec3 world(vec3 ro, vec3 rd, bool bodies) {
  float t = rd.y < 0.35 ? march(ro, rd, 900.0) : 1e9;
  if (t < 1e8) return mist(aerial(shadeTerrain(ro + rd * t, rd, t), rd, t), rd, t);
  return sky(rd, bodies);
}

// ---------------------------------------------------------------- birds and a shooting star
float bird(vec2 p, vec2 c, float s, float flap) {
  vec2 q = (p - c) / s; q.x = abs(q.x);
  float tip = 0.55 * flap; vec2 elbow = vec2(0.46, 0.18 + tip * 0.35);
  return min(segment(q, vec2(0.0), elbow), segment(q, elbow, vec2(1.0, tip))) * s;
}
vec3 birds(vec3 col, vec2 p, float px) {
  if (uLife.x < 0.01) return col;
  float ink = 0.0;
  for (int f = 0; f < 2; f++) {
    float ff = float(f);
    float u = (uLoop - mix(5.0, 26.0, ff)) / mix(20.0, 17.0, ff);
    if (u < 0.0 || u > 1.0) continue;
    float dir = mix(1.0, -1.0, ff);
    float span = uAspect * 0.62;
    vec2 lead = vec2(dir * mix(-span, span, u), mix(0.315, -0.19, ff) + 0.012 * sin(u * 6.0));
    float s = mix(0.009, 0.006, ff);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float row = floor((fi + 1.0) * 0.5);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 off = vec2(-dir * row * 2.6 * s, side * row * 1.1 * s + (hash11(fi + ff * 7.0) - 0.5) * s * 1.4);
      vec2 c = lead + off + vec2(0.0, 0.25 * s * wave(floor(3.0 + fi), fi * 1.7));
      float d = bird(p, c, s, wave(132.0 + fi * 6.0, fi * 2.1 + ff));
      ink = max(ink, 1.0 - smoothstep(s * 0.05, s * 0.05 + px, d));
    }
  }
  return mix(col, uShore * 0.55, ink * 0.75 * uLife.x);
}
vec3 shootingStar(vec3 col, vec2 p, float px) {
  float u = (uLoop - 51.0) / 1.1;
  if (uLife.w < 0.01 || u < 0.0 || u > 1.0) return col;
  vec2 a = vec2(0.05 * uAspect, 0.38); vec2 b = vec2(0.30 * uAspect, 0.27);
  vec2 head = mix(a, b, u); vec2 dir = normalize(b - a);
  vec2 tail = head - dir * 0.11 * sin(u * 3.14159);
  float along = clamp(dot(p - tail, dir) / max(length(head - tail), 1e-4), 0.0, 1.0);
  float line = (1.0 - smoothstep(px * 0.4, px * 1.4, segment(p, tail, head))) * along * along * sin(u * 3.14159);
  return col + vec3(1.0, 0.96, 0.88) * line * uLife.w * 1.2;
}

// loop-periodic wave normal on the water; ripples fade with distance
vec3 waterNormal(vec2 p, float t) {
  vec2 g = vec2(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float ang = -0.9 + fi * 0.41 + hash11(fi) * 0.4;
    vec2 k = vec2(cos(ang), sin(ang)) * (1.3 + fi * 0.9);
    float ph = dot(p, k) + TAU * (2.0 + fi) * uLoop / LOOP + fi * 2.3;
    g += k * cos(ph) * 0.03 / (1.0 + fi * 0.7);
  }
  float fade = 0.5 / (1.0 + t * 0.25);
  g = g * fade + (vec2(n2(p * vec2(1.2, 3.0)), n2(p * vec2(1.2, 3.0) + 5.0)) - 0.5) * 0.05 * fade;
  return normalize(vec3(-g.x, 1.0, -g.y));
}

vec3 lakeImage() {
  vec2 s = (vUv - 0.5) * vec2(uAspect, 1.0);
  float px = 1.0 / uRes.y;
  vec3 ro = vec3(uPointer.x * 0.3, CAMH, 0.0);
  vec3 rd = camRay(s);
  vec3 col;
  float tw = rd.y < 0.0 ? -CAMH / rd.y : 1e9;
  float tt = rd.y < 0.35 ? march(ro, rd, min(tw, 900.0)) : 1e9;
  if (tt < tw && tt < 1e8) {
    col = mist(aerial(shadeTerrain(ro + rd * tt, rd, tt), rd, tt), rd, tt);
  } else if (tw < 1e8) {
    // the lake
    vec3 p = ro + rd * tw;
    vec3 n = waterNormal(p.xz, tw);
    vec3 rr = reflect(rd, n); rr.y = abs(rr.y);
    vec3 refl = world(p + vec3(0.0, 0.01, 0.0), rr, true);
    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
    vec3 deep = vec3(0.02, 0.04, 0.045) + uSkyTop * 0.04;
    col = mix(deep, refl, clamp(fres + 0.06, 0.0, 1.0));
    float spec = pow(max(dot(rr, sunRay()), 0.0), 900.0) * 30.0 * uSun.w + pow(max(dot(rr, moonRay()), 0.0), 700.0) * 6.0 * uMoon.w;
    col += mix(vec3(0.85, 0.9, 1.0), uSunCol, uSun.w) * spec;
    col = mix(col, uShore * 0.8, (1.0 - smoothstep(9.0, 13.0, p.z)) * 0.35);
    col = mist(aerial(col, rd, tw * 0.6), rd, tw);
  } else {
    col = sky(rd, true);
  }
  col = birds(col, s, px);
  col = shootingStar(col, s, px);

  // gentle filmic shoulder, vignette, grain and dither
  col = col / (1.0 + 0.12 * col) * 1.06;
  col *= 0.93 + 0.07 * smoothstep(0.95, 0.3, length(vUv - 0.5));
  vec2 fc = gl_FragCoord.xy;
  col *= 1.0 + (hash12(floor(fc)) - 0.5) * 0.025;
  col += (hash12(fc + 17.0) - 0.5) / 255.0 * 2.0;
  return clamp(col, 0.0, 1.0);
}

// ---------------------------------------------------------------- the collage around it
// Material photographs laid around the window; uIntro (0 → 1 over the first seconds, driven
// by the page as before) lays the tiles down and then opens the window almost to full width.
float cf3(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * n2(p); p = M2 * p * 2.03 + 1.7; a *= 0.5; } return s / 0.875; }
float cn1(float x) { float i = floor(x); float f = fract(x); return mix(hash11(i), hash11(i + 1.0), f * f * (3.0 - 2.0 * f)); }
vec3 mBlackT(vec2 p) { return vec3(0.035, 0.032, 0.03) * (0.8 + 0.5 * n2(p * 0.9)) + vec3(0.05) * step(0.985, hash12(floor(p * 0.5))); }
vec3 mYellowT(vec2 p) {
  vec3 c = vec3(0.95, 0.73, 0.13) * (0.9 + 0.16 * cf3(p * 0.004));
  c *= 0.95 + 0.07 * n2(vec2(p.x * 0.02, p.y * 0.35));
  float crease = smoothstep(2.5, 0.0, abs(p.x * 0.34 + p.y * 0.94 - 420.0 - 40.0 * cn1(p.y * 0.01)));
  c *= 1.0 - 0.12 * crease;
  float tape = step(abs(p.y - 120.0), 24.0); c = mix(c, c * 1.06 + vec3(0.05), tape * 0.45);
  return c;
}
float hSlate(vec2 p) { return cf3(p * vec2(0.006, 0.02)) * 0.7 + n2(p * vec2(0.05, 0.3)) * 0.3; }
vec3 mGraniteT(vec2 p) {
  float e = 1.5; float h = hSlate(p), hx = hSlate(p + vec2(e, 0.0)), hy = hSlate(p + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h) * 12.0, -(hy - h) * 12.0, 1.0));
  float l = clamp(dot(n, normalize(vec3(-0.6, -0.7, 0.5))), 0.0, 1.0);
  vec3 alb = mix(vec3(0.2, 0.22, 0.25), vec3(0.4, 0.42, 0.45), h);
  return alb * (0.35 + 0.9 * l) * (0.92 + 0.12 * n2(p * 1.7));
}
float hMoss(vec2 p) { return cf3(p * 0.03) * 0.6 + n2(p * 0.4) * 0.4; }
vec3 mMossT(vec2 p) {
  float e = 1.5; float h = hMoss(p), hx = hMoss(p + vec2(e, 0.0)), hy = hMoss(p + vec2(0.0, e));
  vec3 n = normalize(vec3(-(hx - h) * 10.0, -(hy - h) * 10.0, 1.0));
  float l = clamp(dot(n, normalize(vec3(-0.6, -0.7, 0.5))), 0.0, 1.0);
  vec3 alb = mix(vec3(0.12, 0.2, 0.06), vec3(0.42, 0.52, 0.16), smoothstep(0.3, 0.8, h));
  return alb * (0.25 + 1.0 * l) * (0.9 + 0.2 * n2(p * 2.1));
}
vec3 tileMat(int i, vec2 p) {
  if (i == 0) return mYellowT(p);
  if (i == 1) return mGraniteT(p);
  if (i == 3) return mBlackT(p);
  return mMossT(p);
}
float ease3(float x) { x = clamp(x, 0.0, 1.0); return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float W = uRes.x, Hh = uRes.y;
  float u = uIntro;
  float open = ease3((u - 0.55) / 0.4);
  float lw = mix(0.27, 0.024, open) * W, rw = mix(0.23, 0.032, open) * W;
  float ls = mix(0.52, 0.46, open) * Hh, rs = mix(0.38, 0.42, open) * Hh;
  vec3 col = mBlackT(p);
  // which tile, and how far it has been laid down
  vec4 r = vec4(lw, 0.0, W - rw, Hh); float rv = ease3((u - 0.12) / 0.25); int id = 2;
  if (p.x < lw) { if (p.y < ls) { r = vec4(0.0, 0.0, lw, ls); rv = ease3((u - 0.05) / 0.22); id = 0; } else { r = vec4(0.0, ls, lw, Hh); rv = ease3((u - 0.2) / 0.22); id = 1; } }
  else if (p.x >= W - rw) { if (p.y < rs) { r = vec4(W - rw, 0.0, W, rs); rv = ease3((u - 0.1) / 0.22); id = 3; } else { r = vec4(W - rw, rs, W, Hh); rv = ease3((u - 0.16) / 0.22); id = 4; } }
  float edge = r.y + (r.w - r.y) * rv + 6.0 * (cn1(p.x * 0.08 + float(id) * 9.0) - 0.5);
  if (p.y <= edge) {
    vec3 c = id == 2 ? lakeImage() : tileMat(id, p + vec2(float(id) * 137.0, float(id) * 71.0));
    float sh = min(min(p.x - r.x, r.z - p.x), min(p.y - r.y, edge - p.y));
    c *= 0.72 + 0.28 * smoothstep(0.0, 5.0, sh);
    col = c;
  }
  col += (hash12(gl_FragCoord.xy + fract(uLoop * 7.0) * 97.0) - 0.5) * 0.035;
  col *= smoothstep(0.0, 0.08, u);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
