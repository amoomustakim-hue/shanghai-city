import { useRef } from 'react'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { Mask } from './ui/Mask'
import { SectionHead } from './ui/SectionHead'

const FORCES = ['Water', 'Architecture', 'Commerce', 'People', 'Light', 'Time']

export function IntroSection() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ motion, desktop }) => {
    if (!motion) return

    gsap.from('.section-head__rule', { scaleX: 0, duration: 1.8, ease: 'power3.inOut', scrollTrigger: { trigger: '.section-head', start: 'top 85%' } })
    gsap.from('.section-head .meta', { opacity: 0, y: 12, duration: 1, stagger: 0.08, scrollTrigger: { trigger: '.section-head', start: 'top 85%' } })

    // Headline: each line rises out of its mask as it enters.
    gsap.utils.toArray<HTMLElement>('.intro__line').forEach((line) => {
      gsap.from(line.querySelector('.mask__inner'), {
        yPercent: 108,
        duration: 1.6,
        ease: 'power4.out',
        scrollTrigger: { trigger: line, start: 'top 88%' },
      })
    })

    // Lines drift at their own rates — a staircase that slowly shears.
    if (desktop) {
      gsap.utils.toArray<HTMLElement>('.intro__line').forEach((line, i) => {
        gsap.to(line, {
          xPercent: [-3, 4, -2, 5][i] ?? 0,
          ease: 'none',
          scrollTrigger: { trigger: '.intro__title', start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }

    gsap.from('.intro__body .mask__inner', {
      yPercent: 110,
      duration: 1.3,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.intro__body', start: 'top 85%' },
    })
    gsap.from('.intro__forces li', {
      opacity: 0,
      x: -12,
      duration: 1,
      stagger: 0.06,
      scrollTrigger: { trigger: '.intro__forces', start: 'top 90%' },
    })
  })

  return (
    <section className="intro" id="intro" ref={root}>
      <SectionHead index="01" title="Introduction" aside="N 31.2304° / E 121.4737°" />

      <h2 className="intro__title" aria-label="Shanghai never stands still.">
        {['Shanghai', <em className="serif">never</em>, 'stands', 'still.'].map((word, i) => (
          <span className={`intro__line intro__line--${i + 1} mask`} key={i} aria-hidden="true">
            <span className="mask__inner">{word}</span>
          </span>
        ))}
      </h2>

      <div className="intro__body">
        <ol className="intro__forces meta" aria-label="Forces">
          {FORCES.map((f, i) => (
            <li key={f}>
              <span className="dim">{String(i + 1).padStart(2, '0')}</span> {f}
            </li>
          ))}
        </ol>
        <Mask
          as="p"
          className="intro__copy"
          lines={['A city shaped by movement —', 'water, architecture, commerce,', 'people, light and time.']}
        />
      </div>
    </section>
  )
}
