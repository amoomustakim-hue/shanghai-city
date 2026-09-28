/**
 * Every media reference lives here. Drop a new source into media-src/ and
 * run `npm run media` to regenerate the files below.
 */
const base = import.meta.env.BASE_URL

export const MEDIA = {
  video: {
    desktop: { mp4: `${base}media/shanghai.mp4`, webm: `${base}media/shanghai.webm` },
    mobile: { mp4: `${base}media/shanghai-mobile.mp4`, webm: `${base}media/shanghai-mobile.webm` },
    /** Phones, full-bleed: a 3:4 crop around the Pearl tower, AI-upscaled. */
    portrait: { mp4: `${base}media/shanghai-portrait.mp4`, webm: `${base}media/shanghai-portrait.webm` },
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
 * How a video is framed on screen. `bleed` fills the viewport (hero, river,
 * time, outro) — on phones that crops a 2.35:1 frame down to a narrow
 * slice, so phones get the dedicated portrait encode. `wide` shows the whole
 * panorama (the city plate), where the full-frame encode is right.
 */
export type Framing = 'bleed' | 'wide'

const isPhone = () => window.matchMedia('(max-width: 767px)').matches

/** Decided once per page load — swapping sources mid-session would restart playback. */
const canMp4 = (() => {
  const probe = document.createElement('video')
  return !!probe.canPlayType('video/mp4; codecs="avc1.64001f"') || !probe.canPlayType('video/webm; codecs="vp9"')
})()

export function videoSrc(framing: Framing) {
  const set = !isPhone() ? MEDIA.video.desktop : framing === 'bleed' ? MEDIA.video.portrait : MEDIA.video.mobile
  // H.264 is hardware-decoded almost everywhere; VP9 covers browsers built without it.
  return canMp4 ? set.mp4 : set.webm
}

export function posterSrc(key: PosterKey, framing: Framing) {
  return isPhone() && framing === 'bleed' ? `${base}media/poster-portrait-${key}.jpg` : MEDIA.posters[key]
}
