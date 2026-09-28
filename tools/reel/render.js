/* Renders the SideForge reel in headless Chromium.
     node tools/reel/render.js stills <out-dir> <t,t,...> [k]     single frames as PNG (k = scale, .5 = 540×960)
     node tools/reel/render.js video <out.mp4> [workers] [from] [to]  picture only, 1080×1920, 30 fps
   The page is served from this folder by a small built-in server. Needs Playwright (Chromium)
   and an ffmpeg with libx264 (FFMPEG=/path/to/ffmpeg, default "ffmpeg"). */
const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
const { spawn } = require("child_process");
const http = require("http"), fs = require("fs"), path = require("path");
const FF = process.env.FFMPEG || "ffmpeg";
const DIR = __dirname, FPS = 30;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".woff2": "font/woff2" };

function serve() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const f = path.join(DIR, decodeURIComponent(q.url.split("?")[0]));
      if (!f.startsWith(DIR) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
    }).listen(0, () => res(s));
  });
}
async function page(b, port, k) {
  const W = Math.round(1080 * k), H = Math.round(1920 * k);
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on("pageerror", e => console.error("pageerror", e.message));
  p.on("console", m => { if (m.type() === "error") console.error("console", m.text()); });
  await p.goto(`http://localhost:${port}/reel.html?k=${k}`);
  await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
  return p;
}
const launch = () => chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--use-angle=swiftshader"] });

(async () => {
  const [, , mode, out, ...rest] = process.argv;
  const srv = await serve(), port = srv.address().port;
  if (mode === "stills") {
    const ts = rest[0].split(",").map(Number), k = +(rest[1] || .5);
    fs.mkdirSync(out, { recursive: true });
    const b = await launch(), p = await page(b, port, k);
    for (const t of ts) {
      const t0 = Date.now();
      await p.evaluate(t => window.renderAt(t), t);
      await p.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(6, "0")}.png`), timeout: 0 });
      console.log("still", t, Date.now() - t0, "ms");
    }
    await b.close();
  } else if (mode === "video") {
    const workers = +(rest[0] || 2), from = +(rest[1] || 0), to = +(rest[2] || 60);
    const f0 = Math.round(from * FPS), f1 = Math.round(to * FPS), per = Math.ceil((f1 - f0) / workers);
    const tmp = out + ".parts"; fs.mkdirSync(tmp, { recursive: true });
    const started = Date.now();
    const parts = await Promise.all([...Array(workers)].map(async (_, w) => {
      const a = f0 + w * per, z = Math.min(f1, a + per), part = path.join(tmp, `part${w}.mp4`);
      if (a >= z) return null;
      const b = await launch(), p = await page(b, port, 1);
      const ff = spawn(FF, ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", "-profile:v", "high", "-g", "30", part], { stdio: ["pipe", "inherit", "inherit"] });
      for (let i = a; i < z; i++) {
        await p.evaluate(t => window.renderAt(t), i / FPS);
        const buf = await p.screenshot({ type: "png", timeout: 0 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
        if ((i - a) % 30 === 0) console.log(`w${w} frame ${i} (${i - a}/${z - a}) ${((Date.now() - started) / 1000).toFixed(0)}s`);
      }
      ff.stdin.end(); await new Promise(r => ff.on("close", r)); await b.close();
      return part;
    }));
    const list = path.join(tmp, "list.txt");
    fs.writeFileSync(list, parts.filter(Boolean).map(p => `file '${path.resolve(p)}'`).join("\n"));
    await new Promise(r => spawn(FF, ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", out], { stdio: "inherit" }).on("close", r));
    console.log("done", out, ((Date.now() - started) / 1000).toFixed(0) + "s");
  }
  srv.close();
})();
