# Coverly — Paint Calculator

Static site, no build step, no backend. Open `index.html` directly or serve the folder with any static host.

## Deploy free

Pick one:
- **Cloudflare Pages** — drag-and-drop this folder at pages.cloudflare.com, or connect a GitHub repo. Free custom domain support.
- **GitHub Pages** — push to a repo, enable Pages on the `main` branch.
- **Netlify / Vercel** — drag-and-drop deploy, free tier.

Before going live, replace `https://example.com/` with your real domain in:
- `index.html` (`<link rel="canonical">`, Open Graph tags, JSON-LD `url`)
- `robots.txt` (`Sitemap:` line)
- `sitemap.xml` (`<loc>`)

## Add Adsterra

Once approved, drop your ad unit's `<script>` snippet into the empty `<div class="ad-slot">` in `index.html` (currently a placeholder that reserves the space so ads don't shift the layout when they load — that layout shift otherwise hurts both UX and Core Web Vitals/SEO). You can duplicate that div wherever else you want another placement, just keep at least one above the fold minimal — this page leads with the tool, not the ads.

## Next tools to template

The calculator engine in `script.js` (area × coverage rate = quantity) is written to be cloned for the next pages in the cluster:
- Mulch/soil calculator
- Flooring calculator
- Wallpaper calculator
- Concrete calculator

Same layout, same component styles in `styles.css` — swap the inputs and the formula.
# coverly
