/* SideAI hero — "lakeScene" as a paper diorama.
   Drop-in replacement for the fragment shader of the hero on /en/ai: same uniforms, same
   palettes, same 60 s day and composition. The lake is built like a handmade diorama shot
   close up: a watercolour-paper sky, torn-paper mountains with white fibre edges and
   glued-on snow, scissor-cut spruce hills, tissue-paper clouds, a sun cut from card, stars
   pricked with a needle and lit from behind, a lake of crumpled foil that mirrors it all,
   a felt shore, a folded paper boat. Every layer throws a real shadow on the one behind it,
   following the sun across the day; moving pieces step like stop-motion. The palettes
   become the papers. */
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

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float n1(float x) { float i = floor(x); float f = fract(x); float u = f * f * (3.0 - 2.0 * f); return mix(hash11(i), hash11(i + 1.0), u); }
float n2(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * n2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s / 0.875; }
float wave(float turns, float phase) { return sin(TAU * turns * uLoop / LOOP + phase); }
float segment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

// stop-motion time: moving pieces step at 12 frames a second
float stepT() { return floor(uLoop * 12.0) / 12.0; }
// every hand-placed layer "boils" a hair between frames
vec2 boil(float seed) { float f = floor(uLoop * 12.0); return (vec2(hash11(f * 1.3 + seed), hash11(f * 2.1 + seed * 3.0)) - 0.5) * 0.0011; }

float crest(float x) { float s = 0.0, a = 0.55, f = 1.0; for (int i = 0; i < 5; i++) { float v = n1(x * f + float(i) * 17.3); v = 1.0 - abs(v * 2.0 - 1.0); s += a * v * v; f *= 2.13; a *= 0.46; } return s; }
float soft(float x) { float s = 0.0, a = 0.5, f = 1.0; for (int i = 0; i < 4; i++) { s += a * n1(x * f + float(i) * 5.1); f *= 2.0; a *= 0.5; } return s; }
float rise(float start) { float k = clamp((uIntro - start) / 0.42, 0.0, 1.0); return 1.0 - pow(1.0 - k, 3.0); }
// a torn edge: fine, irregular, never straight
float torn(float x, float seed) { return 0.0035 * (n1(x * 160.0 + seed) - 0.5) + 0.0016 * (n1(x * 620.0 + seed * 3.0) - 0.5) + 0.0007 * (n1(x * 2100.0 + seed) - 0.5); }

float farY(float x) {
  float side = smoothstep(0.05, 0.75, abs(x) / (uAspect * 0.5));
  return -0.235 + mix(0.13, 0.36, side) * crest(x * 1.35 + 3.0) - (1.0 - rise(0.10)) * 0.34;
}
float midY(float x) {
  float side = smoothstep(0.10, 0.90, abs(x) / (uAspect * 0.5));
  return -0.262 + mix(0.07, 0.15, side) * soft(x * 2.2 + 11.0) - (1.0 - rise(0.26)) * 0.30;
}
// cut with scissors: clean spruce silhouettes
float hillsY(float x) {
  float side = smoothstep(0.30, 0.95, abs(x) / (uAspect * 0.5));
  float y = -0.302 + side * 0.17 + 0.04 * soft(x * 3.1 + 21.0) * side;
  float tree = 0.0;
  for (int j = 0; j < 2; j++) {
    float fj = float(j);
    float grid = mix(34.0, 58.0, fj);
    float cell = floor(x * grid + fj * 0.5);
    float cx = (cell + 0.5 - fj * 0.5) / grid;
    float has = step(0.25, hash11(cell * 3.7 + fj * 11.0)) * smoothstep(0.15, 0.55, side);
    float th = mix(0.032, 0.09, hash11(cell * 9.1 + fj * 5.0)) * mix(1.0, 0.7, fj);
    float t = max(0.0, 1.0 - abs(x - cx) / (th * 0.26));
    float tiers = 1.0 - 0.26 * fract((1.0 - t) * 3.0);
    tree = max(tree, has * th * t * tiers);
  }
  return y + tree - (1.0 - rise(0.40)) * 0.30;
}
float shoreY(float x) {
  return -0.465 + 0.035 * soft(x * 4.0 + 5.0) + 0.06 * pow(abs(x) / (uAspect * 0.5), 3.0) - (1.0 - rise(0.52)) * 0.20;
}

vec2 sunP() { return vec2(uSun.x * uAspect, uSun.y) + uPointer * 0.006; }
vec2 moonP() { return vec2(uMoon.x * uAspect, uMoon.y) + uPointer * 0.006; }
float daylight() { return uSun.w * smoothstep(-0.26, -0.06, uSun.y); }
// where shadows fall: away from the sun (or the moon at night), a little downwards
vec2 shadowDir() {
  vec2 l = mix(moonP(), sunP(), step(0.5, uSun.w));
  vec2 d = normalize(vec2(-l.x, -abs(l.y) - 0.35));
  return d;
}
float shadowStrength() { return mix(0.16 * uMoon.w, 0.34, daylight()); }

// paper: grain, fibres, a faint emboss lit from the light's side
vec3 paper(vec3 base, vec2 p, float seed) {
  float grain = n2(p * 310.0 + seed) * 0.6 + n2(p * 900.0 - seed) * 0.4;
  float fibre = n2(vec2(p.x * 36.0 + seed, p.y * 420.0) + n2(p * 18.0) * 3.0);
  float e = n2((p + vec2(0.0015, 0.0)) * 310.0 + seed) - n2(p * 310.0 + seed);
  vec2 sd = shadowDir();
  float emb = -e * sign(sd.x) * 2.2;
  return base * (0.93 + 0.08 * grain + 0.04 * (fibre - 0.5) + emb * 0.06);
}
// the white core that shows along a torn edge
vec3 tornEdge(vec3 col, float d, vec2 p) {
  float band = smoothstep(0.0036, 0.0, d) * step(0.0, d);
  float f = n2(vec2(p.x * 900.0, p.y * 200.0));
  return mix(col, vec3(0.97, 0.955, 0.93) * (0.9 + 0.1 * f), band * (0.55 + 0.45 * f));
}
float inside(float ridge, float y, float aa) { return smoothstep(-aa, aa, ridge - y); }
// shadow a layer throws on what is behind it
float castBy(float rx, float yShifted, float soft) { return smoothstep(-soft, soft, rx - yShifted); }

vec3 sky(vec2 p, float px) {
  float h = smoothstep(-0.30, 0.50, p.y);
  vec3 col = mix(uSkyHor, uSkyTop, pow(h, 0.85));
  // watercolour: soft blooms and a cold-press texture
  float wc = fbm3(p * vec2(1.6, 2.4) + 3.0);
  col *= 0.96 + 0.07 * wc;
  col = paper(col, p, 1.0);
  // a painted glow around the sun, pigment pooling at its rim
  if (uSun.w > 0.001) {
    float d = length(p - sunP());
    col = mix(col, mix(uSunCol, uSkyHor, 0.3), exp(-d * 5.5) * 0.35 * uSun.w * (0.8 + 0.4 * wc));
  }
  return col;
}
// pinpricks with light behind them
vec3 stars(vec3 col, vec2 p, float px) {
  if (uMisc.x < 0.01) return col;
  vec2 id = floor(p * 34.0); vec2 h = hash22(id + 11.0);
  if (h.x < 0.88) return col;
  vec2 pos = (id + 0.2 + hash22(id + 4.0) * 0.6) / 34.0;
  float d = length(p - pos);
  float hole = 1.0 - smoothstep(px * 0.6, px * 1.6, d);
  float halo = exp(-d / (px * 2.2)) * 0.3;
  float tw = 0.75 + 0.25 * wave(floor(6.0 + h.y * 20.0), h.x * 60.0);
  return col + vec3(1.0, 0.94, 0.8) * (hole + halo) * tw * uMisc.x * smoothstep(-0.10, 0.25, p.y);
}
vec3 shootingStar(vec3 col, vec2 p, float px) {
  float u = (uLoop - 51.0) / 1.1;
  if (uLife.w < 0.01 || u < 0.0 || u > 1.0) return col;
  u = floor(u * 13.0) / 13.0;
  vec2 a = vec2(0.05 * uAspect, 0.38); vec2 b = vec2(0.30 * uAspect, 0.27);
  vec2 head = mix(a, b, u); vec2 dir = normalize(b - a);
  vec2 tail = head - dir * 0.1 * sin(u * 3.14159);
  float along = clamp(dot(p - tail, dir) / max(length(head - tail), 1e-4), 0.0, 1.0);
  float line = (1.0 - smoothstep(px * 0.5, px * 1.8, segment(p, tail, head))) * along * sin(u * 3.14159);
  return col + vec3(1.0, 0.94, 0.8) * line * uLife.w;
}
// the sun: a disc cut from thick card, with its shadow on the sky paper
vec3 sunDisc(vec3 col, vec2 p, float px) {
  if (uSun.w < 0.001) return col;
  vec2 c = sunP() + boil(3.0); float R = uSun.z;
  vec2 sd = shadowDir() * 0.008;
  float rr = R * (1.0 + 0.01 * (n1(atan(p.y - c.y, p.x - c.x) * 9.0) - 0.5));
  float sh = 1.0 - smoothstep(rr - 0.004, rr + 0.004, length(p - c - sd));
  col *= 1.0 - sh * shadowStrength() * uSun.w;
  float disc = 1.0 - smoothstep(rr - px * 1.2, rr, length(p - c));
  vec3 card = paper(mix(uSunCol, vec3(1.0, 0.97, 0.9), 0.25), p, 7.0);
  card *= 0.96 + 0.06 * smoothstep(rr, rr * 0.3, length(p - c - shadowDir() * -0.01));
  return mix(col, card, disc * uSun.w);
}
// the moon: a crescent cut from pale paper, pencil-shaded
vec3 moonCut(vec3 col, vec2 p, float px) {
  if (uMoon.w < 0.001) return col;
  vec2 c = moonP() + boil(5.0); float R = uMoon.z;
  float disc = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, length(p - c) / R);
  float cut = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, length(p - c - vec2(R * 0.42, R * 0.18)) / (R * 0.92));
  float m = disc * (1.0 - cut);
  vec2 sd = vec2(0.006, -0.006);
  float shd = (1.0 - smoothstep(0.96, 1.0, length(p - c - sd) / R)) * (1.0 - (1.0 - smoothstep(0.96, 1.0, length(p - c - sd - vec2(R * 0.42, R * 0.18)) / (R * 0.92))));
  col *= 1.0 - shd * 0.25 * uMoon.w;
  float pencil = smoothstep(0.55, 0.8, n2(vec2((p.x + p.y) * 900.0, (p.x - p.y) * 60.0))) * smoothstep(0.3, 0.9, fbm3((p - c) / R * 2.0 + 4.0));
  vec3 face = paper(vec3(0.95, 0.94, 0.9), p, 9.0) * (1.0 - 0.18 * pencil);
  return mix(col, face, m * uMoon.w);
}
// tissue-paper clouds: translucent, layered, torn
vec3 clouds(vec3 col, vec2 p, float px) {
  if (uMisc.w < 0.01 || p.y < 0.18) return col;
  float W = uAspect + 1.4;
  float ts = stepT();
  vec2 sd = shadowDir() * 0.01;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float len = mix(0.13, 0.30, hash11(fi * 3.1 + 1.0));
    float hgt = mix(0.02, 0.04, hash11(fi * 5.7 + 2.0));
    float y0 = mix(0.26, 0.40, hash11(fi * 7.3 + 3.0));
    float turns = 1.0 + step(0.6, hash11(fi * 2.9));
    float x = mod(hash11(fi * 1.3) * W + W * turns * ts / LOOP, W) - W * 0.5;
    for (int k = 0; k < 2; k++) {
      vec2 q = p - vec2(float(k) * len * 0.35 - len * 0.15, float(k) * hgt * 0.5);
      float lx = (q.x - x) / (len * (0.8 - 0.25 * float(k)));
      if (abs(lx) > 1.1) continue;
      float ly = (q.y - y0) / hgt;
      float top = pow(max(0.0, 1.0 - lx * lx), 0.55) * (0.6 + 0.4 * n1(lx * 3.0 + fi * 9.0 + float(k) * 4.0)) + 0.3 * (n1(lx * 26.0 + fi) - 0.5) * 0.3;
      float bottom = -0.25 * (1.0 - pow(abs(lx), 4.0));
      float edge = torn(q.x, fi * 7.0 + float(k)) / hgt;
      float m = smoothstep(bottom - 0.04, bottom + 0.04, ly) * smoothstep(top + edge + 0.04, top + edge - 0.04, ly);
      // shadow of the tissue on the sky paper
      float lys = (q.y + sd.y - y0) / hgt, lxs = (q.x + sd.x - x) / (len * (0.8 - 0.25 * float(k)));
      float ms = smoothstep(bottom - 0.2, bottom + 0.2, lys) * smoothstep(top + 0.2, top - 0.2, lys) * step(abs(lxs), 1.0);
      col *= 1.0 - ms * 0.12 * shadowStrength() * uMisc.w;
      if (m <= 0.0) continue;
      vec3 tissue = paper(uCloud * 1.02, q * 1.3, fi * 3.0 + float(k));
      float fibres = n2(vec2(q.x * 120.0, q.y * 900.0));
      tissue *= 0.97 + 0.05 * fibres;
      col = mix(col, tissue, m * uMisc.w * 0.78);
      col = mix(col, vec3(1.0), smoothstep(0.08, 0.0, abs(ly - top - edge)) * 0.25 * m * uMisc.w);
    }
  }
  return col;
}
// soft mist: a strip of tracing paper
vec3 mist(vec3 col, vec2 p, float y0, float thick, float seed) {
  if (abs(p.y - y0) > thick * 2.5) return col;
  float breathe = 0.01 * wave(1.0, seed * 2.0) * sin(p.x * 3.0 + seed);
  float edge = y0 + breathe + torn(p.x, seed) * 3.0 + (n1(p.x * 2.4 + seed * 5.0) - 0.5) * 0.03;
  float f = smoothstep(edge + 0.002, edge - 0.002, p.y) * smoothstep(edge - thick * 1.4, edge - thick * 0.4, p.y);
  return mix(col, paper(uFog, p, seed), f * uMisc.y * 0.55);
}
// birds: tiny cut-outs on wires, stepping
float bird(vec2 p, vec2 c, float s, float flap) {
  vec2 q = (p - c) / s; q.x = abs(q.x);
  float tip = 0.5 * flap; vec2 elbow = vec2(0.46, 0.2 + tip * 0.3);
  return min(segment(q, vec2(0.0), elbow), segment(q, elbow, vec2(1.0, tip))) * s;
}
vec3 birds(vec3 col, vec2 p, float px) {
  if (uLife.x < 0.01) return col;
  float ink = 0.0;
  float ts = stepT();
  for (int f = 0; f < 2; f++) {
    float ff = float(f);
    float u = (ts - mix(5.0, 26.0, ff)) / mix(20.0, 17.0, ff);
    if (u < 0.0 || u > 1.0) continue;
    float dir = mix(1.0, -1.0, ff);
    float span = uAspect * 0.62;
    vec2 lead = vec2(dir * mix(-span, span, u), mix(0.315, -0.232, ff) + 0.012 * sin(u * 6.0));
    float s = mix(0.012, 0.008, ff);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float row = floor((fi + 1.0) * 0.5);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 off = vec2(-dir * row * 2.6 * s, side * row * 1.1 * s + (hash11(fi + ff * 7.0) - 0.5) * s * 1.4);
      float flap = step(0.0, sin(ts * 12.0 + fi * 2.0)) * 2.0 - 1.0;
      float d = bird(p, lead + off, s, flap * 0.8);
      ink = max(ink, 1.0 - smoothstep(s * 0.09, s * 0.09 + px, d));
    }
  }
  return mix(col, uShore * 0.8, ink * uLife.x);
}
// a little card train on the far shore; its windows are cut out and lit at night
vec3 train(vec3 col, vec2 p, float px) {
  float y0 = -0.2935;
  if (p.y < y0 - 0.004 || p.y > y0 + 0.016) return col;
  float u = fract(stepT() / LOOP * 2.0 + 0.15);
  float span = uAspect * 0.5 + 0.2;
  float lx = p.x - mix(span, -span, u);
  float pitch = 0.041;
  if (lx < -0.004 || lx > 4.0 * pitch) return col;
  float k = floor(lx / pitch); float cx = lx - k * pitch; float car = 0.037;
  float ly = p.y - y0;
  float top = 0.0115;
  float body = step(0.0, cx) * step(cx, car) * smoothstep(-px, px, ly - 0.0015) * smoothstep(px, -px, ly - top);
  float shadow = step(0.0, cx - 0.002) * step(cx - 0.002, car) * step(0.0015, ly + 0.0015) * step(ly + 0.0015, top);
  col *= 1.0 - shadow * (1.0 - body) * shadowStrength();
  float win = step(0.005, ly) * step(ly, 0.0088) * step(0.4, fract(cx / 0.0056)) * step(0.005, cx) * step(cx, car - 0.004);
  vec3 bodyCol = paper(mix(vec3(0.76, 0.2, 0.15), uShore, 0.15 + 0.5 * uLife.z), p, 13.0);
  vec3 winCol = mix(uSkyHor * 0.8, vec3(1.0, 0.85, 0.55) * 1.15, uLife.z);
  return mix(col, mix(bodyCol, winCol, win), body);
}

vec3 landscape(vec2 p, float px) {
  vec3 col = sky(p, px);
  col = stars(col, p, px);
  col = shootingStar(col, p, px);
  col = moonCut(col, p, px);
  col = sunDisc(col, p, px);
  col = clouds(col, p, px);

  vec2 sd = shadowDir();
  float ss = shadowStrength();
  float aa = px * 1.1;

  // far range: torn paper, snow glued on as a second torn piece
  vec2 bf = boil(1.0);
  float fx = p.x + uPointer.x * 0.006 + bf.x;
  float fy = farY(fx) + torn(fx, 1.0) + bf.y;
  float fys = farY(fx - sd.x * 0.012) + torn(fx - sd.x * 0.012, 1.0) - sd.y * 0.012;
  col *= 1.0 - castBy(fys, p.y, 0.006) * (1.0 - inside(fy, p.y, aa)) * ss;
  float inF = inside(fy, p.y, aa);
  if (inF > 0.0) {
    vec3 rock = paper(uFar, p, 2.0);
    rock = mix(rock, uSkyHor, (1.0 - smoothstep(-0.26, 0.02, p.y)) * 0.12);
    float snowLine = -0.13 + 0.04 * n1(fx * 7.0);
    float cap = fy - (mix(0.03, 0.08, n1(fx * 11.0 + 4.0)) * (0.6 + 0.5 * n1(fx * 40.0)) + torn(fx, 8.0) * 2.5) * smoothstep(snowLine, snowLine + 0.07, fy);
    float onCap = step(cap, p.y) * smoothstep(snowLine - 0.01, snowLine + 0.01, p.y);
    float slope = farY(fx + 0.014) - farY(fx - 0.014);
    float lit = smoothstep(-0.006, 0.01, slope * (uSun.x < 0.0 ? -1.0 : 1.0));
    vec3 snow = paper(mix(uSnowShade, uSnowLit, 0.35 + 0.65 * lit), p, 4.0);
    // the snow piece throws a hairline shadow on the rock
    float capS = step(cap - 0.004, p.y) * (1.0 - onCap);
    rock *= 1.0 - capS * 0.2 * ss;
    vec3 c = mix(rock, snow, onCap);
    c = tornEdge(c, fy - p.y, p);
    col = mix(col, c, inF);
  }
  col = mist(col, p, -0.205, 0.03, 1.0);
  col = birds(col, p, px);

  // mid ridge: a second sheet, closer
  vec2 bm = boil(2.0);
  float mx = p.x + uPointer.x * 0.012 + bm.x;
  float my = midY(mx) + torn(mx, 2.0) + bm.y;
  float mys = midY(mx - sd.x * 0.01) + torn(mx - sd.x * 0.01, 2.0) - sd.y * 0.01;
  col *= 1.0 - castBy(mys, p.y, 0.005) * (1.0 - inside(my, p.y, aa)) * ss;
  float inM = inside(my, p.y, aa);
  if (inM > 0.0) col = mix(col, tornEdge(paper(uMid, p, 3.0), my - p.y, p), inM);
  col = mist(col, p, -0.262, 0.024, 2.0);
  col = train(col, p, px);

  // wooded hills: cut clean, felt-textured
  vec2 bh = boil(4.0);
  float hx = p.x + uPointer.x * 0.022 + bh.x;
  float hy = hillsY(hx) + bh.y;
  float hys = hillsY(hx - sd.x * 0.014) - sd.y * 0.014;
  col *= 1.0 - castBy(hys, p.y, 0.004) * (1.0 - inside(hy, p.y, aa)) * ss * 1.2;
  float inH = inside(hy, p.y, aa);
  if (inH > 0.0) {
    vec3 felt = uHills * (0.9 + 0.12 * n2(p * 520.0) + 0.06 * n2(p * 90.0));
    felt *= 1.0 - 0.1 * smoothstep(0.0, 0.004, hy - p.y) * (1.0 - smoothstep(0.004, 0.01, hy - p.y));
    col = mix(col, felt, inH);
  }
  return col;
}

// a folded paper boat, two lit faces and a hull
vec3 boat(vec3 col, vec2 w, float px, float wob) {
  if (uLife.y < 0.01) return col;
  float s = 0.03;
  float ts = stepT();
  vec2 base = vec2(mix(-0.62, 0.62, ts / LOOP) * uAspect, -0.37 + 0.0015 * wave(11.0, 0.0));
  vec2 lamp = base + vec2(-0.7 * s, 0.35 * s);
  float ld = length(w - lamp);
  col += vec3(1.0, 0.82, 0.52) * uLife.z * ((1.0 - smoothstep(px * 0.8, px * 2.2, ld)) + 0.16 * exp(-ld / (s * 0.8)));
  vec2 q = (w - base) / s;
  if (abs(q.x) > 1.4 || q.y > 1.6 || q.y < -1.8) return col;
  float hull = step(-0.35, q.y) * step(q.y, 0.1) * step(abs(q.x), 1.0 - (0.1 - q.y) * 1.1);
  float sailL = step(0.1, q.y) * step(q.x, 0.0) * step(-q.x, (1.4 - q.y) * 0.7);
  float sailR = step(0.1, q.y) * step(0.0, q.x) * step(q.x, (1.4 - q.y) * 0.7);
  float litR = step(0.0, sunP().x - base.x);
  vec3 pc = mix(uCloud, uSnowLit, 0.4);
  vec3 cL = paper(pc * mix(1.0, 0.8, litR), w, 21.0), cR = paper(pc * mix(0.8, 1.0, litR), w, 22.0);
  vec3 cH = paper(pc * 0.9, w, 23.0);
  vec3 b = col;
  b = mix(b, cH, hull); b = mix(b, cL, sailL); b = mix(b, cR, sailR);
  float fold = smoothstep(0.03, 0.0, abs(q.x)) * step(0.1, q.y) * step(q.y, 1.4);
  b = mix(b, pc * 0.7, fold * 0.5);
  float m = max(hull, max(sailL, sailR));
  col = mix(col, b, m * uLife.y);
  vec2 r = vec2(q.x + wob * 2.0, -q.y - 0.2);
  float rm = step(-0.35, r.y) * step(r.y, 1.4) * step(abs(r.x), (1.4 - r.y) * 0.7) * step(q.y, -0.35);
  return mix(col, pc * 0.75, rm * 0.25 * uLife.y);
}

// crumpled foil: facets from a jittered cell pattern, creases between them
vec2 creases(vec2 w) {
  vec2 q = w * vec2(14.0, 42.0);
  vec2 n = floor(q), f = fract(q);
  float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j)); vec2 o = hash22(n + g); vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = n + g; } else if (d < d2) d2 = d;
  }
  float a = hash12(id) * 6.2832;
  float edge = smoothstep(0.0, 0.12, sqrt(d2) - sqrt(d1));
  return vec2(cos(a), sin(a)) * (0.35 + 0.65 * hash12(id + 3.0)) * edge;
}

void main() {
  vec2 w = (vUv - 0.5) * vec2(uAspect, 1.0);
  float px = 1.0 / uRes.y;
  float waterY = -0.300;
  vec3 col;
  if (w.y >= waterY) {
    col = landscape(w, px);
  } else {
    float depth = waterY - w.y;
    vec2 g = creases(vec2(w.x / (0.3 + depth * 3.0), depth / (0.04 + depth)));
    float ripple = 0.5 + 0.5 * wave(6.0, w.x * 20.0 + depth * 80.0);
    float amp = 0.002 + depth * 0.035;
    vec3 refl = landscape(vec2(w.x + g.x * amp, waterY + depth + g.y * amp * 0.5), px);
    vec3 foil = mix(uSkyHor, uShore, 0.35);
    float facet = 0.5 + 0.5 * dot(normalize(g + 0.0001), normalize(vec2(uSun.x, 1.0)));
    col = mix(foil, refl, 0.72) * (0.86 + 0.24 * facet);
    col = mix(col, uShore, uMisc.z * smoothstep(0.0, 0.18, depth) * 0.6);
    // glints where creases catch the sun or the moon
    vec2 gq = vec2(w.x * 90.0, depth * 260.0); vec2 gi = floor(gq);
    float gd = length((fract(gq) - 0.5 - (hash22(gi) - 0.5) * 0.6) * vec2(1.0, 0.6));
    float gl = smoothstep(0.8, 1.0, facet) * step(0.72, hash12(gi + floor(uLoop * 6.0))) * smoothstep(0.32, 0.08, gd);
    float sunPath = exp(-pow((w.x - sunP().x) / (0.04 + depth * 0.3), 2.0)) * uSun.w * smoothstep(-0.18, 0.05, uSun.y);
    float moonPath = exp(-pow((w.x - moonP().x) / (0.03 + depth * 0.2), 2.0)) * uMoon.w;
    col += uSunCol * gl * (0.25 + 0.9 * sunPath) * daylight();
    col += vec3(0.9, 0.92, 1.0) * gl * moonPath * 0.5;
    col = boat(col, w, px, g.x * 0.01 * ripple);
  }
  // felt shore in front, with its shadow on the foil
  vec2 sd = shadowDir();
  float sx = w.x + uPointer.x * 0.032;
  float sy = shoreY(sx);
  float sys = shoreY(sx - sd.x * 0.016) - sd.y * 0.016;
  col *= 1.0 - castBy(sys, w.y, 0.005) * (1.0 - inside(sy, w.y, px)) * shadowStrength() * 1.2;
  float inS = inside(sy, w.y, px * 1.2);
  if (inS > 0.0) {
    vec3 felt = uShore * (0.88 + 0.16 * n2(w * 560.0) + 0.08 * n2(w * 120.0));
    felt *= 1.0 + 0.12 * (1.0 - smoothstep(0.0, 0.006, sy - w.y)) * daylight();
    col = mix(col, felt, inS);
  }
  // macro lens: a soft falloff to the corners and a touch of warmth
  col *= 0.9 + 0.1 * smoothstep(0.95, 0.35, length(vUv - 0.5));
  vec2 fc = gl_FragCoord.xy;
  col += (hash12(fc + 17.0) - 0.5) / 255.0 * 2.0;
  col = mix(uSkyTop, col, smoothstep(0.0, 0.25, uIntro));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
