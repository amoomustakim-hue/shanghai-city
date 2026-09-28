import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { COORDS } from '../config/content'
import { MEDIA } from '../config/media'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { gsap } from '../utils/gsap'
import { Mask } from './ui/Mask'

type Props = {
  video: RefObject<HTMLVideoElement | null>
  /** Fired as the curtain starts to lift — the hero begins its entrance underneath. */
  onReveal: () => void
  /** Fired once the preloader is fully gone. */
  onDone: () => void
}

const WEIGHTS = { fonts: 0.15, poster: 0.15, video: 0.7 }
const MIN_DURATION = 1700
const MAX_WAIT = 6000
const FONT_WAIT = 2500

export function Preloader({ video, onReveal, onDone }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const callbacks = useRef({ onReveal, onDone })
  callbacks.current = { onReveal, onDone }

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.mask__inner', { yPercent: 110, duration: 1.4, stagger: 0.08, ease: 'expo.out', delay: 0.15 })
      gsap.from('.preloader__foot', { opacity: 0, duration: 1, delay: 0.5 })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const parts = { fonts: 0, poster: 0, video: 0 }
    const counter = { value: 0 }
    const start = performance.now()
    let leaving = false
    let recheck = 0

    const render = () => {
      const v = Math.round(counter.value)
      if (pct.current) pct.current.textContent = String(v)
      if (bar.current) bar.current.style.transform = `scaleX(${counter.value / 100})`
    }

    const leave = () => {
      if (leaving) return
      leaving = true
      const tl = gsap.timeline({ onComplete: () => callbacks.current.onDone() })
      if (reduced) {
        tl.add(() => callbacks.current.onReveal()).to(root.current, { opacity: 0, duration: 0.6, ease: 'power1.out' })
        return
      }
      tl.to(root.current!.querySelectorAll('.mask__inner'), { yPercent: -110, duration: 0.9, stagger: 0.05, ease: 'power3.in' })
        .to(root.current!.querySelector('.preloader__foot'), { opacity: 0, duration: 0.5 }, '<')
        .add(() => callbacks.current.onReveal(), '-=0.15')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.4, ease: 'power4.inOut' }, '<')
    }

    const maybeLeave = () => {
      if (counter.value < 99.5) return
      const wait = MIN_DURATION - (performance.now() - start)
      if (wait > 0) recheck = window.setTimeout(leave, wait)
      else leave()
    }

    const update = () => {
      const target = (Object.keys(parts) as (keyof typeof parts)[]).reduce((sum, k) => sum + parts[k] * WEIGHTS[k], 0) * 100
      gsap.to(counter, {
        value: target,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: render,
        onComplete: maybeLeave,
      })
    }

    // A stalled font request shouldn't hold the curtain; fallbacks are fine.
    Promise.race([document.fonts.ready, new Promise((r) => window.setTimeout(r, FONT_WAIT))]).then(() => {
      parts.fonts = 1
      update()
    })

    const img = new Image()
    img.onload = img.onerror = () => {
      parts.poster = 1
      update()
    }
    img.src = MEDIA.posters.day

    const v = video.current
    const onProgress = () => {
      if (!v || !v.duration || !v.buffered.length) return
      parts.video = Math.max(parts.video, Math.min(0.95, v.buffered.end(v.buffered.length - 1) / v.duration))
      update()
    }
    const onReady = () => {
      parts.video = 1
      update()
    }
    if (v) {
      if (v.readyState >= 4) onReady()
      v.addEventListener('progress', onProgress)
      v.addEventListener('canplaythrough', onReady)
      v.addEventListener('error', onReady)
    }

    // Never hold the visitor hostage to a slow network: the poster covers the gap.
    const cap = window.setTimeout(() => {
      parts.fonts = parts.poster = parts.video = 1
      update()
    }, MAX_WAIT)

    return () => {
      window.clearTimeout(cap)
      window.clearTimeout(recheck)
      gsap.killTweensOf(counter)
      v?.removeEventListener('progress', onProgress)
      v?.removeEventListener('canplaythrough', onReady)
      v?.removeEventListener('error', onReady)
    }
  }, [video, reduced])

  return (
    <div className="preloader" ref={root} role="status" aria-live="polite" aria-label="Loading experience">
      <div className="preloader__title">
        <Mask lines={['City Archive']} className="preloader__name" />
        <Mask lines={['001']} className="preloader__number" />
      </div>

      <div className="preloader__foot">
        <p className="meta">
          Loading experience — <span ref={pct}>0</span>%
        </p>
        <p className="meta preloader__coords">
          <span className="cjk">上海</span> {COORDS.lat} / {COORDS.lng}
        </p>
        <span className="preloader__bar" aria-hidden="true">
          <span ref={bar} />
        </span>
      </div>
    </div>
  )
}
