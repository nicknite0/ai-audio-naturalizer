# Audio Naturalizer

Experimental local tool for improving the naturalness and cohesion of audio in AI-generated video clips.

## V0.1 goal

- Load an MP4 clip.
- Process the **entire soundtrack together** — no stem separation.
- Leave the video and timing untouched.
- A/B compare original and processed audio.
- Export a new MP4.

The initial interface is a prototype. The next milestone is connecting a real local FFmpeg-based audio processing pipeline and testing it against AI-generated dialogue clips.

## Processing philosophy

Audio Naturalizer is model-agnostic. It is intended for clips from any AI video generator, not one specific model.
