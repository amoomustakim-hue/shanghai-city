import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { CityVideo } from './ui/CityVideo'
import { Mask } from './ui/Mask'
import { SectionHead } from './ui/SectionHead'

const DATA = [
  ['Name', 'Huangpu River'],
  ['Place', 'Shanghai, China'],
  ['Length', '113 km'],
  ['Flows', 'North → Yangtze'],
]

export function RiverSection() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ motion, desktop }) => {
    if (!motion) return

    // The plate opens from the waterline up while the image inside moves
    // slower than the page — the river surfaces rather than scrolls in.
    gsap.fromTo(
      '.river__plate',
      { clipPath: 'inset(62% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.river__plate', start: 'top 95%', end: 'top 25%', scrub: true } },
    )
    gsap.fromTo(
      '.river__media',
      { yPercent: desktop ? -10 : -3, scale: desktop ? 1.25 : 1.08 },
      { yPercent: desktop ? 10 : 3, scale: desktop ? 1.08 : 1.02, ease: 'none', scrollTrigger: { trigger: '.river__plate', start: 'top bottom', end: 'bottom top', scrub: true } },
    )
    // Subtle horizontal current.
    gsap.fromTo(
      '.river__media',
      { xPercent: desktop ? 2.5 : 0 },
      { xPercent: desktop ? -2.5 : 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
    gsap.fromTo(
      '.river__marquee-track',
      { xPercent: 0 },
      { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
    )

    gsap.from('.river__title .mask__inner', { yPercent: 108, duration: 1.6, stagger: 0.1, ease: 'power4.out', scrollTrigger: { trigger: '.river__title', start: 'top 85%' } })
    gsap.from('.river__copy .mask__inner', { yPercent: 110, duration: 1.3, stagger: 0.08, scrollTrigger: { trigger: '.river__copy', start: 'top 90%' } })
    gsap.from('.river__data > div', { opacity: 0, y: 14, duration: 1, stagger: 0.07, scrollTrigger: { trigger: '.river__data', start: 'top 92%' } })
  })

  return (
    <section className="river" id="river" ref={root}>
      <SectionHead index="02" title="The River" aside="Plate 002 — Low tide" />

      <div className="river__grid">
        <div className="river__text">
          <Mask as="h2" className="river__title" lines={['The', 'River']} />
          <Mask as="p" className="river__copy" lines={['A line dividing two', 'versions of the same city.']} />
          <dl className="river__data meta">
            {DATA.map(([k, v]) => (
              <div key={k}>
                <dt className="dim">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="river__plate" data-cursor="Water">
          <CityVideo mode="lazy" poster="golden" className="river__media" />
          <div className="vignette vignette--soft" />
          <figcaption className="meta river__caption">
            <span>Huangpu River</span>
            <span>Shanghai, China</span>
          </figcaption>
        </figure>
      </div>

      <div className="river__marquee" aria-hidden="true">
        <div className="river__marquee-track">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>
              Huangpu <span className="cjk">黄浦江</span> <em className="serif">the river</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
