import { useRef, useState } from 'react'
import { PLATE_LABELS } from '../config/content'
import { MEDIA } from '../config/media'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { CityVideo } from './ui/CityVideo'
import { SectionHead } from './ui/SectionHead'

export function ArchitectureSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)

  useScrollScene(root, ({ motion, desktop }) => {
    if (!motion) return

    // OLD CITY. / NEW CITY. meet from opposite banks.
    const titleST = { trigger: '.arch__title', start: 'top bottom', end: 'bottom 35%', scrub: true }
    gsap.fromTo('.arch__old', { xPercent: desktop ? -18 : -8 }, { xPercent: 0, ease: 'none', scrollTrigger: titleST })
    gsap.fromTo('.arch__new', { xPercent: desktop ? 18 : 8 }, { xPercent: 0, ease: 'none', scrollTrigger: titleST })
    gsap.from('.arch__title .mask__inner', { yPercent: 108, duration: 1.6, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: '.arch__title', start: 'top 80%' } })

    // The plate opens from the river — the seam between the two cities.
    gsap.fromTo(
      '.arch__plate',
      { clipPath: 'inset(0% 50% 0% 50%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power1.inOut', scrollTrigger: { trigger: '.arch__plate', start: 'top 90%', end: 'center 55%', scrub: true } },
    )
    // Footage and survey marks zoom together so every dot stays on its landmark.
    gsap.fromTo(
      '.arch__zoom',
      { scale: 1.18 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: '.arch__plate', start: 'top bottom', end: 'bottom top', scrub: true } },
    )

    // Survey marks: dots land, leader lines draw, labels settle.
    const survey = gsap.timeline({ scrollTrigger: { trigger: '.arch__plate', start: 'center 70%' } })
    survey
      .from('.arch__dot', { scale: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out' })
      .from('.arch__leader', { scaleY: 0, duration: 1.2, stagger: 0.08, ease: 'power3.inOut' }, 0.2)
      .from('.arch__label', { opacity: 0, y: (_i: number, el: HTMLElement) => (el.dataset.dir === 'down' ? -10 : 10), duration: 1, stagger: 0.08 }, 0.8)
      .from('.arch__legend li', { opacity: 0, y: 10, duration: 0.9, stagger: 0.06 }, 0.6)
  })

  return (
    <section className="arch" id="city" ref={root}>
      <SectionHead index="03" title="Architecture / City" aside="Survey — East bank" />

      <h2 className="arch__title">
        <span className="arch__old mask">
          <span className="mask__inner">Old city.</span>
        </span>
        <span className="arch__new mask">
          <span className="mask__inner">
            <em className="serif">New</em> city.
          </span>
        </span>
      </h2>

      <div className="arch__plate-wrap">
        <figure
          className={`arch__plate ${active !== null ? 'has-active' : ''}`}
          style={{ aspectRatio: MEDIA.aspect }}
          data-cursor="Explore"
        >
          <div className="arch__zoom">
            <CityVideo mode="lazy" poster="dusk" framing="wide" className="arch__media" />
            <div className="vignette vignette--soft" />

            <div className="arch__marks" aria-hidden="true">
            {PLATE_LABELS.map((l, i) => {
              const down = l.to > l.y
              return (
                <div
                  key={l.code}
                  className={`arch__mark ${active === i ? 'is-active' : ''}`}
                  data-side={l.x > 78 ? 'left' : 'right'}
                  style={{ left: `${l.x}%`, top: `${l.y}%` }}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                >
                  <span className="arch__dot" />
                  <span
                    className="arch__leader"
                    data-dir={down ? 'down' : 'up'}
                    style={{ height: `calc(${Math.abs(l.to - l.y)} / 100 * var(--plate-h))` }}
                  />
                  <span
                    className="arch__label"
                    data-dir={down ? 'down' : 'up'}
                    style={{ ['--offset' as string]: `calc(${Math.abs(l.to - l.y)} / 100 * var(--plate-h))` }}
                  >
                    <span className="meta dim">{l.code}</span>
                    <span className="arch__label-name">{l.name}</span>
                    <span className="meta dim arch__label-note">{l.note}</span>
                  </span>
                  <span className="arch__num meta">{i + 1}</span>
                </div>
              )
            })}
            </div>
          </div>
        </figure>

        <div className="arch__plate-foot meta">
          <span>Plate 003 — The Bund ↔ Pudong</span>
          <span className="dim">Looking east / 1504 × 640</span>
        </div>
      </div>

      <ol className="arch__legend">
        {PLATE_LABELS.map((l, i) => (
          <li
            key={l.code}
            className={active === i ? 'is-active' : ''}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="meta dim">{String(i + 1).padStart(2, '0')}</span>
            <span className="arch__legend-name">{l.name}</span>
            <span className="meta dim">{l.code}</span>
            <span className="meta dim arch__legend-note">{l.note}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
