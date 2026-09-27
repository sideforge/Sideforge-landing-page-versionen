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
| **Horizons** (home, 20 s) | `assets/js/films/horizon.js` | One horizon in five materials — amber glass with bubbles, tooled leather with saddle stitching, cut-paper collage, painted board over banded sediment, and finally a planet's atmosphere at sunrise. The headline word ("your next project", "your research", …) sits on each horizon; scenes change with a torn-paper wipe. |
| **Survey** (Venura 6.5, 32 s) | `assets/js/films/venura.js` | A radar-mapped flight over a volcanic plain in sepia: raymarched terrain with eroded noise, a shield volcano, a lava channel, soft shadows and haze. One shot per capability — long glide (*stays on task longer*), following the channel (*cleaner tool chains*), circling the caldera (*its own review pass*), and a survey scan that resolves the ground line by line (*images and figures*). |
| **A day in orbit** (Sintulus 6, 32 s) | `assets/js/films/sintulus.js` | A planet with a physically based atmosphere (Rayleigh + Mie single scattering): sunrise over the limb (*work that runs for hours*), a survey grid over the day side (*research with evidence*), a route network lighting up across the night side (*code across the whole project*), and an orbit with a moon passing (*spatial understanding*). |

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
