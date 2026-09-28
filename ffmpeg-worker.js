// Same-origin bootstrap for @ffmpeg/ffmpeg.
// The browser permits this worker because it starts from our own app origin.
// The FFmpeg worker module itself is then imported normally with CORS.
import "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/worker.js";
