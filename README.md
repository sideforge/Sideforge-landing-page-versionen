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
- **Motion is quiet.** Scroll reveals, line drawings, a statement that lights up word by word. Everything respects `prefers-reduced-motion` (films start paused).

## The films

Each page opens with a short product film in the visual language Anthropic uses to present its models — UI cards on soft colour fields (dusty blue, sage, sand, lavender), halftone clouds and fine wave lines behind them, a status pill whose label shimmers while work is in progress, a cursor, a slow camera that moves into the detail. The content is SideForge's own; no footage, frames or compositions are reused.

The films are HTML, played live in the browser on a fixed 1600×900 stage (sharp at any size, real fonts, no video download). Every frame is a pure function of time, so the player can seek, loop and capture.

| Film | File | Scenes |
| --- | --- | --- |
| **Home** (22 s) | `assets/js/films/home.js` | Forge IDE writes a page while the live preview builds it · Science loads four databases and computes · one command opens an encrypted tunnel and a shop goes live · a team joins a workspace and everything lands on one invoice · all tools gather around the mark. The headline above ("Everything for …") follows the scene. |
| **Venura 6.5** (28 s) | `assets/js/films/venura.js` | a Code session reaches its context limit, summarises itself and carries on · a plan ticks off with three well-chosen tool calls instead of nine · a draft is read back against the task, two claims backed, one marked open · a chart is read point by point into a table |
| **Sintulus 6** (28 s) | `assets/js/films/sintulus.js` | a run lasts from 08:12 to 17:40 and asks for one decision · dots settle into a figure whose parts carry their provenance · one change across the whole project with checkpoints and tests · a molecule assembles from a cloud of points and turns in 3D |

`assets/js/stage.js` holds the building blocks (halftone, waves, pill, cursor, camera, scene cross-fades); `assets/js/film.js` plays them with chapters, captions, play/pause and pauses off-screen.

### Rendered versions

`assets/video/` holds poster stills and MP4 renders of the three films (1600×900, 24 fps), made by opening a film with `?capture`, calling `window.__film.renderAt(t)` frame by frame in headless Chromium and piping the frames into ffmpeg.

## Structure

```
index.html                home
venura/index.html         Venura 6.5
sintulus/index.html       Sintulus 6
assets/css/site.css       design tokens, components, page layouts
assets/js/site.js         nav, reveals, scroll-spy, theme switch, word-by-word statement
assets/js/film.js         WebGL film player
assets/js/stage.js        building blocks for the product films
assets/js/films/*.js      the three films
assets/video/             posters, stills, MP4 renders
assets/img/mark.svg       favicon
```

## Porting to the Next.js site

The pages are framework-free on purpose so they can be reviewed as-is. To move them into the app: keep `site.css` tokens as the Tailwind theme, turn each film into a client component that mounts `Film` on a `<figure data-film>` in `useEffect`, and keep the shader strings unchanged.

## SideAI hero (`/en/ai`) — the lake as a paper diorama

The hero on https://sideforge.ch/en/ai keeps its idea, composition and 60 s day, but is now rendered like a handmade diorama shot close up — the tactile, crafted material language of Anthropic's brand films, with SideForge's own motif:

- watercolour-paper sky, torn-paper mountains with white fibre edges and glued-on snow, a second torn sheet for the ridge
- scissor-cut spruce hills in felt, tissue-paper clouds, tracing-paper mist
- a sun cut from card, a paper crescent moon, stars pricked with a needle and lit from behind
- a lake of crumpled foil that mirrors everything, a felt shore, a folded paper boat, a card train with cut-out windows
- every layer throws a real shadow on the one behind it, following the sun across the day; moving pieces step like stop-motion

Files: `ai/index.html` (preview with **Before / After** switch; `?t=22` jumps to a moment, `?v=old` starts on the original), `ai/lake-scene.js` (the new shader), `ai/lake-original.js` (current shader, for comparison), `ai/before-after.jpg`.

**Integration:** in the hero component, replace the fragment shader template string (the one that starts with `#ifdef GL_FRAGMENT_PRECISION_HIGH` and declares `uSkyTop`, `uSun`, `uLife`, …) with the contents of `LAKE_REALISTIC`. Uniform names and types are identical, so the JavaScript around it stays as it is.

**Cost:** about the same per pixel as the current shader.
