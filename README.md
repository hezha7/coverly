# Materially — Home Improvement Calculators

Static site, no build step, no backend. Open `index.html` directly or serve the folder with any static host.

Live at [materially.site](https://www.materially.site/), deployed via Vercel from this repo.

## Pages

- `index.html` — Paint Calculator
- `flooring-calculator.html` — Flooring Calculator (its own `flooring.js`)

Each page is self-contained (own `<script>` at the bottom, own JSON-LD, own OG tags) and shares `styles.css` and the same Adsterra ad codes. Cross-linked via the footer on both pages, and both listed in `sitemap.xml`.

## Next tools to template

The calculator pattern (area/volume × coverage rate = quantity) clones cleanly for:
- Mulch/soil calculator
- Wallpaper calculator
- Concrete calculator

Copy `flooring-calculator.html` + `flooring.js` as the starting point, swap the inputs and the formula in the JS, keep the layout and component styles in `styles.css` as-is.
