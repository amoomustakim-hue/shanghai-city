# SHANGHAI — CITY ARCHIVE / 001

_The city is always moving._

A cinematic, scroll-driven editorial experience built around a single
day-to-night timelapse of the Huangpu River.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build → dist/
npm run preview   # serve the production build
```

## The experience

| #  | Chapter      | What happens                                                                 |
| -- | ------------ | ---------------------------------------------------------------------------- |
| —  | Preloader    | Progress driven by real loading of the fonts, the poster and the hero video buffer. Ends with a curtain wipe. |
| 00 | Arrival      | Full-bleed footage, sequenced type, live Shanghai clock, and cursor depth parallax. On scroll the camera pushes in while the frame crops from 16:9 to 2.39:1. |
| 01 | Intro        | Masked, staggered display type that slowly shears as you scroll.             |
| 02 | River        | Asymmetric plate that rises from the waterline, with parallax, a horizontal drift and a scrolling marquee. |
| 03 | City         | OLD CITY. / NEW CITY. slide in from opposite banks, then a survey plate opens from the centre with leader-line labels. |
| 04 | Time         | Pinned. Scroll position becomes `video.currentTime`, driving the phase words, clock, frame counter and progress rail. |
| 05 | Archive      | Editorial index: titles roll into italics, a preview trails the cursor, and the background tints per file. |
| 06 | End          | The frame widens back to full, pulls out slowly, then fades to black.        |

## Structure

```
src/
  components/      One file per section, plus Preloader, Navigation (and menu), CustomCursor
    ui/            CityVideo, Mask / SplitChars, SectionHead, Grain
  config/          media.ts (every asset path) · content.ts (copy, labels, phases)
  hooks/           useScrollScene (scoped gsap.matchMedia), useLenis, useChapter,
                   useMediaQuery, useShanghaiTime
  styles/          tokens · base · chrome · hero · sections · fonts
  utils/           gsap registration, math helpers
scripts/
  prepare-media.mjs
```

Every scene is built in `useScrollScene`, which wraps `gsap.matchMedia`. Selectors
are scoped to the section, all tweens and triggers are reverted on unmount, and
each scene has a separate branch for `prefers-reduced-motion`.

## Media

Everything is local; no external URLs. The web encodes live in `public/media/`
and are generated from the source file by:

```bash
npm run media -- path/to/your-video.mp4    # defaults to media-src/shanghai-source.mp4
```

The script writes H.264 and VP9 encodes, 1080p for desktop and 720p for
phones, plus five poster stills sampled across the transition. Scaling uses
Lanczos with a light unsharp mask, so skyline edges come out crisper than when
the browser does the upscaling. Keyframes are 12 frames apart and B-frames are
off, which keeps scroll-scrubbing smooth. The footage is only resized and
compressed; the watermark is left intact.

**Phones** get their own encode. A tall screen shows only about 20% of a
2.35:1 frame, roughly 300 source pixels across. So full-bleed sections on
phones use `shanghai-portrait.*`, a 3:4 crop around the Oriental Pearl that
is upscaled to 1080 × 1440 before encoding, so no bits are spent on cropped-away
pixels. The city plate, which shows the whole panorama, keeps the full-frame
encode (`CityVideo`'s `framing` prop decides which is used).

For real extra detail, `scripts/ai-upscale.py` runs Real-ESRGAN on that
portrait crop (CPU only, about 20 minutes; setup steps are in the script's
docstring). It writes `media-src/shanghai-portrait-ai.mp4`, which
`npm run media` picks up automatically.

The source clip is 1504 × 640, which caps how sharp the desktop version can
be. For real HD there, export an upscaled version (for example with
Dreamina's HD export or Topaz), drop it in and rerun the script.

Labels on the city plate (`PLATE_LABELS`) and the time phases (`PHASES`,
`CLOCK_KEYS`) are in `src/config/content.ts`. Plate coordinates are percentages
of the native 1504 × 640 frame.

## Notes

- **Stack:** React 19, TypeScript, Vite, GSAP and ScrollTrigger, Lenis. WebGL was
  left out on purpose. The footage carries the experience, and a shader layer
  would add cost without adding meaning.
- **Fonts:** self-hosted (Inter Tight, Instrument Serif, IBM Plex Mono via
  Fontsource; five Noto Serif SC chunks for 上海 / 黄浦江), so nothing
  third-party can stall the preloader.
- **Performance:** each off-screen video pauses, and non-hero videos attach
  their source only when near the viewport. The time-section scrubber runs only
  while that section is pinned and never queues seeks.
- **Accessibility and devices:** the custom cursor mounts only on fine pointers.
  Touch devices get native scrolling and inline archive thumbnails. With
  reduced motion, Lenis and parallax are off and reveals become simple fades.
