import { useEffect, useState } from 'react'
import { CHAPTERS } from '../config/content'
import { ScrollTrigger } from '../utils/gsap'

/** Tracks which chapter (section with a matching id) occupies the middle of the viewport. */
export function useChapter(enabled: boolean) {
  const [active, setActive] = useState(CHAPTERS[0])

  useEffect(() => {
    if (!enabled) return
    const triggers = CHAPTERS.map((chapter) => {
      const el = document.getElementById(chapter.id)
      if (!el) return null
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        // Resolve after the pinned sections so their spacers are measured first.
        refreshPriority: -10,
        onToggle: (self) => self.isActive && setActive(chapter),
      })
    })
    return () => triggers.forEach((t) => t?.kill())
  }, [enabled])

  return active
}
