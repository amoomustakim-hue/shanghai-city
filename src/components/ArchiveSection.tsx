import { useRef, useState } from 'react'
import { ARCHIVE_ITEMS } from '../config/content'
import { MEDIA } from '../config/media'
import { useScrollTo } from '../hooks/useLenis'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { SectionHead } from './ui/SectionHead'

/**
 * Editorial index. Rows roll their title into an italic serif on hover
 * (pure CSS); a preview plate trails the cursor (desktop only).
 */
export function ArchiveSection() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const scrollTo = useScrollTo()

  useScrollScene(root, ({ motion, finePointer }) => {
    if (motion) {
      gsap.from('.archive__row-rule', {
        scaleX: 0,
        duration: 1.6,
        stagger: 0.1,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.archive__list', start: 'top 85%' },
      })
      // Transform only: the row's opacity belongs to the CSS hover dimming.
      gsap.from('.archive__row-inner', {
        yPercent: 100,
        duration: 1.4,
        stagger: 0.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.archive__list', start: 'top 80%' },
      })
      gsap.from('.archive__intro .mask__inner', {
        yPercent: 110,
        duration: 1.4,
        stagger: 0.08,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.archive__intro', start: 'top 85%' },
      })
    }

    if (!finePointer) return
    const preview = root.current!.querySelector<HTMLElement>('.archive__preview')!
    const xTo = gsap.quickTo(preview, 'x', { duration: motion ? 0.9 : 0.01, ease: 'power3.out' })
    const yTo = gsap.quickTo(preview, 'y', { duration: motion ? 0.9 : 0.01, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  })

  const current = active === null ? null : ARCHIVE_ITEMS[active]

  return (
    <section
      className={`archive ${current ? 'is-hovering' : ''}`}
      id="archive"
      ref={root}
      style={{ ['--tint' as string]: current?.tint ?? 'var(--c-ink)' }}
    >
      <SectionHead index="05" title="City Archive" aside={`${ARCHIVE_ITEMS.length} files / 001`} />

      <div className="archive__intro">
        <h2 className="archive__heading">
          <span className="mask">
            <span className="mask__inner">Index of</span>
          </span>
          <span className="mask">
            <span className="mask__inner">
              <em className="serif">a moving</em> city.
            </span>
          </span>
        </h2>
      </div>

      <ol className="archive__list" onPointerLeave={() => setActive(null)}>
        {ARCHIVE_ITEMS.map((item, i) => (
          <li key={item.index} className={`archive__row ${active === i ? 'is-active' : ''}`}>
            <span className="archive__row-rule" aria-hidden="true" />
            <a
              href={`#${item.target}`}
              className="archive__link"
              data-cursor="View"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={(e) => {
                e.preventDefault()
                scrollTo(item.target)
              }}
            >
              <span className="archive__row-inner">
                <span className="archive__index meta">{item.index}</span>
                <span className="archive__title">
                  <span className="archive__title-roll">
                    <span>{item.title}</span>
                    <span className="serif" aria-hidden="true">
                      {item.alt}
                    </span>
                  </span>
                </span>
                <span className="archive__meta meta dim">{item.meta}</span>
                <span className="archive__file meta dim">File {item.file}</span>
                <img className="archive__thumb" src={MEDIA.posters[item.poster]} alt="" loading="lazy" />
              </span>
            </a>
          </li>
        ))}
        <li className="archive__row archive__row--end" aria-hidden="true">
          <span className="archive__row-rule" />
        </li>
      </ol>

      <div className={`archive__preview ${current ? 'is-visible' : ''}`} aria-hidden="true">
        <div className="archive__preview-frame">
          {ARCHIVE_ITEMS.map((item, i) => (
            <img key={item.index} src={MEDIA.posters[item.poster]} alt="" loading="lazy" className={active === i ? 'is-active' : ''} />
          ))}
        </div>
        <span className="meta archive__preview-label">{current ? `File ${current.file}` : ''}</span>
      </div>
    </section>
  )
}
