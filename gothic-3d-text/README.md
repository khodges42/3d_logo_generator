# 3D Type Generator

A tiny static browser app for making rotating extruded gothic/Y2K text. Built with vanilla HTML, CSS, and Canvas.

## Features

- Open Google Fonts dropdown
- Color controls for face, extrusion, stroke, and background
- Depth, angle, stroke, spacing, wobble, glitch, blur, and noise controls
- Presets
- PNG export
- 3-second WebM recording
- GIF export via `gifenc` from jsDelivr

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo.
2. In Cloudflare, create a Pages project from the repo.
3. Framework preset: **None**
4. Build command: leave blank
5. Output directory: `/`

That is it. It is just static files.

## Local dev

Use any static server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

GIF export needs network access because it imports `gifenc` from a CDN. To make the app fully offline, vendor `gifenc` locally and update the dynamic import path in `app.js`.
