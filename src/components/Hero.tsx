import { useEffect, useRef, type RefObject } from 'react'
import { COORDS } from '../config/content'
import { useScrollScene } from '../hooks/useScrollScene'
import { useShanghaiTime } from '../hooks/useShanghaiTime'
import { gsap } from '../utils/gsap'
import { CityVideo } from './ui/CityVideo'
import { Mask, SplitChars } from './ui/Mask'

type Props = { ready: boolean; video: RefObject<HTMLVideoElement | null> }

export function Hero({ ready, video }: Props) {
  const root = useRef<HTMLElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)
  const readyRef = useRef(ready)
  readyRef.current = ready
  const time = useShanghaiTime()

  useScrollScene(root, ({ motion, finePointer, desktop }) => {
    if (!motion) {
      intro.current = gsap
        .timeline({ paused: !readyRef.current })
        .fromTo('.hero__frame, .hero__ui', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power1.out' })
      return
    }

    // 1 video → 2 metadata → 3 title → 4 tagline → 5 time.
    const tl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .from('.hero__frame', { opacity: 0, duration: 2.2, ease: 'power2.out' }, 0)
      .from('.hero__zoom', { scale: 1.14, duration: 3.6, ease: 'power3.out' }, 0)
      .from('.hero__rule', { scaleX: 0, duration: 1.8, ease: 'power3.inOut' }, 0.7)
      .from('.hero__top .mask__inner', { yPercent: 110, duration: 1.3, stagger: 0.07 }, 0.9)
      .from('.hero__title .char', { yPercent: 105, duration: 2, stagger: 0.055 }, 1.3)
      .from('.hero__tagline .mask__inner', { yPercent: 110, duration: 1.5, stagger: 0.1 }, 2.0)
      .from('.hero__time .mask__inner', { yPercent: 110, duration: 1.5, stagger: 0.1 }, 2.35)
      .from('.hero__cue', { opacity: 0, duration: 1.4, ease: 'power2.out' }, 2.8)
    intro.current = tl
    if (readyRef.current) tl.progress(1)

    // Scrolling away: the camera pushes in, the frame crops to scope,
    // type dissolves — then the band hands over to the introduction.
    gsap
      .timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=110%', pin: true, scrub: true, anticipatePin: 1 },
        defaults: { ease: 'none' },
      })
      .to('.hero__push', { scale: 1.2, yPercent: -3, duration: 1 }, 0)
      .to('.hero__frame', { clipPath: desktop ? 'inset(18% 6% 24% 6%)' : 'inset(24% 0% 30% 0%)', duration: 1, ease: 'power1.inOut' }, 0)
      .to('.hero__shade', { opacity: 0.5, duration: 1 }, 0)
      .to('.hero__title', { yPercent: -35, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0)
      .to('.hero__top, .hero__bottom, .hero__cue', { opacity: 0, yPercent: -40, duration: 0.35 }, 0)
      .fromTo('.hero__caption', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.55)

    if (!(finePointer && desktop)) return

    // Depth: image, title and metadata drift at different rates.
    const layers = [
      { el: '.hero__parallax', x: -16, y: -10 },
      { el: '.hero__title-depth', x: 10, y: 5 },
      { el: '.hero__depth', x: 4, y: 3 },
    ].map(({ el, x, y }) => ({
      x,
      y,
      xTo: gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3.out' }),
      yTo: gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3.out' }),
    }))
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      for (const l of layers) {
        l.xTo(nx * l.x * 2)
        l.yTo(ny * l.y * 2)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  // The footage runs day → night then jumps back; a slow dip to black
  // turns the cut into a deliberate reel change.
  useEffect(() => {
    const v = video.current
    const dip = root.current?.querySelector('.hero__dip')
    if (!v || !dip) return
    let dipped = false
    const check = () => {
      if (v.paused || !v.duration) return
      const nearEnd = v.currentTime > v.duration - 0.45
      if (nearEnd && !dipped) {
        dipped = true
        gsap.to(dip, { opacity: 1, duration: 0.4, ease: 'power2.in', overwrite: true })
      } else if (!nearEnd && dipped && v.currentTime < 1) {
        dipped = false
        gsap.to(dip, { opacity: 0, duration: 1.2, ease: 'power2.out', overwrite: true })
      }
    }
    gsap.ticker.add(check)
    return () => gsap.ticker.remove(check)
  }, [video])

  return (
    <section className="hero" id="arrival" ref={root} aria-label="Shanghai — City Archive 001">
      <div className="hero__frame">
        <div className="hero__push">
          <div className="hero__zoom">
            <div className="hero__parallax">
              <CityVideo ref={video} mode="autoplay" className="hero__video" />
            </div>
          </div>
        </div>
        <div className="hero__shade" />
        <div className="vignette" />
        <div className="hero__dip" />
      </div>

      <div className="hero__ui">
        <div className="hero__top hero__depth">
          <span className="hero__rule" aria-hidden="true" />
          <Mask className="meta hero__meta" lines={['City Archive / 001', <span className="dim">File 31.2304 — Huangpu</span>]} />
          <Mask className="meta hero__meta hero__meta--right" lines={[COORDS.lat, COORDS.lng]} />
        </div>

        <div className="hero__title-depth">
          <h1 className="hero__title">
            <SplitChars text="SHANGHAI" breakAfter={5} />
          </h1>
        </div>

        <div className="hero__bottom hero__depth">
          <Mask as="p" className="hero__tagline" lines={['The city', 'is always moving.']} />
          <div className="hero__time">
            <Mask
              className="hero__clock"
              lines={[
                <>
                  {time.hh}
                  <span className="hero__colon">:</span>
                  {time.mm}
                  <sup className="hero__seconds">{time.ss}</sup>
                </>,
              ]}
            />
            <Mask className="meta dim" lines={['Local time / Shanghai']} />
          </div>
        </div>

        <div className="hero__cue meta" aria-hidden="true">
          <span>Scroll</span>
          <span className="hero__cue-line" />
        </div>
      </div>

      <p className="hero__caption meta" aria-hidden="true">
        <span>Plate 001 — The Bund, looking east</span>
        <span>1.78 → 2.39 : 1</span>
      </p>
    </section>
  )
}
