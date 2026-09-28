import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COORDS, MENU_ITEMS } from '../config/content'
import { MEDIA } from '../config/media'
import { useChapter } from '../hooks/useChapter'
import { useScrollLock, useScrollTo } from '../hooks/useLenis'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useShanghaiTime } from '../hooks/useShanghaiTime'
import { gsap, ScrollTrigger } from '../utils/gsap'

const FOOTAGE_CHAPTERS = new Set(['arrival', 'time', 'outro'])

export function Navigation({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const chapter = useChapter(ready)
  const scrollTo = useScrollTo()
  const close = useCallback(() => setOpen(false), [])
  const navigate = useCallback(
    (id: string) => {
      setOpen(false)
      // Let the curtain start closing before the camera moves.
      window.setTimeout(() => scrollTo(id), 350)
    },
    [scrollTo],
  )

  // Entrance, once the preloader lifts.
  useLayoutEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      gsap.from('.nav__item', { yPercent: -120, opacity: 0, duration: 1.4, stagger: 0.08, ease: 'expo.out', delay: 0.5 })
    }, bar)
    return () => ctx.revert()
  }, [ready])

  // Whole-page progress hairline.
  useEffect(() => {
    if (!ready || !progress.current) return
    const tween = gsap.fromTo(
      progress.current,
      { scaleX: 0 },
      { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [ready])

  return (
    <>
      <header className="nav" ref={bar} data-over={FOOTAGE_CHAPTERS.has(chapter.id) ? 'footage' : 'page'}>
        <span className="nav__progress" aria-hidden="true">
          <span ref={progress} />
        </span>
        <button className="nav__item nav__brand meta" onClick={() => scrollTo(0)} aria-label="Back to top">
          Shanghai <span className="nav__slash">/</span> 001
        </button>
        <p className="nav__item nav__chapter meta" aria-live="polite">
          <span className="nav__chapter-index">{chapter.index}</span>
          <span className="nav__chapter-dash" />
          <span key={chapter.id} className="nav__chapter-label">
            {chapter.label}
          </span>
        </p>
        <button
          className="nav__item nav__toggle meta"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="menu"
        >
          <span>Menu</span>
          <span className="nav__toggle-lines" aria-hidden="true" />
        </button>
      </header>

      <Menu open={open} onClose={close} onNavigate={navigate} />
    </>
  )
}

type MenuProps = { open: boolean; onClose: () => void; onNavigate: (id: string) => void }

function Menu({ open, onClose, onNavigate }: MenuProps) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const [hovered, setHovered] = useState(0)
  const reduced = useReducedMotion()
  const time = useShanghaiTime()
  useScrollLock(open)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      tl.current = gsap
        .timeline({ paused: true })
        .set(root.current, { visibility: 'visible' })
        .fromTo(
          root.current,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: reduced ? 0.01 : 1.1, ease: 'power4.inOut' },
        )
        .from('.menu__link .mask__inner', { yPercent: 110, duration: 1.1, stagger: 0.06, ease: 'expo.out' }, reduced ? 0 : 0.45)
        .from('.menu__fade', { opacity: 0, duration: 0.8, stagger: 0.05 }, reduced ? 0 : 0.6)
        .from('.menu__preview', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'expo.out' }, reduced ? 0 : 0.55)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  useEffect(() => {
    const t = tl.current
    if (!t) return
    if (open) {
      t.timeScale(1).play()
      closeBtn.current?.focus({ preventScroll: true })
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (t.progress() > 0) {
      t.timeScale(1.6).reverse()
      document.querySelector<HTMLButtonElement>('.nav__toggle')?.focus({ preventScroll: true })
    }
  }, [open, onClose])

  // Pins measured while the menu covered the page stay valid, but a resize behind it may not.
  useEffect(() => {
    if (!open) ScrollTrigger.refresh()
  }, [open])

  return (
    <div className="menu" id="menu" ref={root} aria-hidden={!open} inert={!open} role="dialog" aria-modal="true" aria-label="Menu">
      <div className="menu__top">
        <span className="meta menu__fade">City Archive / 001 — Index</span>
        <button className="meta menu__close" ref={closeBtn} onClick={onClose}>
          Close <span aria-hidden="true" className="menu__close-x" />
        </button>
      </div>

      <nav className="menu__nav" aria-label="Chapters">
        <ol>
          {MENU_ITEMS.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`menu__link ${hovered === i ? 'is-active' : ''}`}
                data-cursor="Explore"
                onPointerEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.id)
                }}
              >
                <span className="mask">
                  <span className="mask__inner">
                    <span className="menu__num">{item.index}</span>
                    <span className="menu__dash" aria-hidden="true">—</span>
                    <span className="menu__label">{item.label}</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <figure className="menu__preview" aria-hidden="true">
        {MENU_ITEMS.map((item, i) => (
          <img key={item.id} src={MEDIA.posters[item.poster]} alt="" loading="lazy" className={hovered === i ? 'is-active' : ''} />
        ))}
        <figcaption className="meta">
          Plate {MENU_ITEMS[hovered].index} / {MENU_ITEMS[hovered].label}
        </figcaption>
      </figure>

      <div className="menu__foot">
        <span className="meta menu__fade">
          {COORDS.lat} / {COORDS.lng}
        </span>
        <span className="meta menu__fade">
          Local time {time.hh}:{time.mm}:{time.ss}
        </span>
        <span className="meta menu__fade">Footage — Dreamina AI</span>
      </div>
    </div>
  )
}
