# Video Jigsaw

A single-file static web app (a video jigsaw puzzle), deployed on Netlify.

**Live:** https://dak-videojigsaw.netlify.app

## Source vs. build

| File | Role |
|------|------|
| `index.src.html` | **Editable source** — make all changes here. |
| `index.html` | Generated build: inline JS obfuscated, HTML + CSS minified. This is what gets served. |
| `build.mjs` | Build script (`javascript-obfuscator` + `html-minifier-terser`). |
| `*.mp4` | Puzzle videos, referenced by relative filename. |

## Build

```bash
npm install      # first time only
npm run build    # regenerates index.html from index.src.html
```

## Deploy

Deployment is automatic: **push to `main`** and Netlify rebuilds and deploys.

On each push Netlify runs the `build` command in `netlify.toml`, which
regenerates `index.html` from `index.src.html`, then stages `index.html` +
the videos into `_site/` (so `node_modules` and the readable source are
never published) and serves that.
