# SideForge — landing page redesign

New versions of three pages from sideforge.ch, as a static site that can be opened directly:

| Page | File | Live original |
| --- | --- | --- |
| Home | `index.html` | https://sideforge.ch/en |
| Venura 6.5 | `venura/index.html` | https://sideforge.ch/en/venura |
| Sintulus 6 | `sintulus/index.html` | https://sideforge.ch/en/sintulus |

All copy is taken from the live English pages; only layout, typography and motion changed.

## Previewing

The pages load their scripts over relative paths, so serve the folder instead of opening the file:

```sh
python3 -m http.server 8000
# → http://localhost:8000/, /venura/, /sintulus/
```

## Design

- **Editorial, not "landing page".** Warm paper canvas (`#faf9f7`), near-black ink, a single clay accent (`#d97757`, the existing brand colour). Newsreader for voice, Inter for UI, JetBrains Mono for labels. No gradients-on-cards, glows or icon grids.
- **Model pages read like a launch post.** Big serif title, numbered table of contents with dotted leaders, a film, then a narrow article column with a sticky section nav, a spec sheet, numbered capabilities with small line drawings that draw themselves, roadmap, FAQ, "read next".
- **Light and dark.** Follows the system setting; the footer has an Auto / Light / Dark switch.
- **Motion is quiet.** Scroll reveals, line drawings, a statement that lights up word by word. Everything respects `prefers-reduced-motion` (the heroes show their final frame).

## The films

Every page opens with a short film told the way Anthropic's homepage film is told — with SideForge's own words, materials and closing images:

- macro shots of real materials, each cut through by a great curved horizon with darkness (or paper) above it;
- one word of a sentence sits on each horizon, a hard cut on every beat;
- at the end a large image rises out of the dark like a horizon, and the page title is set over it.

| Page | Sentence | Materials | Closing image |
| --- | --- | --- | --- |
| Home | Everything / for your / next / project. | hammered copper, felt with a running stitch, impasto paint, pencil hatching | a dune field at the last light |
| Venura 6.5 | Think / deeper, / stay / longer. | ice with trapped bubbles, cracked mud, moss with spore stalks, wet slate | ridge after ridge in morning haze |
| Sintulus 6 | Work / that runs / for hours. | wet slate, copper, ice | light from deep water |
| SideAI `/en/ai` | A day, / in sixty / seconds. | impasto paint, moss, pencil hatching | the lake in 3D through one day, dawn to night |

The films are **videos** (`assets/video/*.mp4`, 1600×900, 25 fps) — nothing heavy runs live in the browser. `assets/js/lh.js` plays the film once and sets the title when it reaches its last image; with reduced motion, or if autoplay is blocked, the last frame (`*-end.jpg`) and the title show at once.

Everything in the films is procedural — no footage, photographs or code from Anthropic. They are made with `tools/film/`: `film.html` + `film.js` (materials, horizon, words, closing images from `endings/`), `lake.html` (the SideAI closing shot) and `render.js`, which plays a film frame by frame in headless Chromium and pipes it into ffmpeg:

```sh
python3 -m http.server 8766 &
node tools/film/render.js home assets/video/home.mp4
```

## Structure

```
index.html                home
venura/index.html         Venura 6.5
sintulus/index.html       Sintulus 6
ai/                       SideAI hero preview (before/after)
assets/css/site.css       design tokens, components, page layouts, hero overlay
assets/js/site.js         nav, reveals, scroll-spy, theme switch, word-by-word statement
assets/js/lh.js           plays the hero film and sets the title
assets/video/             the films, their last frames, stills
tools/film/               how the films are made and rendered
assets/img/mark.svg       favicon
```

## Porting to the Next.js site

The pages are framework-free on purpose so they can be reviewed as-is. To move them into the app: keep `site.css` tokens as the Tailwind theme and render the hero as a `<video>` with the title overlay; `lh.js` is the whole behaviour.

## SideAI hero (`/en/ai`)

The live lake shader is replaced by the SideAI film (`assets/video/ai.mp4`, last frame `ai-end.jpg`). `ai/index.html` previews it with a **Before / After** switch (`?v=old` starts on the current live hero). **Integration:** in the hero component, render a muted, inline, autoplaying `<video>` with that file instead of the canvas, and show the title when the video ends (see `assets/js/lh.js`); the palettes and phase buttons are no longer needed.
