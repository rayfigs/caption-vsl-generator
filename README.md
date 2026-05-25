# Caption VSL Generator

Turn a script into a scroll-stopping captioned video. It generates an ElevenLabs voiceover, word-syncs the captions to the voice, and renders the whole thing with Remotion. Portrait, square, or landscape. Pick a voice, pick a template, get an MP4.

This is the free, do-it-yourself build behind the Caption VSL on [reinaldofigueroa.com](https://reinaldofigueroa.com). It's yours to keep and adapt. If it earns its keep, a donation is welcome, never required.

## What it does
- ElevenLabs voiceover from your script (use a stock voice or your own clone)
- Word-level caption timing so each word lights up as it's spoken
- Multiple templates (bold, copper, minimal, portrait styles) and aspects (9:16, 1:1, 16:9)
- Deterministic Remotion render → a clean MP4 you can post or run as an ad

## Requirements
- Node 20+ (Node 24 recommended)
- An [ElevenLabs](https://elevenlabs.io) API key (voiceover)
- Chromium + ffmpeg are fetched by Remotion on first render

## Setup
```bash
git clone https://github.com/rayfigs/caption-vsl-generator.git
cd caption-vsl-generator
npm install
cp .env.example .env      # then add your ELEVENLABS_API_KEY
```

## Make a video
```bash
npm run cli -- generate \
  --transcript path/to/script.txt \
  --output my-vsl.mp4 \
  --canvas portrait \
  --voice bella \
  --template rorick-bold
```

### Options
| Flag | Values |
|------|--------|
| `--canvas` | `portrait` (1080×1920), `square` (1080×1080), `landscape` (1920×1080) |
| `--voice` | `adam`, `rachel`, `drew`, `bella`, `antoni`, `josh`, `sam`, … or your own ElevenLabs voice id |
| `--template` | `rorick-bold`, `classic-dark`, `modern-minimal`, `portrait-impact`, `portrait-kinetic`, … |
| `--voice-settings` | JSON, e.g. `'{"stability":0.5,"style":0.35,"speed":1.05}'` for delivery control |

List the built-in voices:
```bash
npm run cli -- voices
```

## Notes
- Keep your `.env` private. The committed `.env.example` is empty on purpose.
- Renders are written wherever you point `--output`; nothing is uploaded anywhere.
- Want one built for you instead of building it yourself? See the done-for-you option at [reinaldofigueroa.com](https://reinaldofigueroa.com).

## License
MIT. Use it, change it, ship it. See [LICENSE](./LICENSE).
