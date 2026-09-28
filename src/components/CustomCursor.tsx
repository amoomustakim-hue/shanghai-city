import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import { gsap } from '../utils/gsap'

/**
 * A small dot that follows the pointer. Over `[data-cursor="LABEL"]` it
 * opens into a disc carrying the label; over other links/buttons it becomes
 * a ring. Only mounted for fine pointers — touch keeps the system behaviour.
 */
export function CustomCursor() {
  const fine = useFinePointer()
  return fine ? <Cursor /> : null
}

function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const cursor = el.current!
    document.documentElement.classList.add('has-cursor')
    const speed = reduced ? 0.01 : 0.55
    const xTo = gsap.quickTo(cursor, 'x', { duration: speed, ease: 'power3.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: speed, ease: 'power3.out' })
    let current: Element | null = null

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      xTo(e.clientX)
      yTo(e.clientY)
      cursor.classList.add('is-visible')
    }

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element
      const labelled = target.closest('[data-cursor]')
      const interactive = labelled ?? target.closest('a, button, [role="button"]')
      if (interactive === current) return
      current = interactive
      const text = labelled?.getAttribute('data-cursor') ?? ''
      if (label.current) label.current.textContent = text
      cursor.dataset.state = labelled ? 'label' : interactive ? 'link' : ''
    }

    const onLeave = () => cursor.classList.remove('is-visible')
    const onDown = () => cursor.classList.add('is-down')
    const onUp = () => cursor.classList.remove('is-down')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [reduced])

  return (
    <div className="cursor" ref={el} aria-hidden="true">
      <span className="cursor__disc" />
      <span className="cursor__label" ref={label} />
    </div>
  )
}
