# SideForge Reel — 60 s, 9:16, made only from code

`assets/video/sideforge-reel.mp4` — 1080×1920, 30 fps, H.264 + AAC, for Instagram Reels.

Nothing in it is footage, stock or a generated clip. Every image comes from a shader and every
sound is synthesised. It uses the grammar of the site's films (`tools/film/`): macro shots of real
materials, each cut through by a great curved horizon with darkness (or paper) above it, one word
on the horizon, a hard cut on every beat, and large images rising out of the dark like a horizon.
Words are set in Newsreader and JetBrains Mono. The logo is the SideForge anvil, traced from
sideforge.ch/logo.png.

## Structure (96 BPM, one beat = 0.625 s)

| Time | What you see | What you hear |
| --- | --- | --- |
| 0–3.75 s | A copper world rushes up to fill the frame. **THIS / CHANGES / EVERYTHING.**, one word per cut | Taiko, sub and low brass on the first frame; a clock ticks |
| 3.75–15 s | Felt, guilloché, oak, ice, marbled paper, slate, gold leaf, moss, paint, mud, iron: one or two beats each | Spiccato low strings, piano motif, the taiko comes in |
| 15–30 s | **BUILT** / **DIFFERENT.**, dunes and ridges rise out of the dark, the cuts speed up to half beats | Full strings, a drum roll, one beat of silence |
| 30–45 s | The copper world again, a cut on every beat, a held breath on ice (slow motion), then a low, fast flight over the dunes into the sun | Drop, then the clock slows to a heartbeat, then the hardest drop |
| 45–55 s | Ridge after ridge rises out of the dark into the morning. **FORGE YOUR OWN WAY.** | Piano alone over a soft string bed, one note per word |
| 55–60 s | Cut to paper: the red anvil is stamped, **SIDEFORGE**, **BUILT DIFFERENT.** | Stamp, sub, D minor opening out |

## Files

- `timeline.js` holds the shots, the hits and the words. The picture and the score both read it, so every cut and hit lands on the same frame.
- `shaders.js` holds the scene shader (13 materials, dunes, ridges, a 3D anvil that the timeline no longer uses, the paper) and the bloom and finishing passes. `reel.js` compiles one program per scene and material, because a software GPU runs every branch of a uniform switch.
- `reel.js` + `reel.html` play the timeline. `window.renderAt(t)` draws the frame at *t* seconds.
- `render.js` renders stills or the picture in headless Chromium and pipes the frames into ffmpeg.
- `audio.js` writes the score as a 48 kHz WAV.
- `fonts/` holds Newsreader and JetBrains Mono (SIL Open Font License).

## Rendering

You need Node 18+, Playwright with Chromium, and an ffmpeg built with libx264 (for example `pip install imageio-ffmpeg`).

```sh
cd tools/reel
export FFMPEG=/path/to/ffmpeg
node render.js stills /tmp/stills 0.5,15.2,47,57 0.5    # a few frames at half size
node render.js video /tmp/picture.mp4 3                 # the picture, 3 browsers in parallel
node audio.js /tmp/score.wav                            # the score
$FFMPEG -i /tmp/picture.mp4 -i /tmp/score.wav -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 18 -maxrate 11M -bufsize 22M -pix_fmt yuv420p -profile:v high \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest \
  ../../assets/video/sideforge-reel.mp4
```

On a 4-core machine without a GPU (SwiftShader) the picture takes about 40 minutes.
