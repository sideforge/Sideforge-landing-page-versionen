/* Renders a film to MP4: node tools/film/render.js <home|venura|sintulus|ai|lake> <out.mp4>
   ("lake" renders only the SideAI closing shot; "ai" renders the whole SideAI film)
   Needs a static server on :8766 at the repo root, Playwright and ffmpeg on PATH (or FFMPEG). */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const [,, name, out] = process.argv;
const FPS = 25, FF = process.env.FFMPEG || 'ffmpeg';
async function frames(p, url, dur, ff, label) {
  await p.goto(url);
  await p.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const d = dur != null ? dur : await p.evaluate(() => window.filmDuration || window.lakeDuration);
  const n = Math.round(d * FPS), el = p.locator('.stage');
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.renderAt(t), i / FPS);
    const buf = await el.screenshot({ type: 'png', timeout: 0 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 50 === 0) console.log(label, i, '/', n);
  }
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'slow', '-movflags', '+faststart', out]);
  if (name !== 'lake') await frames(p, `http://localhost:8766/tools/film/film.html?f=${name}`, null, ff, name);
  if (name === 'ai' || name === 'lake') await frames(p, 'http://localhost:8766/tools/film/lake.html', null, ff, 'lake');
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('done', out); await b.close();
})();
