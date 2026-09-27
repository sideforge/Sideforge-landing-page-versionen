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

Each page opens with a short film that is **rendered live in the browser** with WebGL — no video download needed, sharp at any size. They are written as fragment shaders; the timeline (chapters, camera paths, cuts) lives in plain JS next to each shader.

| Film | File | What it shows |
| --- | --- | --- |
| **Workshop** (home, 20 s) | `assets/js/films/workshop.js` | Five crafts behind the five headline words, each seen up close: a cyanotype drawing that exposes itself line by line (*your next project*), stained cells drifting in a microscope's bright field (*your research*), a city at night from above with traffic moving through the grid (*your services*), a loom weaving many coloured threads into one cloth (*your team*), and a plate of cooling metal in a forge with sparks rising (*the whole workshop*). Scenes change through an iris. |
| **Relief** (Venura 6.5, 32 s) | `assets/js/films/venura.js` | A flight over an alpine massif in daylight: raymarched terrain with ridged and eroded noise, a summit, a glacial valley with river and lakes, snow by altitude and slope, soft shadows and blue aerial perspective. One shot per capability — a long approach (*stays on task longer*), following the valley (*cleaner tool chains*), circling the summit (*its own review pass*), and a survey line that leaves Swiss-map contour lines behind it (*images and figures*). |
| **A day in orbit** (Sintulus 6, 32 s) | `assets/js/films/sintulus.js` | A planet with a physically based atmosphere (Rayleigh + Mie single scattering): sunrise over the limb (*work that runs for hours*), a survey grid over the day side (*research with evidence*), a route network lighting up across the night side (*code across the whole project*), and an orbit with a moon passing (*spatial understanding*). |

All three are original, procedural scenes written for SideForge; none reuses footage, frames or compositions from other companies' launch videos.

The player (`assets/js/film.js`) adds chapters with progress bars, captions, play/pause, pauses when off-screen, and lowers the render resolution automatically on slower GPUs. Without WebGL the poster image is shown.

### Rendered versions

`assets/video/` holds poster stills and MP4 renders of all three films (for social posts, presentations, or as a download link on the page). They were produced by opening a film with `?capture`, calling `window.__film.renderAt(t)` frame by frame in headless Chromium and piping the frames into ffmpeg (H.264, 24 fps).

## Structure

```
index.html                home
venura/index.html         Venura 6.5
sintulus/index.html       Sintulus 6
assets/css/site.css       design tokens, components, page layouts
assets/js/site.js         nav, reveals, scroll-spy, theme switch, word-by-word statement
assets/js/film.js         WebGL film player
assets/js/films/*.js      the three films (shader + timeline)
assets/video/             posters, stills, MP4 renders
assets/img/mark.svg       favicon
```

## Porting to the Next.js site

The pages are framework-free on purpose so they can be reviewed as-is. To move them into the app: keep `site.css` tokens as the Tailwind theme, turn each film into a client component that mounts `Film` on a `<figure data-film>` in `useEffect`, and keep the shader strings unchanged.

## SideAI hero (`/en/ai`) — the lake scene in 3D

The hero on https://sideforge.ch/en/ai keeps its idea — one day at an alpine lake in 60 seconds, with the same four moods — but the painted layers are replaced by a real 3D scene. Nothing else on that page changes.

- `ai/index.html` — preview of the hero with the same driver as the site (palettes, sun and moon path, phase buttons, pause) and a **Before / After** switch. Add `?t=22` to jump to a moment, `?v=old` to start on the original.
- `ai/lake-scene.js` — the new fragment shader (`window.LAKE_REALISTIC`).
- `ai/lake-original.js` — the current shader, for comparison only.
- `ai/before-after.jpg` — morning, day, evening, night side by side.

How it is built: a raymarched terrain laid out from the original composition (the range's skyline is the painted one, turned into real height at 4 km; a ridge closes the valley; wooded slopes rise on both sides of the lake), soft shadows, real material colours (spruce forest, rock, snow, water) lit by the hour's sun and sky palette, a lake that reflects the terrain with loop-periodic waves, Fresnel and glitter, a perspective cumulus deck, aerial perspective, low mist on the water, a lit crescent moon, stars, birds, the shooting star, and village lights at the end of the lake after dark. The 60 s loop stays seamless.

**Integration:** in the hero component, replace the fragment shader template string (the one that starts with `#ifdef GL_FRAGMENT_PRECISION_HIGH` and declares `uSkyTop`, `uSun`, `uLife`, …) with the contents of `LAKE_REALISTIC`. Uniform names and types are identical, so the JavaScript around it stays as it is.

**Cost:** this shader does far more work per pixel than the flat one. The component already lowers its resolution when frames get slow (down to half), which keeps it smooth on laptops; on very weak devices it will look softer.
