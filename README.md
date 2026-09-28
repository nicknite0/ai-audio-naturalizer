# Audio Naturalizer

Local, model-agnostic experiment for making the **complete soundtrack** of AI-generated video clips feel more natural.

## V0.2

The browser prototype now uses FFmpeg WebAssembly to process a loaded MP4 locally.

- No stem separation.
- The whole soundtrack is processed together.
- Video is stream-copied unchanged; only audio is encoded.
- Light / Natural / Strong presets.
- Harshness reduction, warmth, dynamics smoothing and output level.
- Loudness normalization and clipping protection.
- A/B playback between the original and processed MP4.
- Export the processed MP4.

## First test

Use a short dialogue clip and start with **Natural**. Compare the same passage in Original and Processed before changing sliders. This first chain is intentionally conservative so we can learn which processing actually helps instead of stacking effects blindly.

## Running

Because the app imports browser FFmpeg modules, serve the repository over HTTP (GitHub Pages or a local web server) rather than opening index.html directly from disk.
