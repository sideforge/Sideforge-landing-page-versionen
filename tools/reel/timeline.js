/* SideForge Reel — the one timeline both the picture (reel.js) and the score (audio.js) read.
   60 s, 9:16, 96 BPM. The grammar is the site's films: macro shots of real materials, each cut
   through by a great curved horizon with darkness (or paper) above it, one word on the horizon,
   a hard cut on every beat; large images rise out of the dark like a horizon. */
(function (root) {
  "use strict";
  var BPM = 96, B = 60 / BPM;            // one beat = 0.625 s, one bar = 2.5 s
  var FINAL = 88 * B;                    // 55.0 s — the mark

  // scenes
  var MAT = 0, MARK = 1, DUNES = 2, RIDGES = 3, END = 4, BLACK = 5;
  // materials (MAT): which are paper-light above the horizon is decided in the shader
  var ICE = 0, FELT = 1, COPPER = 2, GRAPHITE = 3, SLATE = 4, MUD = 5, MOSS = 6, PAINT = 7,
      GUILLOCHE = 8, WOOD = 9, MARBLE = 10, IRON = 11, GOLD = 12;
  var LIGHT = {}; LIGHT[GRAPHITE] = LIGHT[PAINT] = LIGHT[MARBLE] = 1;

  // m(beat, beats, material, horizon[y0, y1, R], camera[panX, panY, zoom0, zoom1], opts)
  // opts: w word, inv (material above, horizon bowing down), rot, dof, ease, spd, punch, whip
  var S = [];
  function m(b, n, mat, hz, cm, o) { o = o || {}; S.push([b, n, MAT, [mat, hz[0], hz[1], hz[2]], cm, [o.inv ? 1 : 0, o.rot || 0, o.dof == null ? 1 : o.dof, 0], o]); }
  function s(b, n, scene, a, bb, c, o) { S.push([b, n, scene, a, bb, c, o || {}]); }

  // ---- 0–3.75 s  HOOK: a copper world rushes up to fill the frame; three words, three cuts
  m(0, 2, COPPER, [.02, .045, .52], [.03, 0, .3, 1.02], { w: "THIS", ease: "hook", spd: "punch", punch: 1 });
  m(2, 2, IRON, [.0, .03, .6], [-.05, .01, 1, 1.1], { w: "CHANGES", punch: 1.05 });
  m(4, 2, GRAPHITE, [-.02, .02, .55], [.04, -.02, 1, 1.12], { w: "EVERYTHING.", punch: 1.05 });
  // ---- 3.75–15 s  MONTAGE: one or two beats a shot, no words
  m(6, 2, FELT, [-.12, .04, .6], [.09, 0, 1.15, 1.25], { punch: 1.04 });
  m(8, 1, GUILLOCHE, [.05, .09, .5], [.0, .05, 1.3, 1.4], { punch: 1.04 });
  m(9, 1, WOOD, [-.05, 0, .7], [.12, 0, 1.2, 1.3], { punch: 1.04 });
  m(10, 2, ICE, [-.2, .06, .55], [0, .03, 1, 1.15], { punch: 1.04, whip: [1, 0] });
  m(12, 1, MARBLE, [.04, .07, .6], [-.08, 0, 1.2, 1.3], { punch: 1.04 });
  m(13, 1, SLATE, [.1, .06, .5], [.1, 0, 1.3, 1.45], { inv: 1, punch: 1.04 });
  m(14, 2, GOLD, [-.1, .05, .65], [.05, .02, 1, 1.18], { punch: 1.04 });
  m(16, 1, MOSS, [.02, .06, .55], [.06, 0, 1.3, 1.4], { punch: 1.04 });
  m(17, 1, PAINT, [.08, .05, .6], [-.1, 0, 1.1, 1.2], { inv: 1, punch: 1.04 });
  m(18, 2, MUD, [-.15, .03, .6], [0, .04, 1, 1.2], { punch: 1.04, whip: [-1, 0] });
  m(20, 1, COPPER, [.05, .08, .5], [.1, 0, 1.4, 1.55], { inv: 1, punch: 1.04 });
  m(21, 1, GUILLOCHE, [.0, .04, .6], [-.08, .04, 1.1, 1.2], { punch: 1.04 });
  m(22, 1, IRON, [.06, .03, .55], [.1, 0, 1.2, 1.35], { punch: 1.04 });
  m(23, 1, GRAPHITE, [.04, .08, .5], [.06, 0, 1.3, 1.4], { inv: 1, punch: 1.04 });
  // ---- 15–30 s  BUILT DIFFERENT.
  m(24, 3, GOLD, [-.3, .03, .62], [.02, 0, 1, 1.12], { w: "BUILT", ease: "expo", punch: 1.1 });
  m(27, 3, IRON, [.01, .05, .58], [-.04, 0, 1.05, 1.18], { w: "DIFFERENT.", punch: 1.06 });
  s(30, 2, DUNES, [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { rise: 1.2, punch: 1 });
  m(32, 1, WOOD, [.05, .08, .55], [.1, 0, 1.3, 1.4], { punch: 1.05 });
  m(33, 1, ICE, [.02, .06, .5], [-.08, .04, 1.4, 1.5], { inv: 1, punch: 1.05 });
  m(34, 1, MARBLE, [.06, .04, .6], [.1, 0, 1.2, 1.3], { punch: 1.05 });
  m(35, 1, COPPER, [.0, .05, .55], [-.1, 0, 1.2, 1.35], { punch: 1.05 });
  s(36, 2, RIDGES, [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { rise: 1.1, punch: 1 });
  m(38, 1, SLATE, [.04, .07, .55], [.12, 0, 1.3, 1.4], { punch: 1.05 });
  m(39, 1, FELT, [.05, .03, .5], [-.1, 0, 1.4, 1.55], { inv: 1, punch: 1.05 });
  m(40, 1, GUILLOCHE, [.0, .06, .55], [.05, .06, 1.2, 1.35], { punch: 1.05 });
  m(41, 1, PAINT, [.07, .04, .6], [.1, 0, 1.2, 1.3], { punch: 1.05 });
  m(42, 1, MOSS, [.03, .07, .5], [-.1, 0, 1.3, 1.45], { inv: 1, punch: 1.05 });
  m(43, 1, GOLD, [.05, .03, .55], [.1, 0, 1.3, 1.4], { punch: 1.05 });
  m(44, .5, MUD, [.05, .07, .5], [.2, 0, 1.4, 1.5], { punch: 1.05 });
  m(44.5, .5, ICE, [.05, .07, .55], [-.2, 0, 1.4, 1.5], { inv: 1, punch: 1.05 });
  m(45, .5, IRON, [.05, .07, .5], [.2, 0, 1.4, 1.5], { punch: 1.05 });
  m(45.5, .5, MARBLE, [.05, .07, .55], [-.2, 0, 1.4, 1.5], { inv: 1, punch: 1.05 });
  m(46, .5, COPPER, [.05, .07, .5], [.2, 0, 1.5, 1.6], { punch: 1.05 });
  m(46.5, .5, GRAPHITE, [.05, .07, .55], [-.2, 0, 1.5, 1.6], { inv: 1, punch: 1.05 });
  s(47, 1, BLACK, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], {});
  // ---- 30–45 s  PEAK: the copper world again, harder; cuts on every beat, one held breath, then the drop
  m(48, 2, COPPER, [.02, .05, .52], [-.04, 0, .22, 1.15], { ease: "hook", spd: "punch", punch: 1 });
  m(50, 1, GUILLOCHE, [.03, .07, .5], [.15, 0, 1.3, 1.5], { inv: 1, punch: 1.06 });
  m(51, 1, IRON, [.03, .06, .55], [-.15, 0, 1.3, 1.5], { punch: 1.06 });
  m(52, 1, GOLD, [.05, .07, .5], [.15, .05, 1.2, 1.4], { inv: 1, punch: 1.06 });
  m(53, 1, MARBLE, [.02, .06, .55], [-.15, 0, 1.3, 1.5], { punch: 1.06 });
  m(54, .5, ICE, [.05, .07, .5], [.25, 0, 1.4, 1.55], { punch: 1.06 });
  m(54.5, .5, WOOD, [.05, .07, .55], [-.25, 0, 1.4, 1.55], { inv: 1, punch: 1.06 });
  m(55, .5, FELT, [.05, .07, .5], [.25, 0, 1.5, 1.65], { punch: 1.06 });
  m(55.5, .5, SLATE, [.05, .07, .55], [-.25, 0, 1.5, 1.65], { inv: 1, punch: 1.06 });
  m(56, 1, PAINT, [.03, .06, .6], [.15, 0, 1.2, 1.4], { punch: 1.06 });
  m(57, 1, MUD, [.03, .06, .5], [-.15, 0, 1.3, 1.5], { inv: 1, punch: 1.06, whip: [0, 1] });
  // the held breath: ice, almost still
  m(58, 4, ICE, [-.05, .02, .6], [.004, .002, 1.5, 1.62], { spd: "slow", ease: "lin", dof: 1.6, punch: 1.02 });
  // the drop: low and fast over the dunes into the sun
  s(62, 4, DUNES, [9, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { rise: .45, spd: "punch", punch: 1.12 });
  m(66, 1, COPPER, [.03, .07, .5], [.2, 0, 1.3, 1.5], { punch: 1.06 });
  m(67, 1, GUILLOCHE, [.03, .07, .55], [-.2, 0, 1.3, 1.5], { inv: 1, punch: 1.06 });
  m(68, 1, GOLD, [.03, .07, .5], [.2, 0, 1.3, 1.5], { punch: 1.06 });
  m(69, 1, IRON, [.03, .07, .55], [-.2, 0, 1.3, 1.5], { inv: 1, punch: 1.06 });
  s(70, 1.5, RIDGES, [6, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { rise: .35, punch: 1.05 });
  s(71.5, .5, BLACK, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], {});
  // ---- 45–55 s  HERO: ridge after ridge rises out of the dark into the morning; a slow drift
  s(72, 16, RIDGES, [.7, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { ease: "inout", rise: 1.6, fadeOut: [86.8 * B, FINAL] });
  // ---- 55–60 s  the mark on paper
  s(88, 8, END, [1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], { ease: "lin" });

  var shots = S.map(function (x, i) {
    var o = x[6] || {};
    return { i: i, t0: x[0] * B, dur: x[1] * B, scene: x[2], a: x[3], b: x[4], c: x[5], ease: o.ease || "out", spd: o.spd || "lin",
             word: o.w || null, inv: !!o.inv, light: x[2] === MAT && !!LIGHT[x[3][0]], rise: o.rise || 0,
             fx: o.fx || [], punch: o.punch || 1, whip: o.whip || null, fadeOut: o.fadeOut || null };
  });

  // big hits: [time, strength, kind] — shake/flash in the picture, drums and brass in the score
  var IMPACTS = [
    [0, 1, "hit"], [2 * B, .55, "word"], [4 * B, .6, "word"],
    [24 * B, .9, "hit"], [27 * B, .6, "word"], [48 * B, 1, "drop"], [62 * B, 1, "drop"], [FINAL, 1, "final"]
  ];

  var TEXT = [
    { kind: "forge", t0: 74 * B, t1: 86.6 * B, words: ["FORGE", "YOUR", "OWN", "WAY."], at: [74 * B, 75 * B, 76 * B, 77 * B] },
    { kind: "end", t0: FINAL, t1: 60 }
  ];

  var TL = { BPM: BPM, B: B, DURATION: 60, FPS: 30, FINAL: FINAL, W: 1080, H: 1920, shots: shots, IMPACTS: IMPACTS, TEXT: TEXT,
             SCENES: { MAT: MAT, MARK: MARK, DUNES: DUNES, RIDGES: RIDGES, END: END, BLACK: BLACK } };
  if (typeof module !== "undefined" && module.exports) module.exports = TL; else root.TL = TL;
})(this);
