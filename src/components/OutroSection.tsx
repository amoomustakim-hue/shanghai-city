import { useRef } from 'react'
import { COORDS } from '../config/content'
import { useScrollTo } from '../hooks/useLenis'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { CityVideo } from './ui/CityVideo'
import { Mask, SplitChars } from './ui/Mask'

/** Back to the full frame: a slow pull-back, then the whole experience fades to black. */
export function OutroSection() {
  const root = useRef<HTMLElement>(null)
  const scrollTo = useScrollTo()

  useScrollScene(root, ({ motion, desktop }) => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top top', end: '+=180%', pin: true, scrub: true, anticipatePin: 1 },
    })

    if (motion) {
      // Entering: the frame widens out of a band, echoing the hero's crop.
      gsap.fromTo(
        '.outro__frame',
        { clipPath: 'inset(22% 8% 22% 8%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power1.inOut', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top top', scrub: true } },
      )
      tl.fromTo('.outro__media', { scale: desktop ? 1.35 : 1.1 }, { scale: 1, duration: 1 }, 0)
        .from('.outro__title .char', { yPercent: 105, duration: 0.25, stagger: 0.02, ease: 'power3.out' }, 0.05)
        .from('.outro__small .mask__inner', { yPercent: 110, duration: 0.15, stagger: 0.03, ease: 'power3.out' }, 0.2)
        .from('.outro__coords', { opacity: 0, duration: 0.15 }, 0.3)
    }

    tl.to('.outro__center, .outro__coords', { opacity: 0, duration: 0.15 }, 0.68)
      .to('.outro__black', { opacity: 1, duration: 0.25 }, 0.62)
      .from('.outro__end > *', { autoAlpha: 0, y: motion ? 16 : 0, duration: 0.12, stagger: 0.03 }, 0.86)
      .set({}, {}, 1)
  })

  return (
    <section className="outro" id="outro" ref={root}>
      <div className="outro__frame">
        <CityVideo mode="lazy" poster="night" className="outro__media" />
        <div className="vignette" />
        <div className="outro__shade" />
      </div>

      <div className="outro__center">
        <Mask className="meta outro__small" lines={['City Archive / 001']} />
        <h2 className="outro__title">
          <SplitChars text="SHANGHAI" />
        </h2>
        <Mask as="p" className="outro__small outro__tagline" lines={['The city is always moving.']} />
      </div>

      <p className="outro__coords meta">
        {COORDS.lat} / {COORDS.lng}
      </p>

      <div className="outro__black" />

      <div className="outro__end">
        <p className="meta dim">End of file — 001</p>
        <p className="outro__end-line">
          The city is <em className="serif">still</em> moving.
        </p>
        <button className="meta outro__replay" data-cursor="Replay" onClick={() => scrollTo(0)}>
          Return to arrival ↑
        </button>
        <p className="meta dim outro__credit">Footage — Dreamina AI · Shanghai, {new Date().getFullYear()}</p>
      </div>
    </section>
  )
}
