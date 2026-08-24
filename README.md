# Materially — Home Improvement Calculators

Static site, no build step, no backend. Open `index.html` directly or serve the folder with any static host.

Live at [materially.site](https://www.materially.site/), deployed via Vercel from this repo.

## Pages

- `index.html` — Paint Calculator
- `flooring-calculator.html` — Flooring Calculator (`flooring.js`)
- `mulch-calculator.html` — Mulch Calculator (`mulch.js`)
- `wallpaper-calculator.html` — Wallpaper Calculator (`wallpaper.js`)
- `concrete-calculator.html` — Concrete Calculator (`concrete.js`)
- `tile-calculator.html` — Tile Calculator (`tile.js`)
- `drywall-calculator.html` — Drywall Calculator (`drywall.js`)

Each page is self-contained (own `<script>` at the bottom, own JSON-LD, own OG tags) and shares `styles.css` and the same Adsterra ad codes. Cross-linked via the header (one link back to the paint calculator) and the footer (full list of every other calculator) on every page, and all listed in `sitemap.xml`.

## Next tools to template

The calculator pattern (area/volume × coverage rate = quantity) clones cleanly for more home-improvement math: insulation, roofing, fencing, gravel/paver base, and so on. Copy the closest existing page + its `.js` file as the starting point, swap the inputs and the formula, keep the layout and component styles in `styles.css` as-is, and remember to add the new page to every other page's footer list and to `sitemap.xml`.
