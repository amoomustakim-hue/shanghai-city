/**
 * Every media reference lives here. Drop a new source into media-src/ and
 * run `npm run media` to regenerate the files below.
 */
const base = import.meta.env.BASE_URL

export const MEDIA = {
  video: {
    desktop: { mp4: `${base}media/shanghai.mp4`, webm: `${base}media/shanghai.webm` },
    mobile: { mp4: `${base}media/shanghai-mobile.mp4`, webm: `${base}media/shanghai-mobile.webm` },
  },
  posters: {
    day: `${base}media/poster-day.jpg`,
    golden: `${base}media/poster-golden.jpg`,
    dusk: `${base}media/poster-dusk.jpg`,
    blue: `${base}media/poster-blue.jpg`,
    night: `${base}media/poster-night.jpg`,
  },
  /** Native aspect of the footage (1504 × 640). Plates use it so labels map 1:1 onto the frame. */
  aspect: 1504 / 640,
} as const

export type PosterKey = keyof typeof MEDIA.posters

/**
 * Resolved once — swapping sources mid-session would restart playback.
 * Small screens get the lighter encode; H.264 is preferred (hardware
 * decoded almost everywhere), VP9 covers browsers built without it.
 */
function resolveVideoSrc() {
  const set = window.matchMedia('(max-width: 767px)').matches ? MEDIA.video.mobile : MEDIA.video.desktop
  const probe = document.createElement('video')
  return probe.canPlayType('video/mp4; codecs="avc1.64001f"') ? set.mp4 : probe.canPlayType('video/webm; codecs="vp9"') ? set.webm : set.mp4
}

export const VIDEO_SRC = resolveVideoSrc()
