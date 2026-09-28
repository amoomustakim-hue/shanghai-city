import { useRef } from 'react'
import { CLOCK_KEYS, PHASES } from '../config/content'
import { useScrollScene } from '../hooks/useScrollScene'
import { formatMinutes, interpolateKeys, pad } from '../utils/math'
import { gsap } from '../utils/gsap'
import { CityVideo } from './ui/CityVideo'
import { SplitChars } from './ui/Mask'

const FRAMES = 240

/**
 * Pinned. Scroll progress is time: it drives the footage's currentTime
 * (day → night), the phase words, a clock and the rail.
 */
export function TimeSection() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const frame = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)

  useScrollScene(root, ({ motion, desktop }) => {
    const v = video.current!
    const phases = gsap.utils.toArray<HTMLElement>('.time__phase')
    const railItems = gsap.utils.toArray<HTMLElement>('.time__rail-item')
    const state = { target: 0, current: 0 }
    let phase = -1

    const render = (p: number) => {
      state.target = p
      if (clock.current) clock.current.textContent = formatMinutes(interpolateKeys(CLOCK_KEYS, p))
      if (frame.current) frame.current.textContent = pad(p * FRAMES, 3)
      if (fill.current) fill.current.style.transform = `scaleY(${p})`
      const next = Math.max(0, PHASES.findIndex((ph) => p < ph.to))
      const idx = p >= 1 ? PHASES.length - 1 : next
      if (idx !== phase) {
        railItems.forEach((el, i) => el.classList.toggle('is-active', i === idx))
        phase = idx
      }
    }

    // Ease the playhead toward the scroll position; only seek when the
    // decoder is free so fast scrolling never queues a backlog of seeks.
    const seek = () => {
      if (!v.duration) return
      state.current += (state.target - state.current) * 0.12
      const t = Math.min(v.duration - 0.04, state.current * v.duration)
      if (!v.seeking && Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: desktop ? '+=420%' : '+=320%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => render(self.progress),
        onToggle: (self) => (self.isActive ? gsap.ticker.add(seek) : gsap.ticker.remove(seek)),
      },
    })

    // Phase words hand over to each other at their scroll ranges.
    const last = PHASES.length - 1
    PHASES.forEach((ph, i) => {
      const chars = phases[i].querySelectorAll('.char')
      const note = phases[i].querySelector('.time__note')
      const hidden = motion ? { yPercent: 110 } : { opacity: 0 }
      const gone = motion ? { yPercent: -110 } : { opacity: 0 }
      const shown = motion ? { yPercent: 0 } : { opacity: 1 }
      if (i > 0) {
        tl.fromTo(chars, hidden, { ...shown, duration: 0.05, stagger: 0.006, ease: 'power3.out' }, ph.from)
        tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.04 }, ph.from + 0.02)
      }
      if (i < last) {
        tl.to(chars, { ...gone, duration: 0.045, stagger: 0.004, ease: 'power3.in' }, ph.to - 0.05)
        tl.to(note, { opacity: 0, duration: 0.03 }, ph.to - 0.05)
      }
    })
    if (motion) tl.fromTo('.time__media', { scale: 1.12 }, { scale: 1, duration: 1 }, 0)
    tl.fromTo('.time__shade', { opacity: 0.35 }, { opacity: 0.1, duration: 1 }, 0)
    tl.set({}, {}, 1)

    render(0)

    if (motion) {
      gsap.from('.time__head .mask__inner', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: root.current, start: 'top 60%' },
      })
    }

    return () => gsap.ticker.remove(seek)
  })

  return (
    <section className="time" id="time" ref={root} aria-label="Time — day to night">
      <div className="time__stage">
        <CityVideo ref={video} mode="scrub" poster="day" className="time__media" />
        <div className="time__shade" />
        <div className="vignette" />

        <header className="time__head">
          <p className="meta">
            <span className="mask">
              <span className="mask__inner">(04) — Time / Day to night</span>
            </span>
          </p>
          <p className="time__headline">
            <span className="mask">
              <span className="mask__inner">Light changes</span>
            </span>
            <span className="mask">
              <span className="mask__inner">
                <em className="serif">everything.</em>
              </span>
            </span>
          </p>
        </header>

        <div className="time__phases">
          {PHASES.map((ph) => (
            <div className="time__phase" key={ph.word}>
              <SplitChars text={ph.word} className="time__word" />
              <p className="time__note meta">{ph.note}</p>
            </div>
          ))}
        </div>

        <ol className="time__rail" aria-hidden="true">
          <span className="time__rail-track">
            <span ref={fill} className="time__rail-fill" />
          </span>
          {PHASES.map((ph) => (
            <li className="time__rail-item meta" key={ph.word} style={{ top: `${ph.from * 100}%` }}>
              {ph.word}
            </li>
          ))}
        </ol>

        <div className="time__readout">
          <p className="time__clock">
            <span ref={clock}>16:30</span>
          </p>
          <p className="meta dim">
            Local time / Shanghai — frame <span ref={frame}>000</span> / {FRAMES}
          </p>
        </div>

        <p className="time__hint meta">Scroll to control time</p>
      </div>
    </section>
  )
}
