/* SideAI hero — "lakeScene", realistic pass.
   Drop-in replacement for the fragment shader of the hero on /en/ai: same uniforms, same
   palettes, same 60 s day, same composition (snowy range, forested hills, lake, shore,
   train, boat, birds, sun and moon). What changes is how it is rendered:
   - mountains get relief: ridged erosion gullies lit from the sun's side, snow that lies
     in the gullies and above a ragged snow line, rock strata, aerial perspective
   - hills become spruce forest with individual crowns lit on the sun side
   - clouds have volume: self-shadowed bases, bright sun-facing tops, thin cirrus above
   - the lake is a mirror with perspective waves (loop-periodic), Fresnel, and a glitter
     path under the sun and moon
   - the sun scatters light into the sky; low sun warms everything it touches
   Everything that moves is periodic in the 60 s loop, so the day repeats seamlessly. */
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
float fbm5(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * n2(p); p = mat2(1.6, -1.2, 1.2, 1.6) * p + vec2(1.7, 9.2); a *= 0.5; } return s / 0.97; }
float ridged(vec2 p) {
  float s = 0.0, a = 0.5, w = 1.0;
  for (int i = 0; i < 5; i++) { float n = 1.0 - abs(n2(p) * 2.0 - 1.0); n *= n; s += a * n * w; w = clamp(n * 1.6, 0.0, 1.0); p = p * 2.07 + vec2(3.1, 1.7); a *= 0.5; }
  return s;
}
float wave(float turns, float phase) { return sin(TAU * turns * uLoop / LOOP + phase); }
float segment(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

float crest(float x) { float s = 0.0, a = 0.55, f = 1.0; for (int i = 0; i < 5; i++) { float v = n1(x * f + float(i) * 17.3); v = 1.0 - abs(v * 2.0 - 1.0); s += a * v * v; f *= 2.13; a *= 0.46; } return s; }
float soft(float x) { float s = 0.0, a = 0.5, f = 1.0; for (int i = 0; i < 4; i++) { s += a * n1(x * f + float(i) * 5.1); f *= 2.0; a *= 0.5; } return s; }
float rise(float start) { float k = clamp((uIntro - start) / 0.42, 0.0, 1.0); return 1.0 - pow(1.0 - k, 3.0); }

float farY(float x) {
  float side = smoothstep(0.05, 0.75, abs(x) / (uAspect * 0.5));
  return -0.235 + mix(0.13, 0.36, side) * crest(x * 1.35 + 3.0) + 0.004 * n1(x * 90.0) + 0.0015 * n1(x * 310.0) - (1.0 - rise(0.10)) * 0.34;
}
float midY(float x) {
  float side = smoothstep(0.10, 0.90, abs(x) / (uAspect * 0.5));
  return -0.262 + mix(0.07, 0.15, side) * soft(x * 2.2 + 11.0) + 0.0025 * n1(x * 120.0) - (1.0 - rise(0.26)) * 0.30;
}
// spruce silhouettes: narrow, tiered, uneven
float hillsY(float x) {
  float side = smoothstep(0.30, 0.95, abs(x) / (uAspect * 0.5));
  float y = -0.302 + side * 0.17 + 0.04 * soft(x * 3.1 + 21.0) * side + 0.002 * n1(x * 150.0);
  float tree = 0.0;
  for (int j = 0; j < 3; j++) {
    float fj = float(j);
    float grid = mix(52.0, 118.0, fj / 2.0);
    float cell = floor(x * grid + fj * 0.37);
    float cx = (cell + 0.5 - fj * 0.37) / grid + (hash11(cell * 1.9 + fj) - 0.5) * 0.4 / grid;
    float has = step(0.18, hash11(cell * 3.7 + fj * 11.0)) * smoothstep(0.08, 0.5, side);
    float th = mix(0.022, 0.07, hash11(cell * 9.1 + fj * 5.0)) * mix(1.0, 0.55, fj / 2.0) * (0.6 + 0.6 * side);
    float t = max(0.0, 1.0 - abs(x - cx) / (th * 0.17));
    float tiers = 1.0 - 0.22 * fract((1.0 - t) * 6.0 + hash11(cell));
    tree = max(tree, has * th * t * tiers);
  }
  return y + tree - (1.0 - rise(0.40)) * 0.30;
}
float shoreY(float x) {
  return -0.465 + 0.035 * soft(x * 4.0 + 5.0) + 0.06 * pow(abs(x) / (uAspect * 0.5), 3.0) + 0.004 * n1(x * 70.0) - (1.0 - rise(0.52)) * 0.20;
}
float inside(float ridge, float y, float aa) { return smoothstep(-aa, aa, ridge - y); }

vec2 sunP() { return vec2(uSun.x * uAspect, uSun.y) + uPointer * 0.006; }
vec2 moonP() { return vec2(uMoon.x * uAspect, uMoon.y) + uPointer * 0.006; }
// how much the sun actually lights the scene (0 at night)
float daylight() { return uSun.w * smoothstep(-0.26, -0.06, uSun.y); }
// low sun: golden light
float golden() { return daylight() * (1.0 - smoothstep(-0.12, 0.2, uSun.y)); }
// light direction for a point: towards the sun by day, the moon by night
vec3 lightDir(vec2 p) {
  vec2 s = mix(moonP(), sunP(), step(0.5, uSun.w));
  vec2 d = s - p;
  return normalize(vec3(d.x, d.y * 0.8 + 0.18, 0.55));
}
vec3 lightCol() { return mix(vec3(0.62, 0.7, 0.95) * 0.55 * uMoon.w, uSunCol * (1.0 + 0.25 * golden()), daylight()); }

vec3 skyColor(vec2 p) {
  float h = smoothstep(-0.30, 0.50, p.y);
  vec3 col = mix(uSkyHor, uSkyTop, pow(h, 0.85));
  float hz = exp(-max(p.y + 0.24, 0.0) * 7.0);
  col = mix(col, uSkyHor * 1.04 + uSunCol * 0.03 * daylight(), hz * 0.25);
  col *= 1.0 + (n2(p * vec2(1.4, 3.0) + 2.0) - 0.5) * 0.04;
  if (uSun.w > 0.001) {
    float d = length((p - sunP()) * vec2(1.0, 1.35));
    float g = exp(-d * 4.0) * 0.10 + exp(-d * 14.0) * 0.14 + exp(-d * 60.0) * 0.18;
    col += uSunCol * g * uSun.w * mix(1.0, 1.5, golden());
  }
  if (uMoon.w > 0.001) col += vec3(0.7, 0.78, 1.0) * exp(-length(p - moonP()) * 11.0) * 0.12 * uMoon.w;
  return col;
}

vec3 sun(vec3 col, vec2 p, float px) {
  if (uSun.w < 0.001) return col;
  vec2 c = sunP(); float R = uSun.z * 0.8;
  float r = length(p - c) / R;
  float disc = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, r);
  float limb = 0.82 + 0.18 * sqrt(max(0.0, 1.0 - r * r));
  vec3 face = mix(uSunCol, vec3(1.0, 0.98, 0.94), 0.55) * limb * 1.12;
  return mix(col, face, disc * uSun.w);
}

vec3 moon(vec3 col, vec2 p, float px) {
  if (uMoon.w < 0.001) return col;
  vec2 c = moonP(); float R = uMoon.z * 0.85;
  vec2 d = (p - c) / R; float r = length(d);
  float disc = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, r);
  // a lit sphere: the same crescent as before, with maria and faint earthshine on the dark side
  vec3 n = vec3(d, sqrt(max(0.0, 1.0 - r * r)));
  float lit = smoothstep(-0.06, 0.1, dot(n, normalize(vec3(-0.8, 0.2, -0.56))));
  float maria = smoothstep(0.45, 0.7, fbm3(d * 2.2 + 3.0));
  vec3 face = vec3(0.95, 0.94, 0.9) * (1.0 - 0.22 * maria) * lit;
  vec3 dark = mix(uSkyTop, vec3(0.32, 0.36, 0.5) * (1.0 - 0.3 * maria), 0.3);
  return mix(col, face + dark * (1.0 - lit), disc * uMoon.w);
}

vec3 stars(vec3 col, vec2 p, float px) {
  if (uMisc.x < 0.01) return col;
  for (int k = 0; k < 2; k++) {
    float sc = k == 0 ? 30.0 : 70.0;
    vec2 id = floor(p * sc); vec2 h = hash22(id + 11.0 + float(k) * 7.0);
    if (h.x < (k == 0 ? 0.9 : 0.8)) continue;
    vec2 pos = (id + 0.2 + hash22(id + 4.0) * 0.6) / sc;
    float size = px * mix(0.6, 1.6, h.y) * (k == 0 ? 1.0 : 0.7);
    float tw = 0.65 + 0.35 * wave(floor(8.0 + h.y * 30.0), h.x * 80.0);
    float s = 1.0 - smoothstep(size * 0.3, size * 1.3, length(p - pos));
    vec3 tint = mix(vec3(1.0, 0.9, 0.78), vec3(0.8, 0.88, 1.0), hash12(id + 2.0));
    col += tint * s * tw * uMisc.x * smoothstep(-0.10, 0.25, p.y) * (k == 0 ? 1.0 : 0.55);
  }
  // a faint band of the Milky Way
  float band = exp(-pow((p.y - 0.28 + p.x * 0.35) * 5.0, 2.0)) * fbm3(p * vec2(4.0, 9.0) + 3.0);
  return col + vec3(0.75, 0.8, 1.0) * band * 0.08 * uMisc.x * smoothstep(-0.05, 0.3, p.y);
}

vec3 shootingStar(vec3 col, vec2 p, float px) {
  float u = (uLoop - 51.0) / 1.1;
  if (uLife.w < 0.01 || u < 0.0 || u > 1.0) return col;
  vec2 a = vec2(0.05 * uAspect, 0.38); vec2 b = vec2(0.30 * uAspect, 0.27);
  vec2 head = mix(a, b, u); vec2 dir = normalize(b - a);
  vec2 tail = head - dir * 0.11 * sin(u * 3.14159);
  float along = clamp(dot(p - tail, dir) / max(length(head - tail), 1e-4), 0.0, 1.0);
  float line = (1.0 - smoothstep(px * 0.4, px * 1.4, segment(p, tail, head))) * along * along * sin(u * 3.14159);
  return col + vec3(1.0, 0.96, 0.88) * line * uLife.w * 1.3;
}

// clouds keep the original drifting shapes, now with billowed tops, soft edges and light
vec3 clouds(vec3 col, vec2 p, float px) {
  if (uMisc.w < 0.01 || p.y < 0.20) return col;
  float W = uAspect + 1.4;
  vec3 L = lightDir(p);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float len = mix(0.13, 0.30, hash11(fi * 3.1 + 1.0));
    float hgt = mix(0.016, 0.034, hash11(fi * 5.7 + 2.0)) * 1.35;
    float y0 = mix(0.26, 0.40, hash11(fi * 7.3 + 3.0));
    float turns = 1.0 + step(0.6, hash11(fi * 2.9));
    float x = mod(hash11(fi * 1.3) * W + W * turns * uLoop / LOOP, W) - W * 0.5 + uPointer.x * 0.004;
    float lx = (p.x - x) / len;
    if (abs(lx) > 1.15) continue;
    float ly = (p.y - y0) / hgt;
    vec2 lp = vec2(lx * 3.2 + fi * 7.0, ly * 0.9);
    float bil = fbm5(lp * vec2(1.6, 1.0));
    float top = pow(max(0.0, 1.0 - lx * lx), 0.6) * (0.5 + 0.5 * n1(lx * 3.0 + fi * 9.0)) + 0.55 * (bil - 0.45) * (1.0 - lx * lx);
    float bottom = -0.3 * (1.0 - pow(abs(lx), 4.0)) + 0.06 * (n1(lx * 9.0 + fi) - 0.5);
    float e = px / hgt * 1.2 + 0.12;
    float m = smoothstep(bottom - e * 0.3, bottom + e * 0.6, ly) * smoothstep(top + e * 0.2, top - e, ly) * smoothstep(1.15, 0.85, abs(lx));
    if (m <= 0.0) continue;
    float h = clamp((ly - bottom) / max(top - bottom, 0.01), 0.0, 1.0);
    float det = fbm5(lp * 3.0 + 11.0);
    float facing = clamp(0.5 + 0.9 * (L.x * lx * 0.25 + L.y * (h - 0.4)), 0.0, 1.0);
    vec3 shade = mix(uCloud * 0.72, uSkyTop, 0.22);
    vec3 lit = uCloud * 1.05 + lightCol() * 0.06;
    vec3 c = mix(shade, lit, smoothstep(0.05, 0.95, h * 0.6 + facing * 0.4 + (det - 0.5) * 0.35));
    c += uSunCol * 0.35 * smoothstep(0.75, 1.0, h) * exp(-length(p - sunP()) * 2.5) * uSun.w;
    col = mix(col, c, m * uMisc.w * (0.85 + 0.15 * det));
  }
  return col;
}

vec3 fog(vec3 col, vec2 p, float y0, float thick, float seed) {
  if (abs(p.y - y0) > thick * 2.5) return col;
  float breathe = 0.012 * wave(1.0, seed * 2.0) * sin(p.x * 3.0 + seed) + 0.008 * wave(2.0, seed) * sin(p.x * 7.3 - seed);
  float edge = y0 + breathe + (n1(p.x * 2.4 + seed * 5.0) * 0.7 + n1(p.x * 6.1 + seed) * 0.3 - 0.5) * 0.05;
  float f = smoothstep(edge + thick, edge, p.y) * smoothstep(edge - thick * 1.4, edge - thick * 0.2, p.y);
  // banks of mist: long and flat, drifting slowly back and forth
  f *= 0.5 + 0.5 * fbm3(vec2(p.x * 1.3 + 0.35 * wave(1.0, seed), p.y * 34.0 + seed));
  vec3 fc = uFog + lightCol() * 0.05 * daylight();
  return mix(col, fc, f * uMisc.y * 0.8);
}

float bird(vec2 p, vec2 c, float s, float flap) {
  vec2 q = (p - c) / s; q.x = abs(q.x);
  float tip = 0.55 * flap;
  vec2 elbow = vec2(0.46, 0.18 + tip * 0.35);
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
    vec2 lead = vec2(dir * mix(-span, span, u), mix(0.315, -0.232, ff) + 0.012 * sin(u * 6.0));
    float s = mix(0.011, 0.007, ff);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float row = floor((fi + 1.0) * 0.5);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 off = vec2(-dir * row * 2.6 * s, side * row * 1.1 * s + (hash11(fi + ff * 7.0) - 0.5) * s * 1.4);
      vec2 c = lead + off + vec2(0.0, 0.25 * s * wave(floor(3.0 + fi), fi * 1.7));
      float d = bird(p, c, s, wave(132.0 + fi * 6.0, fi * 2.1 + ff));
      ink = max(ink, 1.0 - smoothstep(s * 0.05, s * 0.05 + px * 1.0, d));
    }
  }
  return mix(col, uShore * 0.7, ink * 0.8 * uLife.x);
}

vec3 train(vec3 col, vec2 p, float px) {
  float y0 = -0.2935;
  if (p.y < y0 - 0.002 || p.y > y0 + 0.013) return col;
  float u = fract(uLoop / LOOP * 2.0 + 0.15);
  float span = uAspect * 0.5 + 0.2;
  float lx = p.x - mix(span, -span, u);
  float pitch = 0.039;
  if (lx < 0.0 || lx > 4.0 * pitch) return col;
  float k = floor(lx / pitch); float cx = lx - k * pitch; float car = 0.036;
  if (cx > car) return col;
  float ly = p.y - y0;
  float nose = k < 0.5 ? smoothstep(0.0, 0.007, cx) : 1.0;
  float top = 0.0105 * mix(0.5, 1.0, nose);
  float body = smoothstep(-px, px, ly - 0.0013) * smoothstep(px, -px, ly - top);
  float bogie = smoothstep(px, -px, ly - 0.0013) * step(0.0, ly + 0.001) * step(0.35, fract(cx / 0.009));
  float win = step(0.0048, ly) * step(ly, 0.0082) * step(0.38, fract(cx / 0.0052)) * step(0.005, cx) * step(cx, car - 0.004);
  float roof = smoothstep(top - 0.0022, top, ly);
  vec3 bodyCol = mix(vec3(0.72, 0.12, 0.1), uShore, 0.18 + 0.55 * uLife.z) * (0.85 + 0.3 * roof);
  vec3 winCol = mix(uSkyHor * 0.7, vec3(1.0, 0.83, 0.55) * 1.2, uLife.z);
  vec3 c = mix(mix(bodyCol, winCol, win * body), uShore * 0.6, bogie);
  return mix(col, c, max(body, bogie));
}

// relief-shaded mountain face: original snow cap and colours, plus gullies, strata and light
float gullies(vec2 p) { return ridged(vec2(p.x * 16.0 + p.y * 5.0, p.y * 10.0)) * 0.6 + n2(vec2(p.x * 40.0 + p.y * 9.0, p.y * 28.0)) * 0.25; }
vec3 farRange(vec2 p, float fx, float fy) {
  float depth = fy - p.y;
  vec2 q = vec2(fx, p.y);
  float e = 0.0025;
  float g0 = gullies(q), gx = gullies(q + vec2(e, 0.0)), gy = gullies(q + vec2(0.0, e));
  float slope = (farY(fx + 0.014) - farY(fx - 0.014)) / 0.028;
  vec3 n = normalize(vec3(-(gx - g0) / e * 0.03 - slope * 0.9, -(gy - g0) / e * 0.03 + 0.2, 1.0));
  vec3 L = lightDir(p);
  float dif = clamp(dot(n, L) * 1.25 - 0.1, 0.0, 1.0);
  float occ = mix(0.78, 1.0, smoothstep(0.15, 0.6, g0));
  vec3 rock = uFar * (0.93 + 0.12 * n2(vec2(fx * 26.0, p.y * 160.0 + fx * 30.0)));
  rock = mix(rock, uSkyHor, (1.0 - smoothstep(-0.26, 0.02, p.y)) * 0.18);
  vec3 rockC = rock * mix(0.58, 1.18, dif) * occ + lightCol() * 0.06 * dif * golden();
  // the original ragged cap, reaching further down the gullies
  float snowLine = -0.13 + 0.04 * n1(fx * 7.0);
  float ragged = 0.55 + 0.30 * n1(fx * 48.0) + 0.25 * n1(fx * 131.0);
  float couloir = smoothstep(0.80, 0.95, n1(fx * 23.0 + 9.0)) * 1.4;
  float gul = smoothstep(0.55, 0.25, g0);
  float snowDepth = mix(0.020, 0.075, n1(fx * 11.0 + 4.0)) * (ragged + couloir + gul * 0.5) * smoothstep(snowLine, snowLine + 0.07, fy);
  float snow = smoothstep(snowDepth, snowDepth * 0.8, depth) * smoothstep(snowLine - 0.01, snowLine + 0.01, p.y);
  float sunSide = smoothstep(-0.006, 0.010, slope * (uSun.x < 0.0 ? -1.0 : 1.0));
  vec3 snowC = mix(uSnowShade * mix(0.9, 1.0, occ), uSnowLit, clamp(sunSide * 0.35 + dif * 0.9 - 0.1, 0.0, 1.0));
  snowC = mix(snowC, uSnowShade, smoothstep(0.3, 1.0, depth / max(snowDepth, 0.001)) * 0.3);
  vec3 col = mix(rockC, snowC, snow);
  col *= 1.0 - 0.08 * (1.0 - smoothstep(0.0, 0.01, depth));
  return col;
}

vec3 midRange(vec2 p, float mx, float my) {
  float slope = (midY(mx + 0.015) - midY(mx - 0.015)) / 0.03;
  float g = fbm3(vec2(mx * 12.0, p.y * 12.0 + mx * 3.0));
  float gx = fbm3(vec2((mx + 0.004) * 12.0, p.y * 12.0 + (mx + 0.004) * 3.0));
  float lit = clamp(0.5 + (gx - g) * 6.0 * sign(sunP().x - p.x) - slope * 0.5 * sign(sunP().x - p.x), 0.0, 1.0);
  vec3 c = uMid * mix(0.86, 1.1, lit) * (0.95 + 0.08 * n2(p * vec2(260.0, 180.0)));
  c = mix(c, uFog, 0.12 * (1.0 - smoothstep(-0.3, -0.2, p.y)));
  c *= 1.0 - 0.07 * (1.0 - smoothstep(0.0, 0.008, my - p.y));
  return c;
}

// spruce forest: the original hill colour; crowns of varying size in two layers, lit on the sun side
float crowns(vec2 p, float sc, float seed, float toSun, out float lit) {
  vec2 g = p * vec2(sc, sc * 0.72);
  vec2 id = floor(g); vec2 f = fract(g);
  vec2 j = hash22(id + seed) - 0.5;
  float sz = 0.75 + 0.5 * hash12(id + seed * 3.0);
  vec2 d = (f - vec2(0.5 + j.x * 0.5, 0.25 + j.y * 0.3)) / sz;
  float cone = smoothstep(0.08, -0.05, abs(d.x) - (0.8 - d.y) * 0.36) * step(-0.05, d.y);
  lit = smoothstep(-0.08, 0.14, d.x * toSun);
  return cone;
}
vec3 forest(vec2 p, float hy) {
  float toSun = sign(sunP().x - p.x);
  float light = daylight() + 0.4 * uMoon.w * (1.0 - daylight());
  float l1, l2;
  float c1 = crowns(p, 70.0, 1.0, toSun, l1);
  float c2 = crowns(p + 0.004, 118.0, 7.0, toSun, l2);
  float cone = max(c1, c2 * 0.8);
  float lit = c1 > c2 ? l1 : l2;
  float k = mix(0.84, mix(0.97, 1.1, lit * light), cone);
  vec3 c = uHills * k;
  c *= 0.95 + 0.08 * fbm3(p * vec2(18.0, 11.0));
  c *= mix(0.86, 1.0, smoothstep(-0.44, -0.3, p.y));
  c += lightCol() * uHills * 0.22 * (1.0 - smoothstep(0.0, 0.008, hy - p.y)) * daylight();
  return c;
}

vec3 shore(vec2 p, float sy) {
  vec3 c = uShore * (0.85 + 0.25 * fbm3(p * vec2(30.0, 60.0)));
  float pebble = smoothstep(0.62, 0.8, n2(p * 180.0));
  c = mix(c, uShore * 1.35 + uFog * 0.05, pebble * 0.35);
  c *= mix(0.65, 1.0, smoothstep(-0.52, sy, p.y));
  c += lightCol() * uShore * 0.25 * (1.0 - smoothstep(0.0, 0.012, sy - p.y)) * daylight();
  return c;
}
// reeds and grass along the shore line, swaying with the loop
float grass(vec2 p, float sy, float px) {
  float cells = 900.0;
  float id = floor(p.x * cells);
  float h = hash11(id * 1.7);
  if (h < 0.35) return 0.0;
  float tall = mix(0.006, 0.03, pow(hash11(id * 3.1), 2.0)) * smoothstep(0.2, 0.9, abs(p.x) / (uAspect * 0.5) + 0.3);
  float base = sy - 0.002;
  float t = clamp((p.y - base) / tall, 0.0, 1.0);
  float sway = 0.004 * t * t * wave(1.0 + floor(h * 3.0), id);
  float x = (id + 0.5) / cells + sway;
  float w = mix(px * 1.3, px * 0.3, t);
  return step(base, p.y) * step(p.y, base + tall) * (1.0 - smoothstep(w, w + px, abs(p.x - x)));
}

vec3 landscape(vec2 p, float px) {
  vec3 col = skyColor(p);
  col = stars(col, p, px);
  col = shootingStar(col, p, px);
  col = moon(col, p, px);
  col = clouds(col, p, px);
  col = sun(col, p, px);

  float aa = px * 1.2;
  float fx = p.x + uPointer.x * 0.006;
  float fy = farY(fx);
  float inF = inside(fy, p.y, aa);
  if (inF > 0.0) col = mix(col, farRange(p, fx, fy), inF);
  col = fog(col, p, -0.205, 0.035, 1.0);
  col = birds(col, p, px);

  float mx = p.x + uPointer.x * 0.012;
  float my = midY(mx);
  float inM = inside(my, p.y, aa);
  if (inM > 0.0) col = mix(col, midRange(p, mx, my), inM);
  col = fog(col, p, -0.262, 0.028, 2.0);
  col = train(col, p, px);

  float hy = hillsY(p.x + uPointer.x * 0.022);
  float inH = inside(hy, p.y, aa);
  if (inH > 0.0) col = mix(col, forest(p, hy), inH);
  return col;
}

float boatMask(vec2 q, out float sail) {
  float hull = step(-0.28, q.y) * step(q.y, 0.06) * step(abs(q.x), 1.0 - (0.06 - q.y) * 0.9);
  float main = step(0.10, q.y) * step(q.y, 1.9) * step(0.02, q.x) * step(q.x, 0.02 + (1.9 - q.y) * 0.34);
  float jib = step(0.12, q.y) * step(q.y, 1.55) * step(-0.08, -q.x) * step(-q.x, 0.06 + (1.55 - q.y) * 0.40);
  float mast = step(abs(q.x), 0.035) * step(0.0, q.y) * step(q.y, 2.0);
  sail = max(main, jib * 0.92);
  return max(max(hull, mast), sail);
}
vec3 boat(vec3 col, vec2 w, float px, float wob) {
  if (uLife.y < 0.01) return col;
  float s = 0.024;
  vec2 base = vec2(mix(-0.62, 0.62, uLoop / LOOP) * uAspect, -0.372 + 0.0015 * wave(11.0, 0.0));
  vec2 lamp = base + vec2(-0.75 * s, 0.25 * s);
  float ld = length(w - lamp);
  col += vec3(1.0, 0.80, 0.50) * uLife.z * ((1.0 - smoothstep(px * 0.8, px * 2.2, ld)) + 0.18 * exp(-ld / (s * 0.7)));
  vec2 q = (w - base) / s;
  if (abs(q.x) > 1.3 || q.y > 2.2 || q.y < -2.6) return col;
  float sail, sail2;
  float m = (boatMask(q, sail) + boatMask(q + vec2(px / s * 0.5), sail2)) * 0.5;
  float lit = step(0.0, q.x * sign(sunP().x - base.x));
  vec3 hullCol = uShore * 1.1;
  vec3 sailCol = mix(uCloud, uSnowLit, 0.5) * mix(0.82, 1.08, lit) * (0.85 + 0.15 * daylight());
  col = mix(col, mix(hullCol, sailCol, sail), m * uLife.y);
  vec2 r = vec2(q.x + wob * 1.8, -q.y - 0.02);
  float rs;
  float rm = boatMask(r, rs) * step(q.y, 0.0);
  return mix(col, mix(hullCol, sailCol * 0.75, rs), rm * 0.35 * uLife.y * smoothstep(-2.6, -0.5, q.y));
}

vec3 rings(vec3 col, vec2 w, float px) {
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float u = (uLoop - mix(9.0, 47.0, fi / 2.0)) / 3.2;
    if (u < 0.0 || u > 1.0) continue;
    vec2 d = w - vec2((hash11(fi * 4.3) - 0.5) * 0.55 * uAspect, mix(-0.335, -0.420, hash11(fi * 7.9)));
    for (int k = 0; k < 2; k++) {
      float rr = 0.004 + u * 0.05 - float(k) * 0.012;
      if (rr < 0.0) continue;
      float e = abs(length(vec2(d.x, d.y * 4.0)) - rr);
      col = mix(col, mix(uSkyHor, vec3(1.0), 0.35), (1.0 - smoothstep(px * 0.6, px * 1.8, e)) * (1.0 - u) * (0.4 - 0.15 * float(k)));
    }
  }
  return col;
}

// loop-periodic wave slope in screen space (perspective: waves shrink towards the horizon)
vec2 waterSlope(vec2 w, float depth) {
  float z = 1.0 / (depth + 0.012);
  vec2 P = vec2(w.x * z, z);
  vec2 g = vec2(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float ang = -0.6 + fi * 0.37 + hash11(fi) * 0.3;
    vec2 k = vec2(cos(ang), sin(ang)) * (0.9 + fi * 0.55);
    float ph = dot(P, k) * 0.9 + TAU * (1.0 + fi) * uLoop / LOOP + fi * 1.7;
    g += k * cos(ph) / (1.0 + fi * 0.8);
  }
  g += (vec2(n2(P * vec2(3.0, 1.5)), n2(P * vec2(3.0, 1.5) + 7.0)) - 0.5) * 1.4;
  return g;
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
    vec2 sl = waterSlope(w, depth);
    float amp = 0.0012 + depth * 0.028;
    vec2 rp = vec2(w.x + sl.x * amp * 0.6, waterY + depth + sl.y * amp * 0.35);
    vec3 refl = landscape(rp, px);
    float fres = mix(0.52, 0.92, exp(-depth * 10.0));
    vec3 body = mix(uShore, uHills, 0.45) * 0.55 + uSkyTop * 0.06;
    col = mix(body, refl, fres);
    col = mix(col, uShore, uMisc.z * smoothstep(0.02, 0.2, depth) * 0.6);
    // glitter under the sun and the moon: bright where waves tilt towards the light
    float spark = smoothstep(0.55, 1.0, sl.y * 0.35 + n2(vec2(w.x * 140.0, depth * 900.0 + uLoop * 0.0)) * 0.9);
    float sunPath = exp(-pow((w.x - sunP().x) / (0.025 + depth * 0.3), 2.0)) * uSun.w * smoothstep(-0.2, 0.05, uSun.y);
    float moonPath = exp(-pow((w.x - moonP().x) / (0.015 + depth * 0.16), 2.0)) * uMoon.w;
    col += uSunCol * sunPath * spark * 0.9;
    col += vec3(0.9, 0.93, 1.0) * moonPath * spark * 0.35;
    // wet line where the water meets the shore
    col = rings(col, w, px);
    col = boat(col, w, px, sl.x * 0.012);
  }

  float sy = shoreY(w.x + uPointer.x * 0.032);
  float inS = inside(sy, w.y, px * 1.2);
  if (inS > 0.0) col = mix(col, shore(w, sy), inS);
  float gr = grass(w, sy, px);
  col = mix(col, uShore * 0.8 + lightCol() * uShore * 0.3 * daylight(), gr * 0.95);

  // lens: soft vignette, fine grain
  vec2 fc = gl_FragCoord.xy;
  col *= 0.95 + 0.05 * smoothstep(0.9, 0.3, length(vUv - 0.5));
  col *= 1.0 + (hash12(floor(fc)) - 0.5) * 0.03 + (n2(vec2(fc.x * 0.02, fc.y * 0.6)) - 0.5) * 0.015;
  col += (hash12(fc + 17.0) - 0.5) / 255.0 * 2.0;
  col = mix(uSkyTop, col, smoothstep(0.0, 0.25, uIntro));
  gl_FragColor = vec4(col, 1.0);
}
`;
