import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { MEDIA, VIDEO_SRC, type PosterKey } from '../../config/media'

type Mode =
  /** Starts loading immediately and loops; pauses while off-screen. */
  | 'autoplay'
  /** Attaches its source only when near the viewport, loops while visible. */
  | 'lazy'
  /** Attaches early, never plays on its own; the owner drives currentTime. */
  | 'scrub'

type Props = {
  mode: Mode
  poster?: PosterKey
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLVideoElement>
}

/**
 * The single video primitive. Every instance uses the same local file, so
 * the browser serves repeats from cache; off-screen instances are paused to
 * keep only one decoder busy at a time.
 */
export function CityVideo({ mode, poster = 'day', className, style, ref }: Props) {
  const local = useRef<HTMLVideoElement | null>(null)
  const [attached, setAttached] = useState(mode === 'autoplay')

  const setRef = (el: HTMLVideoElement | null) => {
    local.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  useEffect(() => {
    const video = local.current
    if (!video) return
    // React doesn't reflect `muted` as an attribute; iOS needs it to allow autoplay.
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAttached(true)
          if (mode !== 'scrub' && video.currentSrc) video.play().catch(() => {})
        } else if (!video.paused) {
          video.pause()
        }
      },
      { rootMargin: { autoplay: '0px', lazy: '40% 0px', scrub: '150% 0px' }[mode] },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [mode])

  // A lazily attached source needs an explicit play once it exists.
  useEffect(() => {
    const video = local.current
    if (attached && mode === 'lazy' && video) video.play().catch(() => {})
  }, [attached, mode])

  return (
    <video
      ref={setRef}
      className={className}
      style={style}
      src={attached ? VIDEO_SRC : undefined}
      poster={MEDIA.posters[poster]}
      muted
      playsInline
      loop={mode !== 'scrub'}
      autoPlay={mode === 'autoplay'}
      preload={mode === 'autoplay' || attached ? 'auto' : 'none'}
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
