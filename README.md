# Gold Ribbons

Real-time recreation of the endless winding gold-plate walls (black → gold → cream),
built with **React + Vite + TypeScript + styled-components + three.js**.

## Run

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview
```

## Deploy (GitHub Pages)

1. Push to the `main` branch.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes on every push.

## Controls

| Key | Action |
| --- | --- |
| `H` | Show / hide the control panel |
| `Space` | Pause / play |
| `F` | Fullscreen |
| `S` | Save a PNG screenshot |
| `R` | New random layout |

Add `?clean` to the URL to hide all UI (use it as a live background).
Settings persist in your browser.

## How it works

| File | Role |
| --- | --- |
| `src/engine/pathFactory.ts` | Seeded layout of irregular closed S-curve loops in stacked layers |
| `src/engine/PathSampler.ts` | Arc-length lookup table (position / tangent / up / side) per track |
| `src/engine/RibbonBand.ts` | Thousands of instanced plates per wall: flow along the track, lean (twist) and domino ripple, updated every frame |
| `src/engine/environment.ts` | Dark studio env-map with warm strip lights → high-contrast metal |
| `src/engine/LightRig.ts` | Key/rim lights + travelling point lights for moving glints |
| `src/engine/CameraRig.ts` | Slow cinematic drift, mouse parallax, subtle roll |
| `src/engine/PostFX.ts` | Depth of field → bloom → tone mapping → gold duotone grade, vignette, grain |
| `src/engine/QualityManager.ts` | Adaptive resolution to hold frame rate |
| `src/engine/GoldEngine.ts` | Orchestrates everything; framework-agnostic |
