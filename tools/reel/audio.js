/* SideForge Reel — the score, synthesised: node tools/reel/audio.js <out.wav>
   Modern-classical trailer in D minor at 96 BPM: a clockwork tick, spiccato low strings,
   piano, a string section, taiko and a low brass swell on the hits, one held breath before
   each drop. Every hit is read from timeline.js so it lands on the cut. 48 kHz stereo float WAV. */
"use strict";
const fs = require("fs");
const TL = require("./timeline.js");
const SR = 48000, DUR = TL.DURATION, N = SR * DUR, B = TL.B;
const at = b => b * B;                               // beat → seconds

// ------------------------------------------------------------------ buses
const bus = () => [new Float32Array(N), new Float32Array(N)];
const DRY = bus(), HALL = bus(), ROOM = bus();
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function place(mono, t0, gain, pan, hall, room) {
  const i0 = Math.round(t0 * SR), gl = Math.cos((pan + 1) * Math.PI / 4) * gain, gr = Math.sin((pan + 1) * Math.PI / 4) * gain;
  for (let i = 0; i < mono.length; i++) {
    const j = i0 + i; if (j < 0) continue; if (j >= N) break;
    const s = mono[i];
    DRY[0][j] += s * gl; DRY[1][j] += s * gr;
    if (hall) { HALL[0][j] += s * gl * hall; HALL[1][j] += s * gr * hall; }
    if (room) { ROOM[0][j] += s * gl * room; ROOM[1][j] += s * gr * room; }
  }
}
function lp1(x, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0; for (let i = 0; i < x.length; i++) { y = (1 - a) * x[i] + a * y; x[i] = y; } return x; }
function hp1(x, fc) { const a = Math.exp(-2 * Math.PI * fc / SR); let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - px); px = x[i]; x[i] = y; } return x; }
// RBJ biquad with per-sample cutoff (function of i)
function biquad(x, type, fcOf, q) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = Math.min(fcOf(i), SR * .45), w = 2 * Math.PI * fc / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
    let b0, b1, b2;
    if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
    else if (type === "hp") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}
const buf = s => new Float32Array(Math.max(1, Math.round(s * SR)));
function saw(ph, dt) { // polyBLEP saw, ph in [0,1)
  let v = 2 * ph - 1;
  if (ph < dt) { const t = ph / dt; v -= t + t - t * t - 1; } else if (ph > 1 - dt) { const t = (ph - 1) / dt; v -= t * t + t + t + 1; }
  return v;
}

// ------------------------------------------------------------------ instruments
function piano(t0, m, dur, vel, pan) {
  const f = mtof(m), len = dur + 3.5, x = buf(len), Bi = .00035, bright = .5 + vel * .6;
  for (let s = 0; s < 2; s++) {
    const det = s ? 1.0007 : .9994;
    for (let k = 1; k <= 12; k++) {
      const fk = f * k * Math.sqrt(1 + Bi * k * k) * det; if (fk > 15000) break;
      const amp = Math.pow(k, -1.25) * Math.pow(bright, k * .35) * (k === 1 ? 1 : .8);
      const dec = (.55 + .32 * k) * Math.pow(f / 262, .35), ph = rnd() * 6.28;
      for (let i = 0; i < x.length; i++) {
        const t = i / SR; let e = Math.exp(-t * dec) * (1 - Math.exp(-t * 900));
        if (t > dur) e *= Math.exp(-(t - dur) * 7);
        x[i] += Math.sin(2 * Math.PI * fk * t + ph) * amp * e * .5;
      }
    }
  }
  for (let i = 0; i < Math.min(x.length, SR * .02); i++) x[i] += (rnd() * 2 - 1) * Math.exp(-i / SR * 400) * .08 * vel;
  place(x, t0, vel * .22, pan == null ? (m - 62) / 40 : pan, .45, .15);
}
function strings(t0, notes, dur, gain, opt) {
  opt = opt || {};
  const att = opt.att || .8, rel = opt.rel || 1.4, len = dur + rel, trem = opt.trem || 0;
  notes.forEach((m, ni) => {
    const f = mtof(m), x = buf(len);
    for (let v = 0; v < 5; v++) {
      const det = Math.pow(2, ((v - 2) * 5 + (rnd() - .5) * 3) / 1200), vr = 4.6 + rnd(), vp = rnd() * 6.28;
      let ph = rnd();
      for (let i = 0; i < x.length; i++) {
        const t = i / SR, fi = f * det * (1 + .0035 * Math.sin(2 * Math.PI * vr * t + vp) * Math.min(1, t / .6)), dt = fi / SR;
        ph += dt; if (ph >= 1) ph -= 1;
        x[i] += saw(ph, dt) * .2;
      }
    }
    for (let i = 0; i < x.length; i++) {
      const t = i / SR;
      let e = Math.min(1, t / att); e = e * e * (3 - 2 * e);
      if (t > dur) e *= Math.max(0, 1 - (t - dur) / rel);
      if (trem) e *= .55 + .45 * Math.sin(2 * Math.PI * trem * t);
      x[i] *= e;
    }
    const bright = opt.bright || 1;
    biquad(x, "lp", i => (900 + 1600 * bright) * (.6 + .4 * Math.min(1, i / SR / att)), .7);
    hp1(x, 60);
    place(x, t0, gain / Math.sqrt(notes.length), ((ni / Math.max(1, notes.length - 1)) - .5) * .9, .7, 0);
  });
}
function spiccato(t0, m, vel, pan) {
  const f = mtof(m), x = buf(.32);
  let p1 = rnd(), p2 = rnd();
  for (let i = 0; i < x.length; i++) {
    const t = i / SR; p1 += f / SR; p2 += f * 1.004 / SR; if (p1 >= 1) p1 -= 1; if (p2 >= 1) p2 -= 1;
    x[i] = (saw(p1, f / SR) + saw(p2, f / SR)) * .5 * (1 - Math.exp(-t * 400)) * Math.exp(-t * 16);
  }
  biquad(x, "lp", i => 500 + 2200 * Math.exp(-i / SR * 25), .9);
  place(x, t0, vel * .34, pan || 0, .25, .2);
}
function taiko(t0, vel, pitch, pan) {
  pitch = pitch || 1;
  const x = buf(1.6);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR, f = (48 + 55 * Math.exp(-t * 22)) * pitch;
    ph += f / SR;
    x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * (3.2 / pitch)) * (1 - Math.exp(-t * 2000)) * 1.1;
  }
  const n = buf(.25);
  for (let i = 0; i < n.length; i++) n[i] = (rnd() * 2 - 1) * Math.exp(-i / SR * 28);
  biquad(n, "bp", () => 180 * pitch, 1.1);
  for (let i = 0; i < n.length; i++) x[i] += n[i] * .9;
  for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * 1.6);
  place(x, t0, vel * .5, pan || 0, .35, .4);
}
function boom(t0, vel) { // sub drop under the big hits
  const x = buf(3.5);
  let ph = 0;
  for (let i = 0; i < x.length; i++) { const t = i / SR, f = 30 + 34 * Math.exp(-t * 3); ph += f / SR; x[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t * 1.3) * (1 - Math.exp(-t * 600)); }
  place(x, t0, vel * .55, 0, .05, 0);
}
function braam(t0, root, vel, dur) { // low brass, opening and closing like a door
  dur = dur || 2.6;
  const x = buf(dur + .6);
  [root - 12, root, root + 7, root + 12].forEach((m, k) => {
    const f = mtof(m);
    for (let v = 0; v < 3; v++) {
      let ph = rnd(); const d = 1 + (v - 1) * .003;
      for (let i = 0; i < x.length; i++) { ph += f * d / SR; if (ph >= 1) ph -= 1; x[i] += saw(ph, f * d / SR) * (k === 0 ? .5 : .32); }
    }
  });
  biquad(x, "lp", i => { const t = i / SR; return 180 + 1500 * Math.exp(-Math.pow((t - .18) / .5, 2)) + 250 * Math.exp(-t * .8); }, .9);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR; let e = Math.min(1, t / .03) * Math.exp(-t * .9);
    if (t > dur) e *= Math.max(0, 1 - (t - dur) / .6);
    x[i] = Math.tanh(x[i] * .9) * e;
  }
  place(x, t0, vel * .38, 0, .5, 0);
}
function tick(t0, vel, tock) {
  const x = buf(.06);
  for (let i = 0; i < x.length; i++) x[i] = (rnd() * 2 - 1) * Math.exp(-i / SR * 250);
  biquad(x, "bp", () => tock ? 2300 : 3300, 6);
  const y = buf(.06); for (let i = 0; i < y.length; i++) y[i] = (rnd() * 2 - 1) * Math.exp(-i / SR * 1800);
  hp1(y, 4000);
  for (let i = 0; i < x.length; i++) x[i] = x[i] * 1.6 + y[i] * .5;
  place(x, t0, vel * .2, tock ? -.25 : .25, .1, .35);
}
function swell(tEnd, len, vel) { // reversed cymbal into a hit
  const x = buf(len);
  for (let i = 0; i < x.length; i++) { const k = i / x.length; x[i] = (rnd() * 2 - 1) * Math.pow(k, 3.2); }
  biquad(x, "hp", i => 1500 + 5000 * i / x.length, .7);
  place(x, tEnd - len, vel * .1, 0, .3, 0);
}
function whoosh(tc, vel, dir) {
  const len = .5, x = buf(len);
  for (let i = 0; i < x.length; i++) { const k = i / x.length; x[i] = (rnd() * 2 - 1) * Math.sin(Math.PI * k) ** 2; }
  biquad(x, "bp", i => 300 + 3000 * Math.sin(Math.PI * i / x.length), 1.2);
  place(x, tc - len * .55, vel * .4, dir || 0, .2, 0);
}
function stamp(t0) { // the stamp coming down on paper
  const x = buf(.5);
  for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (70 + 60 * Math.exp(-t * 40)) * t) * Math.exp(-t * 18) * .9 + (rnd() * 2 - 1) * Math.exp(-t * 55) * .5; }
  biquad(x, "lp", () => 2500, .7);
  place(x, t0, .6, 0, .15, .5);
}

// ------------------------------------------------------------------ harmony
const CH = {
  Dm: [50, 57, 62, 65, 69], Bb: [46, 53, 58, 62, 65], F: [53, 57, 60, 65, 69], C: [48, 55, 60, 64, 67],
  Gm: [43, 55, 58, 62, 67], A: [45, 52, 57, 61, 64], Dm9: [50, 57, 62, 65, 69, 76]
};
const ROOT = { Dm: 38, Bb: 34, F: 41, C: 36, Gm: 43, A: 33 };
const PROG = ["Dm", "Bb", "F", "C"];
const chordAt = b => b < 8 ? "Dm" : PROG[Math.floor((b - 8) / 4) % 4];   // one chord per bar from beat 8

// ------------------------------------------------------------------ the arrangement
const SIL = [[47, 48], [71.5, 72], [86.8, 88]];      // breaths: nothing but the swell
const silent = b => SIL.some(s => b >= s[0] - 1e-6 && b < s[1]);
const SLOW = [58, 62];                                // the held breath in the peak

// hits from the timeline
TL.IMPACTS.forEach(([t, s, kind]) => {
  if (kind === "word") { taiko(t, .8 * s + .3, 1); piano(t, 38, .6, .7); return; }
  taiko(t, 1.1 * s, 1); taiko(t + .004, .7 * s, .7, -.3); boom(t, s);
  if (kind !== "final") braam(t, ROOT[chordAt(t / B)] + 12, s, kind === "drop" ? 2.2 : 2.6);
});
// the three words of the hook: low piano under each hit
[[0, 38], [2, 34], [4, 41]].forEach(([b, m]) => { piano(at(b), m, 1.2, .9); piano(at(b), m + 12, 1.2, .7); });
strings(at(0), CH.Dm, at(1.6), .5, { att: .02, rel: 1.2, bright: 1.2 });

// clockwork: tick-tock in eighths, slowing to a stop in the held breath
for (let b = .5; b < 62; b += .5) {
  if (silent(b)) continue;
  if (b >= SLOW[0]) { if ((b - SLOW[0]) % 1 === 0) tick(at(b), .6 * (1 - (b - SLOW[0]) / 4), (b * 2) % 2 === 1); continue; }
  if (b >= 48) continue;
  tick(at(b), b < 6 ? .7 : .5, (b * 2) % 2 === 1);
}

// spiccato low strings: sixteenths from the montage to the end of the peak
for (let b = 0; b < 71.5; b += .25) {
  if (silent(b) || (b >= SLOW[0] && b < SLOW[1])) continue;
  const r = ROOT[chordAt(b)], k = Math.round((b % 1) * 4);
  const m = [r, r, r + 12, r][k] + (b >= 48 ? 12 : 0), acc = k === 0 ? 1 : k === 2 ? .8 : .55;
  const lift = b < 6 ? .85 : b < 24 ? .6 + .4 * (b - 6) / 18 : b < 48 ? 1 : 1.15;
  spiccato(at(b), m, acc * lift, k % 2 ? .3 : -.3);
  if (b >= 24) spiccato(at(b), m - 12, acc * lift * .6, 0);
}

// taiko grooves
function groove(b0, b1, pat, vel, pitch) {
  for (let b = b0; b < b1; b += 4) pat.forEach(([o, v]) => { const bb = b + o; if (bb < b1 && !silent(bb) && !(bb >= SLOW[0] && bb < SLOW[1])) taiko(at(bb), vel * v, pitch || 1, (rnd() - .5) * .4); });
}
groove(6, 24, [[0, .9], [1.5, .4], [2, .7], [3.5, .45]], 1);
groove(24, 44, [[0, 1], [1.5, .55], [2, .8], [3, .6], [3.5, .5]], .8);
groove(48, 58, [[0, 1], [.5, .45], [1, .7], [1.75, .5], [2, .9], [2.75, .5], [3, .7], [3.25, .45], [3.5, .8], [3.75, .6]], .85);
groove(48, 58, [[.5, .6], [1.5, .6], [2.5, .6], [3.5, .7]], .5, 2.1);
groove(62, 71.5, [[0, 1], [.5, .5], [1, .75], [1.5, .5], [2, .95], [2.5, .55], [2.75, .5], [3, .8], [3.25, .55], [3.5, .85], [3.75, .7]], .9);
groove(62, 71.5, [[.25, .5], [1.25, .5], [2.25, .5], [3.25, .6]], .5, 2.1);
// the drum roll into the first drop
for (let b = 44; b < 47; b += .125) taiko(at(b), .15 + .6 * (b - 44) / 3, 1.5, (rnd() - .5) * .5);

// the string section
for (let b = 8; b < 72; b += 4) {
  if (b >= 44 && b < 48) continue;
  const c = chordAt(b), len = b + 4 > 71.5 ? 71.5 - b : 4;
  if (b >= 58 && b < 62) continue;
  strings(at(b), CH[c], at(len) - .05, b < 16 ? .28 : b < 24 ? .4 : b < 48 ? .55 : .6, { att: b < 24 ? 1.2 : .3, rel: .8, trem: b >= 48 ? 11 : 0, bright: b >= 48 ? 1.4 : 1 });
}
strings(at(44), CH.C.concat([72, 76]), at(3) - .02, .55, { att: 2.2, rel: .1, bright: 1.5 });    // crescendo into the drop
// the held breath: one high string note, a heartbeat, piano in the echo
strings(at(58), [81, 93], at(4), .22, { att: .6, rel: .3, bright: .6 });
[58, 59, 60, 61].forEach(b => { taiko(at(b), .45, .8); taiko(at(b + .28), .3, .8); });
[[58, 74], [59.5, 69], [60.5, 77], [61.5, 76]].forEach(([b, m]) => piano(at(b), m, .8, .45));

// piano motif over the montage and the build
const MOTIF = [74, 69, 77, 76, 74, 72, 69, null];
for (let b = 6; b < 44; b++) { const m = MOTIF[(b - 6) % 8]; if (m && !silent(b)) piano(at(b), m + (b >= 24 ? 12 : 0), .9, b < 24 ? .5 : .55); }

// swells into every hit
swell(at(6), 1, .7); swell(at(24), 1.4, 1); swell(at(48), 1.8, 1.2); swell(at(62), 1.6, 1); swell(TL.FINAL, 1.2, 1.1);
// whooshes on the whip pans
TL.shots.forEach(s => { if (s.whip) whoosh(s.t0 + s.dur, .8, s.whip[0] || (s.whip[1] > 0 ? .4 : -.4)); });

// ---- 45–55 s: the hero — piano alone over a soft bed, the phrase lands on the words
const HERO = [["Dm", 72], ["Bb", 76], ["Gm", 80], ["A", 84]];
HERO.forEach(([c, b]) => {
  const len = b === 84 ? 86.8 - b : 4;
  strings(at(b), CH[c], at(len), .38, { att: .9, rel: .9, bright: .7 });
  piano(at(b), ROOT[c] + (ROOT[c] < 36 ? 12 : 0), at(len), .55, -.2);
  taiko(at(b), .55, .9);
});
[[72, 69, 1], [73, 74, 1], [74, 77, 1], [75, 76, 1], [76, 74, 1], [77, 81, 3], [80, 79, 1], [81, 77, 1], [82, 76, 1], [83, 74, 1], [84, 73, 1.5], [85.5, 76, 1.3]]
  .forEach(([b, m, d]) => piano(at(b), m, at(d), .62, .1));

// ---- 55 s: the mark — stamp, and D minor opening out
stamp(TL.FINAL);
strings(TL.FINAL, CH.Dm9, 60 - TL.FINAL - 1.2, .75, { att: .05, rel: 1.2, bright: 1.1 });
[26, 38, 50, 57, 62, 65, 69, 76].forEach((m, i) => piano(TL.FINAL + i * .012, m, 4.6, i < 2 ? .9 : .6));

// ------------------------------------------------------------------ reverb (Freeverb) and master
function freeverb(inp, room, damp, width) {
  const sc = SR / 44100, combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], aps = [556, 441, 341, 225];
  const out = bus();
  [0, 1].forEach(ch => {
    const sp = ch ? 23 : 0;
    const cb = combs.map(l => ({ b: new Float32Array(Math.round((l + sp) * sc)), i: 0, f: 0 }));
    const ab = aps.map(l => ({ b: new Float32Array(Math.round((l + sp) * sc)), i: 0 }));
    const x = inp[ch], y = out[ch];
    for (let n = 0; n < N; n++) {
      const s = x[n] * .015; let acc = 0;
      for (const c of cb) { const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp; c.b[c.i] = s + c.f * room; if (++c.i >= c.b.length) c.i = 0; acc += o; }
      for (const a of ab) { const o = a.b[a.i]; a.b[a.i] = acc + o * .5; acc = o - acc; if (++a.i >= a.b.length) a.i = 0; }
      y[n] = acc;
    }
  });
  const w1 = width / 2 + .5, w2 = (1 - width) / 2;
  for (let n = 0; n < N; n++) { const l = out[0][n], r = out[1][n]; out[0][n] = l * w1 + r * w2; out[1][n] = r * w1 + l * w2; }
  return out;
}
const hall = freeverb(HALL, .9, .35, 1), room = freeverb(ROOM, .72, .45, .8);
const M = bus();
for (let ch = 0; ch < 2; ch++) for (let n = 0; n < N; n++) M[ch][n] = DRY[ch][n] + hall[ch][n] * 1.6 + room[ch][n] * .9;
// the breaths: keep only reverb tails and the swells (they sit in the dry bus but are quiet)
// gentle glue, then a soft ceiling
let env = 0;
for (let n = 0; n < N; n++) {
  const a = Math.max(Math.abs(M[0][n]), Math.abs(M[1][n]));
  env = a > env ? a + (env - a) * .9 : env * .99995 + a * .00005;
  const g = env > .5 ? Math.pow(.5 / env, .35) : 1;
  M[0][n] = Math.tanh(M[0][n] * g * 1.1); M[1][n] = Math.tanh(M[1][n] * g * 1.1);
}
// fade out the very end
for (let n = N - SR * 1.2; n < N; n++) { const k = (N - n) / (SR * 1.2); M[0][n] *= k; M[1][n] *= k; }
let peak = 0; for (let ch = 0; ch < 2; ch++) for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(M[ch][n]));
const norm = .89 / peak;

const out = process.argv[2] || "reel.wav";
const data = Buffer.alloc(N * 8);
for (let n = 0; n < N; n++) { data.writeFloatLE(M[0][n] * norm, n * 8); data.writeFloatLE(M[1][n] * norm, n * 8 + 4); }
const h = Buffer.alloc(44);
h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
h.writeUInt32LE(SR * 8, 28); h.writeUInt16LE(8, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(data.length, 40);
fs.writeFileSync(out, Buffer.concat([h, data]));
console.log("wrote", out, "peak", peak.toFixed(3));
