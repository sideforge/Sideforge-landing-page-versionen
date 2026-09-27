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

## The heroes

Every page opens the way Anthropic's Claude Opus 5.5 launch page does — a launch collage — with SideForge's own images and materials:

1. black;
2. photographs of materials are laid down one by one as tiles around a window;
3. a first word appears over the window ("Introducing");
4. the window opens almost to full width, the materials stay behind as narrow strips at the edges;
5. the title is set in a serif with a rough, inked edge, then the date and the contents; the image keeps moving slowly.

Everything is drawn live in one WebGL fragment shader (`assets/js/hero.js`); each page supplies its centre image and four materials:

| Page | Centre image | Materials |
| --- | --- | --- |
| Home (`assets/js/heroes/home.js`) | a dune field at the last light, raymarched, camera drifting over the sand | kraft board, brushed steel, black card, fluted red rock |
| Venura 6.5 (`heroes/venura.js`) | ridge after ridge of mountains receding into morning haze, telephoto | topographic map, granite, black card, ice |
| Sintulus 6 (`heroes/sintulus.js`) | looking up from deep water: light shafts, the bright surface, drifting particles | lab graph paper, copper patina, black card, rippled sand |
| SideAI `/en/ai` (`ai/lake-scene.js`) | the lake in 3D through the day (same palettes and 60 s loop as the live hero) | yellow paper, slate, black card, moss |

No photographs, footage or code from Anthropic are used; the materials and images are procedural.

`assets/video/` holds stills and 10 s MP4 renders of the three page intros (1280×720, 24 fps), made by opening the hero with `?capture`, calling `window.__hero.renderAt(t)` frame by frame in headless Chromium and piping into ffmpeg.

## Structure

```
index.html                home
venura/index.html         Venura 6.5
sintulus/index.html       Sintulus 6
ai/                       SideAI hero preview (before/after) and its shader
assets/css/site.css       design tokens, components, page layouts, hero overlay
assets/js/site.js         nav, reveals, scroll-spy, theme switch, word-by-word statement
assets/js/hero.js         the launch collage (shader, materials, choreography)
assets/js/heroes/*.js     the centre image and materials per page
assets/video/             stills and MP4 renders
assets/img/mark.svg       favicon
```

## Porting to the Next.js site

The pages are framework-free on purpose so they can be reviewed as-is. To move them into the app: keep `site.css` tokens as the Tailwind theme, turn the hero into a client component that mounts `Hero` on a `<section data-hero>` in `useEffect`, and keep the shader strings unchanged.

## SideAI hero (`/en/ai`)

See the table above: the lake is rendered in 3D and seen through the same launch collage. The intro runs on the component's existing `uIntro` (0 → 1 over the first 2.4 s): tiles are laid down, then the window opens. Files: `ai/index.html` (preview with **Before / After** switch; `?t=22` jumps to a moment, `?v=old` starts on the original), `ai/lake-scene.js`, `ai/lake-original.js`, `ai/before-after.jpg`.

**Integration:** in the hero component, replace the fragment shader template string (the one that starts with `#ifdef GL_FRAGMENT_PRECISION_HIGH` and declares `uSkyTop`, `uSun`, `uLife`, …) with the contents of `LAKE_REALISTIC`. Uniform names and types are identical, so the JavaScript around it stays as it is.

**Cost:** the 3D lake does far more work per pixel than the flat original; the component already lowers its resolution when frames get slow.
