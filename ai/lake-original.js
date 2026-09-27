/* The current SideAI hero shader ("lakeScene"), as shipped on sideforge.ch/en/ai in
   September 2026 — kept here only for the before/after comparison in ai/index.html. */
window.LAKE_ORIGINAL = `
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
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float n1(float x) {
  float i = floor(x);
  float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
  return mix(hash11(i), hash11(i + 1.0), u);
}
float n2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm2(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * n2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s / 0.875;
}
float wave(float turns, float phase) { return sin(TAU * turns * uLoop / LOOP + phase); }
float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float crest(float x) {
  float s = 0.0;
  float a = 0.55;
  float f = 1.0;
  for (int i = 0; i < 5; i++) {
    float v = n1(x * f + float(i) * 17.3);
    v = 1.0 - abs(v * 2.0 - 1.0);
    s += a * v * v;
    f *= 2.13;
    a *= 0.46;
  }
  return s;
}
float soft(float x) {
  float s = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 4; i++) { s += a * n1(x * f + float(i) * 5.1); f *= 2.0; a *= 0.5; }
  return s;
}
float rise(float start) {
  float k = clamp((uIntro - start) / 0.42, 0.0, 1.0);
  return 1.0 - pow(1.0 - k, 3.0);
}

float farY(float x) {
  float side = smoothstep(0.05, 0.75, abs(x) / (uAspect * 0.5));
  return -0.235 + mix(0.13, 0.36, side) * crest(x * 1.35 + 3.0) + 0.003 * n1(x * 90.0) - (1.0 - rise(0.10)) * 0.34;
}
float midY(float x) {
  float side = smoothstep(0.10, 0.90, abs(x) / (uAspect * 0.5));
  return -0.262 + mix(0.07, 0.15, side) * soft(x * 2.2 + 11.0) + 0.0025 * n1(x * 120.0) - (1.0 - rise(0.26)) * 0.30;
}
float hillsY(float x) {
  float side = smoothstep(0.30, 0.95, abs(x) / (uAspect * 0.5));
  float y = -0.302 + side * 0.17 + 0.04 * soft(x * 3.1 + 21.0) * side + 0.002 * n1(x * 150.0);
  float tree = 0.0;
  for (int j = 0; j < 2; j++) {
    float fj = float(j);
    float grid = mix(38.0, 61.0, fj);
    float cell = floor(x * grid + fj * 0.5);
    float cx = (cell + 0.5 - fj * 0.5) / grid;
    float has = step(0.30, hash11(cell * 3.7 + fj * 11.0)) * smoothstep(0.15, 0.55, side);
    float th = mix(0.030, 0.085, hash11(cell * 9.1 + fj * 5.0)) * mix(1.0, 0.65, fj);
    float t = max(0.0, 1.0 - abs(x - cx) / (th * 0.24));
    tree = max(tree, has * th * t * (1.0 - 0.18 * fract((1.0 - t) * 3.0)));
  }
  return y + tree - (1.0 - rise(0.40)) * 0.30;
}
float shoreY(float x) {
  return -0.465 + 0.035 * soft(x * 4.0 + 5.0) + 0.06 * pow(abs(x) / (uAspect * 0.5), 3.0) - (1.0 - rise(0.52)) * 0.20;
}

vec3 paint(vec3 base, vec2 p, float seed) {
  float brush = n2(p * vec2(4.0, 26.0) + seed) - 0.5;
  float tone = fbm2(p * 2.2 + seed * 3.1) - 0.5;
  return base * (1.0 + brush * 0.06 + tone * 0.08);
}
float inside(float ridge, float y, float aa) { return smoothstep(-aa, aa, ridge - y); }
vec3 rim(vec3 col, float ridge, float y) {
  return col * (1.0 - 0.10 * (1.0 - smoothstep(0.0, 0.010, ridge - y)));
}

vec3 skyColor(vec2 p) {
  float h = smoothstep(-0.30, 0.50, p.y);
  vec3 col = mix(uSkyHor, uSkyTop, pow(h, 0.85));
  return col * (1.0 + (n2(p * vec2(1.4, 3.0) + 2.0) - 0.5) * 0.05);
}

vec3 sun(vec3 col, vec2 p, float px) {
  if (uSun.w < 0.001) return col;
  vec2 c = vec2(uSun.x * uAspect, uSun.y) + uPointer * 0.006;
  float R = uSun.z;
  vec2 d = p - c;
  float r = length(d) / (R * (1.0 + 0.012 * (n1(atan(d.y, d.x) * 6.0 + 3.0) - 0.5)));
  float disc = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, r);
  col = mix(col, uSunCol, 0.10 * (1.0 - smoothstep(1.0, 2.4, r)) * uSun.w);
  return mix(col, uSunCol, disc * uSun.w);
}

vec3 moon(vec3 col, vec2 p, float px) {
  if (uMoon.w < 0.001) return col;
  vec2 c = vec2(uMoon.x * uAspect, uMoon.y) + uPointer * 0.006;
  float R = uMoon.z;
  float disc = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, length(p - c) / R);
  float cut = 1.0 - smoothstep(1.0 - px / R * 1.5, 1.0, length(p - c - vec2(R * 0.42, R * 0.18)) / (R * 0.92));
  vec3 face = vec3(0.93, 0.94, 0.97) * (1.0 + (n2((p - c) / R * 3.0 + 7.0) - 0.5) * 0.06);
  return mix(col, face, disc * (1.0 - cut) * uMoon.w);
}

vec3 stars(vec3 col, vec2 p, float px) {
  if (uMisc.x < 0.01) return col;
  vec2 id = floor(p * 30.0);
  vec2 h = hash22(id + 11.0);
  if (h.x < 0.90) return col;
  vec2 pos = (id + 0.2 + hash22(id + 4.0) * 0.6) / 30.0;
  float size = px * mix(0.7, 1.8, h.y);
  float tw = 0.6 + 0.4 * wave(floor(8.0 + h.y * 30.0), h.x * 80.0);
  float s = 1.0 - smoothstep(size * 0.3, size * 1.3, length(p - pos));
  return col + vec3(1.0, 0.97, 0.9) * s * tw * uMisc.x * smoothstep(-0.10, 0.25, p.y);
}

vec3 shootingStar(vec3 col, vec2 p, float px) {
  float u = (uLoop - 51.0) / 1.1;
  if (uLife.w < 0.01 || u < 0.0 || u > 1.0) return col;
  vec2 a = vec2(0.05 * uAspect, 0.38);
  vec2 b = vec2(0.30 * uAspect, 0.27);
  vec2 head = mix(a, b, u);
  vec2 dir = normalize(b - a);
  vec2 tail = head - dir * 0.09 * sin(u * 3.14159);
  float along = clamp(dot(p - tail, dir) / max(length(head - tail), 1e-4), 0.0, 1.0);
  float line = (1.0 - smoothstep(px * 0.5, px * 1.6, segment(p, tail, head))) * along * sin(u * 3.14159);
  return col + vec3(1.0, 0.96, 0.88) * line * uLife.w;
}

vec3 clouds(vec3 col, vec2 p, float px) {
  if (uMisc.w < 0.01 || p.y < 0.20) return col;
  float W = uAspect + 1.4;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float len = mix(0.13, 0.30, hash11(fi * 3.1 + 1.0));
    float hgt = mix(0.016, 0.034, hash11(fi * 5.7 + 2.0));
    float y0 = mix(0.26, 0.40, hash11(fi * 7.3 + 3.0));
    float turns = 1.0 + step(0.6, hash11(fi * 2.9));
    float x = mod(hash11(fi * 1.3) * W + W * turns * uLoop / LOOP, W) - W * 0.5 + uPointer.x * 0.004;
    float lx = (p.x - x) / len;
    if (abs(lx) > 1.0) continue;
    float ly = (p.y - y0) / hgt;
    float top = pow(1.0 - lx * lx, 0.6) * (0.55 + 0.45 * n1(lx * 3.0 + fi * 9.0)) + 0.18 * n1(lx * 11.0 + fi * 3.0) * (1.0 - lx * lx);
    float bottom = -0.28 * (1.0 - pow(abs(lx), 4.0));
    float e = px / hgt * 1.2;
    float m = smoothstep(bottom - e, bottom + e, ly) * smoothstep(top + e, top - e, ly);
    if (m <= 0.0) continue;
    col = mix(col, mix(uCloud * 0.90, uCloud, smoothstep(bottom, top * 0.9, ly)), m * uMisc.w);
  }
  return col;
}

vec3 fog(vec3 col, vec2 p, float y0, float thick, float seed) {
  if (abs(p.y - y0) > thick * 2.5) return col;
  float breathe = 0.012 * wave(1.0, seed * 2.0) * sin(p.x * 3.0 + seed) + 0.008 * wave(2.0, seed) * sin(p.x * 7.3 - seed);
  float edge = y0 + breathe + (n1(p.x * 2.4 + seed * 5.0) * 0.7 + n1(p.x * 6.1 + seed) * 0.3 - 0.5) * 0.05;
  float f = smoothstep(edge + thick, edge, p.y) * smoothstep(edge - thick * 1.4, edge - thick * 0.2, p.y);
  f *= 0.55 + 0.45 * n2(vec2(p.x * 3.0, p.y * 8.0 + seed));
  return mix(col, uFog, f * uMisc.y);
}

float bird(vec2 p, vec2 c, float s, float flap) {
  vec2 q = (p - c) / s;
  q.x = abs(q.x);
  float tip = 0.55 * flap;
  vec2 elbow = vec2(0.48, 0.20 + tip * 0.35);
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
    float s = mix(0.013, 0.008, ff);
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float row = floor((fi + 1.0) * 0.5);
      float side = mod(fi, 2.0) * 2.0 - 1.0;
      vec2 off = vec2(-dir * row * 2.6 * s, side * row * 1.1 * s + (hash11(fi + ff * 7.0) - 0.5) * s * 1.4);
      vec2 c = lead + off + vec2(0.0, 0.25 * s * wave(floor(3.0 + fi), fi * 1.7));
      float d = bird(p, c, s, wave(132.0 + fi * 6.0, fi * 2.1 + ff));
      ink = max(ink, 1.0 - smoothstep(s * 0.07, s * 0.07 + px * 1.2, d));
    }
  }
  return mix(col, uShore * 0.9, ink * 0.85 * uLife.x);
}


// a little red train along the far shore, twice a day; its windows light up at night
vec3 train(vec3 col, vec2 p, float px) {
  float y0 = -0.2935;
  if (p.y < y0 - 0.002 || p.y > y0 + 0.013) return col;
  float u = fract(uLoop / LOOP * 2.0 + 0.15);
  float span = uAspect * 0.5 + 0.2;
  float lx = p.x - mix(span, -span, u);
  float pitch = 0.039;
  if (lx < 0.0 || lx > 4.0 * pitch) return col;
  float k = floor(lx / pitch);
  float cx = lx - k * pitch;
  float car = 0.036;
  if (cx > car) return col;
  float ly = p.y - y0;
  float nose = k < 0.5 ? smoothstep(0.0, 0.007, cx) : 1.0;
  float top = 0.0105 * mix(0.5, 1.0, nose);
  float body = smoothstep(-px, px, ly - 0.0013) * smoothstep(px, -px, ly - top);
  float bogie = smoothstep(px, -px, ly - 0.0013) * step(0.0, ly + 0.001) * step(0.35, fract(cx / 0.009));
  float win = step(0.0048, ly) * step(ly, 0.0082) * step(0.38, fract(cx / 0.0052)) * step(0.005, cx) * step(cx, car - 0.004);
  vec3 bodyCol = mix(vec3(0.74, 0.22, 0.18), uShore, 0.22 + 0.5 * uLife.z);
  vec3 winCol = mix(uSkyHor * 0.85, vec3(1.0, 0.83, 0.55), uLife.z);
  vec3 c = mix(mix(bodyCol, winCol, win * body), uShore * 0.8, bogie);
  return mix(col, c, max(body, bogie));
}

vec3 landscape(vec2 p, float px) {
  vec3 col = skyColor(p);
  col = stars(col, p, px);
  col = shootingStar(col, p, px);
  col = moon(col, p, px);
  col = sun(col, p, px);
  col = clouds(col, p, px);

  float aa = px * 1.2;
  float fx = p.x + uPointer.x * 0.006;
  float fy = farY(fx);
  float inF = inside(fy, p.y, aa);
  if (inF > 0.0) {
    vec3 rock = paint(uFar, p, 1.0);
    rock = mix(rock, uSkyHor, (1.0 - smoothstep(-0.26, 0.02, p.y)) * 0.18);
    float depth = fy - p.y;
    float slope = farY(fx + 0.014) - farY(fx - 0.014);
    float snowLine = -0.13 + 0.04 * n1(fx * 7.0);
    float ragged = 0.55 + 0.30 * n1(fx * 48.0) + 0.25 * n1(fx * 131.0);
    float couloir = smoothstep(0.80, 0.95, n1(fx * 23.0 + 9.0)) * 1.4;
    float snowDepth = mix(0.020, 0.075, n1(fx * 11.0 + 4.0)) * (ragged + couloir) * smoothstep(snowLine, snowLine + 0.07, fy);
    float snow = smoothstep(snowDepth, snowDepth * 0.85, depth) * smoothstep(snowLine - 0.01, snowLine + 0.01, p.y);
    float sunSide = smoothstep(-0.006, 0.010, slope * (uSun.x < 0.0 ? -1.0 : 1.0));
    vec3 snowCol = mix(uSnowShade, uSnowLit, sunSide);
    snowCol = mix(snowCol, uSnowShade, smoothstep(0.3, 1.0, depth / max(snowDepth, 0.001)) * 0.35);
    col = mix(col, rim(mix(rock, snowCol, snow), fy, p.y), inF);
  }
  col = fog(col, p, -0.205, 0.035, 1.0);
  col = birds(col, p, px);

  float my = midY(p.x + uPointer.x * 0.012);
  float inM = inside(my, p.y, aa);
  if (inM > 0.0) col = mix(col, rim(paint(uMid, p, 2.0), my, p.y), inM);
  col = fog(col, p, -0.262, 0.028, 2.0);
  col = train(col, p, px);

  float hy = hillsY(p.x + uPointer.x * 0.022);
  float inH = inside(hy, p.y, aa);
  if (inH > 0.0) col = mix(col, rim(paint(uHills, p, 3.0), hy, p.y), inH);
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
vec3 boat(vec3 col, vec2 w, float px) {
  if (uLife.y < 0.01) return col;
  float s = 0.024;
  vec2 base = vec2(mix(-0.62, 0.62, uLoop / LOOP) * uAspect, -0.372 + 0.0015 * wave(11.0, 0.0));
  vec2 lamp = base + vec2(-0.75 * s, 0.25 * s);
  float ld = length(w - lamp);
  col += vec3(1.0, 0.80, 0.50) * uLife.z * ((1.0 - smoothstep(px * 0.8, px * 2.2, ld)) + 0.18 * exp(-ld / (s * 0.7)));
  vec2 q = (w - base) / s;
  if (abs(q.x) > 1.3 || q.y > 2.2 || q.y < -2.4) return col;
  float sail;
  float sail2;
  float m = (boatMask(q, sail) + boatMask(q + vec2(px / s * 0.5), sail2)) * 0.5;
  vec3 hullCol = uShore * 1.05;
  vec3 sailCol = mix(uCloud, uSnowLit, 0.5) * mix(0.95, 1.05, step(0.02, q.x));
  col = mix(col, mix(hullCol, sailCol, sail), m * uLife.y);
  vec2 r = vec2(q.x + (hash11(floor(q.y * 3.0)) - 0.5) * 0.25, -q.y - 0.02);
  float rs;
  float rm = boatMask(r, rs) * step(q.y, 0.0);
  return mix(col, mix(hullCol, sailCol * 0.8, rs), rm * 0.30 * uLife.y);
}

vec3 rings(vec3 col, vec2 w, float px) {
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float u = (uLoop - mix(9.0, 47.0, fi / 2.0)) / 3.2;
    if (u < 0.0 || u > 1.0) continue;
    vec2 d = w - vec2((hash11(fi * 4.3) - 0.5) * 0.55 * uAspect, mix(-0.335, -0.420, hash11(fi * 7.9)));
    float e = abs(length(vec2(d.x, d.y * 4.0)) - (0.004 + u * 0.05));
    col = mix(col, mix(uSkyHor, vec3(1.0), 0.3), (1.0 - smoothstep(px * 0.6, px * 2.0, e)) * (1.0 - u) * 0.45);
  }
  return col;
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
    float row = floor(w.y * 170.0);
    float seg = floor(w.x * mix(9.0, 3.0, smoothstep(0.0, 0.2, depth)) + hash11(row) * 7.0);
    float jitter = (hash12(vec2(row, seg)) - 0.5) * 2.0;
    float sway = wave(9.0, row * 0.7 + seg * 1.3);
    float amp = 0.0015 + depth * 0.03;
    col = landscape(vec2(w.x + (jitter * 0.6 + sway * 0.4) * amp, waterY + depth + sway * amp * 0.25), px);
    col = mix(col, uShore, uMisc.z * smoothstep(0.0, 0.18, depth)) * 0.94;
    float glint = smoothstep(0.80, 0.96, n2(vec2(w.x * 3.0 + hash11(row) * 40.0, w.y * 90.0)))
      * (0.5 + 0.5 * wave(floor(3.0 + hash11(row * 1.7) * 6.0), row));
    col = mix(col, uSkyHor, glint * 0.20 * smoothstep(0.0, 0.05, depth));
    col = mix(col, uShore, (1.0 - smoothstep(0.0, 0.004, depth)) * 0.35);
    // a path of light on the water below the sun, fainter below the moon
    float spark = smoothstep(0.62, 0.95, n2(vec2(w.x * 55.0 + hash11(row) * 30.0, row)))
      * (0.55 + 0.45 * wave(floor(4.0 + hash11(row * 3.1) * 8.0), row * 1.3));
    float sunPath = exp(-pow((w.x - uSun.x * uAspect) / (0.03 + depth * 0.28), 2.0)) * uSun.w * smoothstep(-0.18, 0.05, uSun.y);
    float moonPath = exp(-pow((w.x - uMoon.x * uAspect) / (0.02 + depth * 0.16), 2.0)) * uMoon.w;
    col = mix(col, uSunCol, sunPath * spark * 0.6);
    col = mix(col, vec3(0.93, 0.94, 0.97), moonPath * spark * 0.35);
    col = rings(col, w, px);
    col = boat(col, w, px);
  }

  float sy = shoreY(w.x + uPointer.x * 0.032);
  float inS = inside(sy, w.y, px * 1.2);
  if (inS > 0.0) col = mix(col, rim(paint(uShore, w, 4.0), sy, w.y), inS);

  vec2 fc = gl_FragCoord.xy;
  col *= 1.0 + (hash12(floor(fc)) - 0.5) * 0.035 + (n2(vec2(fc.x * 0.02, fc.y * 0.6)) - 0.5) * 0.025;
  col = mix(uSkyTop, col, smoothstep(0.0, 0.25, uIntro));
  gl_FragColor = vec4(col, 1.0);
}
`;
